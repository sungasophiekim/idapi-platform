// src/modules/law-collector/index.ts
// Orchestrates law collection from multiple jurisdictions

import { collectKoreanLaw } from './kr-collector';
import { saveLawToArchive, fetchAndParseLawFromUrl } from './intl-collector';
import { collectJapaneseLaw, JAPANESE_LAW_TARGETS } from './jp-collector';
import { collectHongKongLaw, HONG_KONG_LAW_TARGETS } from './hk-collector';
import { getArchiveStats } from '../law-archive';

export { JAPANESE_LAW_TARGETS, HONG_KONG_LAW_TARGETS };

export interface CollectionTarget {
  jurisdiction: string;
  lawName: string;
  options?: {
    shortName?: string;
    regulator?: string;
    tags?: string[];
    appliesToBiz?: string[];
    sourceUrl?: string;
    lawNumber?: string;
  };
}

export interface CollectionResult {
  success: boolean;
  title: string;
  jurisdiction: string;
  articleCount: number;
  error?: string;
}

// Collect a single law
export async function collectLaw(target: CollectionTarget): Promise<CollectionResult> {
  try {
    if (target.jurisdiction === 'KR') {
      try {
        const result = await collectKoreanLaw(target.lawName, target.options);
        return { ...result, jurisdiction: 'KR' };
      } catch (e: any) {
        console.error(`[collector] KR error for "${target.lawName}":`, e.message, e.stack);
        return { success: false, title: target.lawName, jurisdiction: 'KR', articleCount: 0, error: e.message };
      }
    }

    // For other jurisdictions with URL
    if (target.options?.sourceUrl) {
      const law = await fetchAndParseLawFromUrl(target.options.sourceUrl, {
        jurisdiction: target.jurisdiction,
        title: target.lawName,
        lawNumber: target.options.lawNumber || target.lawName,
        regulator: target.options.regulator,
        articlePattern: /(?:Article|Section|§)\s*(\d+[\w.-]*)/gi,
        articleNumPattern: /(?:Article|Section|§)\s*(\d+[\w.-]*)/i,
        contentPattern: /[\s\S]+/,
      });

      if (!law) return { success: false, title: target.lawName, jurisdiction: target.jurisdiction, articleCount: 0, error: 'Failed to fetch' };

      const saved = await saveLawToArchive(law);
      return { success: saved.success, title: target.lawName, jurisdiction: target.jurisdiction, articleCount: saved.articleCount };
    }

    return { success: false, title: target.lawName, jurisdiction: target.jurisdiction, articleCount: 0, error: 'No collection method available' };
  } catch (err: any) {
    return { success: false, title: target.lawName, jurisdiction: target.jurisdiction, articleCount: 0, error: err.message };
  }
}

// Collect multiple laws
export async function collectLaws(targets: CollectionTarget[]): Promise<{
  results: CollectionResult[];
  totalArticles: number;
  successCount: number;
}> {
  const results: CollectionResult[] = [];
  let totalArticles = 0;
  let successCount = 0;

  for (const target of targets) {
    console.log(`📥 Collecting: [${target.jurisdiction}] ${target.lawName}...`);
    const result = await collectLaw(target);
    results.push(result);

    if (result.success) {
      totalArticles += result.articleCount;
      successCount++;
      console.log(`  ✓ ${result.title} — ${result.articleCount} articles`);
    } else {
      console.log(`  ✗ ${result.title} — ${result.error}`);
    }
  }

  return { results, totalArticles, successCount };
}

// Pre-configured Korean digital asset laws
export const KOREAN_LAW_TARGETS: CollectionTarget[] = [
  {
    jurisdiction: 'KR',
    lawName: '가상자산 이용자 보호 등에 관한 법률',
    options: { shortName: '가상자산이용자보호법', regulator: '금융위원회' },
  },
  {
    jurisdiction: 'KR',
    lawName: '특정 금융거래정보의 보고 및 이용 등에 관한 법률',
    options: { shortName: '특금법', regulator: '금융위원회' },
  },
  {
    jurisdiction: 'KR',
    lawName: '자본시장과 금융투자업에 관한 법률',
    options: { shortName: '자본시장법', regulator: '금융위원회' },
  },
  {
    jurisdiction: 'KR',
    lawName: '전자금융거래법',
    options: { shortName: '전자금융거래법', regulator: '금융위원회' },
  },
];

export { getArchiveStats };
