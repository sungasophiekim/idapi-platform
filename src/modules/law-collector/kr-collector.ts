// src/modules/law-collector/kr-collector.ts
// Fetches Korean law full texts from the Korean Law Information Center
// (법제처 국가법령정보센터) Open API and saves them to the law archive.

import { prisma } from '@/lib/db';

// ─── Types ───────────────────────────────────────────────────────────────────

interface CollectedLaw {
  title: string;
  lawNumber: string;
  enactedDate: string;
  effectiveDate: string;
  articles: {
    articleNum: string;
    articleTitle?: string;
    content: string;
    chapter?: string;
    sortOrder: number;
  }[];
}

interface SearchResult {
  id: string;
  name: string;
  lawNumber: string;
}

interface SaveOptions {
  shortName?: string;
  regulator?: string;
  tags?: string[];
  appliesToBiz?: string[];
}

// ─── Constants ───────────────────────────────────────────────────────────────

const API_KEY = process.env.LAW_GO_KR_API_KEY || 'chetera';
const SEARCH_ENDPOINT = 'https://www.law.go.kr/DRF/lawSearch.do';
const DETAIL_ENDPOINT = 'https://www.law.go.kr/DRF/lawService.do';

// Helper: fetch with User-Agent + timeout (Vercel serverless friendly)
async function safeFetch(url: string, timeoutMs = 25000): Promise<string> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; IDAPI-Bot/1.0; +https://idapi-platform.vercel.app)',
        'Accept': 'application/xml, text/xml, */*',
        'Accept-Language': 'ko-KR,ko;q=0.9,en;q=0.8',
      },
    });
    if (!res.ok) {
      throw new Error(`HTTP ${res.status} ${res.statusText}`);
    }
    return await res.text();
  } finally {
    clearTimeout(timer);
  }
}

// ─── XML Helpers (regex-based, no external library) ──────────────────────────

/** Extract text content of the first matching XML tag */
function xmlTag(xml: string, tag: string): string {
  const re = new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`);
  const m = xml.match(re);
  return m ? m[1].trim() : '';
}

/** Extract all occurrences of a tag and return their inner text */
function xmlTagAll(xml: string, tag: string): string[] {
  const re = new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`, 'g');
  const results: string[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(xml)) !== null) {
    results.push(m[1].trim());
  }
  return results;
}

/** Extract all blocks matching an outer tag (returns raw XML of each block) */
function xmlBlocks(xml: string, tag: string): string[] {
  // Match both <tag> and <tag attr="..."> opening tags
  const re = new RegExp(`<${tag}(?:\\s[^>]*)?>[\\s\\S]*?</${tag}>`, 'g');
  return xml.match(re) || [];
}

/** Decode common XML entities */
function decodeXmlEntities(text: string): string {
  return text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1');
}

// ─── Search ──────────────────────────────────────────────────────────────────

/**
 * Search for a Korean law by name using the 국가법령정보센터 API.
 * Returns a list of matching laws with their IDs.
 */
export async function searchKoreanLaw(query: string): Promise<SearchResult[]> {
  const url = new URL(SEARCH_ENDPOINT);
  url.searchParams.set('OC', API_KEY);
  url.searchParams.set('target', 'law');
  url.searchParams.set('type', 'XML');
  url.searchParams.set('query', query);

  console.log(`[kr-collector] Searching for: ${query}`);

  let xml: string;
  try {
    xml = await safeFetch(url.toString());
  } catch (e: any) {
    console.error(`[kr-collector] Search fetch error: ${e.message}`);
    throw new Error(`Search failed: ${e.message}`);
  }

  // Real law.go.kr API returns <law id="N">...</law> blocks
  const lawBlocks = xmlBlocks(xml, 'law');

  if (lawBlocks.length === 0) {
    console.log('[kr-collector] No results found');
    console.log('[kr-collector] Response preview:', xml.slice(0, 300));
    return [];
  }

  const results: SearchResult[] = lawBlocks.map((block) => ({
    id: xmlTag(block, '법령일련번호') || xmlTag(block, '법령ID') || '',
    name: decodeXmlEntities(xmlTag(block, '법령명한글') || xmlTag(block, '법령명') || ''),
    lawNumber: decodeXmlEntities(xmlTag(block, '공포번호') || xmlTag(block, '법령번호') || ''),
  }));

  console.log(`[kr-collector] Found ${results.length} result(s)`);
  return results;
}

