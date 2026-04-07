'use client';

import { useState, useEffect } from 'react';
import { Badge, Icon, InputField, Btn, SelectField } from '@/components/ui';

interface Law {
  id: string;
  jurisdiction: string;
  title: string;
  titleEn: string | null;
  shortName: string | null;
  status: string;
  effectiveDate: string | null;
  totalArticles: number | null;
  _count: { articles: number };
}

interface Article {
  articleNum: string;
  articleTitle: string | null;
  content: string;
  contentEn: string | null;
  chapter: string | null;
  tags: string[];
  appliesToBiz: string[];
}

const JURISDICTION_LABELS: Record<string, string> = {
  KR: '🇰🇷 Korea', US: '🇺🇸 USA', EU: '🇪🇺 EU', SG: '🇸🇬 Singapore',
  JP: '🇯🇵 Japan', UK: '🇬🇧 UK', HK: '🇭🇰 Hong Kong', INTL: '🌐 International',
};

export default function AdminArchivePage() {
  const [laws, setLaws] = useState<Law[]>([]);
  const [stats, setStats] = useState<{ totalLaws: number; totalArticles: number; byJurisdiction: Record<string, number> } | null>(null);
  const [selectedLaw, setSelectedLaw] = useState<string | null>(null);
  const [articles, setArticles] = useState<Article[]>([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [collecting, setCollecting] = useState(false);
  const [collectResult, setCollectResult] = useState<any>(null);
  const [collectForm, setCollectForm] = useState({ jurisdiction: 'KR', lawName: '', shortName: '', regulator: '' });

  const runCollect = async (preset?: string, intl?: boolean, onlyMissing?: boolean) => {
    setCollecting(true);
    setCollectResult(null);
    try {
      const url = intl ? '/api/archive/collect-intl' : '/api/archive/collect';
      const body = intl ? { onlyMissing: !!onlyMissing } : preset ? { preset } : { ...collectForm };
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      setCollectResult(data);
      // Reload stats and laws
      const [lawData, statsData] = await Promise.all([
        fetch('/api/archive').then(r => r.json()),
        fetch('/api/archive/stats').then(r => r.json()),
      ]);
      setLaws(lawData.laws || []);
      setStats(statsData);
    } catch { setCollectResult({ error: 'Collection failed' }); }
    setCollecting(false);
  };

  useEffect(() => {
    Promise.all([
      fetch('/api/archive').then(r => r.json()),
      fetch('/api/archive/stats').then(r => r.json()),
    ]).then(([lawData, statsData]) => {
      setLaws(lawData.laws || []);
      setStats(statsData);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const loadArticles = async (lawId: string) => {
    if (selectedLaw === lawId) { setSelectedLaw(null); return; }
    setSelectedLaw(lawId);
    const res = await fetch(`/api/archive/${lawId}`);
    const data = await res.json();
    setArticles(data.articles || []);
  };

  const handleSearch = async () => {
    if (!searchKeyword.trim()) return;
    const res = await fetch(`/api/archive/search?q=${encodeURIComponent(searchKeyword)}`);
    const data = await res.json();
    setSearchResults(data.results || []);
  };

  if (loading) return <div className="min-h-[400px] flex items-center justify-center text-gray-400">Loading...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <div>
          <h1 className="text-2xl font-bold">Law Archive</h1>
          <p className="text-sm text-gray-400 mt-1">조문 단위 법률 아카이브 — AI 컨텍스트 소스</p>
        </div>
        <div className="flex gap-2">
          <Btn onClick={() => runCollect('korean-all')} disabled={collecting} size="sm">
            {collecting ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> ...</> : <><Icon name="search" size={14} /> Collect KR</>}
          </Btn>
          <Btn onClick={() => runCollect(undefined, true)} disabled={collecting} size="sm" variant="outline">
            <Icon name="globe" size={14} /> Collect Intl
          </Btn>
          <Btn onClick={() => runCollect(undefined, true, true)} disabled={collecting} size="sm" variant="ghost">
            <Icon name="search" size={14} /> Retry Missing
          </Btn>
        </div>
      </div>

      {/* Collection Result */}
      {collectResult && (
        <div className={`mb-4 p-4 rounded-xl border text-sm ${collectResult.error ? 'bg-red-50 border-red-200 text-red-700' : 'bg-green-50 border-green-200 text-green-800'}`}>
          {collectResult.error ? collectResult.error : collectResult.details ? (
            <div>
              <p className="font-semibold">Intl Collection: {collectResult.collected} ✓ / {collectResult.failed} ✗ {collectResult.skipped > 0 && `/ ${collectResult.skipped} ⏭`}</p>
              {collectResult.details.map((d: string, i: number) => <p key={i}>{d}</p>)}
            </div>
          ) : collectResult.results ? (
            <div>
              <p className="font-semibold">Collection complete</p>
              {collectResult.results.map((r: any, i: number) => (
                <p key={i}>{r.success ? '✓' : '✗'} {r.title} — {r.articleCount || 0} articles {r.error && `(${r.error})`}</p>
              ))}
            </div>
          ) : (
            <p>{collectResult.success ? '✓' : '✗'} {collectResult.title} — {collectResult.articleCount || 0} articles</p>
          )}
        </div>
      )}

      {/* Manual Collection Form */}
      <div className="bg-white border border-border rounded-xl p-5 mb-6">
        <h3 className="text-sm font-bold mb-3">수동 수집 — 법률명으로 검색</h3>
        <div className="flex gap-3 items-end">
          <div className="w-32">
            <SelectField label="Jurisdiction" value={collectForm.jurisdiction} onChange={v => setCollectForm({...collectForm, jurisdiction: v})} options={[
              {value:'KR',label:'🇰🇷 Korea'},{value:'US',label:'🇺🇸 USA'},{value:'EU',label:'🇪🇺 EU'},{value:'SG',label:'🇸🇬 SG'},{value:'JP',label:'🇯🇵 JP'},{value:'HK',label:'🇭🇰 HK'},
            ]} />
          </div>
          <div className="flex-1">
            <InputField label="Law Name" value={collectForm.lawName} onChange={v => setCollectForm({...collectForm, lawName: v})} placeholder="e.g. 전자금융거래법" />
          </div>
          <Btn onClick={() => runCollect()} disabled={collecting || !collectForm.lawName} size="sm" style={{marginBottom: 16}}>Collect</Btn>
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <div className="bg-white border border-border rounded-xl p-5">
            <div className="text-xs text-gray-400 mb-1">Total Laws</div>
            <div className="text-2xl font-bold text-green-deep">{stats.totalLaws}</div>
          </div>
          <div className="bg-white border border-border rounded-xl p-5">
            <div className="text-xs text-gray-400 mb-1">Total Articles</div>
            <div className="text-2xl font-bold text-blue-600">{stats.totalArticles}</div>
          </div>
          {Object.entries(stats.byJurisdiction).map(([j, count]) => (
            <div key={j} className="bg-white border border-border rounded-xl p-5">
              <div className="text-xs text-gray-400 mb-1">{JURISDICTION_LABELS[j] || j}</div>
              <div className="text-2xl font-bold text-amber-600">{count}</div>
            </div>
          ))}
        </div>
      )}

      {/* Search */}
      <div className="flex gap-3 mb-6 items-end">
        <div className="flex-1">
          <InputField label="Search Articles" value={searchKeyword} onChange={setSearchKeyword} placeholder="e.g. stablecoin, 예치금, travel rule" />
        </div>
        <button onClick={handleSearch} className="px-4 py-2.5 bg-green-deep text-white rounded-lg text-sm font-semibold mb-4">
          <Icon name="search" size={14} />
        </button>
      </div>

      {/* Search Results */}
      {searchResults.length > 0 && (
        <div className="mb-8">
          <h2 className="text-base font-bold mb-3">Search Results ({searchResults.length})</h2>
          <div className="space-y-2">
            {searchResults.map((r: any, i: number) => (
              <div key={i} className="bg-white border border-border rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Badge color="blue">{r.jurisdiction}</Badge>
                  <span className="text-sm font-semibold">{r.title}</span>
                  <span className="text-xs text-gray-400">{r.articleNum}</span>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed line-clamp-3">{r.content}</p>
                <div className="flex gap-1 mt-2">
                  {r.tags?.slice(0, 5).map((t: string) => (
                    <span key={t} className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">{t}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Law List */}
      <h2 className="text-base font-bold mb-3">Archived Laws ({laws.length})</h2>
      <div className="space-y-2">
        {laws.map(law => (
          <div key={law.id} className="bg-white border border-border rounded-xl overflow-hidden">
            <button onClick={() => loadArticles(law.id)}
              className="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-gray-50 transition"
              aria-expanded={selectedLaw === law.id}>
              <Badge color="blue">{law.jurisdiction}</Badge>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold truncate">{law.title}</div>
                <div className="text-xs text-gray-400">{law.titleEn} {law.shortName && `· ${law.shortName}`}</div>
              </div>
              <Badge color={law.status === 'enacted' ? 'green' : 'amber'}>{law.status}</Badge>
              <span className="text-xs text-gray-400">{law._count.articles} articles</span>
              <Icon name={selectedLaw === law.id ? 'x' : 'arrow'} size={14} />
            </button>

            {selectedLaw === law.id && articles.length > 0 && (
              <div className="border-t border-border max-h-[500px] overflow-y-auto">
                {articles.map((a, i) => (
                  <div key={i} className={`px-5 py-3 ${i < articles.length - 1 ? 'border-b border-gray-50' : ''}`}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold text-green-deep">{a.articleNum}</span>
                      {a.articleTitle && <span className="text-xs text-gray-500">{a.articleTitle}</span>}
                      {a.chapter && <span className="text-[10px] text-gray-400">({a.chapter})</span>}
                    </div>
                    <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{a.content}</p>
                    {a.contentEn && <p className="text-xs text-gray-400 mt-1 leading-relaxed">{a.contentEn}</p>}
                    <div className="flex gap-1 mt-2 flex-wrap">
                      {a.tags.map(t => <span key={t} className="text-[10px] bg-green-50 text-green-700 px-1.5 py-0.5 rounded">{t}</span>)}
                      {a.appliesToBiz.map(b => <span key={b} className="text-[10px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded">{b}</span>)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
