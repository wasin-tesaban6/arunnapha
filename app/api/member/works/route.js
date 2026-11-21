import { db } from '@/lib/db';
import { requireMember } from '@/lib/auth';
import { clean } from '@/lib/schema';
import { ok, fail, body, refresh } from '@/lib/api';

export const dynamic = 'force-dynamic';

export async function GET() {
  const s = await requireMember();
  if (!s) return fail('กรุณาเข้าสู่ระบบ', 401);
  const items = (await db.list('works')).filter((w) => w.memberId === s.id).sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  return ok({ ok: true, items });
}

export async function POST(req) {
  const s = await requireMember();
  if (!s) return fail('กรุณาเข้าสู่ระบบ', 401);
  const b = await body(req);
  const prev = b.id ? await db.get('works', b.id) : null;
  if (prev && prev.memberId !== s.id) return fail('แก้ไขได้เฉพาะผลงานของตัวเอง', 403);
  const item = clean.works({ ...b, memberId: s.id }, prev || {});
  item.memberId = s.id;
  await db.put('works', item);
  refresh();
  return ok({ ok: true, item });
}

export async function DELETE(req) {
  const s = await requireMember();
  if (!s) return fail('กรุณาเข้าสู่ระบบ', 401);
  const id = new URL(req.url).searchParams.get('id');
  const w = id && (await db.get('works', id));
  if (!w || w.memberId !== s.id) return fail('ไม่พบผลงาน', 404);
  await db.del('works', id);
  refresh();
  return ok();
}
