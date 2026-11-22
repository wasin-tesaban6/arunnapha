'use client';
import { useState } from 'react';
import { api } from '@/lib/client';

export default function ManageListing() {
  const [code, setCode] = useState('');
  const [item, setItem] = useState(null);
  const [st, setSt] = useState({ busy: false, err: '', msg: '' });
  async function run(action) {
    if (action === 'delete' && !confirm('ยืนยันลบประกาศนี้?')) return;
    setSt({ busy: true, err: '', msg: '' });
    try {
      const r = await api('/api/public/market/manage', { code, action: action || 'check' });
      if (!action || action === 'check') setItem(r.item);
      else if (action === 'delete') { setItem(null); setSt({ busy: false, err: '', msg: 'ลบประกาศแล้ว' }); return; }
      else { const c = await api('/api/public/market/manage', { code, action: 'check' }); setItem(c.item); setSt({ busy: false, err: '', msg: action === 'sold' ? 'บันทึกว่า “ขายแล้ว” เรียบร้อย' : 'ต่ออายุประกาศอีก 30 วันแล้ว' }); return; }
    } catch (x) { setSt({ busy: false, err: x.message, msg: '' }); return; }
    setSt({ busy: false, err: '', msg: '' });
  }
  return (
    <div className="stack" style={{ maxWidth: 620, margin: '0 auto' }}>
      <form className="card pad form" onSubmit={(e) => { e.preventDefault(); run(); }}>
        <label className="f">รหัสจัดการประกาศ<input className="input" style={{ fontSize: 28, letterSpacing: 3, textTransform: 'uppercase' }} value={code} onChange={(e) => setCode(e.target.value)} placeholder="CRMS6MKXXXXXX" maxLength={20} required /></label>
        <button className="btn" disabled={st.busy}>ตรวจสอบ</button>
      </form>
      {st.err ? <div className="alert err">{st.err}</div> : null}
      {st.msg ? <div className="alert ok">{st.msg}</div> : null}
      {item ? (
        <div className="card pad stack">
          <div><b style={{ fontSize: 24 }}>{item.title}</b></div>
          <div>สถานะ: <span className="badge">{item.statusLabel}</span></div>
          {item.adminNote ? <div className="alert info">หมายเหตุจากสภา: {item.adminNote}</div> : null}
          <div className="row">
            {item.status === 'approved' ? <><button className="btn" onClick={() => run('sold')}>แจ้งว่าขายแล้ว</button><button className="btn ghost" onClick={() => run('renew')}>ต่ออายุ 30 วัน</button></> : null}
            <button className="btn danger" onClick={() => run('delete')}>ลบประกาศ</button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
