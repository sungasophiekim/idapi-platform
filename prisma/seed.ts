// prisma/seed.ts
// Run: npx tsx prisma/seed.ts

import { PrismaClient, UserRole, MemberType, PostCategory, ResearchArea, PostStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // ─── Users ───
  const adminPw = await bcrypt.hash('admin123!', 12);
  const researcherPw = await bcrypt.hash('researcher123!', 12);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@idapi.kr' },
    update: {},
    create: {
      email: 'admin@idapi.kr',
      passwordHash: adminPw,
      name: '관리자',
      nameEn: 'Admin',
      role: UserRole.ADMIN,
    },
  });

  const sophie = await prisma.user.upsert({
    where: { email: 'sophie@idapi.kr' },
    update: {},
    create: {
      email: 'sophie@idapi.kr',
      passwordHash: researcherPw,
      name: '김성아',
      nameEn: 'Sung A Kim',
      role: UserRole.RESEARCHER,
    },
  });

  // ─── Team Members ───
  const founder = await prisma.teamMember.upsert({
    where: { userId: sophie.id },
    update: {},
    create: {
      userId: sophie.id,
      name: '김성아',
      nameEn: 'Sung A (Sophie) Kim',
      title: '설립자',
      titleEn: 'Founder',
      bio: '한국 디지털자산 제도화 과정에 참여해 온 1세대 정책 전문가. 2015년 가상자산 거래소에서 커리어를 시작하며 산업 태동기의 핵심 인프라를 현장에서 경험했으며, 한국블록체인협회 창립부터 참여해 디지털자산 규제와 제도 방향에 대한 초기 논의에 관여했습니다.',
      bioEn: 'A first-generation policy expert who has participated in the institutionalization of Korea\'s digital asset industry. She began her career at a cryptocurrency exchange in 2015, gaining frontline experience in core market infrastructure during its formative years.',
      credentials: [
        '국제디지털자산정책연구소(IDAPI) 설립자',
        '한국블록체인협회 거래소위원회 초대 위원장 (2019–2022)',
        '한빗코(VASP 인가) 공동창업자 (2017–2022)',
        '한국회계학회 가상자산위원회 위원 (2023-2024)',
      ],
      credentialsEn: [
        'Founder, International Digital Asset Policy Institute (IDAPI)',
        'Inaugural Chair, Exchange Committee, Korea Blockchain Association (2019–2022)',
        'Co-founder, Hanbitco Exchange (2017–2022)',
        'Member, Virtual Asset Committee, Korean Accounting Association (2023-2024)',
      ],
      memberType: MemberType.FOUNDER,
      sortOrder: 0,
    },
  });

  const fellowKim = await prisma.teamMember.create({
    data: {
      name: '김정우',
      nameEn: 'JungWoo Kim',
      title: 'Research Fellow',
      titleEn: 'Research Fellow',
      bio: '전통 금융과 디지털 자산을 아우르는 전문성과 실무 경험을 바탕으로, 제도 설계와 정책 자문을 수행해온 금융 정책 전문가입니다. 글로벌 자산운용, 연기금, 정당 정책기구 등 다양한 기관에서의 경험을 보유하고 있습니다.',
      bioEn: 'A capital markets and policy expert with institutional experience spanning global asset managers, public pension funds, and political policy organizations. Known for bridging policy and market implementation through cross-sector leadership.',
      credentials: [
        '더불어민주당 디지털자산위원회 위원 (2025)',
        '전) 국민연금 기금운용본부',
        '전) 라자드코리아자산운용',
        '전) 홍콩 크레디트스위스',
        '한국공인회계사 (KICPA), CFA',
      ],
      credentialsEn: [
        'Member, Digital Asset Committee, Democratic Party of Korea (2025)',
        'National Pension Service — Investment Management',
        'Lazard Korea Asset Management',
        'Credit Suisse, Hong Kong',
        'Korean Certified Public Accountant (KICPA), CFA',
      ],
      memberType: MemberType.FELLOW,
      sortOrder: 1,
    },
  });

  // ─── Posts ───
  const posts = [
    {
      slug: 'digital-asset-tax-deferral-analysis',
      teamAuthorId: founder.id,
      authorId: sophie.id,
      category: PostCategory.POLICY_BRIEF,
      researchArea: ResearchArea.KOREA_POLICY,
      status: PostStatus.PUBLISHED,
      title: '디지털자산 과세 유예와 시장 영향 분석',
      titleEn: 'Analysis of Digital Asset Tax Deferral and Market Impact',
      excerpt: '2025년 시행 예정이었던 가상자산 과세가 2년 유예됨에 따른 시장 영향을 분석합니다.',
      excerptEn: 'Analyzing market impact following the 2-year deferral of digital asset taxation originally scheduled for 2025.',
      viewCount: 342,
      publishedAt: new Date('2025-06-15'),
    },
    {
      slug: 'stablecoin-regulatory-framework-global-trends',
      teamAuthorId: fellowKim.id,
      authorId: null,
      category: PostCategory.COMMENTARY,
      researchArea: ResearchArea.DIGITAL_FINANCE,
      status: PostStatus.PUBLISHED,
      title: '스테이블코인 규제 프레임워크: 글로벌 동향과 시사점',
      titleEn: 'Stablecoin Regulatory Framework: Global Trends and Implications',
      excerpt: 'EU MiCA, 미국 GENIUS Act 등 주요국의 스테이블코인 규제를 비교 분석합니다.',
      excerptEn: 'Comparative analysis of stablecoin regulations across EU MiCA, US GENIUS Act, and other major jurisdictions.',
      viewCount: 218,
      publishedAt: new Date('2025-05-20'),
    },
    {
      slug: 'tokenized-assets-rwa-future-capital-markets',
      teamAuthorId: founder.id,
      authorId: sophie.id,
      category: PostCategory.SEMINAR,
      researchArea: ResearchArea.INFRASTRUCTURE,
      status: PostStatus.PUBLISHED,
      title: '토큰화 자산(RWA)과 자본시장의 미래',
      titleEn: 'Tokenized Assets (RWA) and the Future of Capital Markets',
      excerpt: '실물자산 토큰화가 자본시장에 미치는 구조적 변화를 논의합니다.',
      excerptEn: 'Discussing structural changes tokenization of real-world assets brings to capital markets.',
      viewCount: 156,
      publishedAt: new Date('2025-04-10'),
    },
    {
      slug: 'idapi-established-singapore-foundation',
      teamAuthorId: founder.id,
      authorId: sophie.id,
      category: PostCategory.PRESS_RELEASE,
      researchArea: ResearchArea.KOREA_POLICY,
      status: PostStatus.PUBLISHED,
      title: 'IDAPI, 싱가포르 기반 비영리 재단으로 공식 설립',
      titleEn: 'IDAPI Officially Established as Non-Profit Foundation in Singapore',
      excerpt: '국제디지털자산정책연구소가 싱가포르에 비영리 재단으로 공식 설립되었습니다.',
      excerptEn: 'The International Digital Asset Policy Institute has been officially established as a non-profit foundation in Singapore.',
      viewCount: 489,
      publishedAt: new Date('2025-03-01'),
    },
  ];

  for (const post of posts) {
    await prisma.post.upsert({
      where: { slug: post.slug },
      update: {},
      create: post,
    });
  }

  // ─── Site Settings ───
  const settings = [
    { key: 'site_name', value: 'IDAPI' },
    { key: 'site_name_ko', value: '국제디지털자산정책연구소' },
    { key: 'site_name_en', value: 'International Digital Asset Policy Institute' },
    { key: 'default_lang', value: 'ko' },
    { key: 'partners_visible', value: 'false' },
    { key: 'schema_version', value: '1.0.0' },
  ];

  for (const s of settings) {
    await prisma.siteSetting.upsert({
      where: { key: s.key },
      update: { value: s.value },
      create: s,
    });
  }

  console.log('✅ Seed complete');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