// ─── Parse Articles ──────────────────────────────────────────────────────────

/**
 * Parse XML response to extract articles (조문) from a law detail response.
 * Handles 조문번호, 조문제목, 조문내용, and 장/절/편 chapter info.
 */
function parseArticlesFromXml(xml: string): CollectedLaw['articles'] {
  const articles: CollectedLaw['articles'] = [];

  // Track current chapter context (편/장/절)
  let currentChapter = '';

  // Extract 편 (part), 장 (chapter), 절 (section) markers that appear before articles
  // These are typically in the structure as siblings to 조문 elements

  const articleBlocks = xmlBlocks(xml, '조문');

  if (articleBlocks.length === 0) {
    console.log('[kr-collector] No 조문 elements found, trying alternate structures...');

    // Try 조문단위 as alternate element name
    const altBlocks = xmlBlocks(xml, '조문단위');
    if (altBlocks.length > 0) {
      altBlocks.forEach((block, idx) => {
        const articleNum = decodeXmlEntities(xmlTag(block, '조문번호') || xmlTag(block, '조문키'));
        const articleTitle = decodeXmlEntities(xmlTag(block, '조문제목'));
        const content = decodeXmlEntities(
          xmlTag(block, '조문내용') || xmlTag(block, '조문')
        );

        if (articleNum || content) {
          const num = articleNum.match(/\d+/) ? `제${articleNum}조` : articleNum;
          articles.push({
            articleNum: num || `제${idx + 1}조`,
            articleTitle: articleTitle || undefined,
            content: content.replace(/^제\d+조(\([^)]*\))?\s*/, '').trim() || content,
            chapter: currentChapter || undefined,
            sortOrder: idx + 1,
          });
        }
      });
      return articles;
    }
  }

  articleBlocks.forEach((block, idx) => {
    const articleNum = decodeXmlEntities(xmlTag(block, '조문번호'));
    const articleTitle = decodeXmlEntities(xmlTag(block, '조문제목'));
    const rawContent = decodeXmlEntities(xmlTag(block, '조문내용'));

    // Check for chapter markers within or near this article block
    const chapterFromBlock =
      decodeXmlEntities(xmlTag(block, '편명')) ||
      decodeXmlEntities(xmlTag(block, '장명')) ||
      decodeXmlEntities(xmlTag(block, '절명'));

    if (chapterFromBlock) {
      currentChapter = chapterFromBlock;
    }

    // Also check for 편장절 composite field
    const compositeChapter = decodeXmlEntities(xmlTag(block, '편장절'));
    if (compositeChapter) {
      currentChapter = compositeChapter;
    }

    // Build content: combine 조문내용 with any 항 (paragraphs) content
    let content = rawContent;

    // Extract sub-paragraphs (항) if present
    const paragraphs = xmlBlocks(block, '항');
    if (paragraphs.length > 0 && !rawContent) {
      content = paragraphs
        .map((p) => decodeXmlEntities(xmlTag(p, '항내용') || xmlTag(p, '항번호')))
        .filter(Boolean)
        .join('\n');
    }

    if (!articleNum && !content) return;

    articles.push({
      articleNum: articleNum || `제${idx + 1}조`,
      articleTitle: articleTitle || undefined,
      content: content || '(내용 없음)',
      chapter: currentChapter || undefined,
      sortOrder: idx + 1,
    });
  });

  console.log(`[kr-collector] Parsed ${articles.length} article(s)`);
  return articles;
}

// ─── Fetch Full Law ──────────────────────────────────────────────────────────

/**
 * Fetch the full text of a specific Korean law by its ID (법령ID or MST).
 */
