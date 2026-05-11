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
  const connectionInfo = await sql`
    select current_database() as database, current_user as "user"
  `;
  console.log(
    `[db:apply-schema] connected to ${connectionInfo[0].database} as ${connectionInfo[0].user}`
  );

  const existingTables = await sql`
    select table_name
    from information_schema.tables
    where table_schema = 'public'
      and table_name in ('auth_sessions', 'issues', 'municipalities', 'upvotes', 'users')
  `;

  console.log(`[db:apply-schema] found ${existingTables.length}/5 expected tables`);

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
