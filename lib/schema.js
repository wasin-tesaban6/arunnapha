// ตรวจ/ทำความสะอาดข้อมูลก่อนบันทึก
import { str, num, img, imgs } from './api';
import { newId } from './db';

// ลิงก์ภายนอก (https://) หรือไฟล์ที่อัปโหลดไว้ในระบบ (/api/blob/docs/...)
const link = (v) => { const s = String(v || '').trim(); return /^https?:\/\/\S+$/.test(s) || /^\/api\/blob\/docs\/[A-Za-z0-9._-]+$/.test(s) ? s.slice(0, 1000) : ''; };
const files = (arr) => (Array.isArray(arr) ? arr.map((f) => ({ name: str(f?.name, 150), url: link(f?.url) })).filter((f) => f.url).slice(0, 12) : []);

const date = (v) => (/^\d{4}-\d{2}-\d{2}$/.test(String(v || '')) ? String(v) : '');
const bool = (v) => v === true || v === 'true' || v === 1;

export const clean = {
  members(b, prev = {}) {
    return {
      ...prev,
      id: prev.id || newId('m'),
      name: str(b.name, 120) || 'ไม่ระบุชื่อ',
      nickname: str(b.nickname, 40),
      position: str(b.position, 80),
      order: num(b.order, prev.order ?? 99),
      classroom: str(b.classroom, 40),
      quote: str(b.quote, 200),
      bio: b.bio !== undefined ? str(b.bio, 4000) : prev.bio || '', // ไม่ได้ใช้แสดงแล้ว (เก็บค่าเดิมไว้)
      achievements: str(b.achievements, 4000),
      experience: str(b.experience, 4000),
      photo: img(b.photo),
      contact: str(b.contact, 300),
      active: b.active === undefined ? prev.active ?? true : bool(b.active),
      createdAt: prev.createdAt || Date.now(),
      updatedAt: Date.now(),
    };
  },
  works(b, prev = {}) {
    return {
      ...prev,
      id: prev.id || newId('w'),
      memberId: str(b.memberId ?? prev.memberId, 40),
      title: str(b.title, 200) || 'ผลงานไม่มีชื่อ',
      category: str(b.category, 40) || 'อื่น ๆ',
      date: date(b.date),
      description: str(b.description, 8000),
      images: imgs(b.images, 10),
      link: /^https?:\/\//.test(String(b.link || '')) ? str(b.link, 500) : '',
      hidden: bool(b.hidden),
      createdAt: prev.createdAt || Date.now(),
      updatedAt: Date.now(),
    };
  },
  events(b, prev = {}) {
    const d = date(b.date) || new Date().toISOString().slice(0, 10);
    const end = date(b.endDate);
    return {
      ...prev,
      id: prev.id || newId('e'),
      title: str(b.title, 200) || 'กิจกรรม',
      date: d,
      endDate: end && end >= d ? end : '',
      time: str(b.time, 40),
      location: str(b.location, 200),
      category: str(b.category, 40) || 'กิจกรรม',
      description: str(b.description, 8000),
      image: img(b.image),
      link: /^https?:\/\//.test(String(b.link || '')) ? str(b.link, 500) : '',
      createdAt: prev.createdAt || Date.now(),
      updatedAt: Date.now(),
    };
  },
  questions(b, prev = {}) {
    return {
      ...prev,
      id: prev.id || newId('q'),
      eventId: str(b.eventId ?? prev.eventId, 40),
      name: str(b.name ?? prev.name, 80) || 'ไม่ประสงค์ออกนาม',
      role: str(b.role ?? prev.role, 40),
      text: str(b.text ?? prev.text, 1000),
      answer: str(b.answer, 2000),
      answeredBy: str(b.answeredBy ?? prev.answeredBy, 120),
      answeredAt: b.answer && b.answer !== prev.answer ? Date.now() : prev.answeredAt || null,
      hidden: bool(b.hidden),
      createdAt: prev.createdAt || Date.now(),
    };
  },
  // จิตอาสาวิชาการ: เฉลยการบ้าน / ติวแต่ละวิชา
  volunteer(b, prev = {}) {
    return {
      ...prev,
      id: prev.id || newId('v'),
      title: str(b.title, 200) || 'จิตอาสาวิชาการ',
      subject: str(b.subject, 80),
      kind: str(b.kind, 60),
      level: str(b.level, 60),
      tutor: str(b.tutor, 200),
      date: date(b.date),
      time: str(b.time, 60),
      description: str(b.description, 4000),
      meetLink: link(b.meetLink),
      files: files(b.files),
      hidden: bool(b.hidden),
      createdAt: prev.createdAt || Date.now(),
      updatedAt: Date.now(),
    };
  },
  // ศูนย์รวมผลงาน: กิจกรรม/การแข่งขันที่ทำแล้วได้ผลงาน-เกียรติบัตร
  opportunities(b, prev = {}) {
    const open = date(b.openDate), close = date(b.closeDate);
    return {
      ...prev,
      id: prev.id || newId('o'),
      title: str(b.title, 200) || 'กิจกรรม',
      subject: str(b.subject, 80),
      scope: str(b.scope, 40),
      organizer: str(b.organizer, 200),
      reward: str(b.reward, 200),
      link: link(b.link),
      openDate: open,
      closeDate: close && (!open || close >= open) ? close : '',
      description: str(b.description, 4000),
      image: img(b.image),
      hidden: bool(b.hidden),
      createdAt: prev.createdAt || Date.now(),
      updatedAt: Date.now(),
    };
  },
  market(b, prev = {}, strict = false) {
    const status = ['pending', 'approved', 'sold', 'rejected'].includes(b.status) ? b.status : prev.status || 'pending';
    return {
      ...prev,
      id: prev.id || newId('p'),
      title: str(b.title, 150) || 'สินค้า',
      price: str(b.price, 40),
      category: str(b.category, 40) || 'อื่น ๆ',
      description: str(b.description, 3000),
      images: imgs(b.images, 5, strict),
      sellerName: str(b.sellerName, 100),
      sellerClass: str(b.sellerClass, 30),
      sellerNo: str(b.sellerNo ?? prev.sellerNo, 10),
      contact: str(b.contact, 200),
      status,
      adminNote: str(b.adminNote ?? prev.adminNote, 300),
      approvedAt: status === 'approved' && prev.status !== 'approved' ? Date.now() : prev.approvedAt || null,
      expiresAt: status === 'approved' && prev.status !== 'approved' ? Date.now() + 30 * 864e5 : prev.expiresAt || null,
      createdAt: prev.createdAt || Date.now(),
      updatedAt: Date.now(),
    };
  },
};
