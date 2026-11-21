import { put } from '@vercel/blob';
import { getSession } from '@/lib/auth';
import { ok, fail, body, rateLimit } from '@/lib/api';

export const runtime = 'nodejs';

// รับรูป (data URL ที่บีบอัดจากฝั่งเบราว์เซอร์แล้ว) → อัปโหลดขึ้น Vercel Blob
// ถ้ายังไม่ได้เชื่อม Blob จะคืน data URL เดิมเพื่อเก็บในฐานข้อมูลโดยตรง
export async function POST(req) {
  const b = await body(req);
  const s = await getSession();
  const publicFolder = ['issues', 'market', 'questions'].includes(b.folder);
  if (!s && !publicFolder) return fail('กรุณาเข้าสู่ระบบ', 401);
  if (!s && !rateLimit(req, 'upload', 10)) return fail('อัปโหลดถี่เกินไป กรุณารอสักครู่', 429);

  const m = /^data:(image\/(png|jpeg|webp|gif|svg\+xml));base64,(.+)$/.exec(String(b.dataUrl || ''));
  if (!m) return fail('ไฟล์ไม่ใช่รูปภาพ');
  const buf = Buffer.from(m[3], 'base64');
  const limit = s ? 3 * 1024 * 1024 : 900 * 1024;
  if (buf.length > limit) return fail('ไฟล์ใหญ่เกินไป');
  if (m[2] === 'svg+xml' && s?.role !== 'admin') return fail('ไม่รองรับไฟล์ SVG');

  if (!process.env.BLOB_READ_WRITE_TOKEN && !process.env.BLOB_STORE_ID) return ok({ url: b.dataUrl, storage: 'inline' });
  const ext = { png: 'png', jpeg: 'jpg', webp: 'webp', gif: 'gif', 'svg+xml': 'svg' }[m[2]];
  const folder = String(b.folder || 'misc').replace(/[^a-z0-9_-]/gi, '').slice(0, 20) || 'misc';
  const res = await put(`${folder}/${Date.now()}.${ext}`, buf, {
    access: 'public', contentType: m[1], addRandomSuffix: true, cacheControlMaxAge: 31536000,
  });
  return ok({ url: res.url, storage: 'blob' });
}
