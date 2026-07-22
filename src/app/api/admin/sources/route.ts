// src/app/api/admin/sources/route.ts — RSS source health for the admin dashboard
import { NextResponse } from 'next/server';
import { getAuthUser, requireRole } from '@/lib/auth';
import { UserRole } from '@prisma/client';
import { checkAllSources } from '@/modules/trend-engine/health';

export const maxDuration = 120;
export const dynamic = 'force-dynamic';

export async function GET() {
  const user = await getAuthUser();
  if (!requireRole(user, [UserRole.ADMIN, UserRole.EDITOR, UserRole.RESEARCHER])) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const sources = await checkAllSources();
  const live = sources.filter(s => s.status === 'live').length;
  return NextResponse.json({
    checkedAt: new Date().toISOString(),
    total: sources.length,
    live,
    dead: sources.length - live,
    sources,
  });
}
