// src/modules/trend-engine/extractor.ts
// Keyword extraction — batch processes articles through Haiku 4.5

import type { CollectedArticle } from './collector';

export interface ExtractedKeywords {
  sourceId: string;
  title: string;
  keywords: string[];       // Policy-relevant keywords (e.g. "stablecoin regulation")
  keywordsEn: string[];     // English versions
  jurisdiction: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  relevanceScore: number;   // 0-10: how relevant to digital asset policy
  sourceWeight: number;
  pubDate: Date;
}

const CLAUDE_API = 'https://api.anthropic.com/v1/messages';

// ─── Batch keyword extraction ───
// Groups articles into chunks and processes each chunk with one API call
// This is much cheaper than calling per-article

export async function extractKeywords(articles: CollectedArticle[]): Promise<ExtractedKeywords[]> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY not configured');

  if (articles.length === 0) return [];

  // Process in chunks of 20 articles per API call
  const CHUNK_SIZE = 20;
  const results: ExtractedKeywords[] = [];

  for (let i = 0; i < articles.length; i += CHUNK_SIZE) {
    const chunk = articles.slice(i, i + CHUNK_SIZE);
    const chunkResults = await processChunk(apiKey, chunk);
    results.push(...chunkResults);
  }

  return results;
}

async function processChunk(apiKey: string, articles: CollectedArticle[]): Promise<ExtractedKeywords[]> {
  // Build the article list for the prompt
  const articleList = articles.map((a, i) =>
    `[${i}] (${a.jurisdiction}) ${a.title}\n${a.description.slice(0, 300)}`
  ).join('\n\n');

  const systemPrompt = `You are IDAPI's keyword extraction engine for digital asset policy monitoring.

Given a batch of news articles/press releases, extract policy-relevant keywords from EACH article.

Focus on:
- Specific regulation names (MiCA, GENIUS Act, 가상자산이용자보호법)
- Policy topics (stablecoin regulation, RWA tokenization, CBDC, travel rule)
- Regulatory actions (licensing, enforcement, amendment, consultation)
- Market structure topics (custody, exchange, DeFi, NFT)

Skip generic words (blockchain, crypto, digital asset) unless paired with a specific policy context.

Respond with a JSON array where each element matches the input article by index:
[
  {
    "index": 0,
    "keywords": ["keyword1 in original language", "keyword2"],
    "keywordsEn": ["english keyword1", "english keyword2"],
    "sentiment": "positive" | "negative" | "neutral",
    "relevance": <0-10 how relevant to digital asset POLICY>
  },
  ...
]

If an article is NOT about digital asset/crypto/blockchain policy at all, set relevance to 0.
Return ONLY the JSON array. No markdown, no explanation.`;

  try {
    const res = await fetch(CLAUDE_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',   // Cheapest model, fast
        max_tokens: 2048,
        system: systemPrompt,
        messages: [{ role: 'user', content: `Extract keywords from these ${articles.length} articles:\n\n${articleList}` }],
      }),
    });

    if (!res.ok) {
      console.error(`[Extractor] API error: ${res.status}`);
      return articles.map(a => fallbackExtraction(a));
    }

    const data = await res.json();
    const text = data.content[0]?.text || '[]';
    const jsonStr = text.replace(/```json?\n?/g, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(jsonStr) as Array<{
      index: number;
      keywords: string[];
      keywordsEn: string[];
      sentiment: string;
      relevance: number;
    }>;

    return articles.map((article, i) => {
      const extracted = parsed.find(p => p.index === i);
      return {
        sourceId: article.sourceId,
        title: article.title,
        keywords: extracted?.keywords || [],
        keywordsEn: extracted?.keywordsEn || [],
        jurisdiction: article.jurisdiction,
        sentiment: (extracted?.sentiment as any) || 'neutral',
        relevanceScore: extracted?.relevance ?? 5,
        sourceWeight: article.sourceWeight,
        pubDate: article.pubDate,
      };
    });
  } catch (err: any) {
    console.error(`[Extractor] Error: ${err.message}`);
    return articles.map(a => fallbackExtraction(a));
  }
}

// Fallback: simple regex-based extraction when API fails
function fallbackExtraction(article: CollectedArticle): ExtractedKeywords {
  const text = `${article.title} ${article.description}`.toLowerCase();
  const keywords: string[] = [];

  const POLICY_TERMS: Record<string, string> = {
    'stablecoin': 'stablecoin',
    '스테이블코인': 'stablecoin',
    'mica': 'MiCA',
    'cbdc': 'CBDC',
    'travel rule': 'travel rule',
    '트래블룰': 'travel rule',
    'rwa': 'RWA tokenization',
    '토큰증권': 'security token',
    'sto': 'STO',
    'defi': 'DeFi regulation',
    'nft': 'NFT',
    'aml': 'AML/KYC',
    '자금세탁': 'AML',
    '과세': 'taxation',
    'taxation': 'taxation',
    'custody': 'custody',
    '수탁': 'custody',
    'licensing': 'licensing',
    '인가': 'licensing',
    'etf': 'crypto ETF',
    'enforcement': 'enforcement',
  };

  for (const [term, keyword] of Object.entries(POLICY_TERMS)) {
    if (text.includes(term)) keywords.push(keyword);
  }

  return {
    sourceId: article.sourceId,
    title: article.title,
    keywords: [...new Set(keywords)],
    keywordsEn: [...new Set(keywords)],
    jurisdiction: article.jurisdiction,
    sentiment: 'neutral',
    relevanceScore: keywords.length > 0 ? 5 : 1,
    sourceWeight: article.sourceWeight,
    pubDate: article.pubDate,
  };
}
