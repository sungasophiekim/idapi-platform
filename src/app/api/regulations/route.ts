// src/app/api/regulations/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAuthUser, requireRole } from '@/lib/auth';
import { UserRole } from '@prisma/client';
import { analyzeRegulation } from '@/modules/ai-engine';
import { z } from 'zod';

// GET /api/regulations — public dashboard data
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const jurisdiction = searchParams.get('jurisdiction');
  const status = searchParams.get('status');
  const limit = parseInt(searchParams.get('limit') || '20');

  const where: any = {};
  if (jurisdiction && jurisdiction !== 'all') where.jurisdiction = jurisdiction;
  if (status && status !== 'all') where.status = status;

  const [regulations, total] = await Promise.all([
    prisma.regulation.findMany({
      where,
      orderBy: [{ impactScore: 'desc' }, { updatedAt: 'desc' }],
      take: limit,
      include: { timelineEvents: { orderBy: { eventDate: 'desc' }, take: 3 } },
    }),
    prisma.regulation.count({ where }),
  ]);

  return NextResponse.json({ regulations, total });
}

// POST /api/regulations — create + optionally trigger AI analysis
const createSchema = z.object({
  jurisdiction: z.enum(['KR', 'US', 'EU', 'SG', 'JP', 'UK', 'HK', 'INTL']),
  status: z.enum(['PROPOSED', 'COMMITTEE', 'FLOOR_VOTE', 'PASSED', 'ENACTED', 'REJECTED', 'WITHDRAWN']).default('PROPOSED'),
  title: z.string().min(1),
  titleEn: z.string().optional(),
  summary: z.string().optional(),
  summaryEn: z.string().optional(),
  sourceUrl: z.string().url().optional().or(z.literal('')),
  sourceName: z.string().optional(),
  billNumber: z.string().optional(),
  tags: z.array(z.string()).optional(),
  researchArea: z.enum(['KOREA_POLICY', 'DIGITAL_FINANCE', 'INFRASTRUCTURE', 'INCLUSION']).optional(),
  rawContent: z.string().optional(),
  proposedDate: z.string().optional(),
  runAiAnalysis: z.boolean().default(false),
});

export async function POST(req: NextRequest) {
  const user = await getAuthUser();
  if (!requireRole(user, [UserRole.ADMIN, UserRole.RESEARCHER])) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten() }, { status: 400 });
  }

  const data = parsed.data;
  let aiData: any = {};

  // Run AI analysis if requested and raw content is provided
  if (data.runAiAnalysis && data.rawContent) {
    try {
      const analysis = await analyzeRegulation(data.rawContent, data.jurisdiction);
      aiData = {
        aiSummary: analysis.summary,
        summary: data.summary || analysis.summary,
        summaryEn: data.summaryEn || analysis.summaryEn,
        impactScore: analysis.impactScore,
        tags: analysis.tags,
        researchArea: analysis.researchArea as any,
      };
    } catch (e) {
      console.error('AI analysis failed:', e);
      // Continue without AI data — don't block creation
    }
  }

  const regulation = await prisma.regulation.create({
    data: {
      jurisdiction: data.jurisdiction,
      status: data.status,
      title: data.title,
      titleEn: data.titleEn,
      summary: data.summary,
      summaryEn: data.summaryEn,
      sourceUrl: data.sourceUrl || null,
      sourceName: data.sourceName,
      billNumber: data.billNumber,
      tags: data.tags || [],
      rawContent: data.rawContent,
      proposedDate: data.proposedDate ? new Date(data.proposedDate) : null,
      lastUpdatedDate: new Date(),
      ...aiData,
      // Create initial timeline event
      timelineEvents: {
        create: {
          status: data.status,
          description: `규제 등록: ${data.title}`,
          descriptionEn: `Regulation registered: ${data.titleEn || data.title}`,
          eventDate: new Date(),
        },
      },
    },
    include: { timelineEvents: true },
  });

  return NextResponse.json({ regulation }, { status: 201 });
}
