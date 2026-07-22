// src/modules/taxonomy.ts
// Single source of truth for iDAPI's 5 focus areas:
//   collection keywords (KO/EN/JA) + a shared derived classifier.
// Storage note: the Prisma `ResearchArea` enum is legacy (4 values) and is NOT
// changed here. `classifyTheme()` is a DISPLAY-TIME derivation — no DB migration.

export const THEMES = {
  AI_GOVERNANCE:     { ko: 'AI 거버넌스·규제',        en: 'AI Governance & Regulation' },
  DPI:               { ko: '디지털 공공인프라(DPI)',   en: 'Digital Public Infrastructure' },
  DIGITAL_IDENTITY:  { ko: '디지털 신원·신뢰',         en: 'Digital Identity & Trust' },
  DATA_GOVERNANCE:   { ko: '데이터 거버넌스·프라이버시', en: 'Data Governance & Privacy' },
  DIGITAL_ASSETS:    { ko: '디지털 자산·토큰화 인프라', en: 'Digital Assets & Tokenized Infra' },
} as const;

export type ThemeKey = keyof typeof THEMES;

// Per-theme keyword banks. `all` = KO ∪ EN ∪ JA used for both collection
// filtering (widen intake) and classification (assign a theme).
export const THEME_KEYWORDS: Record<ThemeKey, { ko: string[]; en: string[]; ja: string[] }> = {
  AI_GOVERNANCE: {
    ko: ['인공지능', '알고리즘', '자동화 의사결정', '자동화의사결정', 'AI 기본법', 'AI기본법', '생성형', '머신러닝', '딥러닝'],
    en: ['artificial intelligence', 'ai act', 'ai regulation', 'algorithm', 'algorithmic accountability', 'automated decision', 'machine learning', 'generative ai', 'foundation model'],
    ja: ['人工知能', 'ai', 'ai規制', '機械学習', '生成ai', 'アルゴリズム'],
  },
  DPI: {
    ko: ['디지털플랫폼정부', '디지털 공공', '공공데이터', '상호운용', '전자정부', '디지털 인프라'],
    en: ['digital public infrastructure', 'e-government', 'digital government', 'govtech', 'interoperability', 'data exchange', 'public digital'],
    ja: ['デジタル庁', '電子政府', '公共データ', '相互運用'],
  },
  DIGITAL_IDENTITY: {
    ko: ['디지털 신원', '전자서명', '본인확인', '분산신원', 'DID', '디지털 신분', '인증'],
    en: ['digital identity', 'digital id', 'verifiable credential', 'electronic identification', 'e-signature', 'eid', 'authentication'],
    ja: ['マイナンバー', 'デジタル身分', 'デジタルid', '電子署名', '本人確認'],
  },
  DATA_GOVERNANCE: {
    ko: ['데이터 거버넌스', '마이데이터', '개인정보', '데이터 이동', '데이터경제', '데이터3법', '프라이버시'],
    en: ['data governance', 'data protection', 'privacy', 'personal data', 'data portability', 'consumer data', 'gdpr'],
    ja: ['個人情報', 'データ保護', 'プライバシー', 'データ移転'],
  },
  DIGITAL_ASSETS: {
    ko: ['가상자산', '디지털자산', '암호화폐', '가상화폐', '블록체인', '토큰증권', '스테이블코인', '디지털화폐', '중앙은행디지털', '코인', '거래소', 'NFT', '분산원장', '디파이', 'DeFi', '토큰', '디지털금융', '핀테크', '전자증권', 'STO', 'ICO', '비트코인', 'CBDC', 'DAO', 'VASP', '메타버스', '암호자산'],
    en: ['crypto', 'digital asset', 'virtual asset', 'blockchain', 'stablecoin', 'token', 'cryptocurrency', 'cbdc', 'decentralized finance', 'defi', 'nft', 'distributed ledger', 'securities token', 'tokeniz', 'digital currency', 'crypto asset', 'bitcoin', 'virtual currency', 'vasp'],
    ja: ['仮想通貨', '暗号資産', 'ブロックチェーン', 'ステーブルコイン', 'デジタル資産', 'トークン', '暗号通貨', 'dao', 'nft'],
  },
};

// Classification priority: when a text matches multiple themes, the earlier
// theme wins. Digital assets is last so AI/identity/data/DPI take precedence
// over the (very common) crypto vocabulary.
const PRIORITY: ThemeKey[] = ['AI_GOVERNANCE', 'DIGITAL_IDENTITY', 'DATA_GOVERNANCE', 'DPI', 'DIGITAL_ASSETS'];

function langKeys(lang: 'ko' | 'en' | 'ja'): string[] {
  return (Object.keys(THEME_KEYWORDS) as ThemeKey[]).flatMap(k => THEME_KEYWORDS[k][lang]);
}

export const KEYWORDS_KO = langKeys('ko');
export const KEYWORDS_EN = langKeys('en');
export const KEYWORDS_JA = langKeys('ja');

/** Best-match focus area for a piece of text (title/tags). Never null. */
export function classifyTheme(text: string): ThemeKey {
  const lower = (text || '').toLowerCase();
  for (const theme of PRIORITY) {
    const bank = THEME_KEYWORDS[theme];
    const hit = [...bank.ko, ...bank.en, ...bank.ja].some(kw => lower.includes(kw.toLowerCase()));
    if (hit) return theme;
  }
  return 'DIGITAL_ASSETS'; // legacy corpus default
}

/** True if the text is relevant to any focus area (collection filter). */
export function isRelevant(text: string): boolean {
  const lower = (text || '').toLowerCase();
  return [...KEYWORDS_KO, ...KEYWORDS_EN, ...KEYWORDS_JA].some(kw => lower.includes(kw.toLowerCase()));
}
