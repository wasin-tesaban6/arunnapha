import { getSession } from '@/lib/auth';
import { getSettings } from '@/lib/data';
import AdminApp from '@/components/admin/AdminApp';
import { LoginForm } from '@/components/portal/ui';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'ผู้ดูแลระบบ', robots: { index: false, follow: false } };

export default async function AdminPage() {
  const [s, settings] = await Promise.all([getSession(), getSettings()]);
  const logo = settings.logoUrl || '/logo.svg';
  if (s?.role !== 'admin') return <LoginForm role="admin" title="ผู้ดูแลระบบ" sub="CRMS6 | อรุณนภา — จัดการเว็บไซต์ทั้งหมด" logo={logo} />;
  return <AdminApp logo={logo} name={s.name} />;
}
