import { createPostgresClientOptions } from '../../../libs/database/src/connection-options';

describe('createPostgresClientOptions', () => {
  it('converts Cloud SQL unix socket URLs into postgres-js options', () => {
    const options = createPostgresClientOptions(
      'postgres://visiblefix_user:secret@/visiblefix?host=/cloudsql/visiblefix:us-central1:visiblefix-db'
    );

    expect(options).toEqual({
      host: '/cloudsql/visiblefix:us-central1:visiblefix-db',
      database: 'visiblefix',
      user: 'visiblefix_user',
      password: 'secret',
      max: 10,
    });
  });
});
