import { requireAdmin, hashPassword, setSession, verifyPassword, getAdmins, saveAdmins, ADMIN_USERNAME_RE } from '@/lib/auth';
import { ok, fail, body, str } from '@/lib/api';

// แอดมินเปลี่ยนชื่อผู้ใช้ / รหัสผ่านของตัวเอง
export async function POST(req) {
  const s = await requireAdmin();
  if (!s) return fail('ไม่มีสิทธิ์', 401);
  const b = await body(req);
  const list = await getAdmins();
  const me = list.find((a) => a.id === s.aid);
  if (!me || !verifyPassword(b.current, me.passwordHash)) return fail('รหัสผ่านปัจจุบันไม่ถูกต้อง');
  const username = str(b.username, 100) || me.username;
  if (!ADMIN_USERNAME_RE.test(username)) return fail('ชื่อผู้ใช้ใช้ได้เฉพาะ A-Z a-z 0-9 . _ @ + - (3–100 ตัว)');
  if (list.some((a) => a.id !== me.id && a.username.toLowerCase() === username.toLowerCase())) return fail('ชื่อผู้ใช้นี้ถูกใช้แล้ว');
  const pw = String(b.newPassword || '');
  if (pw.length < 8 || pw.length > 200) return fail('รหัสผ่านใหม่ต้องยาว 8–200 ตัวอักษร');
  me.username = username;
  me.passwordHash = hashPassword(pw);
  me.updatedAt = Date.now();
  await saveAdmins(list);
  await setSession({ role: 'admin', aid: me.id, name: me.name || me.username, pv: me.passwordHash.slice(0, 8) });
  return ok();
}
