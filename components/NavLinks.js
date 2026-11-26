'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import Icon from './Icon';

const LINKS = [
  ['/', 'หน้าแรก'],
  ['/members', 'สมาชิกพรรค'],
  ['/works', 'จิตอาสาวิชาการ'],
  ['/calendar', 'ปฏิทิน'],
  ['/report', 'แจ้งปัญหา'],
  ['/market', 'ตลาดนัดออนไลน์'],
];

const useIsoLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;

export default function NavLinks() {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const [hover, setHover] = useState(null);     // เมนูที่เมาส์ชี้อยู่
  const [pending, setPending] = useState(null); // เมนูที่เพิ่งกด (รอเปลี่ยนหน้า)
  const [press, setPress] = useState(false);
  const [ready, setReady] = useState(false);
  const navRef = useRef(null);
  const pillRef = useRef(null);
  const last = useRef(null);
  const moveTimer = useRef(null);

  useEffect(() => { setOpen(false); setPending(null); }, [path]);

  const active = (h) => (h === '/' ? path === '/' : path.startsWith(h));
  const activeHref = (LINKS.find(([h]) => active(h)) || [])[0] || null;
  const target = hover ?? pending ?? activeHref;

  // ย้ายแคปซูลกระจกไปยังเมนูเป้าหมาย
  const place = useCallback((instant = false) => {
    const nav = navRef.current, pill = pillRef.current;
    if (!nav || !pill) return;
    const a = target ? nav.querySelector(`a[data-h="${target}"]`) : null;
    if (!a || !a.offsetWidth) { pill.style.opacity = '0'; last.current = null; return; }
    const nr = nav.getBoundingClientRect(), ar = a.getBoundingClientRect();
    const x = ar.left - nr.left - nav.clientLeft, y = ar.top - nr.top - nav.clientTop;
    const prev = instant ? null : last.current;
    if (!prev) pill.classList.add('no-anim');
    pill.style.translate = `${x}px ${y}px`;
    pill.style.width = `${ar.width}px`;
    pill.style.height = `${ar.height}px`;
    pill.style.opacity = '1';
    if (!prev) { void pill.offsetWidth; pill.classList.remove('no-anim'); }
    else if (Math.abs(prev.x - x) > 2 || Math.abs(prev.y - y) > 2) {
      // ยืดตัวตามทิศที่เคลื่อน แล้วเด้งกลับ (ความรู้สึก liquid glass)
      pill.classList.remove('moving-x', 'moving-y');
      void pill.offsetWidth;
      pill.classList.add(Math.abs(prev.x - x) >= Math.abs(prev.y - y) ? 'moving-x' : 'moving-y');
      clearTimeout(moveTimer.current);
      moveTimer.current = setTimeout(() => pill.classList.remove('moving-x', 'moving-y'), 260);
    }
    last.current = { x, y };
    setReady(true);
  }, [target]);

  const placeRef = useRef(place);
  placeRef.current = place;
  useIsoLayoutEffect(() => { place(); }, [place]);
  // เปิด/ปิดเมนูมือถือ หรือขนาดหน้าจอเปลี่ยน → วางใหม่ทันทีโดยไม่ต้องเลื่อน
  useIsoLayoutEffect(() => { placeRef.current(true); }, [open]);

  useEffect(() => {
    const nav = navRef.current;
    if (!nav || typeof ResizeObserver === 'undefined') return undefined;
    let first = true;
    const ro = new ResizeObserver(() => { if (first) { first = false; return; } placeRef.current(true); });
    ro.observe(nav);
    return () => { ro.disconnect(); clearTimeout(moveTimer.current); };
  }, []);

  return (
    <>
      <button className="menu-btn" onClick={() => setOpen(!open)} aria-label="เมนู" aria-expanded={open}>
        <Icon name={open ? 'x' : 'menu'} size={26} />
      </button>
      <nav
        ref={navRef}
        className={`nav ${open ? 'open' : ''} ${ready ? 'has-pill' : ''}`}
        onPointerLeave={() => { setHover(null); setPress(false); }}
      >
        <span ref={pillRef} className={`nav-pill ${press ? 'press' : ''}`} aria-hidden="true" />
        {LINKS.map(([h, t]) => (
          <Link
            key={h}
            href={h}
            data-h={h}
            className={`${active(h) ? 'active' : ''} ${target === h ? 'on' : ''}`}
            aria-current={active(h) ? 'page' : undefined}
            prefetch
            onPointerEnter={(e) => { if (e.pointerType === 'mouse') setHover(h); }}
            onPointerDown={(e) => { setPress(true); if (e.pointerType !== 'mouse') setPending(h); else setHover(h); }}
            onPointerUp={() => setPress(false)}
            onPointerCancel={(e) => { setPress(false); if (e.pointerType !== 'mouse') setPending(null); }}
            onClick={() => setPending(h)}
          >{t}</Link>
        ))}
      </nav>
    </>
  );
}
