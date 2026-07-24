'use client';

import { useEffect, useRef, useState } from 'react';
import { useLang } from '@/lib/i18n';

interface Clip { id: string; title: string; titleKo?: string | null; titleEn?: string | null; url: string; source: string; theme: string; }

const AI_THEMES = new Set(['AI_AGENT_PAYMENT', 'AI_FIN_INFRA', 'SOVEREIGN_AI', 'AI_PUBLIC_POLICY']);
const isAI = (t: string) => AI_THEMES.has(t);

function Lane({ clips, label, accent, dot, offset }: { clips: Clip[]; label: string; accent: string; dot: string; offset: number }) {
  const { lang } = useLang();
  const [i, setI] = useState(0);
  const paused = useRef(false);

  useEffect(() => {
    if (clips.length <= 1) return;
    let iv: ReturnType<typeof setInterval>;
    const start = setTimeout(() => {
      iv = setInterval(() => { if (!paused.current) setI(p => (p + 1) % clips.length); }, 5000);
    }, offset);
    return () => { clearTimeout(start); clearInterval(iv); };
  }, [clips.length, offset]);

  if (clips.length === 0) return null;
  const c = clips[i % clips.length];
  const headline = (lang === 'en' ? c.titleEn : c.titleKo) || c.title;

  return (
    <div className="h-5 flex items-center" onMouseEnter={() => { paused.current = true; }} onMouseLeave={() => { paused.current = false; }}>
      <div className="flex items-center gap-1.5 px-3 shrink-0 border-r border-white/10">
        <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
        <span className={`text-[10px] font-bold tracking-wide whitespace-nowrap ${accent}`}>{label}</span>
      </div>
      <a key={c.id} href={c.url} target="_blank" rel="noopener noreferrer"
        className="ticker-item flex-1 min-w-0 flex items-center gap-2 px-3 group">
        <span className="text-[12px] text-white/90 group-hover:text-white group-hover:underline truncate">{headline}</span>
        <span className="text-[10px] text-white/40 shrink-0 hidden md:inline">· {c.source}</span>
      </a>
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
    <div className="w-full bg-[#14251D] text-white flex flex-col border-y border-white/10">
      <Lane clips={da} label={t('디지털자산뉴스', 'Digital Asset')} accent="text-[#f0c059]" dot="bg-[#f0c059]" offset={0} />
      <div className="border-t border-white/10" />
      <Lane clips={ai} label={t('AI 뉴스', 'AI News')} accent="text-[#8fe3d0]" dot="bg-[#8fe3d0]" offset={2500} />
    </div>
  );
}
