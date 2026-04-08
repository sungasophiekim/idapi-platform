// src/modules/reg-consulting/index.ts
// Regulatory Consulting Engine
// Input: business profile → Output: compliance requirements + pending bill impact + timeline

import { getLawsForJurisdictions, CURRENT_LAWS, BUSINESS_TYPE_LABELS, type BusinessType, type LawRequirement } from './law-matrix';
import { buildLawContext } from '../law-archive';

export { BUSINESS_TYPE_LABELS, type BusinessType } from './law-matrix';

export interface BusinessProfile {
  companyName?: string;
  description: string;             // Free-text business description
  businessTypes: BusinessType[];   // What they do
  targetJurisdictions: string[];   // Where they operate/plan to
  hasToken: boolean;               // Do they issue a token?
  tokenType?: string;              // stablecoin, utility, security, NFT
  currentStage: 'idea' | 'building' | 'operating' | 'expanding';
  employeeCount?: string;          // rough size
}

export interface ComplianceReport {
  // Current law requirements
  currentLaws: Array<{
    jurisdiction: string;
    laws: LawRequirement[];
    totalRequirements: number;
    criticalItems: string[];       // Most important items
  }>;
  // Pending legislation impact
  pendingBills: Array<{
    jurisdiction: string;
    title: string;
    titleEn?: string;
    status: string;
    impactScore?: number;
    estimatedTimeline: string;     // "6-12 months", "1-2 years"
    impactSummary: string;
    impactSummaryEn: string;
  }>;
  // AI-generated advisory
  aiAdvisory: {
    summary: string;
    summaryEn: string;
    immediateActions: string[];
    immediateActionsEn: string[];
    timelineWarnings: string[];
    timelineWarningsEn: string[];
    riskLevel: 'low' | 'medium' | 'high';
  };
  // Metadata
  generatedAt: string;
  jurisdictionsAnalyzed: string[];
  businessTypesAnalyzed: string[];
}

const CLAUDE_API = 'https://api.anthropic.com/v1/messages';

// ─── Legislative timeline estimation ───
function estimateTimeline(status: string): string {
  const s = status.toUpperCase();
  if (s.includes('ENACTED') || s.includes('PASSED')) return 'Already in effect';
  if (s.includes('FLOOR_VOTE') || s.includes('본회의')) return '1-3 months';
  if (s.includes('COMMITTEE') || s.includes('위원회')) return '6-12 months';
  if (s.includes('PROPOSED') || s.includes('발의')) return '12-24 months';
  return '12-24 months (estimated)';
}

// ─── Build the context for AI analysis ───
async function buildAIContext(profile: BusinessProfile, currentLaws: LawRequirement[], pendingBills: any[], archiveContext?: string): Promise<string> {
  const bizTypes = profile.businessTypes.map(bt => BUSINESS_TYPE_LABELS[bt]?.en || bt).join(', ');
  const jurisdictions = profile.targetJurisdictions.join(', ');

  let context = `BUSINESS PROFILE:
- Company: ${profile.companyName || 'Not specified'}
- Description: ${profile.description}
- Business types: ${bizTypes}
- Target jurisdictions: ${jurisdictions}
- Token issuance: ${profile.hasToken ? `Yes (${profile.tokenType || 'unspecified type'})` : 'No'}
- Stage: ${profile.currentStage}
- Size: ${profile.employeeCount || 'Not specified'}

CURRENT APPLICABLE LAWS:
${currentLaws.map(law => {
  const reqs = law.requirements.map(r => `  - [${r.category}] ${r.requirementEn}`).join('\n');
  return `[${law.jurisdiction}] ${law.lawNameEn} (enacted ${law.enacted})
${reqs}
  Penalties: ${law.penaltiesEn}`;
}).join('\n\n')}

PENDING LEGISLATION IN PIPELINE:
${pendingBills.length > 0 ? pendingBills.map(bill =>
  `[${bill.jurisdiction}] ${bill.titleEn || bill.title}
  Status: ${bill.status} | Impact: ${bill.impactScore || 'N/A'}/10
  Timeline estimate: ${estimateTimeline(bill.status)}`
).join('\n') : 'No directly relevant pending legislation found.'}`;

  // Append IDAPI Law Archive context (full-text articles from 5,000+ laws)
  if (archiveContext && archiveContext.length > 100) {
    context += `\n\n${archiveContext}`;
  }

  return context;
}

