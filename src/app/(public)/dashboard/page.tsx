// src/app/(public)/dashboard/page.tsx
import { prisma } from '@/lib/db';
import { calculatePII, generateWeeklySummary } from '@/modules/pii-index';
import { classifyTheme, THEMES, type ThemeKey } from '@/modules/taxonomy';
import DashboardClient from './DashboardClient';

// Derived 5-focus-area breakdown — computed at read time from title/tags,
// so no ResearchArea enum migration is needed.
function buildThemeBreakdown(regs: { title?: string | null; titleEn?: string | null; tags?: string[] }[]) {
  const counts = Object.fromEntries((Object.keys(THEMES) as ThemeKey[]).map(k => [k, 0])) as Record<ThemeKey, number>;
  for (const r of regs) {
    const text = `${r.title || ''} ${r.titleEn || ''} ${(r.tags || []).join(' ')}`;
    counts[classifyTheme(text)]++;
  }
  return counts;
}

export const revalidate = 300;
export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  try {
    const [regulations, trends, briefings, stats, archiveStats, pii, weeklySummary] = await Promise.all([
      prisma.regulation.findMany({
        orderBy: [{ impactScore: 'desc' }, { updatedAt: 'desc' }],
        take: 200,
        include: { timelineEvents: { orderBy: { eventDate: 'desc' }, take: 1 } },
      }).catch(() => []),
      prisma.policyTrend.findMany({
        where: { expiresAt: { gte: new Date() } },
        orderBy: { score: 'desc' },
        take: 20,
      }).catch(() => []),
      prisma.aiBriefing.findMany({
        where: { isPublished: true },
        orderBy: { generatedAt: 'desc' },
        take: 3,
      }).catch(() => []),
      Promise.all([
        prisma.regulation.count().catch(() => 0),
        prisma.regulation.count({ where: { status: 'ENACTED' } }).catch(() => 0),
        prisma.regulation.count({ where: { updatedAt: { gte: new Date(Date.now() - 7 * 86400000) } } }).catch(() => 0),
      ]),
      Promise.all([
        prisma.lawArchive.count().catch(() => 0),
        prisma.lawArticle.count().catch(() => 0),
        prisma.lawArchive.groupBy({ by: ['jurisdiction'], _count: true }).catch(() => []),
        prisma.regulation.groupBy({ by: ['jurisdiction'], _count: true }).catch(() => []),
      ]),
      calculatePII().catch(() => null),
      generateWeeklySummary().catch(() => null),
    ]);

    const [totalLaws, totalArticles, articlesByJur, regsByJur] = archiveStats;
    const themeBreakdown = buildThemeBreakdown(regulations as any[]);

    return (
      <DashboardClient
        themeBreakdown={themeBreakdown}
        regulations={JSON.parse(JSON.stringify(regulations))}
        trends={JSON.parse(JSON.stringify(trends))}
        briefings={JSON.parse(JSON.stringify(briefings))}
        stats={{ total: stats[0], enacted: stats[1], recentlyUpdated: stats[2] }}
        archiveData={{
          totalLaws,
          totalArticles,
          articlesByJurisdiction: Object.fromEntries((articlesByJur as any[]).map(j => [j.jurisdiction, j._count])),
          regulationsByJurisdiction: Object.fromEntries((regsByJur as any[]).map(j => [j.jurisdiction, j._count])),
        }}
        pii={pii ? JSON.parse(JSON.stringify(pii)) : null}
        weeklySummary={weeklySummary ? JSON.parse(JSON.stringify(weeklySummary)) : null}
      />
    );
  } catch (e) {
    console.error('[Dashboard] Page render error:', e);
    // Fallback: render with empty data
    return (
      <DashboardClient
        themeBreakdown={buildThemeBreakdown([])}
        regulations={[]}
        trends={[]}
        briefings={[]}
        stats={{ total: 0, enacted: 0, recentlyUpdated: 0 }}
        archiveData={{ totalLaws: 0, totalArticles: 0, articlesByJurisdiction: {}, regulationsByJurisdiction: {} }}
        pii={null}
        weeklySummary={null}
      />
    );
  }
}
