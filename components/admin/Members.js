'use client';
import { useState } from 'react';
import Icon from '../Icon';
import ImageUpload from '../ImageUpload';
import { Modal, SaveBar, useForm, useSubmit, Loading, toast } from '../portal/ui';
import { POSITION_SUGGESTIONS } from '@/lib/seed';
import MemberImport from './MemberImport';

function MemberEditor({ item, nextOrder, onSave, onClose }) {
  const [f, set] = useForm({
    id: item?.id, name: item?.name || '', nickname: item?.nickname || '', position: item?.position || '', order: item?.order ?? nextOrder,
    classroom: item?.classroom || '', quote: item?.quote || '', bio: item?.bio || '', photo: item?.photo || '', contact: item?.contact || '',
    active: item?.active ?? true, username: item?.username || '', newPassword: '',
  });
  const { busy, err, onSubmit } = useSubmit(async () => { await onSave(f); onClose(); });
  return (
    <Modal title={item?.id ? `แก้ไข: ${item.name}` : 'เพิ่มสมาชิกพรรค'} onClose={onClose} wide>
      <form className="form" onSubmit={onSubmit}>
        <div className="row" style={{ alignItems: 'flex-start', gap: 20 }}>
          <div className="f" style={{ fontWeight: 700, color: 'var(--navy-800)' }}>รูปโปรไฟล์<ImageUpload value={f.photo} onChange={set('photo')} folder="members" size={800} label="อัปโหลดรูป" /></div>
          <div className="form" style={{ flex: 1, minWidth: 260 }}>
            <div className="two">
              <label className="f">ชื่อ-นามสกุล *<input className="input" value={f.name} onChange={set('name')} required /></label>
              <label className="f">ชื่อเล่น<input className="input" value={f.nickname} onChange={set('nickname')} /></label>
            </div>
            <div className="two">
              <label className="f">ตำแหน่ง/ยศ *<input className="input" list="pos-list" value={f.position} onChange={set('position')} required placeholder="เลือกหรือพิมพ์เอง" />
                <datalist id="pos-list">{POSITION_SUGGESTIONS.map((p) => <option key={p} value={p} />)}</datalist>
              </label>
              <div className="two">
                <label className="f">ลำดับแสดง<input className="input" type="number" value={f.order} onChange={set('order')} min="0" /></label>
                <label className="f">ชั้น<input className="input" value={f.classroom} onChange={set('classroom')} placeholder="ม.5/1" /></label>
              </div>
            </div>
          </div>
        </div>
        <label className="f">คำคมสั้น ๆ<input className="input" value={f.quote} onChange={set('quote')} maxLength={200} /></label>
        <label className="f">ประวัติส่วนตัวเบื้องต้น<textarea className="textarea" value={f.bio} onChange={set('bio')} maxLength={4000} placeholder="ความสามารถ ผลงานเด่น ประสบการณ์ ความตั้งใจ..." /></label>
        <label className="f">ช่องทางติดต่อ <span className="hint">(บรรทัดละ 1 ช่องทาง ลิงก์จะกดได้)</span><textarea className="textarea" style={{ minHeight: 70 }} value={f.contact} onChange={set('contact')} /></label>
        <label className="check"><input type="checkbox" checked={f.active} onChange={set('active')} /> แสดงบนหน้าเว็บ (ยกเลิกเพื่อซ่อน และปิดการเข้าสู่ระบบ)</label>
        <div className="card pad" style={{ background: 'var(--sky-50)' }}>
          <b>🔐 บัญชีเข้าสู่ระบบสมาชิก (/scmember)</b>
          <div className="xs muted">ให้สมาชิกเข้ามาอัปโหลดผลงาน เขียนคำอธิบาย และแก้ไขข้อมูลตัวเอง · เว้นชื่อผู้ใช้ว่าง = ไม่มีบัญชี</div>
          <div className="two" style={{ marginTop: 10 }}>
            <label className="f">ชื่อผู้ใช้<input className="input" value={f.username} onChange={set('username')} placeholder="เช่น president" autoComplete="off" /></label>
            <label className="f">{item?.hasPassword ? 'ตั้งรหัสผ่านใหม่ (เว้นว่าง = ใช้รหัสเดิม)' : 'รหัสผ่าน (อย่างน้อย 6 ตัว)'}<input className="input" value={f.newPassword} onChange={set('newPassword')} autoComplete="new-password" /></label>
          </div>
        </div>
        <SaveBar busy={busy} err={err} onCancel={onClose} />
      </form>
    </Modal>
  );
}

