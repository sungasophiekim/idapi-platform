// src/app/api/cron/weekly/route.ts
// Weekly cron job: PII calculation + weekly report + intl bill collection
// Triggered every Monday at 6am KST

export const maxDuration = 300;
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { calculatePII, generateWeeklySummary } from '@/modules/pii-index';
import { prisma } from '@/lib/db';
import { sendNotification } from '@/lib/notifications';

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  const cronSecret = req.headers.get('x-cron-secret') || req.nextUrl.searchParams.get('secret');
  const isAuthorized = (authHeader === `Bearer ${process.env.CRON_SECRET}`) || (cronSecret === process.env.CRON_SECRET);
  if (!isAuthorized) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const results: Record<string, any> = {};

  // 1. Calculate PII Index
  try {
    results.pii = await calculatePII();
  } catch (e: any) {
    results.pii = { error: e.message };
  }

  // 2. Generate weekly summary
  try {
    results.summary = await generateWeeklySummary();
  } catch (e: any) {
    results.summary = { error: e.message };
  }

  // 3. Generate AI briefing (if API key available)
  if (process.env.ANTHROPIC_API_KEY) {
    try {
      const { generateDailyBriefing } = await import('@/modules/ai-engine');
      const since = new Date(Date.now() - 7 * 86400000);
      const recentRegs = await prisma.regulation.findMany({
        where: { updatedAt: { gte: since } },
        orderBy: { impactScore: 'desc' },
        take: 10,
      });

      if (recentRegs.length > 0) {
        const briefingResult = await generateDailyBriefing(
          recentRegs.map(r => ({
            title: r.title,
            titleEn: r.titleEn || undefined,
            jurisdiction: r.jurisdiction,
            summary: r.aiSummary || r.summary || undefined,
            impactScore: r.impactScore || undefined,
          }))
        );

        await prisma.aiBriefing.create({
          data: {
            type: 'weekly',
            title: briefingResult.title,
            titleEn: briefingResult.titleEn,
            content: briefingResult.content,
            contentEn: briefingResult.contentEn,
            regulationIds: recentRegs.map(r => r.id),
            isPublished: false,
          },
        });

        results.briefing = { created: true, title: briefingResult.title };
      }
    } catch (e: any) {
      results.briefing = { error: e.message };
    }
  }

  // 4. Collect international bills (US + Asia SG/JP/HK)
  try {
    const { collectUSCongressBills } = await import('@/modules/bill-tracker/us-tracker');
    results.usBills = await collectUSCongressBills();
  } catch (e: any) {
    results.usBills = { error: e.message };
  }

  try {
    const { collectAllAsiaBills } = await import('@/modules/bill-tracker/asia-tracker');
    results.asiaBills = await collectAllAsiaBills();
  } catch (e: any) {
    results.asiaBills = { error: e.message };
  }

  // 5. Notify
  if (results.pii?.score) {
    sendNotification({
      type: 'SYSTEM',
      title: `주간 PII 지수: ${results.pii.score} (${results.pii.trend === 'up' ? '▲' : '▼'} ${results.pii.change})`,
      titleEn: `Weekly PII: ${results.pii.score} (${results.pii.change > 0 ? '+' : ''}${results.pii.change})`,
      message: `신규법안 ${results.pii.breakdown.newBills.count}건, 위원회진행 ${results.pii.breakdown.committeeProgress.count}건`,
      messageEn: `New bills: ${results.pii.breakdown.newBills.count}, Committee: ${results.pii.breakdown.committeeProgress.count}`,
    }).catch(() => {});
  }

  return NextResponse.json({
    timestamp: new Date().toISOString(),
    ...results,
  });
}
