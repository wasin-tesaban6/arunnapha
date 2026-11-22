import { requireAdmin, hashPassword, getAdmins, saveAdmins, publicAdmin, ADMIN_USERNAME_RE } from '@/lib/auth';
import { newId } from '@/lib/db';
import { ok, fail, body, str } from '@/lib/api';

export const dynamic = 'force-dynamic';

// จัดการบัญชีผู้ดูแลระบบ (เพิ่ม / แก้ไข / ลบ)
export async function GET() {
  const s = await requireAdmin();
  if (!s) return fail('ไม่มีสิทธิ์', 401);
  const list = await getAdmins();
  return ok({ ok: true, items: list.map((a) => ({ ...publicAdmin(a), me: a.id === s.aid })) });
}

export async function POST(req) {
  const s = await requireAdmin();
  if (!s) return fail('ไม่มีสิทธิ์', 401);
  const b = await body(req);
  const list = await getAdmins();
  const username = str(b.username, 100);
  if (!ADMIN_USERNAME_RE.test(username)) return fail('ชื่อผู้ใช้ใช้ได้เฉพาะ A-Z a-z 0-9 . _ @ + - (3–100 ตัว)');
  if (list.some((a) => a.id !== b.id && a.username.toLowerCase() === username.toLowerCase())) return fail('ชื่อผู้ใช้นี้ถูกใช้แล้ว');
  const pw = String(b.newPassword || '');
  if (pw && (pw.length < 8 || pw.length > 200)) return fail('รหัสผ่านต้องยาว 8–200 ตัวอักษร');

  let a = b.id ? list.find((x) => x.id === b.id) : null;
  if (b.id && !a) return fail('ไม่พบบัญชี', 404);
  if (!a) {
    if (!pw) return fail('กรุณาตั้งรหัสผ่าน');
    a = { id: newId('a'), createdAt: Date.now() };
    list.push(a);
  }
  a.name = str(b.name, 80) || username;
  a.username = username;
  if (pw) a.passwordHash = hashPassword(pw);
  a.updatedAt = Date.now();
  await saveAdmins(list);
  return ok({ ok: true, item: publicAdmin(a) });
}

export async function DELETE(req) {
  const s = await requireAdmin();
  if (!s) return fail('ไม่มีสิทธิ์', 401);
  const id = new URL(req.url).searchParams.get('id');
  const list = await getAdmins();
  if (id === s.aid) return fail('ลบบัญชีของตัวเองไม่ได้');
  if (list.length <= 1) return fail('ต้องมีผู้ดูแลระบบอย่างน้อย 1 บัญชี');
  if (!list.some((a) => a.id === id)) return fail('ไม่พบบัญชี', 404);
  await saveAdmins(list.filter((a) => a.id !== id));
  return ok();
}
