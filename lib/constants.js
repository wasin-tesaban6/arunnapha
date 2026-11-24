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

/* ===== จิตอาสาวิชาการ & ศูนย์รวมผลงาน ===== */
export const SUBJECTS = [
  'ภาษาไทย', 'คณิตศาสตร์', 'วิทยาศาสตร์และเทคโนโลยี', 'สังคมศึกษา ศาสนาและวัฒนธรรม', 'สุขศึกษาและพลศึกษา',
  'ศิลปะ', 'การงานอาชีพ', 'ภาษาต่างประเทศ', 'กิจกรรมพัฒนาผู้เรียน', 'หลายวิชา / ทั่วไป',
];
export const VOLUNTEER_KINDS = ['เฉลยการบ้าน', 'ติว / สอนพิเศษ', 'สรุปเนื้อหา', 'อื่น ๆ'];
export const OPP_SCOPES = ['ในโรงเรียน', 'นอกโรงเรียน'];

// สถานะการรับสมัคร: open = เปิดรับอยู่, soon = ยังไม่เปิด, closed = ปิดแล้ว, always = ไม่ระบุวัน
export function oppStatus(o, today) {
  const open = o.openDate || '', close = o.closeDate || '';
  const days = (a, b) => Math.round((Date.parse(b) - Date.parse(a)) / 864e5);
  if (close && today > close) return { key: 'closed', label: 'ปิดรับสมัครแล้ว', color: '#64748b' };
  if (open && today < open) return { key: 'soon', label: `เปิดรับ ${thDate(open)}`, color: '#f59e0b' };
  if (close) {
    const d = days(today, close);
    return { key: 'open', label: d === 0 ? 'ปิดรับวันนี้!' : `เปิดรับสมัคร · เหลือ ${d} วัน`, color: d <= 3 ? '#dc2626' : '#16a34a' };
  }
  return { key: open ? 'open' : 'always', label: 'เปิดรับสมัคร', color: '#16a34a' };
}

// ไอคอน/ชื่อปุ่มตามชนิดลิงก์
export function linkKind(url) {
  const u = String(url || '').toLowerCase();
  if (u.includes('instagram.com')) return 'Instagram';
  if (u.includes('facebook.com') || u.includes('fb.com') || u.includes('fb.me')) return 'Facebook';
  if (u.includes('tiktok.com')) return 'TikTok';
  if (u.includes('meet.google.com')) return 'Google Meet';
  if (u.includes('forms.gle') || u.includes('docs.google.com/forms')) return 'Google Form';
  if (u.includes('drive.google.com') || u.includes('docs.google.com')) return 'Google Drive';
  if (u.includes('line.me')) return 'LINE';
  return 'เว็บไซต์';
}
