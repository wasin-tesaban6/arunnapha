'use client';
import { useEffect, useState } from 'react';
import Icon from '../Icon';
import ImageUpload from '../ImageUpload';
import WorkEditor from '../portal/WorkEditor';
import { QuestionRow } from '../admin/Questions';
import { useList, Toaster, toast, logout, useSubmit, useForm, Loading } from '../portal/ui';
import { api } from '@/lib/client';
import { thDate } from '@/lib/constants';

function Profile() {
  const [f, setF] = useState(null);
  useEffect(() => { api('/api/member/profile').then((r) => setF(r.member)); }, []);
  const { busy, err, onSubmit } = useSubmit(async () => { const r = await api('/api/member/profile', f); setF((p) => ({ ...p, ...r.member })); toast('บันทึกโปรไฟล์แล้ว ✓'); });
  if (!f) return <Loading />;
  const set = (k) => (e) => setF((p) => ({ ...p, [k]: e?.target ? e.target.value : e }));
  return (
    <form className="form" onSubmit={onSubmit} style={{ maxWidth: 860 }}>
      <div className="top"><div><h2 style={{ margin: 0 }}>โปรไฟล์ของฉัน</h2><div className="muted small">ตำแหน่ง: <b>{f.position || '-'}</b> (แก้ไขตำแหน่ง/ลำดับได้โดยแอดมิน)</div></div>
        <a className="btn ghost sm" href={`/members/${f.id}`} target="_blank" rel="noopener">ดูหน้าโปรไฟล์ ↗</a></div>
      <div className="card pad form">
        <div className="f" style={{ fontWeight: 700, color: 'var(--navy-800)' }}>รูปโปรไฟล์<ImageUpload value={f.photo} onChange={set('photo')} folder="members" size={800} label="อัปโหลดรูป" /></div>
        <div className="two">
          <label className="f">ชื่อ-นามสกุล<input className="input" value={f.name} onChange={set('name')} required /></label>
          <div className="two">
            <label className="f">ชื่อเล่น<input className="input" value={f.nickname || ''} onChange={set('nickname')} /></label>
            <label className="f">ชั้น<input className="input" value={f.classroom || ''} onChange={set('classroom')} /></label>
          </div>
        </div>
        <label className="f">คำคมสั้น ๆ<input className="input" value={f.quote || ''} onChange={set('quote')} maxLength={200} /></label>
        <label className="f">ประวัติส่วนตัวเบื้องต้น<textarea className="textarea" style={{ minHeight: 180 }} value={f.bio || ''} onChange={set('bio')} /></label>
        <label className="f">ช่องทางติดต่อ <span className="hint">(บรรทัดละ 1 ช่องทาง)</span><textarea className="textarea" style={{ minHeight: 70 }} value={f.contact || ''} onChange={set('contact')} /></label>
        {err ? <div className="alert err">{err}</div> : null}
        <div><button className="btn" disabled={busy}>{busy ? 'กำลังบันทึก...' : 'บันทึกโปรไฟล์'}</button></div>
      </div>
    </form>
  );
}

