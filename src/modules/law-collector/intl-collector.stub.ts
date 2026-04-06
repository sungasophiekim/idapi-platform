// Temporary stub — will be replaced when agent completes
import { prisma } from '@/lib/db';

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

export async function saveLawToArchive(law: CollectedLaw): Promise<{ success: boolean; articleCount: number }> {
  try {
    await prisma.lawArchive.upsert({
      where: { jurisdiction_lawNumber: { jurisdiction: law.jurisdiction as any, lawNumber: law.lawNumber } },
      update: { title: law.title, titleEn: law.titleEn, status: 'enacted' },
      create: {
        jurisdiction: law.jurisdiction as any,
        lawType: law.lawType,
        title: law.title,
        titleEn: law.titleEn,
        lawNumber: law.lawNumber,
        regulator: law.regulator,
        sourceUrl: law.sourceUrl,
        enactedDate: law.enactedDate ? new Date(law.enactedDate) : undefined,
        effectiveDate: law.effectiveDate ? new Date(law.effectiveDate) : undefined,
        totalArticles: law.articles.length,
        status: 'enacted',
        articles: { create: law.articles },
      },
    });
    return { success: true, articleCount: law.articles.length };
  } catch (err: any) {
    console.error('Save failed:', err.message);
    return { success: false, articleCount: 0 };
  }
}

export async function fetchAndParseLawFromUrl(_url: string, _config: any): Promise<CollectedLaw | null> {
  console.log('International law collection not yet implemented. Use seed files for now.');
  return null;
}
