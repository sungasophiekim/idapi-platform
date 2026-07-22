// src/app/api/admin/drafts/ai/route.ts
// Runs an AI editor-in-chief action on a draft and persists the result.

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAuthUser, requireRole } from '@/lib/auth';
import { UserRole } from '@prisma/client';
import { z } from 'zod';
import {
  aiEditorAvailable, generateFrame, generateFrameDraft, reviewDraft,
  translateDraft, polish, suggestMeta,
} from '@/modules/ai-editor';

const ROLES = [UserRole.ADMIN, UserRole.EDITOR, UserRole.RESEARCHER];

const schema = z.object({
  id: z.string(),
  action: z.enum(['frame', 'draft', 'review', 'translate', 'polish', 'meta']),
  to: z.enum(['ko', 'en']).optional(),   // translate target
  text: z.string().optional(),           // polish target passage
}).strict();

export async function POST(req: NextRequest) {
  const user = await getAuthUser();
  if (!requireRole(user, ROLES)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!aiEditorAvailable()) return NextResponse.json({ error: 'AI editor unavailable (ANTHROPIC_API_KEY not set)' }, { status: 503 });

  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
  const { id, action, to, text } = parsed.data;

  const draft = await prisma.researchDraft.findUnique({ where: { id } });
  if (!draft) return NextResponse.json({ error: 'Draft not found' }, { status: 404 });

  try {
    switch (action) {
      case 'frame': {
        const frame = await generateFrame(draft.idea || '', draft.category);
        const updated = await prisma.researchDraft.update({ where: { id }, data: { frame, stage: 'FRAME' } });
        return NextResponse.json({ draft: updated });
      }
      case 'draft': {
        const content = await generateFrameDraft(draft.idea || '', draft.frame || '', draft.category);
        const updated = await prisma.researchDraft.update({ where: { id }, data: { content, stage: 'DRAFTING' } });
        return NextResponse.json({ draft: updated });
      }
      case 'review': {
        const review = await reviewDraft(draft.content || '', draft.category);
        const history = Array.isArray(draft.reviewNotes) ? (draft.reviewNotes as any[]) : [];
        history.unshift({ by: 'AI', at: new Date().toISOString(), ...review });
        const updated = await prisma.researchDraft.update({ where: { id }, data: { reviewNotes: history, stage: 'AI_REVIEW' } });
        return NextResponse.json({ draft: updated, review });
      }
      case 'translate': {
        const target = to || 'en';
        const src = target === 'en' ? draft.content : draft.contentEn;
        const translated = await translateDraft(src || '', target);
        const data = target === 'en' ? { contentEn: translated } : { content: translated };
        const updated = await prisma.researchDraft.update({ where: { id }, data });
        return NextResponse.json({ draft: updated, translated });
      }
      case 'polish': {
        const result = await polish(text || draft.content || '');
        return NextResponse.json({ text: result });
      }
      case 'meta': {
        const meta = await suggestMeta(draft.content || '');
        const updated = await prisma.researchDraft.update({ where: { id }, data: meta });
        return NextResponse.json({ draft: updated, meta });
      }
    }
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'AI action failed' }, { status: 500 });
  }
}
