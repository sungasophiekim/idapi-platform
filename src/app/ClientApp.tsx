'use client';

import { useState, useCallback } from 'react';
import { Icon, Btn, Badge, InputField, SelectField } from '../components/ui';
import { CATEGORIES, AREAS, COLORS } from '../types/constants';

const { G, GL, GP, G50 } = COLORS;

type Lang = 'ko' | 'en';

function t(obj: Record<string, string> | undefined, lang: Lang) {
  if (!obj) return '';
  return lang === 'en' ? (obj.en || obj.ko || '') : (obj.ko || obj.en || '');
}

// ── Public Header ──
function PublicHeader({ lang, setLang, navigate }: { lang: Lang; setLang: (l: Lang) => void; navigate: (p: string, arg?: string) => void }) {
  const [scrolled, setScrolled] = useState(false);
  if (typeof window !== 'undefined') {
    window.addEventListener('scroll', () => setScrolled(window.scrollY > 10));
  }
  return (
    <header style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, background: 'rgba(255,255,255,0.94)', backdropFilter: 'blur(12px)', borderBottom: '1px solid #e8e8e6', boxShadow: scrolled ? '0 1px 8px rgba(0,0,0,0.05)' : 'none', transition: 'box-shadow .3s' }}>
      <div style={{ maxWidth: 1140, margin: '0 auto', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>
        <div onClick={() => navigate('home')} style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
          <div style={{ width: 30, height: 30, background: G, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 11, letterSpacing: 1 }}>ID</div>
          <div style={{ lineHeight: 1.15 }}>
            <div style={{ fontWeight: 700, fontSize: 17, letterSpacing: -0.3 }}>IDAPI</div>
            <div style={{ fontSize: 10, color: '#888', letterSpacing: 0.3 }}>{lang === 'ko' ? '국제디지털자산정책연구소' : "Int'l Digital Asset Policy Institute"}</div>
          </div>
        </div>
        <nav style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          {[
            { key: 'about', ko: 'About', en: 'About' },
            { key: 'research', ko: '연구자료', en: 'Research' },
            { key: 'team', ko: '팀 소개', en: 'Team' },
          ].map(item => (
            <a key={item.key} onClick={() => navigate(item.key)} style={{ fontSize: 14, fontWeight: 500, color: '#666', cursor: 'pointer', transition: 'color .2s' }}
              onMouseEnter={e => (e.target as HTMLElement).style.color = G} onMouseLeave={e => (e.target as HTMLElement).style.color = '#666'}>
              {lang === 'ko' ? item.ko : item.en}
            </a>
          ))}
          <div style={{ display: 'flex', border: '1px solid #ddd', borderRadius: 6, overflow: 'hidden' }}>
            {(['ko', 'en'] as Lang[]).map(l => (
              <button key={l} onClick={() => setLang(l)} style={{ padding: '5px 10px', fontSize: 11, fontWeight: 700, border: 'none', cursor: 'pointer', background: lang === l ? G : 'transparent', color: lang === l ? '#fff' : '#888', fontFamily: 'inherit' }}>
                {l === 'ko' ? 'KOR' : 'ENG'}
              </button>
            ))}
          </div>
        </nav>
      </div>
    </header>
  );
}

