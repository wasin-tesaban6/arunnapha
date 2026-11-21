'use client';
import { useMemo, useState } from 'react';
import Link from 'next/link';
import Icon from './Icon';
import { EventItem } from './Cards';
import { TH_MONTHS, TH_DAYS_SHORT, EVENT_CATEGORIES, eventColor, thDate } from '@/lib/constants';

const pad = (n) => String(n).padStart(2, '0');
const iso = (y, m, d) => `${y}-${pad(m + 1)}-${pad(d)}`;

export default function Calendar({ events, today }) {
  const [ty, tm] = today.split('-').map(Number);
  const [y, setY] = useState(ty);
  const [m, setM] = useState(tm - 1);
  const [sel, setSel] = useState(today);
  const [cat, setCat] = useState('');

  const list = useMemo(() => events.filter((e) => !cat || e.category === cat), [events, cat]);
  const onDay = (d) => list.filter((e) => e.date <= d && (e.endDate || e.date) >= d);

  const first = new Date(y, m, 1).getDay();
  const days = new Date(y, m + 1, 0).getDate();
  const prevDays = new Date(y, m, 0).getDate();
  const cells = [];
  for (let i = first - 1; i >= 0; i--) { const pm = m === 0 ? 11 : m - 1, py = m === 0 ? y - 1 : y; cells.push({ d: prevDays - i, iso: iso(py, pm, prevDays - i), out: true }); }
  for (let d = 1; d <= days; d++) cells.push({ d, iso: iso(y, m, d) });
  while (cells.length % 7) { const k = cells.length - first - days + 1; const nm = m === 11 ? 0 : m + 1, ny = m === 11 ? y + 1 : y; cells.push({ d: k, iso: iso(ny, nm, k), out: true }); }

  const go = (delta) => { let nm = m + delta, ny = y; if (nm < 0) { nm = 11; ny--; } if (nm > 11) { nm = 0; ny++; } setM(nm); setY(ny); };
  const selEvents = onDay(sel);
  const upcoming = list.filter((e) => (e.endDate || e.date) >= today).slice(0, 8);
  const monthEvents = list.filter((e) => e.date.slice(0, 7) === `${y}-${pad(m + 1)}` || (e.endDate || '').slice(0, 7) === `${y}-${pad(m + 1)}`);

  return (
    <>
      <div className="filters">
        <button className={`chip ${!cat ? 'on' : ''}`} onClick={() => setCat('')}>ทุกประเภท</button>
        {EVENT_CATEGORIES.map((c) => (
          <button key={c.key} className={`chip ${cat === c.key ? 'on' : ''}`} onClick={() => setCat(c.key)}>
            <span className="dot" style={{ background: c.color, marginRight: 6 }} />{c.key}
          </button>
        ))}
      </div>
      <div className="cal-wrap">
        <div className="card" style={{ overflow: 'hidden' }}>
          <div className="cal-head">
            <button className="icon-btn" onClick={() => go(-1)} aria-label="เดือนก่อน"><Icon name="left" size={26} /></button>
            <h3>{TH_MONTHS[m]} {y + 543}</h3>
            <div className="row" style={{ gap: 4 }}>
              <button className="btn sm ghost" onClick={() => { setY(ty); setM(tm - 1); setSel(today); }}>วันนี้</button>
              <button className="icon-btn" onClick={() => go(1)} aria-label="เดือนถัดไป"><Icon name="right" size={26} /></button>
            </div>
          </div>
          <div className="cal-grid">
            {TH_DAYS_SHORT.map((d) => <div key={d} className="dow">{d}</div>)}
            {cells.map((c) => {
              const evs = onDay(c.iso);
              return (
                <div key={c.iso} className={`day ${c.out ? 'out' : ''} ${c.iso === today ? 'today' : ''} ${c.iso === sel ? 'sel' : ''}`} onClick={() => setSel(c.iso)}>
                  <span className="n">{c.d}</span>
                  <div className="evs" style={{ display: 'grid', gap: 2 }}>
                    {evs.slice(0, 2).map((e) => <span key={e.id} className="ev" style={{ background: eventColor(e.category) }}>{e.title}</span>)}
                  </div>
                  {evs.length > 2 ? <span className="more">+{evs.length - 2} รายการ</span> : null}
                </div>
              );
            })}
          </div>
        </div>
        <div className="stack">
          <div className="card" style={{ padding: 10 }}>
            <div style={{ padding: '6px 10px', fontWeight: 700, fontSize: 22, color: 'var(--navy-800)' }}>📅 {thDate(sel, true)}</div>
            {selEvents.length ? selEvents.map((e) => <EventItem key={e.id} e={e} />) : <div className="muted small" style={{ padding: '4px 10px 10px' }}>ไม่มีกิจกรรมในวันนี้</div>}
          </div>
          <div className="card" style={{ padding: 10 }}>
            <div style={{ padding: '6px 10px', fontWeight: 700, fontSize: 22, color: 'var(--navy-800)' }}>⏳ กำลังจะมาถึง</div>
            {upcoming.length ? upcoming.map((e) => <EventItem key={e.id} e={e} />) : <div className="muted small" style={{ padding: '4px 10px 10px' }}>ยังไม่มีกิจกรรม</div>}
          </div>
        </div>
      </div>
      {monthEvents.length ? (
        <div style={{ marginTop: 30 }}>
          <h3>กิจกรรมทั้งหมดใน{TH_MONTHS[m]} ({monthEvents.length})</h3>
          <div className="card" style={{ padding: 8 }}>{monthEvents.map((e) => <EventItem key={e.id} e={e} />)}</div>
        </div>
      ) : null}
    </>
  );
}