export async function fetchKoreanLawFull(lawId: string): Promise<CollectedLaw | null> {
  const url = new URL(DETAIL_ENDPOINT);
  url.searchParams.set('OC', API_KEY);
  url.searchParams.set('target', 'law');
  url.searchParams.set('type', 'XML');
  url.searchParams.set('MST', lawId);

  console.log(`[kr-collector] Fetching law detail for ID: ${lawId}`);

  let xml: string;
  try {
    xml = await safeFetch(url.toString());
  } catch (e: any) {
    console.error(`[kr-collector] Detail fetch error: ${e.message}`);
    throw new Error(`Detail fetch failed: ${e.message}`);
  }

  // Extract top-level law metadata
  const title = decodeXmlEntities(
    xmlTag(xml, '법령명_한글') || xmlTag(xml, '법령명') || xmlTag(xml, '법령명한글') || ''
  );
  const lawNumber = decodeXmlEntities(
    xmlTag(xml, '공포번호') || xmlTag(xml, '법령번호') || xmlTag(xml, '법령ID') || ''
  );
  const enactedDate = xmlTag(xml, '제정일자') || xmlTag(xml, '공포일자') || '';
  const effectiveDate = xmlTag(xml, '시행일자') || '';

  if (!title) {
    console.error('[kr-collector] Could not extract law title from response');
    return null;
  }

  const articles = parseArticlesFromXml(xml);

  console.log(`[kr-collector] Fetched "${title}" with ${articles.length} articles`);

  return {
    title,
    lawNumber,
    enactedDate,
    effectiveDate,
    articles,
  };
}

// ─── Save to Database ────────────────────────────────────────────────────────

/**
 * Infer default tags based on the law title content.
 */
function inferDefaultTags(title: string): string[] {
  const tags: string[] = ['korean-law'];
  const keywords: [string, string][] = [
    ['가상자산', 'virtual-asset'],
    ['금융', 'finance'],
    ['자본시장', 'capital-market'],
    ['전자금융', 'e-finance'],
    ['특정금융', 'aml'],
    ['개인정보', 'privacy'],
    ['정보보호', 'infosec'],
    ['소비자', 'consumer'],
    ['전자상거래', 'e-commerce'],
    ['블록체인', 'blockchain'],
    ['디지털자산', 'digital-asset'],
    ['증권', 'securities'],
    ['보험', 'insurance'],
    ['은행', 'banking'],
    ['세금', 'tax'],
    ['과세', 'tax'],
    ['소득세', 'income-tax'],
    ['법인세', 'corporate-tax'],
    ['자금세탁', 'aml'],
    ['테러자금', 'cft'],
  ];
  for (const [kr, en] of keywords) {
    if (title.includes(kr) && !tags.includes(en)) {
      tags.push(en);
    }
  }
  return tags;
}

/**
 * Infer default business types the law applies to.
 */
function inferDefaultBizTypes(title: string): string[] {
  const biz: string[] = [];
  const keywords: [string, string][] = [
    ['가상자산', 'exchange'],
    ['가상자산', 'token-issuer'],
    ['금융', 'financial-institution'],
    ['자본시장', 'securities-firm'],
    ['전자금융', 'e-finance-provider'],
    ['특정금융', 'exchange'],
    ['개인정보', 'all'],
    ['전자상거래', 'e-commerce'],
    ['은행', 'bank'],
    ['보험', 'insurer'],
  ];
  for (const [kr, en] of keywords) {
    if (title.includes(kr) && !biz.includes(en)) {
      biz.push(en);
    }
  }
  return biz.length > 0 ? biz : ['general'];
}

/**
 * Save a collected law and its articles to the database.
 * Uses upsert on jurisdiction+lawNumber, and deletes existing articles before re-creating.
 */
