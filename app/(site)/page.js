import Link from 'next/link';
import Icon from '@/components/Icon';
import HeroSlider from '@/components/HeroSlider';
import { MemberCard, WorkCard, EventItem, ProductCard, Empty } from '@/components/Cards';
import { getSettings, getMembers, getWorks, getEvents, getMarket, getIssueStats } from '@/lib/data';
import { todayISO } from '@/lib/constants';

export const revalidate = 60;

const FEATURES = [
  { n: 1, icon: 'heart', title: 'จิตอาสาวิชาการ', sub: 'ศูนย์รวมแหล่งเก็บผลงาน', text: 'รวบรวมผลงาน กิจกรรมจิตอาสา และโครงการของสมาชิกสภาแต่ละคน ให้ทุกคนเข้าถึงและตรวจสอบได้', href: '/works', go: 'ดูผลงานทั้งหมด' },
  { n: 2, icon: 'calendar', title: 'สื่อสารฉับไว', sub: 'สร้างปฏิสัมพันธ์ในรั้วฟ้าขาว', text: 'ปฏิทินวิชาการ แจ้งข่าวสารกิจกรรม พร้อมช่องถาม-ตอบระหว่างบุคลากรและนักเรียนในแต่ละกิจกรรม', href: '/calendar', go: 'เปิดปฏิทิน' },
  { n: 3, icon: 'qr', title: 'QR Code แจ้งปัญหา', sub: 'เช็คความคืบหน้าแบบ Real-Time', text: 'สแกนแจ้งปัญหาได้ทันที รับรหัสติดตาม และรับแจ้งเตือนความคืบหน้าผ่านแอปพลิเคชันไลน์', href: '/report', go: 'แจ้งปัญหา / ติดตาม' },
  { n: 4, icon: 'shop', title: 'ตลาดออนไลน์', sub: 'ส่งเสริมการขาย สร้างรายได้', text: 'พื้นที่ฝากขายสินค้าของนักเรียนบนเว็บสภา ผ่านการตรวจสอบจากสภา นัดรับในโรงเรียนอย่างปลอดภัย', href: '/market', go: 'ไปตลาดนัด' },
];

