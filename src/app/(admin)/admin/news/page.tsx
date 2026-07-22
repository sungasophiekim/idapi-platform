// src/app/(admin)/admin/news/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { Btn, Badge, Icon } from '@/components/ui';
import { CLIP_THEMES } from '@/modules/news-clip/themes';

interface Clip {
  id: string;
  title: string;
  url: string;
  source: string;
  theme: string;
  excerpt: string | null;
  lang: string;
  publishedAt: string;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
}

const STATUSES = ['DRAFT', 'PUBLISHED', 'ARCHIVED'] as const;

export default function AdminNewsPage() {
  const [clips, setClips] = useState<Clip[]>([]);
  const [status, setStatus] = useState<typeof STATUSES[number]>('DRAFT');
  const [loading, setLoading] = useState(false);
  const [collecting, setCollecting] = useState(false);
  const [msg, setMsg] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch(`/api/admin/news?status=${status}`);
      const d = await r.json();
      setClips(d.clips || []);
    } finally {
      setLoading(false);
    }
  }, [status]);

  useEffect(() => { load(); }, [load]);

  async function setClipStatus(id: string, next: Clip['status']) {
    await fetch('/api/admin/news', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status: next }),
    });
    setClips(prev => prev.filter(c => c.id !== id));
  }

  async function collectNow() {
    setCollecting(true);
    setMsg('');
    try {
      const r = await fetch('/api/admin/news', { method: 'POST' });
      const d = await r.json();
      const res = d.result || {};
      setMsg(`수집 완료 — scanned ${res.scanned}, matched ${res.matched}, new ${res.created}`);
      if (status === 'DRAFT') load();
    } catch {
      setMsg('수집 실패');
    } finally {
      setCollecting(false);
    }
  }

  return (
    <div className="p-8 max-w-[1000px]">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">News Clips</h1>
          <p className="text-sm text-gray-500 mt-1">AI·디지털자산 인프라 뉴스클리핑 큐레이션</p>
        </div>
        <Btn onClick={collectNow} disabled={collecting}>
          {collecting ? '수집 중…' : '지금 수집'} <Icon name="globe" size={15} />
        </Btn>
      </div>

      {msg && <div className="mb-4 text-[13px] text-green-deep bg-green-50 border border-green-pale rounded-lg px-4 py-2">{msg}</div>}

      <div className="flex gap-2 mb-5">
        {STATUSES.map(s => (
          <button key={s} onClick={() => setStatus(s)}
            className={`px-3.5 py-1.5 rounded-full text-[13px] font-medium border transition-all ${status === s ? 'bg-green-deep text-white border-green-deep' : 'bg-white text-gray-500 border-gray-200 hover:border-gray-400'}`}>
            {s}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="py-16 text-center text-gray-400">Loading…</div>
      ) : clips.length === 0 ? (
        <div className="py-16 text-center text-gray-400">{status} 상태의 클립이 없습니다.</div>
      ) : (
        <div className="space-y-3">
          {clips.map(c => {
            const theme = CLIP_THEMES[c.theme as keyof typeof CLIP_THEMES];
            return (
              <div key={c.id} className="border border-border rounded-xl p-5 bg-white">
                <div className="flex items-center gap-2 mb-2">
                  <Badge>{theme ? theme.ko : c.theme}</Badge>
                  <span className="text-[12px] text-gray-400">{c.source}</span>
                  <span className="text-[12px] text-gray-300">·</span>
                  <span className="text-[12px] text-gray-400">{c.publishedAt?.slice(0, 10)}</span>
                </div>
                <a href={c.url} target="_blank" rel="noopener noreferrer"
                  className="block text-[15px] font-semibold text-gray-900 hover:text-green-deep">
                  {c.title} <Icon name="arrow" size={13} className="inline text-gray-300" />
                </a>
                {c.excerpt && <p className="text-[13px] text-gray-500 mt-1.5 line-clamp-2">{c.excerpt}</p>}
                <div className="flex gap-2 mt-3">
                  {c.status !== 'PUBLISHED' && (
                    <button onClick={() => setClipStatus(c.id, 'PUBLISHED')}
                      className="px-3 py-1.5 text-[12px] font-semibold bg-green-deep text-white rounded-md hover:bg-green-light">
                      승인 · 공개
                    </button>
                  )}
                  {c.status !== 'ARCHIVED' && (
                    <button onClick={() => setClipStatus(c.id, 'ARCHIVED')}
                      className="px-3 py-1.5 text-[12px] font-semibold bg-gray-100 text-gray-600 rounded-md hover:bg-gray-200">
                      보관
                    </button>
                  )}
                  {c.status !== 'DRAFT' && (
                    <button onClick={() => setClipStatus(c.id, 'DRAFT')}
                      className="px-3 py-1.5 text-[12px] font-medium text-gray-500 rounded-md hover:bg-gray-100">
                      초안으로
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
