// src/modules/ai-editor/index.ts
// AI Editor-in-Chief — helps researchers turn an idea into a structured,
// review-ready draft. Frame → frame draft → editorial review → translation.
// Reuses the same Claude endpoint/model as the rest of the platform.

const CLAUDE_API = 'https://api.anthropic.com/v1/messages';
const MODEL = 'claude-sonnet-5';

export function aiEditorAvailable(): boolean {
  return !!process.env.ANTHROPIC_API_KEY;
}

async function callClaude(system: string, user: string, maxTokens = 4096): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY not configured');

  const res = await fetch(CLAUDE_API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify({ model: MODEL, max_tokens: maxTokens, system, messages: [{ role: 'user', content: user }] }),
  });
  if (!res.ok) throw new Error(`Claude API error: ${res.status} ${await res.text()}`);
  const data = await res.json();
  return data.content?.[0]?.text || '';
}

function parseJson<T>(raw: string, fallback: T): T {
  try {
    return JSON.parse(raw.replace(/```json?\n?/g, '').replace(/```/g, '').trim());
  } catch {
    return fallback;
  }
}

// Report-type guide frames the editor works from.
export const REPORT_GUIDES: Record<string, { label: string; sections: string[] }> = {
  POLICY_BRIEF: { label: '정책브리프', sections: ['핵심 요지', '배경·맥락', '쟁점 분석', '정책 제언', '결론'] },
  COMMENTARY:   { label: '논평',       sections: ['논지', '현황', '평가', '함의'] },
  REPORT:       { label: '보고서',     sections: ['요약(Executive Summary)', '서론', '현황·데이터', '분석', '시사점', '정책 제언', '결론'] },
  SEMINAR:      { label: '세미나 노트', sections: ['개요', '주요 발표', '토론 쟁점', '시사점'] },
  PRESS_RELEASE:{ label: '보도자료',   sections: ['헤드라인', '핵심 내용', '배경', '인용', '문의처'] },
};

const EDITOR_PERSONA = `You are IDAPI's editor-in-chief for a policy think tank focused on digital and AI policy infrastructure (AI governance, DPI, digital identity, data governance, digital assets). You are rigorous, structured, and neutral. You write in Korean by default unless asked otherwise. You never fabricate facts, statistics, or citations — where a claim needs a source, you flag it for the researcher instead of inventing one.`;

// ─── 1. Guide frame: idea → structured outline ───
export async function generateFrame(idea: string, category: string): Promise<string> {
  const guide = REPORT_GUIDES[category] || REPORT_GUIDES.POLICY_BRIEF;
  const system = `${EDITOR_PERSONA}\nProduce a report guide outline in Korean Markdown for a "${guide.label}". Use these sections as the backbone: ${guide.sections.join(', ')}. Under each section give 1-2 bullet guiding questions the researcher should answer. Keep it a skeleton — do NOT write the article yet.`;
  return callClaude(system, `주제/아이디어:\n${idea.slice(0, 4000)}`);
}

// ─── 2. Frame draft: idea + frame → structured draft ───
export async function generateFrameDraft(idea: string, frame: string, category: string): Promise<string> {
  const guide = REPORT_GUIDES[category] || REPORT_GUIDES.POLICY_BRIEF;
  const system = `${EDITOR_PERSONA}\nWrite a FIRST DRAFT in Korean Markdown for a "${guide.label}" following the given outline. Fill each section with prose based ONLY on the researcher's idea and material. Where a factual claim needs evidence you don't have, insert a bracketed flag like "[출처 확인 필요]" rather than inventing data. Use ## headings, short paragraphs, and bullet lists where helpful.`;
  return callClaude(system, `아이디어/자료:\n${idea.slice(0, 6000)}\n\n가이드 틀:\n${frame.slice(0, 3000)}`, 6000);
}

export interface EditorReview {
  strengths: string[];
  gaps: string[];
  requests: string[];      // concrete revision requests
  checklist: string[];     // verification items ("□ ... 출처 미확인")
}

// ─── 3. Editorial review ───
export async function reviewDraft(content: string, category: string): Promise<EditorReview> {
  const guide = REPORT_GUIDES[category] || REPORT_GUIDES.POLICY_BRIEF;
  const system = `${EDITOR_PERSONA}\nReview this "${guide.label}" draft as its editor. Respond ONLY as JSON:
{ "strengths": ["..."], "gaps": ["..."], "requests": ["구체적 수정 요청"], "checklist": ["□ 검증 필요 항목 (출처/수치 등)"] }
Be specific and actionable. Korean. 2-5 items each; checklist flags every unverified fact/number/citation.`;
  const raw = await callClaude(system, content.slice(0, 8000));
  return parseJson<EditorReview>(raw, { strengths: [], gaps: [], requests: [], checklist: [] });
}

// ─── 4. Translate KO ↔ EN (preserves Markdown) ───
export async function translateDraft(content: string, to: 'ko' | 'en'): Promise<string> {
  const system = `${EDITOR_PERSONA}\nTranslate the following policy draft into ${to === 'en' ? 'English' : 'Korean'}, preserving Markdown structure, headings, and any "[출처 확인 필요]" flags. Return only the translated Markdown.`;
  return callClaude(system, content.slice(0, 8000), 6000);
}

// ─── 5. Polish a passage ───
export async function polish(text: string): Promise<string> {
  const system = `${EDITOR_PERSONA}\nPolish this passage for clarity, tone, and flow WITHOUT changing its meaning or adding facts. Return only the revised text.`;
  return callClaude(system, text.slice(0, 6000));
}

// ─── Title + excerpt suggestion ───
export async function suggestMeta(content: string): Promise<{ title: string; titleEn: string; excerpt: string }> {
  const system = `${EDITOR_PERSONA}\nFrom this draft, propose a title and a 2-sentence excerpt. Respond ONLY as JSON: { "title": "한글 제목", "titleEn": "English title", "excerpt": "한글 요약 2문장" }`;
  const raw = await callClaude(system, content.slice(0, 6000));
  return parseJson(raw, { title: '', titleEn: '', excerpt: '' });
}
