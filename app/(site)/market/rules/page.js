import Link from 'next/link';
import { PageHero } from '@/components/Cards';
import { getSettings } from '@/lib/data';
export const revalidate = 60;
export const metadata = { title: 'เงื่อนไขการฝากขาย' };
export default async function RulesPage() {
  const s = await getSettings();
  return (
    <>
      <PageHero title="เงื่อนไขการฝากขาย" sub="ตลาดนัดออนไลน์ สภานักเรียน CRMS6" />
      <section className="section">
        <div className="container" style={{ maxWidth: 900 }}>
          <div className="card pad pre" style={{ fontSize: 22 }}>{s.marketRules}</div>
          <div className="row" style={{ marginTop: 20 }}><Link href="/market/sell" className="btn">ฝากขายสินค้า</Link><Link href="/market" className="btn ghost">กลับไปตลาด</Link></div>
        </div>
      </section>
    </>
  );
}
