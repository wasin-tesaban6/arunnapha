import Link from 'next/link';
import { notFound } from 'next/navigation';
import Icon from '@/components/Icon';
import { getMember } from '@/lib/data';

export const revalidate = 60;
export function generateStaticParams() { return []; }

export async function generateMetadata({ params }) {
  const { id } = await params;
  const m = await getMember(id);
  return { title: m ? `${m.name} — ${m.position}` : 'ไม่พบสมาชิก' };
}

export default async function MemberPage({ params }) {
  const { id } = await params;
  const m = await getMember(id);
  if (!m) notFound();
  const contactLines = (m.contact || '').split('\n').filter(Boolean);
  return (
    <>
      <section className="page-hero">
        <div className="container">
          <div className="crumb"><Link href="/members">สมาชิกพรรค</Link> / {m.name}</div>
          <h1>{m.name}</h1>
          <p>{m.position}{m.classroom ? ` · ชั้น ${m.classroom}` : ''}</p>
        </div>
      </section>
      <section className="section">
        <div className="container">
          <div className="profile">
            <div>
              <div className="avatar">
                {m.photo ? <img src={m.photo} alt={m.name} /> : <div style={{ height: '100%', display: 'grid', placeItems: 'center', color: 'var(--sky-300)' }}><Icon name="user" size={120} stroke={1} /></div>}
              </div>
            </div>
            <div className="stack">
              <div className="row"><span className="badge solid">{m.position || 'สมาชิกพรรค'}</span>{m.nickname ? <span className="badge">ชื่อเล่น: {m.nickname}</span> : null}</div>
              <blockquote style={{ margin: 0, fontSize: 30, color: 'var(--navy-800)', fontWeight: 700, lineHeight: 1.25 }}>“{m.quote || '–'}”</blockquote>
              <div className="card pad">
                <h3 style={{ fontSize: 26 }}>ประวัติส่วนตัว</h3>
                <p className="pre" style={{ margin: 0 }}>{m.bio || '–'}</p>
              </div>
              <div className="card pad">
                <h3 style={{ fontSize: 26 }}>🏅 ผลงาน</h3>
                <p className="pre" style={{ margin: 0 }}>{m.achievements || '–'}</p>
              </div>
              <div className="card pad">
                <h3 style={{ fontSize: 26 }}>💼 ประสบการณ์ทำงาน</h3>
                <p className="pre" style={{ margin: 0 }}>{m.experience || '–'}</p>
              </div>
              {contactLines.length ? (
                <div className="card pad">
                  <h3 style={{ fontSize: 26 }}>ช่องทางติดต่อ</h3>
                  {contactLines.map((c, i) => <div key={i}>{/^https?:\/\//.test(c) ? <a href={c} target="_blank" rel="noopener">{c}</a> : c}</div>)}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
