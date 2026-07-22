// src/app/(public)/insights/page.tsx — News Clipping (published clips)
import { prisma } from '@/lib/db';
import NewsClipClient from './NewsClipClient';

export const revalidate = 300;
export const dynamic = 'force-dynamic';

export default async function InsightsPage() {
  const clips = await prisma.newsClip
    .findMany({
      where: { status: 'PUBLISHED' },
      orderBy: { publishedAt: 'desc' },
      take: 120,
    })
    .catch(() => []);

  return <NewsClipClient clips={JSON.parse(JSON.stringify(clips))} />;
}
