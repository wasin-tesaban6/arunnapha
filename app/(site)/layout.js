import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { getSettings } from '@/lib/data';

export default async function SiteLayout({ children }) {
  const s = await getSettings();
  return (
    <>
      <Header s={s} />
      <main>{children}</main>
      <Footer s={s} />
    </>
  );
}
