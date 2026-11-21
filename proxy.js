import { NextResponse } from 'next/server';

// กัน CSRF: คำขอที่เปลี่ยนข้อมูล (POST/PUT/DELETE) ไปยัง /api ต้องมาจากเว็บนี้เท่านั้น
// (ยกเว้น LINE webhook ซึ่งตรวจลายเซ็นของ LINE แยกต่างหาก)
export function proxy(request) {
  const { method, nextUrl, headers } = request;
  if (method === 'GET' || method === 'HEAD' || method === 'OPTIONS') return NextResponse.next();
  if (nextUrl.pathname.startsWith('/api/line/')) return NextResponse.next();

  const origin = headers.get('origin');
  const host = headers.get('x-forwarded-host') || headers.get('host');
  const site = headers.get('sec-fetch-site');
  if (site && site !== 'same-origin' && site !== 'none') return deny();
  if (origin) {
    try { if (new URL(origin).host !== host) return deny(); } catch { return deny(); }
  }
  return NextResponse.next();
}

function deny() {
  return NextResponse.json({ ok: false, error: 'คำขอไม่ได้มาจากเว็บไซต์นี้' }, { status: 403 });
}

export const config = { matcher: '/api/:path*' };
