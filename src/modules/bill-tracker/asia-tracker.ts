// src/modules/bill-tracker/asia-tracker.ts
// Fetches pending bills / regulations from Singapore, Japan, and Hong Kong
// government & regulator sources (MAS, FSA, LegCo, SFC, HKMA).

import { prisma } from '@/lib/db';
import { KEYWORDS_EN, KEYWORDS_JA } from '@/modules/taxonomy';

// ─── Shared helpers ──────────────────────────────────────────────

const BROWSER_HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
};

function stripHtml(html: string): string {
  return html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s{2,}/g, ' ')
    .trim();
}

/** Safe fetch with timeout — returns null on failure instead of throwing. */
async function safeFetch(
  url: string,
  referer: string,
): Promise<string | null> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 15_000);

    const res = await fetch(url, {
      headers: { ...BROWSER_HEADERS, Referer: referer },
      signal: controller.signal,
    });
    clearTimeout(timer);

    if (!res.ok) {
      console.log(`[asia-tracker] HTTP ${res.status} for ${url}`);
      return null;
    }
    return await res.text();
  } catch (e: any) {
    if (e.name === 'AbortError') {
      console.log(`[asia-tracker] Timeout fetching ${url}`);
    } else {
      console.log(`[asia-tracker] Fetch failed for ${url}: ${e.message}`);
    }
    return null;
  }
}

/** Generate a deterministic short id from a string. */
function hashId(input: string): string {
  let h = 0;
  for (let i = 0; i < input.length; i++) {
    h = ((h << 5) - h + input.charCodeAt(i)) | 0;
  }
  return Math.abs(h).toString(36);
}

interface ParsedItem {
  title: string;
  url: string;
  date: string | null; // ISO-ish string or null
  snippet: string;
}

// ─── Upsert helper ───────────────────────────────────────────────

async function upsertRegulation(opts: {
  jurisdiction: 'SG' | 'JP' | 'HK';
  billNumber: string;
  title: string;
  sourceUrl: string;
  sourceName: string;
  rawContent: string;
  tags: string[];
  researchArea: 'DIGITAL_FINANCE' | 'INFRASTRUCTURE';
  proposedDate: Date | null;
}): Promise<'created' | 'updated' | 'unchanged'> {
  const existing = await prisma.regulation.findFirst({
    where: { billNumber: opts.billNumber },
  });

  if (existing) {
    // Only update if title changed (source may revise)
    if (existing.title !== opts.title || !existing.rawContent) {
      await prisma.regulation.update({
        where: { id: existing.id },
        data: {
          title: opts.title,
          rawContent: opts.rawContent,
          lastUpdatedDate: new Date(),
        },
      });
      return 'updated';
    }
    return 'unchanged';
  }

  const created = await prisma.regulation.create({
    data: {
      jurisdiction: opts.jurisdiction,
      status: 'PROPOSED',
      title: opts.title,
      titleEn: opts.title, // Asian English-language sources
      sourceName: opts.sourceName,
      sourceUrl: opts.sourceUrl,
      billNumber: opts.billNumber,
      rawContent: opts.rawContent,
      tags: opts.tags,
      researchArea: opts.researchArea,
      proposedDate: opts.proposedDate,
      lastUpdatedDate: new Date(),
    },
  });

  await prisma.regulationEvent.create({
    data: {
      regulationId: created.id,
      status: 'PROPOSED',
      description: `New item tracked from ${opts.sourceName}`,
      descriptionEn: `New item tracked from ${opts.sourceName}`,
      eventDate: opts.proposedDate ?? new Date(),
    },
  });

  return 'created';
}

// ─── Keywords per jurisdiction ───────────────────────────────────

// Filter-based (fetch page → matchesKeywords), so the full shared banks are
// safe here — no per-keyword API calls. Local terms kept alongside.
const SG_KEYWORDS = [...KEYWORDS_EN, 'digital payment token', 'dpt', 'singpass'];
const JP_KEYWORDS = [...KEYWORDS_JA];
const HK_KEYWORDS = [...KEYWORDS_EN, 'vasp', 'iamsmart'];

function matchesKeywords(text: string, keywords: string[]): boolean {
  const lower = text.toLowerCase();
  return keywords.some((kw) => lower.includes(kw.toLowerCase()));
}

