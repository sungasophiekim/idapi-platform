// src/app/api/regulations/[id]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { getAuthUser, requireRole } from '@/lib/auth';
import { UserRole } from '@prisma/client';
import { analyzeRegulation } from '@/modules/ai-engine';

const updateRegulationSchema = z.object({
  title: z.string().min(1).max(500).optional(),
  titleEn: z.string().max(500).optional().nullable(),
  summary: z.string().max(5000).optional().nullable(),
  summaryEn: z.string().max(5000).optional().nullable(),
  jurisdiction: z.enum(['KR', 'US', 'EU', 'SG', 'JP', 'UK', 'HK', 'INTL']).optional(),
  status: z.enum(['PROPOSED', 'COMMITTEE', 'FLOOR_VOTE', 'PASSED', 'ENACTED', 'REJECTED', 'WITHDRAWN']).optional(),
  sourceUrl: z.string().url().optional().nullable(),
  sourceName: z.string().max(200).optional().nullable(),
  billNumber: z.string().max(100).optional().nullable(),
  tags: z.array(z.string()).optional(),
  researchArea: z.enum(['KOREA_POLICY', 'DIGITAL_FINANCE', 'INFRASTRUCTURE', 'INCLUSION']).optional().nullable(),
  rawContent: z.string().max(50000).optional().nullable(),
  proposedDate: z.string().optional().nullable(),
  enactedDate: z.string().optional().nullable(),
}).strict();

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

  const parsed = updateRegulationSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten() }, { status: 400 });
  }

  const oldReg = await prisma.regulation.findUnique({ where: { id } });
  if (!oldReg) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const { proposedDate, enactedDate, status, ...rest } = parsed.data;
  const statusChanged = status && status !== oldReg.status;

  const regulation = await prisma.regulation.update({
    where: { id },
    data: {
      ...rest,
      ...(status ? { status } : {}),
      lastUpdatedDate: new Date(),
      ...(proposedDate !== undefined ? { proposedDate: proposedDate ? new Date(proposedDate) : null } : {}),
      ...(enactedDate !== undefined ? { enactedDate: enactedDate ? new Date(enactedDate) : null } : {}),
    },
  });

  if (statusChanged) {
    await prisma.regulationEvent.create({
      data: {
        regulationId: id,
        status: status!,
        description: `상태 변경: ${oldReg.status} → ${status}`,
        descriptionEn: `Status changed: ${oldReg.status} → ${status}`,
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
  } catch {
    return NextResponse.json({ error: 'AI analysis failed' }, { status: 500 });
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
