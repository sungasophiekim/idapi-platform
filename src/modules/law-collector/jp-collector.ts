import { prisma } from '@/lib/db';

interface JpCollectedLaw {
  title: string;
  titleEn?: string;
  lawId: string;
  articles: {
    articleNum: string;
    articleTitle?: string;
    content: string;
    chapter?: string;
    sortOrder: number;
  }[];
}

export const JAPANESE_LAW_TARGETS: { name: string; nameEn: string; lawId: string; shortName?: string; regulator?: string }[] = [
  { name: '金融商品取引法', nameEn: 'Financial Instruments and Exchange Act', lawId: '323AC0000000025', shortName: 'FIEA', regulator: 'FSA Japan' },
  { name: '資金決済に関する法律', nameEn: 'Payment Services Act', lawId: '421AC0000000059', shortName: 'PSA', regulator: 'FSA Japan' },
  { name: '犯罪による収益の移転防止に関する法律', nameEn: 'Act on Prevention of Transfer of Criminal Proceeds', lawId: '419AC0000000022', shortName: 'APTCP', regulator: 'NPA / FSA Japan' },
  { name: '電子記録債権法', nameEn: 'Electronically Recorded Monetary Claims Act', lawId: '419AC0000000102', shortName: 'ERMCA', regulator: 'FSA Japan' },
  { name: '銀行法', nameEn: 'Banking Act', lawId: '356AC0000000059', shortName: 'Banking Act', regulator: 'FSA Japan' },
  { name: '信託業法', nameEn: 'Trust Business Act', lawId: '416AC0000000154', shortName: 'Trust Business Act', regulator: 'FSA Japan' },
];

const EGOV_BASE = 'https://elaws.e-gov.go.jp/api/1/lawdata';

function decodeXmlEntities(s: string): string {
  return s
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(parseInt(n, 10)))
    .replace(/&amp;/g, '&');
}

function stripTags(s: string): string {
  return decodeXmlEntities(s.replace(/<[^>]+>/g, '')).replace(/\s+/g, ' ').trim();
}

function parseJpArticlesFromXml(xml: string): JpCollectedLaw['articles'] {
  const articles: JpCollectedLaw['articles'] = [];
  let sortOrder = 0;

  // Build positional map of chapter/section titles so we can attribute each article
  type Marker = { pos: number; type: 'chapter' | 'section'; title: string };
  const markers: Marker[] = [];

  const chapterRe = /<Chapter\b[^>]*>[\s\S]*?<ChapterTitle>([\s\S]*?)<\/ChapterTitle>/g;
  let m: RegExpExecArray | null;
  while ((m = chapterRe.exec(xml)) !== null) {
    markers.push({ pos: m.index, type: 'chapter', title: stripTags(m[1]) });
  }
  const sectionRe = /<Section\b[^>]*>[\s\S]*?<SectionTitle>([\s\S]*?)<\/SectionTitle>/g;
  while ((m = sectionRe.exec(xml)) !== null) {
    markers.push({ pos: m.index, type: 'section', title: stripTags(m[1]) });
  }
  markers.sort((a, b) => a.pos - b.pos);

  function chapterContextAt(pos: number): string | undefined {
    let chapter: string | undefined;
    let section: string | undefined;
    for (const mk of markers) {
      if (mk.pos > pos) break;
      if (mk.type === 'chapter') { chapter = mk.title; section = undefined; }
      else if (mk.type === 'section') { section = mk.title; }
    }
    if (chapter && section) return `${chapter} / ${section}`;
    return chapter || section;
  }

  const articleRe = /<Article\b([^>]*)>([\s\S]*?)<\/Article>/g;
  while ((m = articleRe.exec(xml)) !== null) {
    const attrs = m[1];
    const inner = m[2];
    const numMatch = /Num="([^"]+)"/.exec(attrs);
    const articleNum = numMatch ? numMatch[1] : String(sortOrder + 1);

    const titleMatch = /<ArticleTitle>([\s\S]*?)<\/ArticleTitle>/.exec(inner);
    const captionMatch = /<ArticleCaption>([\s\S]*?)<\/ArticleCaption>/.exec(inner);
    const articleTitleParts: string[] = [];
    if (titleMatch) articleTitleParts.push(stripTags(titleMatch[1]));
    if (captionMatch) articleTitleParts.push(stripTags(captionMatch[1]));
    const articleTitle = articleTitleParts.join(' ').trim() || undefined;

    const sentences: string[] = [];
    const sentRe = /<Sentence\b[^>]*>([\s\S]*?)<\/Sentence>/g;
    let sm: RegExpExecArray | null;
    while ((sm = sentRe.exec(inner)) !== null) {
      const t = stripTags(sm[1]);
      if (t) sentences.push(t);
    }
    const content = sentences.join('\n').trim();
    if (!content) continue;

    articles.push({
      articleNum,
      articleTitle,
      content,
      chapter: chapterContextAt(m.index),
      sortOrder: sortOrder++,
    });
  }

  return articles;
}

