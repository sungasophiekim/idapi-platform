// src/app/api/cron/daily/route.ts
// Daily cron job: collect KR bills + trends
// Triggered by Vercel Cron or external scheduler

export const maxDuration = 300;
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { collectAssemblyBills } from '@/modules/bill-tracker';
import { sendNotification } from '@/lib/notifications';

export async function GET(req: NextRequest) {
  // Verify cron secret (Vercel sends Authorization: Bearer <CRON_SECRET>)
  const authHeader = req.headers.get('authorization');
  const cronSecret = req.headers.get('x-cron-secret') || req.nextUrl.searchParams.get('secret');
  const isAuthorized = (authHeader === `Bearer ${process.env.CRON_SECRET}`) || (cronSecret === process.env.CRON_SECRET);
  if (!isAuthorized) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const results: Record<string, any> = {};

  // 1. Collect KR National Assembly bills
  try {
    results.krBills = await collectAssemblyBills();
    if (results.krBills.created > 0) {
      sendNotification({
        type: 'SYSTEM',
        title: `새 법안 ${results.krBills.created}건 등록`,
        titleEn: `${results.krBills.created} new bills registered`,
        message: `국회 법안 수집: ${results.krBills.created}건 신규, ${results.krBills.updated}건 업데이트`,
        messageEn: `Assembly bills: ${results.krBills.created} new, ${results.krBills.updated} updated`,
      }).catch(() => {});
    }
  } catch (e: any) {
    results.krBills = { error: e.message };
  }

  // 2. Run trend detection (if API key available)
  if (process.env.ANTHROPIC_API_KEY) {
    try {
      const { runTrendDetection } = await import('@/modules/trend-engine');
      results.trends = await runTrendDetection();
    } catch (e: any) {
      results.trends = { error: e.message };
    }
  }

  // 3. Collect news clips (DRAFT — curated in admin before publishing)
  try {
    const { collectNewsClips } = await import('@/modules/news-clip');
    results.newsClips = await collectNewsClips();
  } catch (e: any) {
    results.newsClips = { error: e.message };
  }

  return NextResponse.json({
    timestamp: new Date().toISOString(),
    ...results,
  });
}
