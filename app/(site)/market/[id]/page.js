import Link from 'next/link';
import { notFound } from 'next/navigation';
import Gallery from '@/components/Gallery';
import { db } from '@/lib/db';
import { publicListing, getSettings } from '@/lib/data';
import { thDateTime } from '@/lib/constants';

export const revalidate = 60;
export function generateStaticParams() { return []; }

async function load(id) {
  const x = await db.get('market', id);
  return x && (x.status === 'approved' || x.status === 'sold') ? publicListing(x) : null;
}
export async function generateMetadata({ params }) {
  const { id } = await params;
  const p = await load(id);
  return { title: p?.title || 'ไม่พบสินค้า' };
}

export default async function ProductPage({ params }) {
  const { id } = await params;
  const [p, s] = await Promise.all([load(id), getSettings()]);
  if (!p) notFound();
  const contact = (p.contact || '').trim();
  return (
    <>
      <section className="page-hero">
        <div className="container">
          <div className="crumb"><Link href="/market">ตลาดนัดออนไลน์</Link> / {p.category}</div>
          <h1>{p.title}</h1>
          <p>{p.price ? (/\d$/.test(p.price) ? `${p.price} บาท` : p.price) : 'สอบถามราคา'}</p>
        </div>
      </section>
      <section className="section">
        <div className="container grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 30, alignItems: 'start' }}>
          <div>{p.images?.length ? <Gallery images={p.images} alt={p.title} /> : <div className="empty">ไม่มีรูปสินค้า</div>}</div>
          <div className="stack">
            {p.status === 'sold' ? <div className="alert warn">สินค้านี้ขายแล้ว</div> : null}
            <div className="row"><span className="badge solid">{p.category}</span><span className="xs muted">ลงประกาศ {thDateTime(p.approvedAt || p.createdAt)}</span></div>
            <div className="price" style={{ fontSize: 40, fontWeight: 700, color: 'var(--blue-600)' }}>{p.price ? (/\d$/.test(p.price) ? `${p.price} บาท` : p.price) : 'สอบถามราคา'}</div>
            <div className="pre">{p.description || '–'}</div>
            <div className="card pad">
              <h3 style={{ fontSize: 24 }}>ข้อมูลผู้ขาย</h3>
              <div><b>{p.sellerName}</b> {p.sellerClass ? `· ชั้น ${p.sellerClass}` : ''}</div>
              <div>ติดต่อ: {/^https?:\/\//.test(contact) ? <a href={contact} target="_blank" rel="noopener">{contact}</a> : contact}</div>
              <div className="xs muted" style={{ marginTop: 6 }}>📍 จุดนัดรับ: {s.marketPickup || '–'}</div>
            </div>
            <div className="alert info small">💡 แนะนำให้ชำระเงินเมื่อได้รับสินค้าแล้ว และนัดรับภายในโรงเรียนเท่านั้น · <Link href="/market/rules">อ่านเงื่อนไข</Link></div>
          </div>
        </div>
      </section>
    </>
  );
}
