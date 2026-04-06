// src/app/api/team/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAuthUser, requireRole } from '@/lib/auth';
import { UserRole } from '@prisma/client';

// GET /api/team — public (published only) or admin (all)
export async function GET(req: NextRequest) {
  const showAll = req.nextUrl.searchParams.get('all') === 'true';

  if (showAll) {
    const user = await getAuthUser();
    if (!requireRole(user, [UserRole.ADMIN])) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const members = await prisma.teamMember.findMany({ orderBy: { sortOrder: 'asc' } });
    return NextResponse.json({ members });
  }

  const members = await prisma.teamMember.findMany({
    where: { isPublished: true },
    orderBy: { sortOrder: 'asc' },
  });

  return NextResponse.json({ members });
}

// POST /api/team — admin only
export async function POST(req: NextRequest) {
  const user = await getAuthUser();
  if (!requireRole(user, [UserRole.ADMIN])) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const member = await prisma.teamMember.create({ data: body });

  return NextResponse.json({ member }, { status: 201 });
}
