'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import QRCode from 'qrcode';
import ImageUpload from './ImageUpload';
import Icon from './Icon';
import { api } from '@/lib/client';

export const lineOA = process.env.NEXT_PUBLIC_LINE_OA_ID || '';
export const lineFollowUrl = (code) => `https://line.me/R/oaMessage/${encodeURIComponent(lineOA)}/?${encodeURIComponent('ติดตาม ' + code)}`;

export function rememberIssue(code) {
  try {
    const a = JSON.parse(localStorage.getItem('sc6_issues') || '[]').filter((c) => c !== code);
    localStorage.setItem('sc6_issues', JSON.stringify([code, ...a].slice(0, 10)));
  } catch { /* ignore */ }
}

export default function ReportForm({ categories }) {
  const [f, setF] = useState({ category: categories[0] || 'อื่น ๆ', location: '', detail: '', photo: '', reporterName: '', reporterClass: '', reporterContact: '', anonymous: false, website: '' });
  const [st, setSt] = useState({ busy: false, err: '' });
  const [done, setDone] = useState(null);
  const [qr, setQr] = useState('');
  const [fromQR, setFromQR] = useState(false);
  const set = (k) => (e) => setF((p) => ({ ...p, [k]: e?.target ? (e.target.type === 'checkbox' ? e.target.checked : e.target.value) : e }));

  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    const loc = p.get('loc'), cat = p.get('cat');
    if (loc || cat) {
      setF((x) => ({ ...x, location: loc || x.location, category: cat && categories.includes(cat) ? cat : x.category }));
      setFromQR(Boolean(loc));
    }
  }, [categories]);

  async function submit(e) {
    e.preventDefault();
    setSt({ busy: true, err: '' });
    try {
      const r = await api('/api/public/issues', f);
      rememberIssue(r.code);
      setDone(r.code);
      setQr(await QRCode.toDataURL(`${window.location.origin}/track/${r.code}`, { width: 360, margin: 1, color: { dark: '#0b3477' } }));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (x) { setSt({ busy: false, err: x.message }); return; }
    setSt({ busy: false, err: '' });
  }

  if (done) {
    return (
      <div className="card pad center stack" style={{ maxWidth: 640, margin: '0 auto' }}>
        <div style={{ color: 'var(--ok)' }}><Icon name="check" size={56} /></div>
        <h2 style={{ fontSize: 38 }}>ส่งเรื่องเรียบร้อยแล้ว</h2>
        <div className="muted">เก็บรหัสนี้ไว้เพื่อติดตามความคืบหน้า</div>
        <div><span className="code-big">{done}</span></div>
        {qr ? <img src={qr} alt="QR ติดตามเรื่อง" width="180" height="180" style={{ margin: '0 auto' }} /> : null}
        <div className="row" style={{ justifyContent: 'center' }}>
          <Link href={`/track/${done}`} className="btn">ติดตามแบบ Real-Time</Link>
          {lineOA ? <a href={lineFollowUrl(done)} className="btn line-btn" target="_blank" rel="noopener"><Icon name="line" size={20} /> รับแจ้งเตือนทาง LINE</a> : null}
        </div>
        {lineOA ? <div className="xs muted">กดปุ่ม LINE แล้วกด “ส่ง” ข้อความ ระบบจะแจ้งเตือนทุกครั้งที่สถานะเปลี่ยน</div> : null}
        <div><button className="btn ghost sm" onClick={() => { setDone(null); setF((x) => ({ ...x, detail: '', photo: '' })); }}>แจ้งเรื่องใหม่</button></div>
      </div>
    );
  }

  return (
    <form className="form card pad" onSubmit={submit} style={{ maxWidth: 820, margin: '0 auto' }}>
      {fromQR ? <div className="alert info">📍 สแกนจากจุด: <b>{f.location}</b></div> : null}
      <div className="two">
        <label className="f">หมวดปัญหา *<select className="select" value={f.category} onChange={set('category')}>{categories.map((c) => <option key={c}>{c}</option>)}</select></label>
        <label className="f">สถานที่ / จุดที่พบ<input className="input" value={f.location} onChange={set('location')} placeholder="เช่น อาคาร 2 ชั้น 3 ห้องน้ำชาย" maxLength={200} /></label>
      </div>
      <label className="f">รายละเอียดปัญหา *<textarea className="textarea" value={f.detail} onChange={set('detail')} required minLength={5} maxLength={2000} placeholder="อธิบายปัญหาที่พบ..." /></label>
      <div className="f" style={{ fontWeight: 700, color: 'var(--navy-800)' }}>แนบรูปภาพ (ไม่บังคับ)
        <ImageUpload value={f.photo} onChange={set('photo')} folder="issues" size={1024} label="ถ่าย/เลือกรูป" />
      </div>
      <label className="check"><input type="checkbox" checked={f.anonymous} onChange={set('anonymous')} /> แจ้งแบบไม่ระบุตัวตน</label>
      {!f.anonymous ? (
        <div className="two">
          <label className="f">ชื่อผู้แจ้ง<input className="input" value={f.reporterName} onChange={set('reporterName')} maxLength={100} /></label>
          <label className="f">ชั้น/ตำแหน่ง<input className="input" value={f.reporterClass} onChange={set('reporterClass')} placeholder="เช่น ม.4/2 หรือ ครู" maxLength={40} /></label>
          <label className="f" style={{ gridColumn: '1 / -1' }}>ช่องทางติดต่อกลับ <span className="hint">(ข้อมูลนี้เห็นเฉพาะสภานักเรียน)</span><input className="input" value={f.reporterContact} onChange={set('reporterContact')} placeholder="เบอร์โทร / LINE ID" maxLength={150} /></label>
        </div>
      ) : null}
      <input className="hp" tabIndex={-1} autoComplete="off" value={f.website} onChange={set('website')} aria-hidden="true" />
      {st.err ? <div className="alert err">{st.err}</div> : null}
      <div><button className="btn" disabled={st.busy}>{st.busy ? 'กำลังส่ง...' : 'ส่งเรื่อง'}</button></div>
    </form>
  );
}
