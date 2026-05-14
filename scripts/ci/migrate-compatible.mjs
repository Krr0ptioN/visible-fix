import { readFile, readdir } from 'node:fs/promises';
import { basename, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import postgres from 'postgres';

const DEFAULT_DATABASE_URL = 'postgres://postgres:postgres@localhost:5432/visiblefix';
const STATEMENT_BREAKPOINT = '--> statement-breakpoint';
const MIGRATION_TABLE = 'visiblefix_schema_migrations';
const INITIAL_MIGRATION_TABLES = ['auth_sessions', 'issues', 'municipalities', 'upvotes', 'users'];

function normalizeStatement(statement) {
  return statement
    .replace(/\/\*[\s\S]*?\*\//g, ' ')
    .split('\n')
    .filter((line) => !line.trim().startsWith('--'))
    .join('\n')
    .trim()
    .replace(/;$/, '')
    .replace(/\s+/g, ' ')
    .toUpperCase();
}

function compatibilityOverride(statement) {
  const match = statement.match(/visiblefix:migration-compatible\s+(expand|contract|manual)/i);
  return match?.[1]?.toLowerCase();
}

export function classifyStatement(statement) {
  const override = compatibilityOverride(statement);
  const normalized = normalizeStatement(statement);

  if (!normalized) {
    return { compatibility: 'expand', reason: 'empty statement' };
  }

  if (
    /^DROP\s+/.test(normalized) ||
    /^ALTER\s+TABLE\s+.+\s+DROP\s+/.test(normalized) ||
    /^ALTER\s+TABLE\s+.+\s+RENAME\s+/.test(normalized) ||
    /^ALTER\s+TABLE\s+.+\s+ALTER\s+COLUMN\s+.+\s+(SET\s+NOT\s+NULL|TYPE\s+)/.test(normalized) ||
    /^ALTER\s+TYPE\s+.+\s+RENAME\s+/.test(normalized)
  ) {
    return { compatibility: 'contract', reason: 'destructive or shape-changing DDL' };
  }

  if (override) {
    return {
      compatibility: override,
      reason: `annotated as ${override}`,
    };
  }

  if (/^ALTER\s+TABLE\s+.+\s+ADD\s+COLUMN\s+/.test(normalized)) {
    if (/\s+NOT\s+NULL\b/.test(normalized) && !/\s+DEFAULT\s+/.test(normalized)) {
      return { compatibility: 'manual', reason: 'non-null column without default can fail on existing rows' };
    }

    return { compatibility: 'expand', reason: 'additive column change' };
  }

  if (
    /^CREATE\s+/.test(normalized) ||
    /^ALTER\s+TYPE\s+.+\s+ADD\s+VALUE\s+/.test(normalized) ||
    /^ALTER\s+TABLE\s+.+\s+ADD\s+CONSTRAINT\s+/.test(normalized)
  ) {
    return { compatibility: 'expand', reason: 'additive DDL' };
  }

  return { compatibility: 'manual', reason: 'statement requires explicit compatibility annotation' };
}

export function isStatementAllowedForMode(classification, mode) {
  if (mode === 'expand') return classification.compatibility === 'expand';
  if (mode === 'contract') return classification.compatibility === 'contract';
  return false;
}

async function listMigrations(migrationsDir) {
  const files = await readdir(migrationsDir);
  return files
    .filter((file) => /^\d+_.+\.sql$/.test(file))
    .sort()
    .map((file) => ({
      tag: basename(file, '.sql'),
      path: join(migrationsDir, file),
    }));
}

function splitStatements(migration) {
  return migration
    .split(STATEMENT_BREAKPOINT)
    .map((statement) => statement.trim())
    .filter(Boolean);
}

async function ensureMigrationTable(sql) {
  await sql.unsafe(`
    CREATE TABLE IF NOT EXISTS ${MIGRATION_TABLE} (
      tag text PRIMARY KEY,
      mode text NOT NULL,
      applied_at timestamp DEFAULT now() NOT NULL
    )
  `);
}

async function appliedMigrationTags(sql) {
  const rows = await sql.unsafe(`SELECT tag FROM ${MIGRATION_TABLE}`);
  return new Set(rows.map((row) => row.tag));
}

async function markMigrationApplied(sql, tag, mode) {
  await sql.unsafe(
    `INSERT INTO ${MIGRATION_TABLE} (tag, mode)
     VALUES ($1, $2)
     ON CONFLICT (tag) DO NOTHING`,
    [tag, mode]
  );
}

async function initialSchemaAlreadyApplied(sql, tag) {
  if (!tag.startsWith('0000_')) return false;

  const rows = await sql`
    select table_name
    from information_schema.tables
    where table_schema = 'public'
      and table_name in ${sql(INITIAL_MIGRATION_TABLES)}
  `;

  return rows.length === INITIAL_MIGRATION_TABLES.length;
}

export async function runCompatibleMigrations(options = {}) {
  const mode = options.mode ?? process.env.MIGRATION_MODE ?? 'expand';
  const dryRun = options.dryRun ?? process.env.DRY_RUN === 'true';
  const databaseUrl = options.databaseUrl ?? process.env.DATABASE_URL ?? DEFAULT_DATABASE_URL;
  const migrationsDir =
    options.migrationsDir ?? fileURLToPath(new URL('../../drizzle', import.meta.url));

  if (!['expand', 'contract'].includes(mode)) {
    throw new Error(`Unsupported MIGRATION_MODE '${mode}'. Expected 'expand' or 'contract'.`);
  }

  if (mode === 'contract' && process.env.ALLOW_CONTRACT_MIGRATIONS !== 'true') {
    throw new Error('Contract migrations require ALLOW_CONTRACT_MIGRATIONS=true.');
  }

  const migrations = await listMigrations(migrationsDir);
  const migrationPlans = [];

  for (const migration of migrations) {
    const content = await readFile(migration.path, 'utf8');
    const statements = splitStatements(content).map((statement) => ({
      statement,
      classification: classifyStatement(statement),
    }));
    const blocked = statements.filter(({ classification }) => !isStatementAllowedForMode(classification, mode));

    migrationPlans.push({ ...migration, statements, blocked });
  }

  const blockedPlans = migrationPlans.filter((migration) => migration.blocked.length > 0);
  if (blockedPlans.length > 0) {
    const details = blockedPlans
      .flatMap((migration) =>
        migration.blocked.map(
          ({ classification, statement }) =>
            `${migration.tag}: ${classification.compatibility} (${classification.reason}) ${statement.split('\n')[0]}`
        )
      )
      .join('\n');
    throw new Error(`Migration compatibility check failed for mode '${mode}':\n${details}`);
  }

  if (dryRun) {
    for (const migration of migrationPlans) {
      console.log(`[db:migrate:${mode}] ${migration.tag}: ${migration.statements.length} compatible statements`);
    }
    return;
  }

  const sql = postgres(databaseUrl, {
    max: 1,
    connect_timeout: 10,
    idle_timeout: 2,
  });

  try {
    await ensureMigrationTable(sql);
    const applied = await appliedMigrationTags(sql);

    for (const migration of migrationPlans) {
      if (applied.has(migration.tag)) {
        console.log(`[db:migrate:${mode}] ${migration.tag}: already applied`);
        continue;
      }

      if (await initialSchemaAlreadyApplied(sql, migration.tag)) {
        await markMigrationApplied(sql, migration.tag, mode);
        console.log(`[db:migrate:${mode}] ${migration.tag}: baseline schema already present, marked applied`);
        continue;
      }

      await sql.begin(async (tx) => {
        for (const { statement } of migration.statements) {
          await tx.unsafe(statement);
        }
        await markMigrationApplied(tx, migration.tag, mode);
      });

      console.log(`[db:migrate:${mode}] ${migration.tag}: applied ${migration.statements.length} statements`);
    }
  } finally {
    await sql.end({ timeout: 2 });
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  runCompatibleMigrations().catch((error) => {
    console.error(error.message);
    process.exit(1);
  });
}
