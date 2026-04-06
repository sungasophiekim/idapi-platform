// src/modules/bill-collector/index.ts
// Automated bill/regulation collector from public government APIs
// Targets: Korea National Assembly, SEC, EU EUR-Lex, Singapore MAS
// Filters for digital asset / crypto / blockchain relevant bills only

export interface CollectedBill {
  sourceId: string;
  jurisdiction: string;
  billNumber: string;
  title: string;
  proposer?: string;          // 발의자 / sponsor
  proposedDate: string;       // YYYY-MM-DD
  status: string;             // 원본 상태값
  committee?: string;         // 소관위원회
  summary?: string;
  fullTextUrl?: string;       // Link to full text
  rawData?: any;              // Original API response
}

// ─── Keywords that indicate digital asset relevance ───
const CRYPTO_KEYWORDS_KO = [
  '가상자산', '디지털자산', '암호화폐', '가상화폐', '블록체인',
  '토큰증권', '스테이블코인', '디지털화폐', '중앙은행디지털',
  '코인', '거래소', 'NFT', '분산원장', '디파이', 'DeFi',
  '특정금융거래', '자금세탁', 'AML', '전자금융',
  '토큰', '디지털금융', '핀테크', '전자증권',
];

const CRYPTO_KEYWORDS_EN = [
  'crypto', 'digital asset', 'virtual asset', 'blockchain',
  'stablecoin', 'token', 'cryptocurrency', 'CBDC',
  'decentralized finance', 'defi', 'NFT', 'distributed ledger',
  'money laundering', 'AML', 'KYC', 'fintech',
  'securities token', 'tokeniz', 'digital currency',
  'exchange-traded', 'crypto asset',
];

function isCryptoRelevant(text: string, lang: 'ko' | 'en'): boolean {
  const lower = text.toLowerCase();
  const keywords = lang === 'ko' ? CRYPTO_KEYWORDS_KO : CRYPTO_KEYWORDS_EN;
  return keywords.some(kw => lower.includes(kw.toLowerCase()));
}

// ═══════════════════════════════════════════════════════════════
// KOREA: 열린국회정보 Open API
// API: https://open.assembly.go.kr
// Endpoint: 국회의원 발의법률안 + 의안정보통합
// ═══════════════════════════════════════════════════════════════

export async function collectKoreaBills(options?: {
  apiKey?: string;
  age?: string;     // 국회 대수 (e.g. "22" for 22대 국회)
  pageSize?: number;
  maxPages?: number;
}): Promise<CollectedBill[]> {
  const apiKey = options?.apiKey || process.env.KOREA_ASSEMBLY_API_KEY;
  if (!apiKey) {
    console.warn('[BillCollector] KOREA_ASSEMBLY_API_KEY not set, skipping Korea');
    return [];
  }

  const age = options?.age || '22';  // 22대 국회 (2024~)
  const pageSize = options?.pageSize || 100;
  const maxPages = options?.maxPages || 5;
  const bills: CollectedBill[] = [];

  console.log(`[BillCollector/KR] Fetching bills from ${age}th National Assembly...`);

  for (let page = 1; page <= maxPages; page++) {
    try {
      // 열린국회정보 API: 국회의원 발의법률안
      const url = `https://open.assembly.go.kr/portal/openapi/nzmimeepazxkubdpn?Key=${apiKey}&Type=json&pIndex=${page}&pSize=${pageSize}&AGE=${age}`;
      
      const res = await fetch(url, { signal: AbortSignal.timeout(15000) });
      if (!res.ok) { console.warn(`[BillCollector/KR] Page ${page}: HTTP ${res.status}`); break; }
      
      const data = await res.json();
      const rows = data?.nzmimeepazxkubdpn?.[1]?.row;
      if (!rows || rows.length === 0) break;

      for (const row of rows) {
        const title = row.BILL_NAME || '';
        const summary = row.SUMMARY || '';
        
        // Filter: only crypto/digital asset related bills
        if (!isCryptoRelevant(title + ' ' + summary, 'ko')) continue;

        bills.push({
          sourceId: 'kr-assembly',
          jurisdiction: 'KR',
          billNumber: row.BILL_NO || '',
          title: title,
          proposer: row.PROPOSER || row.PUBL_PROPOSER || '',
          proposedDate: row.PROPOSE_DT || '',
          status: row.PROC_RESULT || row.COMMITTEE_PROC_RESULT || '계류중',
          committee: row.CURR_COMMITTEE || row.COMMITTEE || '',
          summary: summary,
          fullTextUrl: row.LINK_URL || `https://likms.assembly.go.kr/bill/billDetail.do?billId=${row.BILL_ID}`,
          rawData: row,
        });
      }

      console.log(`[BillCollector/KR] Page ${page}: ${rows.length} total, ${bills.length} crypto-relevant so far`);
      
      if (rows.length < pageSize) break; // Last page
    } catch (err: any) {
      console.error(`[BillCollector/KR] Page ${page} error: ${err.message}`);
      break;
    }
  }

  console.log(`[BillCollector/KR] Complete: ${bills.length} crypto-relevant bills found`);
  return bills;
}

