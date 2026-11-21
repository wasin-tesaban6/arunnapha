'use client';
import { useEffect, useState } from 'react';
import { useForm, useSubmit, toast } from '../portal/ui';
import { api } from '@/lib/client';

const Row = ({ ok, title, children }) => (
  <div className="card pad" style={{ borderLeft: `5px solid ${ok ? 'var(--ok)' : '#f59e0b'}` }}>
    <b>{ok ? '✅' : '⚠️'} {title}</b>
    <div className="small muted">{children}</div>
  </div>
);

export default function System() {
  const [s, setS] = useState(null);
  useEffect(() => { api('/api/admin/status').then(setS).catch(() => {}); }, []);
  const [f, set, setF] = useForm({ username: '', current: '', newPassword: '', confirm: '' });
  const { busy, err, onSubmit } = useSubmit(async () => {
    if (f.newPassword !== f.confirm) throw new Error('ยืนยันรหัสผ่านใหม่ไม่ตรงกัน');
    await api('/api/admin/password', f);
    setF({ username: '', current: '', newPassword: '', confirm: '' });
    toast('เปลี่ยนรหัสผ่านแล้ว ✓');
  });
  return (
    <div className="stack">
      <h2 style={{ margin: 0 }}>ระบบ & ความปลอดภัย</h2>
      {s ? (
        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
          <Row ok={s.storage === 'redis'} title={`ฐานข้อมูล: ${s.storage === 'redis' ? 'Upstash Redis' : s.storage === 'file' ? 'ไฟล์ในเครื่อง (โหมดทดสอบ)' : 'หน่วยความจำชั่วคราว'}`}>
            {s.storage === 'redis' ? 'ข้อมูลถูกบันทึกถาวร' : 'ยังไม่ได้เชื่อม Redis — ข้อมูลอาจหายเมื่อระบบรีสตาร์ต! ไปที่ Vercel → Storage → Upstash for Redis → Connect Project'}
          </Row>
          <Row ok={s.blob} title="ที่เก็บรูปภาพ: Vercel Blob">
            {s.blob ? 'รูปภาพถูกเก็บบน CDN โหลดเร็ว' : 'ยังไม่ได้เชื่อม Blob — รูปจะถูกเก็บในฐานข้อมูลโดยตรง (ใช้ได้ แต่แนะนำให้เชื่อม Blob)'}
          </Row>
          <Row ok={s.line} title="LINE Messaging API">
            {s.line ? `เชื่อมต่อแล้ว${s.lineOA ? ` · OA: ${s.lineOA}` : ''}${s.lineAdminKey ? '' : ' · ยังไม่ได้ตั้ง LINE_ADMIN_KEY'}` : 'ยังไม่ได้ตั้งค่า (ระบบแจ้งปัญหายังใช้ได้ผ่านเว็บ)'}
          </Row>
          <Row ok={s.authSecret} title="AUTH_SECRET">
            {s.authSecret ? 'ตั้งค่าแล้ว' : 'แนะนำให้ตั้งค่า AUTH_SECRET ใน Vercel เพื่อความปลอดภัยของการเข้าสู่ระบบ'}
          </Row>
        </div>
      ) : null}
      <form className="card pad form" onSubmit={onSubmit} style={{ maxWidth: 560 }}>
        <h3 style={{ margin: 0 }}>เปลี่ยนชื่อผู้ใช้ / รหัสผ่านแอดมิน</h3>
        <label className="f">ชื่อผู้ใช้ใหม่ <span className="hint">(เว้นว่าง = ใช้เดิม)</span><input className="input" value={f.username} onChange={set('username')} autoComplete="off" /></label>
        <label className="f">รหัสผ่านปัจจุบัน<input className="input" type="password" value={f.current} onChange={set('current')} required autoComplete="current-password" /></label>
        <div className="two">
          <label className="f">รหัสผ่านใหม่ (8 ตัวขึ้นไป)<input className="input" type="password" value={f.newPassword} onChange={set('newPassword')} required autoComplete="new-password" /></label>
          <label className="f">ยืนยันรหัสผ่านใหม่<input className="input" type="password" value={f.confirm} onChange={set('confirm')} required autoComplete="new-password" /></label>
        </div>
        {err ? <div className="alert err">{err}</div> : null}
        <div><button className="btn" disabled={busy}>{busy ? '...' : 'เปลี่ยนรหัสผ่าน'}</button></div>
      </form>
    </div>
  );
}
