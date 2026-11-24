'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Icon from './Icon';
import FileLinks from './admin/FileLinks';
import { Modal } from './portal/ui';
import { api } from '@/lib/client';
import { SUBJECTS, VOLUNTEER_KINDS, todayISO } from '@/lib/constants';

// ฟอร์มให้พี่ ๆ น้อง ๆ เพื่อน ๆ ส่งรายการจิตอาสาวิชาการ (สอน / เฉลยการบ้าน)
export function VolunteerSubmit({ label, onClose }) {
  const router = useRouter();
  const [f, setF] = useState({
    tutor: '', tutorClass: '', contact: '', title: '', subject: SUBJECTS[0], kind: VOLUNTEER_KINDS[0], level: '',
    date: todayISO(), time: '', meetLink: '', files: [], description: '', accept: false, website: '',
  });
  const [st, setSt] = useState({ busy: false, err: '' });
  const [done, setDone] = useState(null);
  const set = (k) => (e) => setF((p) => ({ ...p, [k]: e?.target ? (e.target.type === 'checkbox' ? e.target.checked : e.target.value) : e }));

  async function submit(e) {
    e.preventDefault();
    setSt({ busy: true, err: '' });
    try {
      const r = await api('/api/public/volunteer', { ...f, files: f.files.filter((x) => x.url) });
      setDone(r);
      router.refresh();
    } catch (x) { setSt({ busy: false, err: x.message }); return; }
    setSt({ busy: false, err: '' });
  }

  return (
    <Modal title={label} onClose={onClose} wide>
      {done ? (
        <div className="center stack">
          <div style={{ color: 'var(--ok)' }}><Icon name="check" size={52} /></div>
          <h3 style={{ margin: 0 }}>ส่งเรียบร้อย ขอบคุณที่มาช่วยกันนะ 💙</h3>
          <p className="muted" style={{ margin: 0 }}>{done.status === 'pending' ? 'รายการของคุณอยู่ระหว่าง “รออนุมัติ” จากสภานักเรียน' : 'รายการของคุณแสดงบนเว็บแล้ว'}</p>
          <div className="muted small">รหัสจัดการรายการ (ใช้ตรวจสถานะ / ลบรายการ) — <b>จดเก็บไว้</b></div>
          <div><span className="code-big">{done.code}</span></div>
          <div><button className="btn" onClick={onClose}>ปิด</button></div>
        </div>
      ) : (
        <form className="form" onSubmit={submit}>
          <div className="alert info small">ใครก็มาสอนหรือแชร์เฉลยได้ ทั้งพี่ ๆ น้อง ๆ และเพื่อน ๆ — ใส่ลิงก์ Google Meet หรือไฟล์เอกสารอย่างน้อย 1 อย่าง</div>
          <div className="two">
            <label className="f">ชื่อผู้สอน *<input className="input" value={f.tutor} onChange={set('tutor')} required maxLength={200} placeholder="ชื่อ-นามสกุล หรือชื่อเล่น" /></label>
            <div className="two">
              <label className="f">ชั้น<input className="input" value={f.tutorClass} onChange={set('tutorClass')} maxLength={40} placeholder="ม.5/1" /></label>
              <label className="f">ช่องทางติดต่อ<input className="input" value={f.contact} onChange={set('contact')} maxLength={200} placeholder="IG / LINE (ไม่บังคับ)" /></label>
            </div>
          </div>
          <label className="f">หัวข้อ *<input className="input" value={f.title} onChange={set('title')} required maxLength={200} placeholder="เช่น ติวคณิต ม.2 เรื่องเลขยกกำลัง / เฉลยการบ้านฟิสิกส์ บทที่ 3" /></label>
          <div className="two">
            <label className="f">วิชา<input className="input" list="pub-subj" value={f.subject} onChange={set('subject')} />
              <datalist id="pub-subj">{SUBJECTS.map((s) => <option key={s} value={s} />)}</datalist></label>
            <div className="two">
              <label className="f">ประเภท<select className="select" value={f.kind} onChange={set('kind')}>{VOLUNTEER_KINDS.map((k) => <option key={k}>{k}</option>)}</select></label>
              <label className="f">สำหรับชั้น<input className="input" value={f.level} onChange={set('level')} placeholder="ม.1–3" /></label>
            </div>
          </div>
          <div className="two">
            <label className="f">วันที่สอน <span className="hint">(ไม่บังคับ)</span><input className="input" type="date" value={f.date} onChange={set('date')} /></label>
            <label className="f">เวลา<input className="input" value={f.time} onChange={set('time')} placeholder="19.00–20.00 น." /></label>
          </div>
          <label className="f">ลิงก์ Google Meet<input className="input" type="url" value={f.meetLink} onChange={set('meetLink')} placeholder="https://meet.google.com/..." /></label>
          <div className="f" style={{ fontWeight: 700, color: 'var(--navy-800)' }}>ไฟล์เอกสาร / เฉลย <span className="hint">(ลิงก์ Google Drive หรืออัปโหลด PDF ≤ 3 MB)</span><FileLinks value={f.files} onChange={set('files')} max={6} /></div>
          <label className="f">รายละเอียด<textarea className="textarea" value={f.description} onChange={set('description')} maxLength={4000} placeholder="สอนเรื่องอะไร ต้องเตรียมอะไรบ้าง ฯลฯ" /></label>
          <label className="check"><input type="checkbox" checked={f.accept} onChange={set('accept')} required /> เนื้อหาและลิงก์ที่ส่งเหมาะสม ไม่ละเมิดลิขสิทธิ์ และยินยอมให้สภาตรวจสอบ/แก้ไข/ลบได้</label>
          <input className="hp" tabIndex={-1} autoComplete="off" value={f.website} onChange={set('website')} aria-hidden="true" />
          {st.err ? <div className="alert err">{st.err}</div> : null}
          <div className="row" style={{ justifyContent: 'flex-end' }}>
            <button type="button" className="btn ghost" onClick={onClose}>ยกเลิก</button>
            <button className="btn" disabled={st.busy}>{st.busy ? 'กำลังส่ง...' : 'ส่งรายการ'}</button>
          </div>
        </form>
      )}
    </Modal>
  );
}

