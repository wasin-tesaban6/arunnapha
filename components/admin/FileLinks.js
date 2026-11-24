'use client';
import { useRef, useState } from 'react';
import Icon from '../Icon';
import { uploadPdf } from '@/lib/client';

// รายการไฟล์/ลิงก์เอกสาร: ใส่ลิงก์ (Google Drive, Canva ฯลฯ) หรืออัปโหลด PDF ≤ 3 MB
export default function FileLinks({ value, onChange, max = 12 }) {
  const list = value || [];
  const ref = useRef();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const set = (i, k, v) => onChange(list.map((f, j) => (j === i ? { ...f, [k]: v } : f)));
  async function pick(e) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setBusy(true); setErr('');
    try {
      const url = await uploadPdf(file);
      onChange([...list, { name: file.name.replace(/\.pdf$/i, ''), url }].slice(0, max));
    } catch (x) { setErr(x.message); }
    setBusy(false);
  }
  return (
    <div className="stack">
      {list.map((f, i) => (
        <div key={i} className="row" style={{ flexWrap: 'nowrap', gap: 8 }}>
          <input className="input" style={{ maxWidth: 240 }} value={f.name} onChange={(e) => set(i, 'name', e.target.value)} placeholder="ชื่อเอกสาร เช่น เฉลยแบบฝึกหัด บทที่ 1" />
          <input className="input" value={f.url} onChange={(e) => set(i, 'url', e.target.value)} placeholder="https://drive.google.com/..." readOnly={f.url.startsWith('/api/blob/')} />
          <button type="button" className="icon-btn" onClick={() => onChange(list.filter((_, j) => j !== i))} title="ลบ"><Icon name="trash" size={18} /></button>
        </div>
      ))}
      {list.length < max ? (
        <div className="row">
          <button type="button" className="btn sm ghost" onClick={() => onChange([...list, { name: '', url: '' }])}><Icon name="link" size={16} /> เพิ่มลิงก์เอกสาร</button>
          <button type="button" className="btn sm ghost" onClick={() => ref.current?.click()} disabled={busy}><Icon name="plus" size={16} /> {busy ? 'กำลังอัปโหลด...' : 'อัปโหลด PDF (≤ 3 MB)'}</button>
          <input ref={ref} type="file" accept="application/pdf,.pdf" hidden onChange={pick} />
        </div>
      ) : null}
      {err ? <div className="alert err">{err}</div> : null}
    </div>
  );
}
