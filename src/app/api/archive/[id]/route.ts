import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const articles = await prisma.lawArticle.findMany({
    where: { lawId: id },
    orderBy: { sortOrder: 'asc' },
  });
  return NextResponse.json({ articles });
}
