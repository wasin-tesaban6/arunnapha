'use client';
import { useEffect } from 'react';

// หน้าแสดงเมื่อเกิดข้อผิดพลาด (เช่น ฐานข้อมูลขัดข้องชั่วคราว) — ไม่ให้เว็บขาวทั้งหน้า
export default function Error({ error, reset }) {
  useEffect(() => { console.error(error); }, [error]);
  return (
    <div className="login-wrap">
      <div className="card login-card stack">
        <img src="/logo.svg" alt="" />
        <h2 style={{ margin: 0 }}>ขออภัย ระบบขัดข้องชั่วคราว</h2>
        <p className="muted small" style={{ margin: 0 }}>กรุณาลองใหม่อีกครั้งในอีกสักครู่</p>
        <div className="row" style={{ justifyContent: 'center' }}>
          <button className="btn" onClick={() => reset()}>ลองใหม่</button>
          <a className="btn ghost" href="/">หน้าแรก</a>
        </div>
      </div>
    </div>
  );
}
