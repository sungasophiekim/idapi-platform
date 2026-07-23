// src/components/layout/Footer.tsx
'use client';

import Link from 'next/link';
import { useLang } from '@/lib/i18n';
import Logo from '@/components/Logo';

export default function Footer() {
  const { t } = useLang();

  return (
    <footer className="bg-green-deep text-white pt-14 pb-8">
      <div className="max-w-[1140px] mx-auto px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-9 mb-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2.5 mb-3">
              <Logo size={26} onDark />
              <span className="font-bold text-[16px]">IDAPI</span>
            </div>
          </div>

          {/* Research */}
          <div>
            <h5 className="font-mono text-[10px] font-medium tracking-[0.12em] uppercase text-white/40 mb-4">{t('연구영역', 'Focus Areas')}</h5>
            <div className="space-y-2">
              {[
                { ko: 'AI 거버넌스·규제', en: 'AI Governance & Regulation' },
                { ko: '디지털 공공인프라(DPI)', en: 'Digital Public Infrastructure' },
                { ko: '디지털 신원·신뢰', en: 'Digital Identity & Trust' },
                { ko: '데이터 거버넌스·프라이버시', en: 'Data Governance & Privacy' },
                { ko: '디지털 자산·토큰화 인프라', en: 'Digital Assets & Tokenized Infra' },
              ].map(item => (
                <Link key={item.en} href="/focus-areas" className="block text-[13px] text-white/60 hover:text-white transition-colors">{t(item.ko, item.en)}</Link>
              ))}
            </div>
          </div>

          {/* Activities */}
          <div>
            <h5 className="font-mono text-[10px] font-medium tracking-[0.12em] uppercase text-white/40 mb-4">{t('활동', 'Activities')}</h5>
            <div className="space-y-2">
              {[
                t('글로벌 정책 대화', 'Global Policy Dialogue'),
                t('정책 라운드테이블', 'Policy Roundtable'),
                t('연구자료', 'Publications'),
              ].map(item => (
                <div key={item} className="text-[13px] text-white/60 hover:text-white cursor-pointer transition-colors">{item}</div>
              ))}
            </div>
          </div>

          {/* About */}
          <div>
            <h5 className="font-mono text-[10px] font-medium tracking-[0.12em] uppercase text-white/40 mb-4">{t('소개', 'About')}</h5>
            <div className="space-y-2">
              <Link href="/about" className="block text-[13px] text-white/60 hover:text-white transition-colors">About IDAPI</Link>
              <Link href="/team" className="block text-[13px] text-white/60 hover:text-white transition-colors">{t('팀 소개', 'Our Team')}</Link>
              <Link href="/sponsors" className="block text-[13px] text-white/60 hover:text-white transition-colors">{t('후원 안내', 'Sponsorship')}</Link>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 pt-5 flex flex-col sm:flex-row justify-between text-[12px] text-white/35 gap-2">
          <span>&copy; 2026 IDAPI. All rights reserved.</span>
          <span>Singapore &middot; Seoul</span>
        </div>
      </div>
    </footer>
  );
}
