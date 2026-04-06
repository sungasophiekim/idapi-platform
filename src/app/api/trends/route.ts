// src/app/api/trends/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET /api/trends — current policy trends
export async function GET() {
  const trends = await prisma.policyTrend.findMany({
    where: { expiresAt: { gte: new Date() } },
    orderBy: { score: 'desc' },
    take: 12,
  });

  return NextResponse.json({ trends });
}
