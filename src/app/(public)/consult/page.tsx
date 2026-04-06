// src/app/(public)/consult/page.tsx
'use client';

import { useState } from 'react';
import { useLang } from '@/lib/i18n';
import { Btn, Icon, Badge } from '@/components/ui';
import { BUSINESS_TYPE_LABELS, type BusinessType } from '@/modules/reg-consulting';

const JURISDICTIONS = [
  { code: 'KR', flag: '🇰🇷', ko: '한국', en: 'South Korea' },
  { code: 'US', flag: '🇺🇸', ko: '미국', en: 'United States' },
  { code: 'EU', flag: '🇪🇺', ko: 'EU', en: 'European Union' },
  { code: 'SG', flag: '🇸🇬', ko: '싱가포르', en: 'Singapore' },
  { code: 'JP', flag: '🇯🇵', ko: '일본', en: 'Japan' },
  { code: 'HK', flag: '🇭🇰', ko: '홍콩', en: 'Hong Kong' },
];

const STAGES = [
  { value: 'idea', ko: '아이디어 단계', en: 'Idea Stage' },
  { value: 'building', ko: '개발/구축 중', en: 'Building' },
  { value: 'operating', ko: '운영 중', en: 'Operating' },
  { value: 'expanding', ko: '확장/신규 시장 진출', en: 'Expanding' },
];

const TOKEN_TYPES = [
  { value: 'stablecoin', ko: '스테이블코인', en: 'Stablecoin' },
  { value: 'utility', ko: '유틸리티 토큰', en: 'Utility Token' },
  { value: 'security', ko: '증권형 토큰 (STO)', en: 'Security Token (STO)' },
  { value: 'nft', ko: 'NFT', en: 'NFT' },
  { value: 'governance', ko: '거버넌스 토큰', en: 'Governance Token' },
];

const RISK_COLORS = { low: 'green', medium: 'amber', high: 'red' } as const;
const RISK_LABELS = { low: { ko: '낮음', en: 'Low' }, medium: { ko: '중간', en: 'Medium' }, high: { ko: '높음', en: 'High' } };

