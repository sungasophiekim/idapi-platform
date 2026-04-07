// src/modules/law-collector/intl-collector.ts
// International law full-text collector
// Sources: US eCFR + Congress.gov, EU EUR-Lex, Singapore SSO
// Uses publicly available endpoints with regex-based HTML/XML parsing

import { prisma } from '@/lib/db';

// ─── Types ───

interface CollectedArticle {
  articleNum: string;
  articleTitle?: string;
  content: string;
  contentEn?: string;
  chapter?: string;
  sortOrder: number;
  tags: string[];
  appliesToBiz: string[];
}

interface CollectedLaw {
  jurisdiction: string;
  lawType: string;
  title: string;
  titleEn?: string;
  lawNumber: string;
  enactedDate?: string;
  effectiveDate?: string;
  regulator?: string;
  sourceUrl?: string;
  articles: CollectedArticle[];
}

interface FetchAndParseConfig {
  jurisdiction: string;
  title: string;
  titleEn?: string;
  lawNumber: string;
  regulator?: string;
  articlePattern: RegExp;
  articleNumPattern: RegExp;
  contentPattern: RegExp;
}

// ─── Constants ───

const FETCH_TIMEOUT = 30_000;
const CONGRESS_API_KEY = process.env.CONGRESS_API_KEY || '';
const USER_AGENT = 'idapi-platform/1.0 (law-collector)';

// ─── Helpers ───

/** Strip all HTML/XML tags and decode common entities */
export function stripHtml(html: string): string {
  return html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<\/div>/gi, '\n')
    .replace(/<\/li>/gi, '\n')
    .replace(/<\/tr>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(parseInt(code)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, code) => String.fromCharCode(parseInt(code, 16)))
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/** Extract articles from text using a regex pattern that captures article blocks */
export function extractArticles(
  text: string,
  pattern: RegExp,
): CollectedArticle[] {
  const articles: CollectedArticle[] = [];
  let match: RegExpExecArray | null;
  let sortOrder = 0;

  // Reset regex state
  const regex = new RegExp(pattern.source, pattern.flags.includes('g') ? pattern.flags : pattern.flags + 'g');

  while ((match = regex.exec(text)) !== null) {
    const articleNum = match[1]?.trim() || `Section ${sortOrder + 1}`;
    const articleTitle = match[2]?.trim() || undefined;
    const content = stripHtml(match[3] || match[2] || match[0]).trim();

    if (content.length > 0) {
      articles.push({
        articleNum,
        articleTitle,
        content,
        sortOrder,
        tags: extractTags(content),
        appliesToBiz: extractBizTypes(content),
      });
      sortOrder++;
    }
  }

  return articles;
}

/** Auto-extract keyword tags from article content */
function extractTags(content: string): string[] {
  const lower = content.toLowerCase();
  const tagMap: Record<string, string[]> = {
    'digital asset': ['digital-asset'],
    'virtual asset': ['virtual-asset'],
    'crypto': ['crypto'],
    'blockchain': ['blockchain'],
    'stablecoin': ['stablecoin'],
    'token': ['token'],
    'exchange': ['exchange'],
    'custody': ['custody'],
    'aml': ['aml'],
    'kyc': ['kyc'],
    'money laundering': ['aml'],
    'consumer protection': ['consumer-protection'],
    'disclosure': ['disclosure'],
    'license': ['licensing'],
    'licence': ['licensing'],
    'registration': ['registration'],
    'capital requirement': ['capital-requirements'],
    'risk management': ['risk-management'],
    'data protection': ['data-protection'],
    'privacy': ['privacy'],
    'sanction': ['sanctions'],
    'transfer': ['transfer'],
    'payment': ['payment'],
    'settlement': ['settlement'],
    'defi': ['defi'],
    'nft': ['nft'],
    'securities': ['securities'],
    'derivatives': ['derivatives'],
    'market abuse': ['market-abuse'],
    'insider': ['insider-trading'],
    'audit': ['audit'],
    'reporting': ['reporting'],
  };

  const tags = new Set<string>();
  for (const [keyword, tagValues] of Object.entries(tagMap)) {
    if (lower.includes(keyword)) {
      tagValues.forEach(t => tags.add(t));
    }
  }
  return Array.from(tags);
}

