import { db } from '@/lib/db';
import { ok, fail, body, refresh, str, img, rateLimit } from '@/lib/api';
import { publicIssue } from '@/lib/data';
import { notifyAdmins, siteUrl } from '@/lib/line';

export const dynamic = 'force-dynamic';
const ABC = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const code = () => 'CR' + Array.from({ length: 6 }, () => ABC[Math.floor(Math.random() * ABC.length)]).join('');

export async function POST(req) {
  const b = await body(req);
  if (b.website) return ok({ ok: true, code: 'CR000000' }); // honeypot
  if (!(await rateLimit(req, 'issue', 5, 600))) return fail('ส่งเรื่องถี่เกินไป กรุณารอสักครู่', 429);
  const detail = str(b.detail, 2000);
  if (detail.length < 5) return fail('กรุณาอธิบายปัญหาอย่างน้อย 5 ตัวอักษร');
  let c = code();
  while (await db.get('issues', c)) c = code();
  const now = Date.now();
  const issue = {
    id: c, code: c,
    category: str(b.category, 60) || 'อื่น ๆ',
    location: str(b.location, 200),
    detail,
    photo: img(b.photo, 700, true),
    reporterName: b.anonymous ? '' : str(b.reporterName, 100),
    reporterClass: b.anonymous ? '' : str(b.reporterClass, 40),
    reporterContact: b.anonymous ? '' : str(b.reporterContact, 150),
    anonymous: Boolean(b.anonymous),
    status: 'received',
    timeline: [{ status: 'received', note: 'ระบบได้รับเรื่องของคุณแล้ว', at: now }],
    lineSubs: [],
    createdAt: now, updatedAt: now,
  };
  await db.put('issues', issue);
  await notifyAdmins(`🆕 มีเรื่องแจ้งใหม่ ${c}\nหมวด: ${issue.category}\nสถานที่: ${issue.location || '-'}\n${detail.slice(0, 200)}${siteUrl() ? `\n\nจัดการ: ${siteUrl()}/admin` : ''}`);
  refresh();
  return ok({ ok: true, code: c, issue: publicIssue(issue) });
}
