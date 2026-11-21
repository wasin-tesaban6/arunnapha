'use client';
import { useState } from 'react';
import Icon from '../Icon';
import WorkEditor from '../portal/WorkEditor';
import { Loading } from '../portal/ui';
import { thDate } from '@/lib/constants';

export default function Works({ list, members }) {
  const { items, save, remove } = list;
  const [edit, setEdit] = useState(null);
  const [mem, setMem] = useState('');
  if (!items) return <Loading />;
  const map = Object.fromEntries((members || []).map((m) => [m.id, m]));
  const shown = items.filter((w) => !mem || w.memberId === mem);
  return (
    <>
      <div className="top">
        <div><h2 style={{ margin: 0 }}>ผลงาน (จิตอาสาวิชาการ)</h2><div className="muted small">ผลงานของสมาชิกแต่ละคน — สมาชิกเพิ่มเองได้ที่ /scmember</div></div>
        <div className="row">
          <select className="select" value={mem} onChange={(e) => setMem(e.target.value)} style={{ width: 'auto' }}>
            <option value="">ทุกคน ({items.length})</option>
            {(members || []).map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
          </select>
          <button className="btn" onClick={() => setEdit({})}><Icon name="plus" size={20} /> เพิ่มผลงาน</button>
        </div>
      </div>
      <div className="table-wrap">
        <table className="t">
          <thead><tr><th></th><th>ผลงาน</th><th>เจ้าของ</th><th>ประเภท</th><th>วันที่</th><th style={{ textAlign: 'right' }}>จัดการ</th></tr></thead>
          <tbody>
            {shown.map((w) => (
              <tr key={w.id}>
                <td>{w.images?.[0] ? <img className="thumb" src={w.images[0]} alt="" /> : <div className="thumb" />}</td>
                <td><b>{w.title}</b>{w.hidden ? <span className="badge" style={{ marginLeft: 6 }}>ซ่อน</span> : null}</td>
                <td>{map[w.memberId]?.name || <span className="muted">สภา</span>}</td>
                <td>{w.category}</td>
                <td>{thDate(w.date)}</td>
                <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                  <a className="btn sm ghost" href={`/works/${w.id}`} target="_blank" rel="noopener"><Icon name="eye" size={16} /></a>{' '}
                  <button className="btn sm ghost" onClick={() => setEdit(w)}><Icon name="edit" size={16} /> แก้ไข</button>{' '}
                  <button className="btn sm danger" onClick={() => remove(w.id, w.title)}><Icon name="trash" size={16} /></button>
                </td>
              </tr>
            ))}
            {!shown.length ? <tr><td colSpan={6} className="center muted">ยังไม่มีผลงาน</td></tr> : null}
          </tbody>
        </table>
      </div>
      {edit ? <WorkEditor item={edit.id ? edit : null} members={members} onSave={save} onClose={() => setEdit(null)} /> : null}
    </>
  );
}
