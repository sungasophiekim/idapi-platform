// src/app/api/news/route.ts — public: published news clips for the ticker
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  const clips = await prisma.newsClip
    .findMany({
      where: { status: 'PUBLISHED' },
      orderBy: { publishedAt: 'desc' },
      take: 40,
      select: { id: true, title: true, url: true, source: true, theme: true },
    })
    .catch(() => []);
  return NextResponse.json({ clips });
}
