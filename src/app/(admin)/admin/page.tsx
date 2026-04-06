// src/app/(admin)/admin/page.tsx
import { prisma } from '@/lib/db';
import AdminDashClient from './DashClient';

export default async function AdminDashboard() {
  const [postCount, publishedCount, teamCount, totalViews, recentPosts] = await Promise.all([
    prisma.post.count(),
    prisma.post.count({ where: { status: 'PUBLISHED' } }),
    prisma.teamMember.count(),
    prisma.post.aggregate({ _sum: { viewCount: true } }),
    prisma.post.findMany({
      orderBy: { publishedAt: 'desc' },
      take: 5,
      include: { teamAuthor: { select: { name: true } } },
    }),
  ]);

  return (
    <AdminDashClient
      stats={{ postCount, publishedCount, teamCount, totalViews: totalViews._sum.viewCount || 0 }}
      recentPosts={JSON.parse(JSON.stringify(recentPosts))}
    />
  );
}
