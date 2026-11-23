'use client';
import { useRef, useState } from 'react';
import { uploadImage } from '@/lib/client';

// value: string (single) หรือ array (multiple)
export default function ImageUpload({ value, onChange, multiple = false, max = 6, folder = 'misc', size = 1280, label = 'เพิ่มรูป', reorder = false, wide = false }) {
  const ref = useRef();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const list = multiple ? value || [] : value ? [value] : [];

  async function pick(e) {
    const files = Array.from(e.target.files || []).slice(0, multiple ? max - list.length : 1);
    e.target.value = '';
    if (!files.length) return;
    setBusy(true); setErr('');
    try {
      const urls = [];
      for (const f of files) urls.push(await uploadImage(f, folder, size));
      onChange(multiple ? [...list, ...urls].slice(0, max) : urls[0]);
    } catch (x) { setErr(x.message); }
    setBusy(false);
  }
  const remove = (i) => onChange(multiple ? list.filter((_, j) => j !== i) : '');
  const move = (i, d) => { const a = [...list]; [a[i], a[i + d]] = [a[i + d], a[i]]; onChange(a); };

  return (
    <div>
      <div className="uploader">
        {list.map((u, i) => (
          <div className="thumb" key={u.slice(-40) + i} style={wide ? { width: 192 } : null}>
            <img src={u} alt="" />
            <button type="button" onClick={() => remove(i)} aria-label="ลบรูป">×</button>
            {reorder ? <span className="order">{i + 1}</span> : null}
            {reorder && list.length > 1 ? (
              <span className="moves">
                <button type="button" disabled={!i} onClick={() => move(i, -1)} aria-label="เลื่อนไปก่อน">‹</button>
                <button type="button" disabled={i === list.length - 1} onClick={() => move(i, 1)} aria-label="เลื่อนไปหลัง">›</button>
              </span>
            ) : null}
          </div>
        ))}
        {(multiple ? list.length < max : true) ? (
          <button type="button" className="add" style={wide ? { width: 192 } : null} onClick={() => ref.current?.click()} disabled={busy}>
            {busy ? <span className="spinner" /> : <span>＋<br />{list.length && !multiple ? 'เปลี่ยนรูป' : label}</span>}
          </button>
        ) : null}
      </div>
      <input ref={ref} type="file" accept="image/*" multiple={multiple} hidden onChange={pick} />
      {err ? <div className="alert err" style={{ marginTop: 8 }}>{err}</div> : null}
    </div>
  );
}
