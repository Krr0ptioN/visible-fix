import type postgres from 'postgres';

const CLOUD_SQL_HOST_QUERY = '?host=/cloudsql/';

export type PostgresClientOptions = postgres.Options<Record<string, postgres.PostgresType>> & {
  max: number;
};

export function createPostgresClientOptions(connectionString: string): string | PostgresClientOptions {
  if (!connectionString.includes(CLOUD_SQL_HOST_QUERY)) {
    return connectionString;
  }

  const [connectionPart, queryPart = ''] = connectionString.split('?');
  const match = connectionPart.match(/^postgres:\/\/([^:]+):([^@]+)@\/([^?]+)$/);
  const params = new URLSearchParams(queryPart);
  const host = params.get('host');

  if (!match || !host) {
    return connectionString;
  }

  const [, user, password, database] = match;

  return {
    host,
    database: decodeURIComponent(database),
    user: decodeURIComponent(user),
    password: decodeURIComponent(password),
    max: 10,
  };
}
