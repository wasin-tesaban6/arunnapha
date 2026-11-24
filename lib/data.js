import { db } from './db';
import { seedData } from './seed';
import { mergeTexts, mergeFeatures } from './texts';
import { oppStatus, todayISO, thDate } from './constants';

export async function getSettings() {
  const s = (await db.getDoc('settings')) || {};
  const merged = { ...seedData.settings, ...s };
  // ข้อความที่ยังไม่เคยแก้ และควรตามชื่อพรรค/โรงเรียนที่ตั้งไว้ → สร้างจากค่าจริง
  const texts = mergeTexts(s.texts);
  const saved = s.texts || {};
  const org = `${merged.councilName || ''} ${merged.schoolName || ''}`.trim();
  if (!saved.brandSub?.trim()) texts.brandSub = org;
  if (!saved.membersSub?.trim()) texts.membersSub = org;
  for (const [k, prefix] of [['policyTitle', 'นโยบายพรรค'], ['teamTitle', 'สมาชิกพรรค'], ['membersTitle', 'สมาชิกพรรค']]) {
    if (!saved[k]?.trim()) texts[k] = prefix + (merged.partyName || '');
  }
  return {
    ...merged,
    contact: { ...seedData.settings.contact, ...(s.contact || {}) },
    texts,
    features: mergeFeatures(s.features),
  };
}

export function publicMember(m) {
  if (!m) return null;
  const { passwordHash, username, ...rest } = m;
  return rest;
}

// ย้าย "ผลงาน" แบบเดิม (การ์ดรูป) ไปเป็นข้อความสั้น ๆ ในช่อง "ผลงาน" ของสมาชิกแต่ละคน — ทำครั้งเดียว
let migrating = null;
function migrateWorksOnce() {
  if (!migrating) {
    migrating = (async () => {
      if (!(await db.setnx('migrated_works_to_profile_v1', Date.now()))) return;
      const works = (await db.list('works')).filter((w) => !w.hidden && w.memberId);
      if (!works.length) return;
      const byMember = new Map();
      for (const w of works) byMember.set(w.memberId, [...(byMember.get(w.memberId) || []), w]);
      for (const [mid, list] of byMember) {
        const m = await db.get('members', mid);
        if (!m || (m.achievements || '').trim()) continue;
        list.sort((a, b) => String(b.date || '').localeCompare(String(a.date || '')));
        const text = list.map((w) => `• ${w.title}${w.date ? ` (${thDate(w.date)})` : ''}`).join('\n');
        await db.put('members', { ...m, achievements: text.slice(0, 4000), updatedAt: Date.now() });
      }
    })().catch((e) => { console.error('migrate works', e); });
  }
  return migrating;
}

export async function getMembers() {
  await migrateWorksOnce();
  const list = await db.list('members');
  return list
    .filter((m) => m.active !== false)
    .sort((a, b) => (a.order ?? 999) - (b.order ?? 999) || (a.createdAt || 0) - (b.createdAt || 0))
    .map(publicMember);
}
export async function getMember(id) {
  await migrateWorksOnce();
  const m = await db.get('members', id);
  return m && m.active !== false ? publicMember(m) : null;
}

const byDateDesc = (a, b) => String(b.date || '').localeCompare(String(a.date || '')) || (b.createdAt || 0) - (a.createdAt || 0);

// จิตอาสาวิชาการ: ที่กำลังจะมาถึงขึ้นก่อน (เรียงใกล้สุด) แล้วตามด้วยที่ผ่านมาแล้ว (ล่าสุดก่อน)
export async function getVolunteer() {
  const today = todayISO();
  const list = (await db.list('volunteer')).filter((v) => !v.hidden);
  const up = list.filter((v) => !v.date || v.date >= today).sort((a, b) => String(a.date || '9999').localeCompare(String(b.date || '9999')) || (b.createdAt || 0) - (a.createdAt || 0));
  const past = list.filter((v) => v.date && v.date < today).sort((a, b) => b.date.localeCompare(a.date));
  return [...up, ...past];
}

// ศูนย์รวมผลงาน: เปิดรับ (ใกล้ปิดก่อน) → ยังไม่เปิด → ไม่ระบุวัน → ปิดแล้ว
export async function getOpportunities() {
  const today = todayISO();
  const rank = { open: 0, soon: 1, always: 2, closed: 3 };
  return (await db.list('opportunities')).filter((o) => !o.hidden)
    .map((o) => ({ ...o, status: oppStatus(o, today) }))
    .sort((a, b) => rank[a.status.key] - rank[b.status.key]
      || (a.status.key === 'closed' ? String(b.closeDate).localeCompare(String(a.closeDate)) : String(a.closeDate || a.openDate || '9999').localeCompare(String(b.closeDate || b.openDate || '9999'))));
}

export async function getEvents() {
  return (await db.list('events')).sort((a, b) => String(a.date).localeCompare(String(b.date)) || String(a.time || '').localeCompare(String(b.time || '')));
}
export async function getEvent(id) { return db.get('events', id); }

export async function getQuestions(eventId) {
  const all = await db.list('questions');
  return all
    .filter((q) => !q.hidden && (!eventId || q.eventId === eventId))
    .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
}

export function publicListing(x) {
  if (!x) return null;
  const { manageCode, sellerNo, ...rest } = x;
  return rest;
}
export async function getMarket() {
  const now = Date.now();
  return (await db.list('market'))
    .filter((x) => (x.status === 'approved' || x.status === 'sold') && (!x.expiresAt || x.expiresAt > now || x.status === 'sold'))
    .sort((a, b) => (a.status === 'sold') - (b.status === 'sold') || (b.approvedAt || b.createdAt || 0) - (a.approvedAt || a.createdAt || 0))
    .map(publicListing);
}

export function publicIssue(i) {
  if (!i) return null;
  return {
    code: i.code, category: i.category, location: i.location, detail: i.detail, photo: i.photo,
    status: i.status, timeline: (i.timeline || []).map((t) => ({ status: t.status, note: t.note || '', at: t.at })),
    createdAt: i.createdAt, updatedAt: i.updatedAt,
  };
}
export async function getIssueStats() {
  const all = await db.list('issues');
  const s = { total: all.length, received: 0, reviewing: 0, in_progress: 0, done: 0, rejected: 0 };
  for (const i of all) s[i.status] = (s[i.status] || 0) + 1;
  return s;
}
