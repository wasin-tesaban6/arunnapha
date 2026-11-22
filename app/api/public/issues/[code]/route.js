import { db } from '@/lib/db';
import { fail, rateLimit } from '@/lib/api';
import { publicIssue } from '@/lib/data';
import { normalizeCode } from '@/lib/codes';

export const dynamic = 'force-dynamic';

export async function GET(req, { params }) {
  if (!(await rateLimit(req, 'track', 120, 60))) return fail('เรียกดูถี่เกินไป กรุณารอสักครู่', 429);
  const { code } = await params;
  const c = normalizeCode(code);
  const i = await db.get('issues', c);
  if (!i) return fail('ไม่พบรหัสเรื่องนี้', 404);
  return Response.json({ ok: true, issue: publicIssue(i) }, { headers: { 'Cache-Control': 'no-store' } });
}