// ═══════════════════════════════════════════════════════════════
// USA: SEC EDGAR Full-Text Search API
// API: https://efts.sec.gov/LATEST/search-index
// Free, no API key required, 10 requests/sec
// ═══════════════════════════════════════════════════════════════

export async function collectSECFilings(options?: {
  query?: string;
  dateRange?: string;    // e.g. "2024-01-01,2026-12-31"
  maxResults?: number;
}): Promise<CollectedBill[]> {
  const query = options?.query || '"digital asset" OR "cryptocurrency" OR "stablecoin" OR "crypto asset" OR "blockchain"';
  const maxResults = options?.maxResults || 50;
  const bills: CollectedBill[] = [];

  console.log(`[BillCollector/US-SEC] Searching EDGAR for: ${query.slice(0, 50)}...`);

  try {
    // SEC EFTS (EDGAR Full-Text Search) API
    const params = new URLSearchParams({
      q: query,
      dateRange: options?.dateRange || 'custom',
      startdt: '2024-01-01',
      enddt: new Date().toISOString().slice(0, 10),
      forms: 'rule-proposal,rule-final,release,interpretive',  // Rulemaking forms
    });

    const url = `https://efts.sec.gov/LATEST/search-index?${params}&from=0&size=${maxResults}`;
    
    const res = await fetch(url, {
      signal: AbortSignal.timeout(15000),
      headers: { 'User-Agent': 'IDAPI-PolicyBot/1.0 (research@idapi.kr)', 'Accept': 'application/json' },
    });

    if (!res.ok) {
      console.warn(`[BillCollector/US-SEC] EFTS returned ${res.status}, trying fallback...`);
      return collectSECPressFallback();
    }

    const data = await res.json();
    const hits = data?.hits?.hits || [];

    for (const hit of hits) {
      const source = hit._source || {};
      bills.push({
        sourceId: 'us-sec',
        jurisdiction: 'US',
        billNumber: source.file_num || source.accession_no || '',
        title: source.display_names?.[0] || source.file_description || 'SEC Filing',
        proposedDate: source.file_date || '',
        status: source.form_type || 'Filed',
        summary: source.file_description || '',
        fullTextUrl: `https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&filenum=${source.file_num}`,
        rawData: source,
      });
    }
  } catch (err: any) {
    console.error(`[BillCollector/US-SEC] Error: ${err.message}`);
    return collectSECPressFallback();
  }

  console.log(`[BillCollector/US-SEC] Complete: ${bills.length} filings found`);
  return bills;
}

// Fallback: SEC press releases RSS
async function collectSECPressFallback(): Promise<CollectedBill[]> {
  console.log(`[BillCollector/US-SEC] Using press release fallback...`);
  try {
    const res = await fetch('https://www.sec.gov/rss/news/press-releases.xml', {
      signal: AbortSignal.timeout(10000),
      headers: { 'User-Agent': 'IDAPI-PolicyBot/1.0' },
    });
    if (!res.ok) return [];
    
    const xml = await res.text();
    const items = xml.match(/<item[\s>](.*?)<\/item>/gs) || [];
    const bills: CollectedBill[] = [];

    for (const item of items.slice(0, 30)) {
      const title = (item.match(/<title>(.*?)<\/title>/s)?.[1] || '').replace(/<!\[CDATA\[|\]\]>/g, '').trim();
      if (!isCryptoRelevant(title, 'en')) continue;

      const link = item.match(/<link>(.*?)<\/link>/s)?.[1] || '';
      const pubDate = item.match(/<pubDate>(.*?)<\/pubDate>/s)?.[1] || '';
      const desc = (item.match(/<description>(.*?)<\/description>/s)?.[1] || '').replace(/<[^>]*>/g, '').trim();

      bills.push({
        sourceId: 'us-sec-press',
        jurisdiction: 'US',
        billNumber: '',
        title,
        proposedDate: pubDate ? new Date(pubDate).toISOString().slice(0, 10) : '',
        status: 'Press Release',
        summary: desc.slice(0, 500),
        fullTextUrl: link,
      });
    }
    return bills;
  } catch { return []; }
}

