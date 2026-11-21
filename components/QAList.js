import { thDateTime } from '@/lib/constants';

export default function QAList({ questions }) {
  if (!questions.length) return <div className="muted small">ยังไม่มีคำถาม — เป็นคนแรกที่ถามได้เลย</div>;
  return (
    <div className="stack">
      {questions.map((q) => (
        <div key={q.id} className="card qa">
          <div className="meta">{q.name}{q.role ? ` · ${q.role}` : ''} · {thDateTime(q.createdAt)}</div>
          <div className="q">ถาม: {q.text}</div>
          {q.answer ? (
            <div className="a">
              <div className="pre"><b>ตอบ:</b> {q.answer}</div>
              <div className="meta">— {q.answeredBy || 'สภานักเรียน'}</div>
            </div>
          ) : <div className="meta" style={{ marginTop: 6 }}>⏳ รอการตอบกลับ</div>}
        </div>
      ))}
    </div>
  );
}
