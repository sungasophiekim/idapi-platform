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
      {/* ─── HERO — latest research ─── */}
      <section className="pt-32 pb-14">
        <div className="max-w-[1140px] mx-auto px-6">
          <div className="flex items-baseline justify-between mb-7">
            <div className="eyebrow text-green-deep/70">{t('최신 연구', 'Latest Research')}</div>
            <Link href="/research" className="font-mono text-[11px] tracking-[0.06em] text-ink-faint hover:text-green-deep">{t('전체 보기 →', 'All →')}</Link>
          </div>

          {posts.length > 0 ? (
            <>
              {/* Featured */}
              <Link href={`/research/${posts[0].slug}`} className="block group border-b border-border pb-9 mb-9">
                <div className="flex items-center gap-2.5 mb-3">
                  <span className="font-mono text-[10px] tracking-[0.1em] uppercase text-green-deep">{CATEGORIES[posts[0].category as keyof typeof CATEGORIES]?.[lang] || posts[0].category}</span>
                  <span className="text-ink-faint text-[11px]">{RESEARCH_AREAS[posts[0].researchArea as keyof typeof RESEARCH_AREAS]?.[lang]}</span>
                  <span className="text-ink-faint text-[11px] ml-auto font-mono">{posts[0].publishedAt?.slice(0, 10)}</span>
                </div>
                <h1 className={`text-3xl md:text-[38px] font-bold leading-[1.22] tracking-tight max-w-[900px] group-hover:text-green-deep transition-colors ${lang === 'en' ? 'font-serif font-medium' : ''}`}>
                  {bi(posts[0].title, posts[0].titleEn)}
                </h1>
                {(posts[0].excerpt || posts[0].excerptEn) && (
                  <p className="mt-4 text-[16px] text-ink-soft leading-relaxed max-w-[680px]">{bi(posts[0].excerpt, posts[0].excerptEn)}</p>
                )}
              </Link>

              {/* Next items */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-6">
                {posts.slice(1, 5).map((p: any) => (
                  <Link key={p.id} href={`/research/${p.slug}`} className="block group border-b border-gray-100 pb-5">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="font-mono text-[9.5px] tracking-[0.1em] uppercase text-green-deep/80">{CATEGORIES[p.category as keyof typeof CATEGORIES]?.[lang] || p.category}</span>
                      <span className="text-ink-faint text-[10.5px] ml-auto font-mono">{p.publishedAt?.slice(0, 10)}</span>
                    </div>
                    <h3 className={`text-[16.5px] font-semibold leading-snug tracking-tight group-hover:text-green-deep transition-colors ${lang === 'en' ? 'font-serif font-medium text-[18px]' : ''}`}>
                      {bi(p.title, p.titleEn)}
                    </h3>
                  </Link>
                ))}
              </div>
            </>
          ) : (
            <div className="py-16 text-center border border-dashed border-border rounded-xl text-ink-faint">
              {t('연구자료가 곧 게시됩니다.', 'Research is coming soon.')}
              <div className="mt-4"><Link href="/research"><Btn variant="outline">{t('연구자료', 'Research')}</Btn></Link></div>
            </div>
          )}
        </div>
      </section>

      {/* ─── RESEARCH AREAS ─── */}
      <section className="py-20 max-w-[1140px] mx-auto px-6">
        <div className="text-[11px] font-bold tracking-widest uppercase text-green-deep mb-3">{t('연구영역', 'Focus Areas')}</div>
        <h2 className="text-2xl md:text-[32px] font-bold mb-3 tracking-tight">{t('디지털·AI 정책 인프라의 지식 베이스', 'The Knowledge Base for Digital and AI Policy Infrastructure')}</h2>
        <p className="text-[16px] text-gray-500 max-w-[620px] leading-relaxed mb-11">
          {t('IDAPI는 독자적인 연구 역량과 전문가 네트워크를 결합하여, 디지털·AI 시대 정책 인프라의 지식 베이스를 구축합니다.',
            'IDAPI combines independent research with a professional network to build the knowledge base for digital and AI policy infrastructure.')}
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {AREAS_LIST.map(a => (
            <Link href="/focus-areas" key={a.num} className="border border-border rounded-xl p-7 hover:border-green-deep hover:-translate-y-0.5 hover:shadow-lg transition-all duration-300 cursor-pointer group relative overflow-hidden block">
              <div className="absolute top-0 left-0 right-0 h-[3px] bg-green-deep opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="text-[11px] font-bold text-green-deep tracking-widest mb-3">{a.num}</div>
              <div className="w-9 h-9 bg-green-pale rounded-lg flex items-center justify-center text-green-deep mb-3.5"><Icon name={a.icon} size={18} /></div>
              <h3 className="text-[17px] font-bold mb-2">{lang === 'en' ? a.titleEn : a.titleKo}</h3>
              <p className="text-[13.5px] text-gray-500 leading-relaxed">{lang === 'en' ? a.descEn : a.descKo}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* ─── POLICY FORUM ─── */}
      <section className="py-20 bg-bg-alt">
        <div className="max-w-[1140px] mx-auto px-6">
          <div className="text-[11px] font-bold tracking-widest uppercase text-green-deep mb-3">{t('정책포럼 & 활동', 'Policy Forum & Engagement')}</div>
          <h2 className="text-2xl md:text-[32px] font-bold mb-3">{t('지식을 넘어 가교로, 연구를 넘어 실천으로', 'Beyond knowledge, a bridge. Beyond research, action.')}</h2>
          <p className="text-[16px] text-gray-500 max-w-[600px] leading-relaxed mb-11">
            {t('합리적인 정책 대안 모색과 산업의 건강한 성장을 돕는 민·관·정 통합 정책 플랫폼을 지향합니다.',
              'An integrated policy platform bringing together public and private sectors, government, and industry.')}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {[
              { icon: 'globe', ko: '글로벌 정책 대화', en: 'Global Policy Dialogue', tagKo: '국경 없는 기술, 글로벌 스탠다드의 논의', tagEn: 'Borderless technology. Global standards in dialogue.', dKo: 'AI 거버넌스와 디지털 공공 인프라의 글로벌 표준을 연구하고, 한국과 국제 생태계가 정합성을 이룰 수 있도록 지식과 정보를 공유합니다.', dEn: 'Advances research on global standards for AI governance and digital public infrastructure, and their alignment across jurisdictions.' },
              { icon: 'users', ko: '정책 라운드테이블 / 세미나', en: 'Policy Roundtables / Seminars', tagKo: '민·관·정 통합 소통을 위한 정책 공론장', tagEn: 'A public forum for integrated cross-sector dialogue', dKo: '현장의 목소리와 정책 입안자의 고민이 만나는 중립적 소통의 가교입니다.', dEn: 'Convenes policymakers, financial institutions, and industry leaders for constructive dialogue.' },
            ].map((f, i) => (
              <div key={i} className="bg-white border border-border rounded-xl p-8">
                <div className="w-11 h-11 bg-green-deep rounded-xl flex items-center justify-center text-white mb-5"><Icon name={f.icon} size={22} /></div>
                <h3 className="text-[17px] font-bold mb-1.5">{lang === 'en' ? f.en : f.ko}</h3>
                <div className="text-[12px] font-semibold text-green-deep mb-3">{lang === 'en' ? f.tagEn : f.tagKo}</div>
                <p className="text-[13.5px] text-gray-500 leading-relaxed">{lang === 'en' ? f.dEn : f.dKo}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── PUBLICATIONS ─── */}
      <section className="py-20 max-w-[1140px] mx-auto px-6">
        <div className="text-[11px] font-bold tracking-widest uppercase text-green-deep mb-3">{t('연구정책자료', 'Research & Publications')}</div>
        <h2 className="text-2xl md:text-[32px] font-bold mb-6">{t('최신 연구 및 정책 자료', 'Latest Research & Publications')}</h2>
        <div className="flex gap-2 mb-7 flex-wrap">
          {[{ value: 'all', label: t('전체', 'All') }, ...Object.entries(CATEGORIES).map(([k, v]) => ({ value: k, label: lang === 'en' ? v.en : v.ko }))].map(c => (
            <button key={c.value} onClick={() => setFilter(c.value)}
              className={`px-4 py-1.5 rounded-full text-[13px] font-medium border transition-all cursor-pointer ${filter === c.value ? 'bg-green-deep text-white border-green-deep' : 'bg-white text-gray-500 border-gray-200 hover:border-gray-400'}`}>
              {c.label}
            </button>
          ))}
        </div>
        <div className="border border-border rounded-xl overflow-hidden">
          {filtered.map((p: any, i: number) => (
            <Link key={p.id} href={`/research/${p.slug}`}
              className={`flex items-center gap-4 px-5 py-4 bg-white hover:bg-green-50 transition-colors ${i < filtered.length - 1 ? 'border-b border-gray-100' : ''}`}>
              <Badge>{CATEGORIES[p.category as keyof typeof CATEGORIES]?.[lang] || p.category}</Badge>
              <div className="flex-1 min-w-0">
                <div className="text-[15px] font-semibold truncate">{bi(p.title, p.titleEn)}</div>
                <div className="text-[12.5px] text-gray-400">{RESEARCH_AREAS[p.researchArea as keyof typeof RESEARCH_AREAS]?.[lang]}</div>
              </div>
              <div className="text-[12px] text-gray-400 whitespace-nowrap hidden sm:block">{p.publishedAt?.slice(0, 10)}</div>
              <Icon name="arrow" size={14} className="text-gray-300" />
            </Link>
          ))}
          {filtered.length === 0 && <div className="py-10 text-center text-gray-400">{t('등록된 자료가 없습니다.', 'No publications found.')}</div>}
        </div>
      </section>

      {/* ─── OVERVIEW BOX ─── */}
      <div className="max-w-[1140px] mx-auto px-6 pb-20">
        <div className="bg-bg-alt rounded-2xl p-10 grid grid-cols-1 md:grid-cols-3 gap-8 border border-border">
          {[
            { title: 'Principles', items: ['Independent Research', 'Collective Intelligence'] },
            { title: 'Focus Areas', items: ['AI Governance & Regulation', 'Digital Public Infrastructure', 'Digital Identity & Trust', 'Data Governance & Privacy', 'Digital Assets & Tokenized Infra'] },
            { title: 'Activities', items: ['Global Policy Hub', 'Policy Roundtable / Seminar', 'Forum'] },
          ].map(col => (
            <div key={col.title}>
              <div className="text-[11px] font-bold tracking-widest uppercase text-green-deep mb-3.5">{col.title}</div>
              {col.items.map(item => (
                <div key={item} className="text-[14px] text-gray-500 pl-3.5 relative mb-2">
                  <span className="absolute left-0 top-[9px] w-[5px] h-[5px] bg-green-deep rounded-full opacity-40" />{item}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
