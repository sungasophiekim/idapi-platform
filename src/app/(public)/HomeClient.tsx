// src/app/(public)/HomeClient.tsx
'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useLang } from '@/lib/i18n';
import { Icon, Badge, Btn } from '@/components/ui';
import { CATEGORIES, RESEARCH_AREAS } from '@/types';

const AREAS_LIST = [
  { num: '01', icon: 'shield', titleKo: 'AI 거버넌스·규제', titleEn: 'AI Governance & Regulation', descKo: 'AI Act, 알고리즘 책무성, 공공부문 AI 도입 등 AI 시대의 규범 설계를 연구합니다.', descEn: 'Norm-setting for the AI era — the AI Act, algorithmic accountability, and public-sector AI.' },
  { num: '02', icon: 'globe', titleKo: '디지털 공공인프라 (DPI)', titleEn: 'Digital Public Infrastructure', descKo: '결제 레일, 데이터 교환, 상호운용성 등 사회의 디지털 기반 인프라를 다룹니다.', descEn: 'Payment rails, data exchange, and interoperability — the digital foundations of society.' },
  { num: '03', icon: 'users', titleKo: '디지털 신원·신뢰', titleEn: 'Digital Identity & Trust', descKo: '디지털 ID, 검증가능 자격증명, 신뢰 프레임워크를 연구합니다.', descEn: 'Digital ID, verifiable credentials, and trust frameworks.' },
  { num: '04', icon: 'file', titleKo: '데이터 거버넌스·프라이버시', titleEn: 'Data Governance & Privacy', descKo: '데이터 보호, 국경간 데이터 이동, 데이터 주권을 다룹니다.', descEn: 'Data protection, cross-border data flows, and data sovereignty.' },
  { num: '05', icon: 'settings', titleKo: '디지털 자산·토큰화 인프라', titleEn: 'Digital Assets & Tokenized Infra', descKo: '디지털 자산 정책과 토큰화된 금융·시장 인프라를 연구합니다.', descEn: 'Digital asset policy and tokenized financial & market infrastructure.' },
];

