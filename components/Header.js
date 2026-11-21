import Link from 'next/link';
import NavLinks from './NavLinks';

export default function Header({ s }) {
  return (
    <>
      <div className="topbar">
        <div className="container">
          <span>{s.schoolName} · <b>{s.schoolMotto}</b></span>
          <span className="hide-sm">{s.councilName} · พรรค{s.partyName}</span>
        </div>
      </div>
      {s.announcement ? (
        <div className="announce"><div className="container">📢 {s.announcement}</div></div>
      ) : null}
      <header className="header">
        <div className="container">
          <Link href="/" className="brand">
            <img src={s.logoUrl || '/logo.svg'} alt="โลโก้สภานักเรียน" width="52" height="52" />
            <div style={{ minWidth: 0 }}>
              <div className="t1">CRMS6 <span>| {s.partyName}</span></div>
              <div className="t2">{s.councilName} {s.schoolName}</div>
            </div>
          </Link>
          <NavLinks />
        </div>
      </header>
    </>
  );
}
