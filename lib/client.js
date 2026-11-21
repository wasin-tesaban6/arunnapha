'use client';
// ยูทิลิตี้ฝั่งเบราว์เซอร์

// บีบอัดรูปก่อนอัปโหลด: ย่อด้านยาวสุดไม่เกิน max px แล้วแปลงเป็น WebP/JPEG → โหลดเร็ว
export async function compressImage(file, max = 1280, quality = 0.82) {
  if (!file.type.startsWith('image/')) throw new Error('กรุณาเลือกไฟล์รูปภาพ');
  if (file.type === 'image/gif' && file.size < 900 * 1024) return readAsDataURL(file);
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = () => rej(new Error('อ่านรูปไม่ได้')); i.src = url; });
    const scale = Math.min(1, max / Math.max(img.width, img.height));
    const w = Math.round(img.width * scale), h = Math.round(img.height * scale);
    const c = document.createElement('canvas');
    c.width = w; c.height = h;
    const ctx = c.getContext('2d');
    ctx.drawImage(img, 0, 0, w, h);
    let out = c.toDataURL('image/webp', quality);
    if (!out.startsWith('data:image/webp')) out = c.toDataURL('image/jpeg', quality);
    return out;
  } finally { URL.revokeObjectURL(url); }
}
function readAsDataURL(file) {
  return new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(r.result); r.onerror = rej; r.readAsDataURL(file); });
}

export async function uploadImage(file, folder = 'misc', max = 1280) {
  const dataUrl = await compressImage(file, max);
  const r = await api('/api/upload', { dataUrl, folder });
  return r.url;
}

export async function api(url, data, method) {
  const res = await fetch(url, {
    method: method || (data === undefined ? 'GET' : 'POST'),
    headers: data !== undefined ? { 'Content-Type': 'application/json' } : undefined,
    body: data !== undefined ? JSON.stringify(data) : undefined,
    cache: 'no-store',
  });
  let j = {};
  try { j = await res.json(); } catch { /* empty */ }
  if (!res.ok || j.ok === false) throw new Error(j.error || `เกิดข้อผิดพลาด (${res.status})`);
  return j;
}
