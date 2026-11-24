import Link from 'next/link';

export default function Footer({ s }) {
  const c = s.contact || {};
  const socials = [
    ['Facebook', c.facebook], ['Instagram', c.instagram], ['TikTok', c.tiktok], ['LINE', c.line],
  ].filter(([, v]) => v);
  const href = (v) => (/^https?:\/\//.test(v) ? v : null);
  return (
    <footer className="footer">
      <div className="container">
        <div className="cols">
          <div>
            <div className="row" style={{ marginBottom: 10 }}>
              <img src={s.logoUrl || '/logo.svg'} alt="" width="56" height="56" style={{ background: '#fff', borderRadius: '50%', padding: 4 }} />
              <div>
                <h4 style={{ margin: 0 }}>{s.texts.brandName}</h4>
                <div className="small">{s.councilName} {s.schoolName}</div>
              </div>
            </div>
            <p className="small pre" style={{ maxWidth: 420 }}>{s.schoolMotto ? `“${s.schoolMotto}” — ` : ''}{s.texts.footerText}</p>
          </div>
          <div>
            <h4>เมนู</h4>
            <ul>
              <li><Link href="/members">สมาชิกพรรค</Link></li>
              <li><Link href="/works">ศูนย์รวมผลงาน</Link></li>
              <li><Link href="/calendar">ปฏิทินวิชาการ</Link></li>
              <li><Link href="/report">แจ้งปัญหา</Link></li>
              <li><Link href="/market">ตลาดนัดออนไลน์</Link></li>
            </ul>
          </div>
          <div>
            <h4>ติดต่อสภานักเรียน</h4>
            <ul>
              {socials.map(([k, v]) => (
                <li key={k}>{k}: {href(v) ? <a href={v} target="_blank" rel="noopener">{v.replace(/^https?:\/\/(www\.)?/, '').slice(0, 40)}</a> : v}</li>
              ))}
              {c.email ? <li>อีเมล: <a href={`mailto:${c.email}`}>{c.email}</a></li> : null}
              {!socials.length && !c.email ? <li>–</li> : null}
            </ul>
          </div>
        </div>
        <div className="copy">
          <span>© {new Date().getFullYear() + 543} {s.councilName} {s.schoolName}</span>
          <span><Link href="/scmember">สำหรับสมาชิกสภา</Link></span>
        </div>
      </div>
    </footer>
  );
}