function inferTags(text: string): string[] {
  const lower = text.toLowerCase();
  const tags: string[] = [];
  if (/stablecoin|ステーブルコイン/.test(lower)) tags.push('stablecoin');
  if (/virtual asset|仮想通貨|暗号資産|digital asset|デジタル資産|dpt|vasp/.test(lower))
    tags.push('digital-asset');
  if (/artificial intelligence|人工知能|ai\b/.test(lower)) tags.push('ai');
  if (/blockchain|ブロックチェーン/.test(lower)) tags.push('blockchain');
  if (/consultation|諮問/.test(lower)) tags.push('consultation');
  if (/token|トークン/.test(lower)) tags.push('token');
  if (/nft/.test(lower)) tags.push('nft');
  if (tags.length === 0) tags.push('digital-asset');
  return tags;
}

// =====================================================================
// Singapore (MAS + Parliament)
// =====================================================================
// MAS Media Releases: https://www.mas.gov.sg/news?content_type=Media%20Releases
// MAS Consultation Papers: https://www.mas.gov.sg/publications?content_type=Consultation%20Papers
// Singapore Parliament: https://www.parliament.gov.sg/parliamentary-business/bills-introduced

const MAS_CONSULTATION_URL =
  'https://www.mas.gov.sg/publications?content_type=Consultation%20Papers';
const MAS_NEWS_URL =
  'https://www.mas.gov.sg/news?content_type=Media%20Releases';
const SG_PARLIAMENT_URL =
  'https://www.parliament.gov.sg/parliamentary-business/bills-introduced';

function parseMasPage(html: string, sourceLabel: string): ParsedItem[] {
  const items: ParsedItem[] = [];

  // MAS lists items in <a> tags with class containing "card" or within list sections.
  // Pattern: <a href="/publications/..." or <a href="/news/..."
  const linkRe =
    /<a[^>]+href="(\/(?:publications|news)[^"]+)"[^>]*>([\s\S]*?)<\/a>/gi;
  let m: RegExpExecArray | null;

  while ((m = linkRe.exec(html)) !== null) {
    const path = m[1];
    const inner = stripHtml(m[2]);
    if (!inner || inner.length < 10) continue;

    // Try to extract date from nearby text (dd Mon yyyy pattern)
    const dateRe = /(\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\w*\s+\d{4})/i;
    const dateMatch = dateRe.exec(m[2]);

    items.push({
      title: inner.slice(0, 300),
      url: `https://www.mas.gov.sg${path}`,
      date: dateMatch ? dateMatch[1] : null,
      snippet: inner,
    });
  }

  // Deduplicate by URL
  const seen = new Set<string>();
  return items.filter((it) => {
    if (seen.has(it.url)) return false;
    seen.add(it.url);
    return true;
  });
}

function parseSgParliament(html: string): ParsedItem[] {
  const items: ParsedItem[] = [];
  // Parliament lists bills in table rows or <a> links with bill titles
  const rowRe =
    /<a[^>]+href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/gi;
  let m: RegExpExecArray | null;

  while ((m = rowRe.exec(html)) !== null) {
    const href = m[1];
    const inner = stripHtml(m[2]);
    if (!inner || inner.length < 10) continue;
    if (!/bill|act|amendment/i.test(inner) && inner.length < 30) continue;

    const fullUrl = href.startsWith('http')
      ? href
      : `https://www.parliament.gov.sg${href.startsWith('/') ? '' : '/'}${href}`;

    items.push({
      title: inner.slice(0, 300),
      url: fullUrl,
      date: null,
      snippet: inner,
    });
  }

  const seen = new Set<string>();
  return items.filter((it) => {
    if (seen.has(it.url)) return false;
    seen.add(it.url);
    return true;
  });
}

