import { MemberCard, PageHero, Empty } from '@/components/Cards';
import { getMembers, getSettings } from '@/lib/data';

export const revalidate = 60;
export const metadata = { title: 'สมาชิกพรรค' };

export default async function MembersPage() {
  const [members, s] = await Promise.all([getMembers(), getSettings()]);
  const isLead = (m) => /^ประธาน/.test(m.position || '');
  const leads = members.filter(isLead);
  const rest = members.filter((m) => !isLead(m));
  return (
    <>
      <PageHero title={`สมาชิกพรรค${s.partyName}`} sub={`${s.councilName} ${s.schoolName} · ทั้งหมด ${members.length} คน`} />
      <section className="section">
        <div className="container">
          {members.length ? (
            <div className="grid members-grid">
              {leads.map((m) => <MemberCard key={m.id} m={m} lead />)}
              {rest.map((m) => <MemberCard key={m.id} m={m} />)}
            </div>
          ) : <Empty icon="users" title="ยังไม่มีข้อมูลสมาชิก" />}
        </div>
      </section>
    </>
  );
}
