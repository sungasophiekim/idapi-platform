// src/modules/news-clip/translate.ts
// Batch-translate PUBLISHED clip headlines so the ticker/feed can show them
// in the reader's selected language. Only published clips are translated
// (cost control); one Claude call handles a whole batch of titles.

import { prisma } from '@/lib/db';

const CLAUDE_API = 'https://api.anthropic.com/v1/messages';
const MODEL = 'claude-haiku-4-5-20251001'; // cheap/fast — headlines only

async function callClaude(system: string, user: string, maxTokens = 2048): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY not configured');
  const res = await fetch(CLAUDE_API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify({ model: MODEL, max_tokens: maxTokens, system, messages: [{ role: 'user', content: user }] }),
  });
  if (!res.ok) throw new Error(`Claude API error: ${res.status}`);
  const data = await res.json();
  return data.content?.[0]?.text || '';
}

// Translate an array of headlines into `to`. Returns same-length array;
// on any failure returns the originals (graceful fallback).
async function translateBatch(titles: string[], to: 'ko' | 'en'): Promise<string[]> {
  if (!titles.length) return [];
  const lang = to === 'en' ? 'English' : 'Korean';
  const system = `You translate news headlines into ${lang} for a policy think tank on digital & AI public infrastructure. Keep them concise and headline-style. Preserve proper nouns, tickers, and org names. Respond ONLY with a JSON array of translated strings, same length and order as the input. No prose.`;
  const raw = await callClaude(system, JSON.stringify(titles));
  try {
    const arr = JSON.parse(raw.replace(/```json?\n?/g, '').replace(/```/g, '').trim());
    if (Array.isArray(arr) && arr.length === titles.length) return arr.map((x, i) => String(x || titles[i]));
  } catch { /* fall through */ }
  return titles;
}

export async function translatePublishedTitles(): Promise<{ filledOriginal: number; translated: number }> {
  const clips = await prisma.newsClip.findMany({
    where: { status: 'PUBLISHED' },
    select: { id: true, title: true, titleKo: true, titleEn: true, lang: true },
  });

  // 1. Same-language slot = original headline (no AI needed).
  let filledOriginal = 0;
  for (const c of clips) {
    const isKo = c.lang === 'ko';
    const patch: any = {};
    if (isKo && !c.titleKo) { patch.titleKo = c.title; c.titleKo = c.title; }
    if (!isKo && !c.titleEn) { patch.titleEn = c.title; c.titleEn = c.title; }
    if (Object.keys(patch).length) { await prisma.newsClip.update({ where: { id: c.id }, data: patch }); filledOriginal++; }
  }

  if (!process.env.ANTHROPIC_API_KEY) return { filledOriginal, translated: 0 };

  // 2. Translate the missing opposite-language slot, in batches.
  const needKo = clips.filter(c => !c.titleKo);
  const needEn = clips.filter(c => !c.titleEn);
  let translated = 0;
  const CHUNK = 20;

  for (const [need, to] of [[needKo, 'ko'], [needEn, 'en']] as const) {
    for (let i = 0; i < need.length; i += CHUNK) {
      const batch = need.slice(i, i + CHUNK);
      let out: string[];
      try { out = await translateBatch(batch.map(c => c.title), to); }
      catch { continue; }
      for (let j = 0; j < batch.length; j++) {
        const data = to === 'ko' ? { titleKo: out[j] } : { titleEn: out[j] };
        await prisma.newsClip.update({ where: { id: batch[j].id }, data });
        translated++;
      }
    }
  }
  return { filledOriginal, translated };
}
