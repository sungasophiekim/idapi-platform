// src/app/api/posts/[id]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { getAuthUser, requireRole } from '@/lib/auth';
import { UserRole } from '@prisma/client';

const updatePostSchema = z.object({
  title: z.string().min(1).max(300).optional(),
  titleEn: z.string().max(300).optional(),
  slug: z.string().max(200).optional(),
  excerpt: z.string().max(2000).optional(),
  excerptEn: z.string().max(2000).optional(),
  content: z.string().optional(),
  contentEn: z.string().optional(),
  category: z.enum(['COMMENTARY', 'POLICY_BRIEF', 'PRESS_RELEASE', 'SEMINAR', 'REPORT']).optional(),
  researchArea: z.enum(['KOREA_POLICY', 'DIGITAL_FINANCE', 'INFRASTRUCTURE', 'INCLUSION']).optional(),
  status: z.enum(['DRAFT', 'REVIEW', 'PUBLISHED', 'ARCHIVED']).optional(),
  teamAuthorId: z.string().optional(),
  featuredImage: z.string().url().optional().nullable(),
  tags: z.array(z.string()).optional(),
  publishedAt: z.string().optional().nullable(),
}).strict();

// GET /api/posts/:id — public
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const post = await prisma.post.findFirst({
    where: { OR: [{ id }, { slug: id }] },
    include: {
      teamAuthor: { select: { id: true, name: true, nameEn: true, title: true, titleEn: true, bio: true, bioEn: true, avatarUrl: true } },
    },
  });

  if (!post) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  // Increment view count (fire and forget)
  prisma.post.update({ where: { id: post.id }, data: { viewCount: { increment: 1 } } }).catch(() => {});

  return NextResponse.json({ post });
}

// PUT /api/posts/:id — admin/researcher
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getAuthUser();
  if (!requireRole(user, [UserRole.ADMIN, UserRole.RESEARCHER])) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();

  const parsed = updatePostSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten() }, { status: 400 });
  }

  const { publishedAt, ...rest } = parsed.data;
  const post = await prisma.post.update({
    where: { id },
    data: {
      ...rest,
      ...(publishedAt !== undefined ? { publishedAt: publishedAt ? new Date(publishedAt) : null } : {}),
      updatedAt: new Date(),
    },
  });

  return NextResponse.json({ post });
}

// DELETE /api/posts/:id — admin only
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getAuthUser();
  if (!requireRole(user, [UserRole.ADMIN])) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  await prisma.post.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
