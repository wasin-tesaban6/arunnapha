import Link from 'next/link';
import { notFound } from 'next/navigation';
import AskForm from '@/components/AskForm';
import QAList from '@/components/QAList';
import { getEvent, getQuestions } from '@/lib/data';
import { thDate, eventColor } from '@/lib/constants';

export const revalidate = 60;
export function generateStaticParams() { return []; }
export async function generateMetadata({ params }) {
  const { id } = await params;
  const e = await getEvent(id);
  return { title: e?.title || 'ไม่พบกิจกรรม' };
}

export default async function EventPage({ params }) {
  const { id } = await params;
  const e = await getEvent(id);
  if (!e) notFound();
  const qs = await getQuestions(e.id);
  const when = e.endDate && e.endDate !== e.date ? `${thDate(e.date, true)} – ${thDate(e.endDate, true)}` : thDate(e.date, true);
  return (
    <>
      <section className="page-hero">
        <div className="container">
          <div className="crumb"><Link href="/calendar">ปฏิทินวิชาการ</Link> / {e.category}</div>
          <h1>{e.title}</h1>
          <p>📅 {when}{e.time ? ` · 🕘 ${e.time}` : ''}{e.location ? ` · 📍 ${e.location}` : ''}</p>
        </div>
      </section>
      <section className="section">
        <div className="container" style={{ maxWidth: 980 }}>
          <div className="row" style={{ marginBottom: 16 }}>
            <span className="badge" style={{ background: eventColor(e.category), color: '#fff' }}>{e.category}</span>
          </div>
          {e.image ? <img src={e.image} alt={e.title} style={{ borderRadius: 18, marginBottom: 22, width: '100%', maxHeight: 520, objectFit: 'cover' }} /> : null}
          <div className="pre" style={{ fontSize: 22 }}>{e.description || '–'}</div>
          {e.link ? <p style={{ marginTop: 16 }}><a className="btn ghost" href={e.link} target="_blank" rel="noopener">ลิงก์ที่เกี่ยวข้อง ↗</a></p> : null}

          <h2 style={{ marginTop: 46, fontSize: 36 }}>ถาม-ตอบเกี่ยวกับกิจกรรมนี้ ({qs.length})</h2>
          <div className="stack">
            <QAList questions={qs} />
            <AskForm eventId={e.id} />
          </div>
        </div>
      </section>
    </>
  );
}
