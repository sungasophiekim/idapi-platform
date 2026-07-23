'use client';

import { useEffect, useState } from 'react';
import { useLang } from '@/lib/i18n';

interface Clip { id: string; title: string; titleKo?: string | null; titleEn?: string | null; url: string; source: string; theme: string; }

const AI_THEMES = new Set(['AI_AGENT_PAYMENT', 'AI_FIN_INFRA', 'SOVEREIGN_AI', 'AI_PUBLIC_POLICY']);
const isAI = (theme: string) => AI_THEMES.has(theme);

function Lane({ clips, label, accent }: { clips: Clip[]; label: string; accent: string }) {
  const { lang } = useLang();
  if (clips.length === 0) return null;
  const items = [...clips, ...clips];
  const headline = (c: Clip) => (lang === 'en' ? c.titleEn : c.titleKo) || c.title;
  return (
    <div className="flex items-stretch h-5 overflow-hidden">
      <div className="hidden sm:flex items-center px-3 shrink-0 border-r border-white/10">
        <span className={`text-[10px] font-bold tracking-wide whitespace-nowrap ${accent}`}>{label}</span>
      </div>
      <div className="flex-1 overflow-hidden relative flex items-center">
        <div className="ticker-track" style={{ animationDuration: `${Math.max(40, clips.length * 8)}s` }}>
          {items.map((c, i) => (
            <a key={`${c.id}-${i}`} href={c.url} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 group">
              <span className="text-[11.5px] text-white/85 group-hover:text-white group-hover:underline">{headline(c)}</span>
              <span className="text-[10px] text-white/40">· {c.source}</span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function NewsTicker() {
  const { t } = useLang();
  const [clips, setClips] = useState<Clip[]>([]);

  useEffect(() => {
    fetch('/api/news').then(r => r.json()).then(d => setClips(d.clips || [])).catch(() => {});
  }, []);

  if (clips.length === 0) return null;

  const da = clips.filter(c => !isAI(c.theme));
  const ai = clips.filter(c => isAI(c.theme));

  return (
    <div className="fixed top-0 left-0 right-0 z-[60] bg-green-deep text-white flex flex-col">
      <Lane clips={da} label={t('디지털자산뉴스', 'Digital Asset')} accent="text-[#f0c059]" />
      <div className="border-t border-white/10" />
      <Lane clips={ai} label={t('AI 뉴스', 'AI News')} accent="text-white" />
    </div>
  );
}
