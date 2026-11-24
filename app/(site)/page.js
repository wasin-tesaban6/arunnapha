import Link from 'next/link';
import Icon from '@/components/Icon';
import HeroSlider from '@/components/HeroSlider';
import { MemberCard, EventItem, ProductCard, Empty } from '@/components/Cards';
import { OppCard, VolunteerCard } from '@/components/WorksHub';
import { getSettings, getMembers, getEvents, getMarket, getReportStats, getOpportunities, getVolunteer } from '@/lib/data';
import { todayISO } from '@/lib/constants';

export const revalidate = 60;


export default async function Home() {
  const [s, members, events, market, opps, volunteer] = await Promise.all([
    getSettings(), getMembers(), getEvents(), getMarket(), getOpportunities(), getVolunteer(),
  ]);
  const stats = await getReportStats(s);
  const t = s.texts;
  const today = todayISO();
  const upcoming = events.filter((e) => (e.endDate || e.date) >= today).slice(0, 4);
  const openOpps = opps.filter((o) => o.status.key !== 'closed').slice(0, 6);
  const nextVolunteer = volunteer.filter((v) => !v.date || v.date >= today).slice(0, 6);
  const policies = (s.policies || []).filter((p) => p.title || p.detail);
  const slides = (s.heroSlides || []).filter(Boolean).slice(0, 8);

  return (
    <>
      <section className={`hero ${slides.length ? 'has-slides' : ''}`}>
        <HeroSlider slides={slides} />
        <div className="container">
          <div>
            <h1 className="hero-title">พรรค<span className="party">{s.partyName}</span></h1>
            <p className="slogan">{s.slogan || '–'}</p>
            <div className="row">
              <Link href="/members" className="btn white">{t.heroBtnMembers} <Icon name="arrow" size={20} /></Link>
              <Link href="/report" className="btn gold"><Icon name="qr" size={20} /> {t.heroBtnReport}</Link>
            </div>
          </div>
          <div className="hero-logo"><img src={s.logoUrl || '/logo.svg'} alt={`โลโก้พรรค${s.partyName}`} fetchPriority="high" /></div>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 30 }}>
        <div className="container">
          <div className="section-head">
            <div><div className="kicker">{t.featKicker}</div><h2>{t.featTitle}</h2></div>
          </div>
          <div className="grid features">
            {s.features.map((f, i) => (
              <Link key={i} href={f.href} className="card hover feature">
                <span className="num">0{i + 1}</span>
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
            <div><div className="kicker">{t.policyKicker}</div><h2>{t.policyTitle}</h2></div>
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
            <div><div className="kicker">{t.teamKicker}</div><h2>{t.teamTitle}</h2></div>
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
              <div><div className="kicker">{t.eventsKicker}</div><h2 style={{ fontSize: 38 }}>{t.eventsTitle}</h2></div>
              <Link href="/calendar">ปฏิทินทั้งหมด →</Link>
            </div>
            <div className="card" style={{ padding: 8 }}>
              {upcoming.length ? upcoming.map((e) => <EventItem key={e.id} e={e} />) : <div style={{ padding: 20 }} className="muted center">ยังไม่มีกิจกรรมเร็ว ๆ นี้</div>}
            </div>
          </div>
          <div>
            <div className="section-head">
              <div><div className="kicker">{t.statsKicker}</div><h2 style={{ fontSize: 38 }}>{t.statsTitle}</h2></div>
              <Link href="/report">แจ้งปัญหา →</Link>
            </div>
            <div className="grid stats" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
              <div className="card stat"><div className="v">{stats.total}</div><div className="l">แจ้งทั้งหมด</div></div>
              <div className="card stat"><div className="v" style={{ color: '#64748b' }}>{stats.received}</div><div className="l">รับเรื่อง</div></div>
              <div className="card stat"><div className="v" style={{ color: 'var(--ok)' }}>{stats.done}</div><div className="l">เสร็จสิ้น</div></div>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-head">
            <div><div className="kicker">{t.worksKicker}</div><h2>{t.worksTitle}</h2></div>
            <div className="row">
              <Link href="/works" className="btn ghost">{t.volunteerTab} →</Link>
              <Link href="/works?tab=opp" className="btn ghost">{t.oppTab} →</Link>
            </div>
          </div>
          {openOpps.length ? (
            <div className="grid works-grid">{openOpps.map((o) => <OppCard key={o.id} o={o} />)}</div>
          ) : nextVolunteer.length ? (
            <div className="grid works-grid">{nextVolunteer.map((v) => <VolunteerCard key={v.id} v={v} today={today} />)}</div>
          ) : <Empty icon="award" title="กิจกรรมกำลังจะมาเร็ว ๆ นี้">ติดตามกิจกรรมเก็บผลงานและจิตอาสาวิชาการได้ที่นี่</Empty>}
        </div>
      </section>

      {market.length ? (
        <section className="section alt">
          <div className="container">
            <div className="section-head">
              <div><div className="kicker">{t.marketKicker}</div><h2>{t.marketTitle}</h2></div>
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
              <h2>{t.ctaTitle}</h2>
              <p className="pre">{t.ctaText}</p>
            </div>
            <div className="row" style={{ position: 'relative', zIndex: 1 }}>
              <Link href="/report" className="btn gold">แจ้งปัญหา</Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
