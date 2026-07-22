'use client';

import { useEffect, useState } from 'react';
import { useLang } from '@/lib/i18n';

interface Clip { id: string; title: string; url: string; source: string; theme: string; }

// 7 watch themes → 2 macro labels for the ticker.
const AI_THEMES = new Set(['AI_AGENT_PAYMENT', 'AI_FIN_INFRA', 'SOVEREIGN_AI', 'AI_PUBLIC_POLICY']);
function macro(theme: string): 'AI' | 'DA' {
  return AI_THEMES.has(theme) ? 'AI' : 'DA';
}

export default function NewsTicker() {
  const { t } = useLang();
  const [clips, setClips] = useState<Clip[]>([]);

  useEffect(() => {
    fetch('/api/news').then(r => r.json()).then(d => setClips(d.clips || [])).catch(() => {});
  }, []);

  if (clips.length === 0) return null;

  const items = [...clips, ...clips]; // duplicate for seamless -50% loop

  return (
    <div className="fixed top-0 left-0 right-0 z-[60] h-9 bg-green-deep text-white flex items-stretch overflow-hidden">
      {/* Static left cap */}
      <div className="hidden sm:flex items-center gap-1.5 px-3.5 bg-green-light/90 shrink-0 border-r border-white/10">
        <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
        <span className="text-[11px] font-bold tracking-wide whitespace-nowrap">{t('오늘의 Top News', "Today's Top News")}</span>
      </div>

      {/* Marquee */}
      <div className="flex-1 overflow-hidden relative flex items-center">
        <div className="ticker-track">
          {items.map((c, i) => {
            const kind = macro(c.theme);
            return (
              <a key={`${c.id}-${i}`} href={c.url} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 group">
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${kind === 'AI' ? 'bg-white text-green-deep' : 'bg-[#e0a82e] text-[#1c1c1c]'}`}>
                  {kind === 'AI' ? t('AI 뉴스', 'AI') : t('디지털자산뉴스', 'Digital Asset')}
                </span>
                <span className="text-[12.5px] text-white/90 group-hover:text-white group-hover:underline">{c.title}</span>
                <span className="text-[11px] text-white/40">· {c.source}</span>
              </a>
            );
          })}
        </div>
      </div>
    </div>
  );
}
