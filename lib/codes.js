import crypto from 'crypto';

// รูปแบบรหัสรับเรื่อง: CRMS6 + ตัวย่อของงาน + รหัสสุ่ม 6 ตัว
//   แจ้งปัญหา (QR Code) → CRMS6QR7K2QXA
//   ตลาดออนไลน์         → CRMS6MK4HD9PT
//   จิตอาสาวิชาการ       → CRMS6VL8RW3KD
// จะเพิ่มงานใหม่ ให้เติมตัวย่อในรายการนี้
export const CODE_PREFIX = 'CRMS6';
export const CODE_TYPES = { issue: 'QR', market: 'MK', volunteer: 'VL' };

// ตัดตัวที่สับสนง่ายออก (0/O, 1/I/L) และสุ่มด้วย crypto (เดายาก)
const ABC = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
const RANDOM_LEN = 6;

export function makeCode(type) {
  const abbr = CODE_TYPES[type];
  if (!abbr) throw new Error('unknown code type: ' + type);
  const rnd = Array.from(crypto.randomBytes(RANDOM_LEN), (b) => ABC[b % ABC.length]).join('');
  return CODE_PREFIX + abbr + rnd;
}

// ทำให้รหัสที่ผู้ใช้พิมพ์เป็นรูปแบบมาตรฐาน (ตัวใหญ่ ตัดช่องว่าง/ขีด)
export const normalizeCode = (v) => String(v || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 30);