// ── Hero ──
function HeroSection({ lang, navigate }: { lang: Lang; navigate: (p: string) => void }) {
  return (
    <section style={{ padding: '140px 0 80px', textAlign: 'center' }}>
      <div style={{ maxWidth: 1140, margin: '0 auto', padding: '0 24px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 11, fontWeight: 700, color: G, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 20 }}>
          <span style={{ width: 20, height: 1, background: G, opacity: 0.4, display: 'inline-block' }} />IDAPI<span style={{ width: 20, height: 1, background: G, opacity: 0.4, display: 'inline-block' }} />
        </div>
        <h1 style={{ fontSize: 'clamp(26px, 4vw, 42px)', fontWeight: 700, lineHeight: 1.35, marginBottom: 24, color: '#1a1a1a', letterSpacing: -0.5 }}>
          {lang === 'ko' ? <>전문가 집단지성으로 설계하는<br/>디지털 자산 정책의 내일</> : <>Shaping the Future of<br/>Digital Asset Policy through<br/>Collective Intelligence</>}
        </h1>
        <p style={{ fontSize: 17, color: '#666', maxWidth: 600, margin: '0 auto 36px', lineHeight: 1.8 }}>
          {lang === 'ko' ? '국제디지털자산정책연구소(IDAPI)는 자본시장, 법률, 기술, 정책 분야 전문가들이 참여하는 비영리·비당파 정책 연구기관입니다.' : 'IDAPI is a non-profit, non-partisan policy institute uniting experts across capital markets, law, technology, and public policy.'}
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Btn onClick={() => navigate('about')}>{lang === 'ko' ? '연구소 소개' : 'About IDAPI'} <Icon name="arrow" size={16} /></Btn>
          <Btn variant="outline" onClick={() => navigate('research')}>{lang === 'ko' ? '연구자료 보기' : 'View Research'}</Btn>
        </div>
      </div>
    </section>
  );
}

// ── Research Areas ──
function ResearchAreas({ lang }: { lang: Lang }) {
  const areas = [
    { num: '01', icon: 'file', ...AREAS.KOREA_POLICY, descKo: '디지털자산 시장의 규제 변화를 모니터링하고, 정책 입안자와 실무자를 위한 연구자료를 발간합니다.', descEn: 'Monitors regulatory changes in the digital asset market and publishes research designed to inform policymakers.' },
    { num: '02', icon: 'globe', ...AREAS.DIGITAL_FINANCE, descKo: '국내외 시장 전문가들의 시각을 공유하며, 디지털 자산이 자본시장에 미치는 영향을 심층 분석합니다.', descEn: 'Provides in-depth perspectives from market specialists, examining the impact of digital assets on capital markets.' },
    { num: '03', icon: 'shield', ...AREAS.INFRASTRUCTURE, descKo: '디지털자산 생태계의 실제 운용에 필요한 기술적 표준과 보안, 시장 인프라 구축 방안을 다룹니다.', descEn: 'Addresses technical standards, security considerations, and infrastructure for digital asset ecosystems.' },
    { num: '04', icon: 'users', ...AREAS.INCLUSION, descKo: '디지털자산 기술이 사회 전반에 미치는 영향을 분석하고, 금융 소외 계층의 접근성 제고를 연구합니다.', descEn: 'Analyzes societal implications of digital asset technologies, focusing on expanding financial access.' },
  ];
  return (
    <section style={{ padding: '80px 0', maxWidth: 1140, margin: '0 auto', paddingLeft: 24, paddingRight: 24 }}>
      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: G, marginBottom: 12 }}>{lang === 'ko' ? '연구영역' : 'Research Areas'}</div>
      <h2 style={{ fontSize: 'clamp(22px, 3vw, 32px)', fontWeight: 700, marginBottom: 12, letterSpacing: -0.3 }}>{lang === 'ko' ? '디지털자산 시장의 발전을 위한 지식 베이스' : 'Building the Knowledge Base for Digital Asset Markets'}</h2>
      <p style={{ fontSize: 16, color: '#666', maxWidth: 600, lineHeight: 1.8, marginBottom: 44 }}>{lang === 'ko' ? 'IDAPI는 독자적인 연구 역량과 전문가 네트워크를 결합하여, 디지털자산 시장의 발전을 위한 지식 베이스를 구축합니다.' : 'IDAPI combines independent research with a professional network to build the knowledge base for digital asset markets.'}</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
        {areas.map(a => (
          <div key={a.num} style={{ border: '1px solid #e8e8e6', borderRadius: 12, padding: 28, transition: 'all .3s', cursor: 'pointer', position: 'relative', overflow: 'hidden' }}
            onMouseEnter={e => { const el = e.currentTarget; el.style.borderColor = G; el.style.transform = 'translateY(-2px)'; el.style.boxShadow = '0 6px 24px rgba(32,62,51,0.08)'; }}
            onMouseLeave={e => { const el = e.currentTarget; el.style.borderColor = '#e8e8e6'; el.style.transform = 'none'; el.style.boxShadow = 'none'; }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: G, letterSpacing: 2, marginBottom: 12 }}>{a.num}</div>
            <div style={{ width: 36, height: 36, background: GP, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14, color: G }}><Icon name={a.icon} size={18} /></div>
            <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 8 }}>{lang === 'ko' ? a.ko : a.en}</h3>
            <p style={{ fontSize: 13.5, color: '#666', lineHeight: 1.7 }}>{lang === 'ko' ? a.descKo : a.descEn}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

// ── Forum Section ──
function ForumSection({ lang }: { lang: Lang }) {
  return (
    <section style={{ padding: '80px 0', background: '#f8f9f7' }}>
      <div style={{ maxWidth: 1140, margin: '0 auto', padding: '0 24px' }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: G, marginBottom: 12 }}>{lang === 'ko' ? '정책포럼 & 활동' : 'Policy Forum & Engagement'}</div>
        <h2 style={{ fontSize: 'clamp(22px, 3vw, 32px)', fontWeight: 700, marginBottom: 12 }}>{lang === 'ko' ? '지식을 넘어 가교로, 연구를 넘어 실천으로' : 'Beyond knowledge, a bridge. Beyond research, action.'}</h2>
        <p style={{ fontSize: 16, color: '#666', maxWidth: 600, lineHeight: 1.8, marginBottom: 44 }}>{lang === 'ko' ? '합리적인 정책 대안 모색과 산업의 건강한 성장을 돕는 민·관·정 통합 정책 플랫폼을 지향합니다.' : 'An integrated policy platform bringing together public and private sectors, government, and industry.'}</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
          {[
            { icon: 'globe', ko: '글로벌 정책 대화', en: 'Global Policy Dialogue', tagKo: '국경 없는 기술, 글로벌 스탠다드의 논의', tagEn: 'Borderless technology. Global standards in dialogue.', descKo: '블록체인의 글로벌 표준을 연구하고 한국과 글로벌 생태계가 정합성을 이룰 수 있도록 지식과 정보를 공유합니다.', descEn: 'Advances research on global blockchain standards and regulatory developments.' },
            { icon: 'users', ko: '정책 라운드테이블 / 세미나', en: 'Policy Roundtables / Seminars', tagKo: '민·관·정 통합 소통을 위한 정책 공론장', tagEn: 'A public forum for integrated cross-sector dialogue', descKo: '현장의 목소리와 정책 입안자의 고민이 만나는 중립적 소통의 가교입니다.', descEn: 'Convenes policymakers, financial institutions, and industry leaders for constructive dialogue.' },
          ].map((f, i) => (
            <div key={i} style={{ background: '#fff', border: '1px solid #e8e8e6', borderRadius: 12, padding: 32 }}>
              <div style={{ width: 44, height: 44, background: G, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18, color: '#fff' }}><Icon name={f.icon} size={22} /></div>
              <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 6 }}>{lang === 'ko' ? f.ko : f.en}</h3>
              <div style={{ fontSize: 12, fontWeight: 600, color: G, marginBottom: 12 }}>{lang === 'ko' ? f.tagKo : f.tagEn}</div>
              <p style={{ fontSize: 13.5, color: '#666', lineHeight: 1.7 }}>{lang === 'ko' ? f.descKo : f.descEn}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Posts List ──
function PostsList({ lang, posts }: { lang: Lang; posts: Post[] }) {
  const [filter, setFilter] = useState('all');
  const filtered = filter === 'all' ? posts : posts.filter(p => p.category === filter);
  return (
    <section style={{ padding: '80px 0', maxWidth: 1140, margin: '0 auto', paddingLeft: 24, paddingRight: 24 }}>
      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: G, marginBottom: 12 }}>{lang === 'ko' ? '연구정책자료' : 'Research & Publications'}</div>
      <h2 style={{ fontSize: 'clamp(22px, 3vw, 32px)', fontWeight: 700, marginBottom: 24 }}>{lang === 'ko' ? '최신 연구 및 정책 자료' : 'Latest Research & Publications'}</h2>
      <div style={{ display: 'flex', gap: 8, marginBottom: 28, flexWrap: 'wrap' }}>
        {[{ value: 'all', ko: '전체', en: 'All' }, ...Object.entries(CATEGORIES).map(([k, v]) => ({ value: k, ...v }))].map(c => (
          <button key={c.value} onClick={() => setFilter(c.value)} style={{ padding: '7px 16px', borderRadius: 20, fontSize: 13, fontWeight: 500, border: '1px solid', borderColor: filter === c.value ? G : '#ddd', background: filter === c.value ? G : '#fff', color: filter === c.value ? '#fff' : '#666', cursor: 'pointer', fontFamily: 'inherit', transition: 'all .2s' }}>
            {lang === 'ko' ? c.ko : c.en}
          </button>
        ))}
      </div>
      <div style={{ border: '1px solid #e8e8e6', borderRadius: 12, overflow: 'hidden' }}>
        {filtered.map((p, i) => (
          <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '18px 22px', background: '#fff', borderBottom: i < filtered.length - 1 ? '1px solid #f0f0ee' : 'none', cursor: 'pointer', transition: 'background .2s' }}
            onMouseEnter={e => e.currentTarget.style.background = G50} onMouseLeave={e => e.currentTarget.style.background = '#fff'}>
            <Badge color={G}>{t(CATEGORIES[p.category as keyof typeof CATEGORIES], lang)}</Badge>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{lang === 'en' && p.titleEn ? p.titleEn : p.title}</div>
              <div style={{ fontSize: 12.5, color: '#888' }}>{t(AREAS[p.researchArea as keyof typeof AREAS], lang)}</div>
            </div>
            <div style={{ fontSize: 12, color: '#aaa', whiteSpace: 'nowrap' }}>{p.publishedAt ? new Date(p.publishedAt).toISOString().slice(0, 10) : ''}</div>
            <div style={{ color: '#ccc' }}><Icon name="arrow" size={14} /></div>
          </div>
        ))}
        {filtered.length === 0 && <div style={{ padding: 40, textAlign: 'center', color: '#aaa' }}>{lang === 'ko' ? '등록된 자료가 없습니다.' : 'No publications found.'}</div>}
      </div>
    </section>
  );
}

