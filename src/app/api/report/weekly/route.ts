// src/app/api/report/weekly/route.ts
export const maxDuration = 60;
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { calculatePII, generateWeeklySummary } from '@/modules/pii-index';

export async function GET() {
  // Generate a printable HTML page with inline CSS
  // Contains: PII score, weekly summary, top regulations, trends

  const [pii, summary, recentRegs, trends] = await Promise.all([
    calculatePII(),
    generateWeeklySummary(),
    prisma.regulation.findMany({
      where: { updatedAt: { gte: new Date(Date.now() - 7 * 86400000) } },
      orderBy: { updatedAt: 'desc' },
      take: 20,
      select: { title: true, titleEn: true, jurisdiction: true, status: true, impactScore: true },
    }),
    prisma.policyTrend.findMany({
      where: { expiresAt: { gte: new Date() } },
      orderBy: { score: 'desc' },
      take: 10,
    }),
  ]);

  const flags: Record<string, string> = { KR: '🇰🇷', US: '🇺🇸', EU: '🇪🇺', SG: '🇸🇬', JP: '🇯🇵', HK: '🇭🇰', INTL: '🌐' };
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 86400000);

  const html = `<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="utf-8">
<title>IDAPI Weekly Policy Intelligence Report</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;600;700&family=DM+Sans:wght@400;600;700&display=swap');
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'DM Sans', 'Noto Sans KR', sans-serif; color: #1a1a1a; max-width: 800px; margin: 0 auto; padding: 40px 32px; }
  @media print { body { padding: 20px; } }

  .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 32px; padding-bottom: 20px; border-bottom: 2px solid #203E33; }
  .logo { display: flex; align-items: center; gap: 10px; }
  .logo-box { width: 36px; height: 36px; background: #203E33; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: white; font-weight: 700; font-size: 12px; }
  .logo-text { font-weight: 700; font-size: 20px; }
  .logo-sub { font-size: 10px; color: #888; }
  .date { text-align: right; font-size: 12px; color: #888; }

  .pii-box { background: #203E33; color: white; border-radius: 16px; padding: 24px 32px; margin-bottom: 24px; display: flex; justify-content: space-between; align-items: center; }
  .pii-score { font-size: 48px; font-weight: 700; }
  .pii-label { font-size: 11px; text-transform: uppercase; letter-spacing: 2px; opacity: 0.7; }
  .pii-change { font-size: 14px; margin-top: 4px; }

  .section { margin-bottom: 28px; }
  .section-title { font-size: 14px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #203E33; margin-bottom: 12px; }

  .highlight { display: flex; align-items: flex-start; gap: 12px; padding: 10px 0; border-bottom: 1px solid #f0f0ee; }
  .highlight-num { width: 22px; height: 22px; background: #e8f0ed; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 700; color: #203E33; flex-shrink: 0; }
  .highlight-text { font-size: 14px; line-height: 1.6; }

  .reg-row { display: flex; align-items: center; gap: 8px; padding: 8px 0; border-bottom: 1px solid #f0f0ee; font-size: 13px; }
  .reg-flag { font-size: 16px; }
  .reg-status { font-size: 10px; font-weight: 700; background: #e8f0ed; color: #203E33; padding: 2px 8px; border-radius: 10px; }
  .reg-title { flex: 1; }
  .reg-impact { font-size: 11px; font-weight: 700; }

  .trend-cloud { display: flex; flex-wrap: wrap; gap: 8px; }
  .trend-tag { padding: 4px 12px; border-radius: 20px; font-size: 12px; background: #e8f0ed; color: #203E33; }

  .footer { margin-top: 40px; padding-top: 16px; border-top: 1px solid #e8e8e6; font-size: 11px; color: #aaa; display: flex; justify-content: space-between; }
  .footer a { color: #203E33; text-decoration: none; }
</style>
</head>
<body>
  <div class="header">
    <div class="logo">
      <div class="logo-box">ID</div>
      <div>
        <div class="logo-text">IDAPI</div>
        <div class="logo-sub">International Digital Asset Policy Institute</div>
      </div>
    </div>
    <div class="date">
      <div style="font-weight:700;font-size:14px">Weekly Policy Intelligence Report</div>
      <div>${weekAgo.toISOString().slice(0,10)} — ${now.toISOString().slice(0,10)}</div>
    </div>
  </div>

  <div class="pii-box">
    <div>
      <div class="pii-label">IDAPI Policy Intelligence Index</div>
      <div class="pii-score">${pii.score}</div>
      <div class="pii-change">${pii.trend === 'up' ? '▲' : pii.trend === 'down' ? '▼' : '—'} ${pii.change > 0 ? '+' : ''}${pii.change} vs last week</div>
    </div>
    <div style="text-align:right;opacity:0.7;font-size:12px">
      <div>New Bills: ${pii.breakdown.newBills.count}</div>
      <div>Committee Progress: ${pii.breakdown.committeeProgress.count}</div>
      <div>Enactments: ${pii.breakdown.enactments.count}</div>
      <div>Active Trends: ${pii.breakdown.trendSpikes.count}</div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">이번 주 핵심 동향 / This Week's Highlights</div>
    ${summary.highlights.map((h: any, i: number) => `
      <div class="highlight">
        <div class="highlight-num">${i + 1}</div>
        <div class="highlight-text">${h.ko}<br><span style="color:#888;font-size:12px">${h.en}</span></div>
      </div>
    `).join('')}
  </div>

  <div class="section">
    <div class="section-title">주요 법안 동향 / Key Regulatory Updates (${recentRegs.length})</div>
    ${recentRegs.slice(0, 15).map((r: any) => `
      <div class="reg-row">
        <span class="reg-flag">${flags[r.jurisdiction] || '🌐'}</span>
        <span class="reg-status">${r.status}</span>
        <span class="reg-title">${r.title}</span>
        ${r.impactScore ? `<span class="reg-impact" style="color:${r.impactScore >= 8 ? '#c53030' : r.impactScore >= 5 ? '#b07815' : '#203E33'}">${r.impactScore}/10</span>` : ''}
      </div>
    `).join('')}
  </div>

  ${trends.length > 0 ? `
  <div class="section">
    <div class="section-title">정책 트렌드 / Policy Trends</div>
    <div class="trend-cloud">
      ${trends.map((tr: any) => `<span class="trend-tag" style="font-size:${Math.max(11, Math.min(16, 11 + tr.score / 20))}px">${tr.keyword || tr.keywordEn} (${Math.round(tr.score)})</span>`).join('')}
    </div>
  </div>
  ` : ''}

  <div class="footer">
    <span>© ${now.getFullYear()} IDAPI — International Digital Asset Policy Institute</span>
    <span>출처: IDAPI (idapi-platform.vercel.app) | 무단전재 및 재배포 금지</span>
  </div>
</body>
</html>`;

  return new NextResponse(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
    },
  });
}
