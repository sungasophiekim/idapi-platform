import { prisma } from '../src/lib/db';

const contentKo = `> 본고는 인공지능기본법과 그 하위법령의 시행 현황을 중심으로 검토하고, EU 및 미국을 비교 대상으로 삼았다. 2026년 상반기 세 관할권은 서로 다른 방식으로 AI 규제의 집행을 유예하였으며, 그 공통 원인은 이행 기준의 미비에 있다.

## 요약

1. 주요 3개 관할권이 모두 AI 규제 시행을 유예하였다. 과기정통부는 인공지능기본법 시행과 동시에 사실조사·과태료에 최소 1년의 계도기간을 두었고, EU 이사회는 2026년 6월 29일 고위험 AI 의무의 적용을 2027년 12월로 연기하였으며, 미국 콜로라도주 AI법은 법원의 집행정지로 효력이 정지되었다.
2. 세 곳 모두 기준을 가이드라인 등 법적 구속력이 없는 형태로 제시하였다(한국 5종, EU 초안·실무규약, 미국 NIST AI RMF·ISO/IEC 42001). 이행 기준이 전무했던 것은 아니다.
3. 그럼에도 집행이 유예된 것은 이들 문서가 구속력이 명확한 형태로 확정되지 못하였기 때문이다.
4. 규율 내용은 관할권별 차이가 크다. 최고 제재가 한국은 3천만원 이하 과태료, EU는 전세계 매출액의 7%이다.
5. 인공지능기본법을 EU AI Act의 국내 이식으로 이해하는 것은 적절하지 아니하다.
6. 국내는 규제와 진흥이 서로 다른 속도로 작동한다. 진흥 조항(공공조달 우선 고려·담당자 면책·AI제품 확인 제도)은 2026년 7월 21일 시행되었다.
7. 부담 조항은 유예되고 편익 조항은 시행되었으나, 편익 수령 절차가 모두 확정된 것은 아니다. AI연구소는 신청이 가능한 반면 공공조달 우선 고려는 관문인 확인 제도의 기준이 고시로 위임된 채 미제정 상태이다.
8. 계도기간은 의무의 면제가 아니라 제재의 유예이다. 법적 의무는 2026년 1월 22일부터 이미 발생하였다.

## 제1부 · 주요국의 시행 유예

### Ⅱ. 시행 유예 현황

**한국 — 시행 후 계도기간.** 인공지능기본법은 2026년 1월 22일 시행되었으나, 과기정통부는 규제 적용을 최소 1년 유예하였다. 가이드라인 5종(투명성·안전성·고영향 판단·고영향 책무·영향평가)을 발표하였으나, 법 제32조 제3항이 의무로 정한 고시는 시행에 맞추어 공개되지 않았다. 고영향 판단 가이드라인은 시행 후 세 차례 수정되었다.

**EU — 조화 표준 미비로 인한 연기.** 고위험 AI 의무는 당초 2026년 8월 2일 적용 예정이었으나 Digital Omnibus로 2027년 12월 2일로 16개월 연기되었다. 사유는 Annex III 적합성 입증에 필요한 조화 표준(CEN-CENELEC)의 미인도와, 제6조 제5항이 정한 가이드라인 제공 기한(2026년 2월 2일)의 미준수이다.

**미국 — 사법적 집행정지와 입법적 축소.** 콜로라도 SB 24-205는 미국 최초의 포괄적 위험기반 AI 책임법이었으나, xAI의 위헌소송과 연방 DOJ의 소송참가 끝에 2026년 4월 27일 집행이 정지되었고, SB 26-189로 재입법되었다. NIST AI RMF 등에 부여하였던 안전항 조항은 삭제되었다.

> 세 관할권은 서로 다른 법적 방식으로 같은 결과에 이르렀다. 법령은 시행되었으나 의무는 실질적으로 규율되지 아니하고 있다.

### Ⅲ. 규율 내용의 비교

| 구분 | 한국 (AI기본법) | EU (AI Act) | 미국 콜로라도 (SB 26-189) |
|---|---|---|---|
| 사전 적합성 평가 | 없음(사후 확인) | 있음(제3자 인증) | 없음 |
| 영향평가 | 노력의무 | 의무(FRIA) | 삭제됨 |
| 최고 제재 | 3천만원 이하 과태료 | 전세계 매출 7% / 3,500만 유로 | 주 법무장관 집행 |
| 집행 상태 | 계도기간 1년+ | 2027.12.2 연기 | 집행정지 |

1. **제재 수준의 현격한 차이** — 한국 3천만원 상한 대 EU 매출 7%.
2. **사전 통제의 부재** — 한국은 사후 확인(법 제33조), EU는 시장 출시 전 제3자 적합성 평가.
3. **규율 범위의 한계** — 안전성 확보 의무는 시행령 제24조의 3요건(10²⁶ FLOP 등)을 모두 충족하는 시스템에만 적용되어, 경량·수직형 모델 상당수가 제외된다.
4. **사업자 지위의 중첩** — 자체 모델로 여신 심사를 하는 금융회사는 개발·이용·생성형·고영향 사업자에 동시에 해당하여 의무가 중첩된다.

### Ⅳ. 분석의 틀

규제가 작동하려면 ①법령 규정 ②이행 기준 ③집행 절차가 갖추어져야 한다. 세 관할권의 사례는 이 중 ②가 없는 것이 아니라 비구속적 형태로만 존재함을 보여준다.

> 이행 기준이 없어서 집행이 유예된 것이 아니라, 이행 기준이 구속력 있는 형태로 확정되지 못한 상태에서 집행이 유예되었다.

이 분석은 검증 가능하다. 이행 기준이 구속력 있게 확정되는 시점과 집행 개시 시점이 대체로 일치하여야 한다. 따라서 사업자는 계도기간의 명목상 기간보다 관련 고시의 제정 동향을 지표로 삼는 것이 실질적이다.

## 제2부 · 국내 실무

### Ⅴ. 계도기간 중 대응 세 방안

- **가. 기준 확정 후 대응** — 무용화 위험·초기 투자 부담을 피할 수 있다. 단, 계도기간 종료 시점이 확정되지 않아 준비 기간이 짧아질 수 있다.
- **나. EU 기준 선제 대응** — 글로벌 상호인정을 고려한 방안. 단, EU 기준이 국내법보다 요구 수준이 높아 과잉 대응이 될 수 있다.
- **다. (권장) 해당 여부 판단·문서화 우선** — 기준의 내용과 무관하게 요구되는 사항(고영향 해당 여부 검토, 사업자 지위 확인, 이행 입증 문서 체계)을 먼저 정비한다.

### Ⅵ. 실무상 유의사항

1. 계도기간은 의무 면제가 아니다. 법적 의무는 2026년 1월 22일부터. 유예된 것은 사실조사(법 제40조)와 과태료(법 제43조).
2. 사업자 지위가 중첩되면 의무도 중첩된다(법 제2조 제7호·제4호 사목).
3. 게시 및 5년 보관 의무(시행령 제27조). 이용사업자 부담을 완화하는 규정도 있다.
4. 고영향 확인 요청 기한: 회신 30일(+30일 연장), 이의는 회신 후 10일 이내.
5. 투명성 의무 예외 3종(시행령 제23조 제4항) — 내부 업무 용도 포함.
6. 해외 사업자 국내대리인 지정 의무(법 제36조, 매출 1조원 등 4개 기준).

### Ⅶ. 2026년 7월 21일 시행 개정

공공조달 우선 고려(법 제16조 제3·4항)와 담당자 면책, AI제품·서비스 확인 제도가 시행되었다. 다만 확인의 기준·절차는 과기정통부장관이 행정안전부장관과 협의하여 고시하도록 위임되어 있어 아직 제정되지 않았다(고시 대기). 규제 조항에서 관찰된 구조가 진흥 조항에서도 반복된다. 반면 AI연구소 설립·지정은 시행령에 요건이 규정되어 신청이 가능하다.

### Ⅷ. 연구의 한계

계도기간 종료 시점은 미확정이며, 금융위원회 AI 가이드라인과 인공지능기본법의 관계는 검토 범위에 포함하지 않았다. 고시 미제정에 관한 서술은 시행에 맞추어 공개된 하위법령의 구성에 근거한 것이다.

---

*발행 IDAPI Research · 작성기준일 2026. 7. 22. · 중심 검토 한국 · 비교 EU·미국*`;