export default async function Home() {
  const [s, members, works, events, market, stats] = await Promise.all([
    getSettings(), getMembers(), getWorks(), getEvents(), getMarket(), getIssueStats(),
  ]);
  const today = todayISO();
  const upcoming = events.filter((e) => (e.endDate || e.date) >= today).slice(0, 4);
  const memberMap = Object.fromEntries(members.map((m) => [m.id, m]));
  const policies = (s.policies || []).filter((p) => p.title || p.detail);
  const slides = (s.heroSlides || []).filter(Boolean).slice(0, 8);

  return (
    <>
      <section className={`hero ${slides.length ? 'has-slides' : ''}`}>
        <HeroSlider slides={slides} />
        <div className="container">
          <div>
            <div className="eyebrow"><Icon name="sun" size={18} /> {s.councilName} {s.schoolName}</div>
            <h1>พรรค<span className="party">{s.partyName}</span></h1>
            <p className="slogan">{s.slogan || '–'}</p>
            <div className="row">
              <Link href="/members" className="btn white">รู้จักสมาชิกพรรค <Icon name="arrow" size={20} /></Link>
              <Link href="/report" className="btn gold"><Icon name="qr" size={20} /> แจ้งปัญหา</Link>
            </div>
          </div>
          <div className="hero-logo"><img src={s.logoUrl || '/logo.svg'} alt={`โลโก้พรรค${s.partyName}`} fetchPriority="high" /></div>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 30 }}>
        <div className="container">
          <div className="section-head">
            <div><div className="kicker">โครงการเด่นของเรา</div><h2>4 ภารกิจ เพื่อรั้วฟ้าขาว</h2></div>
          </div>
          <div className="grid features">
            {FEATURES.map((f) => (
              <Link key={f.n} href={f.href} className="card hover feature">
                <span className="num">0{f.n}</span>
                <span className="ic"><Icon name={f.icon} size={30} /></span>
                <h3>{f.title}</h3>
                <div style={{ color: 'var(--blue-600)', fontWeight: 700, fontSize: 19 }}>{f.sub}</div>
                <p>{f.text}</p>
                <span className="go">{f.go} →</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section alt">
        <div className="container">
          <div className="section-head">
            <div><div className="kicker">นโยบาย</div><h2>นโยบายพรรค{s.partyName}</h2></div>
          </div>
          {s.about && s.about !== '–' ? <p className="pre" style={{ maxWidth: 860 }}>{s.about}</p> : null}
          <div className="grid policy-list">
            {(policies.length ? policies : [{ title: '–' }]).map((p, i) => (
              <div key={i} className="card policy">
                <h3>{p.title || '–'}</h3>
                {p.detail ? <p className="muted small pre" style={{ margin: 0 }}>{p.detail}</p> : null}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-head">
            <div><div className="kicker">ทีมของเรา</div><h2>สมาชิกพรรค{s.partyName}</h2></div>
            <Link href="/members" className="btn ghost">ดูสมาชิกทั้งหมด ({members.length}) →</Link>
          </div>
          {members.length ? (
            <div className="grid members-grid">
              {members.slice(0, 4).map((m) => <MemberCard key={m.id} m={m} />)}
            </div>
          ) : <Empty icon="users" title="ยังไม่มีข้อมูลสมาชิก" />}
        </div>
      </section>

      <section className="section alt">
        <div className="container grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 30 }}>
          <div>
            <div className="section-head">
              <div><div className="kicker">สื่อสารฉับไว</div><h2 style={{ fontSize: 38 }}>กิจกรรมที่กำลังจะมาถึง</h2></div>
              <Link href="/calendar">ปฏิทินทั้งหมด →</Link>
            </div>
            <div className="card" style={{ padding: 8 }}>
              {upcoming.length ? upcoming.map((e) => <EventItem key={e.id} e={e} />) : <div style={{ padding: 20 }} className="muted center">ยังไม่มีกิจกรรมเร็ว ๆ นี้</div>}
            </div>
          </div>
          <div>
            <div className="section-head">
              <div><div className="kicker">QR Code แจ้งปัญหา</div><h2 style={{ fontSize: 38 }}>สถิติการแจ้งปัญหา</h2></div>
              <Link href="/track">ติดตามเรื่อง →</Link>
            </div>
            <div className="grid stats" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
              <div className="card stat"><div className="v">{stats.total}</div><div className="l">เรื่องที่แจ้งทั้งหมด</div></div>
              <div className="card stat"><div className="v" style={{ color: 'var(--ok)' }}>{stats.done}</div><div className="l">แก้ไขเสร็จแล้ว</div></div>
              <div className="card stat"><div className="v" style={{ color: 'var(--sky-500)' }}>{stats.in_progress + stats.reviewing}</div><div className="l">กำลังดำเนินการ</div></div>
              <div className="card stat"><div className="v" style={{ color: '#64748b' }}>{stats.received}</div><div className="l">รอรับเรื่อง</div></div>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-head">
            <div><div className="kicker">จิตอาสาวิชาการ</div><h2>ผลงานล่าสุด</h2></div>
            <Link href="/works" className="btn ghost">ศูนย์รวมผลงาน →</Link>
          </div>
          {works.length ? (
            <div className="grid works-grid">{works.slice(0, 6).map((w) => <WorkCard key={w.id} w={w} member={memberMap[w.memberId]} />)}</div>
          ) : <Empty icon="award" title="ผลงานกำลังจะมาเร็ว ๆ นี้">สมาชิกสภาจะอัปโหลดผลงานผ่านระบบสมาชิก</Empty>}
        </div>
      </section>

      {market.length ? (
        <section className="section alt">
          <div className="container">
            <div className="section-head">
              <div><div className="kicker">ตลาดออนไลน์</div><h2>สินค้าจากเพื่อนนักเรียน</h2></div>
              <Link href="/market" className="btn ghost">ดูทั้งหมด →</Link>
            </div>
            <div className="grid market-grid">{market.slice(0, 4).map((p) => <ProductCard key={p.id} p={p} />)}</div>
          </div>
        </section>
      ) : null}

      <section className="section">
        <div className="container">
          <div className="cta">
            <div>
              <h2>พบปัญหาในโรงเรียน? แจ้งเราได้เลย</h2>
              <p>สแกน QR Code ที่ติดตามจุดต่าง ๆ หรือกดแจ้งผ่านเว็บ แล้วติดตามความคืบหน้าแบบ Real-Time ผ่าน LINE</p>
            </div>
            <div className="row" style={{ position: 'relative', zIndex: 1 }}>
              <Link href="/report" className="btn gold">แจ้งปัญหา</Link>
              <Link href="/track" className="btn white">ติดตามเรื่อง</Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
