import { revalidatePath } from 'next/cache';

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
export function img(v, maxKB = 700) {
  const s = String(v || '');
  if (!s) return '';
  if (s.startsWith('data:image/')) return s.length <= maxKB * 1370 ? s : '';
  if (/^https?:\/\//.test(s) || s.startsWith('/')) return s.slice(0, 1000);
  return '';
}
export const imgs = (arr, n = 8) => (Array.isArray(arr) ? arr.map((x) => img(x)).filter(Boolean).slice(0, n) : []);

// กันสแปมแบบง่าย (หน่วงตาม IP ในหน่วยความจำของ instance)
const hits = globalThis.__sc6hits || (globalThis.__sc6hits = new Map());
export function rateLimit(req, key, limit = 8, windowMs = 60_000) {
  const ip = (req.headers.get('x-forwarded-for') || 'local').split(',')[0].trim();
  const k = key + ':' + ip;
  const now = Date.now();
  const arr = (hits.get(k) || []).filter((t) => now - t < windowMs);
  arr.push(now);
  hits.set(k, arr);
  return arr.length <= limit;
}
