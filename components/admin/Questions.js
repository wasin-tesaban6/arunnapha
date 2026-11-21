'use client';
import { useState } from 'react';
import { Loading, toast } from '../portal/ui';
import { thDateTime } from '@/lib/constants';

export function QuestionRow({ q, eventTitle, onAnswer, onHide, onDelete }) {
  const [a, setA] = useState(q.answer || '');
  const [busy, setBusy] = useState(false);
  const run = async () => { setBusy(true); try { await onAnswer(q, a); } catch (x) { alert(x.message); } setBusy(false); };
  return (
    <div className="card qa">
      <div className="row between">
        <div className="meta">📌 {eventTitle} · {q.name}{q.role ? ` (${q.role})` : ''} · {thDateTime(q.createdAt)}</div>
        <div className="row" style={{ gap: 6 }}>
          {q.answer ? <span className="badge" style={{ background: '#dcfce7', color: '#166534' }}>ตอบแล้ว</span> : <span className="badge gold">รอตอบ</span>}
          {q.hidden ? <span className="badge">ซ่อนอยู่</span> : null}
        </div>
      </div>
      <div className="q" style={{ margin: '4px 0 8px' }}>{q.text}</div>
      <textarea className="textarea" style={{ minHeight: 70 }} value={a} onChange={(e) => setA(e.target.value)} placeholder="พิมพ์คำตอบ..." />
      <div className="row" style={{ marginTop: 8, justifyContent: 'flex-end' }}>
        {q.answeredBy ? <span className="xs muted" style={{ marginRight: 'auto' }}>ตอบโดย {q.answeredBy}</span> : null}
        {onHide ? <button className="btn sm ghost" onClick={() => onHide(q)}>{q.hidden ? 'แสดง' : 'ซ่อน'}</button> : null}
        {onDelete ? <button className="btn sm danger" onClick={() => onDelete(q)}>ลบ</button> : null}
        <button className="btn sm" onClick={run} disabled={busy}>{busy ? '...' : 'บันทึกคำตอบ'}</button>
      </div>
    </div>
  );
}

export default function Questions({ list, events }) {
  const { items, save, remove } = list;
  const [filter, setFilter] = useState('pending');
  if (!items) return <Loading />;
  const ev = Object.fromEntries((events || []).map((e) => [e.id, e.title]));
  const shown = items.filter((q) => filter === 'all' || (filter === 'pending' ? !q.answer : Boolean(q.answer)));
  return (
    <>
      <div className="top">
        <div><h2 style={{ margin: 0 }}>ถาม-ตอบ</h2><div className="muted small">คำถามจากนักเรียน ครู และบุคลากร เกี่ยวกับกิจกรรมต่าง ๆ</div></div>
        <div className="filters" style={{ margin: 0 }}>
          {[['pending', `รอตอบ (${items.filter((q) => !q.answer).length})`], ['answered', 'ตอบแล้ว'], ['all', 'ทั้งหมด']].map(([k, t]) => <button key={k} className={`chip ${filter === k ? 'on' : ''}`} onClick={() => setFilter(k)}>{t}</button>)}
        </div>
      </div>
      <div className="stack">
        {shown.map((q) => (
          <QuestionRow key={q.id + (q.answeredAt || '')} q={q} eventTitle={ev[q.eventId] || 'คำถามทั่วไป'}
            onAnswer={(x, answer) => save({ ...x, answer, answeredBy: '' })}
            onHide={(x) => save({ ...x, hidden: !x.hidden }).then(() => toast(x.hidden ? 'แสดงแล้ว' : 'ซ่อนแล้ว'))}
            onDelete={(x) => remove(x.id, 'คำถามนี้')} />
        ))}
        {!shown.length ? <div className="empty">ไม่มีคำถามในหมวดนี้</div> : null}
      </div>
    </>
  );
}
