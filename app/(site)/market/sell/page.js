import { PageHero } from '@/components/Cards';
import SellForm from '@/components/SellForm';
import { getSettings } from '@/lib/data';
export const revalidate = 60;
export const metadata = { title: 'ฝากขายสินค้า' };
export default async function SellPage() {
  const s = await getSettings();
  return (
    <>
      <PageHero title="ฝากขายสินค้า" sub="กรอกข้อมูลให้ครบ สภานักเรียนจะตรวจสอบและอนุมัติก่อนแสดงบนเว็บ" />
      <section className="section"><div className="container"><SellForm rules={s.marketRules} /></div></section>
    </>
  );
}
