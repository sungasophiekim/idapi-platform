// src/app/(public)/research/page.tsx
import { prisma } from '@/lib/db';
import ResearchClient from './ResearchClient';

export default async function ResearchPage() {
  const posts = await prisma.post.findMany({
    where: { status: 'PUBLISHED' },
    orderBy: { publishedAt: 'desc' },
    include: { teamAuthor: { select: { name: true, nameEn: true } } },
  });

  return <ResearchClient posts={JSON.parse(JSON.stringify(posts))} />;
}
