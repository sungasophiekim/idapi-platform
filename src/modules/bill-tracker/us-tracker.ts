// src/modules/bill-tracker/us-tracker.ts
// US Congress bill tracker for digital assets & AI regulation
// Source: https://api.congress.gov/v3/ (Congress.gov API)

import { prisma } from '@/lib/db';

const CONGRESS_API_KEY = process.env.CONGRESS_API_KEY || '';
const CONGRESS_API_BASE = 'https://api.congress.gov/v3';

const SEARCH_KEYWORDS = [
  'cryptocurrency', 'digital asset', 'blockchain', 'stablecoin',
  'virtual currency', 'crypto', 'token', 'bitcoin',
  'artificial intelligence', 'AI regulation',
];

// Target congresses: 118th (2023-2025) and 119th (2025-2027)
const TARGET_CONGRESSES = [118, 119];

const FETCH_TIMEOUT_MS = 15_000;

interface CongressBill {
  number: number;
  type: string;       // hr, s, hjres, sjres
  congress: number;
  title: string;
  latestAction: { text: string; actionDate: string };
  url: string;
  sponsors?: string;
}

interface CongressApiResponse {
  bills?: Array<{
    number: number;
    type: string;
    congress: number;
    title: string;
    latestAction?: { text: string; actionDate: string };
    url: string;
    sponsors?: Array<{ firstName: string; lastName: string }>;
  }>;
  pagination?: { count: number; next?: string };
}

// ─── Fetch bills from Congress.gov API ───
export async function fetchCongressBills(
  keyword: string,
  congress?: number,
): Promise<CongressBill[]> {
  const results: CongressBill[] = [];

  const params = new URLSearchParams({
    query: keyword,
    limit: '50',
    offset: '0',
    format: 'json',
  });
  if (CONGRESS_API_KEY) {
    params.set('api_key', CONGRESS_API_KEY);
  }

  const url = congress
    ? `${CONGRESS_API_BASE}/bill/${congress}?${params.toString()}`
    : `${CONGRESS_API_BASE}/bill?${params.toString()}`;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'IDAPI-Platform/1.0 (bill-tracker; contact@idapi.dev)',
        Accept: 'application/json',
      },
    });
    clearTimeout(timeout);

    if (!res.ok) {
      // If API returns 403/429, try fallback
      if (res.status === 403 || res.status === 429) {
        console.warn(`[us-tracker] Congress API returned ${res.status} for "${keyword}", trying fallback`);
        return fetchCongressBillsFallback(keyword, congress);
      }
      console.error(`[us-tracker] HTTP ${res.status} for keyword "${keyword}"`);
      return [];
    }

    const data: CongressApiResponse = await res.json();

    if (data.bills && Array.isArray(data.bills)) {
      for (const bill of data.bills) {
        // Filter by congress if specified
        if (congress && bill.congress !== congress) continue;

        results.push({
          number: bill.number,
          type: (bill.type || '').toLowerCase(),
          congress: bill.congress,
          title: bill.title || '',
          latestAction: bill.latestAction || { text: '', actionDate: '' },
          url: bill.url || `https://www.congress.gov/bill/${bill.congress}th-congress/${mapBillTypeToPath(bill.type)}/${bill.number}`,
          sponsors: bill.sponsors
            ? bill.sponsors.map(s => `${s.firstName} ${s.lastName}`).join(', ')
            : undefined,
        });
      }
    }

    console.log(`[us-tracker] keyword="${keyword}" congress=${congress || 'all'}: ${results.length} bills`);
  } catch (e: any) {
    if (e.name === 'AbortError') {
      console.error(`[us-tracker] Timeout fetching "${keyword}"`);
    } else {
      console.error(`[us-tracker] Fetch error for "${keyword}":`, e.message);
    }
    // Try fallback on any fetch error
    return fetchCongressBillsFallback(keyword, congress);
  }

  return results;
}

