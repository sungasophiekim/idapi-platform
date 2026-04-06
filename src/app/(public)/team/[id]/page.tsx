// src/app/(public)/team/[id]/page.tsx
import { prisma } from '@/lib/db';
import { notFound } from 'next/navigation';
import MemberClient from './MemberClient';

export default async function MemberPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const member = await prisma.teamMember.findUnique({ where: { id } });
  if (!member) notFound();

  // Get this member's articles
  const posts = await prisma.post.findMany({
    where: { teamAuthorId: id, status: 'PUBLISHED' },
    orderBy: { publishedAt: 'desc' },
    take: 10,
  });

  return <MemberClient member={JSON.parse(JSON.stringify(member))} posts={JSON.parse(JSON.stringify(posts))} />;
}
