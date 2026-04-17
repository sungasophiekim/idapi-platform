// src/app/api/bill-tracker/intl/route.ts
// POST: Trigger US + SG + JP + HK bill collection

export const maxDuration = 300;
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getAuthUser, requireRole } from '@/lib/auth';
import { UserRole } from '@prisma/client';

export async function POST() {
  const user = await getAuthUser();
  if (!requireRole(user, [UserRole.ADMIN, UserRole.RESEARCHER])) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const results: Record<string, any> = {};

  // US Congress
  try {
    const { collectUSCongressBills } = await import('@/modules/bill-tracker/us-tracker');
    results.US = await collectUSCongressBills();
  } catch (e: any) {
    results.US = { error: e.message };
  }

  // Asia (SG, JP, HK)
  try {
    const { collectAllAsiaBills } = await import('@/modules/bill-tracker/asia-tracker');
    const asia = await collectAllAsiaBills();
    results.SG = asia.sg;
    results.JP = asia.jp;
    results.HK = asia.hk;
  } catch (e: any) {
    results.asia_error = e.message;
  }

  // Summary
  const totalCreated = Object.values(results).reduce((s: number, r: any) => s + (r?.created || 0), 0);
  const totalUpdated = Object.values(results).reduce((s: number, r: any) => s + (r?.updated || 0), 0);

  return NextResponse.json({
    totalCreated,
    totalUpdated,
    details: results,
  });
}
