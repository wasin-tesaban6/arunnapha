import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';
import { getSettings } from '@/lib/data';
import { ok, fail, body, refresh, str, img, imgs } from '@/lib/api';
import { TEXT_FIELDS } from '@/lib/texts';

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
    texts: b.texts && typeof b.texts === 'object'
      ? Object.fromEntries(TEXT_FIELDS.map(([k, , , , long]) => [k, str(b.texts[k], long ? 1000 : 200)]))
      : cur.texts,
    features: Array.isArray(b.features)
      ? [0, 1, 2, 3].map((i) => ({ title: str(b.features[i]?.title, 100), sub: str(b.features[i]?.sub, 150), text: str(b.features[i]?.text, 500), go: str(b.features[i]?.go, 60) }))
      : cur.features,
    announcement: str(b.announcement, 400),
    contact: Object.fromEntries(['facebook', 'instagram', 'line', 'email', 'tiktok'].map((k) => [k, str(b.contact?.[k], 300)])),
    marketRules: str(b.marketRules, 8000),
    marketPickup: str(b.marketPickup, 300),
    reportLineQr: img(b.reportLineQr, 700),
    reportLineUrl: /^https:\/\/\S+$/.test(String(b.reportLineUrl || '').trim()) ? str(b.reportLineUrl, 300) : '',
    issueStatsOverride: Object.fromEntries(['total', 'received', 'done'].map((k) => [k, /^\d{1,7}$/.test(String(b.issueStatsOverride?.[k] ?? '').trim()) ? String(b.issueStatsOverride[k]).trim() : ''])),
    volunteerAutoApprove: b.volunteerAutoApprove === undefined ? Boolean(cur.volunteerAutoApprove) : Boolean(b.volunteerAutoApprove),
    issueCategories: Array.isArray(b.issueCategories) ? b.issueCategories.map((x) => str(x, 60)).filter(Boolean).slice(0, 30) : cur.issueCategories,
  };
  await db.setDoc('settings', s);
  refresh();
  return ok({ ok: true, settings: s });
}