// ─── Fallback: scrape Congress.gov search page ───
async function fetchCongressBillsFallback(
  keyword: string,
  congress?: number,
): Promise<CongressBill[]> {
  const results: CongressBill[] = [];

  try {
    const searchQuery = JSON.stringify({
      source: 'legislation',
      search: keyword,
      ...(congress ? { congress: [String(congress)] } : {}),
    });
    const url = `https://www.congress.gov/search?q=${encodeURIComponent(searchQuery)}&pageSize=50`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        Accept: 'text/html',
      },
    });
    clearTimeout(timeout);

    if (!res.ok) {
      console.error(`[us-tracker] Fallback HTTP ${res.status}`);
      return [];
    }

    const html = await res.text();

    // Parse bill listings from search results HTML
    // Pattern: <span class="result-heading"><a href="/bill/119th-congress/house-bill/1234">H.R.1234</a></span>
    const billPattern = /class="result-heading">\s*<a href="\/bill\/(\d+)(?:th|st|nd|rd)-congress\/([\w-]+)\/(\d+)"[^>]*>([^<]+)<\/a>[\s\S]*?class="result-title"[^>]*>([^<]+)</g;
    let match;

    while ((match = billPattern.exec(html)) !== null) {
      const [, congressStr, typeSlug, numberStr, _billLabel, title] = match;
      const billCongress = parseInt(congressStr, 10);
      const billNumber = parseInt(numberStr, 10);
      const billType = mapPathToBillType(typeSlug);

      results.push({
        number: billNumber,
        type: billType,
        congress: billCongress,
        title: title.trim(),
        latestAction: { text: '', actionDate: '' },
        url: `https://www.congress.gov/bill/${congressStr}th-congress/${typeSlug}/${numberStr}`,
      });
    }

    console.log(`[us-tracker] Fallback for "${keyword}": ${results.length} bills parsed from HTML`);
  } catch (e: any) {
    console.error(`[us-tracker] Fallback error for "${keyword}":`, e.message);
  }

  return results;
}

// ─── Map Congress action text to RegulationStatus ───
function mapCongressStatus(action: string): string {
  const a = action.toLowerCase();

  // Enacted / signed into law
  if (a.includes('became public law') || a.includes('signed by president')) {
    return 'ENACTED';
  }

  // Passed both chambers or sent to president
  if (a.includes('passed both') || a.includes('sent to president') || a.includes('presented to president')) {
    return 'PASSED';
  }

  // Passed one chamber (floor vote)
  if (a.includes('passed house') || a.includes('passed senate') || a.includes('agreed to in')) {
    return 'FLOOR_VOTE';
  }

  // Committee stage
  if (
    a.includes('referred to') ||
    a.includes('committee') ||
    a.includes('reported by') ||
    a.includes('hearing') ||
    a.includes('markup')
  ) {
    return 'COMMITTEE';
  }

  // Vetoed / failed
  if (a.includes('vetoed') || a.includes('failed') || a.includes('rejected')) {
    return 'REJECTED';
  }

  // Default: introduced / proposed
  return 'PROPOSED';
}

// ─── Save a Congress bill as a Regulation record ───
export async function saveUSBillAsRegulation(
  bill: CongressBill,
): Promise<{ created: boolean; updated: boolean }> {
  const billNumber = `US-CONGRESS-${bill.congress}-${bill.type}${bill.number}`;
  const status = mapCongressStatus(bill.latestAction?.text || '') as any;

  const existing = await prisma.regulation.findFirst({
    where: { billNumber },
  });

  if (existing) {
    // Update if status changed
    if (existing.status !== status) {
      await prisma.regulation.update({
        where: { id: existing.id },
        data: {
          status,
          lastUpdatedDate: new Date(),
        },
      });

      await prisma.regulationEvent.create({
        data: {
          regulationId: existing.id,
          status,
          description: bill.latestAction?.text || `Status changed to ${status}`,
          descriptionEn: bill.latestAction?.text || `Status changed: ${existing.status} -> ${status}`,
          eventDate: bill.latestAction?.actionDate
            ? new Date(bill.latestAction.actionDate)
            : new Date(),
        },
      });

      return { created: false, updated: true };
    }
    return { created: false, updated: false };
  }

  // Determine research area based on title keywords
  const researchArea = inferResearchArea(bill.title);

  // Create new regulation
  const created = await prisma.regulation.create({
    data: {
      jurisdiction: 'US',
      status,
      title: bill.title,
      titleEn: bill.title, // Already in English
      sourceName: 'US Congress',
      sourceUrl: bill.url || `https://www.congress.gov/bill/${bill.congress}th-congress/${mapBillTypeToPath(bill.type)}/${bill.number}`,
      billNumber,
      proposedDate: bill.latestAction?.actionDate
        ? new Date(bill.latestAction.actionDate)
        : null,
      lastUpdatedDate: new Date(),
      tags: buildTags(bill),
      researchArea,
    },
  });

  await prisma.regulationEvent.create({
    data: {
      regulationId: created.id,
      status,
      description: bill.latestAction?.text || 'Bill introduced',
      descriptionEn: bill.latestAction?.text || 'Bill introduced',
      eventDate: bill.latestAction?.actionDate
        ? new Date(bill.latestAction.actionDate)
        : new Date(),
    },
  });

  return { created: true, updated: false };
}