// ─── Main consulting function ───
export async function generateComplianceReport(
  profile: BusinessProfile,
  pendingRegulations: any[]  // From DB: regulations with status != ENACTED
): Promise<ComplianceReport> {
  
  // Step 1: Match current laws
  const matchedLaws = getLawsForJurisdictions(profile.targetJurisdictions, profile.businessTypes);
  
  const currentLawsByJurisdiction = profile.targetJurisdictions.map(j => {
    const laws = matchedLaws.filter(l => l.jurisdiction === j);
    const allReqs = laws.flatMap(l => l.requirements);
    const critical = allReqs.filter(r => r.isMandatory && (r.category === 'license' || r.category === 'registration'))
      .map(r => r.requirementEn);
    return {
      jurisdiction: j,
      laws,
      totalRequirements: allReqs.length,
      criticalItems: critical,
    };
  });

  // Step 2: Filter pending bills relevant to this business
  const relevantBills = pendingRegulations
    .filter(reg => {
      // Must be in target jurisdictions
      if (!profile.targetJurisdictions.includes(reg.jurisdiction)) return false;
      // Must not be already enacted (we handle those in current laws)
      if (reg.status === 'ENACTED') return false;
      // Check tag overlap with business types
      const regTags = (reg.tags || []).join(' ').toLowerCase();
      const regTitle = `${reg.title} ${reg.titleEn || ''}`.toLowerCase();
      const text = regTags + ' ' + regTitle;
      
      return profile.businessTypes.some(bt => {
        const keywords: Record<string, string[]> = {
          'exchange': ['exchange', 'trading', 'vasp', '거래소'],
          'stablecoin-issuer': ['stablecoin', 'stable', '스테이블코인', 'reserve'],
          'token-issuer': ['token', 'sto', 'ico', 'issu', '토큰', '발행'],
          'wallet-provider': ['wallet', 'custody', '수탁', '지갑'],
          'defi-protocol': ['defi', 'decentralized', '디파이'],
          'nft-platform': ['nft', 'non-fungible'],
          'payment-service': ['payment', '결제', 'transfer'],
          'fund-manager': ['fund', 'invest', '투자', 'asset management'],
          'mining-staking': ['mining', 'staking', '채굴', '스테이킹'],
          'data-analytics': ['data', 'analytics', '분석'],
        };
        return (keywords[bt] || []).some(kw => text.includes(kw));
      });
    })
    .map(reg => ({
      jurisdiction: reg.jurisdiction,
      title: reg.title,
      titleEn: reg.titleEn,
      status: reg.status,
      impactScore: reg.impactScore,
      estimatedTimeline: estimateTimeline(reg.status),
      impactSummary: reg.aiSummary || reg.summary || '',
      impactSummaryEn: reg.summaryEn || reg.aiSummary || '',
    }));

  // Step 3: AI Advisory generation
  const aiAdvisory = await generateAIAdvisory(profile, matchedLaws, relevantBills);

  return {
    currentLaws: currentLawsByJurisdiction,
    pendingBills: relevantBills,
    aiAdvisory,
    generatedAt: new Date().toISOString(),
    jurisdictionsAnalyzed: profile.targetJurisdictions,
    businessTypesAnalyzed: profile.businessTypes,
  };
}

