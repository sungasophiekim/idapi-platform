// src/modules/pii-index/index.ts
// IDAPI Policy Intelligence Index (PII)
// A proprietary composite index measuring global digital asset legislative activity
// Updated weekly, designed to be cited by media and researchers

import { prisma } from '@/lib/db';

export interface PIIResult {
  score: number;           // 0-100
  change: number;          // vs last week (+/-)
  trend: 'up' | 'down' | 'flat';
  breakdown: {
    newBills: { count: number; score: number };           // 30% weight
    committeeProgress: { count: number; score: number };  // 25% weight
    enactments: { count: number; score: number };         // 20% weight
    trendSpikes: { count: number; score: number };        // 15% weight
    crossBorder: { count: number; score: number };        // 10% weight
  };
  topEvents: string[];     // This week's top 3 events
  jurisdictionActivity: Record<string, number>;
  generatedAt: string;
  periodStart: string;
  periodEnd: string;
}

export async function calculatePII(): Promise<PIIResult> {
  const now = new Date();
  const oneWeekAgo = new Date(now.getTime() - 7 * 86400000);
  const twoWeeksAgo = new Date(now.getTime() - 14 * 86400000);

  // ─── Current week metrics ───
  const [
    newBillsThisWeek,
    committeeProgressThisWeek,
    enactmentsThisWeek,
    activeTrends,
    jurisdictionsActive,
    totalRegulations,
  ] = await Promise.all([
    // New bills proposed this week
    prisma.regulation.count({
      where: { createdAt: { gte: oneWeekAgo } },
    }),
    // Bills that moved to committee or beyond this week
    prisma.regulationEvent.count({
      where: {
        eventDate: { gte: oneWeekAgo },
        status: { in: ['COMMITTEE', 'FLOOR_VOTE', 'PASSED'] },
      },
    }),
    // Bills enacted this week
    prisma.regulationEvent.count({
      where: {
        eventDate: { gte: oneWeekAgo },
        status: 'ENACTED',
      },
    }),
    // Active trend spikes
    prisma.policyTrend.count({
      where: {
        expiresAt: { gte: now },
        score: { gte: 60 },
      },
    }),
    // Number of jurisdictions with activity this week
    prisma.regulation.groupBy({
      by: ['jurisdiction'],
      where: { updatedAt: { gte: oneWeekAgo } },
      _count: true,
    }),
    // Total tracked regulations
    prisma.regulation.count(),
  ]);

  // ─── Last week metrics (for comparison) ───
  const [lastWeekBills, lastWeekProgress] = await Promise.all([
    prisma.regulation.count({
      where: { createdAt: { gte: twoWeeksAgo, lt: oneWeekAgo } },
    }),
    prisma.regulationEvent.count({
      where: {
        eventDate: { gte: twoWeeksAgo, lt: oneWeekAgo },
        status: { in: ['COMMITTEE', 'FLOOR_VOTE', 'PASSED', 'ENACTED'] },
      },
    }),
  ]);

  // ─── Score calculation ───
  // Normalize each component to 0-100, then apply weights
  const normalize = (value: number, baseline: number) => Math.min(100, (value / Math.max(baseline, 1)) * 100);

  const newBillsScore = normalize(newBillsThisWeek, 10) * 0.30;
  const committeeScore = normalize(committeeProgressThisWeek, 5) * 0.25;
  const enactmentScore = normalize(enactmentsThisWeek, 2) * 0.20;
  const trendScore = normalize(activeTrends, 8) * 0.15;
  const crossBorderScore = normalize(jurisdictionsActive.length, 5) * 0.10;

  const score = Math.round((newBillsScore + committeeScore + enactmentScore + trendScore + crossBorderScore) * 10) / 10;

  // Last week's approximate score
  const lastWeekScore = Math.round(
    (normalize(lastWeekBills, 10) * 0.30 + normalize(lastWeekProgress, 5) * 0.45) * 10
  ) / 10;

  const change = Math.round((score - lastWeekScore) * 10) / 10;

  // ─── Top events ───
  const recentEvents = await prisma.regulationEvent.findMany({
    where: { eventDate: { gte: oneWeekAgo } },
    include: { regulation: { select: { title: true, titleEn: true, jurisdiction: true } } },
    orderBy: { eventDate: 'desc' },
    take: 10,
  });

  const topEvents = recentEvents.slice(0, 3).map(ev => {
    const flags: Record<string, string> = { KR: '🇰🇷', US: '🇺🇸', EU: '🇪🇺', SG: '🇸🇬', JP: '🇯🇵', HK: '🇭🇰', INTL: '🌐' };
    const flag = flags[ev.regulation.jurisdiction] || '🌐';
    return `${flag} ${ev.regulation.title} — ${ev.description || ev.status}`;
  });

  // If no events, generate from new regulations
  if (topEvents.length === 0) {
    const recentRegs = await prisma.regulation.findMany({
      where: { createdAt: { gte: oneWeekAgo } },
      orderBy: { createdAt: 'desc' },
      take: 3,
    });
    for (const r of recentRegs) {
      const flags2: Record<string, string> = { KR: '🇰🇷', US: '🇺🇸', EU: '🇪🇺', SG: '🇸🇬', JP: '🇯🇵', HK: '🇭🇰', INTL: '🌐' };
      const flag = flags2[r.jurisdiction] || '🌐';
      topEvents.push(`${flag} ${r.title} — 신규 등록`);
    }
  }

  // ─── Jurisdiction activity ───
  const jurisdictionActivity: Record<string, number> = {};
  for (const j of jurisdictionsActive) {
    jurisdictionActivity[j.jurisdiction] = j._count;
  }

  return {
    score: Math.max(0, Math.min(100, score)),
    change,
    trend: change > 0.5 ? 'up' : change < -0.5 ? 'down' : 'flat',
    breakdown: {
      newBills: { count: newBillsThisWeek, score: Math.round(newBillsScore * 10) / 10 },
      committeeProgress: { count: committeeProgressThisWeek, score: Math.round(committeeScore * 10) / 10 },
      enactments: { count: enactmentsThisWeek, score: Math.round(enactmentScore * 10) / 10 },
      trendSpikes: { count: activeTrends, score: Math.round(trendScore * 10) / 10 },
      crossBorder: { count: jurisdictionsActive.length, score: Math.round(crossBorderScore * 10) / 10 },
    },
    topEvents,
    jurisdictionActivity,
    generatedAt: now.toISOString(),
    periodStart: oneWeekAgo.toISOString(),
    periodEnd: now.toISOString(),
  };
}

