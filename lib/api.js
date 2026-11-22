import { revalidatePath } from 'next/cache';
import { counter } from './db';

export const ok = (data = { ok: true }, status = 200) => Response.json(data, { status });
export const fail = (msg, status = 400) => Response.json({ ok: false, error: msg }, { status });

export function refresh() {
  try { revalidatePath('/', 'layout'); } catch { /* ignore */ }
}

export async function body(req) {
  try { return await req.json(); } catch { return {}; }
}

// ตัดข้อความให้ปลอดภัย
export const str = (v, max = 500) => (v == null ? '' : String(v).trim().slice(0, max));
export const num = (v, d = 0) => (Number.isFinite(Number(v)) ? Number(v) : d);

// รูปภาพ: อนุญาต URL http(s), path ภายในเว็บ (/...) หรือ data:image (ขนาดจำกัด)
// strict = ข้อมูลจากบุคคลทั่วไป → รับเฉพาะรูปที่อัปโหลดผ่านระบบ (Vercel Blob) หรือ data:image ชนิดปลอดภัย
const SAFE_DATA = /^data:image\/(png|jpeg|webp|gif);base64,[A-Za-z0-9+/=]+$/;
const BLOB_HOST = /^https:\/\/[a-z0-9-]+\.public\.blob\.vercel-storage\.com\//i;
const BLOB_PROXY = /^\/api\/blob\/[A-Za-z0-9._/-]{1,250}$/; // รูปจากที่เก็บแบบ Private
export function img(v, maxKB = 700, strict = false) {
  const s = String(v || '').trim();
  if (!s) return '';
  if (s.startsWith('data:')) return SAFE_DATA.test(s) && s.length <= maxKB * 1370 ? s : '';
  if (strict) return (BLOB_HOST.test(s) || (BLOB_PROXY.test(s) && !s.includes('..'))) && s.length <= 500 ? s : '';
  if (/^https:\/\//.test(s) || (s.startsWith('/') && !s.startsWith('//'))) return s.slice(0, 1000);
  return '';
}
export const imgs = (arr, n = 8, strict = false) => (Array.isArray(arr) ? arr.map((x) => img(x, 700, strict)).filter(Boolean).slice(0, n) : []);

export function clientIp(req) {
  return (req.headers.get('x-real-ip') || (req.headers.get('x-forwarded-for') || 'local').split(',')[0]).trim().slice(0, 64);
}

// กันสแปม/ยิงถี่: นับผ่าน Redis จึงใช้ได้จริงแม้ Vercel แตกเป็นหลายเซิร์ฟเวอร์
// คืน true = ผ่าน, false = เกินกำหนด (ถ้าฐานข้อมูลมีปัญหาจะปล่อยผ่านเพื่อไม่ให้เว็บล่ม)
export async function rateLimit(req, key, limit = 8, windowSec = 60) {
  try {
    const n = await counter.incr(`${key}:${clientIp(req)}`, windowSec);
    return n <= limit;
  } catch (e) {
    console.error('rateLimit error', e);
    return true;
  }
}
