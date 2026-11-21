import { db } from '@/lib/db';
import { ok, fail, body, refresh, rateLimit } from '@/lib/api';
import { MARKET_STATUS } from '@/lib/constants';

// ผู้ขายจัดการประกาศเองด้วย "รหัสจัดการประกาศ"
export async function POST(req) {
  if (!rateLimit(req, 'manage', 15)) return fail('ลองใหม่อีกครั้งภายหลัง', 429);
  const { id, code, action } = await body(req);
  const all = await db.list('market');
  const x = all.find((p) => (id ? p.id === id : true) && p.manageCode && p.manageCode === String(code || '').toUpperCase().trim());
  if (!x) return fail('รหัสจัดการประกาศไม่ถูกต้อง', 404);
  if (action === 'check') return ok({ ok: true, item: { id: x.id, title: x.title, status: x.status, statusLabel: MARKET_STATUS[x.status]?.label, adminNote: x.adminNote || '' } });
  if (action === 'sold') { if (x.status !== 'approved') return fail('ประกาศนี้ยังไม่ได้อยู่ในสถานะกำลังขาย'); await db.put('market', { ...x, status: 'sold', updatedAt: Date.now() }); }
  else if (action === 'renew') { if (x.status !== 'approved') return fail('ต่ออายุได้เฉพาะประกาศที่กำลังขาย'); await db.put('market', { ...x, expiresAt: Date.now() + 30 * 864e5, updatedAt: Date.now() }); }
  else if (action === 'delete') await db.del('market', x.id);
  else return fail('คำสั่งไม่ถูกต้อง');
  refresh();
  return ok();
}
