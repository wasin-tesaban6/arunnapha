import Header from '@/components/Header';
import Footer from '@/components/Footer';
import BackToTop from '@/components/BackToTop';
import { getSettings } from '@/lib/data';

export default async function SiteLayout({ children }) {
  const s = await getSettings();
  return (
    <div className="lg">
      <Header s={s} />
      <main>{children}</main>
      <Footer s={s} />
      <BackToTop />
    </div>
  );
}
