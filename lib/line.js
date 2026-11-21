// LINE Messaging API (ไม่บังคับ) — ตั้งค่า env:
// LINE_CHANNEL_ACCESS_TOKEN, LINE_CHANNEL_SECRET, NEXT_PUBLIC_LINE_OA_ID (เช่น @123abcde), LINE_ADMIN_KEY
import crypto from 'crypto';
import { db } from './db';
import { ISSUE_STATUS } from './constants';

const TOKEN = process.env.LINE_CHANNEL_ACCESS_TOKEN;
const SECRET = process.env.LINE_CHANNEL_SECRET;
export const lineEnabled = Boolean(TOKEN && SECRET);

export function verifyLineSignature(body, signature) {
  if (!SECRET || !signature) return false;
  const h = crypto.createHmac('sha256', SECRET).update(body).digest('base64');
  const a = Buffer.from(h), b = Buffer.from(signature);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

async function call(path, payload) {
  if (!TOKEN) return;
  try {
    await fetch('https://api.line.me/v2/bot/message/' + path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${TOKEN}` },
      body: JSON.stringify(payload),
    });
  } catch (e) { console.error('LINE error', e); }
}

export const lineReply = (replyToken, messages) => call('reply', { replyToken, messages });
export const linePush = (to, messages) => call('push', { to, messages });

export function siteUrl() {
  const u = process.env.NEXT_PUBLIC_SITE_URL || (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : '');
  return u.replace(/\/$/, '');
}

export function issueText(issue, head = '') {
  const st = ISSUE_STATUS[issue.status]?.label || issue.status;
  const last = (issue.timeline || []).slice(-1)[0];
  const lines = [
    head || '📋 สถานะเรื่องที่แจ้ง',
    `รหัส: ${issue.code}`,
    `หมวด: ${issue.category}`,
    `สถานที่: ${issue.location || '-'}`,
    `สถานะ: ${st}`,
  ];
  if (last?.note) lines.push(`หมายเหตุ: ${last.note}`);
  const u = siteUrl();
  if (u) lines.push(`ติดตามแบบ Real-Time: ${u}/track/${issue.code}`);
  return lines.join('\n');
}

export async function notifyAdmins(text) {
  if (!lineEnabled) return;
  const targets = (await db.getDoc('line_admins')) || [];
  await Promise.all(targets.map((t) => linePush(t, [{ type: 'text', text }])));
}

export async function notifySubscribers(issue, head) {
  if (!lineEnabled || !issue.lineSubs?.length) return;
  await Promise.all(issue.lineSubs.map((u) => linePush(u, [{ type: 'text', text: issueText(issue, head) }])));
}
