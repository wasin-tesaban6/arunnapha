'use client';
import { useState } from 'react';
import Icon from '../Icon';
import { Modal, SaveBar, useForm, useSubmit, useList, Loading } from '../portal/ui';
import { thDateTime } from '@/lib/constants';

function AdminEditor({ item, onSave, onClose }) {
  const [f, set] = useForm({ id: item?.id, name: item?.name || '', username: item?.username || '', newPassword: '' });
  const [show, setShow] = useState(false);
  const { busy, err, onSubmit } = useSubmit(async () => { await onSave(f); onClose(); });
  return (
    <Modal title={item?.id ? `แก้ไขผู้ดูแล: ${item.name || item.username}` : 'เพิ่มผู้ดูแลระบบ'} onClose={onClose}>
      <form className="form" onSubmit={onSubmit}>
        <label className="f">ชื่อเรียก <span className="hint">(เช่น ADMIN2nd, ครูที่ปรึกษา)</span><input className="input" value={f.name} onChange={set('name')} maxLength={80} /></label>
        <label className="f">ชื่อผู้ใช้ / อีเมล *<input className="input" value={f.username} onChange={set('username')} required autoComplete="off" /></label>
        <label className="f">{item?.id ? 'ตั้งรหัสผ่านใหม่ (เว้นว่าง = ใช้รหัสเดิม)' : 'รหัสผ่าน * (8 ตัวขึ้นไป)'}
          <div className="row" style={{ flexWrap: 'nowrap' }}>
            <input className="input" type={show ? 'text' : 'password'} value={f.newPassword} onChange={set('newPassword')} required={!item?.id} autoComplete="new-password" />
            <button type="button" className="icon-btn" onClick={() => setShow(!show)} title="แสดงรหัส"><Icon name="eye" /></button>
          </div>
        </label>
        <SaveBar busy={busy} err={err} onCancel={onClose} />
      </form>
    </Modal>
  );
}

export default function Admins() {
  const list = useList('/api/admin/admins');
  const [edit, setEdit] = useState(null);
  if (!list.items) return <Loading />;
  return (
    <>
      <div className="top">
        <div><h2 style={{ margin: 0 }}>ผู้ดูแลระบบ</h2><div className="muted small">ทุกบัญชีเข้า /admin ได้และจัดการเว็บได้ทั้งหมด · ชื่อผู้ใช้ไม่สนตัวพิมพ์เล็ก-ใหญ่</div></div>
        <button className="btn" onClick={() => setEdit({})}><Icon name="plus" size={20} /> เพิ่มผู้ดูแล</button>
      </div>
      <div className="table-wrap">
        <table className="t">
          <thead><tr><th>ชื่อเรียก</th><th>ชื่อผู้ใช้</th><th>แก้ไขล่าสุด</th><th style={{ textAlign: 'right' }}>จัดการ</th></tr></thead>
          <tbody>
            {list.items.map((a) => (
              <tr key={a.id}>
                <td><b>{a.name}</b>{a.me ? <span className="badge" style={{ marginLeft: 6 }}>คุณ</span> : null}</td>
                <td style={{ wordBreak: 'break-all' }}>{a.username}</td>
                <td className="xs">{thDateTime(a.updatedAt || a.createdAt)}</td>
                <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                  <button className="btn sm ghost" onClick={() => setEdit(a)}><Icon name="edit" size={16} /> แก้ไข</button>{' '}
                  {!a.me ? <button className="btn sm danger" onClick={() => list.remove(a.id, `ผู้ดูแล ${a.name || a.username}`)}><Icon name="trash" size={16} /></button> : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="alert info small" style={{ marginTop: 16 }}>💡 ถ้าแก้รหัสผ่านของผู้ดูแลคนอื่น คนนั้นจะถูกออกจากระบบทันที · เปลี่ยนรหัสของตัวเองได้ที่เมนู “ระบบ & รหัสผ่าน”</div>
      {edit ? <AdminEditor item={edit.id ? edit : null} onSave={list.save} onClose={() => setEdit(null)} /> : null}
    </>
  );
}
