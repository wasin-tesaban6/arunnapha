import { db } from '@/lib/db';
import { requireMember } from '@/lib/auth';
import { ok, fail, body, refresh, str } from '@/lib/api';

export const dynamic = 'force-dynamic';

export async function GET() {
  const s = await requireMember();
  if (!s) return fail('กรุณาเข้าสู่ระบบ', 401);
  const events = Object.fromEntries((await db.list('events')).map((e) => [e.id, e.title]));
  const items = (await db.list('questions'))
    .filter((q) => !q.hidden)
    .map((q) => ({ ...q, eventTitle: events[q.eventId] || 'ทั่วไป' }))
    .sort((a, b) => Boolean(a.answer) - Boolean(b.answer) || (b.createdAt || 0) - (a.createdAt || 0));
  return ok({ ok: true, items });
}

export async function POST(req) {
  const s = await requireMember();
  if (!s) return fail('กรุณาเข้าสู่ระบบ', 401);
  const b = await body(req);
  const q = b.id && (await db.get('questions', b.id));
  if (!q) return fail('ไม่พบคำถาม', 404);
  const answer = str(b.answer, 2000);
  await db.put('questions', {
    ...q, answer,
    answeredBy: answer ? `${s.member.name}${s.member.position ? ` (${s.member.position})` : ''}` : '',
    answeredAt: answer ? Date.now() : null,
  });
  refresh();
  return ok();
}
