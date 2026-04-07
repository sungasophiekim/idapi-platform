import { prisma } from '@/lib/db';

interface HkCollectedLaw {
  title: string;
  titleEn: string;
  capNumber: string;
  articles: {
    articleNum: string;
    articleTitle?: string;
    content: string;
    chapter?: string;
    sortOrder: number;
  }[];
}

export const HONG_KONG_LAW_TARGETS = [
  {
    capNumber: '615',
    titleEn: 'Anti-Money Laundering and Counter-Terrorist Financing Ordinance',
    shortName: 'AMLO',
    regulator: 'HKMA / SFC',
  },
  {
    capNumber: '571',
    titleEn: 'Securities and Futures Ordinance',
    shortName: 'SFO',
    regulator: 'SFC',
  },
  {
    capNumber: '155',
    titleEn: 'Banking Ordinance',
    shortName: 'BO',
    regulator: 'HKMA',
  },
  {
    capNumber: '622',
    titleEn: 'Companies Ordinance',
    shortName: 'CO',
    regulator: 'Companies Registry',
  },
  {
    capNumber: '486',
    titleEn: 'Personal Data (Privacy) Ordinance',
    shortName: 'PDPO',
    regulator: 'PCPD',
  },
];

const USER_AGENT =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

const HK_URL_PATTERNS = (capNumber: string) => [
  `https://www.hklii.hk/en/legis/ord/${capNumber}/`,
  `https://www.hklii.hk/cgi-bin/sinodisp/eng/hk/legis/ord/${capNumber}/`,
  `https://oelawhk.lib.hku.hk/archive/files/${capNumber}.pdf`,
];

function stripHtml(input: string): string {
  return input
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(p|div|h[1-6]|li)>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function parseHkHtml(html: string): HkCollectedLaw['articles'] {
  const articles: HkCollectedLaw['articles'] = [];

  // Try to detect chapter / part markers via h2
  let currentChapter: string | undefined;

  // Strategy 1: split by section headings (<h3> with "Section N")
  const headingRegex =
    /<h[23][^>]*>([\s\S]*?)<\/h[23]>|<div[^>]*class="[^"]*section[^"]*"[^>]*>([\s\S]*?)(?=<div[^>]*class="[^"]*section[^"]*"|$)/gi;

  // Simpler approach: tokenize by section pattern in stripped text
  const text = stripHtml(html);

  // Find chapter / part lines
  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);

  let buffer: string[] = [];
  let currentNum: string | null = null;
  let currentTitle: string | undefined;
  let sortOrder = 0;

  const sectionRe = /^(?:Section\s+(\d+[A-Z]*)\.?|(\d+[A-Z]*)\.\s+)(.*)$/i;
  const partRe = /^(Part\s+[IVXLCDM\d]+|Chapter\s+\d+)\b(.*)$/i;

  const flush = () => {
    if (currentNum) {
      const content = buffer.join('\n').trim();
      if (content.length > 0) {
        articles.push({
          articleNum: `Section ${currentNum}`,
          articleTitle: currentTitle,
          content,
          chapter: currentChapter,
          sortOrder: sortOrder++,
        });
      }
    }
    buffer = [];
    currentNum = null;
    currentTitle = undefined;
  };

  for (const line of lines) {
    const partMatch = line.match(partRe);
    if (partMatch) {
      flush();
      currentChapter = `${partMatch[1]}${partMatch[2] ? ' -' + partMatch[2] : ''}`.trim();
      continue;
    }

    const secMatch = line.match(sectionRe);
    if (secMatch) {
      flush();
      currentNum = secMatch[1] || secMatch[2];
      currentTitle = (secMatch[3] || '').trim() || undefined;
      continue;
    }

    if (currentNum) {
      buffer.push(line);
    }
  }
  flush();

  return articles;
}

async function tryFetch(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': USER_AGENT,
        Accept: 'text/html,application/xhtml+xml',
      },
    });
    if (!res.ok) return null;
    const ct = res.headers.get('content-type') || '';
    if (ct.includes('pdf')) return null; // skip PDF fallback for HTML parser
    return await res.text();
  } catch {
    return null;
  }
}

export async function fetchHongKongOrdinance(
  capNumber: string,
  titleEn: string,
): Promise<HkCollectedLaw | null> {
  const urls = HK_URL_PATTERNS(capNumber);

  for (const url of urls) {
    console.log(`[hk-collector] Trying ${url}`);
    const html = await tryFetch(url);
    if (!html) continue;

    const articles = parseHkHtml(html);
    if (articles.length === 0) {
      console.log(`[hk-collector] No articles parsed from ${url}`);
      continue;
    }

    console.log(`[hk-collector] Parsed ${articles.length} sections from ${url}`);
    return {
      title: `${titleEn} (Cap. ${capNumber})`,
      titleEn,
      capNumber,
      articles,
    };
  }

  console.warn(`[hk-collector] Failed to fetch Cap. ${capNumber}`);
  return null;
}

export async function saveHongKongLawToArchive(
  law: HkCollectedLaw,
  options?: { shortName?: string; regulator?: string },
): Promise<void> {
  const lawNumber = `HK-HKLII-${law.capNumber}`;

  const existing = await prisma.lawArchive.findFirst({ where: { lawNumber } });

  if (existing) {
    await prisma.lawArticle.deleteMany({ where: { lawId: existing.id } });
    await prisma.lawArchive.update({
      where: { id: existing.id },
      data: {
        title: law.title,
        titleEn: law.titleEn,
        shortName: options?.shortName,
        regulator: options?.regulator,
        jurisdiction: 'HK',
        articles: {
          create: law.articles.map((a) => ({
            articleNum: a.articleNum,
            articleTitle: a.articleTitle,
            content: a.content,
            chapter: a.chapter,
            sortOrder: a.sortOrder,
          })),
        },
      },
    });
    console.log(`[hk-collector] Updated ${lawNumber} with ${law.articles.length} articles`);
  } else {
    await prisma.lawArchive.create({
      data: {
        lawNumber,
        lawType: 'ordinance',
        title: law.title,
        titleEn: law.titleEn,
        shortName: options?.shortName,
        regulator: options?.regulator,
        jurisdiction: 'HK',
        status: 'enacted',
        totalArticles: law.articles.length,
        articles: {
          create: law.articles.map((a) => ({
            articleNum: a.articleNum,
            articleTitle: a.articleTitle,
            content: a.content,
            chapter: a.chapter,
            sortOrder: a.sortOrder,
          })),
        },
      },
    });
    console.log(`[hk-collector] Created ${lawNumber} with ${law.articles.length} articles`);
  }
}

export async function collectHongKongLaw(
  capNumber: string,
  titleEn: string,
  options?: { shortName?: string; regulator?: string },
): Promise<{ success: boolean; title: string; articleCount: number }> {
  const title = `${titleEn} (Cap. ${capNumber})`;
  try {
    const law = await fetchHongKongOrdinance(capNumber, titleEn);
    if (!law) {
      return { success: false, title, articleCount: 0 };
    }
    await saveHongKongLawToArchive(law, options);
    return { success: true, title: law.title, articleCount: law.articles.length };
  } catch (err) {
    console.error(`[hk-collector] Error collecting Cap. ${capNumber}:`, err);
    return { success: false, title, articleCount: 0 };
  }
}
