// src/app/(public)/dashboard/DashboardClient.tsx
'use client';

import { useState, useMemo } from 'react';
import { useLang } from '@/lib/i18n';
import { Icon, Badge } from '@/components/ui';

const JURISDICTIONS: Record<string, { flag: string; name: string; nameEn: string }> = {
  KR: { flag: '🇰🇷', name: '한국', nameEn: 'South Korea' },
  US: { flag: '🇺🇸', name: '미국', nameEn: 'United States' },
  EU: { flag: '🇪🇺', name: 'EU', nameEn: 'European Union' },
  SG: { flag: '🇸🇬', name: '싱가포르', nameEn: 'Singapore' },
  JP: { flag: '🇯🇵', name: '일본', nameEn: 'Japan' },
  UK: { flag: '🇬🇧', name: '영국', nameEn: 'United Kingdom' },
  HK: { flag: '🇭🇰', name: '홍콩', nameEn: 'Hong Kong' },
  INTL: { flag: '🌐', name: '국제기구', nameEn: 'International' },
};

const STATUS_LABELS: Record<string, { ko: string; en: string; color: string }> = {
  PROPOSED: { ko: '발의', en: 'Proposed', color: 'blue' },
  COMMITTEE: { ko: '위원회', en: 'Committee', color: 'amber' },
  FLOOR_VOTE: { ko: '본회의', en: 'Floor Vote', color: 'amber' },
  PASSED: { ko: '통과', en: 'Passed', color: 'green' },
  ENACTED: { ko: '시행', en: 'Enacted', color: 'green' },
  REJECTED: { ko: '부결', en: 'Rejected', color: 'red' },
  WITHDRAWN: { ko: '철회', en: 'Withdrawn', color: 'gray' },
};

const STATUS_ORDER = ['PROPOSED', 'COMMITTEE', 'FLOOR_VOTE', 'PASSED', 'ENACTED'];

interface PIIData {
  score: number;
  change: number;
  trend: 'up' | 'down' | 'flat';
  breakdown: Record<string, { count: number; score: number }>;
  topEvents: string[];
  generatedAt: string;
}

interface WeeklySummaryData {
  summary: string;
  summaryEn: string;
  highlights: { ko: string; en: string }[];
}

interface Props {
  regulations: any[];
  trends: any[];
  briefings: any[];
  stats: { total: number; enacted: number; recentlyUpdated: number };
  archiveData: {
    totalLaws: number;
    totalArticles: number;
    articlesByJurisdiction: Record<string, number>;
    regulationsByJurisdiction: Record<string, number>;
  };
  pii: PIIData | null;
  weeklySummary: WeeklySummaryData | null;
  themeBreakdown?: Record<string, number>;
}

const FOCUS_AREAS: { key: string; ko: string; en: string }[] = [
  { key: 'AI_GOVERNANCE', ko: 'AI 거버넌스·규제', en: 'AI Governance' },
  { key: 'DPI', ko: '디지털 공공인프라', en: 'Digital Public Infra' },
  { key: 'DIGITAL_IDENTITY', ko: '디지털 신원·신뢰', en: 'Digital Identity' },
  { key: 'DATA_GOVERNANCE', ko: '데이터 거버넌스', en: 'Data Governance' },
  { key: 'DIGITAL_ASSETS', ko: '디지털 자산', en: 'Digital Assets' },
];

