import { PageHero } from '@/components/Cards';
import WorksHub from '@/components/WorksHub';
import { getSettings, getVolunteer, getOpportunities } from '@/lib/data';

export const revalidate = 60;
export const metadata = { title: 'จิตอาสาวิชาการ & ศูนย์รวมผลงาน' };

export default async function WorksPage() {
  const [s, volunteer, opportunities] = await Promise.all([getSettings(), getVolunteer(), getOpportunities()]);
  return (
    <>
      <PageHero title={s.texts.worksTitlePage} sub={s.texts.worksSub} />
      <section className="section">
        <div className="container"><WorksHub volunteer={volunteer} opportunities={opportunities} t={s.texts} /></div>
      </section>
    </>
  );
}
