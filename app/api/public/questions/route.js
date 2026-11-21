import { db } from '@/lib/db';
import { clean } from '@/lib/schema';
import { ok, fail, body, refresh, str, rateLimit } from '@/lib/api';
import { notifyAdmins } from '@/lib/line';

export async function POST(req) {
  const b = await body(req);
  if (b.website) return ok();
  if (!rateLimit(req, 'question', 5)) return fail('ส่งคำถามถี่เกินไป กรุณารอสักครู่', 429);
  const text = str(b.text, 1000);
  if (text.length < 3) return fail('กรุณาพิมพ์คำถาม');
  const ev = b.eventId ? await db.get('events', String(b.eventId)) : null;
  const q = clean.questions({ eventId: ev ? ev.id : '', name: b.name, role: b.role, text, answer: '' });
  await db.put('questions', q);
  await notifyAdmins(`❓ คำถามใหม่${ev ? ` (${ev.title})` : ''}\nจาก: ${q.name} ${q.role ? `(${q.role})` : ''}\n${text.slice(0, 300)}`);
  refresh();
  return ok({ ok: true, item: q });
}