export async function saveKoreanLawToArchive(
  law: CollectedLaw,
  options?: SaveOptions
): Promise<void> {
  const tags = options?.tags ?? inferDefaultTags(law.title);
  const appliesToBiz = options?.appliesToBiz ?? inferDefaultBizTypes(law.title);

  console.log(`[kr-collector] Saving "${law.title}" to archive...`);

  // Determine lawType from the title or number
  let lawType = 'law';
  if (law.title.includes('시행령') || law.lawNumber.includes('대통령령')) {
    lawType = 'decree';
  } else if (law.title.includes('시행규칙')) {
    lawType = 'regulation';
  } else if (law.title.includes('고시') || law.title.includes('지침')) {
    lawType = 'guideline';
  }

  // Format dates
  const enactedDate = law.enactedDate ? parseKrDate(law.enactedDate) : null;
  const effectiveDate = law.effectiveDate ? parseKrDate(law.effectiveDate) : null;

  // Use unique lawNumber prefixed with KR-LAWGOKR to avoid collision with seed data
  const uniqueLawNumber = `KR-LAWGOKR-${law.lawNumber || law.title.slice(0, 20)}`;

  // Delete any existing law with same uniqueLawNumber AND its articles (to allow re-collection)
  const existing = await prisma.lawArchive.findUnique({
    where: { jurisdiction_lawNumber: { jurisdiction: 'KR', lawNumber: uniqueLawNumber } },
  });
  if (existing) {
    await prisma.lawArticle.deleteMany({ where: { lawId: existing.id } });
  }

  // Upsert the law record
  const upserted = await prisma.lawArchive.upsert({
    where: {
      jurisdiction_lawNumber: {
        jurisdiction: 'KR',
        lawNumber: uniqueLawNumber,
      },
    },
    update: {
      title: law.title,
      lawType,
      shortName: options?.shortName ?? undefined,
      regulator: options?.regulator ?? undefined,
      enactedDate,
      effectiveDate,
      lastAmendedDate: new Date(),
      status: 'enacted',
      sourceUrl: `https://www.law.go.kr/법령/${encodeURIComponent(law.title)}`,
      totalArticles: law.articles.length,
    },
    create: {
      jurisdiction: 'KR',
      lawType,
      title: law.title,
      shortName: options?.shortName ?? null,
      lawNumber: uniqueLawNumber,
      enactedDate,
      effectiveDate,
      status: 'enacted',
      regulator: options?.regulator ?? null,
      sourceUrl: `https://www.law.go.kr/법령/${encodeURIComponent(law.title)}`,
      totalArticles: law.articles.length,
    },
  });

  // Delete existing articles for this law (to handle updates cleanly)
  await prisma.lawArticle.deleteMany({
    where: { lawId: upserted.id },
  });

  // Re-create all articles
  if (law.articles.length > 0) {
    await prisma.lawArticle.createMany({
      data: law.articles.map((a) => ({
        lawId: upserted.id,
        articleNum: a.articleNum,
        articleTitle: a.articleTitle ?? null,
        content: a.content,
        chapter: a.chapter ?? null,
        sortOrder: a.sortOrder,
        tags,
        appliesToBiz,
      })),
    });
  }

  console.log(
    `[kr-collector] Saved "${law.title}" (${upserted.id}) with ${law.articles.length} articles`
  );
}

// ─── Main: Collect ───────────────────────────────────────────────────────────

/**
 * Main orchestrator: search for a Korean law by name, fetch full text, and save to archive.
 *
 * @param lawName - The name of the law to search for (e.g. "가상자산 이용자 보호")
 * @param options - Optional overrides for shortName, regulator, tags, appliesToBiz
 * @returns Result object with success status, title, and article count
 */
export async function collectKoreanLaw(
  lawName: string,
  options?: SaveOptions
): Promise<{ success: boolean; title: string; articleCount: number }> {
  console.log(`[kr-collector] === Collecting: ${lawName} ===`);

  // Step 1: Search
  const results = await searchKoreanLaw(lawName);
  if (results.length === 0) {
    console.error(`[kr-collector] No laws found matching "${lawName}"`);
    return { success: false, title: '', articleCount: 0 };
  }

  // Pick the first (most relevant) result
  const best = results[0];
  console.log(`[kr-collector] Selected: ${best.name} (ID: ${best.id})`);

  // Step 2: Fetch full text
  const law = await fetchKoreanLawFull(best.id);
  if (!law) {
    console.error(`[kr-collector] Failed to fetch full text for ID: ${best.id}`);
    return { success: false, title: best.name, articleCount: 0 };
  }

  // Step 3: Save to database
  await saveKoreanLawToArchive(law, options);

  console.log(`[kr-collector] === Done: ${law.title} (${law.articles.length} articles) ===`);
  return {
    success: true,
    title: law.title,
    articleCount: law.articles.length,
  };
}

// ─── Utilities ───────────────────────────────────────────────────────────────

/**
 * Parse Korean date strings (YYYYMMDD or YYYY-MM-DD or YYYY.MM.DD) to Date.
 */
function parseKrDate(dateStr: string): Date | null {
  if (!dateStr) return null;

  // Remove all non-digit characters
  const digits = dateStr.replace(/\D/g, '');
  if (digits.length < 8) return null;

  const year = parseInt(digits.substring(0, 4), 10);
  const month = parseInt(digits.substring(4, 6), 10) - 1; // zero-based
  const day = parseInt(digits.substring(6, 8), 10);

  const date = new Date(Date.UTC(year, month, day));
  if (isNaN(date.getTime())) return null;

  return date;
}
