import Link from 'next/link';
export default function NotFound() {
  return (
    <section className="section"><div className="container center stack">
      <h1>ไม่พบหน้านี้</h1>
      <p className="muted">ข้อมูลอาจถูกลบหรือย้ายไปแล้ว</p>
      <div><Link href="/" className="btn">กลับหน้าแรก</Link></div>
    </div></section>
  );
}
