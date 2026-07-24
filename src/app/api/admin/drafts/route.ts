// src/app/api/admin/drafts/route.ts
// Research draft CRUD for the AI editor-in-chief authoring workspace.

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAuthUser, requireRole } from '@/lib/auth';
import { UserRole } from '@prisma/client';
import { z } from 'zod';

const ROLES = [UserRole.ADMIN, UserRole.EDITOR, UserRole.RESEARCHER];

async function guard() {
  const user = await getAuthUser();
  return requireRole(user, ROLES) ? user : null;
}

// GET /api/admin/drafts            → list
// GET /api/admin/drafts?id=xxx     → single
export async function GET(req: NextRequest) {
  const user = await guard();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const id = req.nextUrl.searchParams.get('id');
  if (id) {
    const draft = await prisma.researchDraft.findUnique({ where: { id } });
    return NextResponse.json({ draft });
  }
  const drafts = await prisma.researchDraft.findMany({
    orderBy: { updatedAt: 'desc' },
    take: 100,
    select: { id: true, title: true, category: true, stage: true, updatedAt: true },
  });
  return NextResponse.json({ drafts });
}

const createSchema = z.object({
  idea: z.string().min(1),
  category: z.enum(['COMMENTARY', 'POLICY_BRIEF', 'PRESS_RELEASE', 'SEMINAR', 'REPORT']),
  researchArea: z.enum(['AI_GOVERNANCE', 'DPI', 'DIGITAL_IDENTITY', 'DATA_GOVERNANCE', 'DIGITAL_ASSETS']).optional(),
}).strict();

// POST /api/admin/drafts  → create from idea
export async function POST(req: NextRequest) {
  const user = await guard();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const parsed = createSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: 'Invalid input' }, { status: 400 });

  const draft = await prisma.researchDraft.create({
    data: {
      authorId: (user as any).id ?? null,
      idea: parsed.data.idea,
      category: parsed.data.category,
      researchArea: parsed.data.researchArea ?? 'AI_GOVERNANCE',
      stage: 'IDEA',
    },
  });
  return NextResponse.json({ draft });
}

const patchSchema = z.object({
  id: z.string(),
  title: z.string().optional(),
  titleEn: z.string().optional(),
  featuredImage: z.string().optional(),
  excerpt: z.string().optional(),
  content: z.string().optional(),
  contentEn: z.string().optional(),
  frame: z.string().optional(),
  idea: z.string().optional(),
  category: z.enum(['COMMENTARY', 'POLICY_BRIEF', 'PRESS_RELEASE', 'SEMINAR', 'REPORT']).optional(),
  researchArea: z.enum(['AI_GOVERNANCE', 'DPI', 'DIGITAL_IDENTITY', 'DATA_GOVERNANCE', 'DIGITAL_ASSETS']).optional(),
  stage: z.enum(['IDEA', 'FRAME', 'DRAFTING', 'AI_REVIEW', 'EDITOR_REVIEW', 'REVISION', 'READY', 'PUBLISHED']).optional(),
}).strict();

// PATCH /api/admin/drafts  → update fields / advance stage
export async function PATCH(req: NextRequest) {
  const user = await guard();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const parsed = patchSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: 'Invalid input' }, { status: 400 });

  const { id, ...data } = parsed.data;
  const draft = await prisma.researchDraft.update({ where: { id }, data });
  return NextResponse.json({ draft });
}

// DELETE /api/admin/drafts?id=xxx
export async function DELETE(req: NextRequest) {
  const user = await guard();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const id = req.nextUrl.searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });
  await prisma.researchDraft.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