// ─── AI Advisory Generation ───
async function generateAIAdvisory(
  profile: BusinessProfile,
  currentLaws: LawRequirement[],
  pendingBills: any[]
): Promise<ComplianceReport['aiAdvisory']> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return fallbackAdvisory(profile, currentLaws, pendingBills);
  }

  // Fetch IDAPI Law Archive context (full-text articles relevant to business)
  let archiveContext = '';
  try {
    archiveContext = await buildLawContext(
      profile.targetJurisdictions,
      profile.businessTypes as string[],
      profile.tokenType ? profile.tokenType.split(',') : undefined,
    );
  } catch (e) {
    console.error('[RegConsulting] Failed to build archive context:', e);
  }

  const context = await buildAIContext(profile, currentLaws, pendingBills, archiveContext);

  const systemPrompt = `You are IDAPI's regulatory consulting AI — an expert in global digital asset regulation.

Given a business profile and applicable laws/pending legislation, generate a compliance advisory report.

CRITICAL RULES:
- Be specific and actionable. Don't give generic advice.
- Reference specific laws by name and jurisdiction.
- For timeline warnings, be concrete: "Bill X is in committee stage, likely enacted Q3 2027 → you should prepare Y by Q1 2027."
- Assess overall risk level honestly (low/medium/high).
- If a business plans to operate in multiple jurisdictions, highlight conflicts or gaps between regulatory regimes.

Respond in JSON:
{
  "summary": "Korean executive summary (3-5 sentences, specific to this business)",
  "summaryEn": "English executive summary",
  "immediateActions": ["Korean action item 1", "Korean action item 2", ...],
  "immediateActionsEn": ["English action item 1", ...],
  "timelineWarnings": ["Korean warning about upcoming regulation 1", ...],
  "timelineWarningsEn": ["English warning 1", ...],
  "riskLevel": "low" | "medium" | "high"
}

Aim for 3-5 immediate actions and 2-4 timeline warnings. Each should be one concrete sentence.`;

  try {
    const res = await fetch(CLAUDE_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',  // Use Sonnet for better advisory quality
        max_tokens: 3000,
        system: systemPrompt,
        messages: [{ role: 'user', content: context }],
      }),
    });

    if (!res.ok) throw new Error(`API ${res.status}`);
    const data = await res.json();
    const text = data.content[0]?.text || '';
    const jsonStr = text.replace(/```json?\n?/g, '').replace(/```/g, '').trim();
    return JSON.parse(jsonStr);
  } catch (err: any) {
    console.error('[RegConsulting] AI advisory failed:', err.message);
    return fallbackAdvisory(profile, currentLaws, pendingBills);
  }
}

// ─── Fallback: rule-based advisory when AI is unavailable ───
function fallbackAdvisory(
  profile: BusinessProfile,
  currentLaws: LawRequirement[],
  pendingBills: any[]
): ComplianceReport['aiAdvisory'] {
  const actions: string[] = [];
  const actionsEn: string[] = [];
  const warnings: string[] = [];
  const warningsEn: string[] = [];

  // Generate actions from current law requirements
  for (const law of currentLaws) {
    const licenseReqs = law.requirements.filter(r => r.category === 'license' || r.category === 'registration');
    for (const req of licenseReqs) {
      actions.push(`[${law.jurisdiction}] ${req.requirement}`);
      actionsEn.push(`[${law.jurisdiction}] ${req.requirementEn}`);
    }
  }

  // Generate warnings from pending bills
  for (const bill of pendingBills) {
    warnings.push(`[${bill.jurisdiction}] ${bill.title} — ${bill.estimatedTimeline} 내 시행 예상`);
    warningsEn.push(`[${bill.jurisdiction}] ${bill.titleEn || bill.title} — expected within ${bill.estimatedTimeline}`);
  }

  const riskLevel = currentLaws.length > 5 ? 'high' : currentLaws.length > 2 ? 'medium' : 'low';

  return {
    summary: `${profile.targetJurisdictions.length}개 관할권에서 ${currentLaws.length}개 현행법이 적용되며, ${pendingBills.length}건의 진행 중인 법안이 사업에 영향을 줄 수 있습니다.`,
    summaryEn: `${currentLaws.length} current laws apply across ${profile.targetJurisdictions.length} jurisdictions, with ${pendingBills.length} pending bills that may impact your business.`,
    immediateActions: actions.slice(0, 5),
    immediateActionsEn: actionsEn.slice(0, 5),
    timelineWarnings: warnings.slice(0, 4),
    timelineWarningsEn: warningsEn.slice(0, 4),
    riskLevel,
  };
}
