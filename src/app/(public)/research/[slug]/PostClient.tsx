// src/app/(public)/research/[slug]/PostClient.tsx
'use client';

import Link from 'next/link';
import { useLang } from '@/lib/i18n';
import { Icon, Badge } from '@/components/ui';
import { CATEGORIES, RESEARCH_AREAS } from '@/types';

export default function PostClient({ post }: { post: any }) {
  const { lang, t, bi } = useLang();

  return (
    <article className="pt-32 pb-20 max-w-[800px] mx-auto px-6">
      <Link href="/research" className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-green-deep mb-8 hover:gap-3 transition-all">
        <Icon name="back" size={16} /> {t('연구자료 목록', 'Back to Research')}
      </Link>

      <div className="flex items-center gap-2 mb-4">
        <Badge>{CATEGORIES[post.category as keyof typeof CATEGORIES]?.[lang] || post.category}</Badge>
        <span className="text-[12px] text-gray-400">{RESEARCH_AREAS[post.researchArea as keyof typeof RESEARCH_AREAS]?.[lang]}</span>
        <span className="text-[12px] text-gray-300">|</span>
        <span className="text-[12px] text-gray-400">{post.publishedAt?.slice(0, 10)}</span>
      </div>

      <h1 className="text-[28px] md:text-[34px] font-bold leading-tight mb-4">{bi(post.title, post.titleEn)}</h1>

      {post.teamAuthor && (
        <Link href={`/team/${post.teamAuthor.id}`} className="inline-flex items-center gap-3 mb-8 group">
          <div className="w-10 h-10 bg-green-pale rounded-full flex items-center justify-center font-bold text-green-deep text-sm">
            {bi(post.teamAuthor.name, post.teamAuthor.nameEn)?.split(' ').map((s: string) => s[0]).join('').slice(0, 2)}
          </div>
          <div>
            <div className="text-[14px] font-semibold group-hover:text-green-deep transition-colors">{bi(post.teamAuthor.name, post.teamAuthor.nameEn)}</div>
            <div className="text-[12px] text-gray-400">{bi(post.teamAuthor.title, post.teamAuthor.titleEn)}</div>
          </div>
        </Link>
      )}

      {/* Excerpt */}
      <div className="bg-green-50 border-l-4 border-green-deep/30 rounded-r-lg p-5 mb-8">
        <p className="text-[15px] text-gray-600 leading-relaxed italic">{bi(post.excerpt, post.excerptEn)}</p>
      </div>

      {/* Content */}
      {(post.content || post.contentEn) ? (
        <div className="prose prose-gray max-w-none text-[15px] leading-relaxed">
          {bi(post.content, post.contentEn)}
        </div>
      ) : (
        <div className="py-12 text-center text-gray-400 border border-dashed border-gray-200 rounded-xl">
          {t('본문 콘텐츠가 준비 중입니다.', 'Full content coming soon.')}
        </div>
      )}

      {/* View count */}
      <div className="mt-10 pt-6 border-t border-gray-100 text-[12px] text-gray-400 flex items-center gap-1">
        <Icon name="eye" size={14} /> {post.viewCount?.toLocaleString()} {t('회 조회', 'views')}
      </div>
    </article>
  );
}
