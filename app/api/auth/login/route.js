import { loginAdmin, loginMember } from '@/lib/auth';
import { counter } from '@/lib/db';
import { ok, fail, body, clientIp, str } from '@/lib/api';

// กันการเดารหัสผ่าน (นับผ่าน Redis จึงใช้ได้จริงทุกเซิร์ฟเวอร์):
// ใส่ผิดครบ 8 ครั้งภายใน 15 นาที จาก IP เดียวกัน → IP นั้นถูกล็อก 15 นาที
// (ไม่ล็อกตามชื่อผู้ใช้ เพื่อไม่ให้คนอื่นแกล้งล็อกบัญชีแอดมินได้)
const WINDOW = 15 * 60;
const MAX_FAIL = 8;
const LOCKED = 'พยายามเข้าสู่ระบบผิดหลายครั้ง ระบบล็อกชั่วคราว 15 นาที';

export async function POST(req) {
  const { role, username, password } = await body(req);
  const r = role === 'admin' ? 'admin' : 'member';
  if (!str(username, 60) || !password || String(password).length > 200) return fail('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง', 401);

  const key = `loginfail:${r}:${clientIp(req)}`;
  try { if ((await counter.peek(key)) >= MAX_FAIL) return fail(LOCKED, 429); } catch { /* ฐานข้อมูลขัดข้อง: ข้ามการนับ */ }

  const good = r === 'admin' ? await loginAdmin(username, password) : await loginMember(username, password);
  if (good) {
    await counter.reset(key).catch(() => {});
    return ok();
  }
  try { if ((await counter.incr(key, WINDOW)) >= MAX_FAIL) return fail(LOCKED, 429); } catch { /* ignore */ }
  return fail('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง', 401);
}
