// src/modules/ai-engine/index.ts
// Core AI Engine — connects to Claude API for regulation analysis

interface AiAnalysisResult {
  summary: string;
  summaryEn: string;
  impactScore: number;     // 1-10
  tags: string[];
  researchArea: string;
  keyPoints: string[];
  keyPointsEn: string[];
}

interface AiBriefingResult {
  title: string;
  titleEn: string;
  content: string;
  contentEn: string;
}

const CLAUDE_API = 'https://api.anthropic.com/v1/messages';

async function callClaude(systemPrompt: string, userMessage: string): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY not configured');

  const res = await fetch(CLAUDE_API, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      system: systemPrompt,
      messages: [{ role: 'user', content: userMessage }],
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Claude API error: ${res.status} ${err}`);
  }

  const data = await res.json();
  return data.content[0]?.text || '';
}

// ─── Regulation Analyzer ───
// Takes raw regulation text and produces structured analysis
export async function analyzeRegulation(rawText: string, jurisdiction: string): Promise<AiAnalysisResult> {
  const system = `You are IDAPI's policy analysis engine. Analyze regulation documents and extract structured data.
You specialize in digital asset, blockchain, and cryptocurrency regulation across global jurisdictions.

ALWAYS respond in valid JSON with this exact schema:
{
  "summary": "Korean summary (2-3 sentences)",
  "summaryEn": "English summary (2-3 sentences)",
  "impactScore": <number 1-10>,
  "tags": ["tag1", "tag2", ...],
  "researchArea": "KOREA_POLICY" | "DIGITAL_FINANCE" | "INFRASTRUCTURE" | "INCLUSION",
  "keyPoints": ["Korean key point 1", "Korean key point 2", ...],
  "keyPointsEn": ["English key point 1", "English key point 2", ...]
}

Impact scoring guide:
- 9-10: Major structural change (new law, market-wide ban/approval)
- 7-8: Significant update (amendment to existing law, major enforcement action)
- 5-6: Moderate (guideline update, regulatory clarification)
- 3-4: Minor (procedural change, minor amendment)
- 1-2: Informational (consultation paper, public comment request)`;

  const response = await callClaude(system, `Jurisdiction: ${jurisdiction}\n\nRegulation text:\n${rawText.slice(0, 8000)}`);

  try {
    // Extract JSON from response (handle markdown code blocks)
    const jsonStr = response.replace(/```json?\n?/g, '').replace(/```/g, '').trim();
    return JSON.parse(jsonStr);
  } catch {
    // Fallback if JSON parsing fails
    return {
      summary: '분석 중 오류가 발생했습니다.',
      summaryEn: 'Analysis encountered an error.',
      impactScore: 5,
      tags: [],
      researchArea: 'KOREA_POLICY',
      keyPoints: [],
      keyPointsEn: [],
    };
  }
}

// ─── Auto Summary Generator ───
// Creates bilingual summaries of any text content
export async function generateSummary(content: string, context?: string): Promise<{ ko: string; en: string }> {
  const system = `You are IDAPI's multilingual summary engine.
Given content about digital asset policy, produce concise bilingual summaries.
Respond in JSON: { "ko": "Korean summary", "en": "English summary" }
Each summary should be 2-3 sentences. Be precise and policy-focused.`;

  const msg = context ? `Context: ${context}\n\nContent:\n${content.slice(0, 6000)}` : content.slice(0, 6000);
  const response = await callClaude(system, msg);

  try {
    const jsonStr = response.replace(/```json?\n?/g, '').replace(/```/g, '').trim();
    return JSON.parse(jsonStr);
  } catch {
    return { ko: content.slice(0, 200), en: '' };
  }
}

// ─── Daily Briefing Generator ───
// Synthesizes recent regulations into a daily policy briefing
export async function generateDailyBriefing(regulations: Array<{
  title: string;
  titleEn?: string;
  jurisdiction: string;
  summary?: string;
  impactScore?: number;
}>): Promise<AiBriefingResult> {
  const system = `You are IDAPI's daily briefing editor.
Given a list of recent regulatory developments, produce a concise daily briefing.
Write in a professional think-tank tone. Prioritize high-impact items.
Respond in JSON:
{
  "title": "Korean briefing title",
  "titleEn": "English briefing title",
  "content": "Korean briefing content (3-5 paragraphs, markdown OK)",
  "contentEn": "English briefing content (3-5 paragraphs, markdown OK)"
}`;

  const regList = regulations.map((r, i) =>
    `${i + 1}. [${r.jurisdiction}] ${r.title}${r.titleEn ? ` / ${r.titleEn}` : ''}\n   Impact: ${r.impactScore || 'N/A'}\n   Summary: ${r.summary || 'N/A'}`
  ).join('\n\n');

  const response = await callClaude(system, `Today's date: ${new Date().toISOString().slice(0, 10)}\n\nRecent regulatory developments:\n\n${regList}`);

  try {
    const jsonStr = response.replace(/```json?\n?/g, '').replace(/```/g, '').trim();
    return JSON.parse(jsonStr);
  } catch {
    return {
      title: '오늘의 정책 브리핑',
      titleEn: "Today's Policy Briefing",
      content: '브리핑 생성 중 오류가 발생했습니다.',
      contentEn: 'Error generating briefing.',
    };
  }
}

// ─── Regulation Comparison Engine ───
// Compares regulations across jurisdictions
export async function compareRegulations(
  regA: { jurisdiction: string; title: string; content: string },
  regB: { jurisdiction: string; title: string; content: string }
): Promise<{ ko: string; en: string }> {
  const system = `You are IDAPI's comparative policy analysis engine.
Compare two regulations from different jurisdictions.
Produce a structured comparison in both Korean and English.
Use markdown tables where appropriate.
Respond in JSON: { "ko": "Korean comparison", "en": "English comparison" }`;

  const msg = `Regulation A [${regA.jurisdiction}]: ${regA.title}\n${regA.content.slice(0, 4000)}\n\n---\n\nRegulation B [${regB.jurisdiction}]: ${regB.title}\n${regB.content.slice(0, 4000)}`;
  const response = await callClaude(system, msg);

  try {
    const jsonStr = response.replace(/```json?\n?/g, '').replace(/```/g, '').trim();
    return JSON.parse(jsonStr);
  } catch {
    return { ko: '비교 분석 생성 중 오류', en: 'Error generating comparison' };
  }
}

// ─── Trend Detection ───
// Analyzes recent content to detect emerging policy topics
export async function detectTrends(recentContent: string[]): Promise<Array<{ keyword: string; keywordEn: string; score: number; relatedTags: string[] }>> {
  const system = `You are IDAPI's trend detection engine.
Analyze recent policy content and identify emerging topics in digital asset regulation.
Return top 5-8 trending topics.
Respond in JSON array: [{ "keyword": "Korean keyword", "keywordEn": "English keyword", "score": <0-100>, "relatedTags": ["tag1", "tag2"] }]
Score guide: 80-100 = urgent/breaking, 50-79 = significant, 20-49 = emerging, 0-19 = background`;

  const content = recentContent.map((c, i) => `[${i + 1}] ${c.slice(0, 500)}`).join('\n\n');
  const response = await callClaude(system, content);

  try {
    const jsonStr = response.replace(/```json?\n?/g, '').replace(/```/g, '').trim();
    return JSON.parse(jsonStr);
  } catch {
    return [];
  }
}
