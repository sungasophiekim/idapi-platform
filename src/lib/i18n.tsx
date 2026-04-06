// src/lib/i18n.tsx
'use client';

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { Lang } from '@/types';

interface I18nCtx {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (ko: string, en: string) => string;
  bi: (ko: string | null | undefined, en: string | null | undefined) => string;
}

const Ctx = createContext<I18nCtx>({
  lang: 'ko', setLang: () => {}, t: (ko) => ko, bi: (ko) => ko || '',
});

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>('ko');

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    document.documentElement.lang = l === 'ko' ? 'ko' : 'en';
  }, []);

  const t = useCallback((ko: string, en: string) => lang === 'en' ? en : ko, [lang]);
  const bi = useCallback((ko: string | null | undefined, en: string | null | undefined) => {
    if (lang === 'en') return en || ko || '';
    return ko || en || '';
  }, [lang]);

  return <Ctx.Provider value={{ lang, setLang, t, bi }}>{children}</Ctx.Provider>;
}

export const useLang = () => useContext(Ctx);
