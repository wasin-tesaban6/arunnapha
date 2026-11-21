'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/client';
import { ASKER_ROLES } from '@/lib/constants';

export default function AskForm({ eventId = '' }) {
  const router = useRouter();
  const [f, setF] = useState({ name: '', role: 'นักเรียน', text: '', website: '' });
  const [st, setSt] = useState({ busy: false, msg: '', err: '' });
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  async function submit(e) {
    e.preventDefault();
    setSt({ busy: true, msg: '', err: '' });
    try {
      await api('/api/public/questions', { ...f, eventId });
      setF({ ...f, text: '' });
      setSt({ busy: false, msg: 'ส่งคำถามเรียบร้อย สภานักเรียนจะตอบกลับโดยเร็วที่สุด 🙏', err: '' });
      router.refresh();
    } catch (x) { setSt({ busy: false, msg: '', err: x.message }); }
  }
  return (
    <form className="form card pad" onSubmit={submit}>
      <h3 style={{ margin: 0, fontSize: 26 }}>💬 สอบถามข้อมูลเพิ่มเติม</h3>
      <div className="two">
        <label className="f">ชื่อ (ไม่บังคับ)<input className="input" value={f.name} onChange={set('name')} placeholder="ไม่ประสงค์ออกนาม" maxLength={80} /></label>
        <label className="f">สถานะ<select className="select" value={f.role} onChange={set('role')}>{ASKER_ROLES.map((r) => <option key={r}>{r}</option>)}</select></label>
      </div>
      <label className="f">คำถาม *<textarea className="textarea" value={f.text} onChange={set('text')} required maxLength={1000} placeholder="พิมพ์คำถามเกี่ยวกับกิจกรรมนี้..." /></label>
      <input className="hp" tabIndex={-1} autoComplete="off" value={f.website} onChange={set('website')} aria-hidden="true" />
      {st.err ? <div className="alert err">{st.err}</div> : null}
      {st.msg ? <div className="alert ok">{st.msg}</div> : null}
      <div><button className="btn" disabled={st.busy}>{st.busy ? 'กำลังส่ง...' : 'ส่งคำถาม'}</button></div>
    </form>
  );
}
