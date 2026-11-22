// อ่าน/สร้างไฟล์ CSV (ใช้ฝั่งเบราว์เซอร์)

// แปลงข้อความ CSV / TSV เป็นตาราง (รองรับ "เครื่องหมายคำพูด", คอมมาในช่อง, ขึ้นบรรทัดใหม่ในช่อง)
export function parseTable(text) {
  text = String(text || '').replace(/^﻿/, '');
  const firstLine = text.split(/\r?\n/, 1)[0] || '';
  const delim = firstLine.includes('\t') ? '\t' : (firstLine.split(';').length > firstLine.split(',').length ? ';' : ',');
  const rows = [];
  let row = [], cell = '', q = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) {
      if (c === '"') { if (text[i + 1] === '"') { cell += '"'; i++; } else q = false; }
      else cell += c;
    } else if (c === '"' && cell === '') q = true;
    else if (c === delim) { row.push(cell); cell = ''; }
    else if (c === '\n' || c === '\r') {
      if (c === '\r' && text[i + 1] === '\n') i++;
      row.push(cell); rows.push(row); row = []; cell = '';
    } else cell += c;
  }
  if (cell !== '' || row.length) { row.push(cell); rows.push(row); }
  return rows.map((r) => r.map((x) => x.trim())).filter((r) => r.some((x) => x !== ''));
}

// อ่านไฟล์: ลอง UTF-8 ก่อน ถ้าไม่ใช่ (เช่น CSV จาก Excel ภาษาไทยแบบเก่า) ใช้ Windows-874
export async function readTextFile(file) {
  const buf = await file.arrayBuffer();
  try { return new TextDecoder('utf-8', { fatal: true }).decode(buf); }
  catch { return new TextDecoder('windows-874').decode(buf); }
}

// กัน "CSV injection" เวลาเปิดใน Excel (ข้อความขึ้นต้นด้วย = + - @)
const safe = (v) => { const s = String(v ?? ''); return /^[=+\-@\t\r]/.test(s) ? `'${s}` : s; };
export function toCSV(rows) {
  return '﻿' + rows.map((r) => r.map((v) => { const s = safe(v); return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s; }).join(',')).join('\r\n');
}
export function downloadCSV(filename, rows) {
  const blob = new Blob([toCSV(rows)], { type: 'text/csv;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}
