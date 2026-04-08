// src/app/api/bill-tracker/route.ts
// POST: Trigger Korean National Assembly bill collection
// GET: Test API connectivity

export const maxDuration = 300;
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getAuthUser, requireRole } from '@/lib/auth';
import { UserRole } from '@prisma/client';
import { collectAssemblyBills, fetchBills, filterRelevantBills } from '@/modules/bill-tracker';

export async function GET() {
  // Test endpoint - admin only
  const user = await getAuthUser();
  if (!requireRole(user, [UserRole.ADMIN, UserRole.RESEARCHER])) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Try to fetch a small sample
  const bills = await fetchBills({ pageSize: 10, pageIndex: 1, age: '22' });
  const relevant = filterRelevantBills(bills);

  return NextResponse.json({
    apiKeySet: !!process.env.ASSEMBLY_API_KEY,
    fetched: bills.length,
    relevant: relevant.length,
    sampleRelevant: relevant.slice(0, 3).map(b => ({
      name: b.BILL_NAME,
      proposer: b.PROPOSER,
      date: b.PROPOSE_DT,
    })),
  });
}

export async function POST() {
  const user = await getAuthUser();
  if (!requireRole(user, [UserRole.ADMIN, UserRole.RESEARCHER])) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const result = await collectAssemblyBills();
    return NextResponse.json(result);
  } catch (e: any) {
    return NextResponse.json({ error: 'Collection failed', message: e.message }, { status: 500 });
  }
}
