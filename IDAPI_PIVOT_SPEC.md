# iDAPI Pivot Spec — Institute for Digital & AI Public Infrastructure

> **결재**: Sophie 2026-07-20 · **작성**: 단우 (CTO) · **상태**: Phase A 착수
> **레포**: `~/Desktop/dev/idapi-platform` · **프로덕션**: https://idapi-platform.vercel.app (same-URL 유지)

## 1. 방향 (Sophie 결재)
- **풀 리빌드** (IA부터). 기존 코드 = 참고 자산.
- **AI·DPI 중심 재편**. 디지털 자산 = 5대 테마 중 하나로 축소.
- **싱크탱크/리서치** 정체성 (research·insights·newsletter 전면).
- **규제 컨설팅(`consult`)·AI 분석(`analyze`) = 백로그**. 코드 유지, 런칭 네비 제외. 퀄리티 검증 후 별도 런칭.

## 2. 브랜딩
| 항목 | 값 |
|---|---|
| EN | **Institute for Digital & AI Public Infrastructure** |
| KR | 디지털·AI 공공인프라 연구소 *(확정 대기)* |
| 약칭 | iDAPI |
| 태그라인 | Shaping public infrastructure for the digital & AI era *(안, 확정 대기)* |
| 디자인 | Deep Green `#203E33` 유지 · DM Sans + Noto Sans KR |

## 3. IA / 네비
`Research` · `Insights` · `Policy Radar` · `Focus Areas` · `About` · `Team` → **Subscribe** (CTA) · Admin

| 페이지 | 역할 | 기존 매핑 |
|---|---|---|
| Home | 미션 + 최신 리서치 히어로 + Focus Areas + Radar 스냅샷 + 뉴스레터 | `HomeClient` 재작성 |
| Research | 리포트·페이퍼·브리프 (핵심) | `research/` + 테마 필터 |
| Insights | 짧은 분석 + 뉴스레터 아카이브 | `briefings` API → 퍼블릭 신규 |
| Policy Radar | 관할권별 AI·DPI 법령·법안 트래킹 | `dashboard`+`bill-tracker`+`law-archive` |
| Focus Areas | 5대 테마 랜딩 | 신규 |
| About / Team | 미션·인력 | `about` `team` 리브랜드 |
| ~~Consult / Analyze~~ | 백로그 (네비 제외) | 코드 보존 |

## 4. Focus Areas — 5대 테마
1. AI Governance & Regulation — AI Act, 알고리즘 책무성, 공공 AI
2. Digital Public Infrastructure — 결제 레일, 데이터 교환, 상호운용성
3. Digital Identity & Trust — 디지털 ID, 검증가능 자격증명
4. Data Governance & Privacy — 데이터 보호, 국경간 데이터
5. Digital Assets & Tokenized Infra — (기존 핵심 → 축소)

## 5. 엔진 재배치 (데이터 손실 0)
- `bill-tracker`/`law-archive` 수집 키워드 확장: 디지털자산 → + AI Act·DPI·digital ID·public AI·데이터 거버넌스
- 대시보드 카테고리를 5대 테마 기준 재라벨링
- 어드민 CMS 백엔드 그대로, 라벨만 리브랜드

## 6. 빌드 단계
- **Phase A (직렬)**: 브랜드/메타 + Header/Footer 네비 + i18n 문자열 + IA 스캐폴드
- **Phase B (병렬 worktree)**: Home · Research · Policy Radar · Focus Areas · About/Team
- **Phase C**: 엔진 키워드 확장 · CI green · preview URL

## 7. 기술 주의
- Next.js **16.2.2** — AGENTS.md 경고(브레이킹). `node_modules/next/dist/docs/` 부재 → 신규 API 필요 시 context7로 Next 16 문서 확인.
- 브랜드 문자열 위치: `layout.tsx` · `HomeClient.tsx` · `about` · `TeamClient` · `DashboardClient` · `Header` · `Footer` · `report/weekly` · `report/consult`
- 배포 정책: preview URL만, prod 머지=단우, same-URL 유지.
