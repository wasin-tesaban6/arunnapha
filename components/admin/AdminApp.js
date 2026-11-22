'use client';
import { useEffect, useState } from 'react';
import { api } from '@/lib/client';
import Icon from '../Icon';
import { useList, Toaster, logout } from '../portal/ui';
import Settings from './Settings';
import Members from './Members';
import Works from './Works';
import Events from './Events';
import Questions from './Questions';
import Issues from './Issues';
import Market from './Market';
import QRTool from './QRTool';
import System from './System';
import { ISSUE_STATUS, thDateTime } from '@/lib/constants';

const TABS = [
  ['dash', 'แดชบอร์ด', 'home'],
  ['settings', 'ตั้งค่าเว็บไซต์ & นโยบาย', 'settings'],
  ['members', 'สมาชิก & บัญชีผู้ใช้', 'users'],
  ['works', 'ผลงาน', 'award'],
  ['events', 'ปฏิทินกิจกรรม', 'calendar'],
  ['questions', 'ถาม-ตอบ', 'chat'],
  ['issues', 'แจ้งปัญหา', 'flag'],
  ['market', 'ตลาดนัด', 'shop'],
  ['qr', 'QR Code', 'qr'],
  ['system', 'ระบบ & รหัสผ่าน', 'lock'],
];

export default function AdminApp({ logo, lineOA, name }) {
  const [tab, setTab] = useState('dash');
  const [health, setHealth] = useState(null);
  useEffect(() => { if (tab === 'dash') api('/api/admin/status').then(setHealth).catch(() => {}); }, [tab]);
  const members = useList('/api/admin/members');
  const works = useList('/api/admin/works');
  const events = useList('/api/admin/events');
  const questions = useList('/api/admin/questions');
  const issues = useList('/api/admin/issues');
  const market = useList('/api/admin/market');

  const counts = {
    questions: questions.items?.filter((q) => !q.answer && !q.hidden).length || 0,
    issues: issues.items?.filter((i) => i.status === 'received').length || 0,
    market: market.items?.filter((x) => x.status === 'pending').length || 0,
  };

  return (
    <div className="portal">
      <aside>
        <div className="brand"><img src={logo} alt="" style={{ width: 44, height: 44, background: '#fff', borderRadius: '50%', padding: 3 }} />
          <div><div className="t1" style={{ fontSize: 22 }}>ผู้ดูแลระบบ</div><div className="t2">CRMS6 | อรุณนภา</div></div></div>
        {TABS.map(([k, t, ic]) => (
          <button key={k} className={`tab ${tab === k ? 'on' : ''}`} onClick={() => { setTab(k); window.scrollTo({ top: 0 }); }}>
            <span className="row" style={{ gap: 10 }}><Icon name={ic} size={20} /> {t}</span>
            {counts[k] ? <span className="cnt">{counts[k]}</span> : null}
          </button>
        ))}
        <div className="spacer" style={{ flex: 1 }} />
        <a className="tab" href="/" target="_blank" rel="noopener" style={{ color: '#cfe0fb', padding: '9px 14px' }}>↗ ดูหน้าเว็บไซต์</a>
        <button className="tab" onClick={logout}><span className="row" style={{ gap: 10 }}><Icon name="logout" size={20} /> ออกจากระบบ</span></button>
      </aside>
      <main>
        {tab === 'dash' ? (
          <div className="stack">
            <div className="top"><div><h2 style={{ margin: 0 }}>สวัสดี, {name} 👋</h2><div className="muted">ภาพรวมเว็บไซต์สภานักเรียน</div></div></div>
            {health?.defaultPassword ? (
              <div className="alert err row between"><span><b>⚠️ ยังใช้รหัสผ่านแอดมินเริ่มต้นอยู่</b> — ใครเห็นโค้ดก็เข้าระบบได้ กรุณาเปลี่ยนทันที</span><button className="btn sm" onClick={() => setTab('system')}>เปลี่ยนรหัสผ่าน</button></div>
            ) : null}
            {health && (health.storage !== 'redis' || !health.dbOk) ? (
              <div className="alert warn row between"><span><b>⚠️ ฐานข้อมูลยังไม่พร้อม</b> — ข้อมูลที่แก้ไขอาจไม่ถูกบันทึกถาวร</span><button className="btn sm" onClick={() => setTab('system')}>ดูรายละเอียด</button></div>
            ) : null}
            <div className="grid kpis">
              {[
                ['สมาชิกพรรค', members.items?.length, 'members'],
                ['ผลงาน', works.items?.length, 'works'],
                ['กิจกรรม', events.items?.length, 'events'],
                ['คำถามรอตอบ', counts.questions, 'questions'],
                ['เรื่องใหม่รอรับ', counts.issues, 'issues'],
                ['ประกาศรออนุมัติ', counts.market, 'market'],
              ].map(([l, v, k]) => (
                <button key={k} className="card hover kpi" style={{ textAlign: 'left', cursor: 'pointer' }} onClick={() => setTab(k)}>
                  <div className="v">{v ?? '…'}</div><div className="l">{l}</div>
                </button>
              ))}
            </div>
            <div className="card pad">
              <h3 style={{ fontSize: 26 }}>เรื่องแจ้งปัญหาล่าสุด</h3>
              {(issues.items || []).slice(0, 6).map((i) => (
                <div key={i.id} className="row between" style={{ padding: '6px 0', borderBottom: '1px solid var(--line)' }}>
                  <span><b>{i.code}</b> · {i.category} · <span className="muted">{i.detail.slice(0, 60)}</span></span>
                  <span className="row" style={{ gap: 8 }}><span className="xs muted">{thDateTime(i.createdAt)}</span><span className="badge" style={{ background: ISSUE_STATUS[i.status]?.color, color: '#fff' }}>{ISSUE_STATUS[i.status]?.label}</span></span>
                </div>
              ))}
              {issues.items && !issues.items.length ? <div className="muted">ยังไม่มีเรื่องแจ้ง</div> : null}
            </div>
            <div className="alert info small">
              💡 <b>เริ่มต้นใช้งาน:</b> (1) ตั้งค่าเว็บไซต์ & อัปโหลดโลโก้ (2) แก้ไขข้อมูลสมาชิก และสร้างบัญชีให้แต่ละคนเข้าระบบที่ <b>/scmember</b> (3) เพิ่มกิจกรรมในปฏิทิน (4) พิมพ์ QR Code ไปติดในโรงเรียน
            </div>
          </div>
        ) : null}
        {tab === 'settings' ? <Settings /> : null}
        {tab === 'members' ? <Members list={members} /> : null}
        {tab === 'works' ? <Works list={works} members={members.items} /> : null}
        {tab === 'events' ? <Events list={events} /> : null}
        {tab === 'questions' ? <Questions list={questions} events={events.items} /> : null}
        {tab === 'issues' ? <Issues list={issues} /> : null}
        {tab === 'market' ? <Market list={market} /> : null}
        {tab === 'qr' ? <QRTool lineOA={lineOA} /> : null}
        {tab === 'system' ? <System /> : null}
      </main>
      <Toaster />
    </div>
  );
}
