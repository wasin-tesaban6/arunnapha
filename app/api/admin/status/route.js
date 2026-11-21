import { requireAdmin, usingDefaultAdminPassword } from '@/lib/auth';
import { storageKind, pingDb } from '@/lib/db';
import { blobConfigured, pingBlob } from '@/lib/blob';
import { lineEnabled } from '@/lib/line';
import { ok, fail } from '@/lib/api';

export const dynamic = 'force-dynamic';

// ตรวจสุขภาพระบบ "ของจริง" (ลองเขียน-อ่านฐานข้อมูล / ?deep=1 ทดสอบอัปโหลดไฟล์ขึ้น Blob ด้วย — ใช้โควตา Blob จึงทำเฉพาะหน้า 'ระบบ')
export async function GET(req) {
  const deep = new URL(req.url).searchParams.get('deep') === '1';
  if (!(await requireAdmin())) return fail('ไม่มีสิทธิ์', 401);
  let dbOk = false, dbMs = 0, dbErr = '';
  try { dbMs = await pingDb(); dbOk = true; } catch (e) { dbErr = String(e?.message || e).slice(0, 200); }
  let blobOk = false, blobErr = '';
  if (blobConfigured() && deep) {
    try { await pingBlob(); blobOk = true; } catch (e) { blobErr = String(e?.message || e).slice(0, 200); }
  }
  return ok({
    ok: true,
    storage: storageKind, dbOk, dbMs, dbErr,
    blob: blobConfigured(), blobOk, blobErr, blobTested: deep,
    line: lineEnabled,
    lineOA: process.env.NEXT_PUBLIC_LINE_OA_ID || '',
    lineAdminKey: Boolean(process.env.LINE_ADMIN_KEY),
    authSecret: Boolean(process.env.AUTH_SECRET),
    defaultPassword: await usingDefaultAdminPassword().catch(() => false),
  });
}
