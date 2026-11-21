'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function TrackSearch() {
  const router = useRouter();
  const [code, setCode] = useState('');
  const [mine, setMine] = useState([]);
  useEffect(() => { try { setMine(JSON.parse(localStorage.getItem('sc6_issues') || '[]')); } catch { /* */ } }, []);
  const go = (e) => { e.preventDefault(); const c = code.toUpperCase().replace(/[^A-Z0-9]/g, ''); if (c) router.push(`/track/${c}`); };
  return (
    <div className="stack" style={{ maxWidth: 640, margin: '0 auto' }}>
      <form className="card pad form" onSubmit={go}>
        <label className="f">กรอกรหัสเรื่อง<input className="input" style={{ fontSize: 28, letterSpacing: 3, textTransform: 'uppercase' }} value={code} onChange={(e) => setCode(e.target.value)} placeholder="CRXXXXXX" maxLength={12} required /></label>
        <button className="btn">ติดตามความคืบหน้า</button>
      </form>
      {mine.length ? (
        <div className="card pad">
          <b>เรื่องที่คุณเคยแจ้งจากเครื่องนี้</b>
          <div className="row" style={{ marginTop: 8 }}>{mine.map((c) => <Link key={c} href={`/track/${c}`} className="chip">{c}</Link>)}</div>
        </div>
      ) : null}
      <div className="center"><Link href="/report">ยังไม่ได้แจ้ง? แจ้งปัญหาใหม่ →</Link></div>
    </div>
  );
}
