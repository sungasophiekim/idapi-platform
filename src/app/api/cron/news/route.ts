// src/app/api/cron/news/route.ts
// Dedicated news-clipping cron — RSS fetch + upsert only (no AI, low cost).
// Runs every 6 hours so the ticker stays fresh without 4×-ing the AI trend job.

export const maxDuration = 120;
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  const cronSecret = req.headers.get('x-cron-secret') || req.nextUrl.searchParams.get('secret');
  const isAuthorized = authHeader === `Bearer ${process.env.CRON_SECRET}` || cronSecret === process.env.CRON_SECRET;
  if (!isAuthorized) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let result: any = {};
  try {
    const { collectNewsClips } = await import('@/modules/news-clip');
    result = await collectNewsClips();
  } catch (e: any) {
    result = { error: e.message };
  }

  return NextResponse.json({ timestamp: new Date().toISOString(), newsClips: result });
}
