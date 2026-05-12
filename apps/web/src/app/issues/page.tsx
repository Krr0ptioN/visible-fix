import { SiteShell } from '@/components/site-shell';
import { getCurrentSession } from '@/lib/auth-api';
import { IssuesDiscoveryContent } from './issues-discovery-content';

export default async function IssuesPage() {
  const currentUser = await getCurrentSession();

  return (
    <SiteShell activePage="issues" currentUser={currentUser} mainClassName="max-w-none overflow-hidden px-0 py-0" footerClassName="hidden xl:block">
      <IssuesDiscoveryContent />
    </SiteShell>
  );
}