/** Auto-detect business types affected by article content */
function extractBizTypes(content: string): string[] {
  const lower = content.toLowerCase();
  const bizMap: Record<string, string[]> = {
    'exchange': ['VASP', 'exchange'],
    'trading platform': ['VASP', 'exchange'],
    'custod': ['custodian'],
    'wallet': ['wallet-provider'],
    'payment service': ['payment-provider'],
    'issuer': ['token-issuer'],
    'broker': ['broker-dealer'],
    'advisor': ['investment-advisor'],
    'fund': ['fund-manager'],
    'lending': ['lending-platform'],
    'staking': ['staking-provider'],
    'mining': ['mining-operator'],
    'defi protocol': ['defi-protocol'],
    'market maker': ['market-maker'],
    'transfer service': ['money-transmitter'],
  };

  const types = new Set<string>();
  for (const [keyword, bizTypes] of Object.entries(bizMap)) {
    if (lower.includes(keyword)) {
      bizTypes.forEach(t => types.add(t));
    }
  }
  return Array.from(types);
}

/** Fetch with timeout and UTF-8 handling */
async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeout = FETCH_TIMEOUT,
): Promise<string> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        'User-Agent': USER_AGENT,
        Accept: 'text/html, application/xml, application/json, text/plain',
        'Accept-Charset': 'utf-8',
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText} for ${url}`);
    }

    // Handle encoding — ensure UTF-8
    const buffer = await response.arrayBuffer();
    const decoder = new TextDecoder('utf-8');
    return decoder.decode(buffer);
  } finally {
    clearTimeout(timer);
  }
}

// ═══════════════════════════════════════════════════════════════
// US: eCFR — Electronic Code of Federal Regulations
// API docs: https://www.ecfr.gov/developers/documentation/api/v1
// Returns XML with <SECTION> elements
// ═══════════════════════════════════════════════════════════════

export async function fetchUSRegulation(
  title: number,
  part: number,
): Promise<CollectedLaw | null> {
  const sourceUrl = `https://www.ecfr.gov/current/title-${title}/part-${part}`;

  console.log(`[intl-collector] Fetching eCFR Title ${title} Part ${part}...`);

  try {
    // Get the latest issue date for this title (eCFR API requires a specific past date)
    const titlesRes = await fetchWithTimeout('https://www.ecfr.gov/api/versioner/v1/titles');
    const titlesData = JSON.parse(titlesRes);
    const titleInfo = titlesData.titles?.find((t: any) => t.number === title);
    const issueDate = titleInfo?.latest_issue_date || new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0];

    const url = `https://www.ecfr.gov/api/versioner/v1/full/${issueDate}/title-${title}.xml?part=${part}`;
    const xml = await fetchWithTimeout(url);

    // Extract part heading and decode HTML entities (&#x2014; = em-dash, etc.)
    const headMatch = xml.match(/<HEAD>([^<]+)<\/HEAD>/);
    const rawPartTitle = headMatch?.[1]?.trim() || `Title ${title} Part ${part}`;
    const partTitle = stripHtml(rawPartTitle).replace(/\s+/g, ' ').trim() || `Title ${title} Part ${part}`;

    // Extract sections — eCFR uses <DIV8 N="..." TYPE="SECTION"> elements
    const articles: CollectedArticle[] = [];
    const sectionRegex = /<DIV8\s+N="([^"]+)"\s+TYPE="SECTION"[^>]*>([\s\S]*?)<\/DIV8>/g;
    let match: RegExpExecArray | null;
    let sortOrder = 0;

    while ((match = sectionRegex.exec(xml)) !== null) {
      const sectionNum = match[1].trim();      // e.g. "1010.100"
      const inner = match[2];

      // Extract HEAD (section title)
      const headMatch = inner.match(/<HEAD>([\s\S]*?)<\/HEAD>/);
      const headText = headMatch ? stripHtml(headMatch[1]).trim() : '';
      // Title is usually like "§ 1010.100 General definitions."
      const titleMatch = headText.match(/§?\s*[\d.]+\s+(.+?)\.?$/);
      const sectionTitle = titleMatch ? titleMatch[1].trim() : headText;

      // Strip HEAD from content, then extract everything else
      const contentXml = inner.replace(/<HEAD>[\s\S]*?<\/HEAD>/, '');
      const content = stripHtml(contentXml).trim();
      if (!content) continue;

      articles.push({
        articleNum: `§ ${sectionNum}`,
        articleTitle: sectionTitle || undefined,
        content,
        contentEn: content, // Already in English
        sortOrder,
        tags: extractTags(content),
        appliesToBiz: extractBizTypes(content),
      });
      sortOrder++;
    }

    // If SECTION parsing yields nothing, try alternative structure
    if (articles.length === 0) {
      const altRegex = /<P[^>]*>([\s\S]*?)<\/P>/g;
      let pMatch: RegExpExecArray | null;
      let pIdx = 0;

      while ((pMatch = altRegex.exec(xml)) !== null) {
        const text = stripHtml(pMatch[1]).trim();
        if (text.length < 20) continue; // Skip trivially short paragraphs

        articles.push({
          articleNum: `Paragraph ${pIdx + 1}`,
          content: text,
          contentEn: text,
          sortOrder: pIdx,
          tags: extractTags(text),
          appliesToBiz: extractBizTypes(text),
        });
        pIdx++;
      }
    }

    if (articles.length === 0) {
      console.warn(`[intl-collector] No sections found in eCFR Title ${title} Part ${part}`);
      return null;
    }

    return {
      jurisdiction: 'US',
      lawType: 'regulation',
      title: partTitle,
      titleEn: partTitle,
      lawNumber: `CFR-T${title}-P${part}`,
      regulator: getUSRegulator(title),
      sourceUrl,
      articles,
    };
  } catch (err) {
    console.error(`[intl-collector] eCFR fetch failed for Title ${title} Part ${part}:`, err);
    return null;
  }
}

