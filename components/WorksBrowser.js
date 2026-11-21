'use client';
import { useMemo, useState } from 'react';
import { WorkCard, Empty } from './Cards';
import { WORK_CATEGORIES } from '@/lib/constants';

export default function WorksBrowser({ works, members }) {
  const [cat, setCat] = useState('');
  const [mem, setMem] = useState('');
  const [q, setQ] = useState('');
  const map = useMemo(() => Object.fromEntries(members.map((m) => [m.id, m])), [members]);
  const list = works.filter((w) =>
    (!cat || w.category === cat) && (!mem || w.memberId === mem) &&
    (!q || (w.title + ' ' + (map[w.memberId]?.name || '')).toLowerCase().includes(q.toLowerCase())));
  return (
    <>
      <div className="filters">
        <button className={`chip ${!cat ? 'on' : ''}`} onClick={() => setCat('')}>ทั้งหมด ({works.length})</button>
        {WORK_CATEGORIES.map((c) => {
          const n = works.filter((w) => w.category === c).length;
          return n ? <button key={c} className={`chip ${cat === c ? 'on' : ''}`} onClick={() => setCat(c)}>{c} ({n})</button> : null;
        })}
      </div>
      <div className="row" style={{ marginBottom: 24 }}>
        <select className="select" style={{ maxWidth: 320 }} value={mem} onChange={(e) => setMem(e.target.value)}>
          <option value="">สมาชิกทุกคน</option>
          {members.map((m) => <option key={m.id} value={m.id}>{m.name} — {m.position}</option>)}
        </select>
        <input className="input" style={{ maxWidth: 320 }} placeholder="ค้นหาผลงาน..." value={q} onChange={(e) => setQ(e.target.value)} />
      </div>
      {list.length ? (
        <div className="grid works-grid">{list.map((w) => <WorkCard key={w.id} w={w} member={map[w.memberId]} />)}</div>
      ) : <Empty icon="award" title={works.length ? 'ไม่พบผลงานที่ค้นหา' : 'ยังไม่มีผลงาน'}>{works.length ? 'ลองเปลี่ยนตัวกรอง' : 'สมาชิกสภาสามารถเพิ่มผลงานได้ที่ /scmember'}</Empty>}
    </>
  );
}
