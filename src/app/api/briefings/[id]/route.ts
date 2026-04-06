// src/app/api/briefings/[id]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAuthUser, requireRole } from '@/lib/auth';
import { UserRole } from '@prisma/client';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const briefing = await prisma.aiBriefing.findUnique({ where: { id } });
  if (!briefing) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ briefing });
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getAuthUser();
  if (!requireRole(user, [UserRole.ADMIN, UserRole.RESEARCHER])) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();

  delete body.id;
  delete body.createdAt;

  if (body.publishedAt) body.publishedAt = new Date(body.publishedAt);

  const briefing = await prisma.aiBriefing.update({ where: { id }, data: body });
  return NextResponse.json({ briefing });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getAuthUser();
  if (!requireRole(user, [UserRole.ADMIN])) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  await prisma.aiBriefing.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
