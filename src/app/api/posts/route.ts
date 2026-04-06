// src/app/api/posts/route.ts
// GET: List posts (public + admin)
// POST: Create post (admin/researcher only)

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAuthUser, requireRole } from '@/lib/auth';
import { PostStatus, UserRole } from '@prisma/client';
import { z } from 'zod';
import { notifyNewPost } from '@/lib/notifications';

// GET /api/posts?category=COMMENTARY&area=KOREA_POLICY&status=published
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const category = searchParams.get('category');
  const area = searchParams.get('area');
  const status = searchParams.get('status') || 'published';
  const limit = parseInt(searchParams.get('limit') || '20');
  const offset = parseInt(searchParams.get('offset') || '0');

  const where: any = {};

  // Public requests only see published posts
  if (status === 'published') {
    where.status = PostStatus.PUBLISHED;
  } else {
    // Admin can see all statuses — verify auth
    const user = await getAuthUser();
    if (!requireRole(user, [UserRole.ADMIN, UserRole.RESEARCHER, UserRole.EDITOR])) {
      where.status = PostStatus.PUBLISHED;
    }
  }

  if (category && category !== 'all') where.category = category;
  if (area && area !== 'all') where.researchArea = area;

  const [posts, total] = await Promise.all([
    prisma.post.findMany({
      where,
      orderBy: { publishedAt: 'desc' },
      take: limit,
      skip: offset,
      include: {
        teamAuthor: { select: { id: true, name: true, nameEn: true, title: true, titleEn: true } },
      },
    }),
    prisma.post.count({ where }),
  ]);

  return NextResponse.json({ posts, total, limit, offset });
}

// POST /api/posts
const createPostSchema = z.object({
  title: z.string().min(1),
  titleEn: z.string().optional(),
  slug: z.string().min(1),
  excerpt: z.string().optional(),
  excerptEn: z.string().optional(),
  content: z.string().optional(),
  contentEn: z.string().optional(),
  category: z.enum(['COMMENTARY', 'POLICY_BRIEF', 'PRESS_RELEASE', 'SEMINAR', 'REPORT']),
  researchArea: z.enum(['KOREA_POLICY', 'DIGITAL_FINANCE', 'INFRASTRUCTURE', 'INCLUSION']),
  status: z.enum(['DRAFT', 'REVIEW', 'PUBLISHED', 'ARCHIVED']).default('DRAFT'),
  teamAuthorId: z.string().optional(),
  publishedAt: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

export async function POST(req: NextRequest) {
  const user = await getAuthUser();
  if (!requireRole(user, [UserRole.ADMIN, UserRole.RESEARCHER])) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const parsed = createPostSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten() }, { status: 400 });
  }

  const data = parsed.data;
  const post = await prisma.post.create({
    data: {
      ...data,
      authorId: user!.id,
      publishedAt: data.publishedAt ? new Date(data.publishedAt) : data.status === 'PUBLISHED' ? new Date() : null,
      tags: data.tags || [],
    },
  });

  if (post.status === 'PUBLISHED') {
    notifyNewPost(post.title).catch(() => {});
  }

  return NextResponse.json({ post }, { status: 201 });
}
