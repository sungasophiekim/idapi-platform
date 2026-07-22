// src/modules/news-clip/index.ts
// News clipping collector — reuses the trend-engine RSS pipeline, filters to
// the 7 watch themes, and upserts matched articles as DRAFT NewsClips for
// admin curation. No external dependency; safe to run from cron.

import { prisma } from '@/lib/db';
import { collectAllFeeds } from '@/modules/trend-engine/collector';
import { classifyClip, isRelevant } from './themes';

// RSS titles often carry numeric/entity references the feed parser leaves
// encoded (e.g. &#8220; &#8230; &amp;). Decode for clean display.
function decodeEntities(s: string): string {
  return (s || '')
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .trim();
}

export interface ClipCollectionResult {
  scanned: number;
  matched: number;
  created: number;
  skipped: number;
}

export async function collectNewsClips(options?: {
  maxAgeDays?: number;
  maxPerFeed?: number;
}): Promise<ClipCollectionResult> {
  const { maxAgeDays = 7, maxPerFeed = 20 } = options || {};

  const articles = await collectAllFeeds({ maxAgeDays, maxPerFeed });

  let matched = 0;
  let created = 0;
  let skipped = 0;

  for (const a of articles) {
    const title = decodeEntities(a.title);
    const excerpt = decodeEntities(a.description || '');
    const text = `${title} ${excerpt}`;
    if (!isRelevant(text)) continue;
    const theme = classifyClip(text);
    if (!theme) continue;
    matched++;

    if (!a.link) { skipped++; continue; }

    try {
      const res = await prisma.newsClip.upsert({
        where: { url: a.link },
        // Never override curator decisions: only (re)create as DRAFT if new.
        update: {},
        create: {
          title: title.slice(0, 500),
          url: a.link,
          source: a.sourceName || 'Unknown',
          theme,
          excerpt: excerpt.slice(0, 800) || null,
          lang: a.lang || 'en',
          publishedAt: a.pubDate,
          status: 'DRAFT',
        },
      });
      // upsert returns the row; treat as created when createdAt ≈ now is not
      // reliable, so count via a cheap existence check instead.
      if (res.status === 'DRAFT' && res.createdAt.getTime() > Date.now() - 5000) created++;
    } catch {
      skipped++;
    }
  }

  console.log(`[NewsClip] scanned=${articles.length} matched=${matched} created=${created} skipped=${skipped}`);
  return { scanned: articles.length, matched, created, skipped };
}
