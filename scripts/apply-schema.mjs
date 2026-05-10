import { readFile } from 'node:fs/promises';
import postgres from 'postgres';

const databaseUrl = process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/visiblefix';
const migrationPath = new URL('../drizzle/0000_cynical_sir_ram.sql', import.meta.url);

const sql = postgres(databaseUrl, {
  max: 1,
  connect_timeout: 10,
  idle_timeout: 2,
});

try {
  const existingTables = await sql`
    select table_name
    from information_schema.tables
    where table_schema = 'public'
      and table_name in ('auth_sessions', 'issues', 'municipalities', 'upvotes', 'users')
  `;

  if (existingTables.length === 5) {
    console.log('[db:apply-schema] schema already present');
    process.exit(0);
  }

  const migration = await readFile(migrationPath, 'utf8');
  const statements = migration
    .split('--> statement-breakpoint')
    .map((statement) => statement.trim())
    .filter(Boolean);

  for (const statement of statements) {
    await sql.unsafe(statement);
  }

  console.log(`[db:apply-schema] applied ${statements.length} statements`);
} finally {
  await sql.end({ timeout: 2 });
}
