import { readPrivateBlob, BLOB_PATH_RE, blobConfigured } from '@/lib/blob';

export const runtime = 'nodejs';

// แสดงรูปจากที่เก็บ Vercel Blob แบบ Private
// ชื่อไฟล์มีรหัสสุ่มและไม่เปลี่ยน จึงให้ CDN ของ Vercel จำไว้ได้นาน → โหลดเร็ว
export async function GET(req, { params }) {
  const { path } = await params;
  const pathname = (path || []).join('/');
  if (!blobConfigured() || !BLOB_PATH_RE.test(pathname)) return new Response('Not found', { status: 404 });
  try {
    const r = await readPrivateBlob(pathname, req.headers.get('if-none-match') || undefined);
    if (!r) return new Response('Not found', { status: 404 });
    const cache = 'public, max-age=31536000, s-maxage=31536000, immutable';
    if (r.statusCode === 304) return new Response(null, { status: 304, headers: { ETag: r.blob.etag, 'Cache-Control': cache } });
    const type = r.blob.contentType || '';
    const isPdf = type === 'application/pdf' && pathname.startsWith('docs/');
    if (!/^image\/(png|jpeg|webp|gif)$/.test(type) && !isPdf) return new Response('Not found', { status: 404 });
    return new Response(r.stream, {
      headers: {
        'Content-Type': type, 'Content-Length': String(r.blob.size), ETag: r.blob.etag, 'Cache-Control': cache, 'X-Content-Type-Options': 'nosniff',
        ...(isPdf ? { 'Content-Disposition': 'inline', 'Content-Security-Policy': 'sandbox' } : {}),
      },
    });
  } catch (e) {
    console.error('blob read error', e?.message || e);
    return new Response('Not found', { status: 404 });
  }
}