/** Map CFR title numbers to US regulators */
function getUSRegulator(title: number): string {
  const regulatorMap: Record<number, string> = {
    12: 'OCC / Federal Reserve / FDIC',
    17: 'SEC / CFTC',
    23: 'NYDFS',
    31: 'FinCEN / Treasury',
  };
  return regulatorMap[title] || `US Federal (Title ${title})`;
}

// ═══════════════════════════════════════════════════════════════
// US: Congress.gov — Bill full text
// API docs: https://api.congress.gov/
// Requires API key from https://api.congress.gov/sign-up/
// ═══════════════════════════════════════════════════════════════

export async function fetchUSBill(
  congress: number,
  type: string,
  number: number,
): Promise<CollectedLaw | null> {
  if (!CONGRESS_API_KEY) {
    console.warn('[intl-collector] CONGRESS_API_KEY not set — skipping Congress.gov fetch');
    return null;
  }

  const baseUrl = `https://api.congress.gov/v3/bill/${congress}/${type.toLowerCase()}/${number}`;
  const textUrl = `${baseUrl}/text?api_key=${CONGRESS_API_KEY}&format=json`;
  const billUrl = `${baseUrl}?api_key=${CONGRESS_API_KEY}&format=json`;

  console.log(`[intl-collector] Fetching US Bill ${congress}-${type}-${number}...`);

  try {
    // Fetch bill metadata
    const metaRaw = await fetchWithTimeout(billUrl);
    const meta = JSON.parse(metaRaw);
    const bill = meta.bill;

    if (!bill) {
      console.warn(`[intl-collector] Bill not found: ${congress}-${type}-${number}`);
      return null;
    }

    // Fetch text versions
    const textRaw = await fetchWithTimeout(textUrl);
    const textData = JSON.parse(textRaw);
    const textVersions = textData.textVersions || [];

    // Get the latest text version with an HTML format
    let fullTextHtml = '';
    for (const version of textVersions) {
      const htmlFormat = version.formats?.find(
        (f: any) => f.type === 'Formatted Text' || f.type === 'HTML',
      );
      if (htmlFormat?.url) {
        try {
          fullTextHtml = await fetchWithTimeout(htmlFormat.url);
          break;
        } catch {
          // Try next version
        }
      }
    }

    // Parse sections from HTML
    const articles: CollectedArticle[] = [];

    if (fullTextHtml) {
      // Congress bills use SEC./SECTION patterns
      const sectionRegex =
        /(?:SEC(?:TION)?\.?\s*(\d+[a-z]?)\.?\s*([^.<\n]{0,200}?)\.?\s*[\n<])([\s\S]*?)(?=(?:SEC(?:TION)?\.?\s*\d|$))/gi;
      let match: RegExpExecArray | null;
      let sortOrder = 0;

      while ((match = sectionRegex.exec(fullTextHtml)) !== null) {
        const sectionNum = `Section ${match[1]}`;
        const sectionTitle = stripHtml(match[2]).trim() || undefined;
        const content = stripHtml(match[3]).trim();
        if (!content) continue;

        articles.push({
          articleNum: sectionNum,
          articleTitle: sectionTitle,
          content,
          contentEn: content,
          sortOrder,
          tags: extractTags(content),
          appliesToBiz: extractBizTypes(content),
        });
        sortOrder++;
      }
    }

    // Fallback: create a single article from the bill summary
    if (articles.length === 0 && bill.summary?.text) {
      articles.push({
        articleNum: 'Summary',
        articleTitle: 'Bill Summary',
        content: stripHtml(bill.summary.text),
        contentEn: stripHtml(bill.summary.text),
        sortOrder: 0,
        tags: extractTags(bill.title || ''),
        appliesToBiz: extractBizTypes(bill.title || ''),
      });
    }

    const billTypeUpper = type.toUpperCase();
    const introducedDate = bill.introducedDate || undefined;

    return {
      jurisdiction: 'US',
      lawType: 'bill',
      title: bill.title || `${billTypeUpper} ${number}`,
      titleEn: bill.title || `${billTypeUpper} ${number}`,
      lawNumber: `${congress}-${billTypeUpper}-${number}`,
      enactedDate: bill.latestAction?.actionDate,
      effectiveDate: introducedDate,
      regulator: 'US Congress',
      sourceUrl: `https://www.congress.gov/bill/${congress}th-congress/${type.toLowerCase()}-bill/${number}`,
      articles,
    };
  } catch (err) {
    console.error(`[intl-collector] Congress.gov fetch failed:`, err);
    return null;
  }
}

