// src/app/api/admin/news/route.ts
// Admin curation for News Clips: list drafts, approve/archive, trigger collect.

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAuthUser, requireRole } from '@/lib/auth';
import { UserRole } from '@prisma/client';
import { z } from 'zod';

const ADMIN_ROLES = [UserRole.ADMIN, UserRole.EDITOR, UserRole.RESEARCHER];

async function guard() {
  const user = await getAuthUser();
  return requireRole(user, ADMIN_ROLES) ? user : null;
}

// GET /api/admin/news?status=DRAFT&theme=RWA
export async function GET(req: NextRequest) {
  if (!(await guard())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = req.nextUrl;
  const status = searchParams.get('status') || 'DRAFT';
  const theme = searchParams.get('theme');

  const where: any = {};
  if (status !== 'ALL') where.status = status;
  if (theme) where.theme = theme;

  const clips = await prisma.newsClip.findMany({
    where,
    orderBy: { publishedAt: 'desc' },
    take: 200,
  });
  return NextResponse.json({ clips });
}

// PATCH /api/admin/news  { id, status }
const patchSchema = z.object({
  id: z.string(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']),
}).strict();

export async function PATCH(req: NextRequest) {
  if (!(await guard())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const parsed = patchSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: 'Invalid input' }, { status: 400 });

  const updated = await prisma.newsClip.update({
    where: { id: parsed.data.id },
    data: { status: parsed.data.status },
  });
  return NextResponse.json({ clip: updated });
}

// POST /api/admin/news  → manually trigger a collection run
export async function POST() {
  if (!(await guard())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { collectNewsClips } = await import('@/modules/news-clip');
  const result = await collectNewsClips();
  return NextResponse.json({ result });
}
