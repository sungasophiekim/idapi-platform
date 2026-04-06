// src/app/(admin)/admin/page.tsx
import { prisma } from '@/lib/db';
import AdminDashClient from './DashClient';

export default async function AdminDashboard() {
  const [postCount, publishedCount, teamCount, totalViews, regulationCount, trendCount, briefingCount, recentPosts] = await Promise.all([
    prisma.post.count(),
    prisma.post.count({ where: { status: 'PUBLISHED' } }),
    prisma.teamMember.count(),
    prisma.post.aggregate({ _sum: { viewCount: true } }),
    prisma.regulation.count(),
    prisma.policyTrend.count({ where: { expiresAt: { gte: new Date() } } }),
    prisma.aiBriefing.count(),
    prisma.post.findMany({
      orderBy: { publishedAt: 'desc' },
      take: 5,
      include: { teamAuthor: { select: { name: true } } },
    }),
  ]);

  return (
    <AdminDashClient
      stats={{
        postCount,
        publishedCount,
        teamCount,
        totalViews: totalViews._sum.viewCount || 0,
        regulationCount,
        trendCount,
        briefingCount,
      }}
      recentPosts={JSON.parse(JSON.stringify(recentPosts))}
    />
  );
}
