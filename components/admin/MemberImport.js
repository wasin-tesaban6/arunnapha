'use client';
import { useMemo, useRef, useState } from 'react';
import Icon from '../Icon';
import { Modal } from '../portal/ui';
import { api } from '@/lib/client';
import { parseTable, readTextFile, downloadCSV } from '@/lib/csv';
import { POSITION_SUGGESTIONS } from '@/lib/seed';

// คอลัมน์ที่รองรับ + หัวตารางที่ยอมรับ (ไทย/อังกฤษ)
const COLS = [
  { key: 'name', label: 'ชื่อ-นามสกุล', alias: ['ชื่อ-นามสกุล', 'ชื่อนามสกุล', 'ชื่อ - นามสกุล', 'ชื่อ', 'name', 'fullname', 'full name'] },
  { key: 'nickname', label: 'ชื่อเล่น', alias: ['ชื่อเล่น', 'nickname', 'nick'] },
  { key: 'position', label: 'ตำแหน่ง', alias: ['ตำแหน่ง', 'ยศ', 'ฝ่าย', 'position', 'role'] },
  { key: 'classroom', label: 'ชั้น', alias: ['ชั้น', 'ห้อง', 'ชั้น/ห้อง', 'class', 'classroom'] },
  { key: 'order', label: 'ลำดับ', alias: ['ลำดับ', 'ลำดับแสดง', 'order', 'no', 'ที่'] },
  { key: 'quote', label: 'คำคม', alias: ['คำคม', 'คำคมสั้นๆ', 'คำคมสั้น ๆ', 'quote'] },
  { key: 'bio', label: 'ประวัติ', alias: ['ประวัติ', 'ประวัติส่วนตัว', 'bio'] },
  { key: 'contact', label: 'ช่องทางติดต่อ', alias: ['ช่องทางติดต่อ', 'ติดต่อ', 'contact'] },
  { key: 'username', label: 'ชื่อผู้ใช้', alias: ['ชื่อผู้ใช้', 'username', 'user', 'ยูสเซอร์'] },
  { key: 'password', label: 'รหัสผ่าน', alias: ['รหัสผ่าน', 'password', 'pass'] },
];
const EDIT_COLS = ['name', 'nickname', 'position', 'classroom', 'username', 'password'];
const norm = (s) => String(s || '').toLowerCase().replace(/\s+/g, '').replace(/[-_/]/g, '');
const blank = () => Object.fromEntries(COLS.map((c) => [c.key, '']));

function rowsFromTable(table) {
  if (!table.length) return [];
  const head = table[0].map(norm);
  const map = head.map((h) => COLS.find((c) => c.alias.some((a) => norm(a) === h))?.key || null);
  const hasHeader = map.filter(Boolean).length >= 1;
  // ไม่มีหัวตาราง → ใช้ลำดับคอลัมน์ตามแม่แบบ
  const keys = hasHeader ? map : COLS.map((c) => c.key);
  const body = hasHeader ? table.slice(1) : table;
  return body.map((r) => {
    const o = blank();
    keys.forEach((k, i) => { if (k && r[i] !== undefined) o[k] = r[i]; });
    return o;
  }).slice(0, 500);
}

