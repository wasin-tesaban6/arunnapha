import Link from 'next/link';
export default function NotFound() {
  return (
    <div className="login-wrap"><div className="card login-card stack">
      <img src="/logo.svg" alt="" />
      <h2>ไม่พบหน้านี้</h2>
      <div><Link href="/" className="btn">กลับหน้าแรก</Link></div>
    </div></div>
  );
}
