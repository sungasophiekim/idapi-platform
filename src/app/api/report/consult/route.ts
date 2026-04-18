// src/app/api/report/consult/route.ts
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { report, profile } = await req.json();
  if (!report) return NextResponse.json({ error: 'No report data' }, { status: 400 });

  const adv = report.aiAdvisory || {};
  const now = new Date();

  const html = `<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="utf-8">
<title>IDAPI Regulatory Compliance Report — ${profile?.companyName || 'Client'}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;600;700&family=DM+Sans:wght@400;600;700&display=swap');
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'DM Sans', 'Noto Sans KR', sans-serif; color: #1a1a1a; max-width: 800px; margin: 0 auto; padding: 40px 32px; font-size: 14px; line-height: 1.6; }
  @media print { body { padding: 20px; } .no-print { display: none; } }

  .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 32px; padding-bottom: 20px; border-bottom: 2px solid #203E33; }
  .logo { display: flex; align-items: center; gap: 10px; }
  .logo-box { width: 36px; height: 36px; background: #203E33; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: white; font-weight: 700; font-size: 12px; }

  .risk-badge { display: inline-block; padding: 4px 16px; border-radius: 20px; font-size: 12px; font-weight: 700; text-transform: uppercase; }
  .risk-high { background: #fee2e2; color: #991b1b; }
  .risk-medium { background: #fef3c7; color: #92400e; }
  .risk-low { background: #d1fae5; color: #065f46; }

  .section { margin-bottom: 28px; }
  .section-title { font-size: 14px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #203E33; margin-bottom: 12px; border-left: 3px solid #203E33; padding-left: 10px; }

  .summary-box { background: #e8f0ed; border-radius: 12px; padding: 20px; margin-bottom: 20px; }

  .action-item { display: flex; gap: 10px; padding: 10px 0; border-bottom: 1px solid #f0f0ee; }
  .action-num { width: 24px; height: 24px; background: #fee2e2; color: #991b1b; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 700; flex-shrink: 0; }

  .law-card { border: 1px solid #e8e8e6; border-radius: 8px; padding: 16px; margin-bottom: 12px; }
  .law-title { font-weight: 700; margin-bottom: 4px; }
  .law-meta { font-size: 12px; color: #888; }
  .req-item { font-size: 13px; padding: 4px 0; display: flex; gap: 6px; }
  .req-badge { font-size: 10px; font-weight: 700; background: #e8f0ed; color: #203E33; padding: 1px 6px; border-radius: 8px; white-space: nowrap; }

  .warning-box { background: #fffbeb; border: 1px solid #fcd34d; border-radius: 8px; padding: 12px 16px; margin-bottom: 8px; font-size: 13px; }

  .bill-row { display: flex; align-items: center; gap: 8px; padding: 8px 0; border-bottom: 1px solid #f0f0ee; font-size: 13px; }
  .bill-status { font-size: 10px; font-weight: 700; background: #fef3c7; color: #92400e; padding: 2px 8px; border-radius: 10px; }
  .bill-impact { font-size: 11px; font-weight: 700; }

  .footer { margin-top: 40px; padding-top: 16px; border-top: 1px solid #e8e8e6; font-size: 11px; color: #aaa; display: flex; justify-content: space-between; }

  .print-btn { position: fixed; bottom: 20px; right: 20px; padding: 12px 24px; background: #203E33; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 14px; font-weight: 600; box-shadow: 0 4px 12px rgba(0,0,0,0.2); }
</style>
</head>
<body>
  <button class="print-btn no-print" onclick="window.print()">🖨️ Print / Save PDF</button>

  <div class="header">
    <div class="logo">
      <div class="logo-box">ID</div>
      <div>
        <div style="font-weight:700;font-size:20px">IDAPI</div>
        <div style="font-size:10px;color:#888">International Digital Asset Policy Institute</div>
      </div>
    </div>
    <div style="text-align:right">
      <div style="font-weight:700;font-size:14px">Regulatory Compliance Report</div>
      <div style="font-size:12px;color:#888">${now.toISOString().slice(0, 10)}</div>
      ${profile?.companyName ? `<div style="font-size:13px;font-weight:600;color:#203E33;margin-top:4px">${profile.companyName}</div>` : ''}
    </div>
  </div>

  <div style="margin-bottom:20px;display:flex;align-items:center;gap:12px">
    <span class="risk-badge risk-${adv.riskLevel || 'medium'}">Risk: ${adv.riskLevel || 'N/A'}</span>
    <span style="font-size:12px;color:#888">${(report.jurisdictionsAnalyzed || []).join(' · ')} · ${(report.businessTypesAnalyzed || []).join(', ')}</span>
  </div>

  <div class="section">
    <div class="section-title">AI 종합 의견 / Executive Summary</div>
    <div class="summary-box">
      <p style="margin-bottom:8px">${adv.summary || ''}</p>
      <p style="color:#555;font-size:13px">${adv.summaryEn || ''}</p>
    </div>
  </div>

  ${(adv.immediateActions || []).length > 0 ? `
  <div class="section">
    <div class="section-title">즉시 조치 사항 / Immediate Actions</div>
    ${(adv.immediateActions || []).map((a: string, i: number) => `
      <div class="action-item">
        <div class="action-num">${i + 1}</div>
        <div>
          <div>${a}</div>
          ${adv.immediateActionsEn?.[i] ? `<div style="color:#888;font-size:12px;margin-top:2px">${adv.immediateActionsEn[i]}</div>` : ''}
        </div>
      </div>
    `).join('')}
  </div>
  ` : ''}

  ${(adv.timelineWarnings || []).length > 0 ? `
  <div class="section">
    <div class="section-title">타임라인 경고 / Timeline Warnings</div>
    ${(adv.timelineWarnings || []).map((w: string, i: number) => `
      <div class="warning-box">
        ⏰ ${w}
        ${adv.timelineWarningsEn?.[i] ? `<div style="color:#888;font-size:12px;margin-top:4px">${adv.timelineWarningsEn[i]}</div>` : ''}
      </div>
    `).join('')}
  </div>
  ` : ''}

  ${(report.currentLaws || []).length > 0 ? `
  <div class="section">
    <div class="section-title">현행법 요건 / Current Law Requirements</div>
    ${(report.currentLaws || []).map((jur: any) => `
      <h4 style="font-weight:700;margin:12px 0 8px">${jur.jurisdiction} (${jur.totalRequirements} requirements)</h4>
      ${(jur.laws || []).map((law: any) => `
        <div class="law-card">
          <div class="law-title">${law.lawNameEn || law.lawName || ''}</div>
          <div class="law-meta">Enacted: ${law.enacted || 'N/A'}</div>
          ${(law.requirements || []).map((req: any) => `
            <div class="req-item"><span class="req-badge">${req.category}</span> <span>${req.requirementEn || req.requirement}</span></div>
          `).join('')}
          <div style="margin-top:8px;font-size:12px;color:#c53030">Penalties: ${law.penaltiesEn || law.penalties || 'N/A'}</div>
        </div>
      `).join('')}
    `).join('')}
  </div>
  ` : ''}

  ${(report.pendingBills || []).length > 0 ? `
  <div class="section">
    <div class="section-title">진행 중인 법안 / Pending Bills</div>
    ${(report.pendingBills || []).map((bill: any) => `
      <div class="bill-row">
        <span class="bill-status">${bill.status}</span>
        <span style="flex:1">${bill.titleEn || bill.title}</span>
        ${bill.impactScore ? `<span class="bill-impact" style="color:${bill.impactScore >= 8 ? '#c53030' : '#92400e'}">Impact ${bill.impactScore}/10</span>` : ''}
        <span style="font-size:11px;color:#888">${bill.estimatedTimeline || ''}</span>
      </div>
    `).join('')}
  </div>
  ` : ''}

  <div class="footer">
    <span>© ${now.getFullYear()} IDAPI — International Digital Asset Policy Institute</span>
    <span>출처: IDAPI (idapi-platform.vercel.app) | Confidential</span>
  </div>
</body>
</html>`;

  return new NextResponse(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
}
