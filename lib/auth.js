import crypto from 'crypto';
import { cookies } from 'next/headers';
import { db } from './db';

const COOKIE = 'sc6_session';
const MAX_AGE = 60 * 60 * 12; // 12 ชั่วโมง
// รหัสลับเซ็น cookie: ใช้ AUTH_SECRET ถ้ามี / ถ้าไม่มี ใช้ค่าที่สร้างจาก token ฐานข้อมูล (ไม่เปิดเผยในโค้ด)
const SECRET = process.env.AUTH_SECRET
  || (process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN
    ? crypto.createHash('sha256').update('sc6-session:' + (process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN)).digest('hex')
    : 'crms6-arunnapha-local-dev-only');

export const DEFAULT_ADMIN = {
  username: process.env.ADMIN_USERNAME || 'Tesaban6',
  password: process.env.ADMIN_PASSWORD || 'CRMS6ARNAPHA',
};

export function hashPassword(pw) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(String(pw), salt, 32).toString('hex');
  return `${salt}:${hash}`;
}
export function verifyPassword(pw, stored) {
  if (!stored || !stored.includes(':')) return false;
  const [salt, hash] = stored.split(':');
  const test = crypto.scryptSync(String(pw), salt, 32);
  const buf = Buffer.from(hash, 'hex');
  return buf.length === test.length && crypto.timingSafeEqual(buf, test);
}

function sign(data) {
  return crypto.createHmac('sha256', SECRET).update(data).digest('base64url');
}
function safeEq(a, b) {
  const x = Buffer.from(a), y = Buffer.from(b);
  return x.length === y.length && crypto.timingSafeEqual(x, y);
}

export function makeToken(payload) {
  const body = Buffer.from(JSON.stringify({ ...payload, exp: Date.now() + MAX_AGE * 1000 })).toString('base64url');
  return `${body}.${sign(body)}`;
}
export function readToken(tok) {
  if (!tok || !tok.includes('.')) return null;
  const [body, sig] = tok.split('.');
  if (!safeEq(sig, sign(body))) return null;
  try {
    const p = JSON.parse(Buffer.from(body, 'base64url').toString());
    if (!p.exp || p.exp < Date.now()) return null;
    return p;
  } catch { return null; }
}

export async function setSession(payload) {
  const jar = await cookies();
  jar.set(COOKIE, makeToken(payload), {
    httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', path: '/', maxAge: MAX_AGE,
  });
}
export async function clearSession() {
  const jar = await cookies();
  jar.delete(COOKIE);
}
export async function getSession() {
  const jar = await cookies();
  const s = readToken(jar.get(COOKIE)?.value);
  if (!s) return null;
  if (s.role === 'member') {
    const m = await db.get('members', s.id);
    // ถ้าแอดมินลบบัญชี/ปิดใช้งาน หรือเปลี่ยนรหัสผ่าน → ออกจากระบบอัตโนมัติ
    if (!m || m.active === false || !m.username || (m.passwordHash || '').slice(0, 8) !== s.pv) return null;
    return { ...s, member: m };
  }
  if (s.role === 'admin') {
    const a = await db.getDoc('admin');
    if (a?.passwordHash && a.passwordHash.slice(0, 8) !== s.pv) return null;
  }
  return s;
}

export async function loginAdmin(username, password) {
  const a = await db.getDoc('admin');
  const user = a?.username || DEFAULT_ADMIN.username;
  if (String(username).trim() !== user) return false;
  const ok = a?.passwordHash ? verifyPassword(password, a.passwordHash) : safeEq(String(password), DEFAULT_ADMIN.password);
  if (!ok) return false;
  await setSession({ role: 'admin', name: user, pv: a?.passwordHash ? a.passwordHash.slice(0, 8) : undefined });
  return true;
}

const DUMMY_HASH = hashPassword('dummy-password-for-timing');

export async function loginMember(username, password) {
  const list = await db.list('members');
  const u = String(username).trim().toLowerCase();
  const m = list.find((x) => x.username && x.username.toLowerCase() === u && x.active !== false && x.passwordHash);
  // ตรวจรหัสเสมอแม้ไม่พบผู้ใช้ เพื่อไม่ให้เดาได้จากเวลาตอบสนองว่ามีชื่อผู้ใช้นี้หรือไม่
  const good = verifyPassword(password, m ? m.passwordHash : DUMMY_HASH);
  if (!m || !good) return false;
  await setSession({ role: 'member', id: m.id, name: m.name, pv: m.passwordHash.slice(0, 8) });
  return true;
}

// ยังใช้รหัสผ่านเริ่มต้นอยู่หรือไม่ (ควรเปลี่ยนทันที)
export async function usingDefaultAdminPassword() {
  const a = await db.getDoc('admin');
  return !a?.passwordHash && !process.env.ADMIN_PASSWORD;
}

// ใช้ใน Route Handler
export async function requireAdmin() {
  const s = await getSession();
  return s?.role === 'admin' ? s : null;
}
export async function requireMember() {
  const s = await getSession();
  return s?.role === 'member' ? s : null;
}
