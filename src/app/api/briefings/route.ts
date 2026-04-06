// src/app/api/briefings/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAuthUser, requireRole } from '@/lib/auth';
import { UserRole } from '@prisma/client';
import { generateDailyBriefing } from '@/modules/ai-engine';

// GET /api/briefings — list briefings (public: published only, admin: all)
export async function GET(req: NextRequest) {
  const limit = parseInt(req.nextUrl.searchParams.get('limit') || '20');
  const showAll = req.nextUrl.searchParams.get('all') === 'true';

  const where: any = {};
  if (showAll) {
    const user = await getAuthUser();
    if (!requireRole(user, [UserRole.ADMIN, UserRole.RESEARCHER])) {
      where.isPublished = true; // Fallback to public only
    }
  } else {
    where.isPublished = true;
  }

  const briefings = await prisma.aiBriefing.findMany({
    where,
    orderBy: { generatedAt: 'desc' },
    take: limit,
  });

  return NextResponse.json({ briefings });
}

// POST /api/briefings/generate — trigger AI briefing generation
export async function POST(req: NextRequest) {
  const user = await getAuthUser();
  if (!requireRole(user, [UserRole.ADMIN, UserRole.RESEARCHER])) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Get recent regulations (last 7 days)
  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const recentRegs = await prisma.regulation.findMany({
    where: { updatedAt: { gte: since } },
    orderBy: { impactScore: 'desc' },
    take: 10,
  });

  if (recentRegs.length === 0) {
    return NextResponse.json({ error: 'No recent regulations to brief on' }, { status: 400 });
  }

  try {
    const result = await generateDailyBriefing(
      recentRegs.map(r => ({
        title: r.title,
        titleEn: r.titleEn || undefined,
        jurisdiction: r.jurisdiction,
        summary: r.aiSummary || r.summary || undefined,
        impactScore: r.impactScore || undefined,
      }))
    );

    const briefing = await prisma.aiBriefing.create({
      data: {
        type: 'daily',
        title: result.title,
        titleEn: result.titleEn,
        content: result.content,
        contentEn: result.contentEn,
        regulationIds: recentRegs.map(r => r.id),
        isPublished: false, // Requires manual review before publishing
      },
    });

    return NextResponse.json({ briefing }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: 'Briefing generation failed', message: e.message }, { status: 500 });
  }
}
