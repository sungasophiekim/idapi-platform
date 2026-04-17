// src/app/api/newsletter/route.ts
// POST: Subscribe to newsletter

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';

const subscribeSchema = z.object({
  email: z.string().email(),
  name: z.string().max(100).optional(),
  company: z.string().max(200).optional(),
  role: z.enum(['researcher', 'business', 'government', 'media', 'other']).optional(),
}).strict();

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = subscribeSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
  }

  try {
    await prisma.newsletterSubscriber.upsert({
      where: { email: parsed.data.email },
      update: { isActive: true, name: parsed.data.name, company: parsed.data.company, role: parsed.data.role },
      create: { ...parsed.data },
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Subscription failed' }, { status: 500 });
  }
}
