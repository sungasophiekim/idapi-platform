'use client';

import Link from 'next/link';
import { useLang } from '@/lib/i18n';

const AREAS = [
  {
    ko: 'AI 거버넌스·규제',
    en: 'AI Governance & Regulation',
    descKo: 'AI Act, 알고리즘 책무성, 공공부문 AI 도입 등 AI 시대의 규범 설계를 연구합니다.',
    descEn: 'Norm-setting for the AI era — the AI Act, algorithmic accountability, and public-sector AI.',
  },
  {
    ko: '디지털 공공인프라 (DPI)',
    en: 'Digital Public Infrastructure',
    descKo: '결제 레일, 데이터 교환, 상호운용성 등 사회의 디지털 기반 인프라를 다룹니다.',
    descEn: 'Payment rails, data exchange, and interoperability — the digital foundations of society.',
  },
  {
    ko: '디지털 신원·신뢰',
    en: 'Digital Identity & Trust',
    descKo: '디지털 ID, 검증가능 자격증명, 신뢰 프레임워크를 연구합니다.',
    descEn: 'Digital ID, verifiable credentials, and trust frameworks.',
  },
  {
    ko: '데이터 거버넌스·프라이버시',
    en: 'Data Governance & Privacy',
    descKo: '데이터 보호, 국경간 데이터 이동, 데이터 주권을 다룹니다.',
    descEn: 'Data protection, cross-border data flows, and data sovereignty.',
  },
  {
    ko: '디지털 자산·토큰화 인프라',
    en: 'Digital Assets & Tokenized Infra',
    descKo: '디지털 자산 정책과 토큰화된 금융·시장 인프라를 연구합니다.',
    descEn: 'Digital asset policy and tokenized financial & market infrastructure.',
  },
];

export default function FocusAreasPage() {
  const { t } = useLang();
  return (
    <div className="pt-28 pb-24">
      <div className="max-w-[1140px] mx-auto px-6">
        <div className="max-w-[680px] mb-14">
          <div className="text-[11px] font-bold tracking-widest uppercase text-green-deep/60 mb-3">
            {t('연구영역', 'Focus Areas')}
          </div>
          <h1 className="text-[38px] font-bold tracking-tight leading-tight text-gray-900">
            {t('디지털·AI 공공 인프라의 다섯 축', 'Five pillars of digital & AI public infrastructure')}
          </h1>
          <p className="mt-4 text-[15px] text-gray-500 leading-relaxed">
            {t(
              'iDAPI는 디지털·AI 시대의 공공 인프라를 다섯 개 연구영역으로 나누어 정책을 설계합니다.',
              'iDAPI shapes policy across five focus areas at the core of the digital & AI era.',
            )}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {AREAS.map((a, i) => (
            <div key={a.en} className="border border-border rounded-xl p-7 bg-bg-alt hover:shadow-sm transition-shadow">
              <div className="text-[12px] font-bold text-green-deep/50 mb-2">{String(i + 1).padStart(2, '0')}</div>
              <h2 className="text-[19px] font-bold tracking-tight text-gray-900">{t(a.ko, a.en)}</h2>
              <p className="mt-2 text-[14px] text-gray-500 leading-relaxed">{t(a.descKo, a.descEn)}</p>
              <Link href="/research" className="inline-block mt-4 text-[13px] font-medium text-green-deep hover:text-green-light">
                {t('관련 연구 보기 →', 'View research →')}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
