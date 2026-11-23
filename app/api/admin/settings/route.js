import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';
import { getSettings } from '@/lib/data';
import { ok, fail, body, refresh, str, img, imgs } from '@/lib/api';

export const dynamic = 'force-dynamic';

export async function GET() {
  if (!(await requireAdmin())) return fail('ไม่มีสิทธิ์', 401);
  return ok({ ok: true, settings: await getSettings() });
}

export async function POST(req) {
  if (!(await requireAdmin())) return fail('ไม่มีสิทธิ์', 401);
  const b = await body(req);
  const cur = await getSettings();
  const s = {
    ...cur,
    siteTitle: str(b.siteTitle, 120) || cur.siteTitle,
    partyName: str(b.partyName, 80),
    councilName: str(b.councilName, 80),
    schoolName: str(b.schoolName, 120),
    schoolMotto: str(b.schoolMotto, 200),
    slogan: str(b.slogan, 300),
    about: str(b.about, 6000),
    policies: Array.isArray(b.policies) ? b.policies.slice(0, 30).map((p) => ({ title: str(p.title, 200), detail: str(p.detail, 2000) })) : cur.policies,
    logoUrl: img(b.logoUrl) || '/logo.svg',
    heroImage: img(b.heroImage, 900),
    heroSlides: Array.isArray(b.heroSlides) ? imgs(b.heroSlides, 8) : cur.heroSlides,
    announcement: str(b.announcement, 400),
    contact: Object.fromEntries(['facebook', 'instagram', 'line', 'email', 'tiktok'].map((k) => [k, str(b.contact?.[k], 300)])),
    marketRules: str(b.marketRules, 8000),
    marketPickup: str(b.marketPickup, 300),
    issueCategories: Array.isArray(b.issueCategories) ? b.issueCategories.map((x) => str(x, 60)).filter(Boolean).slice(0, 30) : cur.issueCategories,
  };
  await db.setDoc('settings', s);
  refresh();
  return ok({ ok: true, settings: s });
}
