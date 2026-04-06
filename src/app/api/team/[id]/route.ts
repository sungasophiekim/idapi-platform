// src/app/api/team/[id]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { getAuthUser, requireRole } from '@/lib/auth';
import { UserRole } from '@prisma/client';

const updateTeamSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  nameEn: z.string().max(100).optional().nullable(),
  title: z.string().min(1).max(200).optional(),
  titleEn: z.string().max(200).optional().nullable(),
  bio: z.string().max(5000).optional(),
  bioEn: z.string().max(5000).optional().nullable(),
  credentials: z.array(z.string()).optional(),
  credentialsEn: z.array(z.string()).optional(),
  memberType: z.enum(['FOUNDER', 'FELLOW', 'ADVISOR', 'ASSOCIATE']).optional(),
  avatarUrl: z.string().url().optional().nullable(),
  sortOrder: z.number().int().min(0).optional(),
  isPublished: z.boolean().optional(),
}).strict();

// GET /api/team/:id — public
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const member = await prisma.teamMember.findUnique({ where: { id } });
  if (!member) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ member });
}

// PUT /api/team/:id — admin only
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getAuthUser();
  if (!requireRole(user, [UserRole.ADMIN])) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();

  const parsed = updateTeamSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten() }, { status: 400 });
  }

  const member = await prisma.teamMember.update({
    where: { id },
    data: parsed.data,
  });

  return NextResponse.json({ member });
}

// DELETE /api/team/:id — admin only
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getAuthUser();
  if (!requireRole(user, [UserRole.ADMIN])) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  await prisma.teamMember.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
