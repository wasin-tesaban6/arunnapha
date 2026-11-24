'use client';
import { useEffect, useMemo, useState } from 'react';
import Icon from './Icon';
import { Empty } from './Cards';
import { thDate, linkKind, todayISO } from '@/lib/constants';

export function VolunteerCard({ v, today }) {
  const past = v.date && v.date < today;
  return (
    <article className={`card vcard ${past ? 'past' : ''}`}>
      <div className="row" style={{ gap: 6 }}>
        {v.subject ? <span className="badge solid">{v.subject}</span> : null}
        {v.kind ? <span className="badge">{v.kind}</span> : null}
        {v.level ? <span className="badge">{v.level}</span> : null}
        {past ? <span className="badge" style={{ background: '#f1f5f9', color: '#64748b' }}>ผ่านไปแล้ว</span> : null}
      </div>
      <h3>{v.title}</h3>
      {v.tutor ? <div className="small muted">👤 โดย {v.tutor}</div> : null}
      {v.date || v.time ? <div className="small">📅 {v.date ? thDate(v.date, true) : ''}{v.time ? ` · 🕘 ${v.time}` : ''}</div> : null}
      {v.description ? <p className="small pre" style={{ margin: '6px 0 0' }}>{v.description}</p> : null}
      <div className="row" style={{ marginTop: 'auto', paddingTop: 12, gap: 8 }}>
        {v.meetLink ? <a className="btn sm" href={v.meetLink} target="_blank" rel="noopener"><Icon name="link" size={16} /> {linkKind(v.meetLink) === 'Google Meet' ? 'เข้าร่วม Google Meet' : `เปิดลิงก์ (${linkKind(v.meetLink)})`}</a> : null}
        {(v.files || []).map((f, i) => (
          <a key={i} className="btn sm ghost" href={f.url} target="_blank" rel="noopener"><Icon name="book" size={16} /> {f.name || `เอกสาร ${i + 1}`}</a>
        ))}
      </div>
    </article>
  );
}

export function OppCard({ o }) {
  const st = o.status;
  const range = o.openDate || o.closeDate ? `${o.openDate ? thDate(o.openDate) : '…'} – ${o.closeDate ? thDate(o.closeDate) : 'ไม่ระบุ'}` : 'ไม่ระบุวัน';
  return (
    <article className={`card vcard opp ${st.key === 'closed' ? 'past' : ''}`}>
      {o.image ? <div className="cover"><img src={o.image} alt={o.title} loading="lazy" decoding="async" /></div> : null}
      <div className="vbody">
        <div className="row" style={{ gap: 6 }}>
          <span className="badge" style={{ background: st.color, color: '#fff' }}>{st.label}</span>
          {o.subject ? <span className="badge solid">{o.subject}</span> : null}
          {o.scope ? <span className="badge">{o.scope}</span> : null}
        </div>
        <h3>{o.title}</h3>
        {o.organizer ? <div className="small muted">🏫 จัดโดย {o.organizer}</div> : null}
        <div className="small">🗓️ รับสมัคร {range}</div>
        {o.reward ? <div className="small">🏅 ได้รับ: {o.reward}</div> : null}
        {o.description ? <p className="small pre" style={{ margin: '6px 0 0' }}>{o.description}</p> : null}
        {o.link ? (
          <div style={{ marginTop: 'auto', paddingTop: 12 }}>
            <a className={`btn sm ${st.key === 'closed' ? 'ghost' : ''}`} href={o.link} target="_blank" rel="noopener"><Icon name="link" size={16} /> {st.key === 'closed' ? 'ดูรายละเอียด' : 'สมัคร / ดูรายละเอียด'} ({linkKind(o.link)})</a>
          </div>
        ) : null}
      </div>
    </article>
  );
}

