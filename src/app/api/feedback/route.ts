// POST: Submit feedback on a regulation/bill
// GET: Get feedback summary for a regulation

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';

const feedbackSchema = z.object({
  regulationId: z.string(),
  position: z.enum(['support', 'oppose', 'conditional']),
  comment: z.string().max(2000).optional(),
  company: z.string().max(200).optional(),
  email: z.string().email().optional(),
}).strict();

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = feedbackSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
  }

  // Store feedback in SiteSettings as JSON (simple approach without schema change)
  const key = `feedback_${parsed.data.regulationId}_${Date.now()}`;
  await prisma.siteSetting.create({
    data: { key, value: JSON.stringify(parsed.data) },
  });

  return NextResponse.json({ success: true });
}

export async function GET(req: NextRequest) {
  const regId = req.nextUrl.searchParams.get('regulationId');
  if (!regId) return NextResponse.json({ error: 'regulationId required' }, { status: 400 });

  const feedbacks = await prisma.siteSetting.findMany({
    where: { key: { startsWith: `feedback_${regId}_` } },
  });

  const parsed = feedbacks.map(f => {
    try { return JSON.parse(f.value); } catch { return null; }
  }).filter(Boolean);

  const summary = {
    total: parsed.length,
    support: parsed.filter((f: any) => f.position === 'support').length,
    oppose: parsed.filter((f: any) => f.position === 'oppose').length,
    conditional: parsed.filter((f: any) => f.position === 'conditional').length,
    comments: parsed.filter((f: any) => f.comment).map((f: any) => ({
      position: f.position,
      comment: f.comment,
      company: f.company,
    })),
  };

  return NextResponse.json(summary);
}
