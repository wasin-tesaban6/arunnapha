import crypto from 'crypto';
import { cookies } from 'next/headers';
import { db, newId } from './db';

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
    const a = (await getAdmins()).find((x) => x.id === s.aid);
    // ถูกลบออก / เปลี่ยนรหัสผ่าน → ออกจากระบบอัตโนมัติ
    if (!a || a.passwordHash.slice(0, 8) !== s.pv) return null;
    return { ...s, admin: a, name: a.name || a.username };
  }
  return s;
}

const DUMMY_HASH = hashPassword('dummy-password-for-timing');

/* ===== ผู้ดูแลระบบ (หลายบัญชี) =====
   เก็บในฐานข้อมูล (key: admins) แบบเข้ารหัสรหัสผ่าน — ไม่มีรหัสผ่านอยู่ในโค้ด
   - ครั้งแรก: ย้ายบัญชีเดิม (key: admin) หรือสร้างบัญชีเริ่มต้นให้อัตโนมัติ
   - env ADMIN_ACCOUNTS (JSON) ใน Vercel → สร้าง/อัปเดตบัญชีให้อัตโนมัติ (ทำครั้งเดียวต่อค่าที่ตั้ง) */
export const ADMIN_USERNAME_RE = /^[A-Za-z0-9._@+-]{3,100}$/;
const lower = (v) => String(v || '').trim().toLowerCase();

export async function getAdmins() {
  let list = await db.getDoc('admins');
  let changed = false;
  if (!Array.isArray(list)) {
    const old = await db.getDoc('admin');
    list = [{
      id: newId('a'), name: 'ผู้ดูแลหลัก',
      username: old?.username || DEFAULT_ADMIN.username,
      passwordHash: old?.passwordHash || hashPassword(DEFAULT_ADMIN.password),
      createdAt: Date.now(),
    }];
    changed = true;
  }
  const env = process.env.ADMIN_ACCOUNTS;
  if (env) {
    const sig = crypto.createHash('sha256').update(env).digest('hex').slice(0, 16);
    if ((await db.getDoc('admins_env_sig')) !== sig) {
      try {
        const arr = JSON.parse(env);
        for (const x of Array.isArray(arr) ? arr : []) {
          const username = String(x.username || x.user || '').trim();
          const password = String(x.password || x.pass || '');
          if (!ADMIN_USERNAME_RE.test(username) || password.length < 8 || password.length > 200) continue;
          const found = list.find((a) => lower(a.username) === lower(username));
          if (found) { found.passwordHash = hashPassword(password); if (x.name) found.name = String(x.name).slice(0, 80); }
          else list.push({ id: newId('a'), name: String(x.name || username).slice(0, 80), username, passwordHash: hashPassword(password), createdAt: Date.now() });
        }
        await db.setDoc('admins_env_sig', sig);
        changed = true;
      } catch (e) { console.error('ADMIN_ACCOUNTS ไม่ใช่ JSON ที่ถูกต้อง', e.message); }
    }
  }
  if (changed) await db.setDoc('admins', list);
  return list;
}
export async function saveAdmins(list) { await db.setDoc('admins', list); }
export const publicAdmin = ({ passwordHash, ...a }) => a;

export async function loginAdmin(username, password) {
  const list = await getAdmins();
  const a = list.find((x) => lower(x.username) === lower(username));
  const good = verifyPassword(password, a ? a.passwordHash : DUMMY_HASH);
  if (!a || !good) return false;
  await setSession({ role: 'admin', aid: a.id, name: a.name || a.username, pv: a.passwordHash.slice(0, 8) });
  return true;
}

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
  if (process.env.ADMIN_PASSWORD) return false;
  const a = (await getAdmins()).find((x) => lower(x.username) === lower(DEFAULT_ADMIN.username));
  return Boolean(a && verifyPassword(DEFAULT_ADMIN.password, a.passwordHash));
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
