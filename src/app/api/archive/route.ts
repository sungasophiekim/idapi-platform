import { NextResponse } from 'next/server';
import { listArchivedLaws } from '@/modules/law-archive';

export async function GET() {
  const laws = await listArchivedLaws();
  return NextResponse.json({ laws });
}
