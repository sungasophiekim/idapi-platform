// src/modules/reg-consulting/law-matrix.ts
// Structured database of current digital asset laws by jurisdiction
// This is the "knowledge base" that the AI engine references

export interface LawRequirement {
  id: string;
  jurisdiction: string;
  lawName: string;
  lawNameEn: string;
  enacted: string;          // YYYY-MM-DD
  lastAmended?: string;
  appliesToBusinessTypes: BusinessType[];
  requirements: ComplianceRequirement[];
  penalties: string;
  penaltiesEn: string;
  sourceUrl?: string;
}

export interface ComplianceRequirement {
  id: string;
  category: 'license' | 'registration' | 'reporting' | 'operational' | 'consumer-protection' | 'aml' | 'capital' | 'disclosure';
  requirement: string;      // Korean
  requirementEn: string;    // English
  deadline?: string;         // If time-bound
  isMandatory: boolean;
}

export type BusinessType =
  | 'exchange'            // 거래소
  | 'stablecoin-issuer'   // 스테이블코인 발행
  | 'token-issuer'        // 토큰 발행 (STO/ICO)
  | 'wallet-provider'     // 지갑/수탁 서비스
  | 'defi-protocol'       // DeFi 프로토콜
  | 'nft-platform'        // NFT 마켓플레이스
  | 'payment-service'     // 가상자산 결제 서비스
  | 'fund-manager'        // 가상자산 펀드/투자
  | 'mining-staking'      // 채굴/스테이킹 서비스
  | 'data-analytics';     // 블록체인 데이터/분석

export const BUSINESS_TYPE_LABELS: Record<BusinessType, { ko: string; en: string }> = {
  'exchange': { ko: '가상자산 거래소', en: 'Crypto Exchange / VASP' },
  'stablecoin-issuer': { ko: '스테이블코인 발행', en: 'Stablecoin Issuer' },
  'token-issuer': { ko: '토큰 발행 (STO/ICO)', en: 'Token Issuer (STO/ICO)' },
  'wallet-provider': { ko: '지갑/수탁 서비스', en: 'Wallet / Custody Provider' },
  'defi-protocol': { ko: 'DeFi 프로토콜', en: 'DeFi Protocol' },
  'nft-platform': { ko: 'NFT 마켓플레이스', en: 'NFT Marketplace' },
  'payment-service': { ko: '가상자산 결제', en: 'Crypto Payment Service' },
  'fund-manager': { ko: '가상자산 펀드/투자', en: 'Crypto Fund / Investment' },
  'mining-staking': { ko: '채굴/스테이킹', en: 'Mining / Staking Service' },
  'data-analytics': { ko: '블록체인 데이터/분석', en: 'Blockchain Data / Analytics' },
};

// ═══════════════════════════════════════════════════════════════
// CURRENT LAW DATABASE — Major jurisdictions
// ═══════════════════════════════════════════════════════════════