export async function collectSGBills(): Promise<{
  created: number;
  updated: number;
  errors: string[];
}> {
  let created = 0;
  let updated = 0;
  const errors: string[] = [];

  // 1. MAS Consultation Papers
  const masConsHtml = await safeFetch(MAS_CONSULTATION_URL, 'https://www.mas.gov.sg/');
  if (masConsHtml) {
    const items = parseMasPage(masConsHtml, 'MAS Consultation');
    const relevant = items.filter((it) =>
      matchesKeywords(`${it.title} ${it.snippet}`, SG_KEYWORDS),
    );
    console.log(
      `[asia-tracker][SG] MAS consultations: ${items.length} total, ${relevant.length} relevant`,
    );

    for (const item of relevant) {
      try {
        const billNumber = `SG-MAS-${hashId(item.url)}`;
        const result = await upsertRegulation({
          jurisdiction: 'SG',
          billNumber,
          title: item.title,
          sourceUrl: item.url,
          sourceName: 'MAS',
          rawContent: item.snippet,
          tags: ['consultation', ...inferTags(item.title)],
          researchArea: 'DIGITAL_FINANCE',
          proposedDate: item.date ? new Date(item.date) : null,
        });
        if (result === 'created') created++;
        if (result === 'updated') updated++;
      } catch (e: any) {
        errors.push(`SG-MAS: ${e.message}`);
      }
    }
  } else {
    console.log(
      '[asia-tracker][SG] Could not fetch MAS consultation page — may be JS-rendered',
    );
  }

  // 2. MAS Media Releases
  const masNewsHtml = await safeFetch(MAS_NEWS_URL, 'https://www.mas.gov.sg/');
  if (masNewsHtml) {
    const items = parseMasPage(masNewsHtml, 'MAS News');
    const relevant = items.filter((it) =>
      matchesKeywords(`${it.title} ${it.snippet}`, SG_KEYWORDS),
    );
    console.log(
      `[asia-tracker][SG] MAS news: ${items.length} total, ${relevant.length} relevant`,
    );

    for (const item of relevant) {
      try {
        const billNumber = `SG-MAS-${hashId(item.url)}`;
        const result = await upsertRegulation({
          jurisdiction: 'SG',
          billNumber,
          title: item.title,
          sourceUrl: item.url,
          sourceName: 'MAS',
          rawContent: item.snippet,
          tags: ['media-release', ...inferTags(item.title)],
          researchArea: 'DIGITAL_FINANCE',
          proposedDate: item.date ? new Date(item.date) : null,
        });
        if (result === 'created') created++;
        if (result === 'updated') updated++;
      } catch (e: any) {
        errors.push(`SG-MAS-news: ${e.message}`);
      }
    }
  }

  // 3. Singapore Parliament Bills
  const parlHtml = await safeFetch(SG_PARLIAMENT_URL, 'https://www.parliament.gov.sg/');
  if (parlHtml) {
    const items = parseSgParliament(parlHtml);
    const relevant = items.filter((it) =>
      matchesKeywords(`${it.title} ${it.snippet}`, SG_KEYWORDS),
    );
    console.log(
      `[asia-tracker][SG] Parliament bills: ${items.length} total, ${relevant.length} relevant`,
    );

    for (const item of relevant) {
      try {
        const billNumber = `SG-PARL-${hashId(item.url)}`;
        const result = await upsertRegulation({
          jurisdiction: 'SG',
          billNumber,
          title: item.title,
          sourceUrl: item.url,
          sourceName: 'Singapore Parliament',
          rawContent: item.snippet,
          tags: ['bill', ...inferTags(item.title)],
          researchArea: 'DIGITAL_FINANCE',
          proposedDate: item.date ? new Date(item.date) : null,
        });
        if (result === 'created') created++;
        if (result === 'updated') updated++;
      } catch (e: any) {
        errors.push(`SG-PARL: ${e.message}`);
      }
    }
  } else {
    console.log(
      '[asia-tracker][SG] Could not fetch Parliament page — may be JS-rendered',
    );
  }

  return { created, updated, errors };
}

// =====================================================================
// Japan (FSA / 金融庁 + Diet / 国会)
// =====================================================================
// FSA news: https://www.fsa.go.jp/news/index.html
// FSA policy: https://www.fsa.go.jp/policy/index.html
// Diet (国会) bills: https://www.shugiin.go.jp/internet/itdb_gian.nsf/html/gian/menu.htm

