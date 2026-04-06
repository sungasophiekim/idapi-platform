// scripts/test-pipeline.ts
// Run: npx tsx scripts/test-pipeline.ts
// Tests the full trend pipeline with realistic mock data (no external deps)

import { scoreTrends, type ScoredTrend } from '../src/modules/trend-engine/scorer';
import type { ExtractedKeywords } from '../src/modules/trend-engine/extractor';
import type { CollectedArticle } from '../src/modules/trend-engine/collector';

// ─── Simulate 1 week of collected articles from various sources ───
const MOCK_ARTICLES: CollectedArticle[] = [
  // Korea — stablecoin & taxation heavy
  { sourceId: 'kr-fsc', sourceName: 'FSC', jurisdiction: 'KR', sourceWeight: 3.0, title: '가상자산 과세 2년 유예 확정…2027년 시행', link: 'https://fsc.go.kr/1', description: '정부가 가상자산 양도소득세 과세를 2027년으로 2년 유예하기로 최종 결정했다. 기획재정부는...', pubDate: new Date(Date.now() - 2 * 3600000), lang: 'ko', sourceTags: ['korea-regulation'] },
  { sourceId: 'kr-fsc', sourceName: 'FSC', jurisdiction: 'KR', sourceWeight: 3.0, title: '스테이블코인 발행 가이드라인 초안 발표', link: 'https://fsc.go.kr/2', description: '금융위원회가 원화 연동 스테이블코인의 발행 및 유통에 관한 가이드라인 초안을 발표했다.', pubDate: new Date(Date.now() - 6 * 3600000), lang: 'ko', sourceTags: ['korea-regulation'] },
  { sourceId: 'kr-assembly', sourceName: 'National Assembly', jurisdiction: 'KR', sourceWeight: 2.5, title: '디지털자산 기본법 정무위원회 통과', link: 'https://assembly.go.kr/1', description: '가상자산업권법으로 불리는 디지털자산 기본법안이 정무위원회를 통과했다. 토큰 분류체계와 거래소 라이선스를 규정.', pubDate: new Date(Date.now() - 12 * 3600000), lang: 'ko', sourceTags: ['korea-legislation'] },
  { sourceId: 'kr-fsc', sourceName: 'FSC', jurisdiction: 'KR', sourceWeight: 3.0, title: '가상자산사업자 실태점검 결과 발표', link: 'https://fsc.go.kr/3', description: '금감원이 국내 주요 가상자산사업자에 대한 실태점검 결과를 발표. 고객자산 분리보관 이행률 98%.', pubDate: new Date(Date.now() - 24 * 3600000), lang: 'ko', sourceTags: ['korea-regulation'] },
  { sourceId: 'media-blockmedia', sourceName: 'Block Media', jurisdiction: 'KR', sourceWeight: 1.2, title: '업비트, 스테이블코인 거래 서비스 준비 중', link: 'https://blockmedia.co.kr/1', description: '국내 최대 가상자산거래소 업비트가 원화 스테이블코인 거래 서비스를 준비 중인 것으로 알려졌다.', pubDate: new Date(Date.now() - 8 * 3600000), lang: 'ko', sourceTags: ['crypto-news'] },

  // US — stablecoin regulation + SEC
  { sourceId: 'us-sec-press', sourceName: 'SEC', jurisdiction: 'US', sourceWeight: 3.0, title: 'SEC Approves Framework for Tokenized Securities Trading', link: 'https://sec.gov/1', description: 'The Securities and Exchange Commission approved a new framework allowing registered exchanges to list and trade tokenized securities.', pubDate: new Date(Date.now() - 4 * 3600000), lang: 'en', sourceTags: ['sec', 'securities'] },
  { sourceId: 'us-sec-press', sourceName: 'SEC', jurisdiction: 'US', sourceWeight: 3.0, title: 'SEC Issues Updated Guidance on Stablecoin Classification', link: 'https://sec.gov/2', description: 'New guidance clarifies that payment stablecoins meeting specific criteria are not classified as securities under federal law.', pubDate: new Date(Date.now() - 18 * 3600000), lang: 'en', sourceTags: ['sec', 'stablecoin'] },
  { sourceId: 'us-treasury', sourceName: 'US Treasury', jurisdiction: 'US', sourceWeight: 2.5, title: 'Treasury Publishes Stablecoin Reserve Audit Requirements', link: 'https://treasury.gov/1', description: 'Under the GENIUS Act, stablecoin issuers must submit monthly reserve attestations and annual audits by registered firms.', pubDate: new Date(Date.now() - 36 * 3600000), lang: 'en', sourceTags: ['treasury', 'stablecoin'] },
  { sourceId: 'us-cftc', sourceName: 'CFTC', jurisdiction: 'US', sourceWeight: 2.8, title: 'CFTC Proposes Rules for Digital Asset Derivatives', link: 'https://cftc.gov/1', description: 'The Commodity Futures Trading Commission proposed new rules governing the trading of digital asset derivatives on regulated exchanges.', pubDate: new Date(Date.now() - 48 * 3600000), lang: 'en', sourceTags: ['cftc', 'derivatives'] },

  // EU — MiCA implementation
  { sourceId: 'eu-esma', sourceName: 'ESMA', jurisdiction: 'EU', sourceWeight: 2.8, title: 'ESMA Publishes MiCA Technical Standards for CASP Licensing', link: 'https://esma.europa.eu/1', description: 'The European Securities and Markets Authority released final technical standards for crypto-asset service provider licensing under MiCA.', pubDate: new Date(Date.now() - 10 * 3600000), lang: 'en', sourceTags: ['esma', 'mica'] },
  { sourceId: 'eu-eba', sourceName: 'EBA', jurisdiction: 'EU', sourceWeight: 2.8, title: 'EBA Issues Stablecoin Reserve Management Guidelines', link: 'https://eba.europa.eu/1', description: 'Guidelines specify reserve composition requirements for significant e-money tokens and asset-referenced tokens under MiCA.', pubDate: new Date(Date.now() - 30 * 3600000), lang: 'en', sourceTags: ['eba', 'stablecoin'] },

  // Singapore
  { sourceId: 'sg-mas', sourceName: 'MAS', jurisdiction: 'SG', sourceWeight: 2.8, title: 'MAS Finalizes Stablecoin Regulatory Framework', link: 'https://mas.gov.sg/1', description: 'The Monetary Authority of Singapore finalized its regulatory framework for single-currency stablecoins pegged to SGD or G10 currencies.', pubDate: new Date(Date.now() - 20 * 3600000), lang: 'en', sourceTags: ['mas', 'stablecoin'] },

  // Japan  
  { sourceId: 'jp-fsa', sourceName: 'Japan FSA', jurisdiction: 'JP', sourceWeight: 2.5, title: 'Japan FSA Amends Stablecoin Issuance Rules for Banks', link: 'https://fsa.go.jp/1', description: 'The Financial Services Agency amended regulations to allow banks and trust companies to issue yen-denominated stablecoins.', pubDate: new Date(Date.now() - 40 * 3600000), lang: 'en', sourceTags: ['fsa-japan', 'stablecoin'] },

  // International
  { sourceId: 'intl-fatf', sourceName: 'FATF', jurisdiction: 'INTL', sourceWeight: 2.5, title: 'FATF Updates Travel Rule Implementation Guidance', link: 'https://fatf-gafi.org/1', description: 'Updated guidance addresses challenges in implementing the Travel Rule for DeFi protocols and unhosted wallets.', pubDate: new Date(Date.now() - 72 * 3600000), lang: 'en', sourceTags: ['fatf', 'travel-rule'] },
  { sourceId: 'intl-bis', sourceName: 'BIS', jurisdiction: 'INTL', sourceWeight: 2.0, title: 'BIS Report on Cross-Border CBDC Payment Trials', link: 'https://bis.org/1', description: 'The Bank for International Settlements published results from Project mBridge cross-border CBDC experiments involving multiple central banks.', pubDate: new Date(Date.now() - 96 * 3600000), lang: 'en', sourceTags: ['bis', 'cbdc'] },

  // Media
  { sourceId: 'media-coindesk', sourceName: 'CoinDesk', jurisdiction: 'MEDIA', sourceWeight: 1.5, title: 'Stablecoin Regulation Heats Up: 5 Countries Race to Set Standards', link: 'https://coindesk.com/1', description: 'From the US GENIUS Act to EU MiCA and Singapore MAS framework, stablecoin regulation is the hottest policy topic of 2025.', pubDate: new Date(Date.now() - 5 * 3600000), lang: 'en', sourceTags: ['crypto-news'] },
  { sourceId: 'media-coindesk', sourceName: 'CoinDesk', jurisdiction: 'MEDIA', sourceWeight: 1.5, title: 'RWA Tokenization Hits $10B Milestone as Institutions Pile In', link: 'https://coindesk.com/2', description: 'Real-world asset tokenization crossed $10 billion in total value locked as BlackRock and JPMorgan expand their tokenized fund offerings.', pubDate: new Date(Date.now() - 28 * 3600000), lang: 'en', sourceTags: ['crypto-news'] },
  { sourceId: 'media-theblock', sourceName: 'The Block', jurisdiction: 'MEDIA', sourceWeight: 1.5, title: 'DeFi Protocols Face New KYC Requirements Under Updated FATF Guidance', link: 'https://theblock.co/1', description: 'The latest FATF guidance extends Travel Rule requirements to certain DeFi protocols, raising concerns about decentralization.', pubDate: new Date(Date.now() - 50 * 3600000), lang: 'en', sourceTags: ['crypto-news'] },
  { sourceId: 'media-cointelegraph', sourceName: 'Cointelegraph', jurisdiction: 'MEDIA', sourceWeight: 1.0, title: 'Korea Digital Asset Framework Act Advances to Committee Vote', link: 'https://cointelegraph.com/1', description: 'South Korea moves closer to comprehensive digital asset regulation as framework bill passes committee stage.', pubDate: new Date(Date.now() - 14 * 3600000), lang: 'en', sourceTags: ['crypto-news', 'regulation'] },
];

