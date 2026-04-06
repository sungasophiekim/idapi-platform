// src/app/(public)/page.tsx
import { prisma } from '@/lib/db';
import HomeClient from './HomeClient';

export default async function HomePage() {
  const posts = await prisma.post.findMany({
    where: { status: 'PUBLISHED' },
    orderBy: { publishedAt: 'desc' },
    take: 6,
    include: { teamAuthor: { select: { name: true, nameEn: true } } },
  });

  return <HomeClient posts={JSON.parse(JSON.stringify(posts))} />;
}
