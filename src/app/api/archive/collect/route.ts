// src/app/api/archive/collect/route.ts
// POST: Trigger law collection from official sources

export const maxDuration = 60; // Vercel: extend timeout to 60s for collection
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser, requireRole } from '@/lib/auth';
import { UserRole } from '@prisma/client';
import { collectLaw, KOREAN_LAW_TARGETS, type CollectionTarget } from '@/modules/law-collector';
import { z } from 'zod';

const collectSchema = z.object({
  jurisdiction: z.string(),
  lawName: z.string().min(1),
  sourceUrl: z.string().url().optional(),
  shortName: z.string().optional(),
  regulator: z.string().optional(),
  lawNumber: z.string().optional(),
}).strict();

// POST /api/archive/collect — collect a law from official source
export async function POST(req: NextRequest) {
  const user = await getAuthUser();
  if (!requireRole(user, [UserRole.ADMIN, UserRole.RESEARCHER])) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();

  // If body has "preset" field, use pre-configured targets
  if (body.preset === 'korean-all') {
    const results = [];
    for (const target of KOREAN_LAW_TARGETS) {
      const result = await collectLaw(target);
      results.push(result);
      // Delay 2 seconds between requests to avoid rate limiting
      await new Promise(r => setTimeout(r, 2000));
    }
    return NextResponse.json({ results });
  }

  const parsed = collectSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input', details: parsed.error.flatten() }, { status: 400 });
  }

  const target: CollectionTarget = {
    jurisdiction: parsed.data.jurisdiction,
    lawName: parsed.data.lawName,
    options: {
      sourceUrl: parsed.data.sourceUrl,
      shortName: parsed.data.shortName,
      regulator: parsed.data.regulator,
      lawNumber: parsed.data.lawNumber,
    },
  };

  const result = await collectLaw(target);
  return NextResponse.json(result);
}
