// prisma/seed-phase2.ts
// Run: npx tsx prisma/seed-phase2.ts
// Adds sample regulations for dashboard demo

import { PrismaClient, Jurisdiction, RegulationStatus, ResearchArea } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding Phase 2 data...');

  const regulations = [
    {
      jurisdiction: Jurisdiction.KR,
      status: RegulationStatus.ENACTED,
      title: '가상자산이용자보호법',
      titleEn: 'Virtual Asset User Protection Act',
      summary: '가상자산 이용자의 자산을 보호하기 위한 법률로, 거래소의 고객자산 분리보관, 보험가입, 시세조종 금지 등을 규정합니다.',
      summaryEn: 'Legislation protecting virtual asset users, mandating exchange custody segregation, insurance requirements, and market manipulation prohibitions.',
      sourceName: '금융위원회',
      impactScore: 9,
      tags: ['user-protection', 'exchange', 'custody'],
      researchArea: ResearchArea.KOREA_POLICY,
      proposedDate: new Date('2023-06-30'),
      enactedDate: new Date('2024-07-19'),
      lastUpdatedDate: new Date('2024-07-19'),
      timelineEvents: {
        create: [
          { status: RegulationStatus.PROPOSED, description: '법안 발의', descriptionEn: 'Bill proposed', eventDate: new Date('2023-06-30') },
          { status: RegulationStatus.COMMITTEE, description: '정무위원회 통과', descriptionEn: 'Passed committee', eventDate: new Date('2023-12-15') },
          { status: RegulationStatus.PASSED, description: '국회 본회의 통과', descriptionEn: 'Passed National Assembly', eventDate: new Date('2024-02-06') },
          { status: RegulationStatus.ENACTED, description: '법률 시행', descriptionEn: 'Law enacted', eventDate: new Date('2024-07-19') },
        ],
      },
    },
    {
      jurisdiction: Jurisdiction.KR,
      status: RegulationStatus.COMMITTEE,
      title: '디지털자산 기본법안 (가상자산업권법)',
      titleEn: 'Digital Asset Framework Act (Virtual Asset Business Act)',
      summary: '가상자산 산업 전반의 규율 체계를 마련하는 기본법으로, 토큰 분류체계, 거래소 라이선스, STO 프레임워크 등을 포함합니다.',
      summaryEn: 'Framework legislation for the virtual asset industry, including token classification, exchange licensing, and STO framework.',
      sourceName: '국회 정무위원회',
      impactScore: 10,
      tags: ['framework', 'licensing', 'STO', 'token-classification'],
      researchArea: ResearchArea.KOREA_POLICY,
      proposedDate: new Date('2024-11-15'),
      lastUpdatedDate: new Date('2025-03-20'),
      timelineEvents: {
        create: [
          { status: RegulationStatus.PROPOSED, description: '여러 의원안 발의', descriptionEn: 'Multiple bills proposed', eventDate: new Date('2024-11-15') },
          { status: RegulationStatus.COMMITTEE, description: '정무위원회 병합 심사 중', descriptionEn: 'Under merged review at committee', eventDate: new Date('2025-03-20') },
        ],
      },
    },
    {
      jurisdiction: Jurisdiction.US,
      status: RegulationStatus.COMMITTEE,
      title: 'GENIUS Act (Stablecoin Regulation)',
      titleEn: 'GENIUS Act (Stablecoin Regulation)',
      summary: '미국 스테이블코인 규제 프레임워크를 수립하는 법안으로, 발행자 등록, 준비금 요건, 감독체계 등을 규정합니다.',
      summaryEn: 'Establishes a stablecoin regulatory framework including issuer registration, reserve requirements, and supervisory structure.',
      sourceName: 'US Senate',
      billNumber: 'S.394',
      impactScore: 8,
      tags: ['stablecoin', 'reserve-requirements', 'issuer-registration'],
      researchArea: ResearchArea.DIGITAL_FINANCE,
      proposedDate: new Date('2025-02-04'),
      lastUpdatedDate: new Date('2025-05-15'),
      timelineEvents: {
        create: [
          { status: RegulationStatus.PROPOSED, description: 'Introduced in Senate', descriptionEn: 'Introduced in Senate', eventDate: new Date('2025-02-04') },
          { status: RegulationStatus.COMMITTEE, description: 'Senate Banking Committee markup', descriptionEn: 'Senate Banking Committee markup', eventDate: new Date('2025-03-13') },
        ],
      },
    },
    {
      jurisdiction: Jurisdiction.EU,
      status: RegulationStatus.ENACTED,
      title: 'MiCA (Markets in Crypto-Assets Regulation)',
      titleEn: 'MiCA (Markets in Crypto-Assets Regulation)',
      summary: 'EU 전역에 적용되는 포괄적 가상자산 규제 프레임워크로, 자산발행, 거래소, 스테이블코인 등을 규율합니다.',
      summaryEn: 'Comprehensive crypto-asset regulation across the EU covering issuance, exchanges, and stablecoins.',
      sourceName: 'European Parliament',
      impactScore: 9,
      tags: ['MiCA', 'comprehensive-framework', 'stablecoin', 'CASP'],
      researchArea: ResearchArea.DIGITAL_FINANCE,
      proposedDate: new Date('2020-09-24'),
      enactedDate: new Date('2024-12-30'),
      lastUpdatedDate: new Date('2024-12-30'),
      timelineEvents: {
        create: [
          { status: RegulationStatus.PROPOSED, description: 'European Commission proposal', descriptionEn: 'European Commission proposal', eventDate: new Date('2020-09-24') },
          { status: RegulationStatus.PASSED, description: 'European Parliament adoption', descriptionEn: 'European Parliament adoption', eventDate: new Date('2023-04-20') },
          { status: RegulationStatus.ENACTED, description: 'Full application', descriptionEn: 'Full application', eventDate: new Date('2024-12-30') },
        ],
      },
    },
    {
      jurisdiction: Jurisdiction.SG,
      status: RegulationStatus.ENACTED,
      title: 'Payment Services Act (디지털 결제 토큰 규제)',
      titleEn: 'Payment Services Act (Digital Payment Token Regulation)',
      summary: '싱가포르 MAS의 디지털결제토큰 서비스 규제로, 가상자산 사업자의 라이선스 취득 및 AML/CFT 의무를 규정합니다.',
      summaryEn: 'MAS regulation for digital payment token services, requiring licensing and AML/CFT compliance for virtual asset service providers.',
      sourceName: 'MAS',
      impactScore: 7,
      tags: ['PSA', 'licensing', 'AML', 'DPT'],
      researchArea: ResearchArea.INFRASTRUCTURE,
      proposedDate: new Date('2019-01-28'),
      enactedDate: new Date('2020-01-28'),
      lastUpdatedDate: new Date('2025-01-10'),
      timelineEvents: {
        create: [
          { status: RegulationStatus.ENACTED, description: 'PSA enacted', descriptionEn: 'PSA enacted', eventDate: new Date('2020-01-28') },
          { status: RegulationStatus.ENACTED, description: 'DPT provisions updated', descriptionEn: 'DPT provisions updated', eventDate: new Date('2025-01-10') },
        ],
      },
    },
    {
      jurisdiction: Jurisdiction.JP,
      status: RegulationStatus.PROPOSED,
      title: '스테이블코인 발행 규제 개정안',
      titleEn: 'Stablecoin Issuance Regulation Amendment',
      summary: '일본 내 스테이블코인 발행을 허용하되, 은행 또는 자금이체업자로 발행자를 제한하는 개정안입니다.',
      summaryEn: 'Amendment allowing stablecoin issuance in Japan, limited to banks and fund transfer businesses.',
      sourceName: 'FSA Japan',
      impactScore: 6,
      tags: ['stablecoin', 'banking', 'issuance'],
      researchArea: ResearchArea.DIGITAL_FINANCE,
      proposedDate: new Date('2025-04-01'),
      lastUpdatedDate: new Date('2025-04-01'),
      timelineEvents: {
        create: [
          { status: RegulationStatus.PROPOSED, description: 'FSA amendment proposed', descriptionEn: 'FSA amendment proposed', eventDate: new Date('2025-04-01') },
        ],
      },
    },
    {
      jurisdiction: Jurisdiction.HK,
      status: RegulationStatus.ENACTED,
      title: 'VASP 라이선스 제도 (SFC)',
      titleEn: 'Virtual Asset Service Provider Licensing Regime (SFC)',
      summary: '홍콩 SFC의 가상자산 거래소 라이선스 제도로, 2023년 6월부터 의무화된 등록 체계입니다.',
      summaryEn: 'Hong Kong SFC licensing regime for virtual asset exchanges, mandatory since June 2023.',
      sourceName: 'SFC Hong Kong',
      impactScore: 7,
      tags: ['VASP', 'licensing', 'exchange'],
      researchArea: ResearchArea.INFRASTRUCTURE,
      proposedDate: new Date('2022-12-01'),
      enactedDate: new Date('2023-06-01'),
      lastUpdatedDate: new Date('2025-02-15'),
      timelineEvents: {
        create: [
          { status: RegulationStatus.PROPOSED, description: 'VASP regime proposed', descriptionEn: 'VASP regime proposed', eventDate: new Date('2022-12-01') },
          { status: RegulationStatus.ENACTED, description: 'VASP regime effective', descriptionEn: 'VASP regime effective', eventDate: new Date('2023-06-01') },
        ],
      },
    },
    {
      jurisdiction: Jurisdiction.INTL,
      status: RegulationStatus.PASSED,
      title: 'FATF 가상자산 Travel Rule 최종 가이드라인',
      titleEn: 'FATF Updated Guidance on Virtual Assets Travel Rule',
      summary: 'FATF의 가상자산 Travel Rule 이행 최종 가이드라인으로, VASP 간 송금 시 송수신인 정보 공유를 의무화합니다.',
      summaryEn: 'FATF final guidance on Travel Rule implementation for virtual asset transfers between VASPs.',
      sourceName: 'FATF',
      impactScore: 8,
      tags: ['travel-rule', 'AML', 'FATF', 'compliance'],
      researchArea: ResearchArea.INFRASTRUCTURE,
      proposedDate: new Date('2021-10-28'),
      lastUpdatedDate: new Date('2025-02-01'),
      timelineEvents: {
        create: [
          { status: RegulationStatus.PROPOSED, description: 'Draft guidance released', descriptionEn: 'Draft guidance released', eventDate: new Date('2021-10-28') },
          { status: RegulationStatus.PASSED, description: 'Final guidance adopted', descriptionEn: 'Final guidance adopted', eventDate: new Date('2023-06-15') },
        ],
      },
    },
  ];

  for (const reg of regulations) {
    const existing = await prisma.regulation.findFirst({
      where: { title: reg.title, jurisdiction: reg.jurisdiction },
    });
    if (!existing) {
      await prisma.regulation.create({ data: reg });
      console.log(`  ✓ ${reg.jurisdiction}: ${reg.title}`);
    } else {
      console.log(`  ⊘ Skipped (exists): ${reg.title}`);
    }
  }

  // ─── Policy Trends (sample) ───
  const trends = [
    { keyword: '스테이블코인 규제', keywordEn: 'Stablecoin regulation', score: 92, relatedTags: ['MiCA', 'GENIUS-Act', 'reserve'] },
    { keyword: 'RWA 토큰화', keywordEn: 'RWA tokenization', score: 85, relatedTags: ['STO', 'real-estate', 'bonds'] },
    { keyword: 'Travel Rule 이행', keywordEn: 'Travel Rule compliance', score: 78, relatedTags: ['FATF', 'AML', 'VASP'] },
    { keyword: '가상자산 과세', keywordEn: 'Digital asset taxation', score: 73, relatedTags: ['capital-gains', 'deferral'] },
    { keyword: 'CBDC 파일럿', keywordEn: 'CBDC pilot programs', score: 65, relatedTags: ['central-bank', 'digital-currency'] },
    { keyword: 'DeFi 규제 논의', keywordEn: 'DeFi regulation debate', score: 58, relatedTags: ['decentralized', 'smart-contract'] },
    { keyword: 'AI + 블록체인', keywordEn: 'AI + blockchain convergence', score: 52, relatedTags: ['AI', 'data', 'infrastructure'] },
    { keyword: 'NFT 법적 지위', keywordEn: 'NFT legal status', score: 41, relatedTags: ['NFT', 'intellectual-property'] },
  ];

  for (const trend of trends) {
    await prisma.policyTrend.create({
      data: {
        ...trend,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      },
    });
  }
  console.log(`  ✓ ${trends.length} trends created`);

  console.log('✅ Phase 2 seed complete');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
