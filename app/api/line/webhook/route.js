import { db } from '@/lib/db';
import { verifyLineSignature, lineReply, issueText, siteUrl, lineEnabled } from '@/lib/line';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const help = () => {
  const u = siteUrl();
  return [
    'สวัสดีครับ 🙏 นี่คือระบบแจ้งปัญหา สภานักเรียน CRMS6 | อรุณนภา',
    '',
    '• แจ้งปัญหาใหม่: ' + (u ? `${u}/report` : 'สแกน QR Code ในโรงเรียน'),
    '• ติดตามเรื่อง: พิมพ์รหัสเรื่อง เช่น CR7K2QXA',
    '  แล้วระบบจะส่งความคืบหน้าให้ทาง LINE อัตโนมัติทุกครั้งที่มีการอัปเดต',
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

    // ติดตามเรื่องด้วยรหัส
    const m = /CR[\s-]?([A-Z0-9]{6})/i.exec(text);
    if (m) {
      const code = ('CR' + m[1]).toUpperCase();
      const issue = await db.get('issues', code);
      if (!issue) { await lineReply(ev.replyToken, [{ type: 'text', text: `ไม่พบรหัสเรื่อง ${code} กรุณาตรวจสอบอีกครั้ง` }]); continue; }
      if (src.userId && !(issue.lineSubs || []).includes(src.userId)) {
        issue.lineSubs = [...(issue.lineSubs || []), src.userId].slice(-10);
        await db.put('issues', issue);
      }
      await lineReply(ev.replyToken, [{ type: 'text', text: issueText(issue, '✅ เริ่มติดตามเรื่องแล้ว จะแจ้งเตือนเมื่อมีความคืบหน้า') }]);
      continue;
    }
    if (src.type === 'user') await lineReply(ev.replyToken, [{ type: 'text', text: help() }]);
  }
  return new Response('ok');
}
