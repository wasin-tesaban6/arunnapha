import Link from 'next/link';
import { PageHero } from '@/components/Cards';
import ReportForm from '@/components/ReportForm';
import { getSettings, getIssueStats } from '@/lib/data';

export const revalidate = 60;
export const metadata = { title: 'แจ้งปัญหา' };

export default async function ReportPage() {
  const [s, stats] = await Promise.all([getSettings(), getIssueStats()]);
  return (
    <>
      <PageHero title="QR Code แจ้งปัญหา" sub="แจ้งปัญหาในโรงเรียน แล้วเช็คความคืบหน้าได้แบบ Real-Time ผ่านเว็บและแอปพลิเคชันไลน์" />
      <section className="section">
        <div className="container stack">
          <div className="grid stats" style={{ maxWidth: 820, margin: '0 auto 10px' }}>
            <div className="card stat"><div className="v">{stats.total}</div><div className="l">แจ้งทั้งหมด</div></div>
            <div className="card stat"><div className="v" style={{ color: '#64748b' }}>{stats.received}</div><div className="l">รับเรื่อง</div></div>
            <div className="card stat"><div className="v" style={{ color: 'var(--sky-500)' }}>{stats.reviewing + stats.in_progress}</div><div className="l">กำลังดำเนินการ</div></div>
            <div className="card stat"><div className="v" style={{ color: 'var(--ok)' }}>{stats.done}</div><div className="l">เสร็จสิ้น</div></div>
          </div>
          <div className="center"><Link href="/track" className="btn ghost sm">มีรหัสเรื่องแล้ว? ติดตามความคืบหน้า →</Link></div>
          <ReportForm categories={s.issueCategories} />
          <div className="card pad" style={{ maxWidth: 820, margin: '20px auto 0' }}>
            <h3 style={{ fontSize: 26 }}>ขั้นตอนการทำงาน</h3>
            <ol style={{ margin: 0, paddingLeft: 24 }}>
              <li>สแกน QR Code ที่ติดตามจุดต่าง ๆ หรือเข้าหน้านี้โดยตรง แล้วกรอกรายละเอียด</li>
              <li>รับ <b>รหัสเรื่อง</b> (เช่น CR7K2QXA) สำหรับติดตาม</li>
              <li>กด “รับแจ้งเตือนทาง LINE” หรือพิมพ์รหัสเรื่องในแชต LINE ของสภา เพื่อรับความคืบหน้าอัตโนมัติ</li>
              <li>สภานักเรียนตรวจสอบ ประสานงานกับครู/ฝ่ายที่เกี่ยวข้อง และอัปเดตสถานะจนเสร็จสิ้น</li>
            </ol>
          </div>
        </div>
      </section>
    </>
  );
}
