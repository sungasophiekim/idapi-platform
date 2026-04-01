'use client';

import { useState, useCallback } from 'react';

export type Lang = 'ko' | 'en';

export function useLang() {
  const [lang, setLang] = useState<Lang>('ko');

  const t = useCallback((ko: string, en: string) => {
    return lang === 'en' ? en : ko;
  }, [lang]);

  const bi = useCallback((ko: string | null | undefined, en: string | null | undefined) => {
    if (lang === 'en') return en || ko || '';
    return ko || en || '';
  }, [lang]);

  return { lang, setLang, t, bi };
}
