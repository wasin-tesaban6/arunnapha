'use client';
import ImageUpload from '../ImageUpload';
import { Modal, SaveBar, useForm, useSubmit } from './ui';
import { WORK_CATEGORIES, todayISO } from '@/lib/constants';

export default function WorkEditor({ item, members, onSave, onClose }) {
  const [f, set] = useForm({
    id: item?.id, memberId: item?.memberId || members?.[0]?.id || '', title: item?.title || '', category: item?.category || WORK_CATEGORIES[0],
    date: item?.date || todayISO(), description: item?.description || '', images: item?.images || [], link: item?.link || '', hidden: Boolean(item?.hidden),
  });
  const { busy, err, onSubmit } = useSubmit(async () => { await onSave(f); onClose(); });
  return (
    <Modal title={item?.id ? 'แก้ไขผลงาน' : 'เพิ่มผลงานใหม่'} onClose={onClose} wide>
      <form className="form" onSubmit={onSubmit}>
        {members ? (
          <label className="f">เจ้าของผลงาน (สมาชิก)
            <select className="select" value={f.memberId} onChange={set('memberId')}>
              <option value="">— ผลงานของสภา (ไม่ระบุบุคคล) —</option>
              {members.map((m) => <option key={m.id} value={m.id}>{m.name} — {m.position}</option>)}
            </select>
          </label>
        ) : null}
        <label className="f">ชื่อผลงาน *<input className="input" value={f.title} onChange={set('title')} required maxLength={200} /></label>
        <div className="two">
          <label className="f">ประเภท<select className="select" value={f.category} onChange={set('category')}>{WORK_CATEGORIES.map((c) => <option key={c}>{c}</option>)}</select></label>
          <label className="f">วันที่<input className="input" type="date" value={f.date} onChange={set('date')} /></label>
        </div>
        <label className="f">คำอธิบายผลงาน<textarea className="textarea" style={{ minHeight: 180 }} value={f.description} onChange={set('description')} maxLength={8000} placeholder="ที่มา วัตถุประสงค์ สิ่งที่ทำ ผลลัพธ์ ผู้ได้รับประโยชน์..." /></label>
        <div className="f" style={{ fontWeight: 700, color: 'var(--navy-800)' }}>รูปภาพ (สูงสุด 10 รูป · รูปแรกเป็นภาพปก)
          <ImageUpload multiple max={10} value={f.images} onChange={set('images')} folder="works" />
        </div>
        <label className="f">ลิงก์เพิ่มเติม <span className="hint">(เช่น Google Drive, YouTube, Facebook)</span><input className="input" type="url" value={f.link} onChange={set('link')} placeholder="https://..." /></label>
        <label className="check"><input type="checkbox" checked={f.hidden} onChange={set('hidden')} /> ซ่อนผลงานนี้จากหน้าเว็บ</label>
        <SaveBar busy={busy} err={err} onCancel={onClose} />
      </form>
    </Modal>
  );
}
