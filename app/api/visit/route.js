import { stats } from '@/lib/db';
import { ok, fail, rateLimit } from '@/lib/api';
import { todayISO } from '@/lib/constants';

export const dynamic = 'force-dynamic';

// คีย์สถิติตามวันที่เวลาไทย: วัน / เดือน / ปี
function keys() {
  const d = todayISO(); // YYYY-MM-DD (Asia/Bangkok)
  return [`visits:d:${d}`, `visits:m:${d.slice(0, 7)}`, `visits:y:${d.slice(0, 4)}`];
}
const shape = ([day, month, year]) => ({ day, month, year });

// ดูยอดผู้เข้าชม
export async function GET() {
  try {
    return ok({ visits: shape(await stats.get(keys())) });
  } catch (e) {
    console.error('visit get', e);
    return fail('ไม่สามารถโหลดสถิติได้', 500);
  }
}

// นับผู้เข้าชม (หน้าเว็บเรียกวันละครั้งต่อเครื่อง)
export async function POST(req) {
  try {
    const k = keys();
    if (!(await rateLimit(req, 'visit', 20, 3600))) return ok({ visits: shape(await stats.get(k)) });
    return ok({ visits: shape(await stats.incr(k)) });
  } catch (e) {
    console.error('visit post', e);
    return fail('ไม่สามารถบันทึกสถิติได้', 500);
  }
}
