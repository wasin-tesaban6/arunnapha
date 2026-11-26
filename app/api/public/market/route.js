import { db } from '@/lib/db';
import { clean } from '@/lib/schema';
import { ok, fail, body, refresh, str, rateLimit } from '@/lib/api';

import { makeCode } from '@/lib/codes';

export async function POST(req) {
  const b = await body(req);
  if (b.website) return ok({ ok: true });
  if (!(await rateLimit(req, 'market', 4, 600))) return fail('ส่งประกาศถี่เกินไป กรุณารอสักครู่', 429);
  if (!b.accept) return fail('กรุณายอมรับเงื่อนไขการฝากขาย');
  if (!str(b.title) || !str(b.sellerName) || !str(b.sellerClass) || !str(b.contact)) return fail('กรุณากรอกข้อมูลที่มีเครื่องหมาย * ให้ครบ');
  const item = clean.market({ ...b, status: 'pending', adminNote: '' }, {}, true);
  item.status = 'pending';
  // รหัสรับเรื่องฝากขาย (ใช้จัดการประกาศ) เช่น CRMS6MK4HD9PT — ไม่ซ้ำกับประกาศอื่น
  const used = new Set((await db.list('market')).map((p) => p.manageCode));
  let mc = makeCode('market');
  while (used.has(mc)) mc = makeCode('market');
  item.manageCode = mc;
  await db.put('market', item);
  refresh();
  return ok({ ok: true, id: item.id, manageCode: item.manageCode });
}