// ─── Weekly 3-line summary ───
export async function generateWeeklySummary(): Promise<{
  summary: string;
  summaryEn: string;
  highlights: { ko: string; en: string }[];
}> {
  const oneWeekAgo = new Date(Date.now() - 7 * 86400000);

  // Get this week's key events
  const events = await prisma.regulationEvent.findMany({
    where: { eventDate: { gte: oneWeekAgo } },
    include: { regulation: { select: { title: true, titleEn: true, jurisdiction: true, status: true } } },
    orderBy: { eventDate: 'desc' },
    take: 20,
  });

  const newRegs = await prisma.regulation.findMany({
    where: { createdAt: { gte: oneWeekAgo } },
    orderBy: { createdAt: 'desc' },
    take: 10,
    select: { title: true, titleEn: true, jurisdiction: true, status: true },
  });

  // Build highlights by jurisdiction
  const highlights: { ko: string; en: string }[] = [];
  const byJur = new Map<string, any[]>();

  for (const ev of events) {
    const j = ev.regulation.jurisdiction;
    if (!byJur.has(j)) byJur.set(j, []);
    byJur.get(j)!.push(ev);
  }

  for (const r of newRegs) {
    if (!byJur.has(r.jurisdiction)) byJur.set(r.jurisdiction, []);
  }

  const flags: Record<string, string> = { KR: '🇰🇷 한국', US: '🇺🇸 미국', EU: '🇪🇺 EU', SG: '🇸🇬 싱가포르', JP: '🇯🇵 일본', HK: '🇭🇰 홍콩' };
  const flagsEn: Record<string, string> = { KR: '🇰🇷 Korea', US: '🇺🇸 US', EU: '🇪🇺 EU', SG: '🇸🇬 Singapore', JP: '🇯🇵 Japan', HK: '🇭🇰 Hong Kong' };

  for (const [j, evts] of byJur.entries()) {
    if (evts.length === 0) continue;
    const top = evts[0];
    const title = top.regulation?.title || top.title || '';
    const titleEn = top.regulation?.titleEn || top.titleEn || title;
    const desc = top.description || top.status || '';

    highlights.push({
      ko: `${flags[j] || j} — ${title} ${desc}`,
      en: `${flagsEn[j] || j} — ${titleEn} ${desc}`,
    });
  }

  // If no events, use new regulation data
  if (highlights.length === 0) {
    const krCount = newRegs.filter(r => r.jurisdiction === 'KR').length;
    if (krCount > 0) highlights.push({ ko: `🇰🇷 한국 — 이번 주 ${krCount}건의 디지털자산/AI 법안 신규 등록`, en: `🇰🇷 Korea — ${krCount} new digital asset/AI bills registered this week` });
  }

  // Trim to 3
  const top3 = highlights.slice(0, 3);

  return {
    summary: `이번 주 주요 동향: ${top3.map(h => h.ko).join(' / ')}`,
    summaryEn: `This week: ${top3.map(h => h.en).join(' / ')}`,
    highlights: top3,
  };
}
