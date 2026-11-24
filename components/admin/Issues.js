'use client';
import { useState } from 'react';
import { Modal, Loading, useSubmit } from '../portal/ui';
import { ISSUE_STATUS, thDateTime } from '@/lib/constants';

function IssueEditor({ item, onSave, onClose }) {
  const [status, setStatus] = useState(item.status);
  const [note, setNote] = useState('');
  const [internalNote, setInternal] = useState(item.internalNote || '');
  const [assignee, setAssignee] = useState(item.assignee || '');
  const { busy, err, onSubmit } = useSubmit(async () => { await onSave({ id: item.id, status, note, internalNote, assignee }); onClose(); });
  return (
    <Modal title={`เรื่อง ${item.code}`} onClose={onClose} wide>
      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
        <div className="stack">
          <div><span className="badge" style={{ background: ISSUE_STATUS[item.status]?.color, color: '#fff' }}>{ISSUE_STATUS[item.status]?.label}</span> <span className="badge">{item.category}</span></div>
          <div><b>สถานที่:</b> {item.location || '-'}</div>
          <div className="pre">{item.detail}</div>
          {item.photo ? <a href={item.photo} target="_blank" rel="noopener"><img src={item.photo} alt="" style={{ borderRadius: 12, maxHeight: 260, objectFit: 'cover' }} /></a> : null}
          <div className="card pad small" style={{ background: 'var(--sky-50)' }}>
            <b>ผู้แจ้ง (เห็นเฉพาะแอดมิน)</b>
            {item.anonymous ? <div>ไม่ระบุตัวตน</div> : <>
              <div>ชื่อ: {item.reporterName || '-'} {item.reporterClass ? `(${item.reporterClass})` : ''}</div>
              <div>ติดต่อ: {item.reporterContact || '-'}</div>
            </>}
            <div>แจ้งเมื่อ: {thDateTime(item.createdAt)}</div>
          </div>
          <div>
            <b>ไทม์ไลน์</b>
            <ul className="timeline" style={{ marginTop: 8 }}>
              {[...(item.timeline || [])].reverse().map((t, i) => (
                <li key={i}><span className="pin" style={{ background: ISSUE_STATUS[t.status]?.color }} />
                  <b>{ISSUE_STATUS[t.status]?.label}</b>{t.note ? <div className="small">{t.note}</div> : null}<div className="xs muted">{thDateTime(t.at)}</div></li>
              ))}
            </ul>
          </div>
        </div>
        <form className="form" onSubmit={onSubmit}>
          <b>อัปเดตสถานะ</b>
          <div className="row" style={{ gap: 6 }}>
            {Object.entries(ISSUE_STATUS).map(([k, v]) => (
              <button type="button" key={k} className="chip" onClick={() => setStatus(k)}
                style={status === k ? { background: v.color, borderColor: v.color, color: '#fff' } : null}>{v.label}</button>
            ))}
          </div>
          <label className="f">บันทึกความคืบหน้า <span className="hint">(เพิ่มในไทม์ไลน์ของเรื่องนี้)</span>
            <textarea className="textarea" value={note} onChange={(e) => setNote(e.target.value)} placeholder="เช่น ประสานงานฝ่ายอาคารสถานที่แล้ว คาดว่าจะแก้ไขภายใน 3 วัน" /></label>
          <label className="f">ผู้รับผิดชอบ<input className="input" value={assignee} onChange={(e) => setAssignee(e.target.value)} placeholder="ชื่อสมาชิก / ฝ่าย" /></label>
          <label className="f">บันทึกภายใน <span className="hint">(ไม่แสดงต่อสาธารณะ)</span><textarea className="textarea" style={{ minHeight: 80 }} value={internalNote} onChange={(e) => setInternal(e.target.value)} /></label>
          {err ? <div className="alert err">{err}</div> : null}
          <div className="row" style={{ justifyContent: 'flex-end' }}>
            <button className="btn" disabled={busy}>{busy ? 'กำลังบันทึก...' : 'บันทึก'}</button>
          </div>
        </form>
      </div>
    </Modal>
  );
}

export default function Issues({ list }) {
  const { items, save, remove } = list;
  const [st, setSt] = useState('open');
  const [edit, setEdit] = useState(null);
  const [q, setQ] = useState('');
  if (!items) return <Loading />;
  const open = (i) => !['done', 'rejected'].includes(i.status);
  const shown = items.filter((i) => (st === 'all' || (st === 'open' ? open(i) : i.status === st)) &&
    (!q || (i.code + i.detail + i.location + i.category).toLowerCase().includes(q.toLowerCase())));
  return (
    <>
      <div className="top">
        <div><h2 style={{ margin: 0 }}>เรื่องแจ้งปัญหา</h2><div className="muted small">เรื่องที่เคยแจ้งผ่านเว็บ · อัปเดตสถานะและบันทึกความคืบหน้า (ตัวเลขสถิติบนเว็บนับจากรายการนี้)</div></div>
        <input className="input" style={{ maxWidth: 260 }} placeholder="ค้นหา รหัส/รายละเอียด" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>
      <div className="filters">
        <button className={`chip ${st === 'open' ? 'on' : ''}`} onClick={() => setSt('open')}>ยังไม่เสร็จ ({items.filter(open).length})</button>
        {Object.entries(ISSUE_STATUS).map(([k, v]) => <button key={k} className={`chip ${st === k ? 'on' : ''}`} onClick={() => setSt(k)}>{v.label} ({items.filter((i) => i.status === k).length})</button>)}
        <button className={`chip ${st === 'all' ? 'on' : ''}`} onClick={() => setSt('all')}>ทั้งหมด ({items.length})</button>
      </div>
      <div className="table-wrap">
        <table className="t">
          <thead><tr><th>รหัส</th><th>หมวด / สถานที่</th><th>รายละเอียด</th><th>สถานะ</th><th>แจ้งเมื่อ</th><th style={{ textAlign: 'right' }}></th></tr></thead>
          <tbody>
            {shown.map((i) => (
              <tr key={i.id} style={{ cursor: 'pointer' }} onClick={() => setEdit(i)}>
                <td><b>{i.code}</b></td>
                <td>{i.category}<div className="xs muted">{i.location}</div></td>
                <td style={{ maxWidth: 360 }}><div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{i.detail}</div></td>
                <td><span className="badge" style={{ background: ISSUE_STATUS[i.status]?.color, color: '#fff' }}>{ISSUE_STATUS[i.status]?.label}</span></td>
                <td className="xs" style={{ whiteSpace: 'nowrap' }}>{thDateTime(i.createdAt)}</td>
                <td style={{ textAlign: 'right' }} onClick={(e) => e.stopPropagation()}><button className="btn sm danger" onClick={() => remove(i.id, `เรื่อง ${i.code}`)}>ลบ</button></td>
              </tr>
            ))}
            {!shown.length ? <tr><td colSpan={6} className="center muted">ไม่มีเรื่องในหมวดนี้</td></tr> : null}
          </tbody>
        </table>
      </div>
      {edit ? <IssueEditor item={edit} onSave={save} onClose={() => setEdit(null)} /> : null}
    </>
  );
}
