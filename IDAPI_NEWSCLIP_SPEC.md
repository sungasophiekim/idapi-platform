# iDAPI News Clipping Spec — 인사이트 → 뉴스클리핑

> **결재**: Sophie 2026-07-22 · **작성**: 단우 (CTO) · **상태**: 기획 확정, Build 대기
> 인사이트 메뉴를 **AI·블록체인 인프라 뉴스클리핑**으로 전환. 연구자료(자체 발간물)와 분리.

## 결정사항 (Sophie)
- **소스**: 산업 미디어 RSS 추가 (기존 trend-engine RSS 인프라 재사용)
- **발행**: 관리자 큐레이션 (cron이 DRAFT 수집 → 어드민 승인 → PUBLISHED만 공개)
- **AI 요약**: 없음 — 제목·출처·날짜·원문 링크(+RSS 발췌)만

## 7개 워치 테마 + 키워드
| 키 | 라벨 | 키워드 (KO/EN) |
|---|---|---|
| RWA | RWA·실물자산 토큰화 | RWA, real world asset, tokenized asset, asset tokenization, 실물자산, 토큰화 |
| STABLECOIN | 스테이블코인 | stablecoin, 스테이블코인, tokenized deposit, USDC, USDT, 예치금 토큰 |
| DA_FIN_INFRA | 디지털자산 금융인프라 | digital asset infrastructure, custody, settlement, tokenized fund, on-chain finance, 수탁, 청산결제 |
| AI_AGENT_PAYMENT | AI 에이전트 페이먼트 | AI agent payment, agentic payment, agentic commerce, x402, autonomous payment, machine payment, AI 결제 |
| AI_FIN_INFRA | AI 금융인프라 | AI financial infrastructure, AI in finance, AI banking, AI trading, 금융 AI |
| SOVEREIGN_AI | 소버린 AI | sovereign AI, AI sovereignty, national AI, 소버린 AI, 국가 AI |
| AI_PUBLIC_POLICY | AI 공공정책 활용 | AI in government, AI public sector, public AI, AI policy, 공공 AI, AI 행정 |

## 아키텍처 (기존 trend-engine 재사용)
```
[cron/daily] collectAllFeeds()  (기존 RSS 파서, 외부 의존성 0)
   + sources.ts 에 산업 미디어 피드 추가 (type='media')
        ↓ isRelevant(title+desc)  — 7테마 키워드 필터
        ↓ classifyClip()          — 테마 1개 배정
        ↓ NewsClip upsert(DRAFT)  — url unique dedup
[/admin/news]  큐레이션 — 승인(PUBLISHED)/보관(ARCHIVED)
[/insights]    뉴스클리핑 — 테마 탭 + 카드(제목·출처·날짜·원문링크·발췌), PUBLISHED만
```

## 신규 산업 미디어 RSS 후보 (Build 시 URL 검증)
- 블록체인/디지털자산: CoinDesk, The Block, Cointelegraph, Decrypt, DL News
- AI/인프라: VentureBeat AI, Stanford HAI, MIT Tech Review AI, a16z
- 정책/금융: BIS, 금융위/한국은행(기존 KR 피드 활용)

## DB 모델 (⚠️ 마이그레이션 = Sophie 결재)
```prisma
model NewsClip {
  id          String   @id @default(cuid())
  title       String
  url         String   @unique
  source      String
  theme       String            // 7 watch theme keys
  excerpt     String?  @db.Text
  lang        String   @default("en")
  publishedAt DateTime
  status      NewsClipStatus @default(DRAFT)
  createdAt   DateTime @default(now())
  @@index([theme]) @@index([status])
}
enum NewsClipStatus { DRAFT PUBLISHED ARCHIVED }
```

## 파일 계획
- `src/modules/news-clip/themes.ts` — 7테마·키워드·classifyClip/isRelevant
- `src/modules/news-clip/index.ts` — collectNewsClips()
- `prisma/schema.prisma` — NewsClip + enum (+ migration)
- `src/app/api/news/route.ts` (public GET) · `/api/admin/news` (approve/archive)
- `src/app/(admin)/admin/news/page.tsx` — 큐레이션 UI
- `src/app/(public)/insights/page.tsx` — 뉴스클리핑 재작성 (테마 탭 + 카드)
- `src/app/api/cron/daily/route.ts` — collectNewsClips 훅
- `src/components/layout/Header.tsx` — 인사이트 → 뉴스클리핑 라벨

## Build 단계
- **D1**: 모델 + 마이그레이션 (결재) + themes 모듈
- **D2**: 수집기 + cron 훅 + 어드민 큐레이션
- **D3**: /insights 뉴스클리핑 UI + Header 라벨 + 빌드·preview 검증