export default function Members({ list }) {
  const { items, save, remove } = list;
  const [edit, setEdit] = useState(null);
  const [importing, setImporting] = useState(false);
  if (!items) return <Loading />;
  const move = async (i, d) => {
    const a = items[i], b = items[i + d];
    if (!a || !b) return;
    const ao = a.order ?? i, bo = b.order ?? i + d;
    await save({ ...a, order: bo === ao ? ao + d : bo });
    await save({ ...b, order: ao });
    toast('จัดลำดับแล้ว');
  };
  const nextOrder = Math.max(0, ...items.map((m) => Number(m.order) || 0)) + 1;
  return (
    <>
      <div className="top">
        <div><h2 style={{ margin: 0 }}>สมาชิกพรรค & บัญชีผู้ใช้</h2><div className="muted small">เพิ่ม–ลด สมาชิก ตำแหน่ง ลำดับการแสดง และสร้างบัญชีให้สมาชิกเข้าสู่ระบบ</div></div>
        <div className="row">
          <button className="btn ghost" onClick={() => setImporting(true)}><Icon name="users" size={20} /> เพิ่มหลายคน / CSV</button>
          <button className="btn" onClick={() => setEdit({})}><Icon name="plus" size={20} /> เพิ่มสมาชิก</button>
        </div>
      </div>
      <div className="table-wrap">
        <table className="t">
          <thead><tr><th>ลำดับ</th><th></th><th>ชื่อ</th><th>ตำแหน่ง</th><th>บัญชี</th><th>สถานะ</th><th style={{ textAlign: 'right' }}>จัดการ</th></tr></thead>
          <tbody>
            {items.map((m, i) => (
              <tr key={m.id}>
                <td style={{ whiteSpace: 'nowrap' }}>
                  <button className="icon-btn" onClick={() => move(i, -1)} disabled={!i} title="เลื่อนขึ้น"><Icon name="up" size={18} /></button>
                  <button className="icon-btn" onClick={() => move(i, 1)} disabled={i === items.length - 1} title="เลื่อนลง"><Icon name="down" size={18} /></button>
                </td>
                <td>{m.photo ? <img className="thumb" src={m.photo} alt="" /> : <div className="thumb" />}</td>
                <td><b>{m.name}</b>{m.nickname ? ` (${m.nickname})` : ''}<div className="xs muted">{m.classroom}</div></td>
                <td>{m.position}</td>
                <td>{m.username ? <span className="badge">{m.username}{m.hasPassword ? '' : ' · ยังไม่ตั้งรหัส'}</span> : <span className="xs muted">—</span>}</td>
                <td>{m.active !== false ? <span className="badge" style={{ background: '#dcfce7', color: '#166534' }}>แสดง</span> : <span className="badge" style={{ background: '#f1f5f9', color: '#64748b' }}>ซ่อน</span>}</td>
                <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                  <button className="btn sm ghost" onClick={() => setEdit(m)}><Icon name="edit" size={16} /> แก้ไข</button>{' '}
                  <button className="btn sm danger" onClick={() => remove(m.id, m.name)}><Icon name="trash" size={16} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {importing ? <MemberImport existing={items} onClose={() => setImporting(false)} onDone={list.reload} /> : null}
      {edit ? <MemberEditor item={edit.id ? edit : null} nextOrder={nextOrder} onSave={save} onClose={() => setEdit(null)} /> : null}
    </>
  );
}
