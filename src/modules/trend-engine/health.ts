// src/modules/trend-engine/health.ts
// On-demand health check for every RSS source — mirrors the collector's
// fetch so status reflects what collection actually sees.

import { RSS_SOURCES, type RssSource } from './sources';

export interface SourceHealth {
  id: string;
  name: string;
  nameKo: string;
  jurisdiction: string;
  type: string;
  weight: number;
  active: boolean;
  status: 'live' | 'dead';
  httpCode: number | null;
  itemCount: number;
  latestDate: string | null;   // most recent article pubDate (last update)
  error: string | null;
  ms: number;                   // fetch duration
}

function countItems(xml: string): number {
  const items = (xml.match(/<item[\s>]/g) || []).length;
  const entries = (xml.match(/<entry[\s>]/g) || []).length;
  return items + entries;
}

function latestPubDate(xml: string): string | null {
  const dates: number[] = [];
  const re = /<(?:pubDate|published|updated|dc:date)[^>]*>(.*?)<\/(?:pubDate|published|updated|dc:date)>/gs;
  let m;
  while ((m = re.exec(xml)) !== null) {
    const d = new Date(m[1].trim());
    if (!isNaN(d.getTime())) dates.push(d.getTime());
  }
  if (!dates.length) return null;
  return new Date(Math.max(...dates)).toISOString();
}

export async function checkSource(source: RssSource): Promise<SourceHealth> {
  const base = {
    id: source.id, name: source.name, nameKo: source.nameKo,
    jurisdiction: source.jurisdiction, type: source.type, weight: source.weight, active: source.active,
  };
  const start = Date.now();
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    const res = await fetch(source.url, {
      signal: controller.signal,
      redirect: 'follow',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
        'Accept': 'application/rss+xml, application/atom+xml, application/xml, text/xml, text/html, */*',
      },
    });
    clearTimeout(timeout);
    const ms = Date.now() - start;

    if (!res.ok) {
      return { ...base, status: 'dead', httpCode: res.status, itemCount: 0, latestDate: null, error: `HTTP ${res.status}`, ms };
    }
    const xml = await res.text();
    const itemCount = countItems(xml);
    return {
      ...base,
      status: itemCount > 0 ? 'live' : 'dead',
      httpCode: res.status,
      itemCount,
      latestDate: latestPubDate(xml),
      error: itemCount > 0 ? null : 'no items parsed',
      ms,
    };
  } catch (e: any) {
    return { ...base, status: 'dead', httpCode: null, itemCount: 0, latestDate: null, error: e.name === 'AbortError' ? 'timeout' : (e.message || 'fetch failed'), ms: Date.now() - start };
  }
}

export async function checkAllSources(): Promise<SourceHealth[]> {
  const out: SourceHealth[] = [];
  const BATCH = 8;
  for (let i = 0; i < RSS_SOURCES.length; i += BATCH) {
    const batch = RSS_SOURCES.slice(i, i + BATCH);
    const results = await Promise.all(batch.map(checkSource));
    out.push(...results);
  }
  return out;
}
