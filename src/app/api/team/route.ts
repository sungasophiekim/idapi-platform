import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '../../../lib/db';
import { getAuthUser, requireRole } from '../../../lib/auth';
import { UserRole, TeamMemberType } from '../../../generated/prisma/client';

const createSchema = z.object({
  name: z.string().min(1),
  nameEn: z.string().optional(),
  title: z.string().min(1),
  titleEn: z.string().optional(),
  bio: z.string().min(1),
  bioEn: z.string().optional(),
  credentials: z.array(z.string()).default([]),
  credentialsEn: z.array(z.string()).default([]),
  type: z.nativeEnum(TeamMemberType).default('FELLOW'),
  published: z.boolean().default(true),
  order: z.number().optional(),
});

export async function GET(request: NextRequest) {
  const all = request.nextUrl.searchParams.get('all');

  const where = all ? {} : { published: true };
  const team = await prisma.teamMember.findMany({
    where,
    orderBy: { order: 'asc' },
    select: {
      id: true, name: true, nameEn: true, title: true, titleEn: true,
      bio: true, bioEn: true, credentials: true, credentialsEn: true,
      type: true, order: true, published: true,
    },
  });

  return NextResponse.json({ team });
}

export async function POST(request: NextRequest) {
  const user = await getAuthUser();
  if (!requireRole(user, [UserRole.ADMIN])) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten() }, { status: 400 });
  }

  const count = await prisma.teamMember.count();
  const member = await prisma.teamMember.create({
    data: { ...parsed.data, order: parsed.data.order ?? count },
  });

  return NextResponse.json({ member }, { status: 201 });
}
