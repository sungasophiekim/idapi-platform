// prisma/seed-law-archive-asia2.ts
// Run: npx tsx prisma/seed-law-archive-asia2.ts
// Seeds additional Asian digital asset laws (SG, JP, HK)

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('📚 Seeding Asia additional laws...\n');

  // ═══════════════════════════════════════════════════════════
  // SINGAPORE: MAS Stablecoin Regulatory Framework
  // Published 15 August 2023
  // ═══════════════════════════════════════════════════════════
  const masStablecoin = await prisma.lawArchive.upsert({
    where: { jurisdiction_lawNumber: { jurisdiction: 'SG', lawNumber: 'MAS-SCS-2023' } },
    update: {},
    create: {
      jurisdiction: 'SG',
      lawType: 'regulation',
      title: 'Stablecoin Regulatory Framework for Single-Currency Stablecoins (SCS)',
      titleEn: 'Stablecoin Regulatory Framework for Single-Currency Stablecoins (SCS)',
      shortName: 'MAS Stablecoin Framework',
      lawNumber: 'MAS-SCS-2023',
      enactedDate: new Date('2023-08-15'),
      effectiveDate: new Date('2023-08-15'),
      status: 'enacted',
      regulator: 'Monetary Authority of Singapore (MAS)',
      sourceUrl: 'https://www.mas.gov.sg/publications/monographs-or-information-paper/2023/stablecoin-regulatory-framework',
      totalArticles: 7,
      articles: {
        create: [
          {
            articleNum: 'Part 1',
            articleTitle: 'Scope',
            content: 'This framework applies to single-currency stablecoins (SCS) pegged to Singapore Dollar (SGD) or any G10 currency (USD, EUR, JPY, GBP, CHF, CAD, AUD, NZD, SEK, NOK). SCS are defined as stablecoins that are pegged to a single fiat currency at par value and intended to maintain a stable value relative to the reference currency at all times. Multi-currency stablecoins, algorithmic stablecoins, and asset-backed tokens that do not purport to maintain a stable value are excluded from this framework. Only SCS that meet all requirements under this framework may apply to be recognized as "MAS-regulated stablecoins".',
            contentEn: 'This framework applies to single-currency stablecoins (SCS) pegged to Singapore Dollar (SGD) or any G10 currency (USD, EUR, JPY, GBP, CHF, CAD, AUD, NZD, SEK, NOK). SCS are defined as stablecoins that are pegged to a single fiat currency at par value and intended to maintain a stable value relative to the reference currency at all times. Multi-currency stablecoins, algorithmic stablecoins, and asset-backed tokens that do not purport to maintain a stable value are excluded from this framework. Only SCS that meet all requirements under this framework may apply to be recognized as "MAS-regulated stablecoins".',
            chapter: 'Part 1 — Scope and Definitions',
            sortOrder: 1,
            tags: ['scope', 'scs', 'single-currency-stablecoin', 'sgd', 'g10'],
            appliesToBiz: ['stablecoin-issuer'],
          },
          {
            articleNum: 'Part 2',
            articleTitle: 'Issuer Requirements',
            content: 'SCS issuers must be either (a) a financial institution regulated by MAS under the Banking Act, Securities and Futures Act, or Payment Services Act, or (b) a newly licensed entity under the Payment Services Act holding a Major Payment Institution (MPI) licence. Issuers must maintain a minimum base capital of SGD 1,000,000 (one million Singapore dollars) or an amount equivalent to 50% of annual operating expenses, whichever is higher. The issuer must be incorporated or registered in Singapore and have its head office and place of business in Singapore. The board and senior management must be fit and proper persons as assessed by MAS.',
            contentEn: 'SCS issuers must be either (a) a financial institution regulated by MAS under the Banking Act, Securities and Futures Act, or Payment Services Act, or (b) a newly licensed entity under the Payment Services Act holding a Major Payment Institution (MPI) licence. Issuers must maintain a minimum base capital of SGD 1,000,000 (one million Singapore dollars) or an amount equivalent to 50% of annual operating expenses, whichever is higher. The issuer must be incorporated or registered in Singapore and have its head office and place of business in Singapore. The board and senior management must be fit and proper persons as assessed by MAS.',
            chapter: 'Part 2 — Issuer Requirements',
            sortOrder: 2,
            tags: ['issuer', 'licensing', 'base-capital', 'sgd-1m', 'mpi-licence'],
            appliesToBiz: ['stablecoin-issuer'],
          },
          {
            articleNum: 'Part 3',
            articleTitle: 'Reserve Requirements',
            content: 'SCS must be fully backed at all times by reserve assets equal to at least 100% of the outstanding SCS in circulation. Reserve assets must be denominated in the same currency as the pegged currency and comprise only the following low-risk, highly liquid assets: (i) cash, (ii) cash equivalents including central bank deposits, (iii) government securities (sovereign bonds, treasury bills) with residual maturity not exceeding 3 months, and (iv) reverse repurchase agreements collateralised by government securities. Reserve assets must be valued on a daily (mark-to-market) basis, and any shortfall must be rectified within one business day. Independent valuation must be performed at least monthly.',
            contentEn: 'SCS must be fully backed at all times by reserve assets equal to at least 100% of the outstanding SCS in circulation. Reserve assets must be denominated in the same currency as the pegged currency and comprise only the following low-risk, highly liquid assets: (i) cash, (ii) cash equivalents including central bank deposits, (iii) government securities (sovereign bonds, treasury bills) with residual maturity not exceeding 3 months, and (iv) reverse repurchase agreements collateralised by government securities. Reserve assets must be valued on a daily (mark-to-market) basis, and any shortfall must be rectified within one business day. Independent valuation must be performed at least monthly.',
            chapter: 'Part 3 — Reserve Management',
            sortOrder: 3,
            tags: ['reserve', '100-percent-backing', 'low-risk-assets', 'daily-valuation', 'government-bonds'],
            appliesToBiz: ['stablecoin-issuer'],
          },
          {
            articleNum: 'Part 4',
            articleTitle: 'Redemption',
            content: 'SCS holders must be able to redeem their stablecoins at par value (i.e. 1:1 with the pegged fiat currency) at any time. The issuer must process redemption requests and return the fiat currency to the holder within 5 business days of a valid redemption request. No redemption fees shall exceed a reasonable amount that reflects actual processing costs. The issuer must maintain operational capacity to process redemptions promptly even during periods of market stress.',
            contentEn: 'SCS holders must be able to redeem their stablecoins at par value (i.e. 1:1 with the pegged fiat currency) at any time. The issuer must process redemption requests and return the fiat currency to the holder within 5 business days of a valid redemption request. No redemption fees shall exceed a reasonable amount that reflects actual processing costs. The issuer must maintain operational capacity to process redemptions promptly even during periods of market stress.',
            chapter: 'Part 4 — Redemption Rights',
            sortOrder: 4,
            tags: ['redemption', 'par-value', '5-business-days', 'holder-rights'],
            appliesToBiz: ['stablecoin-issuer', 'exchange', 'wallet-provider'],
          },
          {
            articleNum: 'Part 5',
            articleTitle: 'Disclosure',
            content: 'SCS issuers must publish monthly reserve reports detailing the composition, value, and custodian of reserve assets. These reports must be made publicly available on the issuer\'s website. An independent auditor must conduct a reserve attestation at least monthly, confirming that reserve assets meet or exceed the value of outstanding SCS. The auditor must be a public accounting firm registered with ACRA. The issuer must also publish a whitepaper containing material information about the SCS, including the stabilisation mechanism, reserve policy, redemption policy, and risk factors.',
            contentEn: 'SCS issuers must publish monthly reserve reports detailing the composition, value, and custodian of reserve assets. These reports must be made publicly available on the issuer\'s website. An independent auditor must conduct a reserve attestation at least monthly, confirming that reserve assets meet or exceed the value of outstanding SCS. The auditor must be a public accounting firm registered with ACRA. The issuer must also publish a whitepaper containing material information about the SCS, including the stabilisation mechanism, reserve policy, redemption policy, and risk factors.',
            chapter: 'Part 5 — Disclosure and Transparency',
            sortOrder: 5,
            tags: ['disclosure', 'monthly-report', 'audit', 'whitepaper', 'transparency'],
            appliesToBiz: ['stablecoin-issuer'],
          },
          {
            articleNum: 'Part 6',
            articleTitle: 'Segregation',
            content: 'Reserve assets must be held on statutory trust for the benefit of SCS holders and must be segregated from the issuer\'s own assets at all times. Reserve assets must be custodied with a licensed custodian or a bank regulated by MAS. In the event of the issuer\'s insolvency, the reserve assets held in trust shall not form part of the issuer\'s estate and shall be used solely for the purpose of meeting redemption claims of SCS holders on a priority basis.',
            contentEn: 'Reserve assets must be held on statutory trust for the benefit of SCS holders and must be segregated from the issuer\'s own assets at all times. Reserve assets must be custodied with a licensed custodian or a bank regulated by MAS. In the event of the issuer\'s insolvency, the reserve assets held in trust shall not form part of the issuer\'s estate and shall be used solely for the purpose of meeting redemption claims of SCS holders on a priority basis.',
            chapter: 'Part 6 — Segregation and Custody',
            sortOrder: 6,
            tags: ['segregation', 'trust', 'custody', 'insolvency-protection'],
            appliesToBiz: ['stablecoin-issuer'],
          },
          {
            articleNum: 'Part 7',
            articleTitle: 'Restrictions',
            content: 'SCS issuers are prohibited from lending, staking, pledging, or otherwise encumbering the reserve assets backing the SCS. Reserve assets must not be re-hypothecated. Issuers shall not pay interest or yield to SCS holders, whether directly or through any arrangement. The SCS must function solely as a medium of exchange and store of value pegged to the reference currency, and not as an investment product. Any revenue earned from reserve assets (e.g. interest on government securities) accrues to the issuer but must not be distributed to SCS holders.',
            contentEn: 'SCS issuers are prohibited from lending, staking, pledging, or otherwise encumbering the reserve assets backing the SCS. Reserve assets must not be re-hypothecated. Issuers shall not pay interest or yield to SCS holders, whether directly or through any arrangement. The SCS must function solely as a medium of exchange and store of value pegged to the reference currency, and not as an investment product. Any revenue earned from reserve assets (e.g. interest on government securities) accrues to the issuer but must not be distributed to SCS holders.',
            chapter: 'Part 7 — Restrictions on Activities',
            sortOrder: 7,
            tags: ['no-lending', 'no-staking', 'no-interest', 'reserve-restrictions', 'no-rehypothecation'],
            appliesToBiz: ['stablecoin-issuer', 'defi-protocol'],
          },
        ],
      },
    },
  });

  console.log(`  ✓ ${masStablecoin.title} — ${masStablecoin.totalArticles} articles archived`);

  // ═══════════════════════════════════════════════════════════
  // SINGAPORE: Securities and Futures Act — Digital Token Offering Guide
  // Cap 289, last amended 2023-11-15
  // ═══════════════════════════════════════════════════════════
  const sgSFA = await prisma.lawArchive.upsert({
    where: { jurisdiction_lawNumber: { jurisdiction: 'SG', lawNumber: 'SFA Cap 289' } },
    update: {},
    create: {
      jurisdiction: 'SG',
      lawType: 'guideline',
      title: 'Securities and Futures Act — Guide on Digital Token Offerings',
      titleEn: 'Securities and Futures Act — Guide on Digital Token Offerings',
      shortName: 'SFA Digital Token Guide',
      lawNumber: 'SFA Cap 289',
      enactedDate: new Date('2020-05-26'),
      effectiveDate: new Date('2020-05-26'),
      lastAmendedDate: new Date('2023-11-15'),
      status: 'enacted',
      regulator: 'MAS',
      sourceUrl: 'https://www.mas.gov.sg/regulation/guides/a-guide-to-digital-token-offerings',
      totalArticles: 6,
      articles: {
        create: [
          {
            articleNum: 'Section 2',
            articleTitle: 'Definition of Securities and Capital Markets Products',
            content: 'Under Section 2 of the SFA, "securities" includes shares, debentures, and units in collective investment schemes. MAS applies a substance-over-form approach: a digital token constitutes a "capital markets product" if it confers rights analogous to shares (e.g. ownership, dividends), debentures (e.g. repayment of principal with interest), or units in a collective investment scheme (e.g. pooled returns). The legal form or technology used (blockchain, DLT) does not determine the classification — the rights and obligations attached to the token are determinative.',
            contentEn: 'Under Section 2 of the SFA, "securities" includes shares, debentures, and units in collective investment schemes. MAS applies a substance-over-form approach: a digital token constitutes a "capital markets product" if it confers rights analogous to shares (e.g. ownership, dividends), debentures (e.g. repayment of principal with interest), or units in a collective investment scheme (e.g. pooled returns). The legal form or technology used (blockchain, DLT) does not determine the classification — the rights and obligations attached to the token are determinative.',
            chapter: 'Part II — Interpretation',
            sortOrder: 1,
            tags: ['definition', 'securities', 'capital-markets-products', 'substance-over-form', 'token-classification'],
            appliesToBiz: ['token-issuer', 'exchange', 'fund-manager'],
          },
          {
            articleNum: 'Section 239',
            articleTitle: 'Prospectus Requirement',
            content: 'Section 239 of the SFA requires that any person who makes an offer of securities to the public in Singapore must lodge and register a prospectus with MAS before the offer is made. This applies to digital token offerings where the tokens constitute securities or units in a CIS. The prospectus must contain all information that investors and their professional advisers would reasonably require to make an informed assessment of the merits of the offering, including risk factors, use of proceeds, financial statements, and details of the issuer and its management.',
            contentEn: 'Section 239 of the SFA requires that any person who makes an offer of securities to the public in Singapore must lodge and register a prospectus with MAS before the offer is made. This applies to digital token offerings where the tokens constitute securities or units in a CIS. The prospectus must contain all information that investors and their professional advisers would reasonably require to make an informed assessment of the merits of the offering, including risk factors, use of proceeds, financial statements, and details of the issuer and its management.',
            chapter: 'Part XIII — Offers of Investments',
            sortOrder: 2,
            tags: ['prospectus', 'public-offering', 'disclosure', 'investor-protection'],
            appliesToBiz: ['token-issuer'],
          },
          {
            articleNum: 'Section 240',
            articleTitle: 'Exemptions from Prospectus Requirement',
            content: 'Section 240 provides exemptions from the prospectus requirement, including: (a) Small offers — aggregate amount raised does not exceed SGD 5 million within any 12-month period; (b) Private placements — offers made to no more than 50 persons within any 12-month period; (c) Institutional investor offers — offers made solely to institutional investors as defined in Section 4A; (d) Accredited investor offers — offers made solely to accredited investors (individual net assets >SGD 2M, or financial assets >SGD 1M, or income >SGD 300K in preceding 12 months). Tokens issued under exemptions are subject to resale restrictions.',
            contentEn: 'Section 240 provides exemptions from the prospectus requirement, including: (a) Small offers — aggregate amount raised does not exceed SGD 5 million within any 12-month period; (b) Private placements — offers made to no more than 50 persons within any 12-month period; (c) Institutional investor offers — offers made solely to institutional investors as defined in Section 4A; (d) Accredited investor offers — offers made solely to accredited investors (individual net assets >SGD 2M, or financial assets >SGD 1M, or income >SGD 300K in preceding 12 months). Tokens issued under exemptions are subject to resale restrictions.',
            chapter: 'Part XIII — Offers of Investments',
            sortOrder: 3,
            tags: ['exemptions', 'small-offer', 'sgd-5m', 'private-placement', 'accredited-investor', 'institutional-investor'],
            appliesToBiz: ['token-issuer', 'fund-manager'],
          },
          {
            articleNum: 'Section 272B',
            articleTitle: 'Licensed Markets — Digital Token Exchange',
            content: 'Section 272B requires that any person who operates an organised market for trading of capital markets products (including digital tokens that are securities) must hold an Approved Exchange (AE) or Recognised Market Operator (RMO) licence from MAS. A digital token exchange that facilitates the secondary trading of security tokens must comply with the same market operator requirements applicable to traditional securities exchanges, including rules on fair and orderly trading, market surveillance, clearing and settlement, and risk management.',
            contentEn: 'Section 272B requires that any person who operates an organised market for trading of capital markets products (including digital tokens that are securities) must hold an Approved Exchange (AE) or Recognised Market Operator (RMO) licence from MAS. A digital token exchange that facilitates the secondary trading of security tokens must comply with the same market operator requirements applicable to traditional securities exchanges, including rules on fair and orderly trading, market surveillance, clearing and settlement, and risk management.',
            chapter: 'Part III — Approved Exchanges and Recognised Market Operators',
            sortOrder: 4,
            tags: ['exchange-licence', 'rmo', 'approved-exchange', 'market-operator', 'secondary-trading'],
            appliesToBiz: ['exchange'],
          },
          {
            articleNum: 'Section 82',
            articleTitle: 'Capital Markets Services Licence',
            content: 'Section 82 of the SFA requires any person who carries on a business of dealing in capital markets products, or advising on corporate finance, fund management, or providing custodial services, to hold a Capital Markets Services (CMS) licence. This applies to intermediaries dealing in digital tokens that are capital markets products. CMS licence holders must meet ongoing requirements including minimum base capital (ranging from SGD 250,000 to SGD 5,000,000 depending on the regulated activity), risk-based capital adequacy, and compliance with business conduct rules under the Securities and Futures (Licensing and Conduct of Business) Regulations.',
            contentEn: 'Section 82 of the SFA requires any person who carries on a business of dealing in capital markets products, or advising on corporate finance, fund management, or providing custodial services, to hold a Capital Markets Services (CMS) licence. This applies to intermediaries dealing in digital tokens that are capital markets products. CMS licence holders must meet ongoing requirements including minimum base capital (ranging from SGD 250,000 to SGD 5,000,000 depending on the regulated activity), risk-based capital adequacy, and compliance with business conduct rules under the Securities and Futures (Licensing and Conduct of Business) Regulations.',
            chapter: 'Part IV — Licensing of Capital Markets Services',
            sortOrder: 5,
            tags: ['cms-licence', 'dealing', 'fund-management', 'custody', 'base-capital'],
            appliesToBiz: ['exchange', 'fund-manager', 'wallet-provider', 'token-issuer'],
          },
          {
            articleNum: 'Guide on Digital Token Offerings',
            articleTitle: 'Application of Substance Over Form',
            content: 'MAS\'s Guide on Digital Token Offerings (last updated November 2023) provides detailed guidance on how MAS applies the SFA to digital token offerings. Key principles: (1) Substance over form — the characterisation of a digital token does not depend on the terminology used by the issuer (e.g. "utility token") but on the rights and features of the token; (2) A token may start as a utility token but become a security token if its features change; (3) MAS provides case studies illustrating when tokens would and would not be considered securities; (4) Issuers are expected to seek legal advice and, if in doubt, consult MAS before proceeding with a token offering; (5) Anti-money laundering and countering the financing of terrorism (AML/CFT) obligations apply to all digital token intermediaries under the Payment Services Act regardless of token classification.',
            contentEn: 'MAS\'s Guide on Digital Token Offerings (last updated November 2023) provides detailed guidance on how MAS applies the SFA to digital token offerings. Key principles: (1) Substance over form — the characterisation of a digital token does not depend on the terminology used by the issuer (e.g. "utility token") but on the rights and features of the token; (2) A token may start as a utility token but become a security token if its features change; (3) MAS provides case studies illustrating when tokens would and would not be considered securities; (4) Issuers are expected to seek legal advice and, if in doubt, consult MAS before proceeding with a token offering; (5) Anti-money laundering and countering the financing of terrorism (AML/CFT) obligations apply to all digital token intermediaries under the Payment Services Act regardless of token classification.',
            chapter: 'MAS Guidance',
            sortOrder: 6,
            tags: ['guidance', 'substance-over-form', 'token-classification', 'utility-token', 'security-token', 'aml-cft'],
            appliesToBiz: ['token-issuer', 'exchange', 'fund-manager', 'defi-protocol', 'nft-platform'],
          },
        ],
      },
    },
  });

  console.log(`  ✓ ${sgSFA.title} — ${sgSFA.totalArticles} articles archived`);

  // ═══════════════════════════════════════════════════════════
  // JAPAN: 金融商品取引法 (FIEA) — Crypto/STO Provisions
  // Act No. 25 of 1948, last amended 2023-06-14
  // ═══════════════════════════════════════════════════════════
  const jpFIEA = await prisma.lawArchive.upsert({
    where: { jurisdiction_lawNumber: { jurisdiction: 'JP', lawNumber: 'Act No. 25 of 1948' } },
    update: {},
    create: {
      jurisdiction: 'JP',
      lawType: 'law',
      title: '金融商品取引法',
      titleEn: 'Financial Instruments and Exchange Act (FIEA)',
      shortName: '金商法',
      lawNumber: 'Act No. 25 of 1948',
      enactedDate: new Date('1948-04-13'),
      lastAmendedDate: new Date('2023-06-14'),
      status: 'enacted',
      regulator: '金融庁 (FSA)',
      sourceUrl: 'https://www.japaneselawtranslation.go.jp/en/laws/view/4385',
      totalArticles: 10,
      articles: {
        create: [
          {
            articleNum: '第2条第1項',
            articleTitle: '有価証券の定義',
            content: '第二条　この法律において「有価証券」とは、次に掲げるものをいう。\n一　国債証券\n二　地方債証券\n三　特別の法律により法人の発行する債券\n（中略）\n二十一　前各号に掲げるもののほか、流通性その他の事情を勘案し、公益又は投資者の保護を確保することが必要と認められるものとして政令で定めるもの\n\n2019年改正により、電子記録移転権利（セキュリティトークン）が有価証券の定義に含まれることが明確化された。ブロックチェーン等の分散型台帳技術を用いて発行・移転される権利であっても、その実質が有価証券に該当する場合、金融商品取引法の規制対象となる。',
            contentEn: 'Article 2(1): "Securities" as used in this Act means the following: (i) government bond certificates; (ii) local government bond certificates; (iii) bonds issued by corporations under special laws; ... (xxi) instruments designated by Cabinet Order as requiring investor protection based on liquidity and other circumstances.\n\nThe 2019 amendment clarified that electronically recorded transferable rights (security tokens) are included in the definition of securities. Even rights issued or transferred using distributed ledger technology such as blockchain are subject to FIEA regulation if they are substantively equivalent to securities.',
            chapter: '第一章 総則',
            sortOrder: 1,
            tags: ['definition', 'securities', 'security-token', 'electronically-recorded-transferable-rights'],
            appliesToBiz: ['token-issuer', 'exchange', 'fund-manager'],
          },
          {
            articleNum: '第2条第3項',
            articleTitle: '電子記録移転権利',
            content: '第二条第三項に規定する「電子記録移転権利」とは、金融商品取引法第二条に規定する有価証券に表示されるべき権利であって、電子情報処理組織を用いて移転することができる財産的価値（電子機器その他の物に電子的方法により記録されるものに限る。）に表示されるものをいう。\n\n電子記録移転権利（いわゆるセキュリティトークン・オファリング（STO））は、第一項有価証券として取り扱われ、その募集・私募は金融商品取引法の開示規制の対象となる。発行者は有価証券届出書の提出、目論見書の交付等の義務を負う。',
            contentEn: 'Article 2(3): "Electronically Recorded Transferable Rights" (ERTR) means rights that should be indicated on securities as defined in Article 2 of the FIEA, which are indicated on property value that can be transferred using electronic data processing systems (limited to those recorded electronically on electronic devices or other objects).\n\nERTR (commonly known as Security Token Offerings / STO) are treated as Paragraph 1 Securities, and their public offering or private placement is subject to FIEA disclosure regulations. Issuers are obligated to file securities registration statements and deliver prospectuses.',
            chapter: '第一章 総則',
            sortOrder: 2,
            tags: ['sto', 'security-token', 'ertr', 'electronically-recorded-transferable-rights', 'disclosure'],
            appliesToBiz: ['token-issuer', 'exchange'],
          },
          {
            articleNum: '第2条の2',
            articleTitle: 'デリバティブ取引',
            content: '暗号資産（資金決済法に定義される暗号資産）を原資産とするデリバティブ取引は、2020年5月施行の改正金融商品取引法により、金融商品取引法上の「デリバティブ取引」に含まれることとなった。これにより、暗号資産デリバティブ取引を業として行う者は、第一種金融商品取引業の登録が必要となる。暗号資産デリバティブには先物取引、オプション取引、スワップ取引等が含まれ、証拠金取引（レバレッジ取引）には証拠金規制（個人向け：2倍以内）が適用される。',
            contentEn: 'Derivative transactions with crypto assets (as defined in the Payment Services Act) as underlying assets are included in the definition of "derivatives transactions" under the FIEA, following the May 2020 amendment. Persons who conduct crypto asset derivative transactions as a business must register as a Type I Financial Instruments Business. Crypto asset derivatives include futures, options, and swap transactions. Margin trading (leveraged trading) is subject to margin regulations (maximum 2x leverage for retail investors).',
            chapter: '第一章 総則',
            sortOrder: 3,
            tags: ['derivatives', 'crypto-derivatives', 'futures', 'options', 'leverage', 'margin-regulation', '2x-leverage'],
            appliesToBiz: ['exchange', 'fund-manager'],
          },
          {
            articleNum: '第29条',
            articleTitle: '金融商品取引業の登録',
            content: '第二十九条　金融商品取引業は、内閣総理大臣の登録を受けた者でなければ、行うことができない。\n\n金融商品取引業は以下の4種類に分類される：\n・第一種金融商品取引業：有価証券の売買・媒介、デリバティブ取引（暗号資産デリバティブ含む）、引受業務等\n・第二種金融商品取引業：みなし有価証券（ファンド持分等）の自己募集・私募の取扱い、電子記録移転権利の募集の取扱い\n・投資助言・代理業：投資助言契約に基づく助言\n・投資運用業：投資一任契約に基づく運用、ファンド運用\n\nセキュリティトークンの発行は第二種、流通市場での取扱いは第一種の登録が必要。',
            contentEn: 'Article 29: No person shall engage in Financial Instruments Business without being registered with the Prime Minister (delegated to the FSA Commissioner).\n\nFinancial Instruments Business is classified into 4 types:\n- Type I: Trading/brokering of securities, derivative transactions (including crypto asset derivatives), underwriting\n- Type II: Self-offering/handling private placement of deemed securities (fund interests, etc.), handling offering of electronically recorded transferable rights\n- Investment Advisory/Agency: Advisory services under investment advisory contracts\n- Investment Management: Discretionary investment management, fund management\n\nIssuance of security tokens requires Type II registration; handling on secondary markets requires Type I registration.',
            chapter: '第三章 金融商品取引業者等',
            sortOrder: 4,
            tags: ['registration', 'type-i', 'type-ii', 'financial-instruments-business', 'sto'],
            appliesToBiz: ['exchange', 'token-issuer', 'fund-manager'],
          },
          {
            articleNum: '第36条の2',
            articleTitle: '広告等の規制',
            content: '第三十六条の二　金融商品取引業者等は、その行う金融商品取引業の内容について広告その他これに類似するものとして内閣府令で定める行為をするときは、次に掲げる事項を表示しなければならない。\n一　当該金融商品取引業者等の商号、名称又は氏名\n二　金融商品取引業者等である旨及びその登録番号\n三　当該金融商品取引業の内容に関する事項であつて、顧客の判断に影響を及ぼすこととなる重要なもの\n\n暗号資産関連業務の広告においては、価格変動リスク、元本毀損リスク等の重要事項を明瞭かつ正確に表示する必要がある。誇大広告・虚偽広告は禁止される。',
            contentEn: 'Article 36-2: When a Financial Instruments Business Operator advertises or engages in similar activities regarding its financial instruments business, it must display: (i) its trade name, name, or designation; (ii) that it is a registered Financial Instruments Business Operator and its registration number; (iii) material matters relating to the content of its business that could affect customer judgment.\n\nAdvertising for crypto-asset-related businesses must clearly and accurately display material matters including price fluctuation risk and risk of loss of principal. Exaggerated and false advertising is prohibited.',
            chapter: '第三章 金融商品取引業者等',
            sortOrder: 5,
            tags: ['advertising', 'disclosure', 'risk-warning', 'consumer-protection'],
            appliesToBiz: ['exchange', 'token-issuer', 'fund-manager'],
          },
          {
            articleNum: '第40条の2',
            articleTitle: '適合性の原則',
            content: '第四十条の二　金融商品取引業者等は、業務の運営の状況が次の各号のいずれかに該当することのないように、その業務を行わなければならない。\n一　金融商品取引行為について、顧客の知識、経験、財産の状況及び金融商品取引契約を締結する目的に照らして不適当と認められる勧誘を行つて投資者の保護に欠けることとなつており、又は欠けることとなるおそれがあること\n\n暗号資産デリバティブ取引においては、顧客の投資経験・資産状況・リスク許容度等を確認し、適合性に問題がある場合は取引を行わせてはならない。',
            contentEn: 'Article 40-2: Financial Instruments Business Operators must ensure their business operations do not fall into any of the following: (i) conducting solicitation that is deemed inappropriate in light of the customer\'s knowledge, experience, financial situation, and purpose of entering into financial instruments transactions, thereby undermining or potentially undermining investor protection.\n\nFor crypto asset derivative transactions, operators must verify the customer\'s investment experience, financial situation, and risk tolerance, and must not allow transactions where suitability concerns exist.',
            chapter: '第三章 金融商品取引業者等',
            sortOrder: 6,
            tags: ['suitability', 'customer-protection', 'know-your-customer', 'risk-assessment'],
            appliesToBiz: ['exchange', 'fund-manager'],
          },
          {
            articleNum: '第43条の2',
            articleTitle: '顧客資産の分別管理',
            content: '第四十三条の二　金融商品取引業者等は、その行う投資助言業務又は投資運用業務に関して、顧客から金銭又は有価証券の預託を受けた場合、当該金銭又は有価証券を自己の固有財産と分別して管理しなければならない。\n\n暗号資産関連業務においても、顧客の資産（金銭・暗号資産）は業者の固有財産と明確に分別して管理する義務がある。第一種金融商品取引業者は、信託保全等の方法により顧客資産を保護しなければならない。',
            contentEn: 'Article 43-2: When a Financial Instruments Business Operator receives deposits of money or securities from customers in connection with its investment advisory or investment management business, it must manage such money or securities separately from its own proprietary assets.\n\nFor crypto-asset-related businesses, customer assets (both money and crypto assets) must be clearly segregated from the operator\'s proprietary assets. Type I Financial Instruments Business Operators must protect customer assets through methods such as trust custody.',
            chapter: '第三章 金融商品取引業者等',
            sortOrder: 7,
            tags: ['segregation', 'customer-asset-protection', 'trust-custody'],
            appliesToBiz: ['exchange', 'wallet-provider', 'fund-manager'],
          },
          {
            articleNum: '第63条の11の2',
            articleTitle: '自主規制機関',
            content: '認定金融商品取引業協会（自主規制機関）は、金融商品取引業の健全な発展及び投資者保護を目的として、自主規制規則の制定・会員の監督等を行う。暗号資産分野においては、日本暗号資産取引業協会（JVCEA）が認定自主規制機関として、暗号資産交換業者及び暗号資産デリバティブ取引業者の自主規制を行っている。JVCEAは、取扱暗号資産の審査基準、広告規制、利用者保護措置等に関する自主規制規則を制定し、会員の遵守状況を監督する。',
            contentEn: 'Certified Financial Instruments Firms Associations (self-regulatory organizations) establish self-regulatory rules and supervise members for the purpose of sound development of the financial instruments business and investor protection. In the crypto asset field, the Japan Virtual and Crypto Assets Exchange Association (JVCEA) serves as the certified self-regulatory organization, overseeing crypto asset exchange operators and crypto asset derivative transaction operators. JVCEA establishes self-regulatory rules regarding listing standards for crypto assets, advertising regulations, user protection measures, etc., and supervises member compliance.',
            chapter: '第三章の二 認定金融商品取引業協会',
            sortOrder: 8,
            tags: ['self-regulation', 'jvcea', 'industry-association', 'listing-standards'],
            appliesToBiz: ['exchange'],
          },
          {
            articleNum: '第185条',
            articleTitle: '無登録営業に対する罰則',
            content: '第百八十五条　第二十九条の規定に違反した者は、五年以下の懲役若しくは五百万円以下の罰金に処し、又はこれを併科する。\n\n無登録で金融商品取引業（暗号資産デリバティブ取引業を含む）を行った場合、5年以下の懲役もしくは500万円以下の罰金（法人の場合は5億円以下の罰金）、またはこれらの併科に処せられる。海外事業者が日本居住者向けに無登録で営業を行う場合も同様に適用される。',
            contentEn: 'Article 185: A person who violates Article 29 (conducting Financial Instruments Business without registration) shall be punished by imprisonment of not more than 5 years, a fine of not more than JPY 5,000,000, or both. For corporations, the fine may be up to JPY 500,000,000.\n\nThis applies equally to overseas operators who conduct unregistered business targeting Japanese residents, including crypto asset derivative services.',
            chapter: '第八章 罰則',
            sortOrder: 9,
            tags: ['penalties', 'unregistered-business', 'imprisonment', 'fine', 'criminal'],
            appliesToBiz: ['exchange', 'token-issuer', 'fund-manager', 'defi-protocol'],
          },
          {
            articleNum: '第197条の2',
            articleTitle: '相場操縦の罰則',
            content: '第百九十七条の二　次の各号のいずれかに該当する者は、十年以下の懲役若しくは千万円以下の罰金に処し、又はこれを併科する。\n一　第百五十七条の規定に違反した者（不正行為）\n二　第百五十九条の規定に違反した者（相場操縦行為）\n三　第百六十条の規定に違反した者（安定操作取引の制限違反）\n\n暗号資産デリバティブ市場における相場操縦（ウォッシュトレード、スプーフィング、レイヤリング等）についても同条が適用され、10年以下の懲役もしくは1,000万円以下の罰金（法人は7億円以下）、またはこれらの併科に処せられる。',
            contentEn: 'Article 197-2: A person who falls under any of the following shall be punished by imprisonment of not more than 10 years, a fine of not more than JPY 10,000,000, or both: (i) violation of Article 157 (fraudulent acts); (ii) violation of Article 159 (market manipulation); (iii) violation of Article 160 (violation of restrictions on stabilization transactions).\n\nThis article applies to market manipulation in crypto asset derivative markets (wash trading, spoofing, layering, etc.), with penalties of up to 10 years imprisonment and/or JPY 10,000,000 fine (up to JPY 700,000,000 for corporations).',
            chapter: '第八章 罰則',
            sortOrder: 10,
            tags: ['penalties', 'market-manipulation', 'wash-trading', 'spoofing', 'criminal', 'imprisonment'],
            appliesToBiz: ['exchange'],
          },
        ],
      },
    },
  });

  console.log(`  ✓ ${jpFIEA.title} (${jpFIEA.titleEn}) — ${jpFIEA.totalArticles} articles archived`);

  // ═══════════════════════════════════════════════════════════
  // HONG KONG: Stablecoins Bill (2024)
  // Gazetted 6 December 2024, effective 1 June 2025 (expected)
  // ═══════════════════════════════════════════════════════════
  const hkStablecoin = await prisma.lawArchive.upsert({
    where: { jurisdiction_lawNumber: { jurisdiction: 'HK', lawNumber: 'HK-Stablecoins-Bill-2024' } },
    update: {},
    create: {
      jurisdiction: 'HK',
      lawType: 'bill',
      title: 'Stablecoins Bill',
      titleEn: 'Stablecoins Bill',
      shortName: 'HK Stablecoins Bill',
      lawNumber: 'HK-Stablecoins-Bill-2024',
      enactedDate: new Date('2024-12-06'),
      effectiveDate: new Date('2025-06-01'),
      status: 'enacted',
      regulator: 'HKMA',
      sourceUrl: 'https://www.hkma.gov.hk/eng/key-functions/banking/banking-regulatory-and-supervisory-regime/stablecoins/',
      totalArticles: 9,
      articles: {
        create: [
          {
            articleNum: 'Section 3',
            articleTitle: 'Definition of Fiat-Referenced Stablecoin (FRS)',
            content: 'A "fiat-referenced stablecoin" (FRS) is defined as a cryptographically secured digital representation of value that: (a) purports to maintain a stable value with reference to one or more specified fiat currencies; (b) is, or is intended to be, used as a medium of exchange, a unit of account, or a store of value; and (c) can be transferred, stored, or traded electronically. For the purposes of this Bill, a stablecoin pegged to a single fiat currency or a basket of fiat currencies is captured. Algorithmic stablecoins that maintain their peg through algorithmic mechanisms without full reserve backing are also in scope if they purport to reference fiat currencies.',
            contentEn: 'A "fiat-referenced stablecoin" (FRS) is defined as a cryptographically secured digital representation of value that: (a) purports to maintain a stable value with reference to one or more specified fiat currencies; (b) is, or is intended to be, used as a medium of exchange, a unit of account, or a store of value; and (c) can be transferred, stored, or traded electronically. For the purposes of this Bill, a stablecoin pegged to a single fiat currency or a basket of fiat currencies is captured. Algorithmic stablecoins that maintain their peg through algorithmic mechanisms without full reserve backing are also in scope if they purport to reference fiat currencies.',
            chapter: 'Part 1 — Preliminary',
            sortOrder: 1,
            tags: ['definition', 'frs', 'fiat-referenced-stablecoin', 'scope'],
            appliesToBiz: ['stablecoin-issuer'],
          },
          {
            articleNum: 'Section 5',
            articleTitle: 'Licensing Requirement',
            content: 'No person shall issue, or hold out as issuing, a fiat-referenced stablecoin in or from Hong Kong without a licence granted by the Hong Kong Monetary Authority (HKMA) under this Bill. The licensing requirement applies to: (a) any person who issues FRS in Hong Kong; (b) any person who issues FRS outside Hong Kong but markets or offers FRS to the public in Hong Kong; and (c) any person who purports to peg their stablecoin to the Hong Kong Dollar (HKD), regardless of where they are incorporated or operating. Applications for a licence must be made to the HKMA in the prescribed form and accompanied by the prescribed fee.',
            contentEn: 'No person shall issue, or hold out as issuing, a fiat-referenced stablecoin in or from Hong Kong without a licence granted by the Hong Kong Monetary Authority (HKMA) under this Bill. The licensing requirement applies to: (a) any person who issues FRS in Hong Kong; (b) any person who issues FRS outside Hong Kong but markets or offers FRS to the public in Hong Kong; and (c) any person who purports to peg their stablecoin to the Hong Kong Dollar (HKD), regardless of where they are incorporated or operating. Applications for a licence must be made to the HKMA in the prescribed form and accompanied by the prescribed fee.',
            chapter: 'Part 2 — Licensing',
            sortOrder: 2,
            tags: ['licensing', 'hkma', 'mandatory-licence', 'hkd-peg'],
            appliesToBiz: ['stablecoin-issuer'],
          },
          {
            articleNum: 'Section 7',
            articleTitle: 'Minimum Capital Requirements',
            content: 'A licensed FRS issuer must maintain at all times a minimum paid-up share capital of not less than: (a) HKD 25,000,000 (twenty-five million Hong Kong dollars); or (b) 1% of the face value of all outstanding FRS issued by the licensee, whichever is the higher amount. The HKMA may impose additional capital requirements on a case-by-case basis having regard to the scale, complexity, and risk profile of the issuer\'s operations. The capital must be maintained in readily available liquid assets and must not be encumbered.',
            contentEn: 'A licensed FRS issuer must maintain at all times a minimum paid-up share capital of not less than: (a) HKD 25,000,000 (twenty-five million Hong Kong dollars); or (b) 1% of the face value of all outstanding FRS issued by the licensee, whichever is the higher amount. The HKMA may impose additional capital requirements on a case-by-case basis having regard to the scale, complexity, and risk profile of the issuer\'s operations. The capital must be maintained in readily available liquid assets and must not be encumbered.',
            chapter: 'Part 3 — Prudential Requirements',
            sortOrder: 3,
            tags: ['minimum-capital', 'hkd-25m', 'prudential', 'capital-adequacy'],
            appliesToBiz: ['stablecoin-issuer'],
          },
          {
            articleNum: 'Section 9',
            articleTitle: 'Reserve Requirements',
            content: 'A licensed FRS issuer must maintain reserve assets at all times equal to at least 100% of the face value of all outstanding FRS. Reserve assets must consist solely of high-quality, highly liquid assets including: (a) cash deposits with authorized institutions (licensed banks) in Hong Kong; (b) debt securities issued by the Government of the Hong Kong SAR or the Exchange Fund; (c) debt securities issued by governments with a credit rating of AA- or above with residual maturity not exceeding 3 months. Reserve assets must be valued on a weekly basis. The issuer must submit weekly reserve reports to the HKMA. Any shortfall in reserve assets must be rectified within 2 business days.',
            contentEn: 'A licensed FRS issuer must maintain reserve assets at all times equal to at least 100% of the face value of all outstanding FRS. Reserve assets must consist solely of high-quality, highly liquid assets including: (a) cash deposits with authorized institutions (licensed banks) in Hong Kong; (b) debt securities issued by the Government of the Hong Kong SAR or the Exchange Fund; (c) debt securities issued by governments with a credit rating of AA- or above with residual maturity not exceeding 3 months. Reserve assets must be valued on a weekly basis. The issuer must submit weekly reserve reports to the HKMA. Any shortfall in reserve assets must be rectified within 2 business days.',
            chapter: 'Part 3 — Prudential Requirements',
            sortOrder: 4,
            tags: ['reserve', '100-percent-backing', 'hqla', 'weekly-reporting', 'government-securities'],
            appliesToBiz: ['stablecoin-issuer'],
          },
          {
            articleNum: 'Section 11',
            articleTitle: 'Redemption',
            content: 'A licensed FRS issuer must redeem the FRS at its face value (par value) in the referenced fiat currency upon request by the holder. Redemption must be completed within a reasonable period, which the HKMA expects to be no longer than the period specified in the terms and conditions of the FRS disclosed to the holder at the time of issuance. The issuer must not impose unreasonable conditions or fees on redemption. The redemption right must be clearly disclosed in the FRS whitepaper and terms and conditions. The issuer must have robust operational arrangements to handle redemptions, including during periods of heightened demand.',
            contentEn: 'A licensed FRS issuer must redeem the FRS at its face value (par value) in the referenced fiat currency upon request by the holder. Redemption must be completed within a reasonable period, which the HKMA expects to be no longer than the period specified in the terms and conditions of the FRS disclosed to the holder at the time of issuance. The issuer must not impose unreasonable conditions or fees on redemption. The redemption right must be clearly disclosed in the FRS whitepaper and terms and conditions. The issuer must have robust operational arrangements to handle redemptions, including during periods of heightened demand.',
            chapter: 'Part 4 — Holder Protection',
            sortOrder: 5,
            tags: ['redemption', 'par-value', 'holder-rights', 'reasonable-period'],
            appliesToBiz: ['stablecoin-issuer', 'exchange', 'wallet-provider'],
          },
          {
            articleNum: 'Section 13',
            articleTitle: 'Restrictions on Activities',
            content: 'A licensed FRS issuer is subject to the following restrictions: (a) the issuer must not lend, pledge, encumber, or otherwise deal with reserve assets for any purpose other than maintaining the reserve to back outstanding FRS; (b) the issuer must not pay or offer to pay any interest, yield, profit, or return to FRS holders, whether directly or indirectly; (c) reserve assets must not be re-hypothecated or used as collateral; (d) the issuer must not engage in any activity that could create a conflict of interest between the issuer and FRS holders; (e) the issuer must not commingle reserve assets with its own assets or with assets of any other person.',
            contentEn: 'A licensed FRS issuer is subject to the following restrictions: (a) the issuer must not lend, pledge, encumber, or otherwise deal with reserve assets for any purpose other than maintaining the reserve to back outstanding FRS; (b) the issuer must not pay or offer to pay any interest, yield, profit, or return to FRS holders, whether directly or indirectly; (c) reserve assets must not be re-hypothecated or used as collateral; (d) the issuer must not engage in any activity that could create a conflict of interest between the issuer and FRS holders; (e) the issuer must not commingle reserve assets with its own assets or with assets of any other person.',
            chapter: 'Part 4 — Holder Protection',
            sortOrder: 6,
            tags: ['restrictions', 'no-lending', 'no-interest', 'no-rehypothecation', 'no-commingling'],
            appliesToBiz: ['stablecoin-issuer', 'defi-protocol'],
          },
          {
            articleNum: 'Section 15',
            articleTitle: 'Audit and Disclosure',
            content: 'A licensed FRS issuer must: (a) appoint an independent auditor approved by the HKMA to conduct an annual audit of the issuer\'s financial statements and reserve management; (b) publish monthly reserve composition reports on its website, including the total face value of outstanding FRS, the total value of reserve assets, and a breakdown of reserve asset types and custodians; (c) publish an annual audited report on its reserve management; (d) maintain and publish a whitepaper containing material information about the FRS including stabilisation mechanism, reserve policy, redemption terms, governance structure, and risk factors; (e) notify the HKMA promptly of any material change in its business or financial condition.',
            contentEn: 'A licensed FRS issuer must: (a) appoint an independent auditor approved by the HKMA to conduct an annual audit of the issuer\'s financial statements and reserve management; (b) publish monthly reserve composition reports on its website, including the total face value of outstanding FRS, the total value of reserve assets, and a breakdown of reserve asset types and custodians; (c) publish an annual audited report on its reserve management; (d) maintain and publish a whitepaper containing material information about the FRS including stabilisation mechanism, reserve policy, redemption terms, governance structure, and risk factors; (e) notify the HKMA promptly of any material change in its business or financial condition.',
            chapter: 'Part 5 — Disclosure and Reporting',
            sortOrder: 7,
            tags: ['audit', 'disclosure', 'monthly-report', 'whitepaper', 'annual-audit', 'transparency'],
            appliesToBiz: ['stablecoin-issuer'],
          },
          {
            articleNum: 'Section 17',
            articleTitle: 'Cross-Border Provisions',
            content: 'An overseas issuer of FRS that is not licensed in Hong Kong is prohibited from: (a) actively marketing FRS to the public of Hong Kong; (b) issuing FRS that purport to be pegged to HKD; (c) listing or making available FRS on any platform operating in or from Hong Kong without the FRS issuer holding a licence under this Bill. Licensed virtual asset trading platforms (VATPs) in Hong Kong may only make available for trading FRS issued by licensed issuers or FRS issued by overseas issuers that are subject to comparable regulatory requirements in their home jurisdiction as determined by the HKMA. The HKMA may enter into cooperation arrangements with overseas regulators for the supervision of cross-border FRS activities.',
            contentEn: 'An overseas issuer of FRS that is not licensed in Hong Kong is prohibited from: (a) actively marketing FRS to the public of Hong Kong; (b) issuing FRS that purport to be pegged to HKD; (c) listing or making available FRS on any platform operating in or from Hong Kong without the FRS issuer holding a licence under this Bill. Licensed virtual asset trading platforms (VATPs) in Hong Kong may only make available for trading FRS issued by licensed issuers or FRS issued by overseas issuers that are subject to comparable regulatory requirements in their home jurisdiction as determined by the HKMA. The HKMA may enter into cooperation arrangements with overseas regulators for the supervision of cross-border FRS activities.',
            chapter: 'Part 6 — Cross-Border and Transitional',
            sortOrder: 8,
            tags: ['cross-border', 'overseas-issuer', 'hkd-peg-restriction', 'vatp', 'regulatory-cooperation'],
            appliesToBiz: ['stablecoin-issuer', 'exchange'],
          },
          {
            articleNum: 'Section 20',
            articleTitle: 'Enforcement Powers',
            content: 'The HKMA has the following enforcement powers under this Bill: (a) power to inspect the books, records, and accounts of licensed issuers; (b) power to give directions to licensed issuers, including directions to cease issuance of FRS, to wind down operations in an orderly manner, or to take remedial action; (c) power to revoke or suspend a licence; (d) power to apply to the Court of First Instance for injunctions and other orders. Penalties for offences under this Bill include: (i) issuing FRS without a licence — a fine of up to HKD 10,000,000 (ten million Hong Kong dollars) and imprisonment for up to 7 years; (ii) failure to maintain adequate reserves — a fine of up to HKD 5,000,000; (iii) false or misleading disclosure — a fine of up to HKD 10,000,000 and imprisonment for up to 7 years; (iv) obstruction of HKMA inspection — a fine of up to HKD 1,000,000.',
            contentEn: 'The HKMA has the following enforcement powers under this Bill: (a) power to inspect the books, records, and accounts of licensed issuers; (b) power to give directions to licensed issuers, including directions to cease issuance of FRS, to wind down operations in an orderly manner, or to take remedial action; (c) power to revoke or suspend a licence; (d) power to apply to the Court of First Instance for injunctions and other orders. Penalties for offences under this Bill include: (i) issuing FRS without a licence — a fine of up to HKD 10,000,000 (ten million Hong Kong dollars) and imprisonment for up to 7 years; (ii) failure to maintain adequate reserves — a fine of up to HKD 5,000,000; (iii) false or misleading disclosure — a fine of up to HKD 10,000,000 and imprisonment for up to 7 years; (iv) obstruction of HKMA inspection — a fine of up to HKD 1,000,000.',
            chapter: 'Part 7 — Enforcement',
            sortOrder: 9,
            tags: ['enforcement', 'penalties', 'hkd-10m-fine', '7-years-imprisonment', 'licence-revocation', 'inspection'],
            appliesToBiz: ['stablecoin-issuer'],
          },
        ],
      },
    },
  });

  console.log(`  ✓ ${hkStablecoin.title} — ${hkStablecoin.totalArticles} articles archived`);

  console.log('\n✅ Asia additional laws seeded');
}

main().catch(console.error).finally(() => prisma.$disconnect());