// ═══════════════════════════════════════════════════════════════
// EU: EUR-Lex SPARQL / Search API
// Free access, no API key for basic search
// ═══════════════════════════════════════════════════════════════

export async function collectEURegulations(options?: {
  maxResults?: number;
}): Promise<CollectedBill[]> {
  const maxResults = options?.maxResults || 30;
  const bills: CollectedBill[] = [];

  console.log(`[BillCollector/EU] Searching EUR-Lex...`);

  try {
    // EUR-Lex search API (simplified)
    const query = encodeURIComponent('crypto OR "digital asset" OR "Markets in Crypto-Assets" OR MiCA OR stablecoin');
    const url = `https://eur-lex.europa.eu/search.html?SUBDOM_INIT=LEGISLATION&DTS_SUBDOM=LEGISLATION&DTS_DOM=ALL&lang=en&type=advanced&qid=idapi&page=1&text=${query}`;
    
    // EUR-Lex doesn't have a clean JSON API, so we use their RSS/Atom feed
    const rssUrl = `https://eur-lex.europa.eu/EN/display-feed.html?rssId=EURLEX_RSS_LEGISLATION&format=rss`;
    const res = await fetch(rssUrl, {
      signal: AbortSignal.timeout(15000),
      headers: { 'User-Agent': 'IDAPI-PolicyBot/1.0' },
    });

    if (!res.ok) {
      console.warn(`[BillCollector/EU] RSS returned ${res.status}`);
      return [];
    }

    const xml = await res.text();
    const items = xml.match(/<item[\s>](.*?)<\/item>/gs) || [];

    for (const item of items.slice(0, maxResults)) {
      const title = (item.match(/<title>(.*?)<\/title>/s)?.[1] || '').replace(/<!\[CDATA\[|\]\]>/g, '').trim();
      if (!isCryptoRelevant(title, 'en')) continue;

      const link = item.match(/<link>(.*?)<\/link>/s)?.[1] || '';
      const pubDate = item.match(/<pubDate>(.*?)<\/pubDate>/s)?.[1] || '';
      const desc = (item.match(/<description>(.*?)<\/description>/s)?.[1] || '').replace(/<[^>]*>/g, '').trim();

      bills.push({
        sourceId: 'eu-eurlex',
        jurisdiction: 'EU',
        billNumber: '',
        title,
        proposedDate: pubDate ? new Date(pubDate).toISOString().slice(0, 10) : '',
        status: 'Legislation',
        summary: desc.slice(0, 500),
        fullTextUrl: link,
      });
    }
  } catch (err: any) {
    console.error(`[BillCollector/EU] Error: ${err.message}`);
  }

  console.log(`[BillCollector/EU] Complete: ${bills.length} items found`);
  return bills;
}

// ═══════════════════════════════════════════════════════════════
// ORCHESTRATOR: Run all collectors
// ═══════════════════════════════════════════════════════════════

export interface BillCollectionResult {
  totalCollected: number;
  byJurisdiction: Record<string, number>;
  bills: CollectedBill[];
  errors: string[];
  duration: number;
}

