import { NextRequest, NextResponse } from 'next/server';
import { searchArticlesByKeyword } from '@/modules/law-archive';

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q');
  if (!q || q.length < 2) {
    return NextResponse.json({ error: 'Query too short' }, { status: 400 });
  }

  const jurisdictions = req.nextUrl.searchParams.get('jurisdictions')?.split(',');
  const results = await searchArticlesByKeyword(q, jurisdictions, 20);
  return NextResponse.json({ results });
}