export default function WorksHub({ volunteer, opportunities, t }) {
  const [tab, setTab] = useState('volunteer');
  const [subject, setSubject] = useState('');
  const [q, setQ] = useState('');
  const [kind, setKind] = useState('');
  const [scope, setScope] = useState('');
  const [showClosed, setShowClosed] = useState(false);
  const today = todayISO();

  useEffect(() => { if (new URLSearchParams(window.location.search).get('tab') === 'opp') setTab('opp'); }, []);
  const switchTab = (k) => {
    setTab(k); setSubject(''); setKind(''); setScope('');
    try { window.history.replaceState(null, '', k === 'opp' ? '?tab=opp' : window.location.pathname); } catch { /* */ }
  };

  const src = tab === 'opp' ? opportunities : volunteer;
  const subjects = useMemo(() => [...new Set(src.map((x) => x.subject).filter(Boolean))], [src]);
  const text = (x) => [x.title, x.subject, x.tutor, x.organizer, x.description, x.kind, x.reward].join(' ').toLowerCase();
  const list = src.filter((x) => (!subject || x.subject === subject) && (!q || text(x).includes(q.toLowerCase()))
    && (tab === 'opp' ? (!scope || x.scope === scope) && (showClosed || x.status.key !== 'closed') : !kind || x.kind === kind));
  const kinds = [...new Set(volunteer.map((v) => v.kind).filter(Boolean))];
  const openCount = opportunities.filter((o) => o.status.key === 'open' || o.status.key === 'always').length;

  return (
    <>
      <div className="tabs">
        <button className={tab === 'volunteer' ? 'on' : ''} onClick={() => switchTab('volunteer')}><Icon name="heart" size={20} /> {t.volunteerTab} <span className="n">{volunteer.length}</span></button>
        <button className={tab === 'opp' ? 'on' : ''} onClick={() => switchTab('opp')}><Icon name="award" size={20} /> {t.oppTab} {openCount ? <span className="n live-n">{openCount} เปิดรับ</span> : null}</button>
      </div>
      <p className="muted" style={{ marginTop: 0 }}>{tab === 'opp' ? t.oppIntro : t.volunteerIntro}</p>

      <div className="row" style={{ marginBottom: 14 }}>
        <select className="select" style={{ maxWidth: 300 }} value={subject} onChange={(e) => setSubject(e.target.value)}>
          <option value="">ทุกวิชา</option>
          {subjects.map((s) => <option key={s}>{s}</option>)}
        </select>
        <input className="input" style={{ maxWidth: 300 }} placeholder="ค้นหา..." value={q} onChange={(e) => setQ(e.target.value)} />
        {tab === 'opp' ? <label className="check"><input type="checkbox" checked={showClosed} onChange={(e) => setShowClosed(e.target.checked)} /> แสดงที่ปิดรับสมัครแล้ว</label> : null}
      </div>
      <div className="filters">
        {tab === 'opp' ? (
          <>
            <button className={`chip ${!scope ? 'on' : ''}`} onClick={() => setScope('')}>ทั้งหมด</button>
            {['ในโรงเรียน', 'นอกโรงเรียน'].map((s) => <button key={s} className={`chip ${scope === s ? 'on' : ''}`} onClick={() => setScope(s)}>{s}</button>)}
          </>
        ) : kinds.length ? (
          <>
            <button className={`chip ${!kind ? 'on' : ''}`} onClick={() => setKind('')}>ทั้งหมด</button>
            {kinds.map((k) => <button key={k} className={`chip ${kind === k ? 'on' : ''}`} onClick={() => setKind(k)}>{k}</button>)}
          </>
        ) : null}
      </div>

      {list.length ? (
        <div className="grid works-grid">
          {tab === 'opp' ? list.map((o) => <OppCard key={o.id} o={o} />) : list.map((v) => <VolunteerCard key={v.id} v={v} today={today} />)}
        </div>
      ) : (
        <Empty icon={tab === 'opp' ? 'award' : 'heart'} title={src.length ? 'ไม่พบรายการที่ค้นหา' : 'ยังไม่มีรายการ'}>
          {src.length ? (tab === 'opp' && !showClosed ? 'ลองติ๊ก “แสดงที่ปิดรับสมัครแล้ว” หรือเปลี่ยนตัวกรอง' : 'ลองเปลี่ยนตัวกรอง') : 'สภานักเรียนจะเพิ่มข้อมูลเร็ว ๆ นี้'}
        </Empty>
      )}
    </>
  );
}
