// src/app/api/regulations/[id]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAuthUser, requireRole } from '@/lib/auth';
import { UserRole } from '@prisma/client';
import { analyzeRegulation } from '@/modules/ai-engine';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const regulation = await prisma.regulation.findUnique({
    where: { id },
    include: { timelineEvents: { orderBy: { eventDate: 'desc' } } },
  });
  if (!regulation) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ regulation });
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getAuthUser();
  if (!requireRole(user, [UserRole.ADMIN, UserRole.RESEARCHER])) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();
  const oldReg = await prisma.regulation.findUnique({ where: { id } });
  if (!oldReg) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  // If status changed, create a timeline event
  const statusChanged = body.status && body.status !== oldReg.status;

  const regulation = await prisma.regulation.update({
    where: { id },
    data: {
      ...body,
      lastUpdatedDate: new Date(),
      proposedDate: body.proposedDate ? new Date(body.proposedDate) : undefined,
      enactedDate: body.enactedDate ? new Date(body.enactedDate) : undefined,
    },
  });

  if (statusChanged) {
    await prisma.regulationEvent.create({
      data: {
        regulationId: id,
        status: body.status,
        description: `상태 변경: ${oldReg.status} → ${body.status}`,
        descriptionEn: `Status changed: ${oldReg.status} → ${body.status}`,
        eventDate: new Date(),
      },
    });
  }

  return NextResponse.json({ regulation });
}

// POST /api/regulations/:id/analyze — trigger AI re-analysis
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getAuthUser();
  if (!requireRole(user, [UserRole.ADMIN, UserRole.RESEARCHER])) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const reg = await prisma.regulation.findUnique({ where: { id } });
  if (!reg) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  if (!reg.rawContent) return NextResponse.json({ error: 'No raw content to analyze' }, { status: 400 });

  try {
    const analysis = await analyzeRegulation(reg.rawContent, reg.jurisdiction);
    const updated = await prisma.regulation.update({
      where: { id },
      data: {
        aiSummary: analysis.summary,
        impactScore: analysis.impactScore,
        tags: analysis.tags,
        researchArea: analysis.researchArea as any,
      },
    });
    return NextResponse.json({ regulation: updated, analysis });
  } catch (e: any) {
    return NextResponse.json({ error: 'AI analysis failed', message: e.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getAuthUser();
  if (!requireRole(user, [UserRole.ADMIN])) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { id } = await params;
  await prisma.regulation.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
