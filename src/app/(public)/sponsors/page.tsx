'use client';

import { useLang } from '@/lib/i18n';
import { Icon, Btn } from '@/components/ui';

export default function SponsorsPage() {
  const { t } = useLang();

  const tiers = [
    {
      name: t('플래티넘', 'Platinum'),
      price: t('연 5,000만원~', 'From $40,000/yr'),
      color: 'from-gray-700 to-gray-900',
      features: [
        t('대시보드 로고 노출 (메인)', 'Logo on main dashboard'),
        t('주간 리포트 로고 삽입', 'Logo in weekly reports'),
        t('전용 정책 브리핑 월 2회', '2 exclusive policy briefings/month'),
        t('정부 제언 보고서 공동 발행', 'Co-publish government policy reports'),
        t('연례 정책 포럼 공동 주최', 'Co-host annual policy forum'),
        t('맞춤 규제 컨설팅 무제한', 'Unlimited custom consulting'),
      ],
    },
    {
      name: t('골드', 'Gold'),
      price: t('연 2,000만원~', 'From $15,000/yr'),
      color: 'from-amber-500 to-amber-700',
      features: [
        t('대시보드 로고 노출', 'Logo on dashboard'),
        t('주간 리포트 수신', 'Weekly report access'),
        t('전용 정책 브리핑 월 1회', '1 exclusive policy briefing/month'),
        t('정부 제언 보고서 열람', 'Access to policy reports'),
        t('맞춤 규제 컨설팅 월 3회', '3 custom consultings/month'),
      ],
    },
    {
      name: t('실버', 'Silver'),
      price: t('연 500만원~', 'From $4,000/yr'),
      color: 'from-gray-400 to-gray-500',
      features: [
        t('후원사 목록 등재', 'Listed as sponsor'),
        t('주간 뉴스레터 수신', 'Weekly newsletter'),
        t('대시보드 전체 접근', 'Full dashboard access'),
        t('맞춤 규제 컨설팅 월 1회', '1 custom consulting/month'),
      ],
    },
  ];

  return (
    <div className="pt-32 pb-20 max-w-[1000px] mx-auto px-6">
      <div className="text-center mb-12">
        <div className="text-[11px] font-bold tracking-widest uppercase text-green-deep mb-3">{t('후원 안내', 'Sponsorship')}</div>
        <h1 className="text-3xl md:text-[40px] font-bold tracking-tight mb-4">
          {t('디지털자산 정책의 미래를 함께 만듭니다', 'Together, shaping the future of digital asset policy')}
        </h1>
        <p className="text-gray-500 max-w-xl mx-auto leading-relaxed">
          {t(
            'IDAPI는 비영리 정책 연구기관입니다. 후원은 독립적이고 공정한 정책 연구를 지속하는 데 사용됩니다.',
            'IDAPI is a non-profit policy institute. Sponsorships fund independent, impartial policy research.'
          )}
        </p>
      </div>

      {/* Impact Numbers */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
        {[
          { v: '5,089', l: t('분석 조문', 'Articles Analyzed') },
          { v: '75', l: t('추적 법률', 'Laws Tracked') },
          { v: '6', l: t('관할권', 'Jurisdictions') },
          { v: '104+', l: t('진행 중 법안', 'Active Bills') },
        ].map(s => (
          <div key={s.l} className="bg-green-50 border border-green-deep/10 rounded-xl p-5 text-center">
            <div className="text-2xl font-bold text-green-deep">{s.v}</div>
            <div className="text-[11px] text-gray-500 mt-1">{s.l}</div>
          </div>
        ))}
      </div>

      {/* Sponsorship Tiers */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {tiers.map((tier, i) => (
          <div key={tier.name} className={`rounded-2xl overflow-hidden border ${i === 0 ? 'border-gray-800 shadow-xl' : 'border-[#e8e8e6]'}`}>
            <div className={`bg-gradient-to-r ${tier.color} text-white px-6 py-5`}>
              <div className="text-[12px] uppercase tracking-wider opacity-80">{tier.name}</div>
              <div className="text-2xl font-bold mt-1">{tier.price}</div>
            </div>
            <div className="p-6">
              <ul className="space-y-3">
                {tier.features.map(f => (
                  <li key={f} className="flex items-start gap-2.5 text-[14px] text-gray-700">
                    <span className="text-green-deep mt-0.5"><Icon name="shield" size={14} /></span>
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>

      {/* Mission Statement */}
      <div className="bg-green-deep text-white rounded-2xl p-8 md:p-10 text-center mb-12">
        <h2 className="text-2xl font-bold mb-4">{t('IDAPI의 미션', 'Our Mission')}</h2>
        <p className="text-white/80 max-w-2xl mx-auto leading-relaxed mb-6">
          {t(
            '대한민국 국민의 국익을 위한 디지털자산 입법에 기여하고, 글로벌 정책 인텔리전스를 통해 산업의 건강한 성장을 지원합니다. IDAPI의 연구는 정부, 기업, 학계 모두에게 공개되며, 독립적이고 비당파적인 관점을 유지합니다.',
            'We contribute to digital asset legislation in Korea\'s national interest and support healthy industry growth through global policy intelligence. IDAPI\'s research is open to government, industry, and academia, maintaining an independent, non-partisan perspective.'
          )}
        </p>
        <a href="mailto:contact@idapi.kr" className="inline-flex items-center gap-2 px-6 py-3 bg-white text-green-deep rounded-lg text-sm font-bold hover:bg-white/90 transition">
          {t('후원 문의하기', 'Contact for Sponsorship')} <Icon name="arrow" size={14} />
        </a>
      </div>

      {/* How Sponsorship Is Used */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { icon: 'file', title: t('정책 연구', 'Policy Research'), desc: t('독립적 정책 분석 보고서 발간 및 데이터 인프라 운영', 'Publishing independent policy reports and maintaining data infrastructure') },
          { icon: 'users', title: t('전문가 네트워크', 'Expert Network'), desc: t('글로벌 정책 전문가 라운드테이블 및 세미나 운영', 'Global policy expert roundtables and seminars') },
          { icon: 'globe', title: t('국제 협력', 'International Cooperation'), desc: t('해외 규제기관과의 정책 대화 및 한국 입장 전달', 'Policy dialogue with foreign regulators and conveying Korea\'s position') },
        ].map(item => (
          <div key={item.title} className="text-center p-6">
            <div className="w-12 h-12 bg-green-pale rounded-xl flex items-center justify-center mx-auto mb-4 text-green-deep"><Icon name={item.icon} size={22} /></div>
            <h3 className="text-[15px] font-bold mb-2">{item.title}</h3>
            <p className="text-[13px] text-gray-500 leading-relaxed">{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
