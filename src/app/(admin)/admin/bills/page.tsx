'use client';

import { useState, useEffect } from 'react';
import { Btn, Badge, Icon, SelectField } from '@/components/ui';

interface Regulation {
  id: string;
  title: string;
  titleEn: string | null;
  jurisdiction: string;
  status: string;
  sourceName: string | null;
  billNumber: string | null;
  impactScore: number | null;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  timelineEvents: { status: string; eventDate: string }[];
}

const JURISDICTIONS = [
  { value: 'all', label: 'All' },
  { value: 'KR', label: '🇰🇷 Korea' },
  { value: 'US', label: '🇺🇸 United States' },
  { value: 'EU', label: '🇪🇺 European Union' },
  { value: 'SG', label: '🇸🇬 Singapore' },
  { value: 'JP', label: '🇯🇵 Japan' },
  { value: 'UK', label: '🇬🇧 United Kingdom' },
  { value: 'HK', label: '🇭🇰 Hong Kong' },
  { value: 'INTL', label: '🌐 International' },
];

const STATUS_COLORS: Record<string, string> = {
  PROPOSED: 'blue', COMMITTEE: 'blue', FLOOR_VOTE: 'amber',
  PASSED: 'green', ENACTED: 'green', REJECTED: 'red', WITHDRAWN: 'gray',
};

export default function AdminBillsPage() {
  const [bills, setBills] = useState<Regulation[]>([]);
  const [jurisdiction, setJurisdiction] = useState('all');
  const [collecting, setCollecting] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const url = jurisdiction === 'all' ? '/api/bills?limit=50' : `/api/bills?limit=50&jurisdiction=${jurisdiction}`;
    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      setBills(data.regulations || []);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, [jurisdiction]);

  const runCollection = async () => {
    setCollecting(true);
    setResult(null);
    try {
      const res = await fetch('/api/bills', { method: 'POST' });
      const data = await res.json();
      setResult(data);
      if (data.success) load();
    } catch {
      setResult({ error: 'Collection failed' });
    }
    setCollecting(false);
  };

  // Group by jurisdiction for stats
  const byJurisdiction = bills.reduce((acc, b) => {
    acc[b.jurisdiction] = (acc[b.jurisdiction] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Bill Collector</h1>
          <p className="text-sm text-gray-400 mt-1">자동 수집된 법안 및 규제 목록</p>
        </div>
        <Btn onClick={runCollection} disabled={collecting} size="sm">
          {collecting ? (
            <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Collecting...</>
          ) : (
            <><Icon name="search" size={14} /> Run Collection</>
          )}
        </Btn>
      </div>

      {/* Collection Result */}
      {result && (
        <div className={`mb-6 p-4 rounded-xl border ${result.error ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
          {result.error ? (
            <p className="text-red-700 text-sm">{result.error}</p>
          ) : (
            <div className="text-sm text-green-800">
              <p className="font-semibold">Collection complete</p>
              <p>Collected: {result.collected} | Saved: {result.saved} | Duration: {result.duration}</p>
              {result.errors?.length > 0 && (
                <p className="text-amber-700 mt-1">Errors: {result.errors.join(', ')}</p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 mb-6">
        {Object.entries(byJurisdiction).map(([j, count]) => (
          <div key={j} className="bg-white border border-border rounded-lg p-3 text-center">
            <div className="text-lg font-bold text-green-deep">{count}</div>
            <div className="text-[11px] text-gray-400">{j}</div>
          </div>
        ))}
        <div className="bg-white border border-border rounded-lg p-3 text-center">
          <div className="text-lg font-bold text-gray-700">{bills.length}</div>
          <div className="text-[11px] text-gray-400">Total</div>
        </div>
      </div>

      {/* Filter */}
      <div className="flex gap-4 mb-4 items-end">
        <div className="w-48">
          <SelectField label="Jurisdiction" value={jurisdiction} onChange={setJurisdiction} options={JURISDICTIONS} />
        </div>
      </div>

      {/* Bill List */}
      <div className="bg-white border border-border rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-gray-400">Loading...</div>
        ) : bills.length === 0 ? (
          <div className="p-10 text-center text-gray-400">No bills found. Run collection to fetch from sources.</div>
        ) : (
          bills.map((b, i) => (
            <div key={b.id} className={`flex items-center gap-3 px-5 py-3.5 hover:bg-gray-50 transition ${i < bills.length - 1 ? 'border-b border-gray-100' : ''}`}>
              <Badge color={STATUS_COLORS[b.status] || 'gray'}>{b.status}</Badge>
              <Badge color="blue">{b.jurisdiction}</Badge>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">{b.title}</div>
                <div className="text-xs text-gray-400 mt-0.5">
                  {b.sourceName && <span>{b.sourceName}</span>}
                  {b.billNumber && <span> · {b.billNumber}</span>}
                </div>
              </div>
              {b.impactScore && (
                <div className={`text-xs font-bold px-2 py-0.5 rounded ${b.impactScore >= 8 ? 'bg-red-100 text-red-700' : b.impactScore >= 5 ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-600'}`}>
                  {b.impactScore}/10
                </div>
              )}
              {b.tags.length > 0 && (
                <div className="hidden lg:flex gap-1">
                  {b.tags.slice(0, 3).map(t => (
                    <span key={t} className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">{t}</span>
                  ))}
                </div>
              )}
              <div className="text-xs text-gray-300 w-20 text-right">{new Date(b.createdAt).toLocaleDateString()}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