// ─── Simulate AI keyword extraction results ───
const MOCK_EXTRACTED: ExtractedKeywords[] = MOCK_ARTICLES.map(a => {
  // Simulate what Haiku would return for each article
  const title = a.title.toLowerCase();
  const desc = a.description.toLowerCase();
  const text = title + ' ' + desc;
  
  const keywords: string[] = [];
  const keywordsEn: string[] = [];
  let relevance = 7;
  let sentiment: 'positive' | 'negative' | 'neutral' = 'neutral';

  if (text.includes('stablecoin') || text.includes('스테이블코인')) { keywords.push('스테이블코인 규제'); keywordsEn.push('stablecoin regulation'); }
  if (text.includes('genius act')) { keywords.push('GENIUS Act'); keywordsEn.push('GENIUS Act'); }
  if (text.includes('mica')) { keywords.push('MiCA'); keywordsEn.push('MiCA'); }
  if (text.includes('과세') || text.includes('tax')) { keywords.push('가상자산 과세'); keywordsEn.push('digital asset taxation'); }
  if (text.includes('tokeniz') || text.includes('토큰화') || text.includes('rwa')) { keywords.push('RWA 토큰화'); keywordsEn.push('RWA tokenization'); }
  if (text.includes('travel rule') || text.includes('트래블룰')) { keywords.push('트래블룰'); keywordsEn.push('travel rule'); }
  if (text.includes('cbdc')) { keywords.push('CBDC'); keywordsEn.push('CBDC'); }
  if (text.includes('defi') || text.includes('디파이')) { keywords.push('DeFi 규제'); keywordsEn.push('DeFi regulation'); }
  if (text.includes('기본법') || text.includes('framework act')) { keywords.push('디지털자산 기본법'); keywordsEn.push('digital asset framework'); }
  if (text.includes('licensing') || text.includes('인가') || text.includes('casp')) { keywords.push('사업자 라이선스'); keywordsEn.push('VASP licensing'); }
  if (text.includes('sec ') || text.includes('securities')) { keywords.push('SEC 규제'); keywordsEn.push('SEC regulation'); }
  if (text.includes('derivatives') || text.includes('파생')) { keywords.push('파생상품 규제'); keywordsEn.push('derivatives regulation'); }
  if (text.includes('reserve') || text.includes('준비금')) { keywords.push('준비금 요건'); keywordsEn.push('reserve requirements'); }
  if (text.includes('실태점검') || text.includes('enforcement')) { keywords.push('감독 점검'); keywordsEn.push('supervisory review'); }

  if (text.includes('approve') || text.includes('finalize') || text.includes('통과')) sentiment = 'positive';
  if (text.includes('concern') || text.includes('restrict')) sentiment = 'negative';

  return {
    sourceId: a.sourceId,
    title: a.title,
    keywords,
    keywordsEn,
    jurisdiction: a.jurisdiction,
    sentiment,
    relevanceScore: keywords.length > 0 ? Math.min(10, 5 + keywords.length) : 3,
    sourceWeight: a.sourceWeight,
    pubDate: a.pubDate,
  };
});

