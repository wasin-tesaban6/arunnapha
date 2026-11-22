import { getSettings } from '@/lib/data';

export const dynamic = 'force-dynamic';

// ไอคอนบนแท็บเบราว์เซอร์ = โลโก้ที่อัปโหลดในหน้า /admin
// (ลิงก์มี ?v=รหัสเวอร์ชัน เปลี่ยนโลโก้เมื่อไหร่ เบราว์เซอร์จะโหลดไอคอนใหม่ทันที)
export async function GET(req) {
  const s = await getSettings();
  const logo = s.logoUrl || '/logo.svg';
  const cache = new URL(req.url).searchParams.get('v') ? 'public, max-age=31536000, immutable' : 'public, max-age=300';
  const m = /^data:(image\/(?:png|jpeg|webp|gif));base64,(.+)$/.exec(logo);
  if (m) {
    return new Response(Buffer.from(m[2], 'base64'), { headers: { 'Content-Type': m[1], 'Cache-Control': cache } });
  }
  const target = /^https:\/\//.test(logo) ? logo : new URL(logo.startsWith('/') ? logo : '/logo.svg', req.url).toString();
  return new Response(null, { status: 302, headers: { Location: target, 'Cache-Control': cache } });
}
