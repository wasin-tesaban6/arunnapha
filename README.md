# CRMS6 | อรุณนภา

เว็บไซต์สภานักเรียน โรงเรียนเทศบาล ๖ นครเชียงราย — พรรคอรุณนภา
Next.js 16 · ธีมฟ้า-ขาว · ฟอนต์ TH Niramit AS ทั้งเว็บ · Upstash Redis + Vercel Blob

## หน้าเว็บ
| URL | รายละเอียด |
|---|---|
| `/` | หน้าแรก: สโลแกน, 4 โครงการเด่น, นโยบาย, สมาชิก, กิจกรรม, สถิติแจ้งปัญหา, ผลงาน, ตลาด |
| `/members`, `/members/[id]` | การ์ดสมาชิก (รูป ชื่อ ตำแหน่ง คำคม) + หน้าประวัติและผลงานของแต่ละคน |
| `/works` | 1. จิตอาสาวิชาการ & ศูนย์รวมผลงาน (กรองตามประเภท/สมาชิก/ค้นหา) |
| `/calendar` | 2. สื่อสารฉับไว: ปฏิทินวิชาการ + ถาม-ตอบในแต่ละกิจกรรม |
| `/report`, `/track/[code]` | 3. QR Code แจ้งปัญหา + ติดตามแบบ Real-Time (อัปเดตทุก 5 วินาที) + แจ้งเตือนทาง LINE |
| `/market` | 4. ตลาดนัดออนไลน์: ฝากขาย → สภาอนุมัติ → แสดง 30 วัน, ผู้ขายจัดการเองด้วยรหัส |
| `/admin` | ผู้ดูแลระบบ (เริ่มต้น `Tesaban6` / `CRMS6ARNAPHA`) จัดการได้ทุกส่วน |
| `/scmember` | สมาชิกสภาเข้าสู่ระบบ: แก้โปรไฟล์, อัปโหลดผลงาน, ตอบคำถาม, เปลี่ยนรหัสผ่าน |

## ติดตั้งบน Vercel (ครั้งแรก)
1. **Import** repo นี้ใน Vercel (Framework: Next.js — ไม่ต้องตั้งค่า build เพิ่ม)
2. **Storage → Create → Upstash for Redis** (ฟรี, เลือก region Singapore) → *Connect Project*
3. **Storage → Create → Blob** → *Connect Project*
4. **Settings → Environment Variables** เพิ่ม `AUTH_SECRET` (ข้อความสุ่มยาว ๆ)
5. **Redeploy** → เข้า `/admin` → เมนู “ระบบ & รหัสผ่าน” ต้องขึ้น ✅ ทั้งฐานข้อมูลและ Blob
6. เปลี่ยนรหัสผ่านแอดมินทันที แล้วอัปโหลดโลโก้จริงที่ “ตั้งค่าเว็บไซต์”

> ถ้ายังไม่เชื่อม Redis เว็บจะเปิดได้ แต่ข้อมูลที่แก้ไขจะไม่ถูกบันทึกถาวร

## ตั้งค่า LINE (ระบบแจ้งเตือน)
1. สร้าง LINE Official Account + เปิด Messaging API ที่ https://developers.line.biz
2. นำ *Channel access token* และ *Channel secret* ใส่ env `LINE_CHANNEL_ACCESS_TOKEN`, `LINE_CHANNEL_SECRET`
3. ใส่ Basic ID (เช่น `@123abcde`) ใน `NEXT_PUBLIC_LINE_OA_ID` และตั้ง `LINE_ADMIN_KEY`, `NEXT_PUBLIC_SITE_URL`
4. Webhook URL: `https://<โดเมน>/api/line/webhook` → เปิด *Use webhook*, ปิด *Auto-reply*
5. Redeploy

การทำงาน:
- ผู้แจ้งกด “รับแจ้งเตือนทาง LINE” (หรือพิมพ์รหัส เช่น `CR7K2QXA` ในแชต) → ได้รับข้อความทุกครั้งที่แอดมินเปลี่ยนสถานะ
- แอดมิน/กลุ่ม LINE สภา พิมพ์ `ADMIN <LINE_ADMIN_KEY>` → รับแจ้งเตือนเมื่อมีเรื่องใหม่ / คำถาม / ประกาศฝากขาย (`ADMIN OFF` เพื่อยกเลิก)

## พัฒนาบนเครื่อง
```bash
npm install
npm run dev   # ข้อมูลเก็บที่ .data/db.json อัตโนมัติ
```

## ความเร็ว
- หน้าสาธารณะเป็น static + ISR (แคชที่ CDN, รีเฟรชทันทีเมื่อแก้ไขผ่าน /admin)
- ฟอนต์ self-host (woff2 ~30KB) ผ่าน `next/font`
- รูปถูกย่อ/แปลงเป็น WebP ในเบราว์เซอร์ก่อนอัปโหลด และโหลดแบบ lazy
