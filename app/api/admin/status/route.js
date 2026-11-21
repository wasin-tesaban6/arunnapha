import { requireAdmin } from '@/lib/auth';
import { storageKind } from '@/lib/db';
import { lineEnabled } from '@/lib/line';
import { ok, fail } from '@/lib/api';

export const dynamic = 'force-dynamic';
export async function GET() {
  if (!(await requireAdmin())) return fail('ไม่มีสิทธิ์', 401);
  return ok({
    ok: true,
    storage: storageKind,
    blob: Boolean(process.env.BLOB_READ_WRITE_TOKEN || process.env.BLOB_STORE_ID),
    line: lineEnabled,
    lineOA: process.env.NEXT_PUBLIC_LINE_OA_ID || '',
    lineAdminKey: Boolean(process.env.LINE_ADMIN_KEY),
    authSecret: Boolean(process.env.AUTH_SECRET),
  });
}
