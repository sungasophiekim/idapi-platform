// src/app/(public)/dashboard/page.tsx
import { prisma } from '@/lib/db';
import DashboardClient from './DashboardClient';

export const revalidate = 300; // ISR: revalidate every 5 minutes

export default async function DashboardPage() {
  const [regulations, trends, briefings, stats] = await Promise.all([
    prisma.regulation.findMany({
      orderBy: [{ impactScore: 'desc' }, { updatedAt: 'desc' }],
      take: 20,
      include: { timelineEvents: { orderBy: { eventDate: 'desc' }, take: 1 } },
    }),
    prisma.policyTrend.findMany({
      where: { expiresAt: { gte: new Date() } },
      orderBy: { score: 'desc' },
      take: 10,
    }),
    prisma.aiBriefing.findMany({
      where: { isPublished: true },
      orderBy: { generatedAt: 'desc' },
      take: 3,
    }),
    Promise.all([
      prisma.regulation.count(),
      prisma.regulation.count({ where: { status: 'ENACTED' } }),
      prisma.regulation.count({ where: { updatedAt: { gte: new Date(Date.now() - 7 * 86400000) } } }),
    ]),
  ]);

  return (
    <DashboardClient
      regulations={JSON.parse(JSON.stringify(regulations))}
      trends={JSON.parse(JSON.stringify(trends))}
      briefings={JSON.parse(JSON.stringify(briefings))}
      stats={{ total: stats[0], enacted: stats[1], recentlyUpdated: stats[2] }}
    />
  );
}
