// src/modules/news-clip/themes.ts
// 7 watch themes for the News Clipping feed + keyword-driven classifier.
// Mirrors the taxonomy.ts pattern but scoped to industry-media news, not bills.

export const CLIP_THEMES = {
  RWA:              { ko: 'RWA·실물자산 토큰화',   en: 'RWA / Tokenization' },
  STABLECOIN:       { ko: '스테이블코인',          en: 'Stablecoin' },
  DA_FIN_INFRA:     { ko: '디지털자산 금융인프라', en: 'Digital Asset Fin-Infra' },
  AI_AGENT_PAYMENT: { ko: 'AI 에이전트 페이먼트',  en: 'AI Agent Payments' },
  AI_FIN_INFRA:     { ko: 'AI 금융인프라',         en: 'AI Financial Infra' },
  SOVEREIGN_AI:     { ko: '소버린 AI',             en: 'Sovereign AI' },
  AI_PUBLIC_POLICY: { ko: 'AI 공공정책 활용',      en: 'AI in Public Policy' },
} as const;

export type ClipTheme = keyof typeof CLIP_THEMES;

const KEYWORDS: Record<ClipTheme, string[]> = {
  RWA: ['rwa', 'real world asset', 'real-world asset', 'tokenized asset', 'asset tokenization', 'tokenized treasury', 'tokenized fund', '실물자산', '토큰화', '실물연계'],
  STABLECOIN: ['stablecoin', 'stable coin', '스테이블코인', 'tokenized deposit', 'usdc', 'usdt', 'pyusd', '예치금 토큰', '지급결제 토큰'],
  DA_FIN_INFRA: ['digital asset infrastructure', 'crypto custody', 'digital asset custody', 'settlement layer', 'on-chain finance', 'onchain finance', 'tokenized securities', 'digital securities', '수탁', '청산결제', '디지털자산 인프라', 'sto'],
  AI_AGENT_PAYMENT: ['ai agent payment', 'agentic payment', 'agentic commerce', 'agent payment', 'x402', 'autonomous payment', 'machine payment', 'machine-to-machine payment', 'agent wallet', 'ai 결제', '에이전트 결제'],
  AI_FIN_INFRA: ['ai financial infrastructure', 'ai in finance', 'ai banking', 'ai trading', 'ai underwriting', 'ai for payments', 'ai risk', '금융 ai', 'ai 금융'],
  SOVEREIGN_AI: ['sovereign ai', 'ai sovereignty', 'national ai', 'domestic ai', 'ai independence', '소버린 ai', '국가 ai', '주권 ai'],
  AI_PUBLIC_POLICY: ['ai in government', 'ai public sector', 'public ai', 'ai policy', 'ai regulation', 'ai governance', 'government ai', 'ai act', '공공 ai', 'ai 행정', 'ai 공공', 'ai 정책'],
};

// Priority: more specific / novel themes win over broad ones when co-occurring.
const PRIORITY: ClipTheme[] = ['AI_AGENT_PAYMENT', 'SOVEREIGN_AI', 'RWA', 'STABLECOIN', 'AI_FIN_INFRA', 'DA_FIN_INFRA', 'AI_PUBLIC_POLICY'];

const ALL_KEYWORDS = (Object.keys(KEYWORDS) as ClipTheme[]).flatMap(k => KEYWORDS[k]);

/** True if the text matches any watch theme (collection filter). */
export function isRelevant(text: string): boolean {
  const lower = (text || '').toLowerCase();
  return ALL_KEYWORDS.some(kw => lower.includes(kw));
}

/** Best-match theme for a clip, or null if it matches none (skip). */
export function classifyClip(text: string): ClipTheme | null {
  const lower = (text || '').toLowerCase();
  for (const theme of PRIORITY) {
    if (KEYWORDS[theme].some(kw => lower.includes(kw))) return theme;
  }
  return null;
}
