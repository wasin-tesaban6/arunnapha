'use client';
import { useState } from 'react';
import ImageUpload from '../ImageUpload';
import { Modal, SaveBar, useForm, useSubmit, Loading } from '../portal/ui';
import { MARKET_CATEGORIES, MARKET_STATUS, thDateTime } from '@/lib/constants';

function ListingEditor({ item, onSave, onClose }) {
  const [f, set] = useForm({ ...item, images: item.images || [] });
  const { busy, err, onSubmit } = useSubmit(async () => { await onSave(f); onClose(); });
  return (
    <Modal title="ตรวจสอบประกาศฝากขาย" onClose={onClose} wide>
      <form className="form" onSubmit={onSubmit}>
        <div className="row" style={{ gap: 6 }}>
          {Object.entries(MARKET_STATUS).map(([k, v]) => (
            <button type="button" key={k} className="chip" onClick={() => set('status')(k)} style={f.status === k ? { background: v.color, borderColor: v.color, color: '#fff' } : null}>{v.label}</button>
          ))}
        </div>
        <label className="f">หมายเหตุถึงผู้ขาย <span className="hint">(ผู้ขายเห็นเมื่อตรวจสอบด้วยรหัสจัดการ)</span><input className="input" value={f.adminNote || ''} onChange={set('adminNote')} placeholder="เช่น กรุณาเพิ่มวันหมดอายุของสินค้า" /></label>
        <div className="two">
          <label className="f">ชื่อสินค้า<input className="input" value={f.title} onChange={set('title')} /></label>
          <div className="two">
            <label className="f">ราคา<input className="input" value={f.price} onChange={set('price')} /></label>
            <label className="f">หมวด<select className="select" value={f.category} onChange={set('category')}>{MARKET_CATEGORIES.map((c) => <option key={c}>{c}</option>)}</select></label>
          </div>
        </div>
        <label className="f">รายละเอียด<textarea className="textarea" value={f.description} onChange={set('description')} /></label>
        <ImageUpload multiple max={5} value={f.images} onChange={set('images')} folder="market" />
        <div className="two">
          <label className="f">ผู้ขาย<input className="input" value={f.sellerName} onChange={set('sellerName')} /></label>
          <div className="two">
            <label className="f">ชั้น<input className="input" value={f.sellerClass} onChange={set('sellerClass')} /></label>
            <label className="f">เลขที่<input className="input" value={f.sellerNo || ''} onChange={set('sellerNo')} /></label>
          </div>
        </div>
        <label className="f">ช่องทางติดต่อ<input className="input" value={f.contact} onChange={set('contact')} /></label>
        <div className="xs muted">ส่งเมื่อ {thDateTime(item.createdAt)} · รหัสจัดการ: <b>{item.manageCode}</b>{item.expiresAt ? ` · หมดอายุ ${thDateTime(item.expiresAt)}` : ''}</div>
        <SaveBar busy={busy} err={err} onCancel={onClose} />
      </form>
    </Modal>
  );
}

export default function Market({ list }) {
  const { items, save, remove } = list;
  const [st, setSt] = useState('pending');
  const [edit, setEdit] = useState(null);
  if (!items) return <Loading />;
  const shown = items.filter((x) => st === 'all' || x.status === st);
  return (
    <>
      <div className="top">
        <div><h2 style={{ margin: 0 }}>ตลาดนัดออนไลน์</h2><div className="muted small">ตรวจสอบและอนุมัติประกาศฝากขายของนักเรียน · แก้ไขเงื่อนไขได้ที่เมนู “ตั้งค่าเว็บไซต์”</div></div>
      </div>
      <div className="filters">
        {Object.entries(MARKET_STATUS).map(([k, v]) => <button key={k} className={`chip ${st === k ? 'on' : ''}`} onClick={() => setSt(k)}>{v.label} ({items.filter((x) => x.status === k).length})</button>)}
        <button className={`chip ${st === 'all' ? 'on' : ''}`} onClick={() => setSt('all')}>ทั้งหมด ({items.length})</button>
      </div>
      <div className="table-wrap">
        <table className="t">
          <thead><tr><th></th><th>สินค้า</th><th>ราคา</th><th>ผู้ขาย</th><th>สถานะ</th><th style={{ textAlign: 'right' }}>จัดการ</th></tr></thead>
          <tbody>
            {shown.map((x) => (
              <tr key={x.id}>
                <td>{x.images?.[0] ? <img className="thumb" src={x.images[0]} alt="" /> : <div className="thumb" />}</td>
                <td><b>{x.title}</b><div className="xs muted">{x.category}</div></td>
                <td>{x.price || '-'}</td>
                <td>{x.sellerName}<div className="xs muted">{x.sellerClass} {x.sellerNo ? `เลขที่ ${x.sellerNo}` : ''}</div></td>
                <td><span className="badge" style={{ background: MARKET_STATUS[x.status]?.color, color: '#fff' }}>{MARKET_STATUS[x.status]?.label}</span></td>
                <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                  {x.status === 'pending' ? <><button className="btn sm" onClick={() => save({ ...x, status: 'approved' })}>อนุมัติ</button>{' '}</> : null}
                  <button className="btn sm ghost" onClick={() => setEdit(x)}>ตรวจสอบ</button>{' '}
                  <button className="btn sm danger" onClick={() => remove(x.id, x.title)}>ลบ</button>
                </td>
              </tr>
            ))}
            {!shown.length ? <tr><td colSpan={6} className="center muted">ไม่มีประกาศในหมวดนี้</td></tr> : null}
          </tbody>
        </table>
      </div>
      {edit ? <ListingEditor item={edit} onSave={save} onClose={() => setEdit(null)} /> : null}
    </>
  );
}
