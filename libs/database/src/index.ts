import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';
import { createPostgresClientOptions } from './connection-options';

const connectionString = process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/visiblefix';

const clientOptions = createPostgresClientOptions(connectionString);
const client = typeof clientOptions === 'string' ? postgres(clientOptions, { max: 10 }) : postgres(clientOptions);

export const db = drizzle(client, { schema });

export type Database = typeof db;
