// src/app/(public)/team/[id]/MemberClient.tsx
'use client';

import Link from 'next/link';
import { useLang } from '@/lib/i18n';
import { Icon, Badge } from '@/components/ui';
import { CATEGORIES } from '@/types';

export default function MemberClient({ member, posts }: { member: any; posts: any[] }) {
  const { lang, t, bi } = useLang();
  const name = bi(member.name, member.nameEn);
  const initials = name.split(' ').map((s: string) => s[0]).join('').slice(0, 2).toUpperCase();
  const creds = lang === 'en' && member.credentialsEn?.length ? member.credentialsEn : member.credentials;

  return (
    <section className="pt-32 pb-20 max-w-[800px] mx-auto px-6">
      <Link href="/team" className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-green-deep mb-8 hover:gap-3 transition-all">
        <Icon name="back" size={16} /> {t('팀 목록', 'Back to Team')}
      </Link>

      <div className="flex gap-8 items-start flex-wrap">
        <div className="w-[120px] h-[120px] bg-green-pale rounded-2xl flex items-center justify-center font-bold text-4xl text-green-deep shrink-0">{initials}</div>
        <div className="flex-1 min-w-[280px]">
          <h1 className="text-[28px] font-bold mb-1">{name}</h1>
          <div className="text-[15px] font-semibold text-green-deep mb-6">{bi(member.title, member.titleEn)}</div>
          <p className="text-[15px] text-gray-500 leading-relaxed mb-7">{bi(member.bio, member.bioEn)}</p>

          {creds && creds.length > 0 && (
            <div className="mb-8">
              <h3 className="text-[14px] font-bold text-gray-700 tracking-wide uppercase mb-3">{t('주요 약력', 'Credentials')}</h3>
              {creds.map((c: string, i: number) => (
                <div key={i} className="text-[14px] text-gray-500 py-2 border-b border-gray-100 pl-4 relative">
                  <span className="absolute left-0 top-[14px] w-[5px] h-[5px] bg-green-deep rounded-full opacity-40" />{c}
                </div>
              ))}
            </div>
          )}

          {posts.length > 0 && (
            <div>
              <h3 className="text-[14px] font-bold text-gray-700 tracking-wide uppercase mb-3">{t('발행 자료', 'Articles')}</h3>
              {posts.map((p: any) => (
                <Link key={p.id} href={`/research/${p.slug}`} className="flex items-center gap-3 py-3 border-b border-gray-100 hover:bg-green-50/50 -mx-2 px-2 rounded transition-colors">
                  <Badge>{CATEGORIES[p.category as keyof typeof CATEGORIES]?.[lang] || p.category}</Badge>
                  <span className="text-[14px] font-medium flex-1 truncate">{bi(p.title, p.titleEn)}</span>
                  <span className="text-[12px] text-gray-400">{p.publishedAt?.slice(0, 10)}</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
