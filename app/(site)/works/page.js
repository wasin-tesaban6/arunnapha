import { PageHero } from '@/components/Cards';
import WorksBrowser from '@/components/WorksBrowser';
import { getMembers, getWorks } from '@/lib/data';

export const revalidate = 60;
export const metadata = { title: 'ศูนย์รวมผลงาน จิตอาสาวิชาการ' };

export default async function WorksPage() {
  const [works, members] = await Promise.all([getWorks(), getMembers()]);
  const slim = members.map(({ id, name, position, photo, nickname }) => ({ id, name, position, photo, nickname }));
  const list = works.map(({ description, ...w }) => ({ ...w, images: w.images?.slice(0, 1) || [] }));
  return (
    <>
      <PageHero title="จิตอาสาวิชาการ & ศูนย์รวมผลงาน" sub="แหล่งเก็บผลงาน กิจกรรม และโครงการของสมาชิกสภาแต่ละคน" />
      <section className="section">
        <div className="container"><WorksBrowser works={list} members={slim} /></div>
      </section>
    </>
  );
}
