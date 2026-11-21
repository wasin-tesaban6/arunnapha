import { db } from '@/lib/db';
import { requireMember, hashPassword, verifyPassword, setSession } from '@/lib/auth';
import { publicMember } from '@/lib/data';
import { ok, fail, body, refresh, str, img } from '@/lib/api';

export const dynamic = 'force-dynamic';

export async function GET() {
  const s = await requireMember();
  if (!s) return fail('กรุณาเข้าสู่ระบบ', 401);
  return ok({ ok: true, member: { ...publicMember(s.member), username: s.member.username } });
}

export async function POST(req) {
  const s = await requireMember();
  if (!s) return fail('กรุณาเข้าสู่ระบบ', 401);
  const b = await body(req);
  const m = { ...s.member };
  if (b.newPassword) {
    if (!verifyPassword(b.currentPassword, m.passwordHash)) return fail('รหัสผ่านปัจจุบันไม่ถูกต้อง');
    if (String(b.newPassword).length < 6) return fail('รหัสผ่านใหม่ต้องยาวอย่างน้อย 6 ตัวอักษร');
    m.passwordHash = hashPassword(b.newPassword);
  } else {
    m.name = str(b.name, 120) || m.name;
    m.nickname = str(b.nickname, 40);
    m.classroom = str(b.classroom, 40);
    m.quote = str(b.quote, 200);
    m.bio = str(b.bio, 4000);
    m.photo = img(b.photo);
    m.contact = str(b.contact, 300);
  }
  m.updatedAt = Date.now();
  await db.put('members', m);
  if (b.newPassword) await setSession({ role: 'member', id: m.id, name: m.name, pv: m.passwordHash.slice(0, 8) });
  refresh();
  return ok({ ok: true, member: publicMember(m) });
}
