import Link from 'next/link';
import NavLinks from './NavLinks';

export default function Header({ s }) {
  return (
    <>
      {s.announcement ? (
        <div className="announce"><div className="container">📢 {s.announcement}</div></div>
      ) : null}
      <header className="header">
        <div className="container">
          <Link href="/" className="brand">
            <img src={s.logoUrl || '/logo.svg'} alt="โลโก้สภานักเรียน" width="52" height="52" />
            <div style={{ minWidth: 0 }}>
              <div className="t1">{s.texts.brandName}</div>
              <div className="t2">{s.texts.brandSub}</div>
            </div>
          </Link>
          <NavLinks />
        </div>
      </header>
    </>
  );
}