export default function ConsultPage() {
  const { lang, t, bi } = useLang();
  const [step, setStep] = useState<'form' | 'loading' | 'report'>('form');
  const [report, setReport] = useState<any>(null);
  const [error, setError] = useState('');

  // Form state
  const [companyName, setCompanyName] = useState('');
  const [description, setDescription] = useState('');
  const [businessTypes, setBusinessTypes] = useState<BusinessType[]>([]);
  const [jurisdictions, setJurisdictions] = useState<string[]>([]);
  const [hasToken, setHasToken] = useState(false);
  const [tokenType, setTokenType] = useState('');
  const [stage, setStage] = useState('idea');
  const [employeeCount, setEmployeeCount] = useState('');

  const toggleBizType = (bt: BusinessType) => {
    setBusinessTypes(prev => prev.includes(bt) ? prev.filter(x => x !== bt) : [...prev, bt]);
  };
  const toggleJurisdiction = (j: string) => {
    setJurisdictions(prev => prev.includes(j) ? prev.filter(x => x !== j) : [...prev, j]);
  };

  const handleSubmit = async () => {
    if (description.length < 20) { setError(t('사업 설명을 20자 이상 입력해주세요.', 'Please describe your business in at least 20 characters.')); return; }
    if (businessTypes.length === 0) { setError(t('사업 유형을 하나 이상 선택해주세요.', 'Please select at least one business type.')); return; }
    if (jurisdictions.length === 0) { setError(t('관할권을 하나 이상 선택해주세요.', 'Please select at least one jurisdiction.')); return; }

    setStep('loading');
    setError('');

    try {
      const res = await fetch('/api/consult', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyName, description, businessTypes, targetJurisdictions: jurisdictions,
          hasToken, tokenType: hasToken ? tokenType : undefined,
          currentStage: stage, employeeCount: employeeCount || undefined,
        }),
      });
      const data = await res.json();
      if (data.error) { setError(data.error); setStep('form'); return; }
      setReport(data.report);
      setStep('report');
    } catch {
      setError(t('분석 중 오류가 발생했습니다.', 'Analysis failed.')); setStep('form');
    }
  };

  // ═══ REPORT VIEW ═══
  if (step === 'report' && report) {
    const adv = report.aiAdvisory;
    return (
      <div className="pt-32 pb-20 max-w-[960px] mx-auto px-6">
        <button onClick={() => setStep('form')} className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-green-deep mb-6">
          <Icon name="back" size={16} /> {t('새로운 분석', 'New Analysis')}
        </button>

        <div className="flex items-center gap-3 mb-6">
          <h1 className="text-[24px] font-bold">{t('규제 컴플라이언스 리포트', 'Regulatory Compliance Report')}</h1>
          <Badge color={RISK_COLORS[adv.riskLevel as keyof typeof RISK_COLORS]}>
            {t('위험도', 'Risk')}: {RISK_LABELS[adv.riskLevel as keyof typeof RISK_LABELS]?.[lang === 'en' ? 'en' : 'ko']}
          </Badge>
        </div>

        {companyName && <div className="text-[14px] text-gray-500 mb-1">{companyName}</div>}
        <div className="text-[12px] text-gray-400 mb-8">{t('생성일', 'Generated')}: {new Date(report.generatedAt).toLocaleDateString()} · {report.jurisdictionsAnalyzed.join(', ')} · {report.businessTypesAnalyzed.map((bt: string) => BUSINESS_TYPE_LABELS[bt as BusinessType]?.en).join(', ')}</div>

        {/* AI Summary */}
        <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-6">
          <div className="text-[12px] font-bold text-green-800 uppercase tracking-wider mb-3">{t('AI 종합 의견', 'AI Executive Summary')}</div>
          <p className="text-[15px] text-green-900 leading-relaxed mb-4">{lang === 'en' ? adv.summaryEn : adv.summary}</p>
        </div>

        {/* Immediate Actions */}
        <div className="mb-8">
          <h2 className="text-[16px] font-bold mb-4 flex items-center gap-2">
            <span className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center text-[12px] text-red-600 font-bold">!</span>
            {t('즉시 조치 사항', 'Immediate Actions Required')}
          </h2>
          <div className="space-y-2">
            {(lang === 'en' ? adv.immediateActionsEn : adv.immediateActions)?.map((action: string, i: number) => (
              <div key={i} className="bg-white border border-[#e8e8e6] rounded-lg px-5 py-3.5 flex items-start gap-3">
                <span className="w-5 h-5 bg-red-50 text-red-600 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 mt-0.5">{i + 1}</span>
                <span className="text-[14px] text-gray-700 leading-relaxed">{action}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Timeline Warnings */}
        {(adv.timelineWarnings?.length > 0 || adv.timelineWarningsEn?.length > 0) && (
          <div className="mb-8">
            <h2 className="text-[16px] font-bold mb-4 flex items-center gap-2">
              <span className="w-6 h-6 bg-amber-100 rounded-full flex items-center justify-center text-[12px] text-amber-600 font-bold">⏰</span>
              {t('타임라인 경고', 'Timeline Warnings')}
            </h2>
            <div className="space-y-2">
              {(lang === 'en' ? adv.timelineWarningsEn : adv.timelineWarnings)?.map((warning: string, i: number) => (
                <div key={i} className="bg-amber-50 border border-amber-200 rounded-lg px-5 py-3.5 text-[14px] text-amber-900 leading-relaxed">
                  {warning}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Current Laws by Jurisdiction */}
        <div className="mb-8">
          <h2 className="text-[16px] font-bold mb-4">{t('관할권별 현행법 요건', 'Current Law Requirements by Jurisdiction')}</h2>
          {report.currentLaws.map((jur: any) => (
            <div key={jur.jurisdiction} className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[16px]">{JURISDICTIONS.find(j => j.code === jur.jurisdiction)?.flag}</span>
                <span className="text-[14px] font-semibold">{t(
                  JURISDICTIONS.find(j => j.code === jur.jurisdiction)?.ko || jur.jurisdiction,
                  JURISDICTIONS.find(j => j.code === jur.jurisdiction)?.en || jur.jurisdiction
                )}</span>
                <span className="text-[12px] text-gray-400">{jur.totalRequirements} {t('개 요건', 'requirements')}</span>
              </div>
              {jur.laws.map((law: any) => (
                <div key={law.id} className="bg-white border border-[#e8e8e6] rounded-xl p-5 mb-2">
                  <div className="text-[14px] font-semibold mb-1">{lang === 'en' ? law.lawNameEn : law.lawName}</div>
                  <div className="text-[12px] text-gray-400 mb-3">{t('시행일', 'Enacted')}: {law.enacted}</div>
                  <div className="space-y-1.5">
                    {law.requirements.map((req: any) => (
                      <div key={req.id} className="flex items-start gap-2 text-[13px]">
                        <Badge color={req.category === 'license' || req.category === 'registration' ? 'red' : req.category === 'aml' ? 'amber' : 'blue'}>
                          {req.category}
                        </Badge>
                        <span className="text-gray-600">{lang === 'en' ? req.requirementEn : req.requirement}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 pt-3 border-t border-gray-100 text-[12px] text-red-600">
                    {t('벌칙', 'Penalties')}: {lang === 'en' ? law.penaltiesEn : law.penalties}
                  </div>
                </div>
              ))}
              {jur.laws.length === 0 && (
                <div className="text-[13px] text-gray-400 italic pl-7">{t('이 관할권에 해당하는 현행법이 데이터베이스에 없습니다.', 'No matching current laws in our database for this jurisdiction.')}</div>
              )}
            </div>
          ))}
        </div>

        {/* Pending Bills */}
        {report.pendingBills.length > 0 && (
          <div className="mb-8">
            <h2 className="text-[16px] font-bold mb-4">{t('진행 중인 법안 (사업 영향)', 'Pending Legislation (Business Impact)')}</h2>
            {report.pendingBills.map((bill: any, i: number) => (
              <div key={i} className="bg-white border border-[#e8e8e6] rounded-xl p-5 mb-2">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[14px]">{JURISDICTIONS.find(j => j.code === bill.jurisdiction)?.flag}</span>
                  <Badge color="amber">{bill.status}</Badge>
                  {bill.impactScore && (
                    <span className={`text-[12px] font-bold px-2 py-0.5 rounded ${bill.impactScore >= 8 ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'}`}>
                      Impact {bill.impactScore}/10
                    </span>
                  )}
                </div>
                <div className="text-[14px] font-semibold mb-1">{lang === 'en' ? (bill.titleEn || bill.title) : bill.title}</div>
                <div className="flex items-center gap-4 mt-2 text-[12px] text-gray-500">
                  <span>⏱ {t('예상 시행', 'Est. timeline')}: <strong>{bill.estimatedTimeline}</strong></span>
                </div>
                {bill.impactSummary && <p className="text-[13px] text-gray-500 mt-2 leading-relaxed">{lang === 'en' ? bill.impactSummaryEn : bill.impactSummary}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // ═══ LOADING ═══
  if (step === 'loading') {
    return (
      <div className="pt-32 pb-20 max-w-[600px] mx-auto px-6 text-center">
        <div className="w-12 h-12 border-3 border-green-deep/20 border-t-green-deep rounded-full animate-spin mx-auto mb-6" />
        <h2 className="text-[20px] font-bold mb-2">{t('규제 분석 중...', 'Analyzing regulations...')}</h2>
        <p className="text-[14px] text-gray-500">{t(
          'AI가 현행법 매칭, 진행 중인 법안 스캔, 컴플라이언스 리포트를 생성하고 있습니다. 약 15-30초 소요됩니다.',
          'AI is matching current laws, scanning pending bills, and generating your compliance report. This takes about 15-30 seconds.'
        )}</p>
      </div>
    );
  }

  // ═══ FORM ═══
  return (
    <div className="pt-32 pb-20 max-w-[800px] mx-auto px-6">
      <div className="text-[11px] font-bold tracking-widest uppercase text-green-deep mb-3">{t('규제 컨설팅', 'Regulatory Consulting')}</div>
      <h1 className="text-2xl md:text-[32px] font-bold tracking-tight mb-2">
        {t('사업 정보를 입력하면 규제 준수 가이드를 생성합니다', 'Enter your business details for a compliance guide')}
      </h1>
      <p className="text-[16px] text-gray-500 leading-relaxed mb-8">
        {t('현행법 요건, 진행 중인 법안의 영향, 준비해야 할 타임라인을 AI가 분석합니다.',
          'AI analyzes current law requirements, pending bill impact, and preparation timelines for your business.')}
      </p>

      {error && <div className="bg-red-50 border border-red-200 rounded-xl px-5 py-3 mb-4 text-[13px] text-red-700">{error}</div>}

      <div className="space-y-6">
        {/* Company name */}
        <div>
          <label className="block mb-1.5 text-[13px] font-semibold text-gray-700">{t('회사명 (선택)', 'Company Name (optional)')}</label>
          <input type="text" value={companyName} onChange={e => setCompanyName(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-green-deep/40 transition-colors"
            placeholder={t('회사명 입력', 'Enter company name')} />
        </div>

        {/* Business description */}
        <div>
          <label className="block mb-1.5 text-[13px] font-semibold text-gray-700">{t('사업 설명', 'Business Description')} *</label>
          <textarea value={description} onChange={e => setDescription(e.target.value)}
            className="w-full px-3.5 py-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-green-deep/40 transition-colors min-h-[120px] resize-y"
            placeholder={t(
              '사업 내용을 구체적으로 설명해주세요. 예: "원화 연동 스테이블코인을 발행하고 한국 거래소에 상장하여 결제 서비스를 제공하려 합니다."',
              'Describe your business in detail. E.g., "We plan to issue a KRW-pegged stablecoin and list it on Korean exchanges to provide payment services."'
            )} />
          <div className="text-[11px] text-gray-400 mt-1">{description.length} {t('자', 'chars')}</div>
        </div>

        {/* Business types */}
        <div>
          <label className="block mb-2 text-[13px] font-semibold text-gray-700">{t('사업 유형', 'Business Type')} * ({t('복수 선택', 'multiple')})</label>
          <div className="flex flex-wrap gap-2">
            {Object.entries(BUSINESS_TYPE_LABELS).map(([key, label]) => (
              <button key={key} onClick={() => toggleBizType(key as BusinessType)}
                className={`px-3.5 py-2 rounded-lg text-[13px] font-medium border transition-all cursor-pointer ${
                  businessTypes.includes(key as BusinessType)
                    ? 'bg-green-deep text-white border-green-deep'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                }`}>
                {lang === 'en' ? label.en : label.ko}
              </button>
            ))}
          </div>
        </div>

        {/* Target jurisdictions */}
        <div>
          <label className="block mb-2 text-[13px] font-semibold text-gray-700">{t('대상 관할권', 'Target Jurisdictions')} * ({t('복수 선택', 'multiple')})</label>
          <div className="flex flex-wrap gap-2">
            {JURISDICTIONS.map(j => (
              <button key={j.code} onClick={() => toggleJurisdiction(j.code)}
                className={`px-3.5 py-2 rounded-lg text-[13px] font-medium border transition-all cursor-pointer ${
                  jurisdictions.includes(j.code)
                    ? 'bg-green-deep text-white border-green-deep'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                }`}>
                {j.flag} {lang === 'en' ? j.en : j.ko}
              </button>
            ))}
          </div>
        </div>

        {/* Token issuance */}
        <div>
          <label className="block mb-2 text-[13px] font-semibold text-gray-700">{t('토큰 발행 여부', 'Token Issuance')}</label>
          <div className="flex gap-3">
            <button onClick={() => setHasToken(true)}
              className={`px-4 py-2 rounded-lg text-[13px] font-medium border transition-all cursor-pointer ${hasToken ? 'bg-green-deep text-white border-green-deep' : 'bg-white text-gray-600 border-gray-200'}`}>
              {t('예', 'Yes')}
            </button>
            <button onClick={() => { setHasToken(false); setTokenType(''); }}
              className={`px-4 py-2 rounded-lg text-[13px] font-medium border transition-all cursor-pointer ${!hasToken ? 'bg-green-deep text-white border-green-deep' : 'bg-white text-gray-600 border-gray-200'}`}>
              {t('아니오', 'No')}
            </button>
          </div>
          {hasToken && (
            <div className="flex flex-wrap gap-2 mt-3">
              {TOKEN_TYPES.map(tt => (
                <button key={tt.value} onClick={() => setTokenType(tt.value)}
                  className={`px-3 py-1.5 rounded-full text-[12px] font-medium border transition-all cursor-pointer ${
                    tokenType === tt.value ? 'bg-purple-600 text-white border-purple-600' : 'bg-white text-gray-500 border-gray-200'
                  }`}>
                  {lang === 'en' ? tt.en : tt.ko}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Current stage */}
        <div>
          <label className="block mb-2 text-[13px] font-semibold text-gray-700">{t('현재 단계', 'Current Stage')}</label>
          <div className="flex flex-wrap gap-2">
            {STAGES.map(s => (
              <button key={s.value} onClick={() => setStage(s.value)}
                className={`px-3.5 py-2 rounded-lg text-[13px] font-medium border transition-all cursor-pointer ${
                  stage === s.value ? 'bg-green-deep text-white border-green-deep' : 'bg-white text-gray-600 border-gray-200'
                }`}>
                {lang === 'en' ? s.en : s.ko}
              </button>
            ))}
          </div>
        </div>

        {/* Submit */}
        <div className="pt-4">
          <Btn onClick={handleSubmit} disabled={description.length < 20 || businessTypes.length === 0 || jurisdictions.length === 0}>
            <Icon name="search" size={16} /> {t('규제 분석 실행', 'Run Regulatory Analysis')}
          </Btn>
          <p className="text-[11px] text-gray-400 mt-3">
            {t('AI가 현행법 매칭, 진행 중인 법안 스캔, 타임라인 예측을 수행합니다. 약 15-30초 소요됩니다.',
              'AI matches current laws, scans pending bills, and predicts timelines. Takes about 15-30 seconds.')}
          </p>
        </div>
      </div>
    </div>
  );
}
