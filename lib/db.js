// ชั้นจัดเก็บข้อมูล (Storage adapter)
// - บน Vercel: ใช้ Upstash Redis (เชื่อมผ่าน Vercel Marketplace → env KV_REST_API_URL / KV_REST_API_TOKEN)
// - เครื่องตัวเอง (npm run dev): เก็บไฟล์ .data/db.json อัตโนมัติ
// - ถ้าไม่มีทั้งสองอย่าง: เก็บในหน่วยความจำชั่วคราว (ข้อมูลหายเมื่อเซิร์ฟเวอร์รีสตาร์ต)
import { Redis } from '@upstash/redis';
import { promises as fs } from 'fs';
import path from 'path';
import { seedData } from './seed';

const PREFIX = 'sc6:';
const COLLECTIONS = ['members', 'works', 'events', 'questions', 'issues', 'market'];

const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

function parse(v) {
  if (v == null) return null;
  if (typeof v === 'string') {
    try { return JSON.parse(v); } catch { return v; }
  }
  return v;
}

/* ---------- Redis backend ---------- */
function redisBackend() {
  const r = new Redis({ url, token, automaticDeserialization: false });
  return {
    kind: 'redis',
    async getDoc(key) { return parse(await r.get(PREFIX + key)); },
    async setDoc(key, val) { await r.set(PREFIX + key, JSON.stringify(val)); },
    async list(col) {
      const h = await r.hgetall(PREFIX + col);
      return h ? Object.values(h).map(parse) : [];
    },
    async get(col, id) { return parse(await r.hget(PREFIX + col, id)); },
    async put(col, obj) { await r.hset(PREFIX + col, { [obj.id]: JSON.stringify(obj) }); return obj; },
    async del(col, id) { await r.hdel(PREFIX + col, id); },
    async setnx(key, val) { return (await r.set(PREFIX + key, JSON.stringify(val), { nx: true })) === 'OK'; },
  };
}

/* ---------- File / memory backend ---------- */
function localBackend(useFile) {
  const file = path.join(process.cwd(), '.data', 'db.json');
  const g = globalThis;
  g.__sc6mem = g.__sc6mem || { docs: {}, cols: {} };
  let loaded = !useFile;
  let chain = Promise.resolve();

  async function load() {
    if (loaded) return;
    try { g.__sc6mem = JSON.parse(await fs.readFile(file, 'utf8')); } catch { /* new file */ }
    g.__sc6mem.docs ||= {}; g.__sc6mem.cols ||= {};
    loaded = true;
  }
  async function save() {
    if (!useFile) return;
    chain = chain.then(async () => {
      await fs.mkdir(path.dirname(file), { recursive: true });
      await fs.writeFile(file, JSON.stringify(g.__sc6mem, null, 1));
    }).catch(() => {});
    return chain;
  }
  const m = () => g.__sc6mem;
  return {
    kind: useFile ? 'file' : 'memory',
    async getDoc(key) { await load(); return m().docs[key] ?? null; },
    async setDoc(key, val) { await load(); m().docs[key] = val; await save(); },
    async list(col) { await load(); return Object.values(m().cols[col] || {}); },
    async get(col, id) { await load(); return (m().cols[col] || {})[id] ?? null; },
    async put(col, obj) { await load(); (m().cols[col] ||= {})[obj.id] = obj; await save(); return obj; },
    async del(col, id) { await load(); if (m().cols[col]) delete m().cols[col][id]; await save(); },
    async setnx(key, val) { await load(); if (key in m().docs) return false; m().docs[key] = val; await save(); return true; },
  };
}

function pick() {
  if (url && token) return redisBackend();
  // บน Vercel ระบบไฟล์เขียนไม่ได้ → ใช้หน่วยความจำ
  return localBackend(!process.env.VERCEL);
}

const backend = globalThis.__sc6backend || (globalThis.__sc6backend = pick());
export const storageKind = backend.kind;

let seeding = null;
async function ensureSeed() {
  if (!seeding) {
    seeding = (async () => {
      const first = await backend.setnx('seeded', Date.now());
      if (!first) return;
      await backend.setDoc('settings', seedData.settings);
      for (const col of COLLECTIONS) {
        for (const item of seedData[col] || []) await backend.put(col, item);
      }
    })().catch((e) => { seeding = null; throw e; });
  }
  return seeding;
}

export const db = {
  async getDoc(key) { await ensureSeed(); return backend.getDoc(key); },
  async setDoc(key, val) { await ensureSeed(); return backend.setDoc(key, val); },
  async list(col) { await ensureSeed(); return backend.list(col); },
  async get(col, id) { await ensureSeed(); return backend.get(col, id); },
  async put(col, obj) { await ensureSeed(); return backend.put(col, obj); },
  async del(col, id) { await ensureSeed(); return backend.del(col, id); },
};

export const COLLECTION_NAMES = COLLECTIONS;

export function newId(prefix = '') {
  const t = Date.now().toString(36);
  const r = Math.random().toString(36).slice(2, 7);
  return prefix + t + r;
}
