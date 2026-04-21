import { AdminShell } from '@/components/admin/admin-shell';
import { getAdminOverview } from '@/lib/admin-api';

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const overview = await getAdminOverview();

  return <AdminShell user={overview.user}>{children}</AdminShell>;
}
