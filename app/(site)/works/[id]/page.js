import Link from 'next/link';
import { notFound } from 'next/navigation';
import Gallery from '@/components/Gallery';
import { getWork, getMember } from '@/lib/data';
import { thDate } from '@/lib/constants';

export const revalidate = 60;
export function generateStaticParams() { return []; }
export async function generateMetadata({ params }) {
  const { id } = await params;
  const w = await getWork(id);
  return { title: w?.title || 'ไม่พบผลงาน' };
}

export default async function WorkPage({ params }) {
  const { id } = await params;
  const w = await getWork(id);
  if (!w) notFound();
  const m = w.memberId ? await getMember(w.memberId) : null;
  return (
    <>
      <section className="page-hero">
        <div className="container">
          <div className="crumb"><Link href="/works">ศูนย์รวมผลงาน</Link> / {w.category}</div>
          <h1>{w.title}</h1>
          <p>{w.date ? thDate(w.date, true) : ''}</p>
        </div>
      </section>
      <section className="section">
        <div className="container" style={{ maxWidth: 980 }}>
          {m ? (
            <Link href={`/members/${m.id}`} className="card hover row" style={{ padding: 14, marginBottom: 24, color: 'var(--ink)' }}>
              {m.photo ? <img src={m.photo} alt="" style={{ width: 56, height: 56, borderRadius: '50%', objectFit: 'cover' }} /> : <span className="mini-av" style={{ width: 56, height: 56 }} />}
              <div><div style={{ fontWeight: 700, fontSize: 22 }}>{m.name}</div><div className="xs muted">{m.position}</div></div>
              <span style={{ marginLeft: 'auto', color: 'var(--sky-500)', fontWeight: 700 }}>ดูโปรไฟล์ →</span>
            </Link>
          ) : null}
          <div className="row" style={{ marginBottom: 16 }}><span className="badge solid">{w.category}</span></div>
          <div className="pre" style={{ fontSize: 22, marginBottom: 26 }}>{w.description || '–'}</div>
          {w.link ? <p><a className="btn ghost" href={w.link} target="_blank" rel="noopener">เปิดลิงก์ผลงาน ↗</a></p> : null}
          <Gallery images={w.images} alt={w.title} />
        </div>
      </section>
    </>
  );
}
