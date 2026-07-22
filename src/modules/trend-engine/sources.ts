// src/modules/trend-engine/sources.ts
// Curated RSS feed registry for digital asset policy monitoring
// Organized by jurisdiction and source type

export interface RssSource {
  id: string;
  name: string;
  nameKo: string;
  url: string;
  jurisdiction: string;   // KR, US, EU, SG, JP, UK, HK, INTL, MEDIA
  type: 'government' | 'regulator' | 'legislature' | 'intl_org' | 'media' | 'research';
  weight: number;          // Source authority weight for trend scoring (0.5 - 3.0)
  lang: 'ko' | 'en' | 'ja' | 'zh';
  tags: string[];          // Default topic tags
  active: boolean;
}

export const RSS_SOURCES: RssSource[] = [
  // ═══ KOREA (KR) ═══
  {
    id: 'kr-fsc',
    name: 'Financial Services Commission (FSC)',
    nameKo: '금융위원회 보도자료',
    url: 'https://www.fsc.go.kr/about/fsc_bbs_rss/?fid=0111',
    jurisdiction: 'KR', type: 'regulator', weight: 3.0, lang: 'ko',
    tags: ['korea-regulation', 'fsc'], active: true,
  },
  {
    id: 'kr-fss',
    name: 'Financial Supervisory Service (FSS)',
    nameKo: '금융감독원 보도자료',
    url: 'https://news.google.com/rss/search?q=site:fss.or.kr&hl=ko&gl=KR&ceid=KR:ko',
    jurisdiction: 'KR', type: 'regulator', weight: 2.8, lang: 'ko',
    tags: ['korea-regulation', 'fss', 'supervision'], active: true,
  },
  {
    id: 'kr-assembly',
    name: 'National Assembly Legislation',
    nameKo: '국회 의안정보',
    url: 'https://news.google.com/rss/search?q=site:assembly.go.kr+의안&hl=ko&gl=KR&ceid=KR:ko',
    jurisdiction: 'KR', type: 'legislature', weight: 2.5, lang: 'ko',
    tags: ['korea-legislation', 'bills'], active: true,
  },
  {
    id: 'kr-moleg',
    name: 'Ministry of Legislation',
    nameKo: '법제처 입법예고',
    url: 'https://news.google.com/rss/search?q=site:moleg.go.kr&hl=ko&gl=KR&ceid=KR:ko',
    jurisdiction: 'KR', type: 'government', weight: 2.5, lang: 'ko',
    tags: ['korea-legislation', 'regulatory-notice'], active: true,
  },
  {
    id: 'kr-bok',
    name: 'Bank of Korea',
    nameKo: '한국은행 보도자료',
    url: 'https://news.google.com/rss/search?q=site:bok.or.kr&hl=ko&gl=KR&ceid=KR:ko',
    jurisdiction: 'KR', type: 'regulator', weight: 2.0, lang: 'ko',
    tags: ['cbdc', 'monetary-policy', 'bok'], active: true,
  },

  // ═══ UNITED STATES (US) ═══
  {
    id: 'us-sec-press',
    name: 'SEC Press Releases',
    nameKo: 'SEC 보도자료',
    url: 'https://news.google.com/rss/search?q=site:sec.gov+%22press+release%22&hl=en-US&gl=US&ceid=US:en',
    jurisdiction: 'US', type: 'regulator', weight: 3.0, lang: 'en',
    tags: ['sec', 'us-regulation', 'securities'], active: true,
  },
  {
    id: 'us-sec-rules',
    name: 'SEC Proposed Rules',
    nameKo: 'SEC 규칙 제안',
    url: 'https://news.google.com/rss/search?q=site:sec.gov+%22proposed+rule%22&hl=en-US&gl=US&ceid=US:en',
    jurisdiction: 'US', type: 'regulator', weight: 3.0, lang: 'en',
    tags: ['sec', 'rulemaking'], active: true,
  },
  {
    id: 'us-cftc',
    name: 'CFTC Press Releases',
    nameKo: 'CFTC 보도자료',
    url: 'https://news.google.com/rss/search?q=site:cftc.gov&hl=en-US&gl=US&ceid=US:en',
    jurisdiction: 'US', type: 'regulator', weight: 2.8, lang: 'en',
    tags: ['cftc', 'us-regulation', 'derivatives'], active: true,
  },
  {
    id: 'us-treasury',
    name: 'US Treasury Press Releases',
    nameKo: '미 재무부 보도자료',
    url: 'https://news.google.com/rss/search?q=site:home.treasury.gov&hl=en-US&gl=US&ceid=US:en',
    jurisdiction: 'US', type: 'government', weight: 2.5, lang: 'en',
    tags: ['treasury', 'stablecoin', 'sanctions'], active: true,
  },
  {
    id: 'us-fed',
    name: 'Federal Reserve Press',
    nameKo: '연준 보도자료',
    url: 'https://www.federalreserve.gov/feeds/press_all.xml',
    jurisdiction: 'US', type: 'regulator', weight: 2.5, lang: 'en',
    tags: ['fed', 'cbdc', 'monetary-policy'], active: true,
  },
  {
    id: 'us-congress',
    name: 'Congress.gov - Blockchain Bills',
    nameKo: '미 의회 블록체인 관련 법안',
    url: 'https://www.congress.gov/rss/most-viewed-bills.xml',
    jurisdiction: 'US', type: 'legislature', weight: 2.0, lang: 'en',
    tags: ['us-legislation', 'congress'], active: true,
  },

  // ═══ EUROPEAN UNION (EU) ═══
  {
    id: 'eu-eba',
    name: 'European Banking Authority',
    nameKo: 'EBA 보도자료',
    url: 'https://www.eba.europa.eu/rss.xml',
    jurisdiction: 'EU', type: 'regulator', weight: 2.8, lang: 'en',
    tags: ['eba', 'mica', 'eu-regulation'], active: true,
  },
  {
    id: 'eu-esma',
    name: 'ESMA Press Releases',
    nameKo: 'ESMA 보도자료',
    url: 'https://www.esma.europa.eu/rss.xml',
    jurisdiction: 'EU', type: 'regulator', weight: 2.8, lang: 'en',
    tags: ['esma', 'mica', 'eu-regulation', 'casp'], active: true,
  },
  {
    id: 'eu-ecb',
    name: 'European Central Bank',
    nameKo: 'ECB 보도자료',
    url: 'https://www.ecb.europa.eu/rss/press.html',
    jurisdiction: 'EU', type: 'regulator', weight: 2.5, lang: 'en',
    tags: ['ecb', 'digital-euro', 'cbdc'], active: true,
  },

  // ═══ SINGAPORE (SG) ═══
  {
    id: 'sg-mas',
    name: 'Monetary Authority of Singapore',
    nameKo: 'MAS 보도자료',
    url: 'https://news.google.com/rss/search?q=site:mas.gov.sg&hl=en-US&gl=US&ceid=US:en',
    jurisdiction: 'SG', type: 'regulator', weight: 2.8, lang: 'en',
    tags: ['mas', 'singapore', 'psa', 'licensing'], active: true,
  },

  // ═══ JAPAN (JP) ═══
  {
    id: 'jp-fsa',
    name: 'Japan FSA Press',
    nameKo: '일본 금융청 보도자료',
    url: 'https://www.fsa.go.jp/fsaEnNewsList_rss2.xml',
    jurisdiction: 'JP', type: 'regulator', weight: 2.5, lang: 'en',
    tags: ['fsa-japan', 'japan-regulation'], active: true,
  },

  // ═══ UK ═══
  {
    id: 'uk-fca',
    name: 'Financial Conduct Authority',
    nameKo: 'FCA 보도자료',
    url: 'https://www.fca.org.uk/news/rss.xml',
    jurisdiction: 'UK', type: 'regulator', weight: 2.5, lang: 'en',
    tags: ['fca', 'uk-regulation'], active: true,
  },
  {
    id: 'uk-boe',
    name: 'Bank of England',
    nameKo: '영란은행 보도자료',
    url: 'https://www.bankofengland.co.uk/rss/news',
    jurisdiction: 'UK', type: 'regulator', weight: 2.0, lang: 'en',
    tags: ['boe', 'cbdc', 'digital-pound'], active: true,
  },

  // ═══ HONG KONG (HK) ═══
  {
    id: 'hk-sfc',
    name: 'Securities and Futures Commission',
    nameKo: '홍콩 SFC 보도자료',
    url: 'https://news.google.com/rss/search?q=site:sfc.hk&hl=en-US&gl=US&ceid=US:en',
    jurisdiction: 'HK', type: 'regulator', weight: 2.5, lang: 'en',
    tags: ['sfc-hk', 'vasp', 'hong-kong'], active: true,
  },

  // ═══ INTERNATIONAL ORGANIZATIONS (INTL) ═══
  {
    id: 'intl-fatf',
    name: 'FATF Publications',
    nameKo: 'FATF 발간물',
    url: 'https://news.google.com/rss/search?q=site:fatf-gafi.org&hl=en-US&gl=US&ceid=US:en',
    jurisdiction: 'INTL', type: 'intl_org', weight: 2.5, lang: 'en',
    tags: ['fatf', 'aml', 'travel-rule'], active: true,
  },
  {
    id: 'intl-bis',
    name: 'Bank for International Settlements',
    nameKo: 'BIS 발간물',
    url: 'https://www.bis.org/doclist/all_pressrels.rss',
    jurisdiction: 'INTL', type: 'intl_org', weight: 2.0, lang: 'en',
    tags: ['bis', 'cbdc', 'cross-border'], active: true,
  },
  {
    id: 'intl-iosco',
    name: 'IOSCO Media Releases',
    nameKo: 'IOSCO 보도자료',
    url: 'https://news.google.com/rss/search?q=site:iosco.org&hl=en-US&gl=US&ceid=US:en',
    jurisdiction: 'INTL', type: 'intl_org', weight: 2.0, lang: 'en',
    tags: ['iosco', 'securities', 'global-standards'], active: true,
  },

  // ═══ CRYPTO-SPECIFIC MEDIA ═══
  {
    id: 'media-coindesk',
    name: 'CoinDesk Policy',
    nameKo: 'CoinDesk 정책 뉴스',
    url: 'https://news.google.com/rss/search?q=site:coindesk.com+policy+OR+regulation&hl=en-US&gl=US&ceid=US:en',
    jurisdiction: 'MEDIA', type: 'media', weight: 1.5, lang: 'en',
    tags: ['crypto-news', 'policy'], active: true,
  },
  {
    id: 'media-theblock',
    name: 'The Block Policy',
    nameKo: 'The Block 정책 뉴스',
    url: 'https://www.theblock.co/rss.xml',
    jurisdiction: 'MEDIA', type: 'media', weight: 1.5, lang: 'en',
    tags: ['crypto-news', 'policy'], active: true,
  },
  {
    id: 'media-cointelegraph',
    name: 'Cointelegraph Regulation',
    nameKo: 'Cointelegraph 규제 뉴스',
    url: 'https://news.google.com/rss/search?q=site:cointelegraph.com+regulation&hl=en-US&gl=US&ceid=US:en',
    jurisdiction: 'MEDIA', type: 'media', weight: 1.0, lang: 'en',
    tags: ['crypto-news', 'regulation'], active: true,
  },
  {
    id: 'media-blockmedia',
    name: 'Block Media (Korea)',
    nameKo: '블록미디어',
    url: 'https://www.blockmedia.co.kr/feed/',
    jurisdiction: 'KR', type: 'media', weight: 1.2, lang: 'ko',
    tags: ['crypto-news', 'korea'], active: true,
  },
  {
    id: 'media-decenter',
    name: 'Decenter (Korea)',
    nameKo: '디센터',
    url: 'https://news.google.com/rss/search?q=site:decenter.kr&hl=ko&gl=KR&ceid=KR:ko',
    jurisdiction: 'KR', type: 'media', weight: 1.2, lang: 'ko',
    tags: ['crypto-news', 'korea'], active: true,
  },

  // ═══ RESEARCH / THINK TANKS ═══
  {
    id: 'research-bpi',
    name: 'Bitcoin Policy Institute',
    nameKo: 'Bitcoin Policy Institute',
    url: 'https://news.google.com/rss/search?q=%22Bitcoin+Policy+Institute%22&hl=en-US&gl=US&ceid=US:en',
    jurisdiction: 'US', type: 'research', weight: 1.5, lang: 'en',
    tags: ['bitcoin', 'policy-research'], active: true,
  },

  // ═══ NEWS-CLIP MEDIA — AI & digital-asset infrastructure ═══
  {
    id: 'clip-coindesk',
    name: 'CoinDesk',
    nameKo: 'CoinDesk',
    url: 'https://www.coindesk.com/arc/outboundfeeds/rss/',
    jurisdiction: 'MEDIA', type: 'media', weight: 1.5, lang: 'en',
    tags: ['crypto-news', 'rwa', 'stablecoin'], active: true,
  },
  {
    id: 'clip-decrypt',
    name: 'Decrypt',
    nameKo: 'Decrypt',
    url: 'https://decrypt.co/feed',
    jurisdiction: 'MEDIA', type: 'media', weight: 1.2, lang: 'en',
    tags: ['crypto-news', 'ai'], active: true,
  },
  {
    id: 'clip-dlnews',
    name: 'DL News',
    nameKo: 'DL News',
    url: 'https://www.dlnews.com/arc/outboundfeeds/rss/',
    jurisdiction: 'MEDIA', type: 'media', weight: 1.2, lang: 'en',
    tags: ['crypto-news', 'defi', 'rwa'], active: true,
  },
  {
    id: 'clip-ledgerinsights',
    name: 'Ledger Insights',
    nameKo: 'Ledger Insights',
    url: 'https://www.ledgerinsights.com/feed/',
    jurisdiction: 'MEDIA', type: 'media', weight: 1.4, lang: 'en',
    tags: ['tokenization', 'rwa', 'enterprise'], active: true,
  },
  {
    id: 'clip-thedefiant',
    name: 'The Defiant',
    nameKo: 'The Defiant',
    url: 'https://thedefiant.io/api/feed',
    jurisdiction: 'MEDIA', type: 'media', weight: 1.0, lang: 'en',
    tags: ['defi', 'onchain-finance'], active: true,
  },
  {
    id: 'clip-venturebeat-ai',
    name: 'VentureBeat AI',
    nameKo: 'VentureBeat AI',
    url: 'https://venturebeat.com/category/ai/feed/',
    jurisdiction: 'MEDIA', type: 'media', weight: 1.2, lang: 'en',
    tags: ['ai', 'ai-infra', 'ai-agents'], active: true,
  },
  {
    id: 'clip-mit-tech-review',
    name: 'MIT Technology Review',
    nameKo: 'MIT Technology Review',
    url: 'https://www.technologyreview.com/feed/',
    jurisdiction: 'MEDIA', type: 'media', weight: 1.5, lang: 'en',
    tags: ['ai', 'sovereign-ai', 'ai-policy'], active: true,
  },

  // ═══ GOOGLE NEWS — targeted per-theme coverage (reliable, fills gaps) ═══
  // Each query is theme-scoped; the isRelevant/classifyClip filter keeps precision.
  {
    id: 'gn-rwa', name: 'Google News · RWA', nameKo: '구글뉴스 · RWA',
    url: 'https://news.google.com/rss/search?q=%22real+world+asset%22+OR+%22asset+tokenization%22&hl=en-US&gl=US&ceid=US:en',
    jurisdiction: 'MEDIA', type: 'media', weight: 1.0, lang: 'en', tags: ['rwa'], active: true,
  },
  {
    id: 'gn-stablecoin', name: 'Google News · Stablecoin', nameKo: '구글뉴스 · 스테이블코인',
    url: 'https://news.google.com/rss/search?q=stablecoin+OR+%22tokenized+deposit%22&hl=en-US&gl=US&ceid=US:en',
    jurisdiction: 'MEDIA', type: 'media', weight: 1.0, lang: 'en', tags: ['stablecoin'], active: true,
  },
  {
    id: 'gn-ai-agent-pay', name: 'Google News · AI Agent Payments', nameKo: '구글뉴스 · AI 에이전트 결제',
    url: 'https://news.google.com/rss/search?q=%22AI+agent%22+payment+OR+%22agentic+commerce%22+OR+x402&hl=en-US&gl=US&ceid=US:en',
    jurisdiction: 'MEDIA', type: 'media', weight: 1.0, lang: 'en', tags: ['ai-agent-payment'], active: true,
  },
  {
    id: 'gn-ai-fin-infra', name: 'Google News · AI Finance', nameKo: '구글뉴스 · AI 금융',
    url: 'https://news.google.com/rss/search?q=%22AI%22+%22financial+infrastructure%22+OR+%22AI+in+finance%22&hl=en-US&gl=US&ceid=US:en',
    jurisdiction: 'MEDIA', type: 'media', weight: 1.0, lang: 'en', tags: ['ai-fin-infra'], active: true,
  },
  {
    id: 'gn-sovereign-ai', name: 'Google News · Sovereign AI', nameKo: '구글뉴스 · 소버린 AI',
    url: 'https://news.google.com/rss/search?q=%22sovereign+AI%22+OR+%22AI+sovereignty%22&hl=en-US&gl=US&ceid=US:en',
    jurisdiction: 'MEDIA', type: 'media', weight: 1.0, lang: 'en', tags: ['sovereign-ai'], active: true,
  },
  {
    id: 'gn-ai-policy', name: 'Google News · AI Policy', nameKo: '구글뉴스 · AI 정책',
    url: 'https://news.google.com/rss/search?q=%22AI+policy%22+government+OR+%22AI+regulation%22&hl=en-US&gl=US&ceid=US:en',
    jurisdiction: 'MEDIA', type: 'media', weight: 1.0, lang: 'en', tags: ['ai-public-policy'], active: true,
  },
  {
    id: 'gn-ai-kr', name: 'Google News · AI 정책 (KR)', nameKo: '구글뉴스 · AI 정책(한국)',
    url: 'https://news.google.com/rss/search?q=AI+정책+OR+인공지능+공공+OR+AI+결제&hl=ko&gl=KR&ceid=KR:ko',
    jurisdiction: 'MEDIA', type: 'media', weight: 1.0, lang: 'ko', tags: ['ai-public-policy'], active: true,
  },
];

// Helper: get active sources only
export function getActiveSources(): RssSource[] {
  return RSS_SOURCES.filter(s => s.active);
}

// Helper: get sources by jurisdiction
export function getSourcesByJurisdiction(j: string): RssSource[] {
  return RSS_SOURCES.filter(s => s.active && s.jurisdiction === j);
}