export async function fetchJapaneseLawFull(lawId: string, titleEn?: string): Promise<JpCollectedLaw | null> {
  const url = `${EGOV_BASE}/${lawId}`;
  console.log(`[jp-collector] Fetching ${url}`);
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36',
        'Accept': 'application/xml, text/xml, */*',
      },
    });
    if (!res.ok) {
      console.error(`[jp-collector] HTTP ${res.status} for ${lawId}`);
      return null;
    }
    const xml = await res.text();

    const codeMatch = /<Result>[\s\S]*?<Code>(\d+)<\/Code>[\s\S]*?<\/Result>/.exec(xml);
    if (codeMatch && codeMatch[1] !== '0') {
      console.error(`[jp-collector] e-Gov returned non-zero result code ${codeMatch[1]} for ${lawId}`);
      return null;
    }

    const titleMatch = /<LawTitle[^>]*>([\s\S]*?)<\/LawTitle>/.exec(xml);
    const title = titleMatch ? stripTags(titleMatch[1]) : (titleEn || lawId);

    const articles = parseJpArticlesFromXml(xml);
    console.log(`[jp-collector] Parsed ${articles.length} articles for "${title}"`);

    return { title, titleEn, lawId, articles };
  } catch (err) {
    console.error(`[jp-collector] Fetch error for ${lawId}:`, err);
    return null;
  }
}

function inferTagsAndBiz(title: string): { tags: string[]; appliesToBiz: string[] } {
  const tags: string[] = ['japan', 'jp'];
  const appliesToBiz: string[] = [];
  const t = title;
  if (/金融商品取引/.test(t)) { tags.push('securities', 'fiea'); appliesToBiz.push('sto', 'securities', 'exchange'); }
  if (/資金決済/.test(t)) { tags.push('payments', 'crypto', 'stablecoin'); appliesToBiz.push('crypto-exchange', 'stablecoin', 'payments'); }
  if (/犯罪による収益|犯収法/.test(t)) { tags.push('aml', 'kyc'); appliesToBiz.push('crypto-exchange', 'payments', 'banking'); }
  if (/電子記録債権/.test(t)) { tags.push('electronic-claims'); appliesToBiz.push('sto', 'tokenization'); }
  if (/銀行法/.test(t)) { tags.push('banking'); appliesToBiz.push('banking'); }
  if (/信託業/.test(t)) { tags.push('trust'); appliesToBiz.push('sto', 'trust', 'tokenization'); }
  return { tags, appliesToBiz };
}

export async function saveJapaneseLawToArchive(
  law: JpCollectedLaw,
  options?: { shortName?: string; regulator?: string; lawNumber?: string }
): Promise<void> {
  const lawNumber = options?.lawNumber || `JP-EGOV-${law.lawId}`;
  const { tags, appliesToBiz } = inferTagsAndBiz(law.title);

  const existing = await prisma.lawArchive.findFirst({ where: { lawNumber } });

  const data: any = {
    title: law.title,
    titleEn: law.titleEn,
    shortName: options?.shortName,
    lawNumber,
    lawType: 'law',
    jurisdiction: 'JP',
    regulator: options?.regulator,
    status: 'enacted',
    totalArticles: law.articles.length,
    sourceUrl: `https://elaws.e-gov.go.jp/document?lawid=${law.lawId}`,
  };

  let lawRecord: any;
  if (existing) {
    await prisma.lawArticle.deleteMany({ where: { lawId: existing.id } });
    lawRecord = await prisma.lawArchive.update({ where: { id: existing.id }, data });
    console.log(`[jp-collector] Updated existing law id=${existing.id}`);
  } else {
    lawRecord = await prisma.lawArchive.create({ data });
    console.log(`[jp-collector] Created law id=${lawRecord.id}`);
  }

  if (law.articles.length > 0) {
    await prisma.lawArticle.createMany({
      data: law.articles.map((a) => ({
        lawId: lawRecord.id,
        articleNum: a.articleNum,
        articleTitle: a.articleTitle,
        content: a.content,
        chapter: a.chapter,
        sortOrder: a.sortOrder,
        tags,
        appliesToBiz,
      })),
    });
  }
  console.log(`[jp-collector] Saved ${law.articles.length} articles for "${law.title}"`);
}

export async function collectJapaneseLaw(
  lawId: string,
  titleEn: string,
  options?: { shortName?: string; regulator?: string }
): Promise<{ success: boolean; title: string; articleCount: number }> {
  console.log(`[jp-collector] === Collecting ${titleEn} (${lawId}) ===`);
  const law = await fetchJapaneseLawFull(lawId, titleEn);
  if (!law) {
    return { success: false, title: titleEn, articleCount: 0 };
  }
  try {
    await saveJapaneseLawToArchive(law, {
      shortName: options?.shortName,
      regulator: options?.regulator,
    });
    return { success: true, title: law.title, articleCount: law.articles.length };
  } catch (err) {
    console.error(`[jp-collector] Save failed for ${lawId}:`, err);
    return { success: false, title: law.title, articleCount: law.articles.length };
  }
}
