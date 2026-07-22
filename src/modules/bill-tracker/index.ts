// src/modules/bill-tracker/index.ts
// Real-time Korean National Assembly bill tracker
// Source: https://open.assembly.go.kr OpenAPI

import { prisma } from '@/lib/db';
import { KEYWORDS_KO } from '@/modules/taxonomy';

const ASSEMBLY_API_KEY = process.env.ASSEMBLY_API_KEY || '';
const ASSEMBLY_BASE = 'https://open.assembly.go.kr/portal/openapi';

// Live KR filter keywords — single source of truth across all 5 focus areas
// (AI governance, DPI, digital identity, data governance, digital assets).
const TARGET_KEYWORDS = KEYWORDS_KO;

interface AssemblyBill {
  BILL_ID: string;
  BILL_NO: string;
  BILL_NAME: string;
  PROPOSER: string;
  PROPOSER_KIND?: string;
  PROPOSE_DT: string;
  AGE: string;
  CURR_COMMITTEE_ID?: string | null;
  CURR_COMMITTEE?: string | null;
  COMMITTEE_DT?: string | null;
  COMMITTEE_PROC_DT?: string | null;
  LAW_PROC_RESULT_CD?: string | null;
  LAW_PROC_DT?: string | null;
  CMT_PROC_RESULT_CD?: string | null;
  CMT_PROC_DT?: string | null;
  PROC_DT?: string | null;
  PROC_RESULT_CD?: string | null;
  PASS_GUBUN?: string | null;       // 계류의안 / 처리의안
  RST_PROPOSER?: string;
  LINK_URL?: string;
}

// ─── Fetch bills from Assembly API ───
export async function fetchBills(opts: {
  age?: string;          // 22 for 22nd National Assembly
  keyword?: string;
  pageSize?: number;
  pageIndex?: number;
} = {}): Promise<AssemblyBill[]> {
  if (!ASSEMBLY_API_KEY) {
    console.error('[bill-tracker] ASSEMBLY_API_KEY not set');
    return [];
  }

  const endpoint = 'TVBPMBILL11';
  const params = new URLSearchParams({
    KEY: ASSEMBLY_API_KEY,
    Type: 'json',
    pIndex: String(opts.pageIndex || 1),
    pSize: String(opts.pageSize || 100),
    AGE: opts.age || '22',
  });
  if (opts.keyword) params.set('BILL_NAME', opts.keyword);

  try {
    const url = `${ASSEMBLY_BASE}/${endpoint}?${params.toString()}`;
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': 'https://open.assembly.go.kr/',
        'Accept': 'application/json',
      },
    });

    if (!res.ok) {
      console.error(`[bill-tracker] HTTP ${res.status}`);
      return [];
    }

    const data = await res.json();
    const root = data[endpoint];
    if (!root || !Array.isArray(root)) return [];

    const rowEntry = root.find((x: any) => x.row);
    if (!rowEntry) return [];

    console.log(`[bill-tracker] page ${opts.pageIndex || 1}: got ${rowEntry.row.length} bills`);
    return rowEntry.row;
  } catch (e: any) {
    console.error(`[bill-tracker] fetch error:`, e.message);
    return [];
  }
}

// ─── Filter bills by digital asset / AI keywords ───
export function filterRelevantBills(bills: AssemblyBill[]): AssemblyBill[] {
  return bills.filter(b => {
    const text = `${b.BILL_NAME || ''}`.toLowerCase();
    return TARGET_KEYWORDS.some(kw => text.includes(kw.toLowerCase()));
  });
}

// ─── Map status code to readable status ───
function mapStatus(bill: AssemblyBill): string {
  const result = bill.PROC_RESULT_CD || bill.LAW_PROC_RESULT_CD || bill.CMT_PROC_RESULT_CD || '';
  if (result.includes('가결') || result.includes('원안가결') || result.includes('수정가결')) return 'PASSED';
  if (result.includes('부결')) return 'REJECTED';
  if (result.includes('철회')) return 'WITHDRAWN';
  if (result.includes('폐기') || result.includes('대안반영')) return 'WITHDRAWN';
  if (bill.PASS_GUBUN === '처리의안') return 'COMMITTEE';
  if (bill.COMMITTEE_DT) return 'COMMITTEE';
  return 'PROPOSED';
}

