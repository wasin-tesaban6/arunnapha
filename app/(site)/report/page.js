import { PageHero } from '@/components/Cards';
import Icon from '@/components/Icon';
import { getSettings, getReportStats } from '@/lib/data';

export const revalidate = 60;
export const metadata = { title: 'แจ้งปัญหา' };

export default async function ReportPage() {
  const s = await getSettings();
  const stats = await getReportStats(s);
  const t = s.texts;
  const steps = String(t.reportSteps || '').split('\n').map((x) => x.trim()).filter(Boolean);
  return (
    <>
      <PageHero title={t.reportTitle} sub={t.reportSub} />
      <section className="section">
        <div className="container stack">
          <div className="grid stats" style={{ maxWidth: 820, margin: '0 auto 10px', gridTemplateColumns: 'repeat(3, 1fr)' }}>
            <div className="card stat"><div className="v">{stats.total}</div><div className="l">แจ้งทั้งหมด</div></div>
            <div className="card stat"><div className="v" style={{ color: '#64748b' }}>{stats.received}</div><div className="l">รับเรื่อง</div></div>
            <div className="card stat"><div className="v" style={{ color: 'var(--ok)' }}>{stats.done}</div><div className="l">เสร็จสิ้น</div></div>
          </div>

          <div className="card pad center stack" style={{ maxWidth: 820, margin: '0 auto', width: '100%' }}>
            <h2 style={{ margin: 0, fontSize: 34 }}>{t.reportScanTitle}</h2>
            <p className="muted pre" style={{ margin: 0 }}>{t.reportScanText}</p>
            {s.reportLineQr ? (
              <img src={s.reportLineQr} alt="QR Code Traffy Fondue สำหรับแจ้งปัญหา" className="line-qr" />
            ) : (
              <div className="empty" style={{ maxWidth: 360, margin: '0 auto' }}>กำลังเตรียม QR Code Traffy Fondue</div>
            )}
            {s.reportLineUrl ? (
              <div><a href={s.reportLineUrl} className="btn traffy-btn" target="_blank" rel="noopener"><Icon name="qr" size={22} /> แจ้งปัญหาผ่าน Traffy Fondue</a></div>
            ) : null}
            {s.reportLineUrl ? <div className="xs muted">เปิดเว็บนี้บนมือถืออยู่? กดปุ่มด้านบนได้เลย ไม่ต้องสแกน</div> : null}
          </div>

          {steps.length ? (
            <div className="card pad" style={{ maxWidth: 820, margin: '20px auto 0', width: '100%' }}>
              <h3 style={{ fontSize: 26 }}>ขั้นตอนการทำงาน</h3>
              <ol style={{ margin: 0, paddingLeft: 24 }}>{steps.map((x, i) => <li key={i}>{x}</li>)}</ol>
            </div>
          ) : null}
        </div>
      </section>
    </>
  );
}
