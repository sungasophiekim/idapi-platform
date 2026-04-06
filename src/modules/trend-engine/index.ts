// src/modules/trend-engine/index.ts
// Trend detection orchestrator — runs the full pipeline
// collect RSS → extract keywords (AI) → score trends → save to DB

import { collectAllFeeds, type CollectedArticle } from './collector';
import { extractKeywords, type ExtractedKeywords } from './extractor';
import { scoreTrends, type ScoredTrend } from './scorer';
import { prisma } from '@/lib/db';

export { type CollectedArticle } from './collector';
export { type ExtractedKeywords } from './extractor';
export { type ScoredTrend } from './scorer';
export { RSS_SOURCES, getActiveSources } from './sources';

export interface TrendRunResult {
  articlesCollected: number;
  articlesAnalyzed: number;
  trendsDetected: number;
  spikesDetected: number;
  topTrends: ScoredTrend[];
  duration: number;          // ms
  errors: string[];
}

// ─── Full pipeline ───
export async function runTrendDetection(options?: {
  maxAgeDays?: number;
  jurisdictions?: string[];
  skipAi?: boolean;           // Use fallback extraction only (for testing)
}): Promise<TrendRunResult> {
  const startTime = Date.now();
  const errors: string[] = [];

  // Step 1: Collect RSS feeds
  console.log('[TrendEngine] Step 1/4: Collecting RSS feeds...');
  let articles: CollectedArticle[];
  try {
    articles = await collectAllFeeds({
      maxPerFeed: 15,
      maxAgeDays: options?.maxAgeDays || 7,
      jurisdictions: options?.jurisdictions,
    });
  } catch (err: any) {
    errors.push(`Collection failed: ${err.message}`);
    return { articlesCollected: 0, articlesAnalyzed: 0, trendsDetected: 0, spikesDetected: 0, topTrends: [], duration: Date.now() - startTime, errors };
  }

  if (articles.length === 0) {
    return { articlesCollected: 0, articlesAnalyzed: 0, trendsDetected: 0, spikesDetected: 0, topTrends: [], duration: Date.now() - startTime, errors: ['No articles collected'] };
  }

  // Step 2: Extract keywords (AI or fallback)
  console.log(`[TrendEngine] Step 2/4: Extracting keywords from ${articles.length} articles...`);
  let extracted: ExtractedKeywords[];
  try {
    if (options?.skipAi) {
      // Import fallback directly for testing
      const { extractKeywords: extract } = await import('./extractor');
      extracted = await extract(articles);
    } else {
      extracted = await extractKeywords(articles);
    }
  } catch (err: any) {
    errors.push(`Extraction error: ${err.message}`);
    extracted = []; // Will result in no trends
  }

  // Step 3: Score trends
  console.log(`[TrendEngine] Step 3/4: Scoring trends...`);
  const previousTrends = await getPreviousTrends();
  const trends = scoreTrends(extracted, previousTrends);
  const spikes = trends.filter(t => t.isSpike);

  // Step 4: Save to database
  console.log(`[TrendEngine] Step 4/4: Saving ${trends.length} trends to DB...`);
  try {
    await saveTrends(trends);
  } catch (err: any) {
    errors.push(`DB save error: ${err.message}`);
  }

  const duration = Date.now() - startTime;
  console.log(`[TrendEngine] Complete: ${trends.length} trends, ${spikes.length} spikes, ${duration}ms`);

  return {
    articlesCollected: articles.length,
    articlesAnalyzed: extracted.length,
    trendsDetected: trends.length,
    spikesDetected: spikes.length,
    topTrends: trends,
    duration,
    errors,
  };
}

// ─── Get previous trends for spike detection ───
async function getPreviousTrends(): Promise<ScoredTrend[]> {
  try {
    const existing = await prisma.policyTrend.findMany({
      orderBy: { score: 'desc' },
      take: 20,
    });
    return existing.map(t => ({
      keyword: t.keyword,
      keywordEn: t.keywordEn || t.keyword,
      score: t.score,
      mentions: t.mentions,
      jurisdictions: [],
      relatedTags: t.relatedTags,
      sentiment: { positive: 0, negative: 0, neutral: 0 },
      isSpike: false,
      topSources: [],
    }));
  } catch {
    return [];
  }
}

// ─── Save trends to DB (replace all current trends) ───
async function saveTrends(trends: ScoredTrend[]): Promise<void> {
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  // Soft-expire old trends (don't delete, just let them expire)
  // Insert new trends
  await prisma.$transaction(async (tx) => {
    // Mark old trends as expired
    await tx.policyTrend.updateMany({
      where: { expiresAt: { gt: new Date() } },
      data: { expiresAt: new Date() },
    });

    // Insert new trends
    for (const trend of trends) {
      await tx.policyTrend.create({
        data: {
          keyword: trend.keyword,
          keywordEn: trend.keywordEn,
          score: trend.score,
          mentions: trend.mentions,
          relatedTags: trend.relatedTags,
          expiresAt,
        },
      });
    }
  });
}

// ─── Quick stats for admin ───
export async function getTrendStats() {
  const activeTrends = await prisma.policyTrend.count({
    where: { expiresAt: { gt: new Date() } },
  });
  return { activeTrends };
}
