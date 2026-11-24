import Link from 'next/link';
import Icon from './Icon';
import { thDate } from '@/lib/constants';

export function PageHero({ title, sub, crumb }) {
  return (
    <section className="page-hero">
      <div className="container">
        {crumb ? <div className="crumb">{crumb}</div> : null}
        <h1>{title}</h1>
        {sub ? <p>{sub}</p> : null}
      </div>
    </section>
  );
}

export function Empty({ icon = 'image', title, children }) {
  return (
    <div className="empty">
      <div className="ic"><Icon name={icon} size={46} stroke={1.5} /></div>
      <div style={{ fontWeight: 700, fontSize: 24, color: 'var(--navy-800)' }}>{title}</div>
      {children ? <div className="small">{children}</div> : null}
    </div>
  );
}

export function MemberCard({ m, lead = false }) {
  return (
    <article className={`card hover member ${lead ? 'lead' : ''}`}>
      <div className="photo">
        {m.photo ? <img src={m.photo} alt={m.name} loading="lazy" decoding="async" /> : <div className="ph"><Icon name="user" size={90} stroke={1.2} /></div>}
        {m.position ? <span className="pos">{m.position}</span> : null}
      </div>
      <div className="body">
        <div className="name">{m.name}{m.nickname ? <span className="muted" style={{ fontWeight: 400, fontSize: '.8em' }}> ({m.nickname})</span> : null}</div>
        {m.classroom ? <div className="cls">ชั้น {m.classroom}</div> : null}
        <div className="quote">{m.quote || '–'}</div>
        <Link href={`/members/${m.id}`} className="btn sm ghost" style={{ alignSelf: lead ? 'flex-start' : 'center' }}>
          ดูผลงาน & ประวัติ <Icon name="arrow" size={18} />
        </Link>
      </div>
    </article>
  );
}

export function ProductCard({ p }) {
  return (
    <Link href={`/market/${p.id}`} className="card hover product">
      <div className="cover">
        {p.images?.[0] ? <img src={p.images[0]} alt={p.title} loading="lazy" decoding="async" /> : <Icon name="shop" size={56} stroke={1.3} />}
        {p.status === 'sold' ? <div className="sold">ขายแล้ว</div> : null}
      </div>
      <div className="body">
        <span className="badge" style={{ alignSelf: 'flex-start' }}>{p.category}</span>
        <h3>{p.title}</h3>
        <div className="price">{p.price ? (/\d$/.test(p.price) ? `${p.price} บาท` : p.price) : 'สอบถามราคา'}</div>
        <div className="seller">โดย {p.sellerName} {p.sellerClass ? `(${p.sellerClass})` : ''}</div>
      </div>
    </Link>
  );
}

export function EventItem({ e }) {
  const [, m, d] = String(e.date).split('-').map(Number);
  const months = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
  return (
    <Link href={`/calendar/${e.id}`} className="event-item">
      <div className="date-box"><div className="d">{d}</div><div className="m">{months[m - 1]}</div></div>
      <div style={{ minWidth: 0 }}>
        <h4>{e.title}</h4>
        <div className="xs muted row" style={{ gap: 10 }}>
          <span className="badge" style={{ fontSize: 15 }}>{e.category}</span>
          {e.time ? <span>🕘 {e.time}</span> : null}
          {e.location ? <span>📍 {e.location}</span> : null}
        </div>
      </div>
    </Link>
  );
}
