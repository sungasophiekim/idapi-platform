// src/app/(public)/dashboard/DashboardClient.tsx
'use client';

import { useState } from 'react';
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

interface Props {
  regulations: any[];
  trends: any[];
  briefings: any[];
  stats: { total: number; enacted: number; recentlyUpdated: number };
}

export default function DashboardClient({ regulations, trends, briefings, stats }: Props) {
  const { lang, t, bi } = useLang();
  const [jFilter, setJFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
  const [selTrend, setSelTrend] = useState<any>(null);
  const [selReg, setSelReg] = useState<any>(null);
  const [selBriefing, setSelBriefing] = useState<any>(null);

  const filtered = jFilter === 'all' ? regulations : regulations.filter((r: any) => r.jurisdiction === jFilter);
  const kanbanCols = STATUS_ORDER.map(s => ({ status: s, label: STATUS_LABELS[s], items: filtered.filter((r: any) => r.status === s) }));
  const spikes = trends.filter((tr: any) => tr.score >= 80);

  // ─── Shared sub-components ───
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

      {/* Header */}
      <div className="flex items-end justify-between mb-6 flex-wrap gap-4">
        <div>
          <div className="text-[11px] font-bold tracking-widest uppercase text-green-deep mb-2">{t('정책 대시보드', 'Policy Dashboard')}</div>
          <h1 className="text-2xl md:text-[32px] font-bold tracking-tight">{t('글로벌 디지털자산 정책 레이더', 'Global Digital Asset Policy Radar')}</h1>
        </div>
        <div className="flex gap-2">
          {(['kanban', 'list'] as const).map(m => (
            <button key={m} onClick={() => setViewMode(m)}
              className={`px-3 py-1.5 rounded-lg text-[13px] font-medium transition-all ${viewMode === m ? 'bg-green-deep text-white' : 'bg-gray-100 text-gray-500'}`}>
              {m === 'kanban' ? t('칸반', 'Kanban') : t('리스트', 'List')}
            </button>
          ))}
        </div>
      </div>

      {/* Spike Alert */}
      {spikes.length > 0 && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            <span className="text-[13px] font-semibold text-red-700">{t('급상승 이슈', 'Trending Alert')}</span>
          </div>
          <div className="flex gap-2 flex-wrap">
            {spikes.map((tr: any) => (
              <button key={tr.id} onClick={() => setSelTrend(tr)}
                className="px-3 py-1.5 bg-red-100 text-red-700 rounded-full text-[13px] font-medium hover:bg-red-200 transition-colors cursor-pointer">
                {bi(tr.keyword, tr.keywordEn)} ({Math.round(tr.score)})
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: t('추적 중인 법안', 'Tracked'), value: stats.total, color: 'text-green-deep' },
          { label: t('시행 완료', 'Enacted'), value: stats.enacted, color: 'text-blue-600' },
          { label: t('이번 주', 'This Week'), value: stats.recentlyUpdated, color: 'text-amber-600' },
          { label: t('트렌드', 'Trends'), value: trends.length, color: 'text-purple-600' },
        ].map(s => (
          <div key={s.label} className="bg-white border border-[#e8e8e6] rounded-xl p-5">
            <div className="text-[12px] text-gray-400 mb-1">{s.label}</div>
            <div className={`text-[28px] font-bold ${s.color}`}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Jurisdiction Filter */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {[{ code: 'all', flag: '', name: '전체', nameEn: 'All' }, ...Object.entries(JURISDICTIONS).map(([code, j]) => ({ code, ...j }))].map(j => (
          <button key={j.code} onClick={() => setJFilter(j.code)}
            className={`px-3 py-1.5 rounded-full text-[12px] font-medium border transition-all cursor-pointer ${jFilter === j.code ? 'bg-green-deep text-white border-green-deep' : 'bg-white text-gray-500 border-gray-200'}`}>
            {j.flag ? `${j.flag} ` : ''}{lang === 'en' ? j.nameEn : j.name}
          </button>
        ))}
      </div>

      {/* Kanban */}
      {viewMode === 'kanban' && (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {kanbanCols.map(col => (
            <div key={col.status} className="min-w-[230px] flex-1">
              <div className="flex items-center gap-2 mb-3 px-1">
                <Badge color={col.label.color}>{lang === 'en' ? col.label.en : col.label.ko}</Badge>
                <span className="text-[12px] text-gray-400">{col.items.length}</span>
              </div>
              <div className="space-y-2">
                {col.items.map((r: any) => (
                  <div key={r.id} onClick={() => setSelReg(r)} className="bg-white border border-[#e8e8e6] rounded-lg p-3.5 hover:border-green-deep/30 hover:shadow-sm transition-all cursor-pointer">
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <span className="text-[13px]">{JURISDICTIONS[r.jurisdiction]?.flag}</span>
                      <span className="text-[11px] text-gray-400 font-medium">{lang === 'en' ? JURISDICTIONS[r.jurisdiction]?.nameEn : JURISDICTIONS[r.jurisdiction]?.name}</span>
                    </div>
                    <div className="text-[13px] font-semibold leading-snug mb-2 line-clamp-2">{bi(r.title, r.titleEn)}</div>
                    {r.impactScore && <ImpactBar score={r.impactScore} />}
                  </div>
                ))}
                {col.items.length === 0 && <div className="py-8 text-center text-gray-300 text-[12px] border border-dashed border-gray-200 rounded-lg">{t('없음', 'None')}</div>}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* List */}
      {viewMode === 'list' && (
        <div className="bg-white border border-[#e8e8e6] rounded-xl overflow-hidden">
          {filtered.map((r: any, i: number) => (
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
          {filtered.length === 0 && <div className="py-12 text-center text-gray-400">{t('추적 중인 법안이 없습니다.', 'No tracked regulations.')}</div>}
        </div>
      )}

      {/* Bottom: Trends + Briefings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-10">
        {/* Trends Cloud */}
        <div>
          <h2 className="text-[16px] font-bold mb-4 flex items-center gap-2"><Icon name="search" size={16} className="text-green-deep" />{t('정책 트렌드', 'Policy Trends')}</h2>
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
          <h2 className="text-[16px] font-bold mb-4 flex items-center gap-2"><Icon name="file" size={16} className="text-green-deep" />{t('AI 정책 브리핑', 'AI Policy Briefings')}</h2>
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

      {/* ═══ MODALS ═══ */}

      {/* Regulation Detail */}
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
        </Modal>
      )}

      {/* Trend Detail */}
      {selTrend && (
        <Modal onClose={() => setSelTrend(null)}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[20px] font-bold">{bi(selTrend.keyword, selTrend.keywordEn)}</h2>
            <button onClick={() => setSelTrend(null)} className="text-gray-400 hover:text-gray-600"><Icon name="x" size={20} /></button>
          </div>
          <div className="grid grid-cols-3 gap-3 mb-5">
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <div className="text-[11px] text-gray-400">{t('점수', 'Score')}</div>
              <div className="text-[22px] font-bold" style={{ color: selTrend.score >= 80 ? '#dc2626' : selTrend.score >= 50 ? '#d97706' : '#059669' }}>{Math.round(selTrend.score)}</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <div className="text-[11px] text-gray-400">{t('언급 수', 'Mentions')}</div>
              <div className="text-[22px] font-bold">{selTrend.mentions}</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <div className="text-[11px] text-gray-400">{t('상태', 'Status')}</div>
              <div className="text-[14px] font-semibold mt-1">{selTrend.score >= 80 ? '🔴 Hot' : selTrend.score >= 50 ? '🟡 Rising' : '🟢 Steady'}</div>
            </div>
          </div>
          {selTrend.relatedTags?.length > 0 && (
            <div className="mb-4">
              <div className="text-[12px] font-semibold text-gray-400 mb-2">{t('관련 키워드', 'Related')}</div>
              <div className="flex gap-1.5 flex-wrap">{selTrend.relatedTags.map((tag: string) => <span key={tag} className="text-[12px] bg-green-50 text-green-700 px-2.5 py-1 rounded-full">{tag}</span>)}</div>
            </div>
          )}
          {/* Related regulations */}
          {(() => {
            const kw = (selTrend.keywordEn || selTrend.keyword).toLowerCase();
            const related = regulations.filter((r: any) => r.tags?.some((t: string) => kw.includes(t.toLowerCase())) || r.title?.toLowerCase().includes(kw) || r.titleEn?.toLowerCase().includes(kw)).slice(0, 3);
            if (!related.length) return null;
            return (
              <div>
                <div className="text-[12px] font-semibold text-gray-400 mb-2">{t('관련 법안', 'Related regulations')}</div>
                {related.map((r: any) => (
                  <div key={r.id} onClick={() => { setSelTrend(null); setSelReg(r); }} className="flex items-center gap-2 py-2 border-b border-gray-100 cursor-pointer hover:bg-gray-50 -mx-2 px-2 rounded">
                    <span>{JURISDICTIONS[r.jurisdiction]?.flag}</span>
                    <span className="text-[13px] font-medium flex-1 truncate">{bi(r.title, r.titleEn)}</span>
                    <Icon name="arrow" size={12} className="text-gray-300" />
                  </div>
                ))}
              </div>
            );
          })()}
        </Modal>
      )}

      {/* Briefing Detail */}
      {selBriefing && (
        <Modal onClose={() => setSelBriefing(null)} wide>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2"><Badge color="blue">{selBriefing.type === 'daily' ? t('일간 브리핑', 'Daily') : t('주간 브리핑', 'Weekly')}</Badge><span className="text-[12px] text-gray-400">{selBriefing.generatedAt?.slice(0, 10)}</span></div>
            <button onClick={() => setSelBriefing(null)} className="text-gray-400 hover:text-gray-600"><Icon name="x" size={20} /></button>
          </div>
          <h2 className="text-[20px] font-bold mb-4">{bi(selBriefing.title, selBriefing.titleEn)}</h2>
          <div className="text-[14px] text-gray-600 leading-relaxed whitespace-pre-wrap">{bi(selBriefing.content, selBriefing.contentEn)}</div>
        </Modal>
      )}
    </div>
  );
}
