// src/app/(admin)/admin/trends/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { Btn, Badge, Icon, SelectField } from '@/components/ui';
import { RSS_SOURCES } from '@/modules/trend-engine/sources';

interface TrendResult {
  keyword: string;
  keywordEn: string;
  score: number;
  mentions: number;
  jurisdictions: string[];
  relatedTags: string[];
  isSpike: boolean;
}

interface RunResult {
  success: boolean;
  articlesCollected: number;
  articlesAnalyzed: number;
  trendsDetected: number;
  spikesDetected: number;
  topTrends: TrendResult[];
  duration: number;
  errors: string[];
}

export default function AdminTrendsPage() {
  const [trends, setTrends] = useState<any[]>([]);
  const [running, setRunning] = useState(false);
  const [lastResult, setLastResult] = useState<RunResult | null>(null);
  const [tab, setTab] = useState<'trends' | 'sources' | 'log'>('trends');
  const [jurisdictionFilter, setJurisdictionFilter] = useState('all');
  const [skipAi, setSkipAi] = useState(false);

  const loadTrends = useCallback(async () => {
    const res = await fetch('/api/trends');
    const data = await res.json();
    setTrends(data.trends || []);
  }, []);

  useEffect(() => { loadTrends(); }, [loadTrends]);

  const runDetection = async () => {
    setRunning(true);
    setLastResult(null);
    try {
      const body: any = { maxAgeDays: 7, skipAi };
      if (jurisdictionFilter !== 'all') body.jurisdictions = [jurisdictionFilter];

      const res = await fetch('/api/trends/detect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      setLastResult(data);
      loadTrends();
    } catch (err: any) {
      setLastResult({ success: false, articlesCollected: 0, articlesAnalyzed: 0, trendsDetected: 0, spikesDetected: 0, topTrends: [], duration: 0, errors: [err.message] });
    }
    setRunning(false);
  };

  const sources = RSS_SOURCES;
  const activeCount = sources.filter(s => s.active).length;
  const jurisdictions = [...new Set(sources.map(s => s.jurisdiction))];

  return (
    <div>
      <div className="flex justify-between items-start mb-6 flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold">Trend Detection</h1>
          <p className="text-[13px] text-gray-400 mt-1">{activeCount} RSS sources active · Runs every 6 hours via cron</p>
        </div>
        <div className="flex gap-2 items-center">
          <label className="flex items-center gap-1.5 text-[12px] text-gray-500 cursor-pointer">
            <input type="checkbox" checked={skipAi} onChange={e => setSkipAi(e.target.checked)} className="w-3.5 h-3.5 accent-green-800" />
            Skip AI (fallback only)
          </label>
          <Btn size="sm" onClick={runDetection} disabled={running}>
            {running ? (
              <><span className="inline-block w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Running...</>
            ) : (
              <><Icon name="search" size={14} /> Run Detection</>
            )}
          </Btn>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-gray-200">
        {(['trends', 'sources', 'log'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2.5 text-[13px] font-medium border-b-2 transition-all ${tab === t ? 'border-green-deep text-green-deep' : 'border-transparent text-gray-400 hover:text-gray-600'}`}>
            {t === 'trends' ? `Trends (${trends.length})` : t === 'sources' ? `RSS Sources (${activeCount})` : 'Run Log'}
          </button>
        ))}
      </div>

      {/* ═══ Trends Tab ═══ */}
      {tab === 'trends' && (
        <div>
          {trends.length > 0 ? (
            <div className="space-y-2">
              {trends.map((t: any, i: number) => (
                <div key={t.id} className="bg-white border border-[#e8e8e6] rounded-xl px-5 py-4 flex items-center gap-4">
                  <div className="text-[22px] font-bold text-gray-200 w-8 text-right shrink-0">
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[15px] font-semibold">{t.keyword}</span>
                      {t.keywordEn && t.keywordEn !== t.keyword && (
                        <span className="text-[12px] text-gray-400">({t.keywordEn})</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      {t.relatedTags?.slice(0, 4).map((tag: string) => (
                        <span key={tag} className="text-[11px] text-gray-400 bg-gray-50 px-2 py-0.5 rounded">{tag}</span>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      <div className="text-[11px] text-gray-400">mentions</div>
                      <div className="text-[14px] font-semibold">{t.mentions}</div>
                    </div>
                    {/* Score bar */}
                    <div className="w-20">
                      <div className="flex items-center gap-1.5">
                        <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full rounded-full transition-all" style={{
                            width: `${t.score}%`,
                            background: t.score >= 80 ? '#dc2626' : t.score >= 50 ? '#d97706' : '#059669',
                          }} />
                        </div>
                        <span className="text-[12px] font-bold w-8 text-right" style={{
                          color: t.score >= 80 ? '#dc2626' : t.score >= 50 ? '#d97706' : '#059669',
                        }}>{Math.round(t.score)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white border border-dashed border-gray-200 rounded-xl py-16 text-center">
              <Icon name="search" size={32} className="mx-auto text-gray-300 mb-3" />
              <p className="text-gray-400 text-[14px]">No trends detected yet</p>
              <p className="text-gray-300 text-[12px] mt-1">Click "Run Detection" to start the pipeline</p>
            </div>
          )}
        </div>
      )}

      {/* ═══ Sources Tab ═══ */}
      {tab === 'sources' && (
        <div>
          <div className="flex gap-2 mb-4 flex-wrap">
            <button onClick={() => setJurisdictionFilter('all')}
              className={`px-3 py-1 rounded-full text-[12px] font-medium border transition-all ${jurisdictionFilter === 'all' ? 'bg-green-deep text-white border-green-deep' : 'bg-white text-gray-500 border-gray-200'}`}>
              All ({sources.length})
            </button>
            {jurisdictions.map(j => {
              const count = sources.filter(s => s.jurisdiction === j).length;
              return (
                <button key={j} onClick={() => setJurisdictionFilter(j)}
                  className={`px-3 py-1 rounded-full text-[12px] font-medium border transition-all ${jurisdictionFilter === j ? 'bg-green-deep text-white border-green-deep' : 'bg-white text-gray-500 border-gray-200'}`}>
                  {j} ({count})
                </button>
              );
            })}
          </div>
          <div className="bg-white border border-[#e8e8e6] rounded-xl overflow-hidden">
            {sources
              .filter(s => jurisdictionFilter === 'all' || s.jurisdiction === jurisdictionFilter)
              .map((s, i, arr) => (
              <div key={s.id} className={`flex items-center gap-3 px-5 py-3 text-[13px] ${i < arr.length - 1 ? 'border-b border-gray-100' : ''}`}>
                <Badge color={s.active ? 'green' : 'gray'}>{s.active ? 'ON' : 'OFF'}</Badge>
                <Badge color="blue">{s.jurisdiction}</Badge>
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{s.name}</div>
                  <div className="text-gray-400 text-[11px] truncate">{s.url}</div>
                </div>
                <Badge color={
                  s.type === 'government' || s.type === 'regulator' ? 'green' :
                  s.type === 'legislature' ? 'amber' :
                  s.type === 'intl_org' ? 'blue' : 'gray'
                }>{s.type}</Badge>
                <div className="text-[12px] text-gray-400 w-14 text-right">wt: {s.weight}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ═══ Log Tab ═══ */}
      {tab === 'log' && (
        <div>
          {lastResult ? (
            <div className="space-y-4">
              {/* Summary card */}
              <div className={`border rounded-xl p-6 ${lastResult.success ? 'bg-green-50/50 border-green-200' : 'bg-red-50/50 border-red-200'}`}>
                <div className="flex items-center gap-2 mb-3">
                  <Badge color={lastResult.success ? 'green' : 'red'}>{lastResult.success ? 'SUCCESS' : 'ERROR'}</Badge>
                  <span className="text-[13px] text-gray-500">Duration: {(lastResult.duration / 1000).toFixed(1)}s</span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: 'Articles collected', value: lastResult.articlesCollected },
                    { label: 'Articles analyzed', value: lastResult.articlesAnalyzed },
                    { label: 'Trends detected', value: lastResult.trendsDetected },
                    { label: 'Spikes detected', value: lastResult.spikesDetected },
                  ].map(s => (
                    <div key={s.label}>
                      <div className="text-[11px] text-gray-400">{s.label}</div>
                      <div className="text-[20px] font-bold">{s.value}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Errors */}
              {lastResult.errors.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                  <div className="text-[13px] font-semibold text-red-700 mb-2">Errors</div>
                  {lastResult.errors.map((e, i) => (
                    <div key={i} className="text-[12px] text-red-600 font-mono">{e}</div>
                  ))}
                </div>
              )}

              {/* Detected trends */}
              {lastResult.topTrends.length > 0 && (
                <div>
                  <div className="text-[14px] font-semibold mb-2">Detected trends this run</div>
                  <div className="bg-white border border-[#e8e8e6] rounded-xl overflow-hidden">
                    {lastResult.topTrends.map((t, i) => (
                      <div key={i} className={`flex items-center gap-3 px-5 py-3 ${i < lastResult.topTrends.length - 1 ? 'border-b border-gray-100' : ''}`}>
                        <span className="text-[13px] font-semibold w-6 text-right text-gray-300">{i + 1}</span>
                        <span className="text-[14px] font-medium flex-1">{t.keyword}</span>
                        {t.isSpike && <Badge color="red">SPIKE</Badge>}
                        <span className="text-[12px] text-gray-400">{t.mentions} mentions</span>
                        <span className="text-[12px] text-gray-400">{t.jurisdictions.join(', ')}</span>
                        <span className="text-[13px] font-bold" style={{
                          color: t.score >= 80 ? '#dc2626' : t.score >= 50 ? '#d97706' : '#059669',
                        }}>{Math.round(t.score)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white border border-dashed border-gray-200 rounded-xl py-16 text-center">
              <p className="text-gray-400 text-[14px]">No runs yet this session</p>
              <p className="text-gray-300 text-[12px] mt-1">Run detection to see results here</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
