// src/app/api/analyze/route.ts
// POST: Submit regulation text for AI analysis
// Public endpoint but rate-limited (future: requires Pro subscription)

import { NextRequest, NextResponse } from 'next/server';
import { analyzeRegulation, generateSummary, compareRegulations } from '@/modules/ai-engine';
import { z } from 'zod';

const analyzeSchema = z.object({
  type: z.enum(['analyze', 'summarize', 'compare']),
  text: z.string().min(50).max(30000),
  jurisdiction: z.string().default('KR'),
  // For comparison
  textB: z.string().optional(),
  jurisdictionB: z.string().optional(),
});

export async function POST(req: NextRequest) {
  // Rate limit check (simple: by IP, future: by subscription tier)
  // For now, just check API key exists
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: 'AI engine not configured' }, { status: 503 });
  }

  const body = await req.json();
  const parsed = analyzeSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input', details: parsed.error.flatten() }, { status: 400 });
  }

  const { type, text, jurisdiction, textB, jurisdictionB } = parsed.data;

  try {
    switch (type) {
      case 'analyze': {
        const result = await analyzeRegulation(text, jurisdiction);
        return NextResponse.json({ type: 'analysis', result });
      }
      case 'summarize': {
        const result = await generateSummary(text, `Jurisdiction: ${jurisdiction}`);
        return NextResponse.json({ type: 'summary', result });
      }
      case 'compare': {
        if (!textB || !jurisdictionB) {
          return NextResponse.json({ error: 'textB and jurisdictionB required for comparison' }, { status: 400 });
        }
        const result = await compareRegulations(
          { jurisdiction, title: 'Regulation A', content: text },
          { jurisdiction: jurisdictionB, title: 'Regulation B', content: textB }
        );
        return NextResponse.json({ type: 'comparison', result });
      }
    }
  } catch (err: any) {
    return NextResponse.json({ error: 'Analysis failed', message: err.message }, { status: 500 });
  }
}
