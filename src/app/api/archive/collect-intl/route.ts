// src/app/api/archive/collect-intl/route.ts
// POST: Trigger international law collection (US, EU, SG)

export const maxDuration = 300; // 5 minutes for batch collection
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getAuthUser, requireRole } from '@/lib/auth';
import { UserRole } from '@prisma/client';
import { collectKnownInternationalLaws } from '@/modules/law-collector/intl-collector';

export async function POST() {
  const user = await getAuthUser();
  if (!requireRole(user, [UserRole.ADMIN, UserRole.RESEARCHER])) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const result = await collectKnownInternationalLaws();
    return NextResponse.json(result);
  } catch (e: any) {
    return NextResponse.json({ error: 'Collection failed', message: e.message }, { status: 500 });
  }
}
