import { NextResponse } from 'next/server';
import { getArchiveStats } from '@/modules/law-archive';

export async function GET() {
  const stats = await getArchiveStats();
  return NextResponse.json(stats);
}
