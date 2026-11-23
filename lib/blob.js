import { put, del, get } from '@vercel/blob';

// รองรับทั้งแบบ token (BLOB_READ_WRITE_TOKEN) และแบบใหม่ OIDC (BLOB_STORE_ID)
export const blobConfigured = () => Boolean(process.env.BLOB_READ_WRITE_TOKEN || process.env.BLOB_STORE_ID);

// โฟลเดอร์ที่ระบบใช้เก็บรูป (route /api/blob อ่านได้เฉพาะโฟลเดอร์เหล่านี้)
export const BLOB_FOLDERS = ['issues', 'market', 'members', 'works', 'events', 'brand', 'hero', 'misc'];
export const BLOB_PATH_RE = new RegExp(`^(${BLOB_FOLDERS.join('|')})/[A-Za-z0-9._-]{1,200}$`);

// ที่เก็บ Blob เป็นแบบ Public หรือ Private:
// - ตั้ง env BLOB_ACCESS=public / private ได้ (ไม่บังคับ)
// - ไม่ตั้ง: ลองแบบ public ก่อน ถ้าที่เก็บเป็น private ระบบจะสลับให้อัตโนมัติ
const g = globalThis;
const envAccess = ['public', 'private'].includes(process.env.BLOB_ACCESS) ? process.env.BLOB_ACCESS : null;
const currentAccess = () => envAccess || g.__sc6blobAccess || 'public';
const isAccessMismatch = (e) => /private access on a public store|public access on a private store|configured with (private|public) access/i.test(String(e?.message || e));

// อัปโหลด แล้วคืน URL ที่ใช้แสดงผลได้
// public  → URL ของ CDN Blob โดยตรง
// private → /api/blob/<path> (เว็บดึงไฟล์ให้ และให้ CDN ของ Vercel จำไว้)
export async function uploadToBlob(pathname, data, contentType) {
  const run = (access) => put(pathname, data, { access, contentType, addRandomSuffix: true, cacheControlMaxAge: 31536000 });
  let access = currentAccess();
  let res;
  try {
    res = await run(access);
  } catch (e) {
    if (envAccess || !isAccessMismatch(e)) throw e;
    access = access === 'public' ? 'private' : 'public';
    res = await run(access);
  }
  g.__sc6blobAccess = access;
  return { url: access === 'private' ? `/api/blob/${res.pathname}` : res.url, access, rawUrl: res.url };
}

// อ่านไฟล์จากที่เก็บแบบ private
export function readPrivateBlob(pathname, ifNoneMatch) {
  return get(pathname, { access: 'private', ...(ifNoneMatch ? { ifNoneMatch } : {}) });
}

// ทดสอบเขียน-ลบไฟล์จริงบน Blob
export async function pingBlob() {
  const r = await uploadToBlob(`misc/health-${Date.now()}.txt`, 'ok', 'text/plain');
  try { await del(r.rawUrl); } catch { /* ไม่เป็นไร */ }
  return r.access;
}
