import { db } from '@/lib/db';
import { requireAdmin, hashPassword, setSession, DEFAULT_ADMIN, verifyPassword } from '@/lib/auth';
import { ok, fail, body, str } from '@/lib/api';

export async function POST(req) {
  if (!(await requireAdmin())) return fail('ไม่มีสิทธิ์', 401);
  const b = await body(req);
  const a = (await db.getDoc('admin')) || {};
  const curOk = a.passwordHash ? verifyPassword(b.current, a.passwordHash) : b.current === DEFAULT_ADMIN.password;
  if (!curOk) return fail('รหัสผ่านปัจจุบันไม่ถูกต้อง');
  const username = str(b.username, 40) || a.username || DEFAULT_ADMIN.username;
  if (String(b.newPassword || '').length < 8) return fail('รหัสผ่านใหม่ต้องยาวอย่างน้อย 8 ตัวอักษร');
  const passwordHash = hashPassword(b.newPassword);
  await db.setDoc('admin', { username, passwordHash, updatedAt: Date.now() });
  await setSession({ role: 'admin', name: username, pv: passwordHash.slice(0, 8) });
  return ok();
}