// ═══════════════════════════════════════════════════════════════
// EU: EUR-Lex — European Union regulations & directives
// Uses CELEX number to identify documents
// Content is in HTML divs with class="eli-container"
// ═══════════════════════════════════════════════════════════════

export async function fetchEURegulation(
  celexNumber: string,
): Promise<CollectedLaw | null> {
  // EUR-Lex HTML endpoint
  const url = `https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:${celexNumber}`;
  const sourceUrl = `https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:${celexNumber}`;

  console.log(`[intl-collector] Fetching EUR-Lex CELEX ${celexNumber}...`);

  try {
    const html = await fetchWithTimeout(url);

    // Extract document title from oj-doc-ti elements (EUR-Lex semantic class)
    // The first 2-3 oj-doc-ti elements typically contain: "REGULATION...", "of DATE", "on TOPIC..."
    const ojDocTitles: string[] = [];
    const ojRegex = /class="oj-doc-ti"[^>]*>([^<]+)</g;
    let ojMatch: RegExpExecArray | null;
    while ((ojMatch = ojRegex.exec(html)) !== null) {
      const text = stripHtml(ojMatch[1]).trim();
      if (text && !text.startsWith('ANNEX') && !text.includes('Text with EEA')) {
        ojDocTitles.push(text);
      }
      if (ojDocTitles.length >= 3) break;
    }

    // Try oj-doc-ti-art for the regulation title (e.g. "REGULATION (EU) 2023/1114")
    const docTiArtMatch = html.match(/class="oj-doc-ti-art"[^>]*>([^<]+)</);
    const headerTitle = docTiArtMatch ? stripHtml(docTiArtMatch[1]).trim() : '';

    // Build full title
    let title = '';
    if (headerTitle) {
      title = headerTitle;
      // Add the "on TOPIC" part (usually the 2nd oj-doc-ti)
      const topicPart = ojDocTitles.find(t => t.startsWith('on '));
      if (topicPart) title += ' ' + topicPart;
    } else if (ojDocTitles.length > 0) {
      title = ojDocTitles.join(' ');
    } else {
      // Last resort: <title> tag
      const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
      title = titleMatch ? stripHtml(titleMatch[1]).trim() : `EU Document ${celexNumber}`;
    }
    title = title.replace(/\s+/g, ' ').trim() || `EU Document ${celexNumber}`;

    // Parse articles — EUR-Lex uses oj-ti-art class for article markers
    // Each "Article N" is in <p class="oj-ti-art">Article N</p>
    // followed by a title in <p class="oj-sti-art">Title</p>
    // followed by paragraphs <p class="oj-normal">content</p>
    const articles: CollectedArticle[] = [];

    // Find all oj-ti-art positions
    const artMarkers: { num: string; pos: number }[] = [];
    const artRegex = /class="oj-ti-art"[^>]*>([^<]*Article\s+\d+[a-z]?)<\/p>/gi;
    let artMatch: RegExpExecArray | null;
    while ((artMatch = artRegex.exec(html)) !== null) {
      const numMatch = artMatch[1].match(/Article\s+(\d+[a-z]?)/i);
      if (numMatch) {
        artMarkers.push({ num: numMatch[1], pos: artMatch.index });
      }
    }
    console.log(`[intl-collector] EUR-Lex found ${artMarkers.length} article markers for ${celexNumber}`);

    // Extract content between consecutive markers
    for (let i = 0; i < artMarkers.length; i++) {
      const start = artMarkers[i].pos;
      const end = i + 1 < artMarkers.length ? artMarkers[i + 1].pos : html.length;
      const block = html.slice(start, end);

      // Article title from first oj-sti-art
      const stiMatch = block.match(/class="oj-sti-art"[^>]*>([^<]+)<\/p>/i);
      const articleTitle = stiMatch ? stripHtml(stiMatch[1]).trim() : undefined;

      // Content from all oj-normal paragraphs
      const normalRegex = /class="oj-normal"[^>]*>([\s\S]*?)<\/p>/gi;
      const paragraphs: string[] = [];
      let normMatch: RegExpExecArray | null;
      while ((normMatch = normalRegex.exec(block)) !== null) {
        const text = stripHtml(normMatch[1]).trim();
        if (text) paragraphs.push(text);
      }

      const content = paragraphs.join('\n\n').trim();
      if (!content || content.length < 5) continue;

      articles.push({
        articleNum: `Article ${artMarkers[i].num}`,
        articleTitle,
        content,
        contentEn: content,
        sortOrder: i,
        tags: extractTags(content),
        appliesToBiz: extractBizTypes(content),
      });
    }

    // Define contentArea for fallback (for old fallback code below)
    const contentArea = html;

    // Fallback: try to extract Recitals and main body as chunks
    if (articles.length === 0) {
      const paragraphs = contentArea.split(/<\/p>/i).filter(Boolean);
      let pIdx = 0;

      for (const p of paragraphs) {
        const text = stripHtml(p).trim();
        if (text.length < 30) continue;

        articles.push({
          articleNum: `Paragraph ${pIdx + 1}`,
          content: text,
          contentEn: text,
          sortOrder: pIdx,
          tags: extractTags(text),
          appliesToBiz: extractBizTypes(text),
        });
        pIdx++;

        // Safety limit
        if (pIdx >= 500) break;
      }
    }

    // Determine law type from CELEX number
    // CELEX format: [sector][year][type][number]
    // Sector 3 = legislation, type R = regulation, L = directive, D = decision
    const lawType = celexNumber.includes('R')
      ? 'regulation'
      : celexNumber.includes('L')
        ? 'directive'
        : celexNumber.includes('D')
          ? 'decision'
          : 'regulation';

    // Extract regulator from CELEX (rough heuristic)
    const regulator = 'European Commission / European Parliament';

    return {
      jurisdiction: 'EU',
      lawType,
      title,
      titleEn: title,
      lawNumber: `CELEX-${celexNumber}`,
      regulator,
      sourceUrl,
      articles,
    };
  } catch (err) {
    console.error(`[intl-collector] EUR-Lex fetch failed for CELEX ${celexNumber}:`, err);
    return null;
  }
}