export default function DashboardClient({ regulations, trends, briefings, stats, archiveData, pii, weeklySummary, themeBreakdown = {} }: Props) {
  const { lang, t, bi } = useLang();
  const [jFilter, setJFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
  const [selTrend, setSelTrend] = useState<any>(null);
  const [selReg, setSelReg] = useState<any>(null);
  const [selBriefing, setSelBriefing] = useState<any>(null);
  const [search, setSearch] = useState('');
  const [nlEmail, setNlEmail] = useState('');
  const [nlStatus, setNlStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
  const [feedbackPosition, setFeedbackPosition] = useState('');
  const [feedbackComment, setFeedbackComment] = useState('');
  const [feedbackEmail, setFeedbackEmail] = useState('');
  const [feedbackSubmitting, setFeedbackSubmitting] = useState(false);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState<string | null>(null);

  const submitFeedback = async () => {
    if (!feedbackPosition || !selReg) return;
    setFeedbackSubmitting(true);
    try {
      await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          regulationId: selReg.id,
          position: feedbackPosition,
          comment: feedbackComment || undefined,
          email: feedbackEmail || undefined,
        }),
      });
      setFeedbackSubmitted(selReg.id);
      setFeedbackPosition('');
      setFeedbackComment('');
      setFeedbackEmail('');
    } catch { /* ignore */ }
    setFeedbackSubmitting(false);
  };

  const handleNewsletter = async () => {
    if (!nlEmail || !nlEmail.includes('@')) return;
    setNlStatus('loading');
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: nlEmail }),
      });
      setNlStatus(res.ok ? 'done' : 'error');
    } catch { setNlStatus('error'); }
  };

  // Filtering: jurisdiction + search
  const filtered = useMemo(() => {
    return regulations.filter((r: any) => {
      if (jFilter !== 'all' && r.jurisdiction !== jFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        const text = `${r.title || ''} ${r.titleEn || ''} ${(r.tags || []).join(' ')}`.toLowerCase();
        if (!text.includes(q)) return false;
      }
      return true;
    });
  }, [regulations, jFilter, search]);

  const kanbanCols = STATUS_ORDER.map(s => ({ status: s, label: STATUS_LABELS[s], items: filtered.filter((r: any) => r.status === s) }));
  const spikes = trends.filter((tr: any) => tr.score >= 80);

  // Monthly trend data — group by proposedDate or createdAt
  const monthlyData = useMemo(() => {
    const months: Record<string, number> = {};
    const now = new Date();
    // Last 12 months
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      months[key] = 0;
    }
    regulations.forEach((r: any) => {
      const d = r.proposedDate || r.createdAt;
      if (!d) return;
      const date = new Date(d);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      if (key in months) months[key]++;
    });
    return Object.entries(months).map(([month, count]) => ({ month, count }));
  }, [regulations]);

  const maxMonth = Math.max(...monthlyData.map(m => m.count), 1);

  const countryDots = useMemo(() => [
    { code: 'US', flag: '\u{1F1FA}\u{1F1F8}', name: '\uBBF8\uAD6D', nameEn: 'United States', x: '18%', y: '35%', activity: (archiveData.regulationsByJurisdiction['US'] || 0) + (archiveData.articlesByJurisdiction['US'] || 0) / 10 },
    { code: 'EU', flag: '\u{1F1EA}\u{1F1FA}', name: 'EU', nameEn: 'EU', x: '45%', y: '25%', activity: (archiveData.regulationsByJurisdiction['EU'] || 0) + (archiveData.articlesByJurisdiction['EU'] || 0) / 10 },
    { code: 'KR', flag: '\u{1F1F0}\u{1F1F7}', name: '\uD55C\uAD6D', nameEn: 'Korea', x: '78%', y: '35%', activity: (archiveData.regulationsByJurisdiction['KR'] || 0) + (archiveData.articlesByJurisdiction['KR'] || 0) / 10 },
    { code: 'JP', flag: '\u{1F1EF}\u{1F1F5}', name: '\uC77C\uBCF8', nameEn: 'Japan', x: '83%', y: '38%', activity: (archiveData.regulationsByJurisdiction['JP'] || 0) + (archiveData.articlesByJurisdiction['JP'] || 0) / 10 },
    { code: 'SG', flag: '\u{1F1F8}\u{1F1EC}', name: '\uC2F1\uAC00\uD3EC\uB974', nameEn: 'Singapore', x: '72%', y: '62%', activity: (archiveData.regulationsByJurisdiction['SG'] || 0) + (archiveData.articlesByJurisdiction['SG'] || 0) / 10 },
    { code: 'HK', flag: '\u{1F1ED}\u{1F1F0}', name: '\uD64D\uCF69', nameEn: 'Hong Kong', x: '76%', y: '48%', activity: (archiveData.regulationsByJurisdiction['HK'] || 0) + (archiveData.articlesByJurisdiction['HK'] || 0) / 10 },
  ], [archiveData, lang]);

  const topBills = useMemo(() => {
    return regulations
      .filter((r: any) => r.status !== 'WITHDRAWN' && r.status !== 'REJECTED')
      .sort((a: any, b: any) => {
        const statusWeight: Record<string, number> = { ENACTED: 5, PASSED: 4, FLOOR_VOTE: 3, COMMITTEE: 2, PROPOSED: 1 };
        const aW = (statusWeight[a.status] || 0) + (a.impactScore || 0) / 10;
        const bW = (statusWeight[b.status] || 0) + (b.impactScore || 0) / 10;
        return bW - aW;
      })
      .slice(0, 8);
  }, [regulations]);

  // ─── Sub-components ───
  const ImpactBar = ({ score }: { score: number }) => (
    <div className="flex items-center gap-1">
      <div className="flex gap-0.5">{Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className={`w-1.5 h-4 rounded-sm ${i < Math.ceil(score / 2) ? (score >= 8 ? 'bg-red-400' : score >= 5 ? 'bg-amber-400' : 'bg-green-400') : 'bg-gray-200'}`} />
      ))}</div>
      <span className="text-[11px] text-gray-400 ml-1">{score}/10</span>
    </div>
  );

  const Modal = ({ onClose, children, wide }: { onClose: () => void; children: React.ReactNode; wide?: boolean }) => (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 sm:p-6" onClick={onClose}>
      <div className={`bg-white rounded-2xl w-full max-h-[85vh] overflow-y-auto p-6 sm:p-8 ${wide ? 'max-w-[700px]' : 'max-w-[520px]'}`} onClick={e => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );

  return (
    <div className="pt-28 pb-20 max-w-[1280px] mx-auto px-6">

      {/* ═══ HERO: PII INDEX ═══ */}
      <div className="bg-gradient-to-br from-green-deep via-green-deep/90 to-green-deep/80 text-white rounded-2xl p-8 md:p-10 mb-6">
        <div className="flex items-start justify-between flex-wrap gap-6">
          <div className="max-w-2xl">
            <div className="text-[11px] font-bold tracking-widest uppercase text-white/70 mb-3">{t('iDAPI 정책 인텔리전스', 'iDAPI Policy Intelligence')}</div>
            <h1 className="text-3xl md:text-[40px] font-bold tracking-tight leading-tight mb-3">
              {t('글로벌 디지털·AI 공공 인프라 정책 레이더', 'Global Digital & AI Public Infrastructure Policy Radar')}
            </h1>
            <p className="text-white/70 text-[14px] leading-relaxed">
              {t(
                `${archiveData.totalArticles.toLocaleString()}개 조문 · ${archiveData.totalLaws}개 법률 · ${stats.total}개 법안 — 6개 관할권 실시간 추적`,
                `${archiveData.totalArticles.toLocaleString()} articles · ${archiveData.totalLaws} laws · ${stats.total} bills — 6 jurisdictions tracked`
              )}
            </p>
          </div>

          {/* PII Score */}
          {pii && (
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 text-center min-w-[200px]">
              <div className="text-[10px] uppercase tracking-widest text-white/60 mb-2">{t('정책활동지수', 'Policy Activity Index')}</div>
              <div className="text-5xl font-bold mb-1">{pii.score}</div>
              <div className={`text-[14px] font-semibold ${pii.trend === 'up' ? 'text-green-300' : pii.trend === 'down' ? 'text-red-300' : 'text-white/60'}`}>
                {pii.trend === 'up' ? '▲' : pii.trend === 'down' ? '▼' : '—'} {pii.change > 0 ? '+' : ''}{pii.change} {t('전주 대비', 'vs last week')}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ═══ WEEKLY SUMMARY + NEWSLETTER ═══ */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 mb-8">
        {/* Weekly 3-line summary */}
        <div className="lg:col-span-3 bg-white border border-[#e8e8e6] rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
            <h3 className="text-[14px] font-bold">{t('이번 주 핵심 동향', "This Week's Highlights")}</h3>
          </div>
          {weeklySummary && weeklySummary.highlights.length > 0 ? (
            <div className="space-y-2.5">
              {weeklySummary.highlights.map((h, i) => (
                <div key={i} className="flex items-start gap-3 text-[14px] leading-relaxed text-gray-700">
                  <span className="text-[12px] bg-green-50 text-green-700 rounded-full w-5 h-5 flex items-center justify-center font-bold shrink-0 mt-0.5">{i + 1}</span>
                  <span>{lang === 'en' ? h.en : h.ko}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[13px] text-gray-400">{t('이번 주 데이터를 집계 중입니다.', 'Aggregating this week\'s data.')}</p>
          )}
        </div>

        {/* Newsletter CTA */}
        <div className="lg:col-span-2 bg-gradient-to-br from-green-50 to-white border border-green-deep/20 rounded-xl p-6">
          <div className="text-[11px] font-bold tracking-widest uppercase text-green-deep mb-2">{t('주간 뉴스레터', 'Weekly Newsletter')}</div>
          <h3 className="text-[16px] font-bold mb-2">{t('매주 정책 동향을 받아보세요', 'Get weekly policy updates')}</h3>
          <p className="text-[12px] text-gray-500 mb-4 leading-relaxed">{t('매주 월요일, 디지털·AI 공공 인프라 정책 핵심 요약을 이메일로 전달합니다.', 'Every Monday — digital & AI public infrastructure policy digest delivered to your inbox.')}</p>
          {nlStatus === 'done' ? (
            <div className="text-[14px] text-green-700 font-semibold flex items-center gap-2">✓ {t('구독 완료!', 'Subscribed!')}</div>
          ) : (
            <div className="flex gap-2">
              <input
                type="email"
                value={nlEmail}
                onChange={e => setNlEmail(e.target.value)}
                placeholder={t('이메일 주소', 'Email address')}
                className="flex-1 px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-green-deep/40"
                onKeyDown={e => e.key === 'Enter' && handleNewsletter()}
              />
              <button onClick={handleNewsletter} disabled={nlStatus === 'loading'}
                className="px-4 py-2.5 bg-green-deep text-white rounded-lg text-[13px] font-bold hover:bg-green-deep/90 disabled:opacity-50 transition whitespace-nowrap">
                {nlStatus === 'loading' ? '...' : t('구독', 'Subscribe')}
              </button>
            </div>
          )}
          {nlStatus === 'error' && <p className="text-[12px] text-red-500 mt-2">{t('구독 실패. 다시 시도해주세요.', 'Failed. Please try again.')}</p>}
        </div>
      </div>

      {/* ═══ SPIKE ALERT ═══ */}
      {spikes.length > 0 && (
        <div className="mb-6 bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
            </span>
            <span className="text-[13px] font-semibold text-red-700">{t('급상승 이슈', 'Trending Now')}</span>
            <span className="text-[11px] text-red-500">{spikes.length} {t('개', 'topics')}</span>
          </div>
          <div className="flex gap-2 flex-wrap">
            {spikes.map((tr: any) => (
              <button key={tr.id} onClick={() => setSelTrend(tr)}
                className="px-3 py-1.5 bg-white/80 text-red-700 border border-red-200 rounded-full text-[13px] font-medium hover:bg-white transition-colors cursor-pointer shadow-sm">
                🔥 {bi(tr.keyword, tr.keywordEn)} <span className="opacity-60">({Math.round(tr.score)})</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ═══ ROW: MONTHLY CHART + JURISDICTION COMPARISON ═══ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">

        {/* Monthly Trend Chart */}
        <div className="lg:col-span-2 bg-white border border-[#e8e8e6] rounded-2xl p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-[15px] font-bold">{t('월별 입법 동향 (12개월)', 'Monthly Legislation Activity (12mo)')}</h3>
              <p className="text-[12px] text-gray-400 mt-0.5">{t('새로 발의·등록된 법안 수', 'Bills proposed/registered per month')}</p>
            </div>
            <div className="text-right">
              <div className="text-[11px] text-gray-400 uppercase tracking-wider">{t('최고치', 'Peak')}</div>
              <div className="text-[18px] font-bold text-green-deep">{maxMonth}</div>
            </div>
          </div>
          <div className="flex items-end gap-1.5 h-32">
            {monthlyData.map((m, i) => {
              const h = (m.count / maxMonth) * 100;
              return (
                <div key={m.month} className="flex-1 flex flex-col items-center gap-1 group">
                  <div className="text-[10px] text-gray-400 group-hover:text-green-deep group-hover:font-bold transition-colors min-h-[14px]">{m.count > 0 ? m.count : ''}</div>
                  <div className="w-full bg-gray-100 rounded-t-sm relative" style={{ height: '100px' }}>
                    <div
                      className={`absolute bottom-0 left-0 right-0 rounded-t-sm transition-all ${i === monthlyData.length - 1 ? 'bg-green-deep' : 'bg-green-deep/40 group-hover:bg-green-deep/70'}`}
                      style={{ height: `${h}%` }}
                    />
                  </div>
                  <div className="text-[9px] text-gray-400">{m.month.slice(5)}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Jurisdiction Comparison */}
        <div className="bg-white border border-[#e8e8e6] rounded-2xl p-6">
          <h3 className="text-[15px] font-bold mb-1">{t('관할권별 활동량', 'Activity by Jurisdiction')}</h3>
          <p className="text-[12px] text-gray-400 mb-4">{t('법률 + 진행 중 법안 합계', 'Laws + active bills')}</p>
          <div className="space-y-3">
            {Object.entries(JURISDICTIONS).map(([code, j]) => {
              const articles = archiveData.articlesByJurisdiction[code] || 0;
              const regs = archiveData.regulationsByJurisdiction[code] || 0;
              const total = articles + regs * 5; // weight regs higher
              if (articles === 0 && regs === 0) return null;
              const max = Math.max(...Object.entries(JURISDICTIONS).map(([c]) => (archiveData.articlesByJurisdiction[c] || 0) + (archiveData.regulationsByJurisdiction[c] || 0) * 5));
              const pct = (total / max) * 100;
              return (
                <button
                  key={code}
                  onClick={() => setJFilter(code === jFilter ? 'all' : code)}
                  className={`w-full flex items-center gap-3 group cursor-pointer ${jFilter === code ? 'opacity-100' : 'opacity-90 hover:opacity-100'}`}
                >
                  <span className="text-[18px] w-6">{j.flag}</span>
                  <div className="flex-1 text-left">
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-[12px] font-semibold ${jFilter === code ? 'text-green-deep' : 'text-gray-600'}`}>
                        {lang === 'en' ? j.nameEn : j.name}
                      </span>
                      <span className="text-[11px] text-gray-400">
                        {articles > 0 && `${articles} ${t('법률', 'laws')}`}
                        {articles > 0 && regs > 0 && ' · '}
                        {regs > 0 && `${regs} ${t('법안', 'bills')}`}
                      </span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full transition-all ${jFilter === code ? 'bg-green-deep' : 'bg-green-deep/50 group-hover:bg-green-deep/80'}`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Focus Area Breakdown (derived from title/tags — 5 themes) */}
        <div className="bg-white border border-[#e8e8e6] rounded-2xl p-6">
          <h3 className="text-[15px] font-bold mb-1">{t('연구영역별 분포', 'By Focus Area')}</h3>
          <p className="text-[12px] text-gray-400 mb-4">{t('추적 중인 법안·규제의 테마 분류', 'Themes across tracked bills & regulations')}</p>
          <div className="space-y-3">
            {(() => {
              const max = Math.max(1, ...FOCUS_AREAS.map(a => themeBreakdown[a.key] || 0));
              return FOCUS_AREAS.map(a => {
                const count = themeBreakdown[a.key] || 0;
                const pct = (count / max) * 100;
                return (
                  <div key={a.key} className="flex items-center gap-3">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[12px] font-semibold text-gray-600">{lang === 'en' ? a.en : a.ko}</span>
                        <span className="text-[11px] text-gray-400">{count}{t('건', '')}</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full rounded-full bg-green-deep/60 transition-all" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  </div>
                );
              });
            })()}
          </div>
        </div>
      </div>

      {/* ═══ WORLD MAP ═══ */}
      <div className="bg-white border border-[#e8e8e6] rounded-2xl p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[15px] font-bold">{t('\uAE00\uB85C\uBC8C \uADDC\uC81C \uD65C\uB3D9 \uC9C0\uB3C4', 'Global Regulatory Activity Map')}</h3>
          <p className="text-[11px] text-gray-400">{t('\uAD6D\uAC00\uB97C \uD074\uB9AD\uD558\uC5EC \uD544\uD130\uB9C1', 'Click a country to filter')}</p>
        </div>
        <div className="relative bg-green-50/30 rounded-xl p-8 overflow-hidden" style={{ minHeight: '280px' }}>
          {countryDots.map(dot => (
            <button key={dot.code} onClick={() => setJFilter(dot.code === jFilter ? 'all' : dot.code)}
              className="absolute flex flex-col items-center gap-1 group transition-transform hover:scale-110"
              style={{ left: dot.x, top: dot.y }}>
              <div className={`rounded-full transition-all ${jFilter === dot.code ? 'ring-4 ring-green-deep/30' : ''}`}
                style={{
                  width: Math.max(24, Math.min(60, dot.activity / 2)),
                  height: Math.max(24, Math.min(60, dot.activity / 2)),
                  background: `rgba(32, 62, 51, ${Math.max(0.3, Math.min(0.9, dot.activity / 120))})`,
                }}>
                <span className="text-white text-[10px] font-bold flex items-center justify-center h-full">{dot.activity}</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-[14px]">{dot.flag}</span>
                <span className="text-[11px] font-semibold text-gray-600 group-hover:text-green-deep">{lang === 'en' ? dot.nameEn : dot.name}</span>
              </div>
            </button>
          ))}
          {/* Decorative grid lines */}
          <div className="absolute inset-0 pointer-events-none opacity-10">
            <div className="absolute top-1/4 left-0 right-0 h-px bg-green-deep" />
            <div className="absolute top-1/2 left-0 right-0 h-px bg-green-deep" />
            <div className="absolute top-3/4 left-0 right-0 h-px bg-green-deep" />
            <div className="absolute left-1/4 top-0 bottom-0 w-px bg-green-deep" />
            <div className="absolute left-1/2 top-0 bottom-0 w-px bg-green-deep" />
            <div className="absolute left-3/4 top-0 bottom-0 w-px bg-green-deep" />
          </div>
        </div>
      </div>

      {/* ═══ BILL TIMELINE ═══ */}
      <div className="bg-white border border-[#e8e8e6] rounded-2xl p-6 mb-8">
        <h3 className="text-[15px] font-bold mb-1">{t('\uC8FC\uC694 \uBC95\uC548 \uC9C4\uD589 \uD604\uD669', 'Key Bill Progress Timeline')}</h3>
        <p className="text-[12px] text-gray-400 mb-5">{t('\uBC1C\uC758 \u2192 \uC704\uC6D0\uD68C \u2192 \uBCF8\uD68C\uC758 \u2192 \uC2DC\uD589', 'Proposed \u2192 Committee \u2192 Floor Vote \u2192 Enacted')}</p>
        <div className="space-y-3">
          {topBills.map((bill: any) => {
            const stages = ['PROPOSED', 'COMMITTEE', 'FLOOR_VOTE', 'PASSED', 'ENACTED'];
            const currentIdx = stages.indexOf(bill.status);
            const progress = ((currentIdx + 1) / stages.length) * 100;
            return (
              <div key={bill.id} className="flex items-center gap-3 group cursor-pointer" onClick={() => setSelReg(bill)}>
                <div className="w-6 text-center text-[14px]">{JURISDICTIONS[bill.jurisdiction]?.flag}</div>
                <div className="flex-1 min-w-0">
                  <div className="text-[12px] font-semibold text-gray-700 truncate mb-1 group-hover:text-green-deep">{bi(bill.title, bill.titleEn)}</div>
                  <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all ${
                      bill.status === 'ENACTED' ? 'bg-green-500' :
                      bill.status === 'PASSED' ? 'bg-green-400' :
                      bill.status === 'FLOOR_VOTE' ? 'bg-amber-400' :
                      bill.status === 'COMMITTEE' ? 'bg-blue-400' : 'bg-gray-300'
                    }`} style={{ width: `${progress}%` }} />
                  </div>
                </div>
                <Badge color={STATUS_LABELS[bill.status]?.color || 'gray'}>
                  {lang === 'en' ? STATUS_LABELS[bill.status]?.en : STATUS_LABELS[bill.status]?.ko}
                </Badge>
              </div>
            );
          })}
        </div>
      </div>

      {/* ═══ SEARCH + FILTER + VIEW MODE ═══ */}
      <div className="bg-white border border-[#e8e8e6] rounded-xl p-4 mb-6">
        <div className="flex items-center gap-3 flex-wrap">
          {/* Search */}
          <div className="relative flex-1 min-w-[240px]">
            <Icon name="search" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={t('법안명, 키워드로 검색...', 'Search by bill name, keyword...')}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-green-deep/40"
            />
          </div>
          {/* View toggle */}
          <div className="flex border border-gray-200 rounded-lg overflow-hidden">
            {(['kanban', 'list'] as const).map(m => (
              <button key={m} onClick={() => setViewMode(m)}
                className={`px-3 py-2 text-[12px] font-semibold transition-all ${viewMode === m ? 'bg-green-deep text-white' : 'bg-white text-gray-500 hover:bg-gray-50'}`}>
                {m === 'kanban' ? t('칸반', 'Kanban') : t('리스트', 'List')}
              </button>
            ))}
          </div>
        </div>

        {/* Jurisdiction chips */}
        <div className="flex gap-2 mt-3 flex-wrap">
          {[{ code: 'all', flag: '', name: '전체', nameEn: 'All' }, ...Object.entries(JURISDICTIONS).map(([code, j]) => ({ code, ...j }))].map(j => {
            const count = j.code === 'all' ? regulations.length : regulations.filter((r: any) => r.jurisdiction === j.code).length;
            if (j.code !== 'all' && count === 0) return null;
            return (
              <button key={j.code} onClick={() => setJFilter(j.code)}
                className={`px-3 py-1 rounded-full text-[12px] font-medium border transition-all cursor-pointer ${jFilter === j.code ? 'bg-green-deep text-white border-green-deep' : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'}`}>
                {j.flag ? `${j.flag} ` : ''}{lang === 'en' ? j.nameEn : j.name} <span className="opacity-60">({count})</span>
              </button>
            );
          })}
        </div>

        {/* Active filter info */}
        {(search || jFilter !== 'all') && (
          <div className="flex items-center gap-2 mt-3 text-[12px] text-gray-500">
            <span>{filtered.length} {t('건의 결과', 'results')}</span>
            <button onClick={() => { setSearch(''); setJFilter('all'); }} className="text-green-deep hover:underline">{t('필터 초기화', 'Clear filters')}</button>
          </div>
        )}
      </div>

      {/* ═══ KANBAN ═══ */}
      {viewMode === 'kanban' && (
        <div className="flex gap-4 overflow-x-auto pb-4 mb-10">
          {kanbanCols.map(col => (
            <div key={col.status} className="min-w-[240px] flex-1">
              <div className="flex items-center gap-2 mb-3 px-1">
                <Badge color={col.label.color}>{lang === 'en' ? col.label.en : col.label.ko}</Badge>
                <span className="text-[12px] text-gray-400">{col.items.length}</span>
              </div>
              <div className="space-y-2">
                {col.items.slice(0, 10).map((r: any) => (
                  <div key={r.id} onClick={() => setSelReg(r)} className="bg-white border border-[#e8e8e6] rounded-lg p-3.5 hover:border-green-deep/30 hover:shadow-sm transition-all cursor-pointer">
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <span className="text-[13px]">{JURISDICTIONS[r.jurisdiction]?.flag}</span>
                      <span className="text-[11px] text-gray-400 font-medium">{lang === 'en' ? JURISDICTIONS[r.jurisdiction]?.nameEn : JURISDICTIONS[r.jurisdiction]?.name}</span>
                    </div>
                    <div className="text-[13px] font-semibold leading-snug mb-2 line-clamp-2">{bi(r.title, r.titleEn)}</div>
                    {r.impactScore && <ImpactBar score={r.impactScore} />}
                  </div>
                ))}
                {col.items.length > 10 && (
                  <div className="text-[11px] text-gray-400 text-center py-2">+{col.items.length - 10} {t('더 보기', 'more')}</div>
                )}
                {col.items.length === 0 && <div className="py-8 text-center text-gray-300 text-[12px] border border-dashed border-gray-200 rounded-lg">{t('없음', 'None')}</div>}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ═══ LIST ═══ */}
      {viewMode === 'list' && (
        <div className="bg-white border border-[#e8e8e6] rounded-xl overflow-hidden mb-10">
          {filtered.slice(0, 50).map((r: any, i: number) => (
            <div key={r.id} onClick={() => setSelReg(r)} className={`flex items-center gap-4 px-5 py-4 hover:bg-green-50/50 transition-colors cursor-pointer ${i < filtered.length - 1 ? 'border-b border-gray-100' : ''}`}>
              <span className="text-[16px]">{JURISDICTIONS[r.jurisdiction]?.flag}</span>
              <Badge color={STATUS_LABELS[r.status]?.color || 'gray'}>{lang === 'en' ? STATUS_LABELS[r.status]?.en : STATUS_LABELS[r.status]?.ko}</Badge>
              <div className="flex-1 min-w-0">
                <div className="text-[14px] font-semibold truncate">{bi(r.title, r.titleEn)}</div>
                {r.aiSummary && <div className="text-[12px] text-gray-400 truncate mt-0.5">{r.aiSummary}</div>}
              </div>
              {r.impactScore && <div className={`text-[12px] font-bold px-2 py-0.5 rounded ${r.impactScore >= 8 ? 'bg-red-50 text-red-600' : r.impactScore >= 5 ? 'bg-amber-50 text-amber-600' : 'bg-green-50 text-green-600'}`}>{r.impactScore}/10</div>}
              <div className="text-[12px] text-gray-400 whitespace-nowrap hidden md:block">{r.updatedAt?.slice(0, 10)}</div>
            </div>
          ))}
          {filtered.length > 50 && <div className="px-5 py-3 text-center text-[12px] text-gray-400">+{filtered.length - 50} {t('건 더 있음', 'more results')}</div>}
          {filtered.length === 0 && <div className="py-12 text-center text-gray-400">{t('결과가 없습니다.', 'No results.')}</div>}
        </div>
      )}

      {/* ═══ TRENDS + BRIEFINGS ═══ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Trends Cloud */}
        <div>
          <h2 className="text-[16px] font-bold mb-4 flex items-center gap-2">
            <Icon name="search" size={16} className="text-green-deep" />
            {t('정책 트렌드', 'Policy Trends')}
            {trends.length > 0 && <span className="text-[12px] text-gray-400 font-normal">({trends.length})</span>}
          </h2>
          {trends.length > 0 ? (
            <div className="bg-white border border-[#e8e8e6] rounded-xl p-5">
              <div className="flex flex-wrap gap-2">
                {trends.map((tr: any) => (
                  <button key={tr.id} onClick={() => setSelTrend(tr)} className="px-3 py-1.5 rounded-full transition-all cursor-pointer hover:shadow-sm"
                    style={{ background: `rgba(32,62,51,${Math.max(0.06, tr.score / 200)})`, color: tr.score > 60 ? '#203E33' : '#666', fontSize: `${Math.max(12, Math.min(18, 12 + tr.score / 15))}px`, fontWeight: tr.score > 70 ? 600 : 400 }}>
                    {bi(tr.keyword, tr.keywordEn)}{tr.score >= 80 && <span className="ml-1 text-red-500 text-[10px]">●</span>}
                  </button>
                ))}
              </div>
              <div className="mt-4 pt-3 border-t border-gray-100 text-[11px] text-gray-400">{t('키워드를 클릭하면 상세 정보를 볼 수 있습니다', 'Click a keyword for details')}</div>
            </div>
          ) : <div className="bg-white border border-dashed border-gray-200 rounded-xl p-8 text-center text-gray-400 text-[13px]">{t('트렌드 데이터가 준비 중입니다.', 'Trend data is being prepared.')}</div>}
        </div>

        {/* Briefings */}
        <div>
          <h2 className="text-[16px] font-bold mb-4 flex items-center gap-2">
            <Icon name="file" size={16} className="text-green-deep" />
            {t('AI 정책 브리핑', 'AI Policy Briefings')}
          </h2>
          {briefings.length > 0 ? (
            <div className="space-y-3">
              {briefings.map((b: any) => (
                <div key={b.id} onClick={() => setSelBriefing(b)} className="bg-white border border-[#e8e8e6] rounded-xl p-5 hover:border-green-deep/30 transition-all cursor-pointer">
                  <div className="flex items-center gap-2 mb-2"><Badge color="blue">{b.type === 'daily' ? t('일간', 'Daily') : t('주간', 'Weekly')}</Badge><span className="text-[12px] text-gray-400">{b.generatedAt?.slice(0, 10)}</span></div>
                  <h3 className="text-[15px] font-semibold mb-1">{bi(b.title, b.titleEn)}</h3>
                  <p className="text-[13px] text-gray-500 line-clamp-3 leading-relaxed">{bi(b.content, b.contentEn)?.slice(0, 200)}...</p>
                </div>
              ))}
            </div>
          ) : <div className="bg-white border border-dashed border-gray-200 rounded-xl p-8 text-center text-gray-400 text-[13px]">{t('아직 생성된 브리핑이 없습니다.', 'No briefings generated yet.')}</div>}
        </div>
      </div>

      {/* ═══ CTA: Try the AI Consulting ═══ */}
      <div className="mt-12 bg-gradient-to-br from-green-pale to-white border border-green-deep/20 rounded-2xl p-8 md:p-10 text-center">
        <div className="text-[11px] font-bold tracking-widest uppercase text-green-deep mb-3">{t('맞춤 컴플라이언스 가이드', 'Personalized Compliance Guide')}</div>
        <h2 className="text-2xl md:text-3xl font-bold mb-3">{t('내 사업에 어떤 영향이 있는지 알아보세요', 'Find out how this affects your business')}</h2>
        <p className="text-gray-500 max-w-xl mx-auto mb-6 leading-relaxed">
          {t(
            '비즈니스 정보를 입력하면 AI가 5,089개 조문을 참조해 맞춤형 컴플라이언스 가이드를 생성합니다.',
            'Enter your business details and AI will generate a personalized compliance guide referencing 5,089 articles.'
          )}
        </p>
        <a href="/consult" className="inline-flex items-center gap-2 px-6 py-3 bg-green-deep text-white rounded-lg text-sm font-bold hover:bg-green-deep/90 transition">
          {t('규제 컨설팅 시작하기', 'Start Regulatory Consulting')} <Icon name="arrow" size={14} />
        </a>
      </div>

      {/* ═══ MODALS ═══ */}

      {selReg && (
        <Modal onClose={() => setSelReg(null)} wide>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="text-[20px]">{JURISDICTIONS[selReg.jurisdiction]?.flag}</span>
              <Badge color={STATUS_LABELS[selReg.status]?.color}>{lang === 'en' ? STATUS_LABELS[selReg.status]?.en : STATUS_LABELS[selReg.status]?.ko}</Badge>
              {selReg.impactScore && <span className={`text-[12px] font-bold px-2 py-0.5 rounded ${selReg.impactScore >= 8 ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'}`}>Impact {selReg.impactScore}/10</span>}
            </div>
            <button onClick={() => setSelReg(null)} className="text-gray-400 hover:text-gray-600"><Icon name="x" size={20} /></button>
          </div>
          <h2 className="text-[20px] font-bold mb-1">{bi(selReg.title, selReg.titleEn)}</h2>
          {selReg.sourceName && <div className="text-[13px] text-gray-400 mb-4">{selReg.sourceName}{selReg.billNumber && ` · ${selReg.billNumber}`}</div>}
          {(selReg.aiSummary || selReg.summary) && (
            <div className="bg-green-50 border-l-4 border-green-deep/30 rounded-r-lg p-4 mb-4">
              <p className="text-[14px] text-gray-600 leading-relaxed">{selReg.aiSummary || bi(selReg.summary, selReg.summaryEn)}</p>
            </div>
          )}
          {selReg.tags?.length > 0 && <div className="flex gap-1.5 flex-wrap mb-4">{selReg.tags.map((tag: string) => <span key={tag} className="text-[11px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded">{tag}</span>)}</div>}
          {selReg.timelineEvents?.length > 0 && (
            <div>
              <div className="text-[12px] font-bold text-gray-400 uppercase tracking-wider mb-3">{t('타임라인', 'Timeline')}</div>
              <div className="space-y-3 pl-4 border-l-2 border-gray-100">
                {selReg.timelineEvents.map((ev: any, i: number) => (
                  <div key={i} className="relative">
                    <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-green-deep border-2 border-white" />
                    <div className="text-[12px] text-gray-400">{ev.eventDate?.slice(0, 10)}</div>
                    <div className="text-[13px] font-medium">{bi(ev.description, ev.descriptionEn)}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {selReg.sourceUrl && <a href={selReg.sourceUrl} target="_blank" rel="noopener" className="inline-flex items-center gap-1 mt-4 text-[13px] text-green-deep font-semibold hover:underline">{t('원문 보기', 'View Source')} <Icon name="arrow" size={14} /></a>}

          {/* ─── Feedback Section ─── */}
          <div className="mt-6 pt-6 border-t border-gray-100">
            <h3 className="text-[14px] font-bold mb-3 flex items-center gap-2">
              <Icon name="users" size={16} className="text-green-deep" />
              {t('이 법안에 대한 의견', 'Your Opinion on This Bill')}
            </h3>

            {feedbackSubmitted === selReg.id ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-[13px] text-green-700 font-semibold">
                ✓ {t('의견이 제출되었습니다. 감사합니다!', 'Thank you for your feedback!')}
              </div>
            ) : (
              <div>
                <div className="flex gap-2 mb-3">
                  {[
                    { value: 'support', ko: '찬성', en: 'Support', color: 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100' },
                    { value: 'conditional', ko: '조건부', en: 'Conditional', color: 'bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100' },
                    { value: 'oppose', ko: '반대', en: 'Oppose', color: 'bg-red-50 border-red-200 text-red-700 hover:bg-red-100' },
                  ].map(opt => (
                    <button key={opt.value} onClick={() => setFeedbackPosition(opt.value)}
                      className={`flex-1 py-2.5 rounded-lg text-[13px] font-semibold border transition-all cursor-pointer ${
                        feedbackPosition === opt.value ? opt.color + ' ring-2 ring-offset-1' : 'bg-white border-gray-200 text-gray-500'
                      } ${feedbackPosition === opt.value ? 'ring-green-deep/30' : ''}`}>
                      {lang === 'en' ? opt.en : opt.ko}
                    </button>
                  ))}
                </div>
                <textarea
                  value={feedbackComment}
                  onChange={e => setFeedbackComment(e.target.value)}
                  placeholder={t('의견을 남겨주세요 (선택사항)', 'Leave your comment (optional)')}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-[13px] resize-none h-20 focus:outline-none focus:border-green-deep/40 mb-3"
                />
                <div className="flex gap-2 items-center">
                  <input
                    type="email"
                    value={feedbackEmail}
                    onChange={e => setFeedbackEmail(e.target.value)}
                    placeholder={t('이메일 (선택)', 'Email (optional)')}
                    className="flex-1 px-3.5 py-2 rounded-lg border border-gray-200 text-[13px] focus:outline-none focus:border-green-deep/40"
                  />
                  <button
                    onClick={submitFeedback}
                    disabled={!feedbackPosition || feedbackSubmitting}
                    className="px-5 py-2 bg-green-deep text-white rounded-lg text-[13px] font-semibold hover:bg-green-deep/90 disabled:opacity-40 transition whitespace-nowrap">
                    {feedbackSubmitting ? '...' : t('제출', 'Submit')}
                  </button>
                </div>
                <p className="text-[11px] text-gray-400 mt-2">{t('제출된 의견은 iDAPI 정책 제언 보고서에 익명으로 반영됩니다.', 'Feedback is anonymously included in iDAPI policy recommendation reports.')}</p>
              </div>
            )}
          </div>
        </Modal>
      )}

      {selTrend && (
        <Modal onClose={() => setSelTrend(null)}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Badge color={selTrend.score >= 80 ? 'red' : selTrend.score >= 60 ? 'amber' : 'green'}>Score {Math.round(selTrend.score)}</Badge>
              {selTrend.spikeDetected && <Badge color="red">🔥 {t('급상승', 'Spike')}</Badge>}
            </div>
            <button onClick={() => setSelTrend(null)} className="text-gray-400 hover:text-gray-600"><Icon name="x" size={20} /></button>
          </div>
          <h2 className="text-[22px] font-bold mb-1">{bi(selTrend.keyword, selTrend.keywordEn)}</h2>
          <div className="text-[12px] text-gray-400 mb-4">{selTrend.mentions} {t('회 언급', 'mentions')} · {selTrend.jurisdictions?.join(', ')}</div>
          {selTrend.aiSummary && (
            <div className="bg-green-50 rounded-lg p-4 mb-4">
              <p className="text-[14px] text-gray-600 leading-relaxed">{bi(selTrend.aiSummary, selTrend.aiSummaryEn)}</p>
            </div>
          )}
          {selTrend.relatedTags?.length > 0 && (
            <div>
              <div className="text-[12px] font-bold text-gray-400 uppercase tracking-wider mb-2">{t('연관 키워드', 'Related Tags')}</div>
              <div className="flex gap-1.5 flex-wrap">{selTrend.relatedTags.map((tag: string) => <span key={tag} className="text-[12px] bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full">{tag}</span>)}</div>
            </div>
          )}
        </Modal>
      )}

      {selBriefing && (
        <Modal onClose={() => setSelBriefing(null)} wide>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Badge color="blue">{selBriefing.type === 'daily' ? t('일간 브리핑', 'Daily Briefing') : t('주간 브리핑', 'Weekly Briefing')}</Badge>
              <span className="text-[12px] text-gray-400">{selBriefing.generatedAt?.slice(0, 10)}</span>
            </div>
            <button onClick={() => setSelBriefing(null)} className="text-gray-400 hover:text-gray-600"><Icon name="x" size={20} /></button>
          </div>
          <h2 className="text-[22px] font-bold mb-4">{bi(selBriefing.title, selBriefing.titleEn)}</h2>
          <div className="prose prose-sm max-w-none">
            <p className="text-[14px] text-gray-700 leading-relaxed whitespace-pre-wrap">{bi(selBriefing.content, selBriefing.contentEn)}</p>
          </div>
        </Modal>
      )}
    </div>
  );
}
