// src/app/(public)/HomeClient.tsx
'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useLang } from '@/lib/i18n';
import { Icon, Badge, Btn } from '@/components/ui';
import { CATEGORIES, RESEARCH_AREAS } from '@/types';

const AREAS_LIST = [
  { key: 'KOREA_POLICY', num: '01', icon: 'file', descKo: '디지털자산 시장의 규제 변화를 모니터링하고, 정책 입안자와 실무자를 위한 연구자료를 발간합니다.', descEn: 'Monitors regulatory changes in the digital asset market and publishes research for policymakers.' },
  { key: 'DIGITAL_FINANCE', num: '02', icon: 'globe', descKo: '국내외 시장 전문가들의 시각을 공유하며, 디지털 자산이 자본시장에 미치는 영향을 심층 분석합니다.', descEn: 'Shares perspectives from market specialists, examining the impact of digital assets on capital markets.' },
  { key: 'INFRASTRUCTURE', num: '03', icon: 'shield', descKo: '디지털자산 생태계의 실제 운용에 필요한 기술적 표준과 보안, 시장 인프라 구축 방안을 다룹니다.', descEn: 'Addresses technical standards, security, and infrastructure for digital asset ecosystems.' },
  { key: 'INCLUSION', num: '04', icon: 'users', descKo: '디지털자산 기술이 사회 전반에 미치는 영향을 분석하고, 금융 소외 계층의 접근성 제고를 연구합니다.', descEn: 'Analyzes societal implications of digital asset technologies, focusing on expanding financial access.' },
];

export default function HomeClient({ posts }: { posts: any[] }) {
  const { lang, t, bi } = useLang();
  const [filter, setFilter] = useState('all');

  const filtered = filter === 'all' ? posts : posts.filter((p: any) => p.category === filter);

  return (
    <>
      {/* ─── HERO ─── */}
      <section className="pt-36 pb-20 text-center relative">
        <div className="max-w-[1140px] mx-auto px-6">
          <div className="inline-flex items-center gap-2 text-[11px] font-bold text-green-deep tracking-widest uppercase mb-5">
            <span className="w-5 h-px bg-green-deep/40" />IDAPI<span className="w-5 h-px bg-green-deep/40" />
          </div>
          <h1 className="text-3xl md:text-[42px] font-bold leading-[1.35] mb-6 tracking-tight">
            {t('전문가 집단지성으로 설계하는', 'Shaping the Future of')}
            <br />
            {t('디지털 자산 정책의 내일', 'Digital Asset Policy through Collective Intelligence')}
          </h1>
          <p className="text-[17px] text-gray-500 max-w-[600px] mx-auto mb-9 leading-relaxed">
            {t(
              '국제디지털자산정책연구소(IDAPI)는 자본시장, 법률, 기술, 정책 분야 전문가들이 참여하는 비영리·비당파 정책 연구기관입니다.',
              'IDAPI is a non-profit, non-partisan policy institute uniting experts across capital markets, law, technology, and public policy.'
            )}
          </p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Link href="/about"><Btn>{t('연구소 소개', 'About IDAPI')} <Icon name="arrow" size={16} /></Btn></Link>
            <Link href="/research"><Btn variant="outline">{t('연구자료 보기', 'View Research')}</Btn></Link>
          </div>
        </div>
      </section>

      {/* ─── RESEARCH AREAS ─── */}
      <section className="py-20 max-w-[1140px] mx-auto px-6">
        <div className="text-[11px] font-bold tracking-widest uppercase text-green-deep mb-3">{t('연구영역', 'Research Areas')}</div>
        <h2 className="text-2xl md:text-[32px] font-bold mb-3 tracking-tight">{t('디지털자산 시장의 발전을 위한 지식 베이스', 'Building the Knowledge Base for Digital Asset Markets')}</h2>
        <p className="text-[16px] text-gray-500 max-w-[600px] leading-relaxed mb-11">
          {t('IDAPI는 독자적인 연구 역량과 전문가 네트워크를 결합하여, 디지털자산 시장의 발전을 위한 지식 베이스를 구축합니다.',
            'IDAPI combines independent research with a professional network to build the knowledge base for digital asset markets.')}
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {AREAS_LIST.map(a => {
            const area = RESEARCH_AREAS[a.key as keyof typeof RESEARCH_AREAS];
            return (
              <div key={a.num} className="border border-border rounded-xl p-7 hover:border-green-deep hover:-translate-y-0.5 hover:shadow-lg transition-all duration-300 cursor-pointer group relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-[3px] bg-green-deep opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="text-[11px] font-bold text-green-deep tracking-widest mb-3">{a.num}</div>
                <div className="w-9 h-9 bg-green-pale rounded-lg flex items-center justify-center text-green-deep mb-3.5"><Icon name={a.icon} size={18} /></div>
                <h3 className="text-[17px] font-bold mb-2">{lang === 'en' ? area.en : area.ko}</h3>
                <p className="text-[13.5px] text-gray-500 leading-relaxed">{lang === 'en' ? a.descEn : a.descKo}</p>
              </div>
            );
          })}
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
              { icon: 'globe', ko: '글로벌 정책 대화', en: 'Global Policy Dialogue', tagKo: '국경 없는 기술, 글로벌 스탠다드의 논의', tagEn: 'Borderless technology. Global standards in dialogue.', dKo: '블록체인의 글로벌 표준을 연구하고 한국과 글로벌 생태계가 정합성을 이룰 수 있도록 지식과 정보를 공유합니다.', dEn: 'Advances research on global blockchain standards and regulatory developments.' },
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
            { title: 'Focus Areas', items: ['DigitalAsset Policy', 'DigitalAsset Finance', 'Market Infrastructure', 'Digital Impact & Inclusion'] },
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
