// src/app/(public)/analyze/page.tsx
'use client';

import { useState } from 'react';
import { useLang } from '@/lib/i18n';
import { Btn, Icon, Badge, SelectField } from '@/components/ui';

const JURISDICTIONS = [
  { value: 'KR', label: '🇰🇷 한국 / Korea' },
  { value: 'US', label: '🇺🇸 미국 / United States' },
  { value: 'EU', label: '🇪🇺 EU / European Union' },
  { value: 'SG', label: '🇸🇬 싱가포르 / Singapore' },
  { value: 'JP', label: '🇯🇵 일본 / Japan' },
  { value: 'UK', label: '🇬🇧 영국 / United Kingdom' },
  { value: 'HK', label: '🇭🇰 홍콩 / Hong Kong' },
  { value: 'INTL', label: '🌐 국제기구 / International' },
];

interface AnalysisResult {
  summary: string;
  summaryEn: string;
  impactScore: number;
  tags: string[];
  researchArea: string;
  keyPoints: string[];
  keyPointsEn: string[];
}

export default function AnalyzePage() {
  const { lang, t, bi } = useLang();
  const [mode, setMode] = useState<'analyze' | 'summarize' | 'compare'>('analyze');
  const [text, setText] = useState('');
  const [textB, setTextB] = useState('');
  const [jurisdiction, setJurisdiction] = useState('KR');
  const [jurisdictionB, setJurisdictionB] = useState('US');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');

  const handleAnalyze = async () => {
    if (text.length < 50) { setError(t('최소 50자 이상 입력해주세요.', 'Please enter at least 50 characters.')); return; }
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const body: any = { type: mode, text, jurisdiction };
      if (mode === 'compare') { body.textB = textB; body.jurisdictionB = jurisdictionB; }

      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (data.error) setError(data.error);
      else setResult(data);
    } catch (err: any) {
      setError(t('분석 중 오류가 발생했습니다.', 'Analysis failed. Please try again.'));
    }
    setLoading(false);
  };

  return (
    <div className="pt-32 pb-20 max-w-[900px] mx-auto px-6">
      <div className="text-[11px] font-bold tracking-widest uppercase text-green-deep mb-3">{t('AI 정책 분석기', 'AI Policy Analyzer')}</div>
      <h1 className="text-2xl md:text-[32px] font-bold tracking-tight mb-2">
        {t('규제 문서를 AI로 즉시 분석', 'Instantly Analyze Regulation Documents with AI')}
      </h1>
      <p className="text-[16px] text-gray-500 leading-relaxed mb-8">
        {t('법안, 고시, 가이드라인 원문을 붙여넣으면 AI가 요약, 영향도 평가, 핵심 논점을 자동으로 추출합니다.',
          'Paste any bill, notice, or guideline text and AI will generate a summary, impact assessment, and key points.')}
      </p>

      {/* Mode tabs */}
      <div className="flex gap-2 mb-6">
        {([
          { key: 'analyze' as const, ko: '규제 분석', en: 'Analyze Regulation' },
          { key: 'summarize' as const, ko: '요약 생성', en: 'Generate Summary' },
          { key: 'compare' as const, ko: '규제 비교', en: 'Compare Regulations' },
        ]).map(m => (
          <button key={m.key} onClick={() => { setMode(m.key); setResult(null); setError(''); }}
            className={`px-4 py-2 rounded-lg text-[13px] font-medium transition-all ${mode === m.key ? 'bg-green-deep text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
            {t(m.ko, m.en)}
          </button>
        ))}
      </div>

      {/* Input area */}
      <div className="bg-white border border-[#e8e8e6] rounded-xl p-6 mb-4">
        <div className={mode === 'compare' ? 'grid grid-cols-1 lg:grid-cols-2 gap-4' : ''}>
          <div>
            {mode === 'compare' && <div className="text-[12px] font-semibold text-gray-400 mb-2">{t('규제 A', 'Regulation A')}</div>}
            <SelectField
              label={t('관할권', 'Jurisdiction')}
              value={jurisdiction}
              onChange={setJurisdiction}
              options={JURISDICTIONS}
            />
            <div className="mb-4">
              <label className="block mb-1.5 text-[13px] font-semibold text-gray-700">
                {t('규제 원문', 'Regulation Text')}
              </label>
              <textarea
                className="w-full px-3.5 py-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-green-deep/40 transition-colors bg-white min-h-[200px] resize-y"
                value={text}
                onChange={e => setText(e.target.value)}
                placeholder={t(
                  '법안, 고시, 가이드라인 등의 원문을 여기에 붙여넣으세요...',
                  'Paste the full text of a bill, notice, or guideline here...'
                )}
              />
              <div className="text-[11px] text-gray-400 mt-1">{text.length.toLocaleString()} {t('자', 'chars')} {text.length < 50 && text.length > 0 ? `(${t('최소 50자', 'min 50 chars')})` : ''}</div>
            </div>
          </div>

          {mode === 'compare' && (
            <div>
              <div className="text-[12px] font-semibold text-gray-400 mb-2">{t('규제 B', 'Regulation B')}</div>
              <SelectField
                label={t('관할권', 'Jurisdiction')}
                value={jurisdictionB}
                onChange={setJurisdictionB}
                options={JURISDICTIONS}
              />
              <div className="mb-4">
                <label className="block mb-1.5 text-[13px] font-semibold text-gray-700">
                  {t('규제 원문', 'Regulation Text')}
                </label>
                <textarea
                  className="w-full px-3.5 py-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-green-deep/40 transition-colors bg-white min-h-[200px] resize-y"
                  value={textB}
                  onChange={e => setTextB(e.target.value)}
                  placeholder={t('비교할 규제의 원문을 붙여넣으세요...', 'Paste the second regulation text...')}
                />
              </div>
            </div>
          )}
        </div>

        <Btn onClick={handleAnalyze} disabled={loading || text.length < 50}>
          {loading ? (
            <><span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> {t('분석 중...', 'Analyzing...')}</>
          ) : (
            <><Icon name="search" size={16} /> {mode === 'analyze' ? t('AI 분석 실행', 'Run AI Analysis') : mode === 'summarize' ? t('요약 생성', 'Generate Summary') : t('비교 분석', 'Compare')}</>
          )}
        </Btn>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-5 py-4 mb-4 text-[13px] text-red-700">{error}</div>
      )}

      {/* Results */}
      {result && (
        <div className="bg-white border border-[#e8e8e6] rounded-xl p-6 mt-4">
          <div className="flex items-center gap-2 mb-4">
            <Icon name="file" size={18} className="text-green-deep" />
            <span className="text-[15px] font-semibold">{t('분석 결과', 'Analysis Result')}</span>
            <Badge color="green">{result.type}</Badge>
          </div>

          {/* Analysis result */}
          {result.type === 'analysis' && result.result && (
            <div>
              {/* Impact score */}
              <div className="flex items-center gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
                <div className="text-center">
                  <div className="text-[11px] text-gray-400 mb-1">{t('영향도', 'Impact')}</div>
                  <div className={`text-[32px] font-bold ${(result.result as AnalysisResult).impactScore >= 8 ? 'text-red-500' : (result.result as AnalysisResult).impactScore >= 5 ? 'text-amber-500' : 'text-green-600'}`}>
                    {(result.result as AnalysisResult).impactScore}/10
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex gap-1.5 flex-wrap mb-2">
                    {(result.result as AnalysisResult).tags?.map((tag: string) => <span key={tag} className="text-[11px] bg-green-50 text-green-700 px-2 py-0.5 rounded">{tag}</span>)}
                  </div>
                  <div className="text-[12px] text-gray-400">
                    {t('연구영역', 'Research Area')}: {(result.result as AnalysisResult).researchArea}
                  </div>
                </div>
              </div>

              {/* Bilingual summary */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
                <div>
                  <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">한국어 요약</div>
                  <div className="bg-green-50 border-l-4 border-green-deep/30 rounded-r-lg p-4 text-[14px] text-gray-700 leading-relaxed">
                    {(result.result as AnalysisResult).summary}
                  </div>
                </div>
                <div>
                  <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">English summary</div>
                  <div className="bg-blue-50 border-l-4 border-blue-400/30 rounded-r-lg p-4 text-[14px] text-gray-700 leading-relaxed">
                    {(result.result as AnalysisResult).summaryEn}
                  </div>
                </div>
              </div>

              {/* Key points */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div>
                  <div className="text-[12px] font-semibold text-gray-400 mb-2">{t('핵심 논점 (KO)', 'Key Points (KO)')}</div>
                  {(result.result as AnalysisResult).keyPoints?.map((p: string, i: number) => (
                    <div key={i} className="text-[13px] text-gray-600 py-2 border-b border-gray-100 pl-4 relative">
                      <span className="absolute left-0 top-[12px] w-[5px] h-[5px] bg-green-deep rounded-full opacity-40" />{p}
                    </div>
                  ))}
                </div>
                <div>
                  <div className="text-[12px] font-semibold text-gray-400 mb-2">{t('핵심 논점 (EN)', 'Key Points (EN)')}</div>
                  {(result.result as AnalysisResult).keyPointsEn?.map((p: string, i: number) => (
                    <div key={i} className="text-[13px] text-gray-600 py-2 border-b border-gray-100 pl-4 relative">
                      <span className="absolute left-0 top-[12px] w-[5px] h-[5px] bg-blue-500 rounded-full opacity-40" />{p}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Summary result */}
          {result.type === 'summary' && result.result && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div>
                <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">한국어</div>
                <div className="bg-green-50 border-l-4 border-green-deep/30 rounded-r-lg p-4 text-[14px] text-gray-700 leading-relaxed">
                  {result.result.ko}
                </div>
              </div>
              <div>
                <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">English</div>
                <div className="bg-blue-50 border-l-4 border-blue-400/30 rounded-r-lg p-4 text-[14px] text-gray-700 leading-relaxed">
                  {result.result.en}
                </div>
              </div>
            </div>
          )}

          {/* Comparison result */}
          {result.type === 'comparison' && result.result && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div>
                <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">한국어 비교</div>
                <div className="text-[14px] text-gray-700 leading-relaxed whitespace-pre-wrap bg-gray-50 rounded-lg p-4">
                  {result.result.ko}
                </div>
              </div>
              <div>
                <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">English comparison</div>
                <div className="text-[14px] text-gray-700 leading-relaxed whitespace-pre-wrap bg-gray-50 rounded-lg p-4">
                  {result.result.en}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Example prompts */}
      {!result && !loading && (
        <div className="mt-6">
          <div className="text-[13px] font-semibold text-gray-400 mb-3">{t('예시: 이런 텍스트를 붙여넣어 보세요', 'Example: Try pasting text like this')}</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              { ko: '금융위원회 보도자료 (규제 변경 발표)', en: 'FSC press release (regulatory change)' },
              { ko: 'SEC 규칙 제안서 (토큰 분류)', en: 'SEC proposed rule (token classification)' },
              { ko: 'EU MiCA 기술 표준 문서', en: 'EU MiCA technical standards document' },
              { ko: '국회 법안 원문 (가상자산업권법)', en: 'National Assembly bill text' },
            ].map((ex, i) => (
              <div key={i} className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-[13px] text-gray-500">
                {t(ex.ko, ex.en)}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
