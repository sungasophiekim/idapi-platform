// src/components/layout/Footer.tsx
'use client';

import Link from 'next/link';
import { useLang } from '@/lib/i18n';

export default function Footer() {
  const { t } = useLang();

  return (
    <footer className="bg-green-deep text-white pt-14 pb-8">
      <div className="max-w-[1140px] mx-auto px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-9 mb-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-[26px] h-[26px] bg-white/15 rounded flex items-center justify-center text-[9px] font-bold tracking-wider">ID</div>
              <span className="font-bold text-[16px]">IDAPI</span>
            </div>
            <p className="text-[13px] text-white/50 leading-relaxed max-w-[260px]">
              {t('전문가 집단지성으로 설계하는 디지털 자산 정책의 내일', 'Shaping the Future of Digital Asset Policy through Collective Intelligence')}
            </p>
          </div>

          {/* Research */}
          <div>
            <h5 className="text-[10px] font-bold tracking-widest uppercase text-white/35 mb-4">{t('연구영역', 'Research')}</h5>
            <div className="space-y-2">
              {[
                t('한국 디지털자산 정책', 'DigitalAsset Policy KR'),
                t('디지털자산금융', 'DigitalAsset Finance'),
                t('시장인프라', 'Infrastructure'),
                t('디지털임팩트 및 포용', 'Digital Impact & Inclusion'),
              ].map(item => (
                <div key={item} className="text-[13px] text-white/60 hover:text-white cursor-pointer transition-colors">{item}</div>
              ))}
            </div>
          </div>

          {/* Activities */}
          <div>
            <h5 className="text-[10px] font-bold tracking-widest uppercase text-white/35 mb-4">{t('활동', 'Activities')}</h5>
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
            <h5 className="text-[10px] font-bold tracking-widest uppercase text-white/35 mb-4">{t('소개', 'About')}</h5>
            <div className="space-y-2">
              <Link href="/about" className="block text-[13px] text-white/60 hover:text-white transition-colors">About IDAPI</Link>
              <Link href="/team" className="block text-[13px] text-white/60 hover:text-white transition-colors">{t('팀 소개', 'Our Team')}</Link>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 pt-5 flex flex-col sm:flex-row justify-between text-[12px] text-white/35 gap-2">
          <span>&copy; 2025 IDAPI. All rights reserved.</span>
          <span>Singapore &middot; Seoul</span>
        </div>
      </div>
    </footer>
  );
}
