import crypto from 'crypto';
import { db } from '@/lib/db';
import { requireAdmin, hashPassword } from '@/lib/auth';
import { clean } from '@/lib/schema';
import { ok, fail, body, refresh, str } from '@/lib/api';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const FIELDS = ['name', 'nickname', 'position', 'order', 'classroom', 'quote', 'bio', 'achievements', 'experience', 'contact'];
const ABC = 'abcdefghjkmnpqrstuvwxyz23456789';
const genPassword = () => Array.from(crypto.randomBytes(8), (b) => ABC[b % ABC.length]).join('');

// นำเข้าสมาชิกหลายคนพร้อมกัน (สูงสุด 100 แถวต่อครั้ง — หน้าเว็บแบ่งส่งให้อัตโนมัติ)
// - ชื่อผู้ใช้ตรงกับสมาชิกเดิม → อัปเดตเฉพาะช่องที่กรอก
// - ไม่ตรง → สร้างสมาชิกใหม่
// - มีชื่อผู้ใช้แต่ไม่ใส่รหัสผ่าน (สมาชิกใหม่) → สุ่มรหัสผ่านให้ (ถ้าเปิด autoPassword)
export async function POST(req) {
  if (!(await requireAdmin())) return fail('ไม่มีสิทธิ์', 401);
  const b = await body(req);
  const rows = Array.isArray(b.rows) ? b.rows.slice(0, 100) : [];
  if (!rows.length) return fail('ไม่มีข้อมูล');
  const autoPassword = b.autoPassword !== false;

  const all = await db.list('members');
  const byUser = new Map(all.filter((m) => m.username).map((m) => [m.username.toLowerCase(), m]));
  let nextOrder = Math.max(0, ...all.map((m) => Number(m.order) || 0)) + 1;
  const results = [];

  for (let i = 0; i < rows.length; i++) {
    const r = rows[i] || {};
    const uname = str(r.username, 40).toLowerCase();
    const pw = String(r.password || '').trim();
    try {
      if (uname && !/^[a-z0-9._-]{3,40}$/.test(uname)) throw new Error('ชื่อผู้ใช้ใช้ได้เฉพาะ a-z 0-9 . _ - (3 ตัวขึ้นไป)');
      if (pw && pw.length < 6) throw new Error('รหัสผ่านต้องยาวอย่างน้อย 6 ตัว');
      if (pw.length > 100) throw new Error('รหัสผ่านยาวเกินไป');
      const existing = uname ? byUser.get(uname) : null;
      const input = {};
      for (const k of FIELDS) if (String(r[k] ?? '').trim() !== '') input[k] = r[k];
      let item, status, generated = '';
      if (existing) {
        item = clean.members({ ...existing, ...input }, existing);
        status = 'updated';
      } else {
        if (!str(input.name)) throw new Error('ไม่มีชื่อ-นามสกุล');
        if (input.order === undefined) input.order = nextOrder++;
        item = clean.members({ ...input, active: true }, {});
        status = 'created';
      }
      item.username = uname || item.username || '';
      if (pw) item.passwordHash = hashPassword(pw);
      else if (uname && !item.passwordHash && autoPassword) { generated = genPassword(); item.passwordHash = hashPassword(generated); }
      if (!item.username) item.passwordHash = '';
      await db.put('members', item);
      if (item.username) byUser.set(item.username, item);
      results.push({ index: i, status, id: item.id, name: item.name, username: item.username, generatedPassword: generated, hasPassword: Boolean(item.passwordHash) });
    } catch (e) {
      results.push({ index: i, status: 'error', name: str(r.name, 120), username: uname, error: e.message });
    }
  }
  refresh();
  return ok({ ok: true, results });
}
