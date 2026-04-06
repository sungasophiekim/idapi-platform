// src/app/(public)/team/TeamClient.tsx
'use client';

import Link from 'next/link';
import { useLang } from '@/lib/i18n';

export default function TeamClient({ members }: { members: any[] }) {
  const { t, bi } = useLang();

  return (
    <section className="pt-32 pb-20 max-w-[1140px] mx-auto px-6">
      <div className="text-[11px] font-bold tracking-widest uppercase text-green-deep mb-3">{t('팀 소개', 'Our Team')}</div>
      <h2 className="text-2xl md:text-[32px] font-bold mb-2">{t('디지털자산 정책의 미래를 정의하다', 'Defining the Future of Digital Asset Policy')}</h2>
      <p className="text-[16px] italic text-gray-500 mb-10">{t('글로벌 통찰, 한국 중심의 실행', 'Global Insight. Korea-Focused Execution.')}</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {members.map(m => {
          const name = bi(m.name, m.nameEn);
          const initials = name.split(' ').map((s: string) => s[0]).join('').slice(0, 2).toUpperCase();
          return (
            <Link key={m.id} href={`/team/${m.id}`}
              className="block bg-white border border-[#e8e8e6] rounded-xl p-7 hover:-translate-y-0.5 hover:shadow-lg transition-all duration-300 group">
              <div className="w-[52px] h-[52px] bg-green-pale rounded-full flex items-center justify-center font-bold text-lg text-green-deep mb-3.5">{initials}</div>
              <h3 className="text-[17px] font-bold mb-0.5">{name}</h3>
              <div className="text-[13px] font-semibold text-green-deep mb-3">{bi(m.title, m.titleEn)}</div>
              <p className="text-[13px] text-gray-500 leading-relaxed line-clamp-3">{bi(m.bio, m.bioEn)}</p>
              <div className="mt-3.5 text-[13px] font-semibold text-green-deep group-hover:gap-2 inline-flex items-center gap-1 transition-all">
                {t('약력보기', 'View Profile')} →
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
