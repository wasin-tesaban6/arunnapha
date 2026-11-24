import { PageHero } from '@/components/Cards';
import Calendar from '@/components/Calendar';
import AskForm from '@/components/AskForm';
import QAList from '@/components/QAList';
import { getEvents, getQuestions, getSettings } from '@/lib/data';
import { todayISO } from '@/lib/constants';

export const revalidate = 60;
export const metadata = { title: 'ปฏิทินวิชาการ' };

export default async function CalendarPage() {
  const [events, qs, s] = await Promise.all([getEvents(), getQuestions(), getSettings()]);
  const slim = events.map(({ id, title, date, endDate, time, location, category }) => ({ id, title, date, endDate, time, location, category }));
  const general = qs.filter((q) => !q.eventId).slice(0, 20);
  return (
    <>
      <PageHero title={s.texts.calendarTitle} sub={s.texts.calendarSub} />
      <section className="section">
        <div className="container">
          <Calendar events={slim} today={todayISO()} />
          <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 26, marginTop: 50 }}>
            <AskForm />
            <div>
              <h3>คำถามทั่วไปล่าสุด</h3>
              <QAList questions={general} />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
