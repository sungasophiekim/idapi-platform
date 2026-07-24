// src/types/index.ts
// Shared types, constants, and i18n helpers

export const CATEGORIES = {
  COMMENTARY:    { ko: '논평',       en: 'Commentary' },
  POLICY_BRIEF:  { ko: '정책브리프', en: 'Policy Brief' },
  PRESS_RELEASE: { ko: '보도자료',   en: 'Press Release' },
  SEMINAR:       { ko: '세미나',     en: 'Seminar' },
  REPORT:        { ko: '보고서',     en: 'Report' },
} as const;

export const RESEARCH_AREAS = {
  AI_GOVERNANCE:    { ko: 'AI 거버넌스·규제',      en: 'AI Governance' },
  DPI:              { ko: '디지털 공공인프라',     en: 'Digital Public Infrastructure' },
  DIGITAL_IDENTITY: { ko: '디지털 신원·신뢰',      en: 'Digital Identity' },
  DATA_GOVERNANCE:  { ko: '데이터 거버넌스·프라이버시', en: 'Data Governance' },
  DIGITAL_ASSETS:   { ko: '디지털 자산·토큰화',    en: 'Digital Assets' },
} as const;

export type Lang = 'ko' | 'en';

export function t(obj: { ko: string; en: string } | undefined, lang: Lang): string {
  if (!obj) return '';
  return lang === 'en' ? obj.en : obj.ko;
}

// Bilingual field helper — picks the right language version
export function bi(ko: string | null, en: string | null, lang: Lang): string {
  if (lang === 'en') return en || ko || '';
  return ko || en || '';
}
