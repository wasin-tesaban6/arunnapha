import { db } from '@/lib/db';
import { requireAdmin, hashPassword } from '@/lib/auth';
import { clean } from '@/lib/schema';
import { ok, fail, body, refresh, str } from '@/lib/api';
import { ISSUE_STATUS } from '@/lib/constants';

export const dynamic = 'force-dynamic';
const ALLOWED = ['members', 'events', 'questions', 'issues', 'market', 'volunteer', 'opportunities'];

export async function GET(req, { params }) {
  if (!(await requireAdmin())) return fail('ไม่มีสิทธิ์', 401);
  const { col } = await params;
  if (!ALLOWED.includes(col)) return fail('not found', 404);
  let list = await db.list(col);
  if (col === 'members') list = list.map(({ passwordHash, ...m }) => ({ ...m, hasPassword: Boolean(passwordHash) }));
  list.sort((a, b) => (col === 'members' ? (a.order ?? 99) - (b.order ?? 99) : (b.createdAt || 0) - (a.createdAt || 0)));
  return ok({ ok: true, items: list });
}

export async function POST(req, { params }) {
  const admin = await requireAdmin();
  if (!admin) return fail('ไม่มีสิทธิ์', 401);
  const { col } = await params;
  if (!ALLOWED.includes(col)) return fail('not found', 404);
  const b = await body(req);
  const prev = b.id ? await db.get(col, b.id) : null;

  if (col === 'issues') {
    if (!prev) return fail('ไม่พบเรื่อง', 404);
    const item = { ...prev, updatedAt: Date.now() };
    const changed = b.status && ISSUE_STATUS[b.status] && b.status !== prev.status;
    const note = str(b.note, 500);
    if (changed || note) {
      item.status = changed ? b.status : prev.status;
      item.timeline = [...(prev.timeline || []), { status: item.status, note, at: Date.now(), by: 'สภานักเรียน' }];
    }
    if (b.internalNote !== undefined) item.internalNote = str(b.internalNote, 1000);
    if (b.assignee !== undefined) item.assignee = str(b.assignee, 120);
    await db.put(col, item);
    refresh();
    return ok({ ok: true, item });
  }

  const item = clean[col](b, prev || {});
  if (col === 'members') {
    const uname = str(b.username, 40).toLowerCase();
    if (uname && !/^[a-z0-9._-]{3,40}$/.test(uname)) return fail('ชื่อผู้ใช้ใช้ได้เฉพาะ a-z 0-9 . _ - (3 ตัวขึ้นไป)');
    if (uname) {
      const all = await db.list('members');
      if (all.some((m) => m.id !== item.id && (m.username || '').toLowerCase() === uname)) return fail('ชื่อผู้ใช้นี้ถูกใช้แล้ว');
    }
    item.username = uname;
    if (b.newPassword) {
      if (String(b.newPassword).length < 6) return fail('รหัสผ่านต้องยาวอย่างน้อย 6 ตัวอักษร');
      item.passwordHash = hashPassword(b.newPassword);
    }
    if (!uname) item.passwordHash = '';
  }
  if (col === 'questions' && b.answer && !b.answeredBy) item.answeredBy = 'สภานักเรียน';
  await db.put(col, item);
  refresh();
  const { passwordHash, ...safe } = item;
  return ok({ ok: true, item: safe });
}

export async function DELETE(req, { params }) {
  if (!(await requireAdmin())) return fail('ไม่มีสิทธิ์', 401);
  const { col } = await params;
  if (!ALLOWED.includes(col)) return fail('not found', 404);
  const id = new URL(req.url).searchParams.get('id');
  if (!id) return fail('ไม่มี id');
  await db.del(col, id);
  if (col === 'events') {
    for (const q of await db.list('questions')) if (q.eventId === id) await db.del('questions', q.id);
  }
  refresh();
  return ok();
}
