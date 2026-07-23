'use client';

import { useState } from 'react';
import { useLang } from '@/lib/i18n';
import { CLIP_THEMES, type ClipTheme } from '@/modules/news-clip/themes';

interface Clip {
  id: string;
  title: string;
  titleKo?: string | null;
  titleEn?: string | null;
  url: string;
  source: string;
  theme: string;
  excerpt: string | null;
  publishedAt: string;
}

const THEME_ORDER: ClipTheme[] = ['RWA', 'STABLECOIN', 'DA_FIN_INFRA', 'AI_AGENT_PAYMENT', 'AI_FIN_INFRA', 'SOVEREIGN_AI', 'AI_PUBLIC_POLICY'];

export default function NewsClipClient({ clips }: { clips: Clip[] }) {
  const { t, lang } = useLang();
  const [active, setActive] = useState<'all' | ClipTheme>('all');

  const filtered = active === 'all' ? clips : clips.filter(c => c.theme === active);
  const label = (k: string) => {
    const th = CLIP_THEMES[k as ClipTheme];
    return th ? (lang === 'en' ? th.en : th.ko) : k;
  };

  return (
    <div className="pt-28 pb-24">
      <div className="max-w-[1140px] mx-auto px-6">
        <div className="max-w-[680px] mb-10">
          <div className="text-[11px] font-bold tracking-widest uppercase text-green-deep/60 mb-3">
            {t('뉴스클리핑', 'News Clipping')}
          </div>
          <h1 className="text-[38px] font-bold tracking-tight leading-tight text-gray-900">
            {t('AI·디지털자산 인프라 뉴스', 'AI & digital-asset infrastructure news')}
          </h1>
          <p className="mt-4 text-[15px] text-gray-500 leading-relaxed">
            {t(
              'iDAPI가 7개 워치 테마로 큐레이션한 AI·블록체인 인프라 주요 뉴스입니다.',
              'Curated headlines across iDAPI’s 7 watch themes in AI & blockchain infrastructure.',
            )}
          </p>
        </div>

        {/* Theme tabs */}
        <div className="flex gap-2 mb-8 flex-wrap">
          {[{ k: 'all', l: t('전체', 'All') }, ...THEME_ORDER.map(k => ({ k, l: label(k) }))].map(tab => (
            <button key={tab.k} onClick={() => setActive(tab.k as any)}
              className={`px-4 py-1.5 rounded-full text-[13px] font-medium border transition-all ${active === tab.k ? 'bg-green-deep text-white border-green-deep' : 'bg-white text-gray-500 border-gray-200 hover:border-gray-400'}`}>
              {tab.l}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="border border-border rounded-xl p-14 bg-bg-alt text-center text-[14px] text-gray-500">
            {t('아직 게시된 뉴스가 없습니다.', 'No news published yet.')}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.map(c => (
              <a key={c.id} href={c.url} target="_blank" rel="noopener noreferrer"
                className="border border-border rounded-xl p-6 bg-white hover:border-green-deep hover:shadow-sm transition-all group">
                <div className="flex items-center gap-2 mb-2.5">
                  <span className="text-[11px] font-bold text-green-deep bg-green-pale px-2 py-0.5 rounded">{label(c.theme)}</span>
                  <span className="text-[12px] text-gray-400">{c.source}</span>
                  <span className="text-[12px] text-gray-300 ml-auto">{c.publishedAt?.slice(0, 10)}</span>
                </div>
                <h3 className="text-[15.5px] font-semibold text-gray-900 leading-snug group-hover:text-green-deep">{(lang === 'en' ? c.titleEn : c.titleKo) || c.title}</h3>
                {c.excerpt && <p className="text-[13px] text-gray-500 mt-2 line-clamp-2 leading-relaxed">{c.excerpt}</p>}
              </a>
            ))}
          </div>
        )}

        {/* Subscribe */}
        <div id="subscribe" className="scroll-mt-24 mt-16 bg-green-deep text-white rounded-2xl px-8 py-10 md:px-12">
          <h2 className="text-[22px] font-bold tracking-tight">{t('뉴스레터로 받아보기', 'Get it in your inbox')}</h2>
          <p className="mt-2 text-[13.5px] text-white/60">{t('주요 뉴스클리핑을 정기적으로 보내드립니다.', 'We send the key clips to your inbox regularly.')}</p>
          <SubscribeForm />
        </div>
      </div>
    </div>
  );
}

function SubscribeForm() {
  const { t } = useLang();
  const [email, setEmail] = useState('');
  const [state, setState] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setState('loading');
    try {
      const r = await fetch('/api/newsletter', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }),
      });
      setState(r.ok ? 'done' : 'error');
    } catch { setState('error'); }
  }

  if (state === 'done') return <p className="mt-5 text-[14px] font-medium">{t('구독해 주셔서 감사합니다.', 'Thanks for subscribing.')}</p>;

  return (
    <form onSubmit={submit} className="mt-5 flex flex-col sm:flex-row gap-3 max-w-[460px]">
      <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
        placeholder={t('이메일 주소', 'Email address')}
        className="flex-1 px-4 py-2.5 rounded-lg text-gray-900 text-[14px] outline-none" />
      <button type="submit" disabled={state === 'loading'}
        className="px-6 py-2.5 bg-white text-green-deep text-[14px] font-bold rounded-lg hover:bg-white/90 disabled:opacity-60">
        {state === 'loading' ? t('처리 중…', 'Sending…') : t('구독', 'Subscribe')}
      </button>
    </form>
  );
}
