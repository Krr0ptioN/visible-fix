import { readFileSync } from 'node:fs';
import { join } from 'node:path';

describe('issues page auth shell contract', () => {
  it('loads the server session and passes it to SiteShell', () => {
    const source = readFileSync(join(__dirname, 'page.tsx'), 'utf8');

    expect(source).toContain("import { getCurrentSession } from '@/lib/auth-api';");
    expect(source).toContain('await getCurrentSession()');
    expect(source).toContain('currentUser={currentUser}');
  });
});
