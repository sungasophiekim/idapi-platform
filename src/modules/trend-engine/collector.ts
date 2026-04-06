// src/modules/trend-engine/collector.ts
// RSS feed collector — fetches, parses, deduplicates articles

import { getActiveSources, type RssSource } from './sources';

export interface CollectedArticle {
  sourceId: string;
  sourceName: string;
  jurisdiction: string;
  sourceWeight: number;
  title: string;
  link: string;
  description: string;    // First ~500 chars of content
  pubDate: Date;
  lang: string;
  sourceTags: string[];
}

// ─── Simple XML RSS parser (no external dependency) ───
function extractTag(xml: string, tag: string): string {
  const re = new RegExp(`<${tag}[^>]*>(?:<!\\[CDATA\\[)?(.*?)(?:\\]\\]>)?<\\/${tag}>`, 's');
  const match = xml.match(re);
  return match ? match[1].trim() : '';
}

function extractItems(xml: string): string[] {
  const items: string[] = [];
  const re = /<item[\s>](.*?)<\/item>/gs;
  let m;
  while ((m = re.exec(xml)) !== null) {
    items.push(m[1]);
  }
  // Also handle Atom <entry> format
  const reAtom = /<entry[\s>](.*?)<\/entry>/gs;
  while ((m = reAtom.exec(xml)) !== null) {
    items.push(m[1]);
  }
  return items;
}

function parseDate(dateStr: string): Date {
  try {
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? new Date() : d;
  } catch {
    return new Date();
  }
}

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// ─── Fetch single RSS feed ───
async function fetchFeed(source: RssSource, maxArticles = 20): Promise<CollectedArticle[]> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000); // 15s timeout

    const res = await fetch(source.url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'IDAPI-PolicyBot/1.0 (+https://idapi.kr)',
        'Accept': 'application/rss+xml, application/xml, text/xml',
      },
    });
    clearTimeout(timeout);

    if (!res.ok) {
      console.warn(`[RSS] ${source.id}: HTTP ${res.status}`);
      return [];
    }

    const xml = await res.text();
    const items = extractItems(xml);

    return items.slice(0, maxArticles).map(itemXml => {
      const title = stripHtml(extractTag(itemXml, 'title'));
      const link = extractTag(itemXml, 'link') || extractTag(itemXml, 'guid');
      const description = stripHtml(
        extractTag(itemXml, 'description') ||
        extractTag(itemXml, 'content:encoded') ||
        extractTag(itemXml, 'summary') ||
        extractTag(itemXml, 'content')
      ).slice(0, 500);
      const pubDate = parseDate(
        extractTag(itemXml, 'pubDate') ||
        extractTag(itemXml, 'dc:date') ||
        extractTag(itemXml, 'published') ||
        extractTag(itemXml, 'updated')
      );

      return {
        sourceId: source.id,
        sourceName: source.name,
        jurisdiction: source.jurisdiction,
        sourceWeight: source.weight,
        title,
        link,
        description,
        pubDate,
        lang: source.lang,
        sourceTags: source.tags,
      };
    }).filter(a => a.title.length > 0); // Skip empty items
  } catch (err: any) {
    if (err.name === 'AbortError') {
      console.warn(`[RSS] ${source.id}: timeout`);
    } else {
      console.warn(`[RSS] ${source.id}: ${err.message}`);
    }
    return [];
  }
}

// ─── Collect from all active sources ───
export async function collectAllFeeds(options?: {
  maxPerFeed?: number;
  maxAgeDays?: number;
  jurisdictions?: string[];
}): Promise<CollectedArticle[]> {
  const { maxPerFeed = 15, maxAgeDays = 7, jurisdictions } = options || {};

  let sources = getActiveSources();
  if (jurisdictions?.length) {
    sources = sources.filter(s => jurisdictions.includes(s.jurisdiction));
  }

  console.log(`[Collector] Fetching from ${sources.length} sources...`);

  // Fetch all feeds in parallel (batched to avoid overwhelming)
  const BATCH_SIZE = 10;
  const allArticles: CollectedArticle[] = [];

  for (let i = 0; i < sources.length; i += BATCH_SIZE) {
    const batch = sources.slice(i, i + BATCH_SIZE);
    const results = await Promise.allSettled(
      batch.map(s => fetchFeed(s, maxPerFeed))
    );

    for (const result of results) {
      if (result.status === 'fulfilled') {
        allArticles.push(...result.value);
      }
    }
  }

  // Filter by age
  const cutoff = new Date(Date.now() - maxAgeDays * 24 * 60 * 60 * 1000);
  const recent = allArticles.filter(a => a.pubDate >= cutoff);

  // Deduplicate by title similarity (simple)
  const seen = new Set<string>();
  const deduped = recent.filter(a => {
    const key = a.title.toLowerCase().replace(/[^a-z가-힣0-9]/g, '').slice(0, 60);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  // Sort by date descending
  deduped.sort((a, b) => b.pubDate.getTime() - a.pubDate.getTime());

  console.log(`[Collector] Collected ${deduped.length} unique articles (from ${allArticles.length} raw)`);
  return deduped;
}
