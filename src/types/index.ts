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
  KOREA_POLICY:    { ko: '한국 디지털자산 정책', en: 'DigitalAsset Policy KR' },
  DIGITAL_FINANCE: { ko: '디지털자산금융',       en: 'DigitalAsset Finance' },
  INFRASTRUCTURE:  { ko: '시장인프라',           en: 'Infrastructure' },
  INCLUSION:       { ko: '디지털임팩트 및 포용', en: 'Digital Impact & Inclusion' },
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