// ═══════════════════════════════════════════════════════════════
// Singapore: SSO — Singapore Statutes Online
// URL: https://sso.agc.gov.sg/Act/{actId}
// Content is standard HTML with section elements
// ═══════════════════════════════════════════════════════════════

export async function fetchSingaporeLaw(
  actId: string,
): Promise<CollectedLaw | null> {
  const url = `https://sso.agc.gov.sg/Act/${actId}`;

  console.log(`[intl-collector] Fetching Singapore SSO Act ${actId}...`);

  try {
    const html = await fetchWithTimeout(url);

    // Extract title
    const titleMatch = html.match(/<h1[^>]*class="[^"]*title[^"]*"[^>]*>([\s\S]*?)<\/h1>/i)
      || html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
    const title = titleMatch
      ? stripHtml(titleMatch[1]).replace(/\s*-\s*Singapore Statutes Online.*$/i, '').trim()
      : `Singapore Act ${actId}`;

    // Parse sections — SSO uses "Section N" / numbered sections
    const articles: CollectedArticle[] = [];

    // SSO HTML wraps sections in elements with data-sec attributes or section numbering
    const sectionRegex =
      /(?:<[^>]*(?:data-sec|class="[^"]*(?:prov|section)[^"]*")[^>]*>[\s\S]*?)?\bSection\s+(\d+[A-Z]?)\b\.?\s*(?:[-—]\s*)?([^<\n]{0,200}?)\s*(?:<[^>]*>)?\s*([\s\S]*?)(?=\bSection\s+\d|<div[^>]*class="[^"]*(?:endDoc|footer)[^"]*"|$)/gi;

    let match: RegExpExecArray | null;
    let sortOrder = 0;

    while ((match = sectionRegex.exec(html)) !== null) {
      const sectionNum = `Section ${match[1]}`;
      const rawTitle = match[2]?.trim();
      const sectionTitle = rawTitle && rawTitle.length > 2 ? stripHtml(rawTitle) : undefined;
      const content = stripHtml(match[3]).trim();
      if (!content || content.length < 10) continue;

      articles.push({
        articleNum: sectionNum,
        articleTitle: sectionTitle,
        content,
        contentEn: content,
        sortOrder,
        tags: extractTags(content),
        appliesToBiz: extractBizTypes(content),
      });
      sortOrder++;

      if (sortOrder >= 500) break;
    }

    if (articles.length === 0) {
      console.warn(`[intl-collector] No sections found in SSO Act ${actId}`);
      return null;
    }

    return {
      jurisdiction: 'SG',
      lawType: 'law',
      title,
      titleEn: title,
      lawNumber: `SG-ACT-${actId}`,
      regulator: 'MAS / Singapore Parliament',
      sourceUrl: url,
      articles,
    };
  } catch (err) {
    console.error(`[intl-collector] SSO fetch failed for Act ${actId}:`, err);
    return null;
  }
}

