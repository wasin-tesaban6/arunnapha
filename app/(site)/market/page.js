import Link from 'next/link';
import { PageHero } from '@/components/Cards';
import MarketBrowser from '@/components/MarketBrowser';
import { getMarket, getSettings } from '@/lib/data';

export const revalidate = 60;
export const metadata = { title: 'ตลาดนัดออนไลน์' };

export default async function MarketPage() {
  const [items, s] = await Promise.all([getMarket(), getSettings()]);
  const slim = items.map((p) => ({ ...p, images: p.images?.slice(0, 1) || [], description: (p.description || '').slice(0, 200) }));
  return (
    <>
      <PageHero title="ตลาดนัดออนไลน์ CRMS6" sub="ส่งเสริมการขาย สร้างรายได้ให้แก่นักเรียน — ฝากขายสินค้าบนเว็บสภา นัดรับในโรงเรียน" />
      <section className="section">
        <div className="container">
          <div className="cta" style={{ marginBottom: 34, padding: 28 }}>
            <div>
              <h2 style={{ fontSize: 34 }}>อยากขายของ? ฝากขายกับสภาได้เลย</h2>
              <p>ส่งประกาศ → สภาตรวจสอบ/อนุมัติ → แสดงบนเว็บ 30 วัน · จุดนัดรับ: {s.marketPickup || '–'}</p>
            </div>
            <div className="row" style={{ position: 'relative', zIndex: 1 }}>
              <Link href="/market/sell" className="btn gold">ฝากขายสินค้า</Link>
              <Link href="/market/rules" className="btn white">เงื่อนไข</Link>
              <Link href="/market/manage" className="btn white">จัดการประกาศ</Link>
            </div>
          </div>
          <MarketBrowser items={slim} />
        </div>
      </section>
    </>
  );
}
