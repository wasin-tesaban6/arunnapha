'use client';
import { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import Icon from '../Icon';

const DEFAULT = ['ห้องสภานักเรียน', 'โรงอาหาร', 'ห้องน้ำอาคาร 1', 'ห้องน้ำอาคาร 2', 'อาคาร 1', 'อาคาร 2', 'สนามกีฬา', 'ห้องสมุด'];

export default function QRTool() {
  const [text, setText] = useState(() => { try { return localStorage.getItem('sc6_qr_locs') || DEFAULT.join('\n'); } catch { return DEFAULT.join('\n'); } });
  const [cards, setCards] = useState([]);
  const [origin, setOrigin] = useState('');
  useEffect(() => { setOrigin(window.location.origin); }, []);
  useEffect(() => {
    try { localStorage.setItem('sc6_qr_locs', text); } catch { /* */ }
    if (!origin) return;
    const locs = text.split('\n').map((s) => s.trim()).filter(Boolean).slice(0, 60);
    const items = [{ title: 'แจ้งปัญหา (ทั่วไป)', url: `${origin}/report` }, ...locs.map((l) => ({ title: l, url: `${origin}/report?loc=${encodeURIComponent(l)}` }))];
    let off = false;
    Promise.all(items.map(async (x) => ({ ...x, img: await QRCode.toDataURL(x.url, { width: 360, margin: 1, color: { dark: '#0b3477' } }) }))).then((r) => !off && setCards(r));
    return () => { off = true; };
  }, [text, origin]);

  return (
    <>
      <div className="top no-print">
        <div><h2 style={{ margin: 0 }}>สร้าง QR Code แจ้งปัญหา</h2><div className="muted small">พิมพ์ชื่อจุดติดตั้ง (บรรทัดละ 1 จุด) → สั่งพิมพ์ไปติดตามจุดต่าง ๆ ในโรงเรียน · เมื่อสแกน ระบบจะกรอกสถานที่ให้อัตโนมัติ</div></div>
        <button className="btn" onClick={() => window.print()}><Icon name="print" size={20} /> พิมพ์</button>
      </div>
      <textarea className="textarea no-print" style={{ minHeight: 160, marginBottom: 20 }} value={text} onChange={(e) => setText(e.target.value)} />
      <div className="qr-sheet">
        {cards.map((c) => (
          <div key={c.url} className="card qr-card">
            <div style={{ fontWeight: 700, color: 'var(--navy-800)', fontSize: 18 }}>สภานักเรียน CRMS6 | อรุณนภา</div>
            <img src={c.img} alt={c.title} />
            <div style={{ fontWeight: 700, fontSize: 24 }}>{c.title}</div>
            <div className="xs muted">สแกนเพื่อแจ้งปัญหา</div>
            <a className="xs no-print" href={c.img} download={`QR-${c.title}.png`}>ดาวน์โหลด PNG</a>
          </div>
        ))}
      </div>
    </>
  );
}
