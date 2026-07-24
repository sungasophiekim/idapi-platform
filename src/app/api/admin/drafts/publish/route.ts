// src/app/api/admin/drafts/publish/route.ts
// Editor approves a draft → creates a published Post. ADMIN/EDITOR only.

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAuthUser, requireRole } from '@/lib/auth';
import { UserRole } from '@prisma/client';
import { z } from 'zod';

const schema = z.object({ id: z.string() }).strict();

function slugify(s: string): string {
  const base = (s || 'draft').toLowerCase().trim()
    .replace(/[^a-z0-9가-힣\s-]/g, '').replace(/\s+/g, '-').slice(0, 60) || 'draft';
  return `${base}-${Math.abs(hash(s)).toString(36).slice(0, 6)}`;
}
function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) { h = (h << 5) - h + s.charCodeAt(i); h |= 0; }
  return h;
}

export async function POST(req: NextRequest) {
  const user = await getAuthUser();
  if (!requireRole(user, [UserRole.ADMIN, UserRole.EDITOR])) {
    return NextResponse.json({ error: 'Editor role required' }, { status: 403 });
  }

  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: 'Invalid input' }, { status: 400 });

  const draft = await prisma.researchDraft.findUnique({ where: { id: parsed.data.id } });
  if (!draft) return NextResponse.json({ error: 'Draft not found' }, { status: 404 });
  if (!draft.title || !draft.content) {
    return NextResponse.json({ error: '제목과 본문이 필요합니다.' }, { status: 400 });
  }

  const post = await prisma.post.create({
    data: {
      slug: slugify(draft.title),
      authorId: draft.authorId,
      category: draft.category,
      researchArea: draft.researchArea,
      status: 'PUBLISHED',
      title: draft.title,
      titleEn: draft.titleEn,
      excerpt: draft.excerpt,
      content: draft.content,
      contentEn: draft.contentEn,
      featuredImage: draft.featuredImage,
      publishedAt: new Date(),
    },
  });

  await prisma.researchDraft.update({
    where: { id: draft.id },
    data: { stage: 'PUBLISHED', postId: post.id },
  });

  return NextResponse.json({ post });
}
