// src/app/api/bills/route.ts
// GET: List collected bills
// POST: Trigger bill collection from all sources

import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser, requireRole } from '@/lib/auth';
import { UserRole } from '@prisma/client';
import { collectAllBills, saveBillsToDb } from '@/modules/bill-collector';
import { prisma } from '@/lib/db';

// GET /api/bills — list recently collected regulations
export async function GET(req: NextRequest) {
  const limit = parseInt(req.nextUrl.searchParams.get('limit') || '30');
  const jurisdiction = req.nextUrl.searchParams.get('jurisdiction');

  const where: any = {};
  if (jurisdiction && jurisdiction !== 'all') where.jurisdiction = jurisdiction;

  const regulations = await prisma.regulation.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: limit,
    include: { timelineEvents: { orderBy: { eventDate: 'desc' }, take: 1 } },
  });

  return NextResponse.json({ regulations, total: regulations.length });
}

// POST /api/bills — trigger collection + save to DB
export async function POST(req: NextRequest) {
  // Auth: admin/researcher or cron
  const cronSecret = req.headers.get('x-cron-secret');
  const isValidCron = cronSecret && cronSecret === process.env.CRON_SECRET;

  if (!isValidCron) {
    const user = await getAuthUser();
    if (!requireRole(user, [UserRole.ADMIN, UserRole.RESEARCHER])) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  try {
    // Step 1: Collect bills from all sources
    const result = await collectAllBills();

    if (result.bills.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No new bills found',
        ...result,
        saved: 0,
      });
    }

    // Step 2: Save to DB (dedup + update status)
    const saved = await saveBillsToDb(result.bills, prisma);

    return NextResponse.json({
      success: true,
      collected: result.totalCollected,
      saved,
      byJurisdiction: result.byJurisdiction,
      duration: result.duration,
      errors: result.errors,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: 'Bill collection failed', message: err.message },
      { status: 500 }
    );
  }
}
