// ชั้นจัดเก็บข้อมูล (Storage adapter)
// - บน Vercel: ใช้ Upstash Redis (เชื่อมผ่าน Vercel Marketplace → env KV_REST_API_URL / KV_REST_API_TOKEN)
// - เครื่องตัวเอง (npm run dev): เก็บไฟล์ .data/db.json อัตโนมัติ
// - ถ้าไม่มีทั้งสองอย่าง: เก็บในหน่วยความจำชั่วคราว (ข้อมูลหายเมื่อเซิร์ฟเวอร์รีสตาร์ต)
import https from 'https';
import http from 'http';
import { promises as fs } from 'fs';
import path from 'path';
import { seedData } from './seed';

const PREFIX = 'sc6:';
const COLLECTIONS = ['members', 'works', 'events', 'questions', 'issues', 'market', 'volunteer', 'opportunities'];

const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

function parse(v) {
  if (v == null) return null;
  if (typeof v === 'string') {
    try { return JSON.parse(v); } catch { return v; }
  }
  return v;
}

/* ---------- Redis backend (Upstash REST) ----------
   เขียน client เองด้วยโมดูล https ของ Node โดยตรง เพื่อ:
   - ไม่ถูก Next.js ดักจับ fetch (ทำให้หน้าเว็บแคชแบบ ISR ได้ปกติ ไม่เกิด error ตอนรีเฟรชข้อมูล)
   - คุมรูปแบบข้อมูลได้แน่นอน + ตั้ง timeout / retry เอง */
function redisBackend() {
  const base = new URL(url);
  const lib = base.protocol === 'http:' ? http : https;
  const agent = new lib.Agent({ keepAlive: true, maxSockets: 20 });

  function request(path, payload, attempt = 0) {
    const data = JSON.stringify(payload);
    return new Promise((resolve, reject) => {
      const req = lib.request({
        protocol: base.protocol, hostname: base.hostname, port: base.port || undefined,
        path: (base.pathname.replace(/\/$/, '') || '') + path, method: 'POST', agent,
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) },
        timeout: 8000,
      }, (res) => {
        let buf = '';
        res.setEncoding('utf8');
        res.on('data', (c) => (buf += c));
        res.on('end', () => {
          let j;
          try { j = JSON.parse(buf); } catch { return reject(new Error(`Redis ตอบกลับผิดรูปแบบ (HTTP ${res.statusCode})`)); }
          if (res.statusCode >= 400 && !Array.isArray(j)) return reject(new Error(`Redis: ${j.error || res.statusCode}`));
          resolve(j);
        });
      });
      req.on('timeout', () => req.destroy(new Error('Redis timeout')));
      req.on('error', (e) => {
        if (attempt < 2) setTimeout(() => request(path, payload, attempt + 1).then(resolve, reject), 150 * (attempt + 1));
        else reject(e);
      });
      req.end(data);
    });
  }
  const cmd = async (...args) => {
    const j = await request('', args.map(String));
    if (j.error) throw new Error('Redis: ' + j.error);
    return j.result;
  };
  const pipeline = async (cmds) => {
    const j = await request('/pipeline', cmds.map((c) => c.map(String)));
    return j.map((x) => { if (x.error) throw new Error('Redis: ' + x.error); return x.result; });
  };
  const pairs = (arr) => {
    const out = [];
    if (Array.isArray(arr)) for (let i = 1; i < arr.length; i += 2) out.push(parse(arr[i]));
    else if (arr && typeof arr === 'object') for (const v of Object.values(arr)) out.push(parse(v));
    return out.filter((x) => x && typeof x === 'object');
  };
  const K = (k) => PREFIX + k;
  return {
    kind: 'redis',
    async getDoc(key) { return parse(await cmd('GET', K(key))); },
    async setDoc(key, val) { await cmd('SET', K(key), JSON.stringify(val)); },
    async list(col) { return pairs(await cmd('HGETALL', K(col))); },
    async get(col, id) { return parse(await cmd('HGET', K(col), id)); },
    async put(col, obj) { await cmd('HSET', K(col), obj.id, JSON.stringify(obj)); return obj; },
    async del(col, id) { await cmd('HDEL', K(col), id); },
    async setnx(key, val) { return (await cmd('SET', K(key), JSON.stringify(val), 'NX')) === 'OK'; },
    // ตัวนับพร้อมหมดอายุ (ใช้กันสแปม/กันเดารหัสผ่าน — ทำงานร่วมกันทุกเซิร์ฟเวอร์)
    async incr(key, ttlSec) {
      const k = K('rl:' + key);
      const [, n] = await pipeline([['SET', k, 0, 'EX', ttlSec, 'NX'], ['INCR', k]]);
      return Number(n);
    },
    async delKey(key) { await cmd('DEL', K('rl:' + key)); },
    async peek(key) { return Number((await cmd('GET', K('rl:' + key))) || 0); },
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
    async incr(key, ttlSec) {
      const c = (globalThis.__sc6cnt ||= new Map());
      const now = Date.now();
      const e = c.get(key);
      if (!e || e.exp < now) { c.set(key, { n: 1, exp: now + ttlSec * 1000 }); return 1; }
      e.n += 1;
      return e.n;
    },
    async delKey(key) { globalThis.__sc6cnt?.delete(key); },
    async peek(key) { const e = globalThis.__sc6cnt?.get(key); return e && e.exp > Date.now() ? e.n : 0; },
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
  async setnx(key, val) { await ensureSeed(); return backend.setnx(key, val); },
};

export const COLLECTION_NAMES = COLLECTIONS;

export const counter = {
  incr: (key, ttlSec) => backend.incr(key, ttlSec),
  reset: (key) => backend.delKey(key),
  peek: (key) => backend.peek(key),
};

// ทดสอบการเขียน-อ่านฐานข้อมูลจริง
export async function pingDb() {
  const t = Date.now();
  await backend.setDoc('health', t);
  const v = await backend.getDoc('health');
  if (Number(v) !== t) throw new Error('อ่านค่าที่เขียนไม่ตรงกัน');
  return Date.now() - t;
}

export function newId(prefix = '') {
  const t = Date.now().toString(36);
  const r = Math.random().toString(36).slice(2, 7);
  return prefix + t + r;
}