// ═══════════════════════════════════════════════════════════════
// Generic HTML/Text Scraper
// For sources without structured APIs
// ═══════════════════════════════════════════════════════════════

export async function fetchAndParseLawFromUrl(
  url: string,
  config: FetchAndParseConfig,
): Promise<CollectedLaw | null> {
  console.log(`[intl-collector] Fetching law from ${url}...`);

  try {
    const html = await fetchWithTimeout(url);
    const articles = extractArticles(html, config.articlePattern);

    if (articles.length === 0) {
      console.warn(`[intl-collector] No articles extracted from ${url}`);
      return null;
    }

    return {
      jurisdiction: config.jurisdiction,
      lawType: 'regulation',
      title: config.title,
      titleEn: config.titleEn,
      lawNumber: config.lawNumber,
      regulator: config.regulator,
      sourceUrl: url,
      articles,
    };
  } catch (err) {
    console.error(`[intl-collector] Generic fetch failed for ${url}:`, err);
    return null;
  }
}

// ═══════════════════════════════════════════════════════════════
// Save to Database
// Uses prisma.lawArchive upsert with jurisdiction + lawNumber
// Deletes existing articles before re-creating
// ═══════════════════════════════════════════════════════════════

export async function saveLawToArchive(
  law: CollectedLaw,
): Promise<{ success: boolean; articleCount: number }> {
  console.log(`[intl-collector] Saving ${law.jurisdiction} law "${law.title}" (${law.articles.length} articles)...`);

  try {
    const result = await prisma.$transaction(async (tx) => {
      // Upsert the law record
      const archived = await tx.lawArchive.upsert({
        where: {
          jurisdiction_lawNumber: {
            jurisdiction: law.jurisdiction as any,
            lawNumber: law.lawNumber,
          },
        },
        update: {
          lawType: law.lawType,
          title: law.title,
          titleEn: law.titleEn,
          enactedDate: law.enactedDate ? new Date(law.enactedDate) : undefined,
          effectiveDate: law.effectiveDate ? new Date(law.effectiveDate) : undefined,
          regulator: law.regulator,
          sourceUrl: law.sourceUrl,
          fullText: law.articles.map(a => `${a.articleNum}\n${a.content}`).join('\n\n---\n\n'),
          fullTextEn: law.articles.map(a => `${a.articleNum}\n${a.contentEn || a.content}`).join('\n\n---\n\n'),
          totalArticles: law.articles.length,
          status: 'enacted',
          updatedAt: new Date(),
        },
        create: {
          jurisdiction: law.jurisdiction as any,
          lawType: law.lawType,
          title: law.title,
          titleEn: law.titleEn,
          lawNumber: law.lawNumber,
          enactedDate: law.enactedDate ? new Date(law.enactedDate) : undefined,
          effectiveDate: law.effectiveDate ? new Date(law.effectiveDate) : undefined,
          regulator: law.regulator,
          sourceUrl: law.sourceUrl,
          fullText: law.articles.map(a => `${a.articleNum}\n${a.content}`).join('\n\n---\n\n'),
          fullTextEn: law.articles.map(a => `${a.articleNum}\n${a.contentEn || a.content}`).join('\n\n---\n\n'),
          totalArticles: law.articles.length,
          status: 'enacted',
        },
      });

      // Delete existing articles for this law, then recreate
      await tx.lawArticle.deleteMany({
        where: { lawId: archived.id },
      });

      // Batch create articles
      if (law.articles.length > 0) {
        await tx.lawArticle.createMany({
          data: law.articles.map((a) => ({
            lawId: archived.id,
            articleNum: a.articleNum,
            articleTitle: a.articleTitle,
            content: a.content,
            contentEn: a.contentEn,
            chapter: a.chapter,
            sortOrder: a.sortOrder,
            tags: a.tags,
            appliesToBiz: a.appliesToBiz,
          })),
        });
      }

      return { articleCount: law.articles.length };
    });

    console.log(`[intl-collector] Saved ${result.articleCount} articles for "${law.title}"`);
    return { success: true, articleCount: result.articleCount };
  } catch (err) {
    console.error(`[intl-collector] DB save failed for "${law.title}":`, err);
    return { success: false, articleCount: 0 };
  }
}

