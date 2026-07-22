// src/app/(admin)/admin/sources/page.tsx — RSS source health dashboard
'use client';

import { useState, useEffect, useCallback } from 'react';
import { Btn, Icon } from '@/components/ui';

interface Health {
  id: string; name: string; nameKo: string; jurisdiction: string; type: string;
  weight: number; active: boolean; status: 'live' | 'dead'; httpCode: number | null;
  itemCount: number; latestDate: string | null; error: string | null; ms: number;
}

function ago(iso: string | null): string {
  if (!iso) return '—';
  const d = Date.now() - new Date(iso).getTime();
  const h = Math.floor(d / 3600000);
  if (h < 1) return '방금';
  if (h < 24) return `${h}시간 전`;
  return `${Math.floor(h / 24)}일 전`;
}

export default function SourcesPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<'all' | 'live' | 'dead'>('all');

  const check = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch('/api/admin/sources');
      setData(await r.json());
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { check(); }, [check]);

  const sources: Health[] = data?.sources || [];
  const shown = filter === 'all' ? sources : sources.filter(s => s.status === filter);

  return (
    <div className="p-8 max-w-[1100px]">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-2xl font-bold">소스 상태</h1>
          <p className="text-sm text-gray-500 mt-1">RSS 뉴스 소스 헬스 · 마지막 업데이트</p>
        </div>
        <Btn onClick={check} disabled={loading}>{loading ? '점검 중…' : '지금 점검'} <Icon name="search" size={15} /></Btn>
      </div>

      {data && (
        <div className="flex gap-3 mb-5">
          {[
            { k: 'all', label: '전체', n: data.total, cls: 'text-gray-700' },
            { k: 'live', label: '라이브', n: data.live, cls: 'text-green-deep' },
            { k: 'dead', label: '사망', n: data.dead, cls: 'text-red-600' },
          ].map(s => (
            <button key={s.k} onClick={() => setFilter(s.k as any)}
              className={`px-4 py-2.5 rounded-xl border text-left ${filter === s.k ? 'border-green-deep bg-green-50' : 'border-border bg-white'}`}>
              <div className={`text-xl font-bold ${s.cls}`}>{s.n}</div>
              <div className="text-[12px] text-gray-500">{s.label}</div>
            </button>
          ))}
          {data.checkedAt && <div className="ml-auto self-end text-[12px] text-gray-400">점검: {new Date(data.checkedAt).toLocaleString('ko-KR')}</div>}
        </div>
      )}

      {loading && !data ? (
        <div className="py-20 text-center text-gray-400">42개 소스 점검 중… (최대 15초)</div>
      ) : (
        <div className="border border-border rounded-xl overflow-hidden">
          <table className="w-full text-[13px]">
            <thead className="bg-bg-alt text-gray-500 text-[11px] uppercase tracking-wide">
              <tr>
                <th className="text-left px-4 py-2.5 font-semibold">상태</th>
                <th className="text-left px-4 py-2.5 font-semibold">소스</th>
                <th className="text-left px-4 py-2.5 font-semibold">유형</th>
                <th className="text-right px-4 py-2.5 font-semibold">기사</th>
                <th className="text-right px-4 py-2.5 font-semibold">마지막 업데이트</th>
                <th className="text-left px-4 py-2.5 font-semibold">비고</th>
              </tr>
            </thead>
            <tbody>
              {shown.map(s => (
                <tr key={s.id} className={`border-t border-gray-100 ${!s.active ? 'opacity-50' : ''}`}>
                  <td className="px-4 py-2.5">
                    <span className={`inline-flex items-center gap-1.5 text-[12px] font-semibold ${s.status === 'live' ? 'text-green-deep' : 'text-red-600'}`}>
                      <span className={`w-2 h-2 rounded-full ${s.status === 'live' ? 'bg-green-deep' : 'bg-red-500'}`} />
                      {s.status === 'live' ? 'LIVE' : 'DEAD'}
                    </span>
                  </td>
                  <td className="px-4 py-2.5">
                    <div className="font-medium text-gray-800">{s.nameKo || s.name}</div>
                    <div className="text-[11px] text-gray-400">{s.jurisdiction} · {s.id}{!s.active && ' · 비활성'}</div>
                  </td>
                  <td className="px-4 py-2.5 text-gray-500">{s.type}</td>
                  <td className="px-4 py-2.5 text-right text-gray-600">{s.itemCount || '—'}</td>
                  <td className="px-4 py-2.5 text-right text-gray-600">{ago(s.latestDate)}</td>
                  <td className="px-4 py-2.5 text-[12px] text-gray-400">{s.error || `${s.httpCode ?? ''} · ${s.ms}ms`}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
