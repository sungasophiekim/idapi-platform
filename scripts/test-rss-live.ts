// scripts/test-rss-live.ts
// Run: npx tsx scripts/test-rss-live.ts
// Tests RSS collection against real feeds — no DB needed

import { getActiveSources, type RssSource } from '../src/modules/trend-engine/sources';

// ─── Minimal RSS parser (same as collector.ts but standalone) ───
function extractTag(xml: string, tag: string): string {
  const re = new RegExp(`<${tag}[^>]*>(?:<!\\[CDATA\\[)?(.*?)(?:\\]\\]>)?<\\/${tag}>`, 's');
  const match = xml.match(re);
  return match ? match[1].trim() : '';
}

function extractItems(xml: string): string[] {
  const items: string[] = [];
  let m;
  const re = /<item[\s>](.*?)<\/item>/gs;
  while ((m = re.exec(xml)) !== null) items.push(m[1]);
  const reAtom = /<entry[\s>](.*?)<\/entry>/gs;
  while ((m = reAtom.exec(xml)) !== null) items.push(m[1]);
  return items;
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
}

async function testFeed(source: RssSource): Promise<{ ok: boolean; articles: number; sample?: string; error?: string; ms: number }> {
  const start = Date.now();
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);
    
    const res = await fetch(source.url, {
      signal: controller.signal,
      headers: { 'User-Agent': 'IDAPI-TestBot/1.0', 'Accept': 'application/rss+xml, application/xml, text/xml, */*' },
    });
    clearTimeout(timeout);
    
    if (!res.ok) {
      return { ok: false, articles: 0, error: `HTTP ${res.status}`, ms: Date.now() - start };
    }

    const xml = await res.text();
    const items = extractItems(xml);
    const firstTitle = items.length > 0 ? stripHtml(extractTag(items[0], 'title')) : 'N/A';

    return { ok: true, articles: items.length, sample: firstTitle.slice(0, 80), ms: Date.now() - start };
  } catch (err: any) {
    const msg = err.name === 'AbortError' ? 'TIMEOUT (12s)' : err.message?.slice(0, 50);
    return { ok: false, articles: 0, error: msg, ms: Date.now() - start };
  }
}

async function main() {
  const sources = getActiveSources();
  console.log(`\n🔍 Testing ${sources.length} RSS feeds against live servers...\n`);
  console.log('─'.repeat(100));

  let working = 0;
  let broken = 0;
  let totalArticles = 0;
  const results: Array<{ source: RssSource; result: Awaited<ReturnType<typeof testFeed>> }> = [];

  // Test in batches of 5
  for (let i = 0; i < sources.length; i += 5) {
    const batch = sources.slice(i, i + 5);
    const batchResults = await Promise.all(batch.map(async s => ({
      source: s,
      result: await testFeed(s),
    })));

    for (const { source, result } of batchResults) {
      results.push({ source, result });
      const status = result.ok ? '✅' : '❌';
      const artCount = result.articles > 0 ? `${result.articles} articles` : '';
      const detail = result.ok ? result.sample : result.error;
      
      console.log(
        `${status} [${source.jurisdiction.padEnd(5)}] ${source.name.padEnd(45)} ${artCount.padEnd(15)} ${result.ms}ms  ${detail}`
      );

      if (result.ok) { working++; totalArticles += result.articles; }
      else broken++;
    }
  }

  console.log('─'.repeat(100));
  console.log(`\n📊 Results Summary:`);
  console.log(`   Working feeds:  ${working}/${sources.length} (${Math.round(working/sources.length*100)}%)`);
  console.log(`   Broken feeds:   ${broken}/${sources.length}`);
  console.log(`   Total articles: ${totalArticles}`);
  console.log(`   Avg per feed:   ${working > 0 ? Math.round(totalArticles / working) : 0}`);

  // ─── Report broken feeds with fix suggestions ───
  const brokenFeeds = results.filter(r => !r.result.ok);
  if (brokenFeeds.length > 0) {
    console.log(`\n⚠️  Broken feeds need attention:`);
    for (const { source, result } of brokenFeeds) {
      console.log(`   - ${source.id}: ${result.error} → Consider removing or finding alternative URL`);
    }
  }

  // ─── Report by jurisdiction ───
  console.log(`\n📍 By jurisdiction:`);
  const byJ = new Map<string, { ok: number; fail: number; articles: number }>();
  for (const { source, result } of results) {
    const j = source.jurisdiction;
    if (!byJ.has(j)) byJ.set(j, { ok: 0, fail: 0, articles: 0 });
    const entry = byJ.get(j)!;
    if (result.ok) { entry.ok++; entry.articles += result.articles; }
    else entry.fail++;
  }
  for (const [j, data] of byJ.entries()) {
    console.log(`   ${j.padEnd(6)} ${data.ok}/${data.ok + data.fail} working, ${data.articles} articles`);
  }

  console.log(`\n✅ RSS collection test complete.\n`);
}

main().catch(console.error);