const FSA_NEWS_URL = 'https://www.fsa.go.jp/news/index.html';
const FSA_POLICY_URL = 'https://www.fsa.go.jp/policy/index.html';
const DIET_BILLS_URL =
  'https://www.shugiin.go.jp/internet/itdb_gian.nsf/html/gian/menu.htm';

function parseFsaPage(html: string): ParsedItem[] {
  const items: ParsedItem[] = [];

  // FSA lists news items as <a href="..."> within <li> or <dd> elements
  // Links are relative: /news/r6/... or /policy/...
  const linkRe =
    /<a[^>]+href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi;
  let m: RegExpExecArray | null;

  while ((m = linkRe.exec(html)) !== null) {
    let path = m[1];
    const inner = stripHtml(m[2]);
    if (!inner || inner.length < 5) continue;
    // Only keep FSA links (relative or absolute on fsa.go.jp)
    if (path.startsWith('http') && !path.includes('fsa.go.jp')) continue;

    const fullUrl = path.startsWith('http')
      ? path
      : `https://www.fsa.go.jp${path.startsWith('/') ? '' : '/'}${path}`;

    // Date pattern: yyyy年mm月dd日 or yyyy/mm/dd or Reiwa dates (令和)
    const dateRe =
      /(\d{4})[年/](\d{1,2})[月/](\d{1,2})/;
    const dateMatch = dateRe.exec(m[0]);
    let dateStr: string | null = null;
    if (dateMatch) {
      dateStr = `${dateMatch[1]}-${dateMatch[2].padStart(2, '0')}-${dateMatch[3].padStart(2, '0')}`;
    }

    items.push({
      title: inner.slice(0, 300),
      url: fullUrl,
      date: dateStr,
      snippet: inner,
    });
  }

  const seen = new Set<string>();
  return items.filter((it) => {
    if (seen.has(it.url)) return false;
    seen.add(it.url);
    return true;
  });
}

function parseDietPage(html: string): ParsedItem[] {
  const items: ParsedItem[] = [];

  // Diet bill pages list bills in tables with links
  const linkRe =
    /<a[^>]+href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi;
  let m: RegExpExecArray | null;

  while ((m = linkRe.exec(html)) !== null) {
    const href = m[1];
    const inner = stripHtml(m[2]);
    if (!inner || inner.length < 5) continue;

    const fullUrl = href.startsWith('http')
      ? href
      : `https://www.shugiin.go.jp${href.startsWith('/') ? '' : '/'}${href}`;

    items.push({
      title: inner.slice(0, 300),
      url: fullUrl,
      date: null,
      snippet: inner,
    });
  }

  const seen = new Set<string>();
  return items.filter((it) => {
    if (seen.has(it.url)) return false;
    seen.add(it.url);
    return true;
  });
}

