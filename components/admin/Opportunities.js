'use client';
import { useState } from 'react';
import Icon from '../Icon';
import ImageUpload from '../ImageUpload';
import { Modal, SaveBar, useForm, useSubmit, Loading } from '../portal/ui';
import { SUBJECTS, OPP_SCOPES, thDate, todayISO, oppStatus, linkKind } from '@/lib/constants';

function Editor({ item, onSave, onClose }) {
  const [f, set] = useForm({
    id: item?.id, title: item?.title || '', subject: item?.subject || SUBJECTS[0], scope: item?.scope || OPP_SCOPES[1],
    organizer: item?.organizer || '', reward: item?.reward || '', link: item?.link || '',
    openDate: item?.openDate || todayISO(), closeDate: item?.closeDate || '', description: item?.description || '', image: item?.image || '', hidden: Boolean(item?.hidden),
  });
  const { busy, err, onSubmit } = useSubmit(async () => {
    if (f.closeDate && f.openDate && f.closeDate < f.openDate) throw new Error('วันปิดรับสมัครต้องไม่ก่อนวันเปิด');
    await onSave(f); onClose();
  });
  return (
    <Modal title={item?.id ? 'แก้ไขกิจกรรม (ศูนย์รวมผลงาน)' : 'เพิ่มกิจกรรม (ศูนย์รวมผลงาน)'} onClose={onClose} wide>
      <form className="form" onSubmit={onSubmit}>
        <label className="f">ชื่อกิจกรรม *<input className="input" value={f.title} onChange={set('title')} required placeholder="เช่น การแข่งขันคณิตศาสตร์ระดับเขต" /></label>
        <label className="f">ลิงก์กิจกรรม <span className="hint">(IG, Facebook, Google Form, เว็บไซต์ ฯลฯ)</span><input className="input" type="url" value={f.link} onChange={set('link')} placeholder="https://www.instagram.com/p/..." />
          {f.link ? <span className="hint">ตรวจพบ: {linkKind(f.link)}</span> : null}</label>
        <div className="two">
          <label className="f">วันเปิดรับสมัคร<input className="input" type="date" value={f.openDate} onChange={set('openDate')} /></label>
          <label className="f">วันปิดรับสมัคร<input className="input" type="date" value={f.closeDate} onChange={set('closeDate')} min={f.openDate || undefined} /></label>
        </div>
        <div className="two">
          <label className="f">วิชา<input className="input" list="osubj-list" value={f.subject} onChange={set('subject')} />
            <datalist id="osubj-list">{SUBJECTS.map((s) => <option key={s} value={s} />)}</datalist></label>
          <label className="f">ภายใน / ภายนอกโรงเรียน<select className="select" value={f.scope} onChange={set('scope')}>{OPP_SCOPES.map((s) => <option key={s}>{s}</option>)}</select></label>
        </div>
        <div className="two">
          <label className="f">ผู้จัด<input className="input" value={f.organizer} onChange={set('organizer')} placeholder="เช่น สพม.เชียงราย / มหาวิทยาลัย..." /></label>
          <label className="f">สิ่งที่ได้รับ<input className="input" value={f.reward} onChange={set('reward')} placeholder="เช่น เกียรติบัตร, ชั่วโมงจิตอาสา" /></label>
        </div>
        <label className="f">รายละเอียด<textarea className="textarea" value={f.description} onChange={set('description')} placeholder="คุณสมบัติผู้สมัคร วิธีสมัคร ฯลฯ" /></label>
        <div className="f" style={{ fontWeight: 700, color: 'var(--navy-800)' }}>โปสเตอร์ (ไม่บังคับ)<ImageUpload value={f.image} onChange={set('image')} folder="events" /></div>
        <label className="check"><input type="checkbox" checked={f.hidden} onChange={set('hidden')} /> ซ่อนจากหน้าเว็บ</label>
        <SaveBar busy={busy} err={err} onCancel={onClose} />
      </form>
    </Modal>
  );
}

export default function Opportunities({ list }) {
  const { items, save, remove } = list;
  const [edit, setEdit] = useState(null);
  if (!items) return <Loading />;
  const today = todayISO();
  const sorted = [...items].sort((a, b) => String(b.openDate || '').localeCompare(String(a.openDate || '')));
  return (
    <>
      <div className="top">
        <div><h2 style={{ margin: 0 }}>ศูนย์รวมผลงาน</h2><div className="muted small">กิจกรรม/การแข่งขันที่ทำแล้วได้ผลงาน-เกียรติบัตร ทั้งในและนอกโรงเรียน</div></div>
        <button className="btn" onClick={() => setEdit({})}><Icon name="plus" size={20} /> เพิ่มกิจกรรม</button>
      </div>
      <div className="table-wrap">
        <table className="t">
          <thead><tr><th>กิจกรรม</th><th>วิชา / ขอบเขต</th><th>รับสมัคร</th><th>สถานะ</th><th style={{ textAlign: 'right' }}>จัดการ</th></tr></thead>
          <tbody>
            {sorted.map((o) => {
              const st = oppStatus(o, today);
              return (
                <tr key={o.id}>
                  <td><b>{o.title}</b>{o.hidden ? <span className="badge" style={{ marginLeft: 6 }}>ซ่อน</span> : null}<div className="xs muted">{o.link ? linkKind(o.link) : 'ไม่มีลิงก์'}</div></td>
                  <td>{o.subject}<div className="xs muted">{o.scope}</div></td>
                  <td className="xs" style={{ whiteSpace: 'nowrap' }}>{thDate(o.openDate) || '…'} – {thDate(o.closeDate) || '…'}</td>
                  <td><span className="badge" style={{ background: st.color, color: '#fff' }}>{st.label}</span></td>
                  <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                    <button className="btn sm ghost" onClick={() => setEdit(o)}><Icon name="edit" size={16} /> แก้ไข</button>{' '}
                    <button className="btn sm danger" onClick={() => remove(o.id, o.title)}><Icon name="trash" size={16} /></button>
                  </td>
                </tr>
              );
            })}
            {!sorted.length ? <tr><td colSpan={5} className="center muted">ยังไม่มีกิจกรรม</td></tr> : null}
          </tbody>
        </table>
      </div>
      {edit ? <Editor item={edit.id ? edit : null} onSave={save} onClose={() => setEdit(null)} /> : null}
    </>
  );
}
