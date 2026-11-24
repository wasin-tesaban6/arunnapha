'use client';
import { useEffect, useState } from 'react';
import Icon from '../Icon';
import ImageUpload from '../ImageUpload';
import { useSubmit, Loading, toast } from '../portal/ui';
import { api } from '@/lib/client';
import { TEXT_FIELDS, TEXT_DEFAULTS, FEATURE_DEFAULTS } from '@/lib/texts';

const GROUPS = [...new Set(TEXT_FIELDS.map((x) => x[3]))];

export default function Settings() {
  const [f, setF] = useState(null);
  useEffect(() => { api('/api/admin/settings').then((r) => setF(r.settings)).catch((x) => alert(x.message)); }, []);
  const { busy, err, onSubmit } = useSubmit(async () => { const r = await api('/api/admin/settings', f); setF(r.settings); toast('บันทึกการตั้งค่าแล้ว ✓'); });
  if (!f) return <Loading />;
  const set = (k) => (e) => setF((p) => ({ ...p, [k]: e?.target ? e.target.value : e }));
  const setC = (k) => (e) => setF((p) => ({ ...p, contact: { ...p.contact, [k]: e.target.value } }));
  const pol = f.policies || [];
  const setPol = (i, k, v) => setF((p) => ({ ...p, policies: pol.map((x, j) => (j === i ? { ...x, [k]: v } : x)) }));
  const setT = (k) => (e) => setF((p) => ({ ...p, texts: { ...p.texts, [k]: e.target.value } }));
  const setFeat = (i, k) => (e) => setF((p) => ({ ...p, features: (p.features || FEATURE_DEFAULTS).map((x, j) => (j === i ? { ...x, [k]: e.target.value } : x)) }));
  const movePol = (i, d) => { const a = [...pol]; const t = a[i]; a[i] = a[i + d]; a[i + d] = t; setF((p) => ({ ...p, policies: a })); };

  return (
    <form className="form" onSubmit={onSubmit}>
      <div className="top">
        <div><h2 style={{ margin: 0 }}>ตั้งค่าเว็บไซต์ & นโยบาย</h2><div className="muted small">ชื่อเว็บ โลโก้ สโลแกน นโยบาย ข้อมูลติดต่อ เงื่อนไขตลาด</div></div>
        <button className="btn" disabled={busy}>{busy ? 'กำลังบันทึก...' : 'บันทึกทั้งหมด'}</button>
      </div>
      {err ? <div className="alert err">{err}</div> : null}

      <div className="card pad form">
        <h3 style={{ margin: 0 }}>ข้อมูลหลัก</h3>
        <div className="two">
          <label className="f">Title เว็บไซต์<input className="input" value={f.siteTitle} onChange={set('siteTitle')} /></label>
          <label className="f">ชื่อพรรค<input className="input" value={f.partyName} onChange={set('partyName')} /></label>
          <label className="f">ชื่อองค์กร<input className="input" value={f.councilName} onChange={set('councilName')} /></label>
          <label className="f">ชื่อโรงเรียน<input className="input" value={f.schoolName} onChange={set('schoolName')} /></label>
          <label className="f">คำขวัญโรงเรียน<input className="input" value={f.schoolMotto} onChange={set('schoolMotto')} /></label>
          <label className="f">สโลแกนพรรค<input className="input" value={f.slogan} onChange={set('slogan')} /></label>
        </div>
        <label className="f">ประกาศด่วน (แถบด้านบนทุกหน้า · เว้นว่างเพื่อซ่อน)<input className="input" value={f.announcement} onChange={set('announcement')} /></label>
        <div className="f" style={{ fontWeight: 700, color: 'var(--navy-800)' }}>โลโก้สภา / พรรค <span className="hint">(แนะนำ PNG พื้นใส ระบบย่อขนาดอัตโนมัติ)</span>
          <div className="row">
            <ImageUpload value={f.logoUrl === '/logo.svg' ? '' : f.logoUrl} onChange={(v) => setF((p) => ({ ...p, logoUrl: v || '/logo.svg' }))} folder="brand" size={600} label="อัปโหลดโลโก้" />
            {f.logoUrl === '/logo.svg' ? <span className="xs muted">ตอนนี้ใช้โลโก้ชั่วคราว</span> : null}
          </div>
        </div>
      </div>

      <div className="card pad form">
        <div className="row between">
          <h3 style={{ margin: 0 }}>ข้อความบนเว็บไซต์</h3>
          <span className="xs muted">เว้นว่าง = ใช้ข้อความเริ่มต้น</span>
        </div>
        <div className="xs muted">แก้ไขหัวข้อและคำอธิบายต่าง ๆ บนหน้าเว็บ (กด “บันทึกทั้งหมด” เพื่อใช้งาน)</div>
        {GROUPS.map((g) => (
          <details key={g} className="card" style={{ padding: '10px 16px' }}>
            <summary style={{ cursor: 'pointer', fontWeight: 700, color: 'var(--navy-800)' }}>{g}</summary>
            <div className="form" style={{ marginTop: 10 }}>
              {TEXT_FIELDS.filter((x) => x[3] === g).map(([k, label, , , long]) => (
                <label className="f" key={k}>{label}
                  {long
                    ? <textarea className="textarea" style={{ minHeight: 70 }} value={f.texts?.[k] ?? ''} placeholder={TEXT_DEFAULTS[k]} onChange={setT(k)} />
                    : <input className="input" value={f.texts?.[k] ?? ''} placeholder={TEXT_DEFAULTS[k]} onChange={setT(k)} />}
                </label>
              ))}
            </div>
          </details>
        ))}
        <details className="card" style={{ padding: '10px 16px' }}>
          <summary style={{ cursor: 'pointer', fontWeight: 700, color: 'var(--navy-800)' }}>การ์ดนโยบาย 4 ข้อ (หน้าแรก)</summary>
          <div className="form" style={{ marginTop: 10 }}>
            {(f.features || FEATURE_DEFAULTS).map((x, i) => (
              <div key={i} className="card" style={{ padding: 12, display: 'grid', gap: 8 }}>
                <b>การ์ดที่ {i + 1} <span className="xs muted" style={{ fontWeight: 400 }}>(ลิงก์ไปหน้า {FEATURE_DEFAULTS[i].href})</span></b>
                <div className="two">
                  <label className="f">หัวข้อ<input className="input" value={x.title} placeholder={FEATURE_DEFAULTS[i].title} onChange={setFeat(i, 'title')} /></label>
                  <label className="f">หัวข้อรอง<input className="input" value={x.sub} placeholder={FEATURE_DEFAULTS[i].sub} onChange={setFeat(i, 'sub')} /></label>
                </div>
                <label className="f">คำอธิบาย<textarea className="textarea" style={{ minHeight: 70 }} value={x.text} placeholder={FEATURE_DEFAULTS[i].text} onChange={setFeat(i, 'text')} /></label>
                <label className="f">ข้อความลิงก์<input className="input" value={x.go} placeholder={FEATURE_DEFAULTS[i].go} onChange={setFeat(i, 'go')} /></label>
              </div>
            ))}
          </div>
        </details>
      </div>

      <div className="card pad form">
        <h3 style={{ margin: 0 }}>สไลด์โชว์หน้าแรก <span className="muted small" style={{ fontWeight: 400 }}>(สูงสุด 8 รูป)</span></h3>
        <div className="xs muted">รูปจะเลื่อนเปลี่ยนอัตโนมัติเป็นพื้นหลังส่วนบนของหน้าแรก · ใช้ปุ่ม ‹ › จัดลำดับ · ลบรูปทั้งหมด = ใช้พื้นหลังสีน้ำเงินแบบเดิม · แนะนำรูปแนวนอน</div>
        <ImageUpload multiple reorder wide max={8} value={f.heroSlides || []} onChange={(v) => setF((p) => ({ ...p, heroSlides: v }))} folder="hero" size={1920} label="เพิ่มรูปสไลด์" />
      </div>

      <div className="card pad form">
        <div className="row between"><h3 style={{ margin: 0 }}>นโยบายพรรค</h3>
          <button type="button" className="btn sm ghost" onClick={() => setF((p) => ({ ...p, policies: [...pol, { title: '', detail: '' }] }))}><Icon name="plus" size={16} /> เพิ่มนโยบาย</button></div>
        <label className="f">คำอธิบายพรรค / เกี่ยวกับเรา<textarea className="textarea" value={f.about} onChange={set('about')} /></label>
        {pol.map((p, i) => (
          <div key={i} className="card" style={{ padding: 12, display: 'grid', gap: 8 }}>
            <div className="row">
              <b>นโยบายที่ {i + 1}</b>
              <span style={{ marginLeft: 'auto' }} />
              <button type="button" className="icon-btn" disabled={!i} onClick={() => movePol(i, -1)}><Icon name="up" size={18} /></button>
              <button type="button" className="icon-btn" disabled={i === pol.length - 1} onClick={() => movePol(i, 1)}><Icon name="down" size={18} /></button>
              <button type="button" className="icon-btn" onClick={() => setF((x) => ({ ...x, policies: pol.filter((_, j) => j !== i) }))}><Icon name="trash" size={18} /></button>
            </div>
            <input className="input" value={p.title} onChange={(e) => setPol(i, 'title', e.target.value)} placeholder="หัวข้อนโยบาย" />
            <textarea className="textarea" style={{ minHeight: 70 }} value={p.detail} onChange={(e) => setPol(i, 'detail', e.target.value)} placeholder="รายละเอียด (ไม่บังคับ)" />
          </div>
        ))}
      </div>

      <div className="card pad form">
        <h3 style={{ margin: 0 }}>ช่องทางติดต่อ (แสดงที่ท้ายเว็บ)</h3>
        <div className="two">
          {[['facebook', 'Facebook (ลิงก์)'], ['instagram', 'Instagram (ลิงก์)'], ['tiktok', 'TikTok (ลิงก์)'], ['line', 'LINE OA / ลิงก์'], ['email', 'อีเมล']].map(([k, t]) => (
            <label className="f" key={k}>{t}<input className="input" value={f.contact?.[k] || ''} onChange={setC(k)} /></label>
          ))}
        </div>
      </div>

      <div className="card pad form">
        <h3 style={{ margin: 0 }}>แจ้งปัญหา</h3>
        <label className="f">หมวดปัญหา <span className="hint">(บรรทัดละ 1 หมวด)</span>
          <textarea className="textarea" value={(f.issueCategories || []).join('\n')} onChange={(e) => setF((p) => ({ ...p, issueCategories: e.target.value.split('\n') }))} /></label>
      </div>

      <div className="card pad form">
        <h3 style={{ margin: 0 }}>ตลาดนัดออนไลน์</h3>
        <label className="f">จุดนัดรับสินค้า<input className="input" value={f.marketPickup} onChange={set('marketPickup')} /></label>
        <label className="f">เงื่อนไขการฝากขาย<textarea className="textarea" style={{ minHeight: 300 }} value={f.marketRules} onChange={set('marketRules')} /></label>
      </div>
      <div className="row" style={{ justifyContent: 'flex-end' }}><button className="btn" disabled={busy}>{busy ? 'กำลังบันทึก...' : 'บันทึกทั้งหมด'}</button></div>
    </form>
  );
}