export async function collectJPBills(): Promise<{
  created: number;
  updated: number;
  errors: string[];
}> {
  let created = 0;
  let updated = 0;
  const errors: string[] = [];

  // 1. FSA News
  const fsaNewsHtml = await safeFetch(FSA_NEWS_URL, 'https://www.fsa.go.jp/');
  if (fsaNewsHtml) {
    const items = parseFsaPage(fsaNewsHtml);
    const relevant = items.filter((it) =>
      matchesKeywords(`${it.title} ${it.snippet}`, JP_KEYWORDS),
    );
    console.log(
      `[asia-tracker][JP] FSA news: ${items.length} total, ${relevant.length} relevant`,
    );

    for (const item of relevant) {
      try {
        const billNumber = `JP-FSA-${hashId(item.url)}`;
        const result = await upsertRegulation({
          jurisdiction: 'JP',
          billNumber,
          title: item.title,
          sourceUrl: item.url,
          sourceName: 'FSA Japan',
          rawContent: item.snippet,
          tags: ['fsa-news', ...inferTags(item.title)],
          researchArea: 'DIGITAL_FINANCE',
          proposedDate: item.date ? new Date(item.date) : null,
        });
        if (result === 'created') created++;
        if (result === 'updated') updated++;
      } catch (e: any) {
        errors.push(`JP-FSA-news: ${e.message}`);
      }
    }
  } else {
    console.log(
      '[asia-tracker][JP] Could not fetch FSA news page — may be JS-rendered',
    );
  }

  // 2. FSA Policy
  const fsaPolicyHtml = await safeFetch(FSA_POLICY_URL, 'https://www.fsa.go.jp/');
  if (fsaPolicyHtml) {
    const items = parseFsaPage(fsaPolicyHtml);
    const relevant = items.filter((it) =>
      matchesKeywords(`${it.title} ${it.snippet}`, JP_KEYWORDS),
    );
    console.log(
      `[asia-tracker][JP] FSA policy: ${items.length} total, ${relevant.length} relevant`,
    );

    for (const item of relevant) {
      try {
        const billNumber = `JP-FSA-${hashId(item.url)}`;
        const result = await upsertRegulation({
          jurisdiction: 'JP',
          billNumber,
          title: item.title,
          sourceUrl: item.url,
          sourceName: 'FSA Japan',
          rawContent: item.snippet,
          tags: ['fsa-policy', ...inferTags(item.title)],
          researchArea: 'DIGITAL_FINANCE',
          proposedDate: item.date ? new Date(item.date) : null,
        });
        if (result === 'created') created++;
        if (result === 'updated') updated++;
      } catch (e: any) {
        errors.push(`JP-FSA-policy: ${e.message}`);
      }
    }
  }

  // 3. Diet (国会) Bills
  const dietHtml = await safeFetch(DIET_BILLS_URL, 'https://www.shugiin.go.jp/');
  if (dietHtml) {
    const items = parseDietPage(dietHtml);
    const relevant = items.filter((it) =>
      matchesKeywords(`${it.title} ${it.snippet}`, JP_KEYWORDS),
    );
    console.log(
      `[asia-tracker][JP] Diet bills: ${items.length} total, ${relevant.length} relevant`,
    );

    for (const item of relevant) {
      try {
        const billNumber = `JP-DIET-${hashId(item.url)}`;
        const result = await upsertRegulation({
          jurisdiction: 'JP',
          billNumber,
          title: item.title,
          sourceUrl: item.url,
          sourceName: 'Diet (国会)',
          rawContent: item.snippet,
          tags: ['diet-bill', ...inferTags(item.title)],
          researchArea: 'DIGITAL_FINANCE',
          proposedDate: item.date ? new Date(item.date) : null,
        });
        if (result === 'created') created++;
        if (result === 'updated') updated++;
      } catch (e: any) {
        errors.push(`JP-DIET: ${e.message}`);
      }
    }
  } else {
    console.log(
      '[asia-tracker][JP] Could not fetch Diet page — may be JS-rendered',
    );
  }

  return { created, updated, errors };
}

// =====================================================================
// Hong Kong (LegCo + SFC + HKMA)
// =====================================================================
// LegCo bills: https://www.legco.gov.hk/en/legco-business/council/bills.html
// SFC news: https://www.sfc.hk/en/News-and-announcements/Media-releases
// HKMA news: https://www.hkma.gov.hk/eng/news-and-media/press-releases/

const LEGCO_BILLS_URL =
  'https://www.legco.gov.hk/en/legco-business/council/bills.html';
const SFC_NEWS_URL =
  'https://www.sfc.hk/en/News-and-announcements/Media-releases';
const HKMA_NEWS_URL =
  'https://www.hkma.gov.hk/eng/news-and-media/press-releases/';

function parseLegcoPage(html: string): ParsedItem[] {
  const items: ParsedItem[] = [];

  const linkRe =
    /<a[^>]+href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi;
  let m: RegExpExecArray | null;

  while ((m = linkRe.exec(html)) !== null) {
    const href = m[1];
    const inner = stripHtml(m[2]);
    if (!inner || inner.length < 5) continue;

    const fullUrl = href.startsWith('http')
      ? href
      : `https://www.legco.gov.hk${href.startsWith('/') ? '' : '/'}${href}`;

    // Date pattern: dd/mm/yyyy or dd.mm.yyyy
    const dateRe = /(\d{1,2})[/.](\d{1,2})[/.](\d{4})/;
    const dateMatch = dateRe.exec(m[0]);
    let dateStr: string | null = null;
    if (dateMatch) {
      dateStr = `${dateMatch[3]}-${dateMatch[2].padStart(2, '0')}-${dateMatch[1].padStart(2, '0')}`;
    }

    items.push({
      title: inner.slice(0, 300),
      url: fullUrl,
      date: dateStr,
      snippet: inner,
    });
  }

  const seen = new Set<string>();
  return items.filter((it) => {
    if (seen.has(it.url)) return false;
    seen.add(it.url);
    return true;
  });
}

