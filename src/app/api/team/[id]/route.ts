import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '../../../../lib/db';
import { getAuthUser, requireRole } from '../../../../lib/auth';
import { UserRole, TeamMemberType } from '../../../../generated/prisma/client';

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  nameEn: z.string().optional(),
  title: z.string().min(1).optional(),
  titleEn: z.string().optional(),
  bio: z.string().optional(),
  bioEn: z.string().optional(),
  credentials: z.array(z.string()).optional(),
  credentialsEn: z.array(z.string()).optional(),
  type: z.nativeEnum(TeamMemberType).optional(),
  published: z.boolean().optional(),
  order: z.number().optional(),
});

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const member = await prisma.teamMember.findUnique({ where: { id } });
  if (!member) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ member });
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getAuthUser();
  if (!requireRole(user, [UserRole.ADMIN])) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten() }, { status: 400 });
  }

  const member = await prisma.teamMember.update({ where: { id }, data: parsed.data });
  return NextResponse.json({ member });
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getAuthUser();
  if (!requireRole(user, [UserRole.ADMIN])) {
    return NextResponse.json({ error: 'Admin only' }, { status: 403 });
  }

  const { id } = await params;
  await prisma.teamMember.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
