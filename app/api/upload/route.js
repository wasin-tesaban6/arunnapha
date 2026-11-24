import { getSession } from '@/lib/auth';
import { ok, fail, body, rateLimit } from '@/lib/api';
import { blobConfigured, uploadToBlob } from '@/lib/blob';

export const runtime = 'nodejs';

// ตรวจ "ลายเซ็นไฟล์" จริง ไม่เชื่อแค่ชนิดที่ส่งมา (กันไฟล์อันตรายปลอมเป็นรูป)
function sniff(buf) {
  if (buf.length < 12) return null;
  if (buf.toString('ascii', 0, 5) === '%PDF-') return 'pdf';
  if (buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47) return 'png';
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return 'jpeg';
  if (buf.toString('ascii', 0, 4) === 'RIFF' && buf.toString('ascii', 8, 12) === 'WEBP') return 'webp';
  if (buf.toString('ascii', 0, 4) === 'GIF8') return 'gif';
  return null;
}

// รับรูป (data URL ที่บีบอัดจากฝั่งเบราว์เซอร์แล้ว) → อัปโหลดขึ้น Vercel Blob
// ถ้ายังไม่ได้เชื่อม Blob หรือ Blob มีปัญหา จะคืน data URL เพื่อเก็บในฐานข้อมูลโดยตรง (เว็บไม่ล่ม)
export async function POST(req) {
  const b = await body(req);
  const s = await getSession();
  const publicFolder = ['issues', 'market'].includes(b.folder);
  if (!s && !publicFolder) return fail('กรุณาเข้าสู่ระบบ', 401);
  if (!s && !(await rateLimit(req, 'upload', 20, 600))) return fail('อัปโหลดถี่เกินไป กรุณารอสักครู่', 429);

  // เอกสาร PDF (เฉพาะผู้ที่เข้าสู่ระบบ) → เก็บในโฟลเดอร์ docs
  const pdf = /^data:application\/pdf;base64,([A-Za-z0-9+/=]+)$/.exec(String(b.dataUrl || ''));
  if (pdf) {
    if (!s) return fail('กรุณาเข้าสู่ระบบ', 401);
    const doc = Buffer.from(pdf[1], 'base64');
    if (sniff(doc) !== 'pdf') return fail('ไฟล์ PDF ไม่ถูกต้อง');
    if (doc.length > 3 * 1024 * 1024) return fail('ไฟล์ PDF ใหญ่เกิน 3 MB — กรุณาใช้ลิงก์ Google Drive แทน');
    if (!blobConfigured()) return fail('ยังไม่ได้เชื่อม Vercel Blob จึงอัปโหลดไฟล์ไม่ได้ — กรุณาใช้ลิงก์ Google Drive แทน');
    try {
      const res = await uploadToBlob(`docs/${Date.now()}.pdf`, doc, 'application/pdf');
      return ok({ url: res.url, storage: 'blob', access: res.access });
    } catch (e) {
      console.error('PDF upload failed:', e?.message || e);
      return fail('อัปโหลดไฟล์ไม่สำเร็จ กรุณาลองใหม่ หรือใช้ลิงก์ Google Drive แทน', 500);
    }
  }

  const m = /^data:image\/(png|jpeg|webp|gif);base64,([A-Za-z0-9+/=]+)$/.exec(String(b.dataUrl || ''));
  if (!m) return fail('รองรับเฉพาะไฟล์รูป PNG, JPG, WebP, GIF');
  const buf = Buffer.from(m[2], 'base64');
  const real = sniff(buf);
  if (!real || real !== m[1]) return fail('ไฟล์รูปไม่ถูกต้อง');
  const limit = s ? 3 * 1024 * 1024 : 900 * 1024;
  if (buf.length > limit) return fail('ไฟล์ใหญ่เกินไป');

  const inline = () => (buf.length <= 650 * 1024 ? ok({ url: `data:image/${real};base64,${m[2]}`, storage: 'inline' }) : fail('ไฟล์ใหญ่เกินไป กรุณาเลือกรูปที่เล็กลง'));
  if (!blobConfigured()) return inline();

  const ext = { png: 'png', jpeg: 'jpg', webp: 'webp', gif: 'gif' }[real];
  const folder = String(b.folder || 'misc').replace(/[^a-z0-9_-]/gi, '').slice(0, 20) || 'misc';
  try {
    const res = await uploadToBlob(`${folder}/${Date.now()}.${ext}`, buf, `image/${real}`);
    return ok({ url: res.url, storage: 'blob', access: res.access });
  } catch (e) {
    console.error('Blob upload failed, fallback to inline:', e?.message || e);
    return inline();
  }
}
