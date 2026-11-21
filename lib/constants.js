export const WORK_CATEGORIES = ['จิตอาสา', 'วิชาการ', 'กิจกรรม', 'รางวัล/เกียรติบัตร', 'โครงการสภา', 'อื่น ๆ'];

export const EVENT_CATEGORIES = [
  { key: 'วิชาการ', color: '#1e6fd9' },
  { key: 'กิจกรรม', color: '#0ea5a4' },
  { key: 'สอบ', color: '#e11d48' },
  { key: 'ประชุม', color: '#7c3aed' },
  { key: 'วันหยุด', color: '#f59e0b' },
  { key: 'ประกาศ', color: '#0891b2' },
  { key: 'อื่น ๆ', color: '#64748b' },
];
export const eventColor = (c) => (EVENT_CATEGORIES.find((x) => x.key === c) || EVENT_CATEGORIES[6]).color;

export const ISSUE_STATUS = {
  received: { label: 'รับเรื่องแล้ว', color: '#64748b', step: 1 },
  reviewing: { label: 'กำลังตรวจสอบ', color: '#f59e0b', step: 2 },
  in_progress: { label: 'กำลังดำเนินการ', color: '#1e6fd9', step: 3 },
  done: { label: 'ดำเนินการเสร็จสิ้น', color: '#16a34a', step: 4 },
  rejected: { label: 'ไม่สามารถดำเนินการได้', color: '#dc2626', step: 4 },
};
export const ISSUE_FLOW = ['received', 'reviewing', 'in_progress', 'done'];

export const MARKET_CATEGORIES = ['อาหาร/ขนม', 'เครื่องดื่ม', 'เครื่องเขียน', 'งานฝีมือ/DIY', 'เสื้อผ้า/เครื่องประดับ', 'หนังสือ/ชีทสรุป', 'บริการ', 'อื่น ๆ'];
export const MARKET_STATUS = {
  pending: { label: 'รออนุมัติ', color: '#f59e0b' },
  approved: { label: 'กำลังขาย', color: '#16a34a' },
  sold: { label: 'ขายแล้ว', color: '#64748b' },
  rejected: { label: 'ไม่อนุมัติ', color: '#dc2626' },
};

export const ASKER_ROLES = ['นักเรียน', 'ครู/บุคลากร', 'ผู้ปกครอง', 'อื่น ๆ'];

export const TH_MONTHS = ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'];
export const TH_MONTHS_SHORT = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
export const TH_DAYS_SHORT = ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'];

// "2026-11-22" -> "22 พ.ย. 2569"
export function thDate(iso, long = false) {
  if (!iso) return '';
  const [y, m, d] = String(iso).slice(0, 10).split('-').map(Number);
  if (!y) return '';
  return `${d} ${(long ? TH_MONTHS : TH_MONTHS_SHORT)[m - 1]} ${y + 543}`;
}
export function thDateTime(ts) {
  if (!ts) return '';
  const d = new Date(ts);
  const p = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Bangkok', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false }).formatToParts(d);
  const g = (t) => p.find((x) => x.type === t)?.value;
  return `${thDate(`${g('year')}-${g('month')}-${g('day')}`)} ${g('hour')}:${g('minute')} น.`;
}
export function todayISO() {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Bangkok' }).format(new Date());
}