export default function MemberImport({ existing, onClose, onDone }) {
  const [step, setStep] = useState('input'); // input | preview | done
  const [text, setText] = useState('');
  const [rows, setRows] = useState([]);
  const [autoPassword, setAutoPassword] = useState(true);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [progress, setProgress] = useState('');
  const [results, setResults] = useState([]);
  const fileRef = useRef();

  const existingUsers = useMemo(() => new Map((existing || []).filter((m) => m.username).map((m) => [m.username.toLowerCase(), m])), [existing]);

  const checks = useMemo(() => {
    const seen = new Map();
    rows.forEach((r, i) => { const u = r.username.trim().toLowerCase(); if (u) seen.set(u, (seen.get(u) || []).concat(i)); });
    return rows.map((r) => {
      const u = r.username.trim().toLowerCase();
      const errors = [];
      const upd = u && existingUsers.has(u);
      if (!upd && !r.name.trim()) errors.push('ไม่มีชื่อ');
      if (u && !/^[a-z0-9._-]{3,40}$/.test(u)) errors.push('ชื่อผู้ใช้ไม่ถูกต้อง');
      if (u && seen.get(u)?.length > 1) errors.push('ชื่อผู้ใช้ซ้ำในไฟล์');
      if (r.password && r.password.trim().length < 6) errors.push('รหัสผ่าน < 6 ตัว');
      return { errors, mode: upd ? 'update' : 'create' };
    });
  }, [rows, existingUsers]);
  const okCount = checks.filter((c) => !c.errors.length).length;

  async function readFile(e) {
    const f = e.target.files?.[0];
    e.target.value = '';
    if (!f) return;
    if (/\.xlsx?$/i.test(f.name)) { setErr('กรุณาบันทึกไฟล์ Excel เป็น "CSV UTF-8 (Comma delimited)" ก่อน หรือคัดลอกตารางมาวางในช่องด้านล่าง'); return; }
    try { const t = await readTextFile(f); setText(t); parse(t); } catch { setErr('อ่านไฟล์ไม่ได้'); }
  }
  function parse(t = text) {
    setErr('');
    const r = rowsFromTable(parseTable(t));
    if (!r.length) { setErr('ไม่พบข้อมูล — ตรวจสอบว่ามีหัวตารางหรือข้อมูลอย่างน้อย 1 แถว'); return; }
    setRows(r); setStep('preview');
  }
  const setCell = (i, k, v) => setRows((rs) => rs.map((r, j) => (j === i ? { ...r, [k]: v } : r)));

  async function doImport() {
    const valid = rows.map((r, i) => ({ r, i })).filter(({ i }) => !checks[i].errors.length);
    if (!valid.length) return;
    setBusy(true); setErr('');
    const out = [];
    try {
      for (let s = 0; s < valid.length; s += 50) {
        setProgress(`กำลังนำเข้า ${Math.min(s + 50, valid.length)} / ${valid.length} ...`);
        const chunk = valid.slice(s, s + 50);
        const res = await api('/api/admin/import-members', { rows: chunk.map((x) => x.r), autoPassword });
        res.results.forEach((x, k) => out.push({ ...x, password: chunk[k].r.password.trim() || x.generatedPassword || '' }));
      }
      setResults(out); setStep('done'); onDone?.();
    } catch (x) { setErr(x.message); }
    setBusy(false); setProgress('');
  }

  const template = () => downloadCSV('แม่แบบนำเข้าสมาชิก.csv', [
    COLS.map((c) => c.label),
    ['นายตัวอย่าง ใจดี', 'ต้น', 'ประธานสภานักเรียน', 'ม.6/1', '1', 'ทำดีเพื่อทุกคน', '', 'IG: example', 'president', ''],
    ['นางสาวสมมติ เรียนดี', 'มิ้นท์', 'ฝ่ายวิชาการ', 'ม.5/2', '2', '', '', '', 'academic01', 'mint2569'],
  ]);
  const credentials = () => downloadCSV(`บัญชีสมาชิก-${new Date().toISOString().slice(0, 10)}.csv`, [
    ['ชื่อ-นามสกุล', 'ชื่อผู้ใช้', 'รหัสผ่าน', 'สถานะ', 'เข้าระบบที่'],
    ...results.filter((r) => r.status !== 'error' && r.username).map((r) => [r.name, r.username, r.password || '(ใช้รหัสเดิม)', r.status === 'created' ? 'สร้างใหม่' : 'อัปเดต', `${window.location.origin}/scmember`]),
  ]);

  return (
    <Modal title="เพิ่มสมาชิกหลายคน / นำเข้า CSV" onClose={busy ? () => {} : onClose} wide>
      {step === 'input' ? (
        <div className="form">
          <div className="alert info small">
            ใช้ได้ 3 วิธี: <b>(1)</b> อัปโหลดไฟล์ CSV <b>(2)</b> คัดลอกตารางจาก Excel / Google Sheets มาวาง <b>(3)</b> กรอกเองทีละแถว
            <br />ถ้า <b>ชื่อผู้ใช้</b> ตรงกับสมาชิกที่มีอยู่ → อัปเดตข้อมูลคนนั้น (เช่น ใช้สร้างบัญชี/รีเซ็ตรหัสผ่านทีละหลายคน) · ไม่ตรง → เพิ่มสมาชิกใหม่
          </div>
          <div className="row">
            <button type="button" className="btn ghost" onClick={template}><Icon name="down" size={18} /> ดาวน์โหลดแม่แบบ CSV</button>
            <button type="button" className="btn" onClick={() => fileRef.current?.click()}><Icon name="plus" size={18} /> เลือกไฟล์ CSV</button>
            <button type="button" className="btn ghost" onClick={() => { setRows([blank(), blank(), blank()]); setStep('preview'); }}><Icon name="edit" size={18} /> กรอกเองหลายแถว</button>
            <input ref={fileRef} type="file" accept=".csv,.tsv,.txt,text/csv" hidden onChange={readFile} />
          </div>
          <label className="f">หรือวางข้อมูลตารางที่นี่ <span className="hint">(แถวแรกเป็นหัวตาราง เช่น ชื่อ-นามสกุล, ตำแหน่ง, ชั้น, ชื่อผู้ใช้, รหัสผ่าน)</span>
            <textarea className="textarea" style={{ minHeight: 180, fontFamily: 'inherit' }} value={text} onChange={(e) => setText(e.target.value)}
              placeholder={'ชื่อ-นามสกุล\tตำแหน่ง\tชั้น\tชื่อผู้ใช้\tรหัสผ่าน\nนายตัวอย่าง ใจดี\tประธานสภานักเรียน\tม.6/1\tpresident\t'} />
          </label>
          {err ? <div className="alert err">{err}</div> : null}
          <div className="row" style={{ justifyContent: 'flex-end' }}>
            <button type="button" className="btn ghost" onClick={onClose}>ยกเลิก</button>
            <button type="button" className="btn" onClick={() => parse()} disabled={!text.trim()}>อ่านข้อมูล →</button>
          </div>
        </div>
      ) : null}

      {step === 'preview' ? (
        <div className="form">
          <div className="row between">
            <div className="small">ทั้งหมด <b>{rows.length}</b> แถว · พร้อมนำเข้า <b style={{ color: 'var(--ok)' }}>{okCount}</b>{rows.length - okCount ? <> · มีปัญหา <b style={{ color: 'var(--danger)' }}>{rows.length - okCount}</b> (จะข้ามไป)</> : null}</div>
            <button type="button" className="btn sm ghost" onClick={() => setRows((r) => [...r, blank()])}><Icon name="plus" size={16} /> เพิ่มแถว</button>
          </div>
          <datalist id="imp-pos">{POSITION_SUGGESTIONS.map((p) => <option key={p} value={p} />)}</datalist>
          <div className="table-wrap" style={{ maxHeight: '52vh', overflow: 'auto' }}>
            <table className="t" style={{ fontSize: 17 }}>
              <thead><tr><th>#</th>{EDIT_COLS.map((k) => <th key={k}>{COLS.find((c) => c.key === k).label}</th>)}<th>ผล</th><th></th></tr></thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={i} style={checks[i].errors.length ? { background: '#fef2f2' } : null}>
                    <td>{i + 1}</td>
                    {EDIT_COLS.map((k) => (
                      <td key={k} style={{ padding: 4 }}>
                        <input className="input" style={{ padding: '3px 8px', fontSize: 17, minWidth: k === 'name' || k === 'position' ? 170 : 100 }}
                          value={r[k]} onChange={(e) => setCell(i, k, e.target.value)} list={k === 'position' ? 'imp-pos' : undefined}
                          placeholder={k === 'password' && r.username && autoPassword ? 'สุ่มให้' : ''} autoComplete="off" />
                      </td>
                    ))}
                    <td style={{ whiteSpace: 'nowrap' }}>
                      {checks[i].errors.length ? <span className="xs" style={{ color: 'var(--danger)' }}>{checks[i].errors.join(', ')}</span>
                        : checks[i].mode === 'update' ? <span className="badge gold">อัปเดต</span> : <span className="badge">ใหม่</span>}
                    </td>
                    <td><button type="button" className="icon-btn" onClick={() => setRows((rs) => rs.filter((_, j) => j !== i))} title="ลบแถว"><Icon name="trash" size={16} /></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <label className="check"><input type="checkbox" checked={autoPassword} onChange={(e) => setAutoPassword(e.target.checked)} /> สุ่มรหัสผ่านให้สมาชิกใหม่ที่มีชื่อผู้ใช้แต่ไม่ได้ใส่รหัสผ่าน</label>
          <div className="xs muted">ไม่ใส่ชื่อผู้ใช้ = เพิ่มเป็นสมาชิกบนหน้าเว็บอย่างเดียว (ยังไม่มีบัญชีเข้าระบบ) · คอลัมน์อื่นในไฟล์ (คำคม, ประวัติ, ช่องทางติดต่อ, ลำดับ) จะถูกนำเข้าด้วย</div>
          {err ? <div className="alert err">{err}</div> : null}
          <div className="row" style={{ justifyContent: 'flex-end' }}>
            <button type="button" className="btn ghost" onClick={() => setStep('input')} disabled={busy}>← กลับ</button>
            <button type="button" className="btn" onClick={doImport} disabled={busy || !okCount}>{busy ? progress || 'กำลังนำเข้า...' : `นำเข้า ${okCount} รายการ`}</button>
          </div>
        </div>
      ) : null}

      {step === 'done' ? (
        <div className="form">
          <div className="alert ok">
            นำเข้าเสร็จแล้ว: สร้างใหม่ <b>{results.filter((r) => r.status === 'created').length}</b> · อัปเดต <b>{results.filter((r) => r.status === 'updated').length}</b>
            {results.some((r) => r.status === 'error') ? <> · ไม่สำเร็จ <b>{results.filter((r) => r.status === 'error').length}</b></> : null}
          </div>
          {results.some((r) => r.username) ? (
            <div className="alert warn small">
              🔐 <b>ดาวน์โหลดรายชื่อบัญชีเก็บไว้ตอนนี้</b> — รหัสผ่านที่สุ่มจะแสดงเพียงครั้งเดียว (ระบบเก็บแบบเข้ารหัส ดูย้อนหลังไม่ได้)
              <div style={{ marginTop: 8 }}><button type="button" className="btn sm" onClick={credentials}><Icon name="down" size={16} /> ดาวน์โหลดบัญชีผู้ใช้ (CSV)</button></div>
            </div>
          ) : null}
          <div className="table-wrap" style={{ maxHeight: '45vh', overflow: 'auto' }}>
            <table className="t" style={{ fontSize: 17 }}>
              <thead><tr><th>ชื่อ</th><th>ชื่อผู้ใช้</th><th>รหัสผ่าน</th><th>ผล</th></tr></thead>
              <tbody>
                {results.map((r, i) => (
                  <tr key={i}>
                    <td>{r.name}</td><td>{r.username || '—'}</td>
                    <td style={{ fontFamily: 'monospace', fontSize: 16 }}>{r.status === 'error' ? '' : r.password || (r.username ? '(เดิม)' : '—')}</td>
                    <td>{r.status === 'error' ? <span className="xs" style={{ color: 'var(--danger)' }}>{r.error}</span> : r.status === 'created' ? <span className="badge">สร้างใหม่</span> : <span className="badge gold">อัปเดต</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="row" style={{ justifyContent: 'flex-end' }}><button type="button" className="btn" onClick={onClose}>เสร็จสิ้น</button></div>
        </div>
      ) : null}
    </Modal>
  );
}
