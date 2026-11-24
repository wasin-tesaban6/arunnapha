import { db } from '@/lib/db';
import { normalizeCode } from '@/lib/codes';
import { ok, fail, body, refresh, rateLimit } from '@/lib/api';

const LABEL = { pending: 'รออนุมัติจากสภา', approved: 'แสดงบนเว็บแล้ว', rejected: 'ไม่อนุมัติ' };

// ผู้ส่งตรวจสถานะ / ลบรายการของตัวเองด้วยรหัส CRMS6VL...
export async function POST(req) {
  if (!(await rateLimit(req, 'vmanage', 20, 600))) return fail('ลองใหม่อีกครั้งภายหลัง', 429);
  const { code, action } = await body(req);
  const c = normalizeCode(code);
  if (c.length < 8) return fail('รหัสไม่ถูกต้อง', 404);
  const x = (await db.list('volunteer')).find((v) => v.manageCode && v.manageCode === c);
  if (!x) return fail('ไม่พบรหัสนี้', 404);
  if (action === 'delete') { await db.del('volunteer', x.id); refresh(); return ok(); }
  return ok({ ok: true, item: { title: x.title, status: x.status || 'approved', statusLabel: LABEL[x.status || 'approved'], adminNote: x.adminNote || '' } });
}
