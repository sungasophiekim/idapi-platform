// src/app/api/trends/detect/route.ts
// POST: Trigger trend detection pipeline
// GET:  Check last run status
// Protected: admin/researcher only, OR cron secret

import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser, requireRole } from '@/lib/auth';
import { UserRole } from '@prisma/client';
import { runTrendDetection } from '@/modules/trend-engine';

// POST /api/trends/detect — run the full pipeline
export async function POST(req: NextRequest) {
  // Auth: either logged-in admin, or cron secret header
  const cronSecret = req.headers.get('x-cron-secret');
  const isValidCron = cronSecret && cronSecret === process.env.CRON_SECRET;

  if (!isValidCron) {
    const user = await getAuthUser();
    if (!requireRole(user, [UserRole.ADMIN, UserRole.RESEARCHER])) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  const body = await req.json().catch(() => ({}));

  try {
    const result = await runTrendDetection({
      maxAgeDays: body.maxAgeDays || 7,
      jurisdictions: body.jurisdictions,
      skipAi: body.skipAi || false,
    });

    return NextResponse.json({
      success: true,
      ...result,
      topTrends: result.topTrends.slice(0, 10), // Limit response size
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: 'Trend detection failed', message: err.message },
      { status: 500 }
    );
  }
}
