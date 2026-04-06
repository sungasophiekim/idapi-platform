// src/app/(public)/research/ResearchClient.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useLang } from '@/lib/i18n';
import { Icon, Badge } from '@/components/ui';
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
      <div className="text-[11px] font-bold tracking-widest uppercase text-green-deep mb-3">{t('연구정책자료', 'Research & Publications')}</div>
      <h1 className="text-2xl md:text-[32px] font-bold mb-6">{t('연구 및 정책 자료', 'Research & Policy Publications')}</h1>

      {/* Area Filter */}
      <div className="flex gap-2 mb-3 flex-wrap">
        <span className="text-[12px] font-semibold text-gray-400 self-center mr-1">{t('연구영역', 'Area')}:</span>
        {[{ value: 'all', label: t('전체', 'All') }, ...Object.entries(RESEARCH_AREAS).map(([k, v]) => ({ value: k, label: lang === 'en' ? v.en : v.ko }))].map(a => (
          <button key={a.value} onClick={() => setAreaFilter(a.value)}
            className={`px-3 py-1 rounded-md text-[12px] font-medium border transition-all cursor-pointer ${areaFilter === a.value ? 'bg-green-deep text-white border-green-deep' : 'bg-white text-gray-500 border-gray-200'}`}>
            {a.label}
          </button>
        ))}
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 mb-8 flex-wrap">
        <span className="text-[12px] font-semibold text-gray-400 self-center mr-1">{t('카테고리', 'Category')}:</span>
        {[{ value: 'all', label: t('전체', 'All') }, ...Object.entries(CATEGORIES).map(([k, v]) => ({ value: k, label: lang === 'en' ? v.en : v.ko }))].map(c => (
          <button key={c.value} onClick={() => setCatFilter(c.value)}
            className={`px-3 py-1 rounded-full text-[12px] font-medium border transition-all cursor-pointer ${catFilter === c.value ? 'bg-green-deep text-white border-green-deep' : 'bg-white text-gray-500 border-gray-200'}`}>
            {c.label}
          </button>
        ))}
      </div>

      {/* Results */}
      <div className="text-[13px] text-gray-400 mb-4">{filtered.length} {t('건', 'results')}</div>

      <div className="space-y-3">
        {filtered.map((p: any) => (
          <Link key={p.id} href={`/research/${p.slug}`}
            className="block bg-white border border-border rounded-xl p-5 hover:border-green-deep/30 hover:-translate-y-0.5 hover:shadow-md transition-all group">
            <div className="flex items-start gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <Badge>{CATEGORIES[p.category as keyof typeof CATEGORIES]?.[lang] || p.category}</Badge>
                  <span className="text-[11px] text-gray-400">{RESEARCH_AREAS[p.researchArea as keyof typeof RESEARCH_AREAS]?.[lang]}</span>
                </div>
                <h3 className="text-[16px] font-semibold mb-1.5 group-hover:text-green-deep transition-colors">{bi(p.title, p.titleEn)}</h3>
                <p className="text-[13px] text-gray-400 line-clamp-2 leading-relaxed">{bi(p.excerpt, p.excerptEn)}</p>
              </div>
              <div className="text-right shrink-0 hidden sm:block">
                <div className="text-[12px] text-gray-400">{p.publishedAt?.slice(0, 10)}</div>
                {p.teamAuthor && <div className="text-[12px] text-gray-400 mt-1">{bi(p.teamAuthor.name, p.teamAuthor.nameEn)}</div>}
                <div className="text-[11px] text-gray-300 mt-1"><Icon name="eye" size={12} className="inline mr-1" />{p.viewCount}</div>
              </div>
            </div>
          </Link>
        ))}
        {filtered.length === 0 && (
          <div className="py-16 text-center text-gray-400">{t('등록된 자료가 없습니다.', 'No publications found.')}</div>
        )}
      </div>
    </section>
  );
}