// ─── Main: collect all crypto/AI bills from target congresses ───
export async function collectUSCongressBills(): Promise<{
  totalFetched: number;
  relevant: number;
  created: number;
  updated: number;
  errors: string[];
  keywordResults: Record<string, number>;
}> {
  const errors: string[] = [];
  const seen = new Set<string>(); // Deduplicate by "congress-type-number"
  const allBills: CongressBill[] = [];
  const keywordResults: Record<string, number> = {};

  for (const keyword of SEARCH_KEYWORDS) {
    for (const congress of TARGET_CONGRESSES) {
      try {
        const bills = await fetchCongressBills(keyword, congress);
        const key = `${keyword} (${congress}th)`;
        keywordResults[key] = bills.length;

        for (const bill of bills) {
          const dedupeKey = `${bill.congress}-${bill.type}-${bill.number}`;
          if (!seen.has(dedupeKey)) {
            seen.add(dedupeKey);
            allBills.push(bill);
          }
        }

        // Rate limit: Congress.gov allows ~1 req/sec without key
        if (!CONGRESS_API_KEY) {
          await delay(1200);
        } else {
          await delay(300);
        }
      } catch (e: any) {
        const errMsg = `Keyword "${keyword}" (${congress}th Congress): ${e.message}`;
        errors.push(errMsg);
        console.error(`[us-tracker] ${errMsg}`);
      }
    }
  }

  console.log(`[us-tracker] Total unique bills fetched: ${allBills.length}`);

  // Save all bills
  let created = 0;
  let updated = 0;
  for (const bill of allBills) {
    try {
      const result = await saveUSBillAsRegulation(bill);
      if (result.created) created++;
      if (result.updated) updated++;
    } catch (e: any) {
      const errMsg = `Save ${bill.type}${bill.number}: ${e.message}`;
      errors.push(errMsg);
      console.error(`[us-tracker] ${errMsg}`);
    }
  }

  const summary = {
    totalFetched: allBills.length,
    relevant: allBills.length, // All fetched bills are already keyword-matched
    created,
    updated,
    errors,
    keywordResults,
  };

  console.log(`[us-tracker] Done. created=${created}, updated=${updated}, errors=${errors.length}`);
  return summary;
}

// ─── Helpers ───

function mapBillTypeToPath(type: string): string {
  const map: Record<string, string> = {
    hr: 'house-bill',
    s: 'senate-bill',
    hjres: 'house-joint-resolution',
    sjres: 'senate-joint-resolution',
    hconres: 'house-concurrent-resolution',
    sconres: 'senate-concurrent-resolution',
    hres: 'house-resolution',
    sres: 'senate-resolution',
  };
  return map[type.toLowerCase()] || 'house-bill';
}

function mapPathToBillType(slug: string): string {
  const map: Record<string, string> = {
    'house-bill': 'hr',
    'senate-bill': 's',
    'house-joint-resolution': 'hjres',
    'senate-joint-resolution': 'sjres',
    'house-concurrent-resolution': 'hconres',
    'senate-concurrent-resolution': 'sconres',
    'house-resolution': 'hres',
    'senate-resolution': 'sres',
  };
  return map[slug] || 'hr';
}

function inferResearchArea(title: string): 'DIGITAL_FINANCE' | 'INFRASTRUCTURE' | 'KOREA_POLICY' | 'INCLUSION' {
  const t = title.toLowerCase();
  if (
    t.includes('stablecoin') || t.includes('payment') || t.includes('currency') ||
    t.includes('securities') || t.includes('exchange') || t.includes('financial') ||
    t.includes('token') || t.includes('bitcoin') || t.includes('crypto')
  ) {
    return 'DIGITAL_FINANCE';
  }
  if (
    t.includes('blockchain') || t.includes('infrastructure') ||
    t.includes('artificial intelligence') || t.includes(' ai ')
  ) {
    return 'INFRASTRUCTURE';
  }
  return 'DIGITAL_FINANCE'; // Default for US crypto/AI bills
}

function buildTags(bill: CongressBill): string[] {
  const tags: string[] = ['us-congress', `${bill.congress}th-congress`];

  const t = bill.title.toLowerCase();
  if (t.includes('crypto') || t.includes('digital asset') || t.includes('virtual currency')) {
    tags.push('crypto');
  }
  if (t.includes('stablecoin')) tags.push('stablecoin');
  if (t.includes('blockchain')) tags.push('blockchain');
  if (t.includes('artificial intelligence') || t.includes(' ai ')) tags.push('ai');
  if (t.includes('securities') || t.includes('sec ') || t.includes('cftc')) tags.push('securities');
  if (t.includes('defi') || t.includes('decentralized finance')) tags.push('defi');

  // Tag by bill type
  if (bill.type === 'hr' || bill.type === 'hres') tags.push('house');
  if (bill.type === 's' || bill.type === 'sres') tags.push('senate');

  if (bill.sponsors) tags.push('sponsored');

  return tags;
}

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
