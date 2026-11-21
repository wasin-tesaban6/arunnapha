import { PageHero } from '@/components/Cards';
import TrackSearch from '@/components/TrackSearch';
export const metadata = { title: 'ติดตามเรื่องที่แจ้ง' };
export default function TrackPage() {
  return (
    <>
      <PageHero title="ติดตามเรื่องที่แจ้ง" sub="เช็คความคืบหน้าแบบ Real-Time ด้วยรหัสเรื่อง" />
      <section className="section"><div className="container"><TrackSearch /></div></section>
    </>
  );
}
