// src/app/(public)/research/ResearchClient.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useLang } from '@/lib/i18n';
import { CATEGORIES, RESEARCH_AREAS } from '@/types';

export default function ResearchClient({ posts }: { posts: any[] }) {
  const { lang, t, bi } = useLang();
  const [catFilter, setCatFilter] = useState('all');
  const [areaFilter, setAreaFilter] = useState('all');

  const filtered = posts.filter(p => {
    if (catFilter !== 'all' && p.category !== catFilter) return false;
    if (areaFilter !== 'all' && p.researchArea !== areaFilter) return false;
    return true;
  });

  const [lead, ...rest] = filtered;

  return (
    <>
      {/* ─── Masthead band ─── */}
      <section className="text-white bg-green-deep">
        <div className="max-w-[1140px] mx-auto px-6 pt-28 pb-12 md:pt-32 md:pb-14">
          <div className="eyebrow text-[#f0c059]/90 mb-4">{t('연구자료', 'Research')}</div>
          <h1 className={`text-[30px] md:text-[44px] font-bold tracking-[-0.03em] leading-[1.08] ${lang === 'en' ? 'font-serif font-medium' : ''}`}>{t('연구 및 정책 자료', 'Research & Policy')}</h1>
          <p className="mt-4 text-[15px] text-white/70 max-w-[58ch] leading-relaxed">{t('디지털·AI 정책 인프라에 관한 IDAPI의 리포트·정책브리프·논평.', 'Reports, policy briefs, and commentary on digital and AI policy infrastructure from IDAPI.')}</p>
        </div>
      </section>

      {/* ─── Content ─── */}
      <section className="max-w-[1140px] mx-auto px-6 py-12 md:py-14">
        {/* Primary filter — research area, with a format dropdown */}
        <div className="flex items-center gap-x-6 gap-y-3 mb-4 flex-wrap">
          {[{ value: 'all', label: t('전체', 'All') }, ...Object.entries(RESEARCH_AREAS).map(([k, v]) => ({ value: k, label: lang === 'en' ? v.en : v.ko }))].map(a => (
            <button key={a.value} onClick={() => setAreaFilter(a.value)}
              className={`text-[14px] font-semibold tracking-tight pb-1 border-b-2 transition-colors cursor-pointer ${areaFilter === a.value ? 'border-green-deep text-green-deep' : 'border-transparent text-ink-faint hover:text-ink-soft'}`}>
              {a.label}
            </button>
          ))}
          <div className="ml-auto">
            <select value={catFilter} onChange={e => setCatFilter(e.target.value)}
              className="font-mono text-[11px] tracking-[0.04em] uppercase text-ink-soft border border-border rounded px-3 py-1.5 bg-white cursor-pointer hover:border-green-deep/40 outline-none">
              <option value="all">{t('전체 포맷', 'All formats')}</option>
              {Object.entries(CATEGORIES).map(([k, v]) => <option key={k} value={k}>{lang === 'en' ? v.en : v.ko}</option>)}
            </select>
          </div>
        </div>

        <div className="font-mono text-[11px] text-ink-faint mb-6 pb-3 border-b-2 border-green-deep">{filtered.length} {t('건', 'results')}</div>

        {filtered.length === 0 && (
          <div className="py-16 text-center text-ink-faint">{t('등록된 자료가 없습니다.', 'No publications found.')}</div>
        )}

        {/* Featured lead */}
        {lead && (
          <Link href={`/research/${lead.slug}`} className="group block border-b border-border pb-9 mb-2">
            <div className="flex items-center gap-3 mb-4">
              <span className="font-mono text-[10px] tracking-[0.12em] uppercase bg-green-deep text-white px-2.5 py-1 rounded">{CATEGORIES[lead.category as keyof typeof CATEGORIES]?.[lang] || lead.category}</span>
              <span className="font-mono text-[11px] tracking-[0.04em] text-ink-faint">{RESEARCH_AREAS[lead.researchArea as keyof typeof RESEARCH_AREAS]?.[lang]} · {lead.publishedAt?.slice(0, 10)}</span>
            </div>
            <h2 className={`text-[24px] md:text-[32px] font-bold tracking-[-0.02em] leading-[1.18] group-hover:text-green-deep transition-colors max-w-[85%] ${lang === 'en' ? 'font-serif font-medium' : ''}`}>{bi(lead.title, lead.titleEn)}</h2>
            {(lead.excerpt || lead.excerptEn) && <p className="mt-3.5 text-[15px] text-ink-soft leading-relaxed max-w-[70ch]">{bi(lead.excerpt, lead.excerptEn)}</p>}
          </Link>
        )}

        {/* Rest */}
        <div>
          {rest.map((p: any) => (
            <Link key={p.id} href={`/research/${p.slug}`}
              className="group flex items-baseline gap-4 md:gap-6 py-6 border-b border-border">
              <span className="font-mono text-[10px] tracking-[0.1em] uppercase text-green-deep w-20 md:w-28 shrink-0 pt-1">{CATEGORIES[p.category as keyof typeof CATEGORIES]?.[lang] || p.category}</span>
              <div className="flex-1 min-w-0">
                <h3 className="text-[17px] md:text-[18px] font-semibold tracking-tight group-hover:text-green-deep transition-colors">{bi(p.title, p.titleEn)}</h3>
                <p className="text-[13.5px] text-ink-soft line-clamp-2 leading-relaxed mt-1.5 max-w-[74ch]">{bi(p.excerpt, p.excerptEn)}</p>
                <div className="text-[11.5px] text-ink-faint mt-2">{RESEARCH_AREAS[p.researchArea as keyof typeof RESEARCH_AREAS]?.[lang]}</div>
              </div>
              <div className="text-right shrink-0 hidden sm:block font-mono text-[11px] text-ink-faint pt-1">
                <div>{p.publishedAt?.slice(0, 10)}</div>
                {p.teamAuthor && <div className="mt-1 not-italic">{bi(p.teamAuthor.name, p.teamAuthor.nameEn)}</div>}
              </div>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
