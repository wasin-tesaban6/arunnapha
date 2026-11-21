'use client';
import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import Icon from './Icon';
import { ISSUE_STATUS, ISSUE_FLOW, thDateTime } from '@/lib/constants';
import { lineOA, lineFollowUrl, rememberIssue } from './ReportForm';

export default function TrackView({ code }) {
  const [issue, setIssue] = useState(null);
  const [err, setErr] = useState('');
  const [at, setAt] = useState(null);

  const load = useCallback(async () => {
    try {
      const r = await fetch(`/api/public/issues/${code}`, { cache: 'no-store' });
      const j = await r.json();
      if (!j.ok) { setErr(j.error || 'ไม่พบข้อมูล'); return; }
      setIssue(j.issue); setErr(''); setAt(new Date());
    } catch { /* offline: keep last data */ }
  }, [code]);

  useEffect(() => {
    load();
    const t = setInterval(() => { if (document.visibilityState === 'visible') load(); }, 5000);
    const v = () => document.visibilityState === 'visible' && load();
    document.addEventListener('visibilitychange', v);
    return () => { clearInterval(t); document.removeEventListener('visibilitychange', v); };
  }, [load]);
  useEffect(() => { if (issue) rememberIssue(issue.code); }, [issue]);

  if (err) return <div className="card pad center stack"><div className="alert err">{err}</div><div><Link href="/track" className="btn ghost">ค้นหาใหม่</Link></div></div>;
  if (!issue) return <div className="center" style={{ padding: 40 }}><span className="spinner" /></div>;

  const st = ISSUE_STATUS[issue.status] || ISSUE_STATUS.received;
  const rejected = issue.status === 'rejected';
  const idx = rejected ? 0 : ISSUE_FLOW.indexOf(issue.status);
  const pct = rejected ? 0 : (idx / (ISSUE_FLOW.length - 1)) * 84;

  return (
    <div className="stack" style={{ maxWidth: 860, margin: '0 auto' }}>
      <div className="card pad">
        <div className="row between">
          <div><div className="xs muted">รหัสเรื่อง</div><div className="code-big" style={{ fontSize: 34 }}>{issue.code}</div></div>
          <div style={{ textAlign: 'right' }}>
            <span className="badge" style={{ background: st.color, color: '#fff', fontSize: 20, padding: '4px 16px' }}>{st.label}</span>
            <div className="live" style={{ marginTop: 8 }}>อัปเดตอัตโนมัติ{at ? ` · ${at.toLocaleTimeString('th-TH')}` : ''}</div>
          </div>
        </div>
        {!rejected ? (
          <div className="steps">
            <div className="bar" style={{ width: `${pct}%` }} />
            {ISSUE_FLOW.map((k, i) => (
              <div key={k} className={`s ${i <= idx ? 'on' : ''}`}><div className="c">{i < idx || issue.status === 'done' ? '✓' : i + 1}</div>{ISSUE_STATUS[k].label}</div>
            ))}
          </div>
        ) : <div className="alert err" style={{ marginTop: 14 }}>เรื่องนี้ไม่สามารถดำเนินการได้ — ดูเหตุผลในไทม์ไลน์ด้านล่าง</div>}
      </div>
      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
        <div className="card pad">
          <h3 style={{ fontSize: 24 }}>รายละเอียด</h3>
          <div className="small"><b>หมวด:</b> {issue.category}</div>
          <div className="small"><b>สถานที่:</b> {issue.location || '-'}</div>
          <div className="small"><b>แจ้งเมื่อ:</b> {thDateTime(issue.createdAt)}</div>
          <p className="pre" style={{ marginTop: 10 }}>{issue.detail}</p>
          {issue.photo ? <img src={issue.photo} alt="" style={{ borderRadius: 12, maxHeight: 300, objectFit: 'cover' }} /> : null}
        </div>
        <div className="card pad">
          <h3 style={{ fontSize: 24 }}>ไทม์ไลน์</h3>
          <ul className="timeline">
            {[...issue.timeline].reverse().map((t, i) => (
              <li key={i}>
                <span className="pin" style={{ background: ISSUE_STATUS[t.status]?.color || '#94a3b8' }} />
                <div style={{ fontWeight: 700 }}>{ISSUE_STATUS[t.status]?.label}</div>
                {t.note ? <div className="small pre">{t.note}</div> : null}
                <div className="xs muted">{thDateTime(t.at)}</div>
              </li>
            ))}
          </ul>
        </div>
      </div>
      {lineOA ? (
        <div className="card pad row between">
          <div><b>รับแจ้งเตือนอัตโนมัติผ่าน LINE</b><div className="xs muted">กดแล้วส่งข้อความในแชต ระบบจะแจ้งทุกครั้งที่สถานะเปลี่ยน</div></div>
          <a href={lineFollowUrl(issue.code)} className="btn line-btn" target="_blank" rel="noopener"><Icon name="line" size={20} /> ติดตามทาง LINE</a>
        </div>
      ) : null}
    </div>
  );
}
