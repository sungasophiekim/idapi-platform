// src/modules/law-archive/index.ts
// Law Archive Engine — fetches, stores, and provides structured access to law full texts
// Used by: consulting engine, AI analysis, dashboard

import { prisma } from '@/lib/db';

// ─── Types ───
export interface LawSearchResult {
  lawId: string;
  jurisdiction: string;
  title: string;
  titleEn?: string;
  articleNum: string;
  articleTitle?: string;
  content: string;
  contentEn?: string;
  tags: string[];
  relevanceScore: number;
}

// ─── Search articles relevant to a business type ───
export async function searchArticlesByBusiness(
  jurisdictions: string[],
  businessTypes: string[],
  limit = 30
): Promise<LawSearchResult[]> {
  const articles = await prisma.lawArticle.findMany({
    where: {
      law: { jurisdiction: { in: jurisdictions as any[] } },
      appliesToBiz: { hasSome: businessTypes },
    },
    include: {
      law: { select: { id: true, jurisdiction: true, title: true, titleEn: true } },
    },
    orderBy: { sortOrder: 'asc' },
    take: limit,
  });

  return articles.map(a => ({
    lawId: a.law.id,
    jurisdiction: a.law.jurisdiction,
    title: a.law.title,
    titleEn: a.law.titleEn || undefined,
    articleNum: a.articleNum,
    articleTitle: a.articleTitle || undefined,
    content: a.content,
    contentEn: a.contentEn || undefined,
    tags: a.tags,
    relevanceScore: 1.0,
  }));
}

// ─── Search articles by keyword ───
export async function searchArticlesByKeyword(
  keyword: string,
  jurisdictions?: string[],
  limit = 20
): Promise<LawSearchResult[]> {
  // Prisma doesn't support full-text search natively on all DBs
  // So we use tag matching + title matching
  const where: any = {
    OR: [
      { tags: { has: keyword.toLowerCase() } },
      { articleTitle: { contains: keyword, mode: 'insensitive' } },
      { content: { contains: keyword, mode: 'insensitive' } },
    ],
  };

  if (jurisdictions?.length) {
    where.law = { jurisdiction: { in: jurisdictions as any[] } };
  }

  const articles = await prisma.lawArticle.findMany({
    where,
    include: {
      law: { select: { id: true, jurisdiction: true, title: true, titleEn: true } },
    },
    orderBy: { sortOrder: 'asc' },
    take: limit,
  });

  return articles.map(a => ({
    lawId: a.law.id,
    jurisdiction: a.law.jurisdiction,
    title: a.law.title,
    titleEn: a.law.titleEn || undefined,
    articleNum: a.articleNum,
    articleTitle: a.articleTitle || undefined,
    content: a.content,
    contentEn: a.contentEn || undefined,
    tags: a.tags,
    relevanceScore: a.tags.includes(keyword.toLowerCase()) ? 1.0 : 0.7,
  }));
}

// ─── Build AI context from archive ───
// This is the key function that makes IDAPI's AI different from generic LLMs
export async function buildLawContext(
  jurisdictions: string[],
  businessTypes: string[],
  topics?: string[]
): Promise<string> {
  // Get relevant articles
  const bizArticles = await searchArticlesByBusiness(jurisdictions, businessTypes, 40);

  // Optionally add topic-specific articles
  let topicArticles: LawSearchResult[] = [];
  if (topics?.length) {
    for (const topic of topics) {
      const results = await searchArticlesByKeyword(topic, jurisdictions, 5);
      topicArticles.push(...results);
    }
  }

  // Deduplicate
  const seen = new Set<string>();
  const allArticles = [...bizArticles, ...topicArticles].filter(a => {
    const key = `${a.lawId}-${a.articleNum}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  if (allArticles.length === 0) {
    return 'No relevant law articles found in the IDAPI archive for the specified jurisdictions and business types.';
  }

  // Group by law
  const byLaw = new Map<string, LawSearchResult[]>();
  for (const article of allArticles) {
    const key = `[${article.jurisdiction}] ${article.title}`;
    if (!byLaw.has(key)) byLaw.set(key, []);
    byLaw.get(key)!.push(article);
  }

  // Build context string
  let context = `IDAPI LAW ARCHIVE — Applicable law articles (${allArticles.length} articles from ${byLaw.size} laws):\n\n`;

  for (const [lawKey, articles] of byLaw.entries()) {
    context += `═══ ${lawKey} ═══\n`;
    if (articles[0].titleEn) context += `    (${articles[0].titleEn})\n`;
    context += '\n';

    for (const article of articles) {
      context += `${article.articleNum}`;
      if (article.articleTitle) context += ` (${article.articleTitle})`;
      context += `:\n${article.content}\n\n`;
    }
    context += '---\n\n';
  }

  return context;
}

// ─── Get archive statistics ───
export async function getArchiveStats() {
  const [lawCount, articleCount, jurisdictions] = await Promise.all([
    prisma.lawArchive.count(),
    prisma.lawArticle.count(),
    prisma.lawArchive.groupBy({ by: ['jurisdiction'], _count: true }),
  ]);

  return {
    totalLaws: lawCount,
    totalArticles: articleCount,
    byJurisdiction: Object.fromEntries(jurisdictions.map(j => [j.jurisdiction, j._count])),
  };
}

// ─── List all archived laws ───
export async function listArchivedLaws() {
  return prisma.lawArchive.findMany({
    select: {
      id: true,
      jurisdiction: true,
      title: true,
      titleEn: true,
      shortName: true,
      status: true,
      effectiveDate: true,
      totalArticles: true,
      _count: { select: { articles: true } },
    },
    orderBy: [{ jurisdiction: 'asc' }, { effectiveDate: 'desc' }],
  });
}
