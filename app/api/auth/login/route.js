import { loginAdmin, loginMember } from '@/lib/auth';
import { ok, fail, body, rateLimit } from '@/lib/api';

export async function POST(req) {
  if (!rateLimit(req, 'login', 10)) return fail('พยายามเข้าสู่ระบบบ่อยเกินไป กรุณารอ 1 นาที', 429);
  const { role, username, password } = await body(req);
  const good = role === 'admin' ? await loginAdmin(username, password) : await loginMember(username, password);
  return good ? ok() : fail('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง', 401);
}
