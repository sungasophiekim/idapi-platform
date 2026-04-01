import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '../../../lib/db';
import { getAuthUser, requireRole } from '../../../lib/auth';
import { UserRole, PostCategory, PostStatus, ResearchArea } from '../../../generated/prisma/client';

const createSchema = z.object({
  title: z.string().min(1).max(200),
  titleEn: z.string().optional(),
  excerpt: z.string().optional(),
  excerptEn: z.string().optional(),
  content: z.string().optional(),
  contentEn: z.string().optional(),
  category: z.nativeEnum(PostCategory),
  researchArea: z.nativeEnum(ResearchArea),
  status: z.nativeEnum(PostStatus).default('DRAFT'),
  authorId: z.string(),
  publishedAt: z.string().optional(),
});

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const category = searchParams.get('category');
  const area = searchParams.get('area');
  const all = searchParams.get('all');

  const where: Record<string, unknown> = {};
  if (!all) where.status = 'PUBLISHED';
  if (category && category !== 'all') where.category = category;
  if (area && area !== 'all') where.researchArea = area;

  const posts = await prisma.post.findMany({
    where,
    select: {
      id: true, title: true, titleEn: true, excerpt: true, excerptEn: true,
      category: true, researchArea: true, status: true, publishedAt: true, views: true,
      authorId: true,
      author: { select: { id: true, name: true, nameEn: true } },
    },
    orderBy: { publishedAt: 'desc' },
  });

  return NextResponse.json({ posts });
}

export async function POST(request: NextRequest) {
  const user = await getAuthUser();
  if (!requireRole(user, [UserRole.ADMIN, UserRole.RESEARCHER])) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten() }, { status: 400 });
  }

  const { publishedAt, ...rest } = parsed.data;
  const post = await prisma.post.create({
    data: {
      ...rest,
      publishedAt: publishedAt ? new Date(publishedAt) : null,
    },
  });

  return NextResponse.json({ post }, { status: 201 });
}
