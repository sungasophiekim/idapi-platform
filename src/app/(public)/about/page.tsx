// src/app/(public)/about/page.tsx
'use client';

import Link from 'next/link';
import { useLang } from '@/lib/i18n';
import { Btn, Icon } from '@/components/ui';

export default function AboutPage() {
  const { t } = useLang();

  const sections = [
    { title: 'Independent. Policy-driven. Globally Connected.',
      ko: 'IDAPI는 민간 주도의 독립적 거버넌스를 기반으로 설립된 정책 연구소로, 디지털자산 산업의 초기 형성기에 참여해 온 전문가들과 금융·법률 분야 전문 인력이 중심이 되어 2025년 연구를 시작했습니다. 우리는 연구 결과의 발간에 머무르지 않고 정책 결정자, 금융기관, 산업 참여자 간 실질적인 대화를 촉진함으로써 정책 변화와 산업의 지속 가능한 성장을 지원합니다.',
      en: 'IDAPI is an independent policy research institute founded on privately led governance. Launched in 2025 by early digital asset experts together with financial and legal professionals, the institute goes beyond publishing research to convene meaningful dialogue among policymakers and industry stakeholders.' },
    { title: 'Global Strategic Base',
      ko: 'IDAPI는 아시아 디지털자산 정책 논의의 핵심 허브인 싱가포르에 비영리 재단으로 설립되었습니다. 이를 기반으로 한국의 정책 경험과 연구 성과를 국제사회와 연결하고, 글로벌 기준과 국내 제도 간 정합성을 높이는 전략적 가교 역할을 수행합니다.',
      en: 'IDAPI is a non-profit foundation established in Singapore, a key hub for digital asset policy in Asia. From this strategic base, it bridges Korea\'s policy expertise with the global community.' },
    { title: 'Collective Intelligence',
      ko: 'IDAPI는 자본시장 전문가, 법률가, 기술 전문가, 정책 연구자가 함께 참여하는 다학제적 연구를 통해 보다 입체적이고 현실적인 정책 대안을 제시합니다.',
      en: 'Through interdisciplinary research bringing together capital markets experts, legal professionals, technologists, and policy researchers, IDAPI develops comprehensive and pragmatic policy solutions.' },
  ];

  return (
    <section className="pt-32 pb-20 max-w-[800px] mx-auto px-6">
      <div className="text-[11px] font-bold tracking-widest uppercase text-green-deep mb-3">About IDAPI</div>
      <h1 className="text-[28px] font-bold mb-2">IDAPI: International Digital Asset Policy Institute</h1>
      <p className="text-lg text-gray-500 italic mb-8">
        {t('전문가 집단지성으로 설계하는 디지털자산 정책의 내일', 'Shaping the Future of Digital Asset Policy through Collective Intelligence')}
      </p>
      <p className="text-[15px] text-gray-500 leading-relaxed mb-8">
        {t(
          '국제디지털자산정책연구소(IDAPI)는 자본시장, 법률, 기술, 정책 분야 전문가들이 참여하는 비영리·비당파 정책 연구기관입니다. 다학제적 전문성을 바탕으로 공공의 이익과 산업의 혁신이 균형을 이루는 합리적이고 실행 가능한 정책 프레임워크를 제시합니다.',
          'IDAPI is a non-profit, non-partisan policy institute uniting experts across capital markets, law, technology, and public policy to develop balanced, actionable frameworks.'
        )}
      </p>
      {sections.map(s => (
        <div key={s.title} className="mb-7">
          <h3 className="text-lg font-bold mb-2">{s.title}</h3>
          <p className="text-[15px] text-gray-500 leading-relaxed">{t(s.ko, s.en)}</p>
        </div>
      ))}
      <Link href="/team"><Btn className="mt-3">{t('팀 소개 보기', 'Meet Our Team')} <Icon name="arrow" size={16} /></Btn></Link>
    </section>
  );
}
