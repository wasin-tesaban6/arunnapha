'use client';
import { useEffect, useState } from 'react';

const KEY = 'sc6_visit_day';
const today = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Bangkok' }).format(new Date());
const fmt = (n) => (Number.isFinite(n) ? n.toLocaleString('th-TH') : '–');

// สถิติผู้เข้าชม: นับ 1 ครั้งต่อเครื่องต่อวัน (รีเฟรชซ้ำไม่เพิ่มยอด)
export default function VisitCounter() {
  const [v, setV] = useState(null);
  useEffect(() => {
    let seen = null;
    try { seen = localStorage.getItem(KEY); } catch { /* ignore */ }
    const d = today();
    const count = seen !== d && !navigator.webdriver;
    fetch('/api/visit', { method: count ? 'POST' : 'GET', cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => {
        if (!j?.visits) return;
        setV(j.visits);
        if (count) { try { localStorage.setItem(KEY, d); } catch { /* ignore */ } }
      })
      .catch(() => {});
  }, []);
  return (
    <div className="visit-stats" aria-live="polite">
      <div className="vs-title">สถิติผู้เข้าชม</div>
      <div className="vs-row">
        <div><b>{fmt(v?.day)}</b><span>วันนี้</span></div>
        <div><b>{fmt(v?.month)}</b><span>เดือนนี้</span></div>
        <div><b>{fmt(v?.year)}</b><span>ปีนี้</span></div>
      </div>
    </div>
  );
}
