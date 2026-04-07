// src/app/api/archive/collect-asia/route.ts
// POST: Trigger Japan + Hong Kong law collection

export const maxDuration = 300;
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getAuthUser, requireRole } from '@/lib/auth';
import { UserRole } from '@prisma/client';
import { collectJapaneseLaw, JAPANESE_LAW_TARGETS } from '@/modules/law-collector/jp-collector';
import { collectHongKongLaw, HONG_KONG_LAW_TARGETS } from '@/modules/law-collector/hk-collector';

export async function POST() {
  const user = await getAuthUser();
  if (!requireRole(user, [UserRole.ADMIN, UserRole.RESEARCHER])) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const details: string[] = [];
  let collected = 0;
  let failed = 0;

  // Japan
  for (const t of JAPANESE_LAW_TARGETS) {
    const anyT = t as Record<string, string>;
    const name = anyT.nameEn || anyT.titleEn || anyT.name || anyT.lawId;
    try {
      await new Promise(r => setTimeout(r, 500));
      const r = await collectJapaneseLaw(anyT.lawId, name, { shortName: anyT.shortName, regulator: anyT.regulator });
      if (r.success) {
        details.push(`[OK] JP ${name}: ${r.articleCount} articles`);
        collected++;
      } else {
        details.push(`[FAIL] JP ${name}`);
        failed++;
      }
    } catch (e: any) {
      details.push(`[ERROR] JP ${name}: ${e.message}`);
      failed++;
    }
  }

  // Hong Kong
  for (const t of HONG_KONG_LAW_TARGETS) {
    const anyT = t as Record<string, string>;
    const name = anyT.titleEn || anyT.nameEn || anyT.name || anyT.capNumber;
    try {
      await new Promise(r => setTimeout(r, 500));
      const r = await collectHongKongLaw(anyT.capNumber, name, { shortName: anyT.shortName, regulator: anyT.regulator });
      if (r.success) {
        details.push(`[OK] HK ${name}: ${r.articleCount} articles`);
        collected++;
      } else {
        details.push(`[FAIL] HK ${name}`);
        failed++;
      }
    } catch (e: any) {
      details.push(`[ERROR] HK ${name}: ${e.message}`);
      failed++;
    }
  }

  return NextResponse.json({ collected, failed, details });
}
