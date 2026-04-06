// src/app/api/consult/route.ts
// POST: Submit business profile → get regulatory compliance report

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { generateComplianceReport, type BusinessProfile } from '@/modules/reg-consulting';
import { z } from 'zod';
import { sendNotification } from '@/lib/notifications';

const profileSchema = z.object({
  companyName: z.string().optional(),
  description: z.string().min(20).max(5000),
  businessTypes: z.array(z.enum([
    'exchange', 'stablecoin-issuer', 'sto-issuer', 'rwa-issuer', 'ico-issuer',
    'token-issuer', 'wallet-provider', 'defi-protocol', 'nft-platform',
    'payment-service', 'fund-manager', 'mining-staking', 'data-analytics',
  ])).min(1),
  targetJurisdictions: z.array(z.string()).min(1),
  hasToken: z.boolean(),
  tokenType: z.string().optional(),
  currentStage: z.enum(['idea', 'building', 'operating', 'expanding']),
  employeeCount: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = profileSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input', details: parsed.error.flatten() }, { status: 400 });
  }

  const profile = parsed.data as BusinessProfile;

  try {
    // Fetch pending regulations from DB
    const pendingRegs = await prisma.regulation.findMany({
      where: {
        status: { notIn: ['ENACTED', 'REJECTED', 'WITHDRAWN'] },
        jurisdiction: { in: profile.targetJurisdictions as any[] },
      },
      orderBy: { impactScore: 'desc' },
      take: 20,
    });

    const report = await generateComplianceReport(profile, pendingRegs);

    // Log consultation
    sendNotification({
      type: 'SYSTEM',
      title: `새 컨설팅 요청: ${profile.companyName || 'Anonymous'}`,
      titleEn: `New consultation: ${profile.companyName || 'Anonymous'}`,
      message: `비즈니스 유형: ${profile.businessTypes.join(', ')} | 대상 국가: ${profile.targetJurisdictions.join(', ')}`,
      messageEn: `Business types: ${profile.businessTypes.join(', ')} | Jurisdictions: ${profile.targetJurisdictions.join(', ')}`,
    }).catch(() => {});

    return NextResponse.json({ report });
  } catch {
    return NextResponse.json({ error: 'Report generation failed' }, { status: 500 });
  }
}
