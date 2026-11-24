'use client';
import { useState } from 'react';
import Icon from '../Icon';
import FileLinks from './FileLinks';
import { Modal, SaveBar, useForm, useSubmit, Loading } from '../portal/ui';
import { SUBJECTS, VOLUNTEER_KINDS, thDate, todayISO } from '@/lib/constants';

function Editor({ item, members, onSave, onClose }) {
  const [f, set] = useForm({
    id: item?.id, title: item?.title || '', subject: item?.subject || SUBJECTS[0], kind: item?.kind || VOLUNTEER_KINDS[0], level: item?.level || '',
    tutor: item?.tutor || '', date: item?.date || todayISO(), time: item?.time || '', description: item?.description || '',
    meetLink: item?.meetLink || '', files: item?.files || [], hidden: Boolean(item?.hidden),
  });
  const { busy, err, onSubmit } = useSubmit(async () => { await onSave({ ...f, files: f.files.filter((x) => x.url) }); onClose(); });
  return (
    <Modal title={item?.id ? 'แก้ไขจิตอาสาวิชาการ' : 'เพิ่มจิตอาสาวิชาการ'} onClose={onClose} wide>
      <form className="form" onSubmit={onSubmit}>
        <label className="f">ชื่อ / หัวข้อ *<input className="input" value={f.title} onChange={set('title')} required placeholder="เช่น เฉลยการบ้านคณิต ม.2 เรื่องเลขยกกำลัง" /></label>
        <div className="two">
          <label className="f">วิชา<input className="input" list="subj-list" value={f.subject} onChange={set('subject')} />
            <datalist id="subj-list">{SUBJECTS.map((s) => <option key={s} value={s} />)}</datalist></label>
          <div className="two">
            <label className="f">ประเภท<input className="input" list="kind-list" value={f.kind} onChange={set('kind')} />
              <datalist id="kind-list">{VOLUNTEER_KINDS.map((s) => <option key={s} value={s} />)}</datalist></label>
            <label className="f">ระดับชั้น<input className="input" value={f.level} onChange={set('level')} placeholder="เช่น ม.1–3" /></label>
          </div>
        </div>
        <div className="two">
          <label className="f">ผู้สอน / ผู้จัด<input className="input" list="tutor-list" value={f.tutor} onChange={set('tutor')} placeholder="ชื่อพี่สภา / ครู" />
            <datalist id="tutor-list">{(members || []).map((m) => <option key={m.id} value={m.name} />)}</datalist></label>
          <div className="two">
            <label className="f">วันที่<input className="input" type="date" value={f.date} onChange={set('date')} /></label>
            <label className="f">เวลา<input className="input" value={f.time} onChange={set('time')} placeholder="19.00–20.00 น." /></label>
          </div>
        </div>
        <label className="f">ลิงก์ Google Meet / ห้องเรียนออนไลน์<input className="input" type="url" value={f.meetLink} onChange={set('meetLink')} placeholder="https://meet.google.com/..." /></label>
        <label className="f">รายละเอียด<textarea className="textarea" value={f.description} onChange={set('description')} placeholder="เนื้อหาที่สอน สิ่งที่ต้องเตรียม ฯลฯ" /></label>
        <div className="f" style={{ fontWeight: 700, color: 'var(--navy-800)' }}>ไฟล์เอกสาร (เฉลย / ชีทสรุป)<FileLinks value={f.files} onChange={set('files')} /></div>
        <label className="check"><input type="checkbox" checked={f.hidden} onChange={set('hidden')} /> ซ่อนจากหน้าเว็บ</label>
        <SaveBar busy={busy} err={err} onCancel={onClose} />
      </form>
    </Modal>
  );
}

export default function Volunteer({ list, members }) {
  const { items, save, remove } = list;
  const [edit, setEdit] = useState(null);
  if (!items) return <Loading />;
  const sorted = [...items].sort((a, b) => String(b.date || '').localeCompare(String(a.date || '')));
  return (
    <>
      <div className="top">
        <div><h2 style={{ margin: 0 }}>จิตอาสาวิชาการ</h2><div className="muted small">เฉลยการบ้าน ติวแต่ละวิชา — ใส่ชื่อ ลิงก์ Meet หรือไฟล์เอกสาร</div></div>
        <button className="btn" onClick={() => setEdit({})}><Icon name="plus" size={20} /> เพิ่มรายการ</button>
      </div>
      <div className="table-wrap">
        <table className="t">
          <thead><tr><th>วันที่</th><th>ชื่อ</th><th>วิชา / ประเภท</th><th>Meet / ไฟล์</th><th style={{ textAlign: 'right' }}>จัดการ</th></tr></thead>
          <tbody>
            {sorted.map((v) => (
              <tr key={v.id}>
                <td style={{ whiteSpace: 'nowrap' }}>{thDate(v.date)}<div className="xs muted">{v.time}</div></td>
                <td><b>{v.title}</b>{v.hidden ? <span className="badge" style={{ marginLeft: 6 }}>ซ่อน</span> : null}<div className="xs muted">{v.tutor}</div></td>
                <td>{v.subject}<div className="xs muted">{v.kind}{v.level ? ` · ${v.level}` : ''}</div></td>
                <td className="xs">{v.meetLink ? '🎥 มีลิงก์' : '—'} · 📄 {v.files?.length || 0}</td>
                <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                  <button className="btn sm ghost" onClick={() => setEdit(v)}><Icon name="edit" size={16} /> แก้ไข</button>{' '}
                  <button className="btn sm danger" onClick={() => remove(v.id, v.title)}><Icon name="trash" size={16} /></button>
                </td>
              </tr>
            ))}
            {!sorted.length ? <tr><td colSpan={5} className="center muted">ยังไม่มีรายการ</td></tr> : null}
          </tbody>
        </table>
      </div>
      {edit ? <Editor item={edit.id ? edit : null} members={members} onSave={save} onClose={() => setEdit(null)} /> : null}
    </>
  );
}
