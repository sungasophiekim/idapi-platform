// src/app/api/pii/route.ts
// GET: IDAPI Policy Intelligence Index

export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { calculatePII, generateWeeklySummary } from '@/modules/pii-index';

export async function GET() {
  try {
    const [pii, summary] = await Promise.all([
      calculatePII(),
      generateWeeklySummary(),
    ]);

    return NextResponse.json({ pii, summary });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
