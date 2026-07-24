// src/app/(public)/page.tsx
import { prisma } from '@/lib/db';
import HomeClient from './HomeClient';

export const revalidate = 300;

export default async function HomePage() {
  const posts = await prisma.post.findMany({
    where: { status: 'PUBLISHED' },
    orderBy: { publishedAt: 'desc' },
    take: 6,
    include: { teamAuthor: { select: { id: true, name: true, nameEn: true, avatarUrl: true } } },
  });

  return <HomeClient posts={JSON.parse(JSON.stringify(posts))} />;
}
