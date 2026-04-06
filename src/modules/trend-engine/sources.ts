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
    url: 'https://www.fsc.go.kr/rss/po010101.do',
    jurisdiction: 'KR', type: 'regulator', weight: 3.0, lang: 'ko',
    tags: ['korea-regulation', 'fsc'], active: true,
  },
  {
    id: 'kr-fss',
    name: 'Financial Supervisory Service (FSS)',
    nameKo: '금융감독원 보도자료',
    url: 'https://www.fss.or.kr/fss/main/contents.do?menuNo=200218&bbsId=1289391180477',
    jurisdiction: 'KR', type: 'regulator', weight: 2.8, lang: 'ko',
    tags: ['korea-regulation', 'fss', 'supervision'], active: true,
  },
  {
    id: 'kr-assembly',
    name: 'National Assembly Legislation',
    nameKo: '국회 의안정보',
    url: 'https://likms.assembly.go.kr/bill/rss/recentBillRss.do',
    jurisdiction: 'KR', type: 'legislature', weight: 2.5, lang: 'ko',
    tags: ['korea-legislation', 'bills'], active: true,
  },
  {
    id: 'kr-moleg',
    name: 'Ministry of Legislation',
    nameKo: '법제처 입법예고',
    url: 'https://www.moleg.go.kr/rss/rssNoticeList.mo',
    jurisdiction: 'KR', type: 'government', weight: 2.5, lang: 'ko',
    tags: ['korea-legislation', 'regulatory-notice'], active: true,
  },
  {
    id: 'kr-bok',
    name: 'Bank of Korea',
    nameKo: '한국은행 보도자료',
    url: 'https://www.bok.or.kr/portal/bbs/B0000338/rss.do',
    jurisdiction: 'KR', type: 'regulator', weight: 2.0, lang: 'ko',
    tags: ['cbdc', 'monetary-policy', 'bok'], active: true,
  },

  // ═══ UNITED STATES (US) ═══
  {
    id: 'us-sec-press',
    name: 'SEC Press Releases',
    nameKo: 'SEC 보도자료',
    url: 'https://www.sec.gov/rss/news/press-releases.xml',
    jurisdiction: 'US', type: 'regulator', weight: 3.0, lang: 'en',
    tags: ['sec', 'us-regulation', 'securities'], active: true,
  },
  {
    id: 'us-sec-rules',
    name: 'SEC Proposed Rules',
    nameKo: 'SEC 규칙 제안',
    url: 'https://www.sec.gov/rss/news/proposed-rules.xml',
    jurisdiction: 'US', type: 'regulator', weight: 3.0, lang: 'en',
    tags: ['sec', 'rulemaking'], active: true,
  },
  {
    id: 'us-cftc',
    name: 'CFTC Press Releases',
    nameKo: 'CFTC 보도자료',
    url: 'https://www.cftc.gov/rss/pressreleases.xml',
    jurisdiction: 'US', type: 'regulator', weight: 2.8, lang: 'en',
    tags: ['cftc', 'us-regulation', 'derivatives'], active: true,
  },
  {
    id: 'us-treasury',
    name: 'US Treasury Press Releases',
    nameKo: '미 재무부 보도자료',
    url: 'https://home.treasury.gov/system/files/rss/press-releases.xml',
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
    url: 'https://www.esma.europa.eu/press-news/esma-news/feed',
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
    url: 'https://www.mas.gov.sg/rss/media-releases.xml',
    jurisdiction: 'SG', type: 'regulator', weight: 2.8, lang: 'en',
    tags: ['mas', 'singapore', 'psa', 'licensing'], active: true,
  },

  // ═══ JAPAN (JP) ═══
  {
    id: 'jp-fsa',
    name: 'Japan FSA Press',
    nameKo: '일본 금융청 보도자료',
    url: 'https://www.fsa.go.jp/en/rss/news.xml',
    jurisdiction: 'JP', type: 'regulator', weight: 2.5, lang: 'en',
    tags: ['fsa-japan', 'japan-regulation'], active: true,
  },

  // ═══ UK ═══
  {
    id: 'uk-fca',
    name: 'Financial Conduct Authority',
    nameKo: 'FCA 보도자료',
    url: 'https://www.fca.org.uk/rss/news',
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
    url: 'https://www.sfc.hk/en/rss/news.xml',
    jurisdiction: 'HK', type: 'regulator', weight: 2.5, lang: 'en',
    tags: ['sfc-hk', 'vasp', 'hong-kong'], active: true,
  },

  // ═══ INTERNATIONAL ORGANIZATIONS (INTL) ═══
  {
    id: 'intl-fatf',
    name: 'FATF Publications',
    nameKo: 'FATF 발간물',
    url: 'https://www.fatf-gafi.org/en/rss.xml',
    jurisdiction: 'INTL', type: 'intl_org', weight: 2.5, lang: 'en',
    tags: ['fatf', 'aml', 'travel-rule'], active: true,
  },
  {
    id: 'intl-bis',
    name: 'Bank for International Settlements',
    nameKo: 'BIS 발간물',
    url: 'https://www.bis.org/doclist/bis_rss.htm',
    jurisdiction: 'INTL', type: 'intl_org', weight: 2.0, lang: 'en',
    tags: ['bis', 'cbdc', 'cross-border'], active: true,
  },
  {
    id: 'intl-iosco',
    name: 'IOSCO Media Releases',
    nameKo: 'IOSCO 보도자료',
    url: 'https://www.iosco.org/news/rss.cfm',
    jurisdiction: 'INTL', type: 'intl_org', weight: 2.0, lang: 'en',
    tags: ['iosco', 'securities', 'global-standards'], active: true,
  },

  // ═══ CRYPTO-SPECIFIC MEDIA ═══
  {
    id: 'media-coindesk',
    name: 'CoinDesk Policy',
    nameKo: 'CoinDesk 정책 뉴스',
    url: 'https://www.coindesk.com/arc/outboundfeeds/rss/category/policy/',
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
    url: 'https://cointelegraph.com/rss/category/regulation',
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
    url: 'https://decenter.kr/rss/allArticle.xml',
    jurisdiction: 'KR', type: 'media', weight: 1.2, lang: 'ko',
    tags: ['crypto-news', 'korea'], active: true,
  },

  // ═══ RESEARCH / THINK TANKS ═══
  {
    id: 'research-bpi',
    name: 'Bitcoin Policy Institute',
    nameKo: 'Bitcoin Policy Institute',
    url: 'https://www.btcpolicy.org/rss.xml',
    jurisdiction: 'US', type: 'research', weight: 1.5, lang: 'en',
    tags: ['bitcoin', 'policy-research'], active: true,
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
