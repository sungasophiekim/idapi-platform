// src/app/api/posts/[id]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAuthUser, requireRole } from '@/lib/auth';
import { UserRole } from '@prisma/client';

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

  const post = await prisma.post.update({
    where: { id },
    data: {
      ...body,
      publishedAt: body.publishedAt ? new Date(body.publishedAt) : undefined,
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