export const CURRENT_LAWS: LawRequirement[] = [
  // ─── KOREA ───
  {
    id: 'kr-vuapa',
    jurisdiction: 'KR',
    lawName: '가상자산이용자보호법',
    lawNameEn: 'Virtual Asset User Protection Act',
    enacted: '2024-07-19',
    appliesToBusinessTypes: ['exchange', 'wallet-provider', 'stablecoin-issuer'],
    requirements: [
      { id: 'kr-1', category: 'consumer-protection', requirement: '이용자 예치금(원화) 분리보관 의무', requirementEn: 'Segregation of user deposits (KRW) mandatory', isMandatory: true },
      { id: 'kr-2', category: 'consumer-protection', requirement: '이용자 가상자산 분리보관 (콜드월렛 80% 이상)', requirementEn: 'Cold wallet storage of 80%+ of user crypto assets', isMandatory: true },
      { id: 'kr-3', category: 'operational', requirement: '보험 또는 공제 가입 의무', requirementEn: 'Mandatory insurance or mutual aid coverage', isMandatory: true },
      { id: 'kr-4', category: 'operational', requirement: '시세조종·불공정거래 금지 및 감시 체계 구축', requirementEn: 'Market manipulation prohibition and surveillance system', isMandatory: true },
      { id: 'kr-5', category: 'disclosure', requirement: '가상자산 상장·폐지 심사 기준 공개', requirementEn: 'Public disclosure of listing/delisting criteria', isMandatory: true },
      { id: 'kr-6', category: 'reporting', requirement: '이상거래 모니터링 및 금감원 보고', requirementEn: 'Suspicious transaction monitoring and FSS reporting', isMandatory: true },
    ],
    penalties: '위반 시 5년 이하 징역 또는 5천만원 이하 벌금. 불공정거래 시 부당이득의 3~5배 과징금.',
    penaltiesEn: 'Up to 5 years imprisonment or KRW 50M fine. Unfair trading: 3-5x penalty on illicit gains.',
    sourceUrl: 'https://www.law.go.kr',
  },
  {
    id: 'kr-sfta',
    jurisdiction: 'KR',
    lawName: '특정금융거래정보법 (특금법)',
    lawNameEn: 'Specified Financial Transaction Information Act (AML Act)',
    enacted: '2021-03-25',
    lastAmended: '2024-07-19',
    appliesToBusinessTypes: ['exchange', 'wallet-provider', 'payment-service', 'stablecoin-issuer'],
    requirements: [
      { id: 'kr-aml-1', category: 'registration', requirement: '가상자산사업자(VASP) 금융정보분석원 신고', requirementEn: 'VASP registration with Korea Financial Intelligence Unit (KoFIU)', isMandatory: true },
      { id: 'kr-aml-2', category: 'aml', requirement: '고객확인(KYC) 및 고객알기의무(CDD) 이행', requirementEn: 'KYC and Customer Due Diligence implementation', isMandatory: true },
      { id: 'kr-aml-3', category: 'aml', requirement: '의심거래보고(STR) 의무', requirementEn: 'Suspicious Transaction Reporting (STR) obligation', isMandatory: true },
      { id: 'kr-aml-4', category: 'aml', requirement: '트래블룰(Travel Rule) 이행 — 100만원 이상 이체 시', requirementEn: 'Travel Rule compliance for transfers over KRW 1M', isMandatory: true },
      { id: 'kr-aml-5', category: 'operational', requirement: 'ISMS(정보보호관리체계) 인증 취득', requirementEn: 'ISMS (Information Security Management System) certification', isMandatory: true },
      { id: 'kr-aml-6', category: 'operational', requirement: '실명확인 입출금 계정(은행 실명계좌) 확보', requirementEn: 'Real-name verified bank account for deposits/withdrawals', isMandatory: true },
    ],
    penalties: '미신고 영업 시 5년 이하 징역 또는 5천만원 이하 벌금.',
    penaltiesEn: 'Operating without registration: up to 5 years imprisonment or KRW 50M fine.',
  },

  // ─── UNITED STATES ───
  {
    id: 'us-bsa',
    jurisdiction: 'US',
    lawName: 'Bank Secrecy Act / FinCEN MSB Requirements',
    lawNameEn: 'Bank Secrecy Act / FinCEN MSB Requirements',
    enacted: '2013-03-18',
    appliesToBusinessTypes: ['exchange', 'wallet-provider', 'payment-service', 'stablecoin-issuer'],
    requirements: [
      { id: 'us-aml-1', category: 'registration', requirement: 'FinCEN MSB(Money Services Business) 등록', requirementEn: 'FinCEN MSB registration', isMandatory: true },
      { id: 'us-aml-2', category: 'aml', requirement: 'AML/KYC 프로그램 수립 및 운영', requirementEn: 'AML/KYC program establishment and operation', isMandatory: true },
      { id: 'us-aml-3', category: 'reporting', requirement: 'SAR(의심활동보고) 및 CTR(통화거래보고) 제출', requirementEn: 'SAR and CTR filing obligations', isMandatory: true },
      { id: 'us-aml-4', category: 'license', requirement: '주별(State) MTL(Money Transmitter License) 취득', requirementEn: 'State-by-state Money Transmitter License', isMandatory: true },
    ],
    penalties: 'BSA 위반 시 민사 벌금 최대 $1M/일, 형사 처벌 최대 10년.',
    penaltiesEn: 'BSA violations: civil penalties up to $1M/day, criminal penalties up to 10 years.',
  },
  {
    id: 'us-genius',
    jurisdiction: 'US',
    lawName: 'GENIUS Act (스테이블코인 규제법)',
    lawNameEn: 'GENIUS Act (Stablecoin Regulation)',
    enacted: '2025-08-01',
    appliesToBusinessTypes: ['stablecoin-issuer', 'payment-service'],
    requirements: [
      { id: 'us-sc-1', category: 'license', requirement: '스테이블코인 발행자 등록 (OCC/주 감독기관)', requirementEn: 'Stablecoin issuer registration (OCC or state regulator)', isMandatory: true },
      { id: 'us-sc-2', category: 'capital', requirement: '1:1 준비금 유지 (현금, 국채, 고유동성 자산)', requirementEn: '1:1 reserve maintenance (cash, T-bills, high-liquidity assets)', isMandatory: true },
      { id: 'us-sc-3', category: 'reporting', requirement: '월간 준비금 증명 + 연간 감사보고', requirementEn: 'Monthly reserve attestation + annual audit', isMandatory: true },
      { id: 'us-sc-4', category: 'consumer-protection', requirement: '이용자 상환 청구권 보장', requirementEn: 'Guaranteed user redemption rights', isMandatory: true },
    ],
    penalties: '무허가 발행 시 연방 벌금 + 발행 중단 명령.',
    penaltiesEn: 'Unauthorized issuance: federal fines + cease-and-desist order.',
  },

  // ─── EUROPEAN UNION ───
  {
    id: 'eu-mica',
    jurisdiction: 'EU',
    lawName: 'MiCA (Markets in Crypto-Assets Regulation)',
    lawNameEn: 'MiCA (Markets in Crypto-Assets Regulation)',
    enacted: '2024-12-30',
    appliesToBusinessTypes: ['exchange', 'wallet-provider', 'stablecoin-issuer', 'token-issuer', 'payment-service'],
    requirements: [
      { id: 'eu-1', category: 'license', requirement: 'CASP(Crypto-Asset Service Provider) 라이선스 취득', requirementEn: 'CASP license from national competent authority', isMandatory: true },
      { id: 'eu-2', category: 'capital', requirement: '최소 자본금 요건 (서비스 유형별 €50K-€150K)', requirementEn: 'Minimum capital requirements (€50K-€150K by service type)', isMandatory: true },
      { id: 'eu-3', category: 'disclosure', requirement: '화이트페이퍼 공시 의무 (토큰 발행 시)', requirementEn: 'White paper publication obligation (token issuance)', isMandatory: true },
      { id: 'eu-4', category: 'consumer-protection', requirement: '이용자 자산 보호 및 분리 관리', requirementEn: 'Client asset protection and segregation', isMandatory: true },
      { id: 'eu-5', category: 'aml', requirement: 'AML/CFT 프로그램 (Travel Rule 포함)', requirementEn: 'AML/CFT program including Travel Rule', isMandatory: true },
      { id: 'eu-6', category: 'operational', requirement: 'IT 보안 및 운영 리스크 관리 (DORA 준수)', requirementEn: 'IT security and operational risk management (DORA compliance)', isMandatory: true },
    ],
    penalties: '위반 시 연매출의 최대 12.5% 과징금 또는 €5M 중 높은 금액.',
    penaltiesEn: 'Up to 12.5% of annual turnover or €5M, whichever is higher.',
  },

  // ─── SINGAPORE ───
  {
    id: 'sg-psa',
    jurisdiction: 'SG',
    lawName: 'Payment Services Act (DPT 규제)',
    lawNameEn: 'Payment Services Act (Digital Payment Token Regulation)',
    enacted: '2020-01-28',
    lastAmended: '2025-01-10',
    appliesToBusinessTypes: ['exchange', 'wallet-provider', 'payment-service', 'stablecoin-issuer'],
    requirements: [
      { id: 'sg-1', category: 'license', requirement: 'MAS DPT 서비스 라이선스 취득', requirementEn: 'MAS Digital Payment Token service license', isMandatory: true },
      { id: 'sg-2', category: 'capital', requirement: '기본자본금 SGD 250K (Major PI) 또는 SGD 100K (Standard PI)', requirementEn: 'Base capital SGD 250K (Major PI) or SGD 100K (Standard PI)', isMandatory: true },
      { id: 'sg-3', category: 'aml', requirement: 'AML/CFT 프로그램 수립 및 Travel Rule 준수', requirementEn: 'AML/CFT program and Travel Rule compliance', isMandatory: true },
      { id: 'sg-4', category: 'consumer-protection', requirement: '개인 투자자 거래 제한 및 리스크 고지', requirementEn: 'Retail investor trading restrictions and risk warnings', isMandatory: true },
      { id: 'sg-5', category: 'operational', requirement: '사이버보안 위험 관리 체계 구축', requirementEn: 'Cybersecurity risk management framework', isMandatory: true },
    ],
    penalties: 'SGD 250,000 벌금 또는 3년 이하 징역.',
    penaltiesEn: 'SGD 250,000 fine or up to 3 years imprisonment.',
  },

  // ─── JAPAN ───
  {
    id: 'jp-psa-fsa',
    jurisdiction: 'JP',
    lawName: '자금결제법 / 금융상품거래법 (가상자산 관련)',
    lawNameEn: 'Payment Services Act / Financial Instruments and Exchange Act (Crypto)',
    enacted: '2017-04-01',
    lastAmended: '2023-06-01',
    appliesToBusinessTypes: ['exchange', 'wallet-provider', 'stablecoin-issuer', 'token-issuer'],
    requirements: [
      { id: 'jp-1', category: 'license', requirement: 'JFSA 가상자산교환업자 등록', requirementEn: 'JFSA Crypto Asset Exchange registration', isMandatory: true },
      { id: 'jp-2', category: 'capital', requirement: '최소자본금 1,000만엔 + 순자산 양수 유지', requirementEn: 'Minimum capital JPY 10M + positive net assets', isMandatory: true },
      { id: 'jp-3', category: 'consumer-protection', requirement: '이용자 자산 분별관리 (신탁 보전)', requirementEn: 'User asset segregation (trust custody)', isMandatory: true },
      { id: 'jp-4', category: 'aml', requirement: '범죄수익이전방지법에 따른 KYC/AML', requirementEn: 'KYC/AML under Act on Prevention of Transfer of Criminal Proceeds', isMandatory: true },
      { id: 'jp-5', category: 'license', requirement: '스테이블코인 발행: 은행/자금이체업자만 가능', requirementEn: 'Stablecoin issuance: limited to banks and fund transfer businesses', isMandatory: true },
    ],
    penalties: '무등록 영업: 3년 이하 징역 또는 300만엔 이하 벌금.',
    penaltiesEn: 'Operating without registration: up to 3 years or JPY 3M fine.',
  },

  // ─── HONG KONG ───
  {
    id: 'hk-vasp',
    jurisdiction: 'HK',
    lawName: 'VASP 라이선스 제도 (SFC)',
    lawNameEn: 'Virtual Asset Service Provider Licensing Regime (SFC)',
    enacted: '2023-06-01',
    appliesToBusinessTypes: ['exchange', 'wallet-provider'],
    requirements: [
      { id: 'hk-1', category: 'license', requirement: 'SFC VATP(Virtual Asset Trading Platform) 라이선스', requirementEn: 'SFC VATP license', isMandatory: true },
      { id: 'hk-2', category: 'capital', requirement: '최소납입자본금 HKD 5M + 유동자산 유지', requirementEn: 'Minimum paid-up capital HKD 5M + liquid assets', isMandatory: true },
      { id: 'hk-3', category: 'consumer-protection', requirement: '이용자 자산 신탁 보관', requirementEn: 'Client asset custody in trust', isMandatory: true },
      { id: 'hk-4', category: 'aml', requirement: 'AML/CFT 프로그램 및 Travel Rule 이행', requirementEn: 'AML/CFT program and Travel Rule compliance', isMandatory: true },
    ],
    penalties: '무허가 운영: HKD 5M 벌금 및 7년 징역.',
    penaltiesEn: 'Operating without license: HKD 5M fine and 7 years imprisonment.',
  },
];

// ─── Helpers ───

export function getLawsForBusiness(jurisdiction: string, businessType: BusinessType): LawRequirement[] {
  return CURRENT_LAWS.filter(
    law => law.jurisdiction === jurisdiction && law.appliesToBusinessTypes.includes(businessType)
  );
}

export function getLawsForJurisdictions(jurisdictions: string[], businessTypes: BusinessType[]): LawRequirement[] {
  return CURRENT_LAWS.filter(
    law => jurisdictions.includes(law.jurisdiction) &&
           law.appliesToBusinessTypes.some(bt => businessTypes.includes(bt))
  );
}

export function getAllJurisdictions(): string[] {
  return [...new Set(CURRENT_LAWS.map(l => l.jurisdiction))];
}
