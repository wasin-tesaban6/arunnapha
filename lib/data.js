import { db } from './db';
import { seedData } from './seed';

export async function getSettings() {
  const s = (await db.getDoc('settings')) || {};
  return { ...seedData.settings, ...s, contact: { ...seedData.settings.contact, ...(s.contact || {}) } };
}

export function publicMember(m) {
  if (!m) return null;
  const { passwordHash, username, ...rest } = m;
  return rest;
}

export async function getMembers() {
  const list = await db.list('members');
  return list
    .filter((m) => m.active !== false)
    .sort((a, b) => (a.order ?? 999) - (b.order ?? 999) || (a.createdAt || 0) - (b.createdAt || 0))
    .map(publicMember);
}
export async function getMember(id) {
  const m = await db.get('members', id);
  return m && m.active !== false ? publicMember(m) : null;
}

const byDateDesc = (a, b) => String(b.date || '').localeCompare(String(a.date || '')) || (b.createdAt || 0) - (a.createdAt || 0);

export async function getWorks() {
  return (await db.list('works')).filter((w) => !w.hidden).sort(byDateDesc);
}
export async function getWork(id) {
  const w = await db.get('works', id);
  return w && !w.hidden ? w : null;
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