// ═══════════════════════════════════════════════════════════════
// Batch collection — commonly tracked international laws
// ═══════════════════════════════════════════════════════════════

/** Collect well-known crypto/digital asset regulations */
export async function collectKnownInternationalLaws(): Promise<{
  collected: number;
  failed: number;
  details: string[];
}> {
  const details: string[] = [];
  let collected = 0;
  let failed = 0;

  const tasks: Array<{ name: string; fn: () => Promise<CollectedLaw | null> }> = [
    // ═══ US — FinCEN BSA Regulations (Title 31) ═══
    { name: 'US FinCEN General (31 CFR 1010)', fn: () => fetchUSRegulation(31, 1010) },
    { name: 'US FinCEN Banks (31 CFR 1020)', fn: () => fetchUSRegulation(31, 1020) },
    { name: 'US FinCEN MSB (31 CFR 1022)', fn: () => fetchUSRegulation(31, 1022) },
    { name: 'US FinCEN Brokers (31 CFR 1023)', fn: () => fetchUSRegulation(31, 1023) },
    { name: 'US FinCEN Mutual Funds (31 CFR 1024)', fn: () => fetchUSRegulation(31, 1024) },
    { name: 'US FinCEN Insurance (31 CFR 1025)', fn: () => fetchUSRegulation(31, 1025) },
    { name: 'US FinCEN Futures (31 CFR 1026)', fn: () => fetchUSRegulation(31, 1026) },

    // ═══ US — SEC Securities Rules (Title 17 Chapter II) ═══
    { name: 'US SEC Securities Act Rules (17 CFR 230)', fn: () => fetchUSRegulation(17, 230) },
    { name: 'US SEC Exchange Act Rules (17 CFR 240)', fn: () => fetchUSRegulation(17, 240) },
    { name: 'US SEC Reg ATS / NMS (17 CFR 242)', fn: () => fetchUSRegulation(17, 242) },
    { name: 'US SEC Investment Advisers (17 CFR 275)', fn: () => fetchUSRegulation(17, 275) },
    { name: 'US SEC Investment Company (17 CFR 270)', fn: () => fetchUSRegulation(17, 270) },

    // ═══ US — CFTC Commodity Rules (Title 17 Chapter I) ═══
    { name: 'US CFTC General (17 CFR 1)', fn: () => fetchUSRegulation(17, 1) },
    { name: 'US CFTC Foreign Futures (17 CFR 30)', fn: () => fetchUSRegulation(17, 30) },
    { name: 'US CFTC DCO Clearing (17 CFR 39)', fn: () => fetchUSRegulation(17, 39) },

    // ═══ US — Banking & Consumer Protection ═══
    { name: 'US CFPB Reg E (12 CFR 1005)', fn: () => fetchUSRegulation(12, 1005) },

    // ═══ EU — Crypto-Specific Regulations ═══
    { name: 'EU MiCA (2023/1114)', fn: () => fetchEURegulation('32023R1114') },
    { name: 'EU TFR Travel Rule (2023/1113)', fn: () => fetchEURegulation('32023R1113') },
    { name: 'EU DORA (2022/2554)', fn: () => fetchEURegulation('32022R2554') },
    { name: 'EU DLT Pilot Regime (2022/858)', fn: () => fetchEURegulation('32022R0858') },

    // ═══ EU — AML / KYC ═══
    { name: 'EU AMLR 2024 (2024/1624)', fn: () => fetchEURegulation('32024R1624') },
    { name: 'EU AMLD 6 (2024/1640)', fn: () => fetchEURegulation('32024L1640') },
    { name: 'EU AMLD 5 (2018/843)', fn: () => fetchEURegulation('32018L0843') },
    { name: 'EU AMLD 4 (2015/849)', fn: () => fetchEURegulation('32015L0849') },

    // ═══ EU — Financial Services Framework ═══
    { name: 'EU PSD2 (2015/2366)', fn: () => fetchEURegulation('32015L2366') },
    { name: 'EU EMI Directive (2009/110)', fn: () => fetchEURegulation('32009L0110') },
    { name: 'EU MiFID II (2014/65)', fn: () => fetchEURegulation('32014L0065') },
    { name: 'EU CRR Capital (575/2013)', fn: () => fetchEURegulation('32013R0575') },
    { name: 'EU GDPR (2016/679)', fn: () => fetchEURegulation('32016R0679') },
    { name: 'EU Prospectus (2017/1129)', fn: () => fetchEURegulation('32017R1129') },

    // ═══ Singapore — Payment Services Act ═══
    { name: 'SG Payment Services Act', fn: () => fetchSingaporeLaw('PSA2019') },
  ];

  for (const task of tasks) {
    try {
      // Small delay to avoid rate limiting
      await new Promise(r => setTimeout(r, 500));
      const law = await task.fn();
      if (law && law.articles.length > 0) {
        const result = await saveLawToArchive(law);
        if (result.success) {
          details.push(`[OK] ${task.name}: ${result.articleCount} articles`);
          collected++;
        } else {
          details.push(`[SAVE_FAIL] ${task.name}`);
          failed++;
        }
      } else {
        details.push(`[EMPTY] ${task.name}: no articles extracted`);
        failed++;
      }
    } catch (err) {
      details.push(`[ERROR] ${task.name}: ${err instanceof Error ? err.message : String(err)}`);
      failed++;
    }
  }

  console.log(`[intl-collector] Batch complete: ${collected} collected, ${failed} failed`);
  return { collected, failed, details };
}
