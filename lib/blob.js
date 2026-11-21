import { put, del } from '@vercel/blob';

// รองรับทั้งแบบ token (BLOB_READ_WRITE_TOKEN) และแบบใหม่ OIDC (BLOB_STORE_ID)
export const blobConfigured = () => Boolean(process.env.BLOB_READ_WRITE_TOKEN || process.env.BLOB_STORE_ID);

// ทดสอบเขียน-ลบไฟล์จริงบน Blob
export async function pingBlob() {
  const r = await put(`health/ping-${Date.now()}.txt`, 'ok', { access: 'public', contentType: 'text/plain', addRandomSuffix: true });
  try { await del(r.url); } catch { /* ไม่เป็นไร */ }
  return true;
}
