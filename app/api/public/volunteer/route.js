import { db } from '@/lib/db';
import { clean } from '@/lib/schema';
import { makeCode } from '@/lib/codes';
import { getSettings } from '@/lib/data';
import { ok, fail, body, refresh, str, rateLimit } from '@/lib/api';
import { notifyAdmins } from '@/lib/line';

// พี่ ๆ น้อง ๆ เพื่อน ๆ ส่งรายการจิตอาสาวิชาการ (สอน / เฉลยการบ้าน) เข้ามาเอง
export async function POST(req) {
  const b = await body(req);
  if (b.website) return ok({ ok: true }); // honeypot กันบอท
  if (!(await rateLimit(req, 'volunteer', 4, 600))) return fail('ส่งถี่เกินไป กรุณารอสักครู่', 429);
  if (!b.accept) return fail('กรุณายอมรับข้อตกลงก่อนส่ง');
  if (!str(b.tutor) || !str(b.title)) return fail('กรุณากรอกชื่อผู้สอนและหัวข้อ');

  const s = await getSettings();
  const item = clean.volunteer({ ...b, hidden: false, adminNote: '', status: s.volunteerAutoApprove ? 'approved' : 'pending' }, {});
  if (!item.meetLink && !item.files.length) return fail('กรุณาใส่ลิงก์ Google Meet หรือไฟล์เอกสารอย่างน้อย 1 อย่าง');

  const used = new Set((await db.list('volunteer')).map((v) => v.manageCode));
  let code = makeCode('volunteer');
  while (used.has(code)) code = makeCode('volunteer');
  item.manageCode = code;
  item.source = 'public';
  await db.put('volunteer', item);
  await notifyAdmins(`📚 มีจิตอาสาวิชาการส่งเข้ามาใหม่${item.status === 'pending' ? ' (รออนุมัติ)' : ''}\n${item.title}\nโดย: ${item.tutor}${item.tutorClass ? ` (${item.tutorClass})` : ''}`);
  refresh();
  return ok({ ok: true, code, status: item.status });
}
