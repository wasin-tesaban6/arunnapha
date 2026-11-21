import { getSession } from '@/lib/auth';
import { getSettings } from '@/lib/data';
import MemberApp from '@/components/member/MemberApp';
import { LoginForm } from '@/components/portal/ui';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'สำหรับสมาชิกสภา', robots: { index: false, follow: false } };

export default async function MemberPortal() {
  const [s, settings] = await Promise.all([getSession(), getSettings()]);
  const logo = settings.logoUrl || '/logo.svg';
  if (s?.role !== 'member') return <LoginForm role="member" title="สมาชิกสภานักเรียน" sub="เข้าสู่ระบบเพื่ออัปโหลดผลงานและแก้ไขข้อมูลของคุณ" logo={logo} />;
  return <MemberApp logo={logo} name={s.member.name} position={s.member.position} />;
}
