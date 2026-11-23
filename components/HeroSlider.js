'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import Icon from './Icon';

// สไลด์โชว์พื้นหลังหน้าแรก (สูงสุด 8 รูป) — เปลี่ยนรูปอัตโนมัติทุก 5 วินาที แบบค่อย ๆ จางเปลี่ยน
// หยุดเมื่อเอาเมาส์ชี้ / สลับแท็บ / ผู้ใช้ตั้งค่าลดการเคลื่อนไหว · ปัดซ้าย-ขวาบนมือถือได้
const INTERVAL = 5000;

export default function HeroSlider({ slides }) {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const [ready, setReady] = useState(false); // โหลดรูปถัด ๆ ไปหลังหน้าเว็บพร้อมแล้ว (รูปแรกโหลดก่อน = เร็ว)
  const touch = useRef(null);
  const n = slides.length;
  const go = useCallback((d) => setI((x) => (x + d + n) % n), [n]);

  useEffect(() => { const t = setTimeout(() => setReady(true), 300); return () => clearTimeout(t); }, []);
  useEffect(() => {
    if (n < 2 || paused) return;
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
    const t = setInterval(() => { if (document.visibilityState === 'visible') go(1); }, INTERVAL);
    return () => clearInterval(t);
  }, [n, paused, go, i]);

  if (!n) return null;
  return (
    <div className="hero-slides" aria-roledescription="carousel" aria-label="ภาพบรรยากาศโรงเรียน"
      onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}
      onTouchStart={(e) => { touch.current = e.touches[0].clientX; }}
      onTouchEnd={(e) => { if (touch.current == null) return; const dx = e.changedTouches[0].clientX - touch.current; if (Math.abs(dx) > 45) go(dx < 0 ? 1 : -1); touch.current = null; }}>
      {slides.map((src, k) => (
        <div key={src + k} className={`hero-slide ${k === i ? 'on' : ''}`} aria-hidden={k !== i}>
          {k === 0 || ready ? (
            <img src={src} alt="" loading={k === 0 ? 'eager' : 'lazy'} fetchPriority={k === 0 ? 'high' : 'low'} decoding="async" />
          ) : null}
        </div>
      ))}
      <div className="hero-shade" />
      {n > 1 ? (
        <>
          <button type="button" className="hero-nav prev" onClick={() => go(-1)} aria-label="รูปก่อนหน้า"><Icon name="left" size={28} /></button>
          <button type="button" className="hero-nav next" onClick={() => go(1)} aria-label="รูปถัดไป"><Icon name="right" size={28} /></button>
          <div className="hero-dots">
            {slides.map((_, k) => (
              <button type="button" key={k} className={k === i ? 'on' : ''} onClick={() => setI(k)} aria-label={`ไปที่รูปที่ ${k + 1}`} />
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}
