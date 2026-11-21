import { db } from '@/lib/db';
import { clean } from '@/lib/schema';
import { ok, fail, body, refresh, str, rateLimit } from '@/lib/api';
import { notifyAdmins } from '@/lib/line';

const ABC = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

export async function POST(req) {
  const b = await body(req);
  if (b.website) return ok({ ok: true });
  if (!(await rateLimit(req, 'market', 4, 600))) return fail('ส่งประกาศถี่เกินไป กรุณารอสักครู่', 429);
  if (!b.accept) return fail('กรุณายอมรับเงื่อนไขการฝากขาย');
  if (!str(b.title) || !str(b.sellerName) || !str(b.sellerClass) || !str(b.contact)) return fail('กรุณากรอกข้อมูลที่มีเครื่องหมาย * ให้ครบ');
  const item = clean.market({ ...b, status: 'pending', adminNote: '' }, {}, true);
  item.status = 'pending';
  item.manageCode = Array.from({ length: 6 }, () => ABC[Math.floor(Math.random() * ABC.length)]).join('');
  await db.put('market', item);
  await notifyAdmins(`🛍️ มีประกาศฝากขายใหม่รออนุมัติ\n${item.title} — ${item.price || '-'}\nผู้ขาย: ${item.sellerName} (${item.sellerClass})`);
  refresh();
  return ok({ ok: true, id: item.id, manageCode: item.manageCode });
}
