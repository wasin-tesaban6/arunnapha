'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import Icon from './Icon';

const LINKS = [
  ['/', 'หน้าแรก'],
  ['/members', 'สมาชิกพรรค'],
  ['/works', 'ผลงาน'],
  ['/calendar', 'ปฏิทิน'],
  ['/report', 'แจ้งปัญหา'],
  ['/market', 'ตลาดนัดออนไลน์'],
];

export default function NavLinks() {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  useEffect(() => setOpen(false), [path]);
  const active = (h) => (h === '/' ? path === '/' : path.startsWith(h) || (h === '/report' && path.startsWith('/track')));
  return (
    <>
      <button className="menu-btn" onClick={() => setOpen(!open)} aria-label="เมนู" aria-expanded={open}>
        <Icon name={open ? 'x' : 'menu'} size={26} />
      </button>
      <nav className={`nav ${open ? 'open' : ''}`}>
        {LINKS.map(([h, t]) => (
          <Link key={h} href={h} className={active(h) ? 'active' : ''} prefetch>{t}</Link>
        ))}
      </nav>
    </>
  );
}
