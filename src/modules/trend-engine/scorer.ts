// src/modules/trend-engine/scorer.ts
// Trend scoring engine — frequency × recency × source weight → score 0-100
// Pure logic, no AI calls, no DB dependency

import type { ExtractedKeywords } from './extractor';

export interface ScoredTrend {
  keyword: string;
  keywordEn: string;
  score: number;            // 0-100
  mentions: number;         // Raw count
  jurisdictions: string[];  // Which jurisdictions mentioned this
  relatedTags: string[];
  sentiment: { positive: number; negative: number; neutral: number };
  isSpike: boolean;         // 3x above 7-day average
  topSources: string[];     // Top contributing sources
}

interface KeywordAgg {
  keyword: string;
  keywordEn: string;
  rawScore: number;
  mentions: number;
  jurisdictions: Set<string>;
  sources: Map<string, number>;  // sourceId -> count
  sentiments: { positive: number; negative: number; neutral: number };
  relatedKeywords: Set<string>;
}

// ─── Recency weight: exponential decay over 7 days ───
function recencyWeight(pubDate: Date): number {
  const ageHours = (Date.now() - pubDate.getTime()) / (1000 * 60 * 60);
  if (ageHours < 6)   return 1.0;   // Last 6 hours: full weight
  if (ageHours < 24)  return 0.85;  // Last day
  if (ageHours < 48)  return 0.7;   // 2 days
  if (ageHours < 72)  return 0.55;  // 3 days
  if (ageHours < 120) return 0.35;  // 5 days
  return 0.2;                        // 5-7 days
}

// ─── Normalize keyword (lowercase, trim, merge similar) ───
function normalizeKeyword(kw: string): string {
  return kw.toLowerCase().trim()
    .replace(/\s+/g, ' ')
    .replace(/regulation$/i, '')
    .replace(/규제$/i, '')
    .trim();
}

// Merge map: common variations that should be counted together
const MERGE_MAP: Record<string, string> = {
  'stablecoin': 'stablecoin',
  'stable coin': 'stablecoin',
  '스테이블코인': 'stablecoin',
  'cbdc': 'CBDC',
  '중앙은행 디지털화폐': 'CBDC',
  'central bank digital currency': 'CBDC',
  'rwa': 'RWA tokenization',
  'real world asset': 'RWA tokenization',
  '실물자산 토큰화': 'RWA tokenization',
  'travel rule': 'travel rule',
  '트래블룰': 'travel rule',
  'aml': 'AML/KYC',
  'kyc': 'AML/KYC',
  '자금세탁방지': 'AML/KYC',
  'defi': 'DeFi',
  '디파이': 'DeFi',
  'nft': 'NFT',
  'mica': 'MiCA',
  'sto': 'STO',
  '토큰증권': 'STO',
  'security token': 'STO',
  'etf': 'crypto ETF',
  'custody': 'custody',
  '수탁': 'custody',
};

function mergeKeyword(kw: string): string {
  const norm = normalizeKeyword(kw);
  return MERGE_MAP[norm] || kw;
}

// ─── Main scoring function ───
export function scoreTrends(
  extracted: ExtractedKeywords[],
  previousTrends?: ScoredTrend[]  // For spike detection
): ScoredTrend[] {
  // Filter out low-relevance articles
  const relevant = extracted.filter(e => e.relevanceScore >= 3);

  // Aggregate keywords
  const agg = new Map<string, KeywordAgg>();

  for (const article of relevant) {
    // Use English keywords as canonical form, fall back to original
    const keywords = article.keywordsEn.length > 0 ? article.keywordsEn : article.keywords;

    for (let i = 0; i < keywords.length; i++) {
      const merged = mergeKeyword(keywords[i]);
      const koKeyword = article.keywords[i] || merged;

      if (!agg.has(merged)) {
        agg.set(merged, {
          keyword: koKeyword,
          keywordEn: merged,
          rawScore: 0,
          mentions: 0,
          jurisdictions: new Set(),
          sources: new Map(),
          sentiments: { positive: 0, negative: 0, neutral: 0 },
          relatedKeywords: new Set(),
        });
      }

      const entry = agg.get(merged)!;
      const weight = recencyWeight(article.pubDate) * article.sourceWeight * (article.relevanceScore / 10);

      entry.rawScore += weight;
      entry.mentions += 1;
      entry.jurisdictions.add(article.jurisdiction);
      entry.sources.set(article.sourceId, (entry.sources.get(article.sourceId) || 0) + 1);
      entry.sentiments[article.sentiment] += 1;

      // Track related keywords from the same article
      for (const otherKw of keywords) {
        const otherMerged = mergeKeyword(otherKw);
        if (otherMerged !== merged) entry.relatedKeywords.add(otherMerged);
      }
    }
  }

  // Convert to scored trends
  const maxRawScore = Math.max(...Array.from(agg.values()).map(a => a.rawScore), 1);

  const trends: ScoredTrend[] = Array.from(agg.entries())
    .map(([key, entry]) => {
      // Normalize score to 0-100
      let score = Math.round((entry.rawScore / maxRawScore) * 100);

      // Bonus for multi-jurisdiction relevance (global trend)
      if (entry.jurisdictions.size >= 3) score = Math.min(100, score + 10);
      if (entry.jurisdictions.size >= 5) score = Math.min(100, score + 5);

      // Bonus for multiple source types
      if (entry.sources.size >= 3) score = Math.min(100, score + 5);

      // Spike detection
      const prevTrend = previousTrends?.find(t => t.keywordEn === key);
      const isSpike = prevTrend
        ? entry.mentions >= prevTrend.mentions * 3  // 3x previous
        : entry.mentions >= 5;                       // First-time with 5+ mentions

      // Top contributing sources (by count)
      const topSources = Array.from(entry.sources.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([src]) => src);

      return {
        keyword: entry.keyword,
        keywordEn: entry.keywordEn,
        score,
        mentions: entry.mentions,
        jurisdictions: Array.from(entry.jurisdictions),
        relatedTags: Array.from(entry.relatedKeywords).slice(0, 5),
        sentiment: entry.sentiments,
        isSpike,
        topSources,
      };
    })
    .filter(t => t.mentions >= 2)  // At least 2 mentions to be a trend
    .sort((a, b) => b.score - a.score)
    .slice(0, 15);  // Top 15 trends

  return trends;
}
