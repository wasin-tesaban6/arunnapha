import { db } from '@/lib/db';
import { ok, fail } from '@/lib/api';
import { publicIssue } from '@/lib/data';

export const dynamic = 'force-dynamic';

export async function GET(req, { params }) {
  const { code } = await params;
  const c = String(code || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
  const i = await db.get('issues', c);
  if (!i) return fail('ไม่พบรหัสเรื่องนี้', 404);
  return Response.json({ ok: true, issue: publicIssue(i) }, { headers: { 'Cache-Control': 'no-store' } });
}