export async function collectAllBills(): Promise<BillCollectionResult> {
  const start = Date.now();
  const errors: string[] = [];
  const allBills: CollectedBill[] = [];

  console.log('\n[BillCollector] Starting collection from all sources...\n');

  // Run collectors in parallel
  const results = await Promise.allSettled([
    collectKoreaBills(),
    collectSECFilings(),
    collectEURegulations(),
  ]);

  for (const result of results) {
    if (result.status === 'fulfilled') {
      allBills.push(...result.value);
    } else {
      errors.push(result.reason?.message || 'Unknown error');
    }
  }

  // Deduplicate by title similarity
  const seen = new Set<string>();
  const deduped = allBills.filter(b => {
    const key = b.title.toLowerCase().replace(/[^a-z가-힣0-9]/g, '').slice(0, 50);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  // Count by jurisdiction
  const byJurisdiction: Record<string, number> = {};
  for (const bill of deduped) {
    byJurisdiction[bill.jurisdiction] = (byJurisdiction[bill.jurisdiction] || 0) + 1;
  }

  const duration = Date.now() - start;
  console.log(`\n[BillCollector] Complete: ${deduped.length} bills in ${duration}ms`);
  console.log(`[BillCollector] By jurisdiction: ${JSON.stringify(byJurisdiction)}\n`);

  return { totalCollected: deduped.length, byJurisdiction, bills: deduped, errors, duration };
}

// ═══════════════════════════════════════════════════════════════
// DB INTEGRATION: Save collected bills as Regulations
// ═══════════════════════════════════════════════════════════════

export async function saveBillsToDb(bills: CollectedBill[], prisma: any): Promise<number> {
  let saved = 0;

  for (const bill of bills) {
    // Check if already exists (by billNumber + jurisdiction)
    const existing = await prisma.regulation.findFirst({
      where: {
        OR: [
          { billNumber: bill.billNumber, jurisdiction: bill.jurisdiction },
          { title: bill.title, jurisdiction: bill.jurisdiction },
        ],
      },
    });

    if (existing) {
      // Update status if changed
      if (existing.status !== mapStatus(bill.status)) {
        await prisma.regulation.update({
          where: { id: existing.id },
          data: {
            status: mapStatus(bill.status),
            lastUpdatedDate: new Date(),
          },
        });
        // Add timeline event
        await prisma.regulationEvent.create({
          data: {
            regulationId: existing.id,
            status: mapStatus(bill.status),
            description: `상태 변경: ${bill.status}`,
            descriptionEn: `Status update: ${bill.status}`,
            eventDate: new Date(),
          },
        });
      }
      continue;
    }

    // Create new regulation
    try {
      await prisma.regulation.create({
        data: {
          jurisdiction: bill.jurisdiction as any,
          status: mapStatus(bill.status),
          title: bill.title,
          summary: bill.summary,
          sourceUrl: bill.fullTextUrl,
          sourceName: getSourceName(bill.sourceId),
          billNumber: bill.billNumber,
          tags: extractTags(bill.title + ' ' + (bill.summary || '')),
          proposedDate: bill.proposedDate ? new Date(bill.proposedDate) : null,
          lastUpdatedDate: new Date(),
          rawContent: bill.summary || null,
          timelineEvents: {
            create: {
              status: mapStatus(bill.status),
              description: `법안 수집: ${bill.title}`,
              descriptionEn: `Bill collected: ${bill.title}`,
              eventDate: bill.proposedDate ? new Date(bill.proposedDate) : new Date(),
            },
          },
        },
      });
      saved++;
    } catch (err: any) {
      console.error(`[BillCollector] Failed to save: ${bill.title.slice(0, 40)} - ${err.message}`);
    }
  }

  console.log(`[BillCollector] Saved ${saved} new regulations to DB`);
  return saved;
}

// ─── Helpers ───

function mapStatus(rawStatus: string): string {
  const lower = rawStatus.toLowerCase();
  if (lower.includes('원안가결') || lower.includes('수정가결') || lower.includes('enacted') || lower.includes('passed')) return 'ENACTED';
  if (lower.includes('통과') || lower.includes('approved')) return 'PASSED';
  if (lower.includes('위원회') || lower.includes('committee') || lower.includes('심사')) return 'COMMITTEE';
  if (lower.includes('폐기') || lower.includes('rejected') || lower.includes('부결')) return 'REJECTED';
  if (lower.includes('철회') || lower.includes('withdrawn')) return 'WITHDRAWN';
  if (lower.includes('본회의') || lower.includes('floor')) return 'FLOOR_VOTE';
  return 'PROPOSED';
}

function getSourceName(sourceId: string): string {
  const names: Record<string, string> = {
    'kr-assembly': '대한민국 국회',
    'us-sec': 'U.S. SEC',
    'us-sec-press': 'U.S. SEC (Press)',
    'eu-eurlex': 'EUR-Lex',
  };
  return names[sourceId] || sourceId;
}

function extractTags(text: string): string[] {
  const tags: string[] = [];
  const lower = text.toLowerCase();
  
  const TAG_MAP: Record<string, string> = {
    'stablecoin': 'stablecoin', '스테이블코인': 'stablecoin',
    'cbdc': 'CBDC', '디지털화폐': 'CBDC',
    'aml': 'AML', '자금세탁': 'AML',
    'defi': 'DeFi', '디파이': 'DeFi',
    'nft': 'NFT',
    'token': 'token', '토큰': 'token',
    'exchange': 'exchange', '거래소': 'exchange',
    'custody': 'custody', '수탁': 'custody',
    'tax': 'taxation', '과세': 'taxation',
    'license': 'licensing', '인가': 'licensing',
    'consumer protection': 'consumer-protection', '이용자보호': 'consumer-protection',
  };

  for (const [keyword, tag] of Object.entries(TAG_MAP)) {
    if (lower.includes(keyword.toLowerCase()) && !tags.includes(tag)) {
      tags.push(tag);
    }
  }
  return tags;
}
