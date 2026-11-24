import { db } from '@/lib/db';
import { verifyLineSignature, lineReply, siteUrl, lineEnabled } from '@/lib/line';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const help = () => {
  const u = siteUrl();
  return [
    'สวัสดีครับ 🙏 นี่คือระบบแจ้งปัญหา สภานักเรียน CRMS6 | อรุณนภา',
    '',
    '• แจ้งปัญหา: พิมพ์รายละเอียด สถานที่ และส่งรูปภาพในแชตนี้ได้เลย',
    '  สภานักเรียนจะตรวจสอบและแจ้งความคืบหน้ากลับในแชต',
  ].join('\n');
};

export async function GET() {
  return Response.json({ ok: true, line: lineEnabled });
}

export async function POST(req) {
  const raw = await req.text();
  if (!verifyLineSignature(raw, req.headers.get('x-line-signature'))) return new Response('bad signature', { status: 401 });
  let payload;
  try { payload = JSON.parse(raw); } catch { return new Response('ok'); }

  for (const ev of payload.events || []) {
    const src = ev.source || {};
    const target = src.groupId || src.roomId || src.userId;
    if (ev.type === 'follow') { await lineReply(ev.replyToken, [{ type: 'text', text: help() }]); continue; }
    if (ev.type !== 'message' || ev.message?.type !== 'text') continue;
    const text = String(ev.message.text || '').trim();

    // ลงทะเบียนรับแจ้งเตือนสำหรับแอดมิน/กลุ่มสภา: "ADMIN <LINE_ADMIN_KEY>"
    const adm = /^admin\s+(\S+)$/i.exec(text);
    if (adm) {
      const key = process.env.LINE_ADMIN_KEY;
      if (key && adm[1] === key && target) {
        const list = (await db.getDoc('line_admins')) || [];
        if (!list.includes(target)) list.push(target);
        await db.setDoc('line_admins', list);
        await lineReply(ev.replyToken, [{ type: 'text', text: '✅ ลงทะเบียนรับแจ้งเตือนเรื่องใหม่ / คำถาม / ประกาศฝากขาย เรียบร้อย\n(พิมพ์ "ADMIN OFF" เพื่อยกเลิก)' }]);
      } else {
        await lineReply(ev.replyToken, [{ type: 'text', text: '❌ รหัสแอดมินไม่ถูกต้อง' }]);
      }
      continue;
    }
    if (/^admin\s+off$/i.test(text)) {
      const list = ((await db.getDoc('line_admins')) || []).filter((t) => t !== target);
      await db.setDoc('line_admins', list);
      await lineReply(ev.replyToken, [{ type: 'text', text: 'ยกเลิกการรับแจ้งเตือนแล้ว' }]);
      continue;
    }

    if (src.type === 'user') await lineReply(ev.replyToken, [{ type: 'text', text: help() }]);
  }
  return new Response('ok');
}
