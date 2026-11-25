'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import Icon from './Icon';

// สไลด์โปสเตอร์ขนาด 4:5 แบบ Instagram
// คอม 3 ใบ / แท็บเล็ต 2 ใบ / มือถือ 1 ใบ · ปัดได้ (scroll-snap) · เลื่อนเองทุก 5 วินาที · กดดูภาพเต็ม
export default function PosterSlider({ posters }) {
  const track = useRef(null);
  const [page, setPage] = useState(0);
  const [pages, setPages] = useState(1);
  const [paused, setPaused] = useState(false);
  const [open, setOpen] = useState(null);

  const measure = useCallback(() => {
    const el = track.current;
    if (!el) return;
    const card = el.querySelector('.poster');
    if (!card) return;
    const step = card.getBoundingClientRect().width + parseFloat(getComputedStyle(el).columnGap || 0);
    const perView = Math.max(1, Math.round(el.clientWidth / step));
    setPages(Math.max(1, posters.length - perView + 1));
    setPage(Math.round(el.scrollLeft / step));
  }, [posters.length]);

  const go = useCallback((d) => {
    const el = track.current;
    if (!el) return;
    const card = el.querySelector('.poster');
    const step = card.getBoundingClientRect().width + parseFloat(getComputedStyle(el).columnGap || 0);
    const max = el.scrollWidth - el.clientWidth - 2;
    let next = el.scrollLeft + d * step;
    if (d > 0 && el.scrollLeft >= max) next = 0; // วนกลับใบแรก
    if (d < 0 && el.scrollLeft <= 2) next = el.scrollWidth;
    el.scrollTo({ left: next, behavior: 'smooth' });
  }, []);

  useEffect(() => {
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [measure]);

  useEffect(() => {
    if (paused || open || pages < 2) return;
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
    const t = setInterval(() => { if (document.visibilityState === 'visible') go(1); }, 5000);
    return () => clearInterval(t);
  }, [paused, open, pages, go]);

  if (!posters.length) return null;
  return (
    <div className="posters" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}
      onTouchStart={() => setPaused(true)} onTouchEnd={() => setTimeout(() => setPaused(false), 4000)}>
      <div className="poster-track" ref={track} onScroll={measure}>
        {posters.map((src, i) => (
          <button type="button" key={src + i} className="poster" onClick={() => setOpen(src)} aria-label={`ดูโปสเตอร์ที่ ${i + 1}`}>
            <img src={src} alt={`โปสเตอร์ ${i + 1}`} loading={i < 3 ? 'eager' : 'lazy'} decoding="async" />
          </button>
        ))}
      </div>
      {pages > 1 ? (
        <>
          <button type="button" className="poster-nav prev" onClick={() => go(-1)} aria-label="ก่อนหน้า"><Icon name="left" size={26} /></button>
          <button type="button" className="poster-nav next" onClick={() => go(1)} aria-label="ถัดไป"><Icon name="right" size={26} /></button>
          <div className="poster-dots">{Array.from({ length: pages }, (_, i) => <span key={i} className={i === Math.min(page, pages - 1) ? 'on' : ''} />)}</div>
        </>
      ) : null}
      {open ? <div className="lightbox" onClick={() => setOpen(null)}><img src={open} alt="" /></div> : null}
    </div>
  );
}