function parseSfcPage(html: string): ParsedItem[] {
  const items: ParsedItem[] = [];

  // SFC lists media releases with links
  const linkRe =
    /<a[^>]+href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi;
  let m: RegExpExecArray | null;

  while ((m = linkRe.exec(html)) !== null) {
    const href = m[1];
    const inner = stripHtml(m[2]);
    if (!inner || inner.length < 10) continue;

    const fullUrl = href.startsWith('http')
      ? href
      : `https://www.sfc.hk${href.startsWith('/') ? '' : '/'}${href}`;

    // Date: dd Mon yyyy
    const dateRe =
      /(\d{1,2})\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\w*\s+(\d{4})/i;
    const dateMatch = dateRe.exec(m[0]);
    let dateStr: string | null = null;
    if (dateMatch) {
      dateStr = `${dateMatch[1]} ${dateMatch[2]} ${dateMatch[3]}`;
    }

    items.push({
      title: inner.slice(0, 300),
      url: fullUrl,
      date: dateStr,
      snippet: inner,
    });
  }

  const seen = new Set<string>();
  return items.filter((it) => {
    if (seen.has(it.url)) return false;
    seen.add(it.url);
    return true;
  });
}

function parseHkmaPage(html: string): ParsedItem[] {
  const items: ParsedItem[] = [];

  const linkRe =
    /<a[^>]+href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi;
  let m: RegExpExecArray | null;

  while ((m = linkRe.exec(html)) !== null) {
    const href = m[1];
    const inner = stripHtml(m[2]);
    if (!inner || inner.length < 10) continue;
    if (href.includes('javascript:')) continue;

    const fullUrl = href.startsWith('http')
      ? href
      : `https://www.hkma.gov.hk${href.startsWith('/') ? '' : '/'}${href}`;

    // Date: dd/mm/yyyy or dd Mon yyyy
    const dateRe1 = /(\d{1,2})\/(\d{1,2})\/(\d{4})/;
    const dateRe2 =
      /(\d{1,2})\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\w*\s+(\d{4})/i;
    const dm1 = dateRe1.exec(m[0]);
    const dm2 = dateRe2.exec(m[0]);
    let dateStr: string | null = null;
    if (dm1) {
      dateStr = `${dm1[3]}-${dm1[2].padStart(2, '0')}-${dm1[1].padStart(2, '0')}`;
    } else if (dm2) {
      dateStr = `${dm2[1]} ${dm2[2]} ${dm2[3]}`;
    }

    items.push({
      title: inner.slice(0, 300),
      url: fullUrl,
      date: dateStr,
      snippet: inner,
    });
  }

  const seen = new Set<string>();
  return items.filter((it) => {
    if (seen.has(it.url)) return false;
    seen.add(it.url);
    return true;
  });
}

