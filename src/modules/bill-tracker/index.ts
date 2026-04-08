// src/modules/bill-tracker/index.ts
// Real-time Korean National Assembly bill tracker
// Source: https://open.assembly.go.kr OpenAPI

import { prisma } from '@/lib/db';

const ASSEMBLY_API_KEY = process.env.ASSEMBLY_API_KEY || '';
const ASSEMBLY_BASE = 'https://open.assembly.go.kr/portal/openapi';

// Keywords for digital asset & AI bill filtering
const TARGET_KEYWORDS = [
  // Digital assets
  '가상자산', '디지털자산', '암호화폐', '암호자산', '블록체인',
  '스테이블코인', '토큰', 'NFT', 'STO', 'ICO', '비트코인',
  '가상화폐', 'CBDC', '디지털화폐', 'DAO', '디파이', 'DeFi',
  // AI
  '인공지능', 'AI', '머신러닝', '딥러닝', '생성형',
  '알고리즘', '자동화의사결정', 'GPT',
  // Related
  'VASP', '거래소', '메타버스',
];

interface AssemblyBill {
  BILL_ID: string;
  BILL_NO: string;
  BILL_NAME: string;          // 의안명
  PROPOSER: string;           // 제안자
  PROPOSE_DT: string;         // 제안일
  COMMITTEE: string;          // 소관위원회
  PROC_DT?: string;           // 처리일
  PROC_RESULT_CD?: string;    // 처리결과
  CURR_COMMITTEE?: string;    // 현 위원회
  GENERAL_RESULT?: string;    // 본회의 결과
  AGE: string;                // 대수 (예: 22 = 22대 국회)
  DETAIL_LINK?: string;
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

  // Try multiple service endpoints (different APIs may be activated)
  const endpoints = ['nzmimeepazxkubdpn', 'TVBPMBILL11', 'nwbpacrgavhjryiph'];
  const params = new URLSearchParams({
    KEY: ASSEMBLY_API_KEY,
    Type: 'json',
    pIndex: String(opts.pageIndex || 1),
    pSize: String(opts.pageSize || 100),
    AGE: opts.age || '22',
  });
  if (opts.keyword) params.set('BILL_NAME', opts.keyword);

  for (const endpoint of endpoints) {
    try {
      const url = `${ASSEMBLY_BASE}/${endpoint}?${params.toString()}`;
      const res = await fetch(url, {
        headers: { 'User-Agent': 'Mozilla/5.0', 'Accept': 'application/json' },
      });

      if (!res.ok) {
        console.log(`[bill-tracker] ${endpoint}: HTTP ${res.status}`);
        continue;
      }

      const data = await res.json();
      const root = data[endpoint];
      if (!root || !Array.isArray(root)) continue;

      // Find the row data (usually in second array element)
      const rowEntry = root.find((x: any) => x.row);
      if (!rowEntry) continue;

      console.log(`[bill-tracker] ${endpoint}: got ${rowEntry.row.length} bills`);
      return rowEntry.row;
    } catch (e: any) {
      console.error(`[bill-tracker] ${endpoint} error:`, e.message);
    }
  }

  return [];
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
  if (bill.GENERAL_RESULT?.includes('가결')) return 'PASSED';
  if (bill.GENERAL_RESULT?.includes('부결')) return 'REJECTED';
  if (bill.PROC_RESULT_CD?.includes('철회')) return 'WITHDRAWN';
  if (bill.PROC_DT) return 'COMMITTEE';
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
      sourceUrl: bill.DETAIL_LINK || `https://likms.assembly.go.kr/bill/billDetail.do?billId=${bill.BILL_ID}`,
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

// ─── Main: collect all relevant bills ───
export async function collectAssemblyBills(): Promise<{
  totalFetched: number;
  relevant: number;
  created: number;
  updated: number;
  errors: string[];
}> {
  const errors: string[] = [];
  let totalFetched = 0;
  let created = 0;
  let updated = 0;
  const allRelevant: AssemblyBill[] = [];

  // Fetch multiple pages
  for (let page = 1; page <= 10; page++) {
    try {
      const bills = await fetchBills({ pageIndex: page, pageSize: 100, age: '22' });
      if (bills.length === 0) break;
      totalFetched += bills.length;

      const relevant = filterRelevantBills(bills);
      allRelevant.push(...relevant);

      if (bills.length < 100) break;
    } catch (e: any) {
      errors.push(`Page ${page}: ${e.message}`);
    }
  }

  // Save relevant bills
  for (const bill of allRelevant) {
    try {
      const result = await saveBillAsRegulation(bill);
      if (result.created) created++;
      if (result.updated) updated++;
    } catch (e: any) {
      errors.push(`${bill.BILL_NAME}: ${e.message}`);
    }
  }

  return {
    totalFetched,
    relevant: allRelevant.length,
    created,
    updated,
    errors,
  };
}
