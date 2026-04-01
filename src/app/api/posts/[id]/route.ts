import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '../../../../lib/db';
import { getAuthUser, requireRole } from '../../../../lib/auth';
import { UserRole, PostCategory, PostStatus, ResearchArea } from '../../../../generated/prisma/client';

const updateSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  titleEn: z.string().optional(),
  excerpt: z.string().optional(),
  excerptEn: z.string().optional(),
  content: z.string().optional(),
  contentEn: z.string().optional(),
  category: z.nativeEnum(PostCategory).optional(),
  researchArea: z.nativeEnum(ResearchArea).optional(),
  status: z.nativeEnum(PostStatus).optional(),
  publishedAt: z.string().optional(),
});

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const post = await prisma.post.findUnique({
    where: { id },
    include: { author: { select: { id: true, name: true, nameEn: true, title: true, titleEn: true } } },
  });
  if (!post) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ post });
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getAuthUser();
  if (!requireRole(user, [UserRole.ADMIN, UserRole.RESEARCHER])) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten() }, { status: 400 });
  }

  const { publishedAt, ...rest } = parsed.data;
  const post = await prisma.post.update({
    where: { id },
    data: {
      ...rest,
      ...(publishedAt !== undefined ? { publishedAt: new Date(publishedAt) } : {}),
    },
  });

  return NextResponse.json({ post });
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getAuthUser();
  if (!requireRole(user, [UserRole.ADMIN])) {
    return NextResponse.json({ error: 'Admin only' }, { status: 403 });
  }

  const { id } = await params;
  await prisma.post.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