// ─── Save bill to Regulation table ───
export async function saveBillAsRegulation(bill: AssemblyBill): Promise<{ created: boolean; updated: boolean }> {
  const billNumber = `KR-NA-${bill.BILL_NO || bill.BILL_ID}`;
  const status = mapStatus(bill) as any;

  const existing = await prisma.regulation.findFirst({
    where: { billNumber },
  });

  if (existing) {
    if (existing.status !== status) {
      await prisma.regulation.update({
        where: { id: existing.id },
        data: { status, lastUpdatedDate: new Date() },
      });
      await prisma.regulationEvent.create({
        data: {
          regulationId: existing.id,
          status,
          description: `상태 변경: ${existing.status} → ${status}`,
          descriptionEn: `Status changed: ${existing.status} → ${status}`,
          eventDate: new Date(),
        },
      });
      return { created: false, updated: true };
    }
    return { created: false, updated: false };
  }

  // Create new
  const created = await prisma.regulation.create({
    data: {
      jurisdiction: 'KR',
      status,
      title: bill.BILL_NAME,
      sourceName: '대한민국 국회',
      sourceUrl: bill.LINK_URL || `https://likms.assembly.go.kr/bill/billDetail.do?billId=${bill.BILL_ID}`,
      billNumber,
      proposedDate: bill.PROPOSE_DT ? new Date(bill.PROPOSE_DT) : null,
      lastUpdatedDate: new Date(),
      tags: ['national-assembly', '22nd-assembly'],
      researchArea: 'KOREA_POLICY',
    },
  });

  await prisma.regulationEvent.create({
    data: {
      regulationId: created.id,
      status,
      description: `법안 발의: ${bill.PROPOSER || '미상'} 의원 외`,
      descriptionEn: `Bill introduced by ${bill.PROPOSER || 'unknown'}`,
      eventDate: bill.PROPOSE_DT ? new Date(bill.PROPOSE_DT) : new Date(),
    },
  });

  return { created: true, updated: false };
}

// ─── Main: collect by searching for each keyword ───
// Most efficient: search by keyword instead of fetching all 17,883 bills
const SEARCH_KEYWORDS = [
  '가상자산', '디지털자산', '암호화폐', '암호자산', '블록체인',
  '스테이블코인', '토큰증권', '인공지능', 'AI',
];

export async function collectAssemblyBills(): Promise<{
  totalFetched: number;
  relevant: number;
  created: number;
  updated: number;
  errors: string[];
  keywordResults: Record<string, number>;
}> {
  const errors: string[] = [];
  const seen = new Set<string>();
  const allBills: AssemblyBill[] = [];
  const keywordResults: Record<string, number> = {};

  for (const keyword of SEARCH_KEYWORDS) {
    try {
      // Search per keyword (max 100 per query)
      const bills = await fetchBills({ keyword, pageSize: 100, pageIndex: 1, age: '22' });
      keywordResults[keyword] = bills.length;

      for (const b of bills) {
        if (!seen.has(b.BILL_ID)) {
          seen.add(b.BILL_ID);
          allBills.push(b);
        }
      }
    } catch (e: any) {
      errors.push(`Keyword "${keyword}": ${e.message}`);
    }
  }

  // Filter by full keyword match (defense in depth)
  const relevant = filterRelevantBills(allBills);

  // Save
  let created = 0;
  let updated = 0;
  for (const bill of relevant) {
    try {
      const result = await saveBillAsRegulation(bill);
      if (result.created) created++;
      if (result.updated) updated++;
    } catch (e: any) {
      errors.push(`${bill.BILL_NAME}: ${e.message}`);
    }
  }

  return {
    totalFetched: allBills.length,
    relevant: relevant.length,
    created,
    updated,
    errors,
    keywordResults,
  };
}