export default function HomeClient({ posts }: { posts: any[] }) {
  const { lang, t, bi } = useLang();
  const [filter, setFilter] = useState('all');

  const filtered = filter === 'all' ? posts : posts.filter((p: any) => p.category === filter);

  return (
    <>
      {/* ─── HERO BANNER — latest research (issue-paper style) ─── */}
      <section className="bg-green-deep text-white">
        <div className="max-w-[1140px] mx-auto px-6 pt-28 pb-16 md:pt-32 md:pb-20">
          <div className="flex items-baseline justify-between mb-8">
            <span className="eyebrow text-white/55">{t('최신 연구', 'Latest Research')}</span>
            <Link href="/research" className="font-mono text-[11px] tracking-[0.06em] text-white/50 hover:text-white">{t('전체 보기 →', 'All →')}</Link>
          </div>

          {posts.length > 0 ? (
            <>
              {/* Featured cover */}
              <Link href={`/research/${posts[0].slug}`} className="block group max-w-[920px] py-6 md:py-10">
                <div className="flex items-center gap-3 mb-6 md:mb-7">
                  <span className="font-mono text-[10px] tracking-[0.13em] uppercase bg-white/10 border border-white/15 text-white px-2.5 py-1 rounded">
                    {CATEGORIES[posts[0].category as keyof typeof CATEGORIES]?.[lang] || posts[0].category}
                  </span>
                  <span className="font-mono text-[10.5px] tracking-[0.06em] text-white/45">
                    {RESEARCH_AREAS[posts[0].researchArea as keyof typeof RESEARCH_AREAS]?.[lang]} · {posts[0].publishedAt?.slice(0, 10)}
                  </span>
                </div>
                <h1 className={`text-[32px] md:text-[54px] font-bold leading-[1.12] tracking-[-0.03em] group-hover:text-white/90 transition-colors ${lang === 'en' ? 'font-serif font-medium leading-[1.08]' : ''}`}>
                  {bi(posts[0].title, posts[0].titleEn)}
                </h1>
                {(posts[0].excerpt || posts[0].excerptEn) && (
                  <p className="mt-6 md:mt-7 text-[17px] md:text-[18px] text-white/65 leading-[1.7] max-w-[66ch]">{bi(posts[0].excerpt, posts[0].excerptEn)}</p>
                )}
                <div className="mt-9 md:mt-11 pt-5 border-t border-white/15 flex flex-wrap items-center justify-between gap-3 font-mono text-[11px] tracking-[0.04em] text-white/45">
                  <span>{t('발행 IDAPI Research', 'Published by IDAPI Research')}</span>
                  <span className="inline-flex items-center gap-1.5 text-white/75 group-hover:gap-3 transition-all">
                    {t('전문 읽기', 'Read the paper')} <Icon name="arrow" size={13} />
                  </span>
                </div>
              </Link>

              {/* Recent strip */}
              {posts.length > 1 && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-5 mt-14 pt-8 border-t border-white/12">
                  {posts.slice(1, 4).map((p: any) => (
                    <Link key={p.id} href={`/research/${p.slug}`} className="block group">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="font-mono text-[9px] tracking-[0.1em] uppercase text-[#f0c059]/85">{CATEGORIES[p.category as keyof typeof CATEGORIES]?.[lang] || p.category}</span>
                        <span className="text-white/35 text-[10px] ml-auto font-mono">{p.publishedAt?.slice(0, 10)}</span>
                      </div>
                      <h3 className="text-[14.5px] font-semibold leading-snug text-white/85 group-hover:text-white transition-colors">{bi(p.title, p.titleEn)}</h3>
                    </Link>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="py-10 text-white/60">{t('연구자료가 곧 게시됩니다.', 'Research is coming soon.')}</div>
          )}
        </div>
      </section>

      {/* ─── RESEARCH AREAS ─── */}
      <section className="py-16 md:py-20 max-w-[1140px] mx-auto px-6">
        <div className="eyebrow text-green-deep/70 mb-3">{t('연구영역', 'Focus Areas')}</div>
        <h2 className="text-2xl md:text-[30px] font-bold mb-3 tracking-tight">{t('디지털·AI 정책 인프라의 지식 베이스', 'The Knowledge Base for Digital and AI Policy Infrastructure')}</h2>
        <p className="text-[15px] text-ink-soft max-w-[620px] leading-relaxed mb-10">
          {t('IDAPI는 독자적인 연구 역량과 전문가 네트워크를 결합하여, 디지털·AI 시대 정책 인프라의 지식 베이스를 구축합니다.',
            'IDAPI combines independent research with a professional network to build the knowledge base for digital and AI policy infrastructure.')}
        </p>
        <div className="border-t border-border">
          {AREAS_LIST.map(a => (
            <Link href="/focus-areas" key={a.num} className="group flex items-start gap-5 md:gap-8 py-6 border-b border-border">
              <span className="font-mono text-[12px] text-green-deep/60 pt-1 w-7 shrink-0">{a.num}</span>
              <div className="flex-1 min-w-0">
                <h3 className="text-[17px] md:text-[19px] font-bold tracking-tight group-hover:text-green-deep transition-colors">{lang === 'en' ? a.titleEn : a.titleKo}</h3>
                <p className="text-[14px] text-ink-soft leading-relaxed mt-1.5 max-w-[72ch]">{lang === 'en' ? a.descEn : a.descKo}</p>
              </div>
              <Icon name="arrow" size={15} className="text-ink-faint mt-1.5 opacity-0 group-hover:opacity-100 transition-opacity hidden md:block" />
            </Link>
          ))}
        </div>
      </section>

      {/* ─── POLICY FORUM ─── */}
      <section className="py-16 md:py-20 bg-bg-alt border-y border-border">
        <div className="max-w-[1140px] mx-auto px-6">
          <div className="eyebrow text-green-deep/70 mb-3">{t('정책포럼 & 활동', 'Policy Forum & Engagement')}</div>
          <h2 className="text-2xl md:text-[30px] font-bold mb-3 tracking-tight">{t('지식을 넘어 가교로, 연구를 넘어 실천으로', 'Beyond knowledge, a bridge. Beyond research, action.')}</h2>
          <p className="text-[15px] text-ink-soft max-w-[600px] leading-relaxed mb-11">
            {t('합리적인 정책 대안 모색과 산업의 건강한 성장을 돕는 민·관·정 통합 정책 플랫폼을 지향합니다.',
              'An integrated policy platform bringing together public and private sectors, government, and industry.')}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
            {[
              { ko: '글로벌 정책 대화', en: 'Global Policy Dialogue', tagKo: '국경 없는 기술, 글로벌 스탠다드의 논의', tagEn: 'Borderless technology. Global standards in dialogue.', dKo: 'AI 거버넌스와 디지털 공공 인프라의 글로벌 표준을 연구하고, 한국과 국제 생태계가 정합성을 이룰 수 있도록 지식과 정보를 공유합니다.', dEn: 'Advances research on global standards for AI governance and digital public infrastructure, and their alignment across jurisdictions.' },
              { ko: '정책 라운드테이블 / 세미나', en: 'Policy Roundtables / Seminars', tagKo: '민·관·정 통합 소통을 위한 정책 공론장', tagEn: 'A public forum for integrated cross-sector dialogue', dKo: '현장의 목소리와 정책 입안자의 고민이 만나는 중립적 소통의 가교입니다.', dEn: 'Convenes policymakers, financial institutions, and industry leaders for constructive dialogue.' },
            ].map((f, i) => (
              <div key={i} className="border-t-2 border-green-deep pt-5">
                <h3 className="text-[18px] font-bold tracking-tight">{lang === 'en' ? f.en : f.ko}</h3>
                <div className="text-[12.5px] font-semibold text-green-deep mt-1.5">{lang === 'en' ? f.tagEn : f.tagKo}</div>
                <p className="text-[14px] text-ink-soft leading-relaxed mt-3 max-w-[52ch]">{lang === 'en' ? f.dEn : f.dKo}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── PUBLICATIONS ─── */}
      <section className="py-16 md:py-20 max-w-[1140px] mx-auto px-6">
        <div className="flex items-baseline justify-between mb-6">
          <div>
            <div className="eyebrow text-green-deep/70 mb-3">{t('연구정책자료', 'Research & Publications')}</div>
            <h2 className="text-2xl md:text-[30px] font-bold tracking-tight">{t('최신 연구 및 정책 자료', 'Latest Research & Publications')}</h2>
          </div>
          <Link href="/research" className="font-mono text-[11px] tracking-[0.06em] text-ink-faint hover:text-green-deep hidden sm:block">{t('전체 보기 →', 'All →')}</Link>
        </div>
        <div className="flex gap-x-5 gap-y-1.5 mb-7 flex-wrap">
          {[{ value: 'all', label: t('전체', 'All') }, ...Object.entries(CATEGORIES).map(([k, v]) => ({ value: k, label: lang === 'en' ? v.en : v.ko }))].map(c => (
            <button key={c.value} onClick={() => setFilter(c.value)}
              className={`font-mono text-[11px] tracking-[0.04em] uppercase pb-1 border-b-2 transition-colors cursor-pointer ${filter === c.value ? 'border-green-deep text-green-deep' : 'border-transparent text-ink-faint hover:text-ink-soft'}`}>
              {c.label}
            </button>
          ))}
        </div>
        <div className="border-t border-border">
          {filtered.map((p: any) => (
            <Link key={p.id} href={`/research/${p.slug}`}
              className="group flex items-baseline gap-4 md:gap-6 py-5 border-b border-border">
              <span className="font-mono text-[10px] tracking-[0.1em] uppercase text-green-deep w-20 md:w-28 shrink-0 pt-0.5">{CATEGORIES[p.category as keyof typeof CATEGORIES]?.[lang] || p.category}</span>
              <div className="flex-1 min-w-0">
                <div className="text-[16px] font-semibold tracking-tight group-hover:text-green-deep transition-colors">{bi(p.title, p.titleEn)}</div>
                <div className="text-[12.5px] text-ink-faint mt-0.5">{RESEARCH_AREAS[p.researchArea as keyof typeof RESEARCH_AREAS]?.[lang]}</div>
              </div>
              <span className="font-mono text-[11px] text-ink-faint whitespace-nowrap hidden sm:block pt-0.5">{p.publishedAt?.slice(0, 10)}</span>
            </Link>
          ))}
          {filtered.length === 0 && <div className="py-10 text-center text-ink-faint">{t('등록된 자료가 없습니다.', 'No publications found.')}</div>}
        </div>
      </section>

      {/* ─── OVERVIEW ─── */}
      <div className="max-w-[1140px] mx-auto px-6 pb-20">
        <div className="border-t-2 border-green-deep pt-8 grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { title: 'Principles', items: ['Independent Research', 'Collective Intelligence'] },
            { title: 'Focus Areas', items: ['AI Governance & Regulation', 'Digital Public Infrastructure', 'Digital Identity & Trust', 'Data Governance & Privacy', 'Digital Assets & Tokenized Infra'] },
            { title: 'Activities', items: ['Global Policy Hub', 'Policy Roundtable / Seminar', 'Forum'] },
          ].map(col => (
            <div key={col.title}>
              <div className="eyebrow text-green-deep/70 mb-4">{col.title}</div>
              {col.items.map(item => (
                <div key={item} className="text-[13.5px] text-ink-soft py-1.5 border-b border-border/60 last:border-0">{item}</div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