// ─── Run the pipeline ───
function main() {
  console.log('\n🧪 IDAPI Trend Detection Pipeline — Full Test\n');
  console.log('═'.repeat(80));
  
  // Step 1: Input summary
  console.log(`\n📥 Step 1: Collected articles`);
  console.log(`   Total: ${MOCK_ARTICLES.length} articles from ${new Set(MOCK_ARTICLES.map(a => a.sourceId)).size} sources`);
  console.log(`   Jurisdictions: ${[...new Set(MOCK_ARTICLES.map(a => a.jurisdiction))].join(', ')}`);
  console.log(`   Date range: ${new Date(Math.min(...MOCK_ARTICLES.map(a => a.pubDate.getTime()))).toISOString().slice(0,10)} → ${new Date().toISOString().slice(0,10)}`);

  // Step 2: Extraction summary
  console.log(`\n🔍 Step 2: Keyword extraction`);
  const totalKeywords = MOCK_EXTRACTED.reduce((s, e) => s + e.keywordsEn.length, 0);
  const uniqueKeywords = [...new Set(MOCK_EXTRACTED.flatMap(e => e.keywordsEn))];
  console.log(`   Total keywords extracted: ${totalKeywords}`);
  console.log(`   Unique keywords: ${uniqueKeywords.length}`);
  console.log(`   Keywords: ${uniqueKeywords.join(', ')}`);
  console.log(`   Avg relevance: ${(MOCK_EXTRACTED.reduce((s, e) => s + e.relevanceScore, 0) / MOCK_EXTRACTED.length).toFixed(1)}/10`);

  // Step 3: Score
  console.log(`\n📊 Step 3: Trend scoring`);
  const trends = scoreTrends(MOCK_EXTRACTED);

  console.log(`   Trends detected: ${trends.length}`);
  console.log(`   Spikes: ${trends.filter(t => t.isSpike).length}`);
  console.log('');
  console.log('   Rank  Score  Mentions  Spike  Jurisdictions          Keyword');
  console.log('   ' + '─'.repeat(76));

  for (let i = 0; i < trends.length; i++) {
    const t = trends[i];
    const spike = t.isSpike ? '🔴' : '  ';
    const jur = t.jurisdictions.join(',').padEnd(22);
    console.log(`   ${String(i+1).padStart(2)}    ${String(t.score).padStart(3)}    ${String(t.mentions).padStart(4)}      ${spike}  ${jur} ${t.keywordEn}`);
  }

  // Step 4: Validate quality
  console.log(`\n✅ Step 4: Quality checks`);
  
  const checks = [
    { name: 'Stablecoin is top trend', pass: trends[0]?.keywordEn.toLowerCase().includes('stablecoin'), expected: 'Most mentioned across 5+ jurisdictions' },
    { name: 'Multi-jurisdiction boost works', pass: trends.some(t => t.jurisdictions.length >= 3 && t.score > 60), expected: 'Cross-border topics score higher' },
    { name: 'Government sources outweigh media', pass: (() => {
      const stableTrend = trends.find(t => t.keywordEn.includes('stablecoin'));
      return stableTrend ? stableTrend.topSources.some(s => s.startsWith('kr-') || s.startsWith('us-') || s.startsWith('eu-')) : false;
    })(), expected: 'FSC/SEC/ESMA sources rank above CoinDesk' },
    { name: 'Recency bias works', pass: (() => {
      const taxTrend = trends.find(t => t.keywordEn.includes('taxation'));
      const travelTrend = trends.find(t => t.keywordEn.includes('travel'));
      if (!taxTrend || !travelTrend) return true;
      return taxTrend.score >= travelTrend.score; // Tax is more recent
    })(), expected: 'Recent articles score higher than older ones' },
    { name: 'Minimum 2 mentions filter works', pass: trends.every(t => t.mentions >= 2), expected: 'No single-mention noise' },
    { name: 'Related tags populated', pass: trends.some(t => t.relatedTags.length > 0), expected: 'Co-occurring keywords linked' },
    { name: 'Sentiment captured', pass: trends.some(t => t.sentiment.positive > 0 || t.sentiment.negative > 0), expected: 'Not all neutral' },
  ];

  let passed = 0;
  for (const check of checks) {
    const status = check.pass ? '✅' : '❌';
    console.log(`   ${status} ${check.name}`);
    if (!check.pass) console.log(`      Expected: ${check.expected}`);
    if (check.pass) passed++;
  }

  console.log(`\n   Result: ${passed}/${checks.length} checks passed`);

  // Step 5: Output what would be saved to DB
  console.log(`\n💾 Step 5: DB output (what would be saved)`);
  console.log(`   policy_trends table would receive ${trends.length} rows:`);
  for (const t of trends.slice(0, 5)) {
    console.log(`   → keyword="${t.keyword}" keywordEn="${t.keywordEn}" score=${t.score} mentions=${t.mentions} relatedTags=[${t.relatedTags.slice(0,3).join(',')}]`);
  }

  console.log('\n' + '═'.repeat(80));
  console.log(`\n🏁 Pipeline test complete. ${passed}/${checks.length} quality checks passed.\n`);
}

main();
