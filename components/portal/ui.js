'use client';
import { useCallback, useEffect, useState } from 'react';
import Icon from '../Icon';
import { api } from '@/lib/client';

export function Modal({ title, onClose, children, wide }) {
  useEffect(() => {
    const k = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', k);
    document.body.style.overflow = 'hidden';
    return () => { window.removeEventListener('keydown', k); document.body.style.overflow = ''; };
  }, [onClose]);
  return (
    <div className="modal-bg" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={wide ? { width: 'min(980px, 100%)' } : null}>
        <div className="mh"><h3>{title}</h3><button className="icon-btn" onClick={onClose} aria-label="ปิด"><Icon name="x" /></button></div>
        <div className="mb">{children}</div>
      </div>
    </div>
  );
}

let toastSet = null;
export function Toaster() {
  const [msg, setMsg] = useState('');
  useEffect(() => { toastSet = setMsg; return () => { toastSet = null; }; }, []);
  useEffect(() => { if (msg) { const t = setTimeout(() => setMsg(''), 2600); return () => clearTimeout(t); } }, [msg]);
  return msg ? <div className="toast">{msg}</div> : null;
}
export const toast = (m) => toastSet?.(m);

// โหลด/บันทึก/ลบ รายการจาก API
export function useList(url) {
  const [items, setItems] = useState(null);
  const [err, setErr] = useState('');
  const reload = useCallback(async () => {
    try { const r = await api(url); setItems(r.items); setErr(''); } catch (x) { setErr(x.message); setItems([]); }
  }, [url]);
  useEffect(() => { reload(); }, [reload]);
  const save = async (item) => { const r = await api(url, item); await reload(); toast('บันทึกเรียบร้อย ✓'); return r.item; };
  const remove = async (id, label = 'รายการนี้') => {
    if (!confirm(`ยืนยันลบ ${label}?`)) return false;
    try { await api(`${url}?id=${encodeURIComponent(id)}`, undefined, 'DELETE'); await reload(); toast('ลบแล้ว'); return true; } catch (x) { alert(x.message); return false; }
  };
  return { items, err, reload, save, remove, setItems };
}

export function useForm(init) {
  const [f, setF] = useState(init);
  const set = (k) => (e) => setF((p) => ({ ...p, [k]: e?.target ? (e.target.type === 'checkbox' ? e.target.checked : e.target.value) : e }));
  return [f, set, setF];
}

export function SaveBar({ busy, err, onCancel, label = 'บันทึก' }) {
  return (
    <>
      {err ? <div className="alert err">{err}</div> : null}
      <div className="row" style={{ justifyContent: 'flex-end' }}>
        {onCancel ? <button type="button" className="btn ghost" onClick={onCancel}>ยกเลิก</button> : null}
        <button className="btn" disabled={busy}>{busy ? 'กำลังบันทึก...' : label}</button>
      </div>
    </>
  );
}

// ใช้กับฟอร์มใน Modal: จัดการ busy/err ให้
export function useSubmit(fn) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const onSubmit = async (e) => {
    e?.preventDefault?.();
    setBusy(true); setErr('');
    try { await fn(); } catch (x) { setErr(x.message); }
    setBusy(false);
  };
  return { busy, err, onSubmit };
}

export function Loading() { return <div className="center" style={{ padding: 40 }}><span className="spinner" /></div>; }

export function LoginForm({ role, title, sub, logo }) {
  const [f, set] = useForm({ username: '', password: '' });
  const { busy, err, onSubmit } = useSubmit(async () => {
    await api('/api/auth/login', { role, ...f });
    window.location.reload();
  });
  return (
    <div className="login-wrap">
      <form className="card login-card form" onSubmit={onSubmit}>
        <img src={logo || '/logo.svg'} alt="" />
        <div><h2 style={{ fontSize: 34, margin: 0 }}>{title}</h2><div className="muted small">{sub}</div></div>
        <label className="f" style={{ textAlign: 'left' }}>ชื่อผู้ใช้<input className="input" value={f.username} onChange={set('username')} autoComplete="username" required autoFocus /></label>
        <label className="f" style={{ textAlign: 'left' }}>รหัสผ่าน<input className="input" type="password" value={f.password} onChange={set('password')} autoComplete="current-password" required /></label>
        {err ? <div className="alert err">{err}</div> : null}
        <button className="btn block" disabled={busy}><Icon name="lock" size={20} /> {busy ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}</button>
        <a href="/" className="small">← กลับหน้าเว็บไซต์</a>
      </form>
    </div>
  );
}

export async function logout() {
  await api('/api/auth/logout', {});
  window.location.reload();
}