function MyWorks() {
  const list = useList('/api/member/works');
  const [edit, setEdit] = useState(null);
  if (!list.items) return <Loading />;
  return (
    <>
      <div className="top">
        <div><h2 style={{ margin: 0 }}>ผลงานของฉัน</h2><div className="muted small">อัปโหลดผลงาน รูปภาพ และเขียนคำอธิบาย — แสดงในหน้าศูนย์รวมผลงานทันที</div></div>
        <button className="btn" onClick={() => setEdit({})}><Icon name="plus" size={20} /> เพิ่มผลงาน</button>
      </div>
      {list.items.length ? (
        <div className="grid works-grid">
          {list.items.map((w) => (
            <div key={w.id} className="card work">
              <div className="cover">{w.images?.[0] ? <img src={w.images[0]} alt="" /> : <Icon name="award" size={48} />}</div>
              <div className="body">
                <div className="row" style={{ gap: 8 }}><span className="badge">{w.category}</span><span className="xs muted">{thDate(w.date)}</span>{w.hidden ? <span className="badge">ซ่อน</span> : null}</div>
                <h3>{w.title}</h3>
                <div className="row" style={{ marginTop: 'auto', paddingTop: 10 }}>
                  <button className="btn sm ghost" onClick={() => setEdit(w)}><Icon name="edit" size={16} /> แก้ไข</button>
                  <a className="btn sm ghost" href={`/works/${w.id}`} target="_blank" rel="noopener"><Icon name="eye" size={16} /></a>
                  <button className="btn sm danger" onClick={() => list.remove(w.id, w.title)}><Icon name="trash" size={16} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : <div className="empty">ยังไม่มีผลงาน — กด “เพิ่มผลงาน” เพื่อเริ่มต้น</div>}
      {edit ? <WorkEditor item={edit.id ? edit : null} onSave={list.save} onClose={() => setEdit(null)} /> : null}
    </>
  );
}

function Answer() {
  const list = useList('/api/member/questions');
  if (!list.items) return <Loading />;
  return (
    <>
      <div className="top"><div><h2 style={{ margin: 0 }}>ตอบคำถาม</h2><div className="muted small">ช่วยตอบคำถามจากนักเรียนและบุคลากร — ระบบจะแสดงชื่อและตำแหน่งของคุณเป็นผู้ตอบ</div></div></div>
      <div className="stack">
        {list.items.map((q) => <QuestionRow key={q.id + (q.answeredAt || '')} q={q} eventTitle={q.eventTitle} onAnswer={async (x, answer) => { await api('/api/member/questions', { id: x.id, answer }); await list.reload(); toast('บันทึกคำตอบแล้ว ✓'); }} />)}
        {!list.items.length ? <div className="empty">ยังไม่มีคำถาม</div> : null}
      </div>
    </>
  );
}

function Password() {
  const [f, set, setF] = useForm({ currentPassword: '', newPassword: '', confirm: '' });
  const { busy, err, onSubmit } = useSubmit(async () => {
    if (f.newPassword !== f.confirm) throw new Error('ยืนยันรหัสผ่านใหม่ไม่ตรงกัน');
    await api('/api/member/profile', f);
    setF({ currentPassword: '', newPassword: '', confirm: '' });
    toast('เปลี่ยนรหัสผ่านแล้ว ✓');
  });
  return (
    <form className="card pad form" onSubmit={onSubmit} style={{ maxWidth: 520 }}>
      <h2 style={{ margin: 0 }}>เปลี่ยนรหัสผ่าน</h2>
      <label className="f">รหัสผ่านปัจจุบัน<input className="input" type="password" value={f.currentPassword} onChange={set('currentPassword')} required /></label>
      <label className="f">รหัสผ่านใหม่ (6 ตัวขึ้นไป)<input className="input" type="password" value={f.newPassword} onChange={set('newPassword')} required /></label>
      <label className="f">ยืนยันรหัสผ่านใหม่<input className="input" type="password" value={f.confirm} onChange={set('confirm')} required /></label>
      {err ? <div className="alert err">{err}</div> : null}
      <div><button className="btn" disabled={busy}>เปลี่ยนรหัสผ่าน</button></div>
    </form>
  );
}

const TABS = [['profile', 'โปรไฟล์ของฉัน', 'user'], ['works', 'ผลงานของฉัน', 'award'], ['answer', 'ตอบคำถาม', 'chat'], ['password', 'เปลี่ยนรหัสผ่าน', 'lock']];

export default function MemberApp({ logo, name, position }) {
  const [tab, setTab] = useState('works');
  return (
    <div className="portal">
      <aside>
        <div className="brand"><img src={logo} alt="" style={{ width: 44, height: 44, background: '#fff', borderRadius: '50%', padding: 3 }} />
          <div style={{ minWidth: 0 }}><div className="t1" style={{ fontSize: 22 }}>{name}</div><div className="t2">{position || 'สมาชิกสภา'}</div></div></div>
        {TABS.map(([k, t, ic]) => <button key={k} className={`tab ${tab === k ? 'on' : ''}`} onClick={() => setTab(k)}><span className="row" style={{ gap: 10 }}><Icon name={ic} size={20} /> {t}</span></button>)}
        <div className="spacer" style={{ flex: 1 }} />
        <a className="tab" href="/" target="_blank" rel="noopener" style={{ color: '#cfe0fb', padding: '9px 14px' }}>↗ ดูหน้าเว็บไซต์</a>
        <button className="tab" onClick={logout}><span className="row" style={{ gap: 10 }}><Icon name="logout" size={20} /> ออกจากระบบ</span></button>
      </aside>
      <main>
        {tab === 'profile' ? <Profile /> : null}
        {tab === 'works' ? <MyWorks /> : null}
        {tab === 'answer' ? <Answer /> : null}
        {tab === 'password' ? <Password /> : null}
      </main>
      <Toaster />
    </div>
  );
}