const contentEn = `> This paper examines the AI Basic Act and its subordinate instruments, with the EU and the United States as comparators. During the first half of 2026 all three jurisdictions deferred enforcement of their AI rules, and their common cause lies in the absence of settled implementation criteria.

## Summary

1. All three major jurisdictions deferred enforcement. Korea's MSIT set a grace period of at least one year; the EU Council postponed high-risk obligations to December 2027 on 29 June 2026; and Colorado's AI statute is suspended by court order.
2. All three issued criteria in non-binding form (five guidelines in Korea; draft guidelines and codes of practice in the EU; the NIST AI RMF and ISO/IEC 42001 in the US). It is not that no criteria existed.
3. Enforcement was nonetheless deferred because those documents were not settled in a clearly binding form.
4. Substantive requirements diverge considerably — Korea's maximum sanction is a fine up to KRW 30 million against the EU's 7% of global turnover.
5. Reading Korea's AI Basic Act as a domestic transposition of the EU AI Act is not sustainable.
6. In Korea the regulatory and promotional halves move at different speeds; the promotional measures took effect on 21 July 2026.
7. Burden-imposing provisions were deferred while benefit-conferring ones took effect, but the procedures for claiming those benefits are not uniformly settled.
8. A grace period suspends sanctions, not obligations; the statutory duties have applied since 22 January 2026.

## Part One · Deferral across jurisdictions

**Korea — grace period after entry into force.** The AI Basic Act took effect on 22 January 2026, but MSIT suspended application for at least one year. Five guidelines were published, yet the ministerial notice that Article 32(3) makes a duty did not accompany entry into force.

**The EU — delayed for want of harmonised standards.** High-risk obligations, due from 2 August 2026, were moved back sixteen months to 2 December 2027 via the Digital Omnibus, on account of undelivered CEN-CENELEC standards and a missed statutory deadline for classification guidelines.

**The US — judicial stay and legislative narrowing.** Colorado's SB 24-205, the first comprehensive risk-based AI statute, was stayed on 27 April 2026 after xAI's suit and DOJ intervention, then replaced by SB 26-189, which dropped the safe harbour for the NIST AI RMF.

> Three jurisdictions, three legal routes, one result. The norms exist; the obligations do not operate.

### Comparison of substantive requirements

| Item | Korea (AI Basic Act) | EU (AI Act) | Colorado (SB 26-189) |
|---|---|---|---|
| Ex-ante conformity assessment | None (post-hoc confirmation) | Required (third-party) | None |
| Impact assessment | Best-efforts duty | Mandatory (FRIA) | Removed |
| Maximum sanction | Fine ≤ KRW 30M | 7% of global turnover / €35M | State AG enforcement |
| Enforcement status | Grace period, 1yr+ | Deferred to 2 Dec 2027 | Stayed, no date |

### Analytical framework

Regulation requires three things to operate: statutory provisions, implementation criteria, and an enforcement procedure. In all three cases the second is present only in non-binding form.

> Enforcement was not deferred because implementation criteria were missing, but because they had not been settled in a binding form.

## Part Two · Korean practice

**Operator responses.** Three types: (a) wait for the criteria; (b) build to the EU standard; (c) *recommended* — settle classification and documentation first, since these are required however the notices turn out.

**Practical points.** The grace period is not an exemption (duties apply since 22 Jan 2026); overlapping operator status produces overlapping duties; disclosure and five-year retention duties apply; confirmation requests carry fixed time limits (30+30 days, objection within 10); transparency exceptions include internal use; overseas operators may need a domestic representative.

**The 21 July 2026 amendment.** Procurement preference, official indemnity, and an AI product/service confirmation regime took effect — but the confirmation criteria await an unissued notice, so the same structure seen in the regulatory provisions reappears here. AI research institutes, by contrast, are open for application.

---

*Published by IDAPI Research · As of 22 July 2026 · Focus Korea · Comparators EU, US*`;

async function main() {
  const slug = 'in-force-awaiting-criteria-01';
  const data = {
    slug,
    category: 'REPORT' as const,
    researchArea: 'KOREA_POLICY' as const,
    status: 'PUBLISHED' as const,
    title: '법은 시행, 기준은 대기 — AI기본법 하위법령 현황과 주요국 비교',
    titleEn: 'In force, awaiting criteria — Korea’s AI subordinate instruments in comparative context',
    excerpt: '인공지능기본법과 하위법령의 시행 현황을 EU·미국과 비교하고, 2026년 상반기 세 관할권의 AI 규제 집행 유예가 공통적으로 이행 기준의 미확정에서 비롯되었음을 밝힌다.',
    excerptEn: 'A comparative reading of Korea’s AI Basic Act and its subordinate instruments against the EU and the US, finding the common cause of the 2026 enforcement deferrals in unsettled implementation criteria.',
    content: contentKo,
    contentEn: contentEn,
    publishedAt: new Date('2026-07-22T09:00:00+09:00'),
  };
  const post = await prisma.post.upsert({ where: { slug }, update: data, create: data });
  console.log('POST:', post.slug, post.status, post.publishedAt?.toISOString().slice(0, 10));
  process.exit(0);
}
main();
