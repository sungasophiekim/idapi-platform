// src/app/(public)/research/[slug]/page.tsx
import { prisma } from '@/lib/db';
import { notFound } from 'next/navigation';
import PostClient from './PostClient';

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await prisma.post.findUnique({
    where: { slug },
    include: {
      teamAuthor: { select: { id: true, name: true, nameEn: true, title: true, titleEn: true, avatarUrl: true } },
    },
  });

  if (!post || post.status !== 'PUBLISHED') notFound();

  // Increment view (fire-and-forget)
  prisma.post.update({ where: { id: post.id }, data: { viewCount: { increment: 1 } } }).catch(() => {});

  return <PostClient post={JSON.parse(JSON.stringify(post))} />;
}
