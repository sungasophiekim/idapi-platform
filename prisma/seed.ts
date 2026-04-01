import { PrismaClient } from '../src/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import bcrypt from 'bcryptjs';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  const passwordHash = await bcrypt.hash('admin', 12);

  // Create admin user
  const admin = await prisma.user.upsert({
    where: { email: 'admin@idapi.kr' },
    update: {},
    create: {
      email: 'admin@idapi.kr',
      password: passwordHash,
      name: 'Admin',
      role: 'ADMIN',
    },
  });

  const sophie = await prisma.user.upsert({
    where: { email: 'sophie@idapi.kr' },
    update: {},
    create: {
      email: 'sophie@idapi.kr',
      password: passwordHash,
      name: '김성아',
      nameEn: 'Sung A Kim',
      role: 'RESEARCHER',
    },
  });

  // Create team members
  const t1 = await prisma.teamMember.upsert({
    where: { userId: sophie.id },
    update: {},
    create: {
      userId: sophie.id,
      name: '김성아',
      nameEn: 'Sung A (Sophie) Kim',
      title: '설립자',
      titleEn: 'Founder',
      bio: '한국 디지털자산 제도화 과정에 참여해 온 1세대 정책 전문가. 2015년 가상자산 거래소에서 커리어를 시작하며 산업 태동기의 핵심 인프라를 현장에서 경험했으며, 한국블록체인협회 창립부터 참여했습니다.',
      bioEn: "A first-generation policy expert in Korea's digital asset institutionalization. Started career at a cryptocurrency exchange in 2015, gaining frontline experience in core market infrastructure during its formative years.",
      credentials: ['국제디지털자산정책연구소(IDAPI) 설립자', '한국블록체인협회 거래소위원회 초대 위원장 (2019–2022)', '한빗코(VASP 인가) 공동창업자 (2017–2022)'],
      credentialsEn: ['Founder, IDAPI', 'Inaugural Chair, Exchange Committee, Korea Blockchain Association (2019–2022)', 'Co-founder, Hanbitco Exchange (2017–2022)'],
      type: 'FOUNDER',
      order: 0,
      published: true,
    },
  });

  let t2 = await prisma.teamMember.findFirst({ where: { name: '김정우' } });
  if (!t2) {
    t2 = await prisma.teamMember.create({
      data: {
        name: '김정우',
        nameEn: 'JungWoo Kim',
        title: 'Research Fellow',
        titleEn: 'Research Fellow',
        bio: '전통 금융과 디지털 자산을 아우르는 전문성과 실무 경험을 바탕으로, 제도 설계와 정책 자문을 수행해온 금융 정책 전문가입니다.',
        bioEn: 'A capital markets and policy expert with institutional experience spanning global asset managers, public pension funds, and political policy organizations.',
        credentials: ['더불어민주당 디지털자산위원회 위원 (2025)', '전) 국민연금 기금운용본부', '전) 라자드코리아자산운용', '한국공인회계사 (KICPA), CFA'],
        credentialsEn: ['Member, Digital Asset Committee, Democratic Party of Korea (2025)', 'National Pension Service', 'Lazard Korea Asset Management', 'KICPA, CFA'],
        type: 'FELLOW',
        order: 1,
        published: true,
      },
    });
  }

  // Create posts
  const posts = [
    {
      authorId: t1.id, category: 'POLICY_BRIEF' as const, status: 'PUBLISHED' as const,
      title: '디지털자산 과세 유예와 시장 영향 분석', titleEn: 'Analysis of Digital Asset Tax Deferral and Market Impact',
      excerpt: '2025년 시행 예정이었던 가상자산 과세가 2년 유예됨에 따른 시장 영향을 분석합니다.',
      excerptEn: 'Analyzing market impact following the 2-year deferral of digital asset taxation originally scheduled for 2025.',
      researchArea: 'KOREA_POLICY' as const, publishedAt: new Date('2025-06-15'), views: 342,
    },
    {
      authorId: t2.id, category: 'COMMENTARY' as const, status: 'PUBLISHED' as const,
      title: '스테이블코인 규제 프레임워크: 글로벌 동향과 시사점', titleEn: 'Stablecoin Regulatory Framework: Global Trends and Implications',
      excerpt: 'EU MiCA, 미국 GENIUS Act 등 주요국의 스테이블코인 규제를 비교 분석합니다.',
      excerptEn: 'Comparative analysis of stablecoin regulations across EU MiCA, US GENIUS Act, and other major jurisdictions.',
      researchArea: 'DIGITAL_FINANCE' as const, publishedAt: new Date('2025-05-20'), views: 218,
    },
    {
      authorId: t1.id, category: 'SEMINAR' as const, status: 'PUBLISHED' as const,
      title: '토큰화 자산(RWA)과 자본시장의 미래', titleEn: 'Tokenized Assets (RWA) and the Future of Capital Markets',
      excerpt: '실물자산 토큰화가 자본시장에 미치는 구조적 변화를 논의합니다.',
      excerptEn: 'Discussing structural changes tokenization of real-world assets brings to capital markets.',
      researchArea: 'INFRASTRUCTURE' as const, publishedAt: new Date('2025-04-10'), views: 156,
    },
    {
      authorId: t1.id, category: 'PRESS' as const, status: 'PUBLISHED' as const,
      title: 'IDAPI, 싱가포르 기반 비영리 재단으로 공식 설립', titleEn: 'IDAPI Officially Established as Non-Profit Foundation in Singapore',
      excerpt: '국제디지털자산정책연구소가 싱가포르에 비영리 재단으로 공식 설립되었습니다.',
      excerptEn: 'The International Digital Asset Policy Institute has been officially established as a non-profit foundation in Singapore.',
      researchArea: 'KOREA_POLICY' as const, publishedAt: new Date('2025-03-01'), views: 489,
    },
  ];

  for (const post of posts) {
    const exists = await prisma.post.findFirst({ where: { title: post.title } });
    if (!exists) await prisma.post.create({ data: post });
  }

  console.log('Seed completed successfully');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
