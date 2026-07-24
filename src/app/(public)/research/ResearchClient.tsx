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

  return (
    <section className="pt-32 pb-20 max-w-[1140px] mx-auto px-6">
      <div className="font-mono text-[10.5px] font-medium tracking-[0.13em] uppercase text-green-deep/70 mb-3">{t('연구정책자료', 'Research & Publications')}</div>
      <h1 className="text-2xl md:text-[32px] font-bold mb-6">{t('연구 및 정책 자료', 'Research & Policy Publications')}</h1>

      {/* Area Filter */}
      <div className="flex items-baseline gap-x-5 gap-y-1.5 mb-2.5 flex-wrap">
        <span className="font-mono text-[10px] tracking-[0.1em] uppercase text-ink-faint w-16 shrink-0">{t('연구영역', 'Area')}</span>
        {[{ value: 'all', label: t('전체', 'All') }, ...Object.entries(RESEARCH_AREAS).map(([k, v]) => ({ value: k, label: lang === 'en' ? v.en : v.ko }))].map(a => (
          <button key={a.value} onClick={() => setAreaFilter(a.value)}
            className={`font-mono text-[11px] tracking-[0.04em] uppercase pb-0.5 border-b-2 transition-colors cursor-pointer ${areaFilter === a.value ? 'border-green-deep text-green-deep' : 'border-transparent text-ink-faint hover:text-ink-soft'}`}>
            {a.label}
          </button>
        ))}
      </div>

      {/* Category Filter */}
      <div className="flex items-baseline gap-x-5 gap-y-1.5 mb-8 flex-wrap">
        <span className="font-mono text-[10px] tracking-[0.1em] uppercase text-ink-faint w-16 shrink-0">{t('카테고리', 'Type')}</span>
        {[{ value: 'all', label: t('전체', 'All') }, ...Object.entries(CATEGORIES).map(([k, v]) => ({ value: k, label: lang === 'en' ? v.en : v.ko }))].map(c => (
          <button key={c.value} onClick={() => setCatFilter(c.value)}
            className={`font-mono text-[11px] tracking-[0.04em] uppercase pb-0.5 border-b-2 transition-colors cursor-pointer ${catFilter === c.value ? 'border-green-deep text-green-deep' : 'border-transparent text-ink-faint hover:text-ink-soft'}`}>
            {c.label}
          </button>
        ))}
      </div>

      {/* Results */}
      <div className="font-mono text-[11px] text-ink-faint mb-2 pb-3 border-b border-border">{filtered.length} {t('건', 'results')}</div>

      <div>
        {filtered.map((p: any) => (
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
        {filtered.length === 0 && (
          <div className="py-16 text-center text-ink-faint">{t('등록된 자료가 없습니다.', 'No publications found.')}</div>
        )}
      </div>
    </section>
  );
}