// ── Overview Box ──
function OverviewBox() {
  return (
    <div style={{ maxWidth: 1140, margin: '0 auto', padding: '0 24px 80px' }}>
      <div style={{ background: '#f8f9f7', borderRadius: 16, padding: '40px 44px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 32, border: '1px solid #e8e8e6' }}>
        {[
          { title: 'Principles', items: ['Independent Research', 'Collective Intelligence'] },
          { title: 'Focus Areas', items: ['DigitalAsset Policy', 'DigitalAsset Finance', 'Market Infrastructure', 'Digital Impact & Inclusion'] },
          { title: 'Activities', items: ['Global Policy Hub', 'Policy Roundtable / Seminar', 'Forum'] },
        ].map(col => (
          <div key={col.title}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: G, marginBottom: 14 }}>{col.title}</div>
            {col.items.map(item => <div key={item} style={{ fontSize: 14, color: '#666', paddingLeft: 14, position: 'relative', marginBottom: 8 }}><span style={{ position: 'absolute', left: 0, top: 8, width: 5, height: 5, background: G, borderRadius: '50%', opacity: 0.4 }} />{item}</div>)}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Team Page ──
function TeamPage({ lang, team, navigate }: { lang: Lang; team: TeamMember[]; navigate: (p: string, id?: string) => void }) {
  return (
    <section style={{ padding: '120px 0 80px', maxWidth: 1140, margin: '0 auto', paddingLeft: 24, paddingRight: 24 }}>
      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: G, marginBottom: 12 }}>{lang === 'ko' ? '팀 소개' : 'Our Team'}</div>
      <h2 style={{ fontSize: 'clamp(22px, 3vw, 32px)', fontWeight: 700, marginBottom: 8 }}>{lang === 'ko' ? '디지털자산 정책의 미래를 정의하다' : 'Defining the Future of Digital Asset Policy'}</h2>
      <p style={{ fontSize: 16, fontStyle: 'italic', color: '#666', marginBottom: 40 }}>{lang === 'ko' ? '글로벌 통찰, 한국 중심의 실행' : 'Global Insight. Korea-Focused Execution.'}</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
        {team.map(m => (
          <div key={m.id} onClick={() => navigate('member', m.id)} style={{ background: '#fff', border: '1px solid #e8e8e6', borderRadius: 12, padding: 28, cursor: 'pointer', transition: 'all .3s' }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.06)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}>
            <div style={{ width: 52, height: 52, background: GP, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14, fontWeight: 700, fontSize: 18, color: G }}>
              {(lang === 'en' ? m.nameEn || m.name : m.name).split(' ').map(s => s[0]).join('').slice(0, 2)}
            </div>
            <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 2 }}>{lang === 'en' && m.nameEn ? m.nameEn : m.name}</h3>
            <div style={{ fontSize: 13, fontWeight: 600, color: G, marginBottom: 12 }}>{lang === 'en' && m.titleEn ? m.titleEn : m.title}</div>
            <p style={{ fontSize: 13, color: '#666', lineHeight: 1.7, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{lang === 'en' && m.bioEn ? m.bioEn : m.bio}</p>
            <div style={{ marginTop: 14, fontSize: 13, fontWeight: 600, color: G }}>{lang === 'ko' ? '약력보기 →' : 'View Profile →'}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ── Member Detail ──
function MemberDetail({ lang, member, navigate }: { lang: Lang; member: TeamMember | null; navigate: (p: string) => void }) {
  if (!member) return null;
  const creds = lang === 'en' && member.credentialsEn?.length ? member.credentialsEn : member.credentials;
  return (
    <section style={{ padding: '120px 0 80px', maxWidth: 800, margin: '0 auto', paddingLeft: 24, paddingRight: 24 }}>
      <a onClick={() => navigate('team')} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: G, cursor: 'pointer', marginBottom: 32 }}><Icon name="back" size={16} /> {lang === 'ko' ? '팀 목록' : 'Back to Team'}</a>
      <div style={{ display: 'flex', gap: 32, alignItems: 'flex-start', flexWrap: 'wrap' }}>
        <div style={{ width: 120, height: 120, background: GP, borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 36, color: G, flexShrink: 0 }}>
          {(lang === 'en' ? member.nameEn || member.name : member.name).split(' ').map(s => s[0]).join('').slice(0, 2)}
        </div>
        <div style={{ flex: 1, minWidth: 280 }}>
          <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 4 }}>{lang === 'en' && member.nameEn ? member.nameEn : member.name}</h1>
          <div style={{ fontSize: 15, fontWeight: 600, color: G, marginBottom: 24 }}>{lang === 'en' && member.titleEn ? member.titleEn : member.title}</div>
          <p style={{ fontSize: 15, color: '#555', lineHeight: 1.85, marginBottom: 28 }}>{lang === 'en' && member.bioEn ? member.bioEn : member.bio}</p>
          {creds && creds.length > 0 && (
            <div>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: '#333', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1 }}>{lang === 'ko' ? '주요 약력' : 'Credentials'}</h3>
              {creds.map((c, i) => <div key={i} style={{ fontSize: 14, color: '#555', padding: '8px 0', borderBottom: '1px solid #f0f0ee', paddingLeft: 16, position: 'relative' }}><span style={{ position: 'absolute', left: 0, top: 14, width: 5, height: 5, background: G, borderRadius: '50%', opacity: 0.4 }} />{c}</div>)}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

// ── About Page ──
function AboutPage({ lang, navigate }: { lang: Lang; navigate: (p: string) => void }) {
  return (
    <section style={{ padding: '120px 0 80px', maxWidth: 800, margin: '0 auto', paddingLeft: 24, paddingRight: 24 }}>
      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: G, marginBottom: 12 }}>About IDAPI</div>
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>IDAPI: International Digital Asset Policy Institute</h1>
      <p style={{ fontSize: 18, color: '#666', fontStyle: 'italic', marginBottom: 32 }}>{lang === 'ko' ? '전문가 집단지성으로 설계하는 디지털자산 정책의 내일' : 'Shaping the Future of Digital Asset Policy through Collective Intelligence'}</p>
      {[
        { title: 'Independent. Policy-driven. Globally Connected.', ko: 'IDAPI는 민간 주도의 독립적 거버넌스를 기반으로 설립된 정책 연구소로, 디지털자산 산업의 초기 형성기에 참여해 온 전문가들과 금융·법률 분야 전문 인력이 중심이 되어 2025년 연구를 시작했습니다.', en: 'IDAPI is an independent policy research institute founded on privately led governance. Launched in 2025 by early digital asset experts together with financial and legal professionals.' },
        { title: 'Global Strategic Base', ko: 'IDAPI는 아시아 디지털자산 정책 논의의 핵심 허브인 싱가포르에 비영리 재단으로 설립되었습니다. 이를 기반으로 한국의 정책 경험과 연구 성과를 국제사회와 연결합니다.', en: 'IDAPI is a non-profit foundation established in Singapore, a key hub for digital asset policy in Asia. From this strategic base, it bridges Korea\'s policy expertise with the global community.' },
        { title: 'Collective Intelligence', ko: 'IDAPI는 자본시장 전문가, 법률가, 기술 전문가, 정책 연구자가 함께 참여하는 다학제적 연구를 통해 보다 입체적이고 현실적인 정책 대안을 제시합니다.', en: 'Through interdisciplinary research bringing together capital markets experts, legal professionals, technologists, and policy researchers, IDAPI develops comprehensive policy solutions.' },
      ].map(s => (
        <div key={s.title} style={{ marginBottom: 28 }}>
          <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>{s.title}</h3>
          <p style={{ fontSize: 15, color: '#555', lineHeight: 1.85 }}>{lang === 'ko' ? s.ko : s.en}</p>
        </div>
      ))}
      <Btn onClick={() => navigate('team')} style={{ marginTop: 12 }}>{lang === 'ko' ? '팀 소개 보기' : 'Meet Our Team'} <Icon name="arrow" size={16} /></Btn>
    </section>
  );
}

// ── Footer ──
function PublicFooter({ lang }: { lang: Lang }) {
  return (
    <footer style={{ background: G, color: '#fff', padding: '48px 0 28px' }}>
      <div style={{ maxWidth: 1140, margin: '0 auto', padding: '0 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 36, marginBottom: 36 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <div style={{ width: 26, height: 26, background: 'rgba(255,255,255,0.15)', borderRadius: 5, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 700, letterSpacing: 1 }}>ID</div>
              <span style={{ fontWeight: 700, fontSize: 16 }}>IDAPI</span>
            </div>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', lineHeight: 1.7, maxWidth: 260 }}>{lang === 'ko' ? '전문가 집단지성으로 설계하는 디지털 자산 정책의 내일' : 'Shaping the Future of Digital Asset Policy'}</p>
          </div>
          {[
            { title: lang === 'ko' ? '연구영역' : 'Research', items: Object.values(AREAS).map(a => lang === 'ko' ? a.ko : a.en) },
            { title: lang === 'ko' ? '소개' : 'About', items: ['About IDAPI', lang === 'ko' ? '팀 소개' : 'Our Team'] },
          ].map(col => (
            <div key={col.title}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', marginBottom: 14 }}>{col.title}</div>
              {col.items.map(item => <div key={item} style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', marginBottom: 8, cursor: 'pointer' }}>{item}</div>)}
            </div>
          ))}
        </div>
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: 20, display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>
          <span>&copy; 2025 IDAPI. All rights reserved.</span>
          <span>Singapore &middot; Seoul</span>
        </div>
      </div>
    </footer>
  );
}

// ── Admin Sidebar ──
function AdminSidebar({ current, navigate, onLogout }: { current: string; navigate: (p: string) => void; onLogout: () => void }) {
  const items = [
    { key: 'admin_dash', icon: 'home', label: 'Dashboard' },
    { key: 'admin_posts', icon: 'file', label: 'Posts' },
    { key: 'admin_team', icon: 'users', label: 'Team' },
    { key: 'admin_settings', icon: 'settings', label: 'Settings' },
  ];
  return (
    <div style={{ width: 220, background: '#fafaf9', borderRight: '1px solid #e8e8e6', padding: '20px 0', display: 'flex', flexDirection: 'column', height: '100vh', position: 'fixed', left: 0, top: 0 }}>
      <div style={{ padding: '0 20px 20px', borderBottom: '1px solid #e8e8e6' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 28, height: 28, background: G, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 10 }}>ID</div>
          <div><div style={{ fontWeight: 700, fontSize: 14 }}>IDAPI</div><div style={{ fontSize: 10, color: '#aaa' }}>Admin Panel</div></div>
        </div>
      </div>
      <div style={{ flex: 1, padding: '12px 10px' }}>
        {items.map(item => (
          <div key={item.key} onClick={() => navigate(item.key)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 8, marginBottom: 2, cursor: 'pointer', background: current === item.key ? GP : 'transparent', color: current === item.key ? G : '#666', fontWeight: current === item.key ? 600 : 400, fontSize: 14, transition: 'all .15s' }}>
            <Icon name={item.icon} size={16} /> {item.label}
          </div>
        ))}
      </div>
      <div style={{ padding: '12px 20px', borderTop: '1px solid #e8e8e6' }}>
        <div onClick={() => navigate('home')} style={{ fontSize: 13, color: '#888', cursor: 'pointer', marginBottom: 8 }}>View Site</div>
        <div onClick={onLogout} style={{ fontSize: 13, color: '#c55', cursor: 'pointer' }}>Logout</div>
      </div>
    </div>
  );
}

// ── Admin Dashboard ──
function AdminDash({ posts, team }: { posts: Post[]; team: TeamMember[] }) {
  const stats = [
    { label: 'Total Posts', value: posts.length, color: G },
    { label: 'Published', value: posts.filter(p => p.status === 'PUBLISHED').length, color: '#1860a0' },
    { label: 'Team Members', value: team.length, color: '#b07815' },
    { label: 'Total Views', value: posts.reduce((s, p) => s + (p.views || 0), 0), color: '#8b5cf6' },
  ];
  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 24 }}>Dashboard</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16, marginBottom: 32 }}>
        {stats.map(s => (
          <div key={s.label} style={{ background: '#fff', border: '1px solid #e8e8e6', borderRadius: 12, padding: '20px 24px' }}>
            <div style={{ fontSize: 12, color: '#888', marginBottom: 4 }}>{s.label}</div>
            <div style={{ fontSize: 28, fontWeight: 700, color: s.color }}>{s.value.toLocaleString()}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Admin Posts ──
function AdminPosts({ posts, refresh }: { posts: Post[]; refresh: () => void }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<Record<string, unknown>>({});
  const startEdit = (post?: Post) => {
    setForm(post ? { ...post, publishedAt: post.publishedAt ? new Date(post.publishedAt).toISOString().slice(0, 10) : '' } : { title: '', titleEn: '', excerpt: '', excerptEn: '', category: 'COMMENTARY', researchArea: 'KOREA_POLICY', status: 'DRAFT', publishedAt: new Date().toISOString().slice(0, 10), authorId: '' });
    setEditing(true);
  };
  const save = async () => {
    const method = form.id ? 'PUT' : 'POST';
    const url = form.id ? `/api/posts/${form.id}` : '/api/posts';
    await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    setEditing(false);
    refresh();
  };
  const del = async (id: string) => {
    if (confirm('Delete this post?')) {
      await fetch(`/api/posts/${id}`, { method: 'DELETE' });
      refresh();
    }
  };

  if (editing) return (
    <div>
      <a onClick={() => setEditing(false)} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: G, cursor: 'pointer', marginBottom: 20 }}><Icon name="back" size={16} /> Back</a>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 24 }}>{form.id ? 'Edit Post' : 'New Post'}</h1>
      <div style={{ background: '#fff', border: '1px solid #e8e8e6', borderRadius: 12, padding: 28 }}>
        <InputField label="Title (KO)" value={String(form.title || '')} onChange={v => setForm({ ...form, title: v })} />
        <InputField label="Title (EN)" value={String(form.titleEn || '')} onChange={v => setForm({ ...form, titleEn: v })} />
        <InputField label="Excerpt (KO)" value={String(form.excerpt || '')} onChange={v => setForm({ ...form, excerpt: v })} multiline />
        <InputField label="Excerpt (EN)" value={String(form.excerptEn || '')} onChange={v => setForm({ ...form, excerptEn: v })} multiline />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
          <SelectField label="Category" value={String(form.category || '')} onChange={v => setForm({ ...form, category: v })} options={Object.entries(CATEGORIES).map(([k, v]) => ({ value: k, label: v.en }))} />
          <SelectField label="Research Area" value={String(form.researchArea || '')} onChange={v => setForm({ ...form, researchArea: v })} options={Object.entries(AREAS).map(([k, v]) => ({ value: k, label: v.en }))} />
          <SelectField label="Status" value={String(form.status || '')} onChange={v => setForm({ ...form, status: v })} options={[{ value: 'DRAFT', label: 'Draft' }, { value: 'PUBLISHED', label: 'Published' }]} />
        </div>
        <InputField label="Publish Date" value={String(form.publishedAt || '')} onChange={v => setForm({ ...form, publishedAt: v })} type="date" />
        <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
          <Btn onClick={save}>Save Post</Btn>
          <Btn variant="ghost" onClick={() => setEditing(false)}>Cancel</Btn>
        </div>
      </div>
    </div>
  );

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700 }}>Posts</h1>
        <Btn onClick={() => startEdit()} small><Icon name="plus" size={14} /> New Post</Btn>
      </div>
      <div style={{ background: '#fff', border: '1px solid #e8e8e6', borderRadius: 12, overflow: 'hidden' }}>
        {posts.map((p, i) => (
          <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 20px', borderBottom: i < posts.length - 1 ? '1px solid #f0f0ee' : 'none' }}>
            <Badge color={p.status === 'PUBLISHED' ? G : '#b07815'}>{p.status}</Badge>
            <Badge>{t(CATEGORIES[p.category as keyof typeof CATEGORIES], 'en')}</Badge>
            <div style={{ flex: 1, fontSize: 14, fontWeight: 500 }}>{p.title}</div>
            <div style={{ fontSize: 12, color: '#aaa' }}>{p.publishedAt ? new Date(p.publishedAt).toISOString().slice(0, 10) : ''}</div>
            <div style={{ display: 'flex', gap: 6 }}>
              <span onClick={() => startEdit(p)} style={{ cursor: 'pointer', color: '#888' }}><Icon name="edit" size={15} /></span>
              <span onClick={() => del(p.id)} style={{ cursor: 'pointer', color: '#c55' }}><Icon name="trash" size={15} /></span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Admin Team ──
function AdminTeam({ team, refresh }: { team: TeamMember[]; refresh: () => void }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<Record<string, unknown>>({});
  const startEdit = (m?: TeamMember) => {
    setForm(m ? { ...m, credentials: (m.credentials || []).join('\n'), credentialsEn: (m.credentialsEn || []).join('\n') } : { name: '', nameEn: '', title: '', titleEn: '', bio: '', bioEn: '', credentials: '', credentialsEn: '', type: 'FELLOW', published: true });
    setEditing(true);
  };
  const save = async () => {
    const data = {
      ...form,
      credentials: String(form.credentials || '').split('\n').filter(Boolean),
      credentialsEn: String(form.credentialsEn || '').split('\n').filter(Boolean),
    };
    const method = form.id ? 'PUT' : 'POST';
    const url = form.id ? `/api/team/${form.id}` : '/api/team';
    await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
    setEditing(false);
    refresh();
  };
  const del = async (id: string) => {
    if (confirm('Remove this team member?')) {
      await fetch(`/api/team/${id}`, { method: 'DELETE' });
      refresh();
    }
  };

  if (editing) return (
    <div>
      <a onClick={() => setEditing(false)} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: G, cursor: 'pointer', marginBottom: 20 }}><Icon name="back" size={16} /> Back</a>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 24 }}>{form.id ? 'Edit Member' : 'New Member'}</h1>
      <div style={{ background: '#fff', border: '1px solid #e8e8e6', borderRadius: 12, padding: 28 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <InputField label="Name (KO)" value={String(form.name || '')} onChange={v => setForm({ ...form, name: v })} />
          <InputField label="Name (EN)" value={String(form.nameEn || '')} onChange={v => setForm({ ...form, nameEn: v })} />
          <InputField label="Title (KO)" value={String(form.title || '')} onChange={v => setForm({ ...form, title: v })} />
          <InputField label="Title (EN)" value={String(form.titleEn || '')} onChange={v => setForm({ ...form, titleEn: v })} />
        </div>
        <InputField label="Bio (KO)" value={String(form.bio || '')} onChange={v => setForm({ ...form, bio: v })} multiline />
        <InputField label="Bio (EN)" value={String(form.bioEn || '')} onChange={v => setForm({ ...form, bioEn: v })} multiline />
        <InputField label="Credentials KO (one per line)" value={String(form.credentials || '')} onChange={v => setForm({ ...form, credentials: v })} multiline />
        <InputField label="Credentials EN (one per line)" value={String(form.credentialsEn || '')} onChange={v => setForm({ ...form, credentialsEn: v })} multiline />
        <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
          <Btn onClick={save}>Save Member</Btn>
          <Btn variant="ghost" onClick={() => setEditing(false)}>Cancel</Btn>
        </div>
      </div>
    </div>
  );

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700 }}>Team Members</h1>
        <Btn onClick={() => startEdit()} small><Icon name="plus" size={14} /> Add Member</Btn>
      </div>
      <div style={{ display: 'grid', gap: 12 }}>
        {team.map(m => (
          <div key={m.id} style={{ background: '#fff', border: '1px solid #e8e8e6', borderRadius: 12, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 40, height: 40, background: GP, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: G, flexShrink: 0 }}>{m.name[0]}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 15, fontWeight: 600 }}>{m.name} <span style={{ color: '#888', fontWeight: 400 }}>({m.nameEn})</span></div>
              <div style={{ fontSize: 13, color: G }}>{m.title}</div>
            </div>
            <Badge color={m.published ? G : '#888'}>{m.published ? 'Published' : 'Hidden'}</Badge>
            <Badge color="#666">{m.type}</Badge>
            <span onClick={() => startEdit(m)} style={{ cursor: 'pointer', color: '#888' }}><Icon name="edit" size={15} /></span>
            <span onClick={() => del(m.id)} style={{ cursor: 'pointer', color: '#c55' }}><Icon name="trash" size={15} /></span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Login Page ──
function LoginPage({ onLogin }: { onLogin: (email: string, pw: string) => Promise<{ error?: string }> }) {
  const [email, setEmail] = useState('admin@idapi.kr');
  const [pw, setPw] = useState('admin');
  const [err, setErr] = useState('');
  const submit = async () => { const r = await onLogin(email, pw); if (r?.error) setErr(r.error); };
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8f9f7' }}>
      <div style={{ width: 380, background: '#fff', border: '1px solid #e8e8e6', borderRadius: 16, padding: 36 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28 }}>
          <div style={{ width: 36, height: 36, background: G, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 12 }}>ID</div>
          <div><div style={{ fontWeight: 700, fontSize: 18 }}>IDAPI Admin</div></div>
        </div>
        <InputField label="Email" value={email} onChange={setEmail} type="email" />
        <InputField label="Password" value={pw} onChange={setPw} type="password" />
        {err && <div style={{ color: '#c55', fontSize: 13, marginBottom: 12 }}>{err}</div>}
        <Btn onClick={submit} style={{ width: '100%' }}>Sign In</Btn>
        <p style={{ fontSize: 12, color: '#aaa', marginTop: 16, textAlign: 'center' }}>Demo: admin@idapi.kr / admin</p>
      </div>
    </div>
  );
}

// ── Types ──
interface Post {
  id: string; title: string; titleEn?: string; excerpt?: string; excerptEn?: string;
  category: string; researchArea: string; status: string; publishedAt?: string; views?: number;
  authorId?: string; author?: { name: string; nameEn?: string };
}
interface TeamMember {
  id: string; name: string; nameEn?: string; title: string; titleEn?: string;
  bio: string; bioEn?: string; credentials: string[]; credentialsEn?: string[];
  type: string; published: boolean; order?: number;
}

// ── Main App ──
export default function ClientApp({ initialPosts, initialTeam }: { initialPosts: Post[]; initialTeam: TeamMember[] }) {
  const [page, setPage] = useState('home');
  const [lang, setLang] = useState<Lang>('ko');
  const [auth, setAuth] = useState<{ id: string; name: string; role: string } | null>(null);
  const [posts, setPosts] = useState(initialPosts);
  const [allPosts, setAllPosts] = useState<Post[]>([]);
  const [team, setTeam] = useState(initialTeam);
  const [allTeam, setAllTeam] = useState<TeamMember[]>([]);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);

  const refreshData = async () => {
    try {
      const [pr, tr] = await Promise.all([
        fetch('/api/posts').then(r => r.json()),
        fetch('/api/team').then(r => r.json()),
      ]);
      setPosts(pr.posts || []);
      setTeam(tr.team || []);
      if (auth) {
        const [apr, atr] = await Promise.all([
          fetch('/api/posts?all=1').then(r => r.json()),
          fetch('/api/team?all=1').then(r => r.json()),
        ]);
        setAllPosts(apr.posts || []);
        setAllTeam(atr.team || []);
      }
    } catch { /* DB not ready */ }
  };

  const navigate = useCallback(async (pg: string, arg?: string) => {
    setPage(pg);
    if (pg === 'member' && arg) {
      const m = team.find(t => t.id === arg) || null;
      setSelectedMember(m);
    }
    window.scrollTo(0, 0);
  }, [team]);

  const handleLogin = async (email: string, pw: string) => {
    try {
      const r = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: pw }),
      });
      const data = await r.json();
      if (data.user) {
        setAuth(data.user);
        // Load admin data
        const [apr, atr] = await Promise.all([
          fetch('/api/posts?all=1').then(r => r.json()),
          fetch('/api/team?all=1').then(r => r.json()),
        ]);
        setAllPosts(apr.posts || []);
        setAllTeam(atr.team || []);
        navigate('admin_dash');
        return {};
      }
      return { error: data.error || 'Login failed' };
    } catch {
      return { error: 'Connection error' };
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setAuth(null);
    navigate('home');
  };

  const isAdmin = page.startsWith('admin');

  if (page === 'login') return <LoginPage onLogin={handleLogin} />;

  if (isAdmin) {
    if (!auth) return <LoginPage onLogin={handleLogin} />;
    return (
      <div style={{ fontFamily: "'DM Sans', 'Noto Sans KR', sans-serif", display: 'flex' }}>
        <AdminSidebar current={page} navigate={navigate} onLogout={handleLogout} />
        <div style={{ marginLeft: 220, flex: 1, padding: '32px 36px', minHeight: '100vh', background: '#f8f9f7' }}>
          {page === 'admin_dash' && <AdminDash posts={allPosts} team={allTeam} />}
          {page === 'admin_posts' && <AdminPosts posts={allPosts} refresh={refreshData} />}
          {page === 'admin_team' && <AdminTeam team={allTeam} refresh={refreshData} />}
          {page === 'admin_settings' && (
            <div>
              <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 16 }}>Settings</h1>
              <div style={{ background: '#fff', border: '1px solid #e8e8e6', borderRadius: 12, padding: 28 }}>
                <p style={{ color: '#888', fontSize: 14 }}>Site settings will be available in future updates.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: "'DM Sans', 'Noto Sans KR', sans-serif", color: '#1a1a1a' }}>
      <PublicHeader lang={lang} setLang={setLang} navigate={navigate} />
      {page === 'home' && <>
        <HeroSection lang={lang} navigate={navigate} />
        <ResearchAreas lang={lang} />
        <ForumSection lang={lang} />
        <PostsList lang={lang} posts={posts} />
        <OverviewBox />
      </>}
      {page === 'about' && <AboutPage lang={lang} navigate={navigate} />}
      {page === 'research' && <PostsList lang={lang} posts={posts} />}
      {page === 'team' && <TeamPage lang={lang} team={team} navigate={navigate} />}
      {page === 'member' && <MemberDetail lang={lang} member={selectedMember} navigate={navigate} />}
      <PublicFooter lang={lang} />
      <div onClick={() => navigate('login')} style={{ position: 'fixed', bottom: 20, right: 20, background: G, color: '#fff', width: 40, height: 40, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 12px rgba(0,0,0,0.15)', zIndex: 50 }}>
        <Icon name="settings" size={16} />
      </div>
    </div>
  );
}
