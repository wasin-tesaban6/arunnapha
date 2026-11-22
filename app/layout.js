import crypto from 'crypto';
import localFont from 'next/font/local';
import './globals.css';
import { getSettings } from '@/lib/data';

const niramit = localFont({
  src: [
    { path: '../public/fonts/THNiramitAS.woff2', weight: '400', style: 'normal' },
    { path: '../public/fonts/THNiramitAS-Bold.woff2', weight: '700', style: 'normal' },
  ],
  variable: '--font-niramit',
  display: 'swap',
  preload: true,
  fallback: ['Tahoma', 'sans-serif'],
});

export async function generateMetadata() {
  const s = await getSettings();
  const desc = `${s.councilName} ${s.schoolName} — พรรค${s.partyName} ${s.slogan && s.slogan !== '–' ? s.slogan : ''}`.trim();
  return {
    title: { default: s.siteTitle, template: `%s | ${s.siteTitle}` },
    description: desc,
    icons: (() => {
      const v = crypto.createHash('sha1').update(s.logoUrl || '/logo.svg').digest('hex').slice(0, 10);
      return { icon: `/api/icon?v=${v}`, shortcut: `/api/icon?v=${v}`, apple: `/api/icon?v=${v}` };
    })(),
    openGraph: { title: s.siteTitle, description: desc, type: 'website', locale: 'th_TH' },
  };
}

export const viewport = { themeColor: '#1f86e8', width: 'device-width', initialScale: 1 };

export default function RootLayout({ children }) {
  return (
    <html lang="th" className={niramit.variable}>
      <body>{children}</body>
    </html>
  );
}