export async function collectHKBills(): Promise<{
  created: number;
  updated: number;
  errors: string[];
}> {
  let created = 0;
  let updated = 0;
  const errors: string[] = [];

  // 1. LegCo Bills
  const legcoHtml = await safeFetch(LEGCO_BILLS_URL, 'https://www.legco.gov.hk/');
  if (legcoHtml) {
    const items = parseLegcoPage(legcoHtml);
    const relevant = items.filter((it) =>
      matchesKeywords(`${it.title} ${it.snippet}`, HK_KEYWORDS),
    );
    console.log(
      `[asia-tracker][HK] LegCo bills: ${items.length} total, ${relevant.length} relevant`,
    );

    for (const item of relevant) {
      try {
        const billNumber = `HK-LEGCO-${hashId(item.url)}`;
        const result = await upsertRegulation({
          jurisdiction: 'HK',
          billNumber,
          title: item.title,
          sourceUrl: item.url,
          sourceName: 'LegCo',
          rawContent: item.snippet,
          tags: ['bill', ...inferTags(item.title)],
          researchArea: 'DIGITAL_FINANCE',
          proposedDate: item.date ? new Date(item.date) : null,
        });
        if (result === 'created') created++;
        if (result === 'updated') updated++;
      } catch (e: any) {
        errors.push(`HK-LEGCO: ${e.message}`);
      }
    }
  } else {
    console.log(
      '[asia-tracker][HK] Could not fetch LegCo page — may be JS-rendered',
    );
  }

  // 2. SFC Media Releases
  const sfcHtml = await safeFetch(SFC_NEWS_URL, 'https://www.sfc.hk/');
  if (sfcHtml) {
    const items = parseSfcPage(sfcHtml);
    const relevant = items.filter((it) =>
      matchesKeywords(`${it.title} ${it.snippet}`, HK_KEYWORDS),
    );
    console.log(
      `[asia-tracker][HK] SFC news: ${items.length} total, ${relevant.length} relevant`,
    );

    for (const item of relevant) {
      try {
        const billNumber = `HK-SFC-${hashId(item.url)}`;
        const result = await upsertRegulation({
          jurisdiction: 'HK',
          billNumber,
          title: item.title,
          sourceUrl: item.url,
          sourceName: 'SFC',
          rawContent: item.snippet,
          tags: ['sfc-circular', ...inferTags(item.title)],
          researchArea: 'DIGITAL_FINANCE',
          proposedDate: item.date ? new Date(item.date) : null,
        });
        if (result === 'created') created++;
        if (result === 'updated') updated++;
      } catch (e: any) {
        errors.push(`HK-SFC: ${e.message}`);
      }
    }
  } else {
    console.log(
      '[asia-tracker][HK] Could not fetch SFC page — may be JS-rendered',
    );
  }

  // 3. HKMA Press Releases
  const hkmaHtml = await safeFetch(HKMA_NEWS_URL, 'https://www.hkma.gov.hk/');
  if (hkmaHtml) {
    const items = parseHkmaPage(hkmaHtml);
    const relevant = items.filter((it) =>
      matchesKeywords(`${it.title} ${it.snippet}`, HK_KEYWORDS),
    );
    console.log(
      `[asia-tracker][HK] HKMA news: ${items.length} total, ${relevant.length} relevant`,
    );

    for (const item of relevant) {
      try {
        const billNumber = `HK-HKMA-${hashId(item.url)}`;
        const result = await upsertRegulation({
          jurisdiction: 'HK',
          billNumber,
          title: item.title,
          sourceUrl: item.url,
          sourceName: 'HKMA',
          rawContent: item.snippet,
          tags: ['hkma-press', ...inferTags(item.title)],
          researchArea: 'DIGITAL_FINANCE',
          proposedDate: item.date ? new Date(item.date) : null,
        });
        if (result === 'created') created++;
        if (result === 'updated') updated++;
      } catch (e: any) {
        errors.push(`HK-HKMA: ${e.message}`);
      }
    }
  } else {
    console.log(
      '[asia-tracker][HK] Could not fetch HKMA page — may be JS-rendered',
    );
  }

  return { created, updated, errors };
}

// =====================================================================
// Main orchestrator
// =====================================================================

export async function collectAllAsiaBills(): Promise<{
  sg: { created: number; updated: number; errors: string[] };
  jp: { created: number; updated: number; errors: string[] };
  hk: { created: number; updated: number; errors: string[] };
  total: { created: number; updated: number };
}> {
  console.log('[asia-tracker] Starting Asia bill collection...');

  const [sg, jp, hk] = await Promise.all([
    collectSGBills(),
    collectJPBills(),
    collectHKBills(),
  ]);

  const total = {
    created: sg.created + jp.created + hk.created,
    updated: sg.updated + jp.updated + hk.updated,
  };

  console.log(
    `[asia-tracker] Done. Created: ${total.created}, Updated: ${total.updated}`,
  );
  if (sg.errors.length) console.warn('[asia-tracker][SG] Errors:', sg.errors);
  if (jp.errors.length) console.warn('[asia-tracker][JP] Errors:', jp.errors);
  if (hk.errors.length) console.warn('[asia-tracker][HK] Errors:', hk.errors);

  return { sg, jp, hk, total };
}
