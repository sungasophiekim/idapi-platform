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
  KOREA_POLICY:    { ko: 'AI·규제 정책',       en: 'AI & Regulatory Policy' },
  DIGITAL_FINANCE: { ko: '디지털 금융·자산',   en: 'Digital Finance & Assets' },
  INFRASTRUCTURE:  { ko: '기술·인프라',        en: 'Technology & Infrastructure' },
  INCLUSION:       { ko: '거버넌스·영향',      en: 'Governance & Impact' },
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