// ตรวจสถานะ / ลบรายการของตัวเองด้วยรหัส
export function VolunteerManage() {
  const [code, setCode] = useState('');
  const [item, setItem] = useState(null);
  const [msg, setMsg] = useState({ err: '', ok: '' });
  async function run(action) {
    if (action === 'delete' && !confirm('ยืนยันลบรายการนี้?')) return;
    setMsg({ err: '', ok: '' });
    try {
      const r = await api('/api/public/volunteer/manage', { code, action });
      if (action === 'delete') { setItem(null); setMsg({ err: '', ok: 'ลบรายการแล้ว' }); } else setItem(r.item);
    } catch (x) { setItem(null); setMsg({ err: x.message, ok: '' }); }
  }
  return (
    <details className="card" style={{ padding: '10px 16px', marginTop: 24 }}>
      <summary style={{ cursor: 'pointer', fontWeight: 700, color: 'var(--navy-800)' }}>ตรวจสถานะ / ลบรายการที่ฉันส่ง</summary>
      <form className="row" style={{ marginTop: 10 }} onSubmit={(e) => { e.preventDefault(); run('check'); }}>
        <input className="input" style={{ maxWidth: 280, textTransform: 'uppercase', letterSpacing: 2 }} value={code} onChange={(e) => setCode(e.target.value)} placeholder="CRMS6VLXXXXXX" maxLength={20} required />
        <button className="btn sm">ตรวจสอบ</button>
      </form>
      {msg.err ? <div className="alert err" style={{ marginTop: 8 }}>{msg.err}</div> : null}
      {msg.ok ? <div className="alert ok" style={{ marginTop: 8 }}>{msg.ok}</div> : null}
      {item ? (
        <div className="row between" style={{ marginTop: 10 }}>
          <span><b>{item.title}</b> — <span className="badge">{item.statusLabel}</span>{item.adminNote ? <span className="small muted"> · หมายเหตุ: {item.adminNote}</span> : null}</span>
          <button className="btn sm danger" onClick={() => run('delete')}>ลบรายการ</button>
        </div>
      ) : null}
    </details>
  );
}
