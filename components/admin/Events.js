'use client';
import { useState } from 'react';
import Icon from '../Icon';
import ImageUpload from '../ImageUpload';
import { Modal, SaveBar, useForm, useSubmit, Loading } from '../portal/ui';
import { EVENT_CATEGORIES, eventColor, thDate, todayISO } from '@/lib/constants';

function EventEditor({ item, onSave, onClose }) {
  const [f, set] = useForm({
    id: item?.id, title: item?.title || '', date: item?.date || todayISO(), endDate: item?.endDate || '', time: item?.time || '',
    location: item?.location || '', category: item?.category || 'วิชาการ', description: item?.description || '', image: item?.image || '', link: item?.link || '',
  });
  const { busy, err, onSubmit } = useSubmit(async () => { await onSave(f); onClose(); });
  return (
    <Modal title={item?.id ? 'แก้ไขกิจกรรม / ข่าวสาร' : 'เพิ่มกิจกรรม / ข่าวสาร'} onClose={onClose} wide>
      <form className="form" onSubmit={onSubmit}>
        <label className="f">ชื่อกิจกรรม / หัวข้อข่าว *<input className="input" value={f.title} onChange={set('title')} required /></label>
        <div className="two">
          <div className="two">
            <label className="f">วันที่เริ่ม *<input className="input" type="date" value={f.date} onChange={set('date')} required /></label>
            <label className="f">ถึงวันที่<input className="input" type="date" value={f.endDate} onChange={set('endDate')} min={f.date} /></label>
          </div>
          <div className="two">
            <label className="f">เวลา<input className="input" value={f.time} onChange={set('time')} placeholder="08.30–12.00 น." /></label>
            <label className="f">ประเภท<select className="select" value={f.category} onChange={set('category')}>{EVENT_CATEGORIES.map((c) => <option key={c.key}>{c.key}</option>)}</select></label>
          </div>
        </div>
        <label className="f">สถานที่<input className="input" value={f.location} onChange={set('location')} /></label>
        <label className="f">รายละเอียด / ประกาศ<textarea className="textarea" style={{ minHeight: 160 }} value={f.description} onChange={set('description')} /></label>
        <div className="two">
          <div className="f" style={{ fontWeight: 700, color: 'var(--navy-800)' }}>ภาพประกอบ<ImageUpload value={f.image} onChange={set('image')} folder="events" /></div>
          <label className="f">ลิงก์ (ฟอร์มสมัคร / เอกสาร)<input className="input" type="url" value={f.link} onChange={set('link')} placeholder="https://..." /></label>
        </div>
        <SaveBar busy={busy} err={err} onCancel={onClose} />
      </form>
    </Modal>
  );
}

export default function Events({ list }) {
  const { items, save, remove } = list;
  const [edit, setEdit] = useState(null);
  const [past, setPast] = useState(false);
  if (!items) return <Loading />;
  const today = todayISO();
  const shown = items.filter((e) => past || (e.endDate || e.date) >= today).sort((a, b) => a.date.localeCompare(b.date));
  return (
    <>
      <div className="top">
        <div><h2 style={{ margin: 0 }}>ปฏิทินกิจกรรม & ข่าวสาร</h2><div className="muted small">แต่ละกิจกรรมมีช่องถาม-ตอบให้นักเรียนและบุคลากร</div></div>
        <div className="row">
          <label className="check"><input type="checkbox" checked={past} onChange={(e) => setPast(e.target.checked)} /> แสดงกิจกรรมที่ผ่านไปแล้ว</label>
          <button className="btn" onClick={() => setEdit({})}><Icon name="plus" size={20} /> เพิ่มกิจกรรม</button>
        </div>
      </div>
      <div className="table-wrap">
        <table className="t">
          <thead><tr><th>วันที่</th><th>กิจกรรม</th><th>ประเภท</th><th>สถานที่</th><th style={{ textAlign: 'right' }}>จัดการ</th></tr></thead>
          <tbody>
            {shown.map((e) => (
              <tr key={e.id}>
                <td style={{ whiteSpace: 'nowrap' }}>{thDate(e.date)}{e.endDate ? ` – ${thDate(e.endDate)}` : ''}<div className="xs muted">{e.time}</div></td>
                <td><b>{e.title}</b></td>
                <td><span className="badge" style={{ background: eventColor(e.category), color: '#fff' }}>{e.category}</span></td>
                <td>{e.location}</td>
                <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                  <a className="btn sm ghost" href={`/calendar/${e.id}`} target="_blank" rel="noopener"><Icon name="eye" size={16} /></a>{' '}
                  <button className="btn sm ghost" onClick={() => setEdit(e)}><Icon name="edit" size={16} /> แก้ไข</button>{' '}
                  <button className="btn sm danger" onClick={() => remove(e.id, e.title)}><Icon name="trash" size={16} /></button>
                </td>
              </tr>
            ))}
            {!shown.length ? <tr><td colSpan={5} className="center muted">ยังไม่มีกิจกรรม</td></tr> : null}
          </tbody>
        </table>
      </div>
      {edit ? <EventEditor item={edit.id ? edit : null} onSave={save} onClose={() => setEdit(null)} /> : null}
    </>
  );
}
