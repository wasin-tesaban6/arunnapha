'use client';
import { useState } from 'react';
import Link from 'next/link';
import ImageUpload from './ImageUpload';
import { api } from '@/lib/client';
import { MARKET_CATEGORIES } from '@/lib/constants';

export default function SellForm({ rules }) {
  const [f, setF] = useState({ title: '', price: '', category: MARKET_CATEGORIES[0], description: '', images: [], sellerName: '', sellerClass: '', sellerNo: '', contact: '', accept: false, website: '' });
  const [st, setSt] = useState({ busy: false, err: '' });
  const [done, setDone] = useState(null);
  const set = (k) => (e) => setF((p) => ({ ...p, [k]: e?.target ? (e.target.type === 'checkbox' ? e.target.checked : e.target.value) : e }));

  async function submit(e) {
    e.preventDefault();
    setSt({ busy: true, err: '' });
    try { const r = await api('/api/public/market', f); setDone(r); window.scrollTo({ top: 0 }); }
    catch (x) { setSt({ busy: false, err: x.message }); return; }
    setSt({ busy: false, err: '' });
  }

  if (done) return (
    <div className="card pad center stack" style={{ maxWidth: 620, margin: '0 auto' }}>
      <h2 style={{ fontSize: 36 }}>ส่งประกาศเรียบร้อย 🎉</h2>
      <p>ประกาศของคุณอยู่ระหว่าง <b>รออนุมัติ</b> จากสภานักเรียน</p>
      <div className="muted">รหัสจัดการประกาศ (ใช้แจ้งขายแล้ว / ต่ออายุ / ลบ) — <b>จดเก็บไว้</b></div>
      <div><span className="code-big">{done.manageCode}</span></div>
      <div className="row" style={{ justifyContent: 'center' }}><Link href="/market/manage" className="btn">ตรวจสอบสถานะ</Link><Link href="/market" className="btn ghost">กลับไปตลาด</Link></div>
    </div>
  );

  return (
    <form className="form card pad" onSubmit={submit} style={{ maxWidth: 860, margin: '0 auto' }}>
      <h3 style={{ margin: 0 }}>ข้อมูลสินค้า</h3>
      <label className="f">ชื่อสินค้า *<input className="input" value={f.title} onChange={set('title')} required maxLength={150} /></label>
      <div className="two">
        <label className="f">ราคา (บาท)<input className="input" value={f.price} onChange={set('price')} placeholder="เช่น 25 หรือ 20-50" maxLength={40} /></label>
        <label className="f">หมวดหมู่<select className="select" value={f.category} onChange={set('category')}>{MARKET_CATEGORIES.map((c) => <option key={c}>{c}</option>)}</select></label>
      </div>
      <label className="f">รายละเอียดสินค้า<textarea className="textarea" value={f.description} onChange={set('description')} maxLength={3000} placeholder="ขนาด สี รสชาติ จำนวน วันที่ผลิต/หมดอายุ (ถ้าเป็นอาหาร) ฯลฯ" /></label>
      <div className="f" style={{ fontWeight: 700, color: 'var(--navy-800)' }}>รูปสินค้า (สูงสุด 5 รูป)
        <ImageUpload multiple max={5} value={f.images} onChange={set('images')} folder="market" size={1024} />
      </div>
      <h3 style={{ margin: '10px 0 0' }}>ข้อมูลผู้ขาย</h3>
      <div className="two">
        <label className="f">ชื่อ-นามสกุล *<input className="input" value={f.sellerName} onChange={set('sellerName')} required maxLength={100} /></label>
        <div className="two">
          <label className="f">ชั้น *<input className="input" value={f.sellerClass} onChange={set('sellerClass')} required placeholder="ม.5/1" maxLength={30} /></label>
          <label className="f">เลขที่<input className="input" value={f.sellerNo} onChange={set('sellerNo')} maxLength={10} /></label>
        </div>
      </div>
      <label className="f">ช่องทางติดต่อผู้ซื้อ * <span className="hint">(แสดงบนหน้าประกาศ เช่น LINE ID / IG / ลิงก์)</span><input className="input" value={f.contact} onChange={set('contact')} required maxLength={200} /></label>
      <details className="card" style={{ padding: '10px 16px' }}>
        <summary style={{ cursor: 'pointer', fontWeight: 700 }}>อ่านเงื่อนไขการฝากขาย</summary>
        <div className="pre small" style={{ marginTop: 8 }}>{rules}</div>
      </details>
      <label className="check"><input type="checkbox" checked={f.accept} onChange={set('accept')} required /> ข้าพเจ้าได้อ่านและยอมรับเงื่อนไขการฝากขาย และรับรองว่าข้อมูลเป็นความจริง</label>
      <input className="hp" tabIndex={-1} autoComplete="off" value={f.website} onChange={set('website')} aria-hidden="true" />
      {st.err ? <div className="alert err">{st.err}</div> : null}
      <div><button className="btn" disabled={st.busy}>{st.busy ? 'กำลังส่ง...' : 'ส่งประกาศเพื่อรออนุมัติ'}</button></div>
    </form>
  );
}
