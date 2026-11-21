import { PageHero } from '@/components/Cards';
import ManageListing from '@/components/ManageListing';
export const metadata = { title: 'จัดการประกาศฝากขาย' };
export default function ManagePage() {
  return (
    <>
      <PageHero title="จัดการประกาศฝากขาย" sub="ใช้รหัสจัดการประกาศที่ได้รับตอนส่งประกาศ" />
      <section className="section"><div className="container"><ManageListing /></div></section>
    </>
  );
}
