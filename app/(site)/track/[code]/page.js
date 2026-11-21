import Link from 'next/link';
import TrackView from '@/components/TrackView';

export async function generateMetadata({ params }) {
  const { code } = await params;
  return { title: `ติดตามเรื่อง ${String(code).toUpperCase()}`, robots: { index: false } };
}

export default async function TrackCodePage({ params }) {
  const { code } = await params;
  const c = String(code).toUpperCase().replace(/[^A-Z0-9]/g, '');
  return (
    <>
      <section className="page-hero">
        <div className="container">
          <div className="crumb"><Link href="/track">ติดตามเรื่อง</Link> / {c}</div>
          <h1>สถานะเรื่องที่แจ้ง</h1>
          <p>หน้านี้อัปเดตอัตโนมัติทุก 5 วินาที</p>
        </div>
      </section>
      <section className="section"><div className="container"><TrackView code={c} /></div></section>
    </>
  );
}
