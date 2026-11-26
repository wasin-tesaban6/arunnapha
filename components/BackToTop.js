'use client';
import { useEffect, useState } from 'react';
import Icon from './Icon';

// ปุ่มกลับขึ้นด้านบน: แสดงเมื่อเลื่อนลงมาเกิน 400px
export default function BackToTop() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 400);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  const toTop = () => {
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
  };
  return (
    <button type="button" className={`to-top ${show ? 'show' : ''}`} onClick={toTop} aria-label="กลับขึ้นด้านบน" title="กลับขึ้นด้านบน" tabIndex={show ? 0 : -1}>
      <Icon name="up" size={26} />
    </button>
  );
}
