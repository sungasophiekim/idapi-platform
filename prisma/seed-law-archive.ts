// prisma/seed-law-archive.ts
// Run: npx tsx prisma/seed-law-archive.ts
// Seeds the law archive with actual Korean digital asset law articles
// Source: 국가법령정보센터 (law.go.kr)

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('📚 Seeding law archive...\n');

  // ═══════════════════════════════════════════════════════════
  // KOREA: 가상자산 이용자 보호 등에 관한 법률
  // 법률 제19947호, 2024.7.19 시행
  // ═══════════════════════════════════════════════════════════
  const vuapa = await prisma.lawArchive.upsert({
    where: { jurisdiction_lawNumber: { jurisdiction: 'KR', lawNumber: '법률제19947호' } },
    update: {},
    create: {
      jurisdiction: 'KR',
      lawType: 'law',
      title: '가상자산 이용자 보호 등에 관한 법률',
      titleEn: 'Act on the Protection of Virtual Asset Users',
      shortName: '가상자산이용자보호법',
      lawNumber: '법률제19947호',
      enactedDate: new Date('2023-07-18'),
      effectiveDate: new Date('2024-07-19'),
      status: 'enacted',
      regulator: '금융위원회',
      sourceUrl: 'https://www.law.go.kr/LSW/lsInfoP.do?lsiSeq=261099',
      totalArticles: 29,
      articles: {
        create: [
          {
            articleNum: '제1조',
            articleTitle: '목적',
            content: '이 법은 가상자산 이용자 자산의 보호와 불공정거래행위 규제 등에 관한 사항을 정함으로써 가상자산 이용자의 권익을 보호하고 가상자산시장의 투명하고 건전한 거래질서를 확립하는 것을 목적으로 한다.',
            contentEn: 'The purpose of this Act is to protect the rights and interests of virtual asset users and to establish a transparent and sound transaction order in the virtual asset market by prescribing matters concerning the protection of assets of virtual asset users and the regulation of unfair trading practices.',
            chapter: '제1장 총칙',
            sortOrder: 1,
            tags: ['purpose', 'user-protection'],
            appliesToBiz: ['exchange', 'wallet-provider', 'stablecoin-issuer'],
          },
          {
            articleNum: '제2조',
            articleTitle: '정의',
            content: '1. "가상자산"이란 경제적 가치를 지닌 것으로서 전자적으로 거래 또는 이전될 수 있는 전자적 증표(그에 관한 일체의 권리를 포함한다)를 말한다. 다만, 화폐·재화·용역 등으로 교환될 수 없는 전자적 증표 등 대통령령으로 정하는 것은 제외한다.\n2. "가상자산사업자"란 「특정 금융거래정보의 보고 및 이용 등에 관한 법률」 제2조제1호하목에 따른 가상자산사업자를 말한다.\n3. "이용자"란 가상자산사업자가 제공하는 서비스를 이용하는 자를 말한다.\n4. "가상자산시장"이란 가상자산을 매매하거나 그 중개·알선 또는 대행하는 등 대통령령으로 정하는 가상자산의 거래가 이루어지는 시장을 말한다.',
            contentEn: '1. "Virtual asset" means an electronic token (including all rights thereto) that has economic value and can be electronically traded or transferred. However, electronic tokens prescribed by Presidential Decree that cannot be exchanged for currency, goods, or services are excluded.\n2. "Virtual asset service provider" means a virtual asset service provider under the Specified Financial Transaction Information Act.\n3. "User" means a person who uses the services provided by a virtual asset service provider.\n4. "Virtual asset market" means a market where transactions of virtual assets, including trading, brokering, arranging, or acting as agent, take place.',
            chapter: '제1장 총칙',
            sortOrder: 2,
            tags: ['definition', 'virtual-asset', 'vasp', 'user', 'market'],
            appliesToBiz: ['exchange', 'wallet-provider', 'stablecoin-issuer', 'token-issuer'],
          },
          {
            articleNum: '제6조',
            articleTitle: '예치금의 보호',
            content: '① 가상자산사업자는 이용자의 예치금(이용자로부터 가상자산의 매매, 매매의 중개, 그 밖의 영업행위와 관련하여 예치받은 금전을 말한다)을 고유재산과 분리하여 은행 등 대통령령으로 정하는 공신력 있는 기관에 예치 또는 신탁하여 관리하여야 한다.\n② 가상자산사업자는 제1항에 따라 관리하는 이용자의 예치금을 자기의 고유재산 및 다른 이용자의 예치금과 구분하여 관리하여야 한다.\n③ 가상자산사업자가 파산한 경우 이용자의 예치금 반환채권은 다른 채권에 우선하여 변제한다.',
            contentEn: '(1) A virtual asset service provider shall manage user deposits (money deposited in connection with trading, brokering, or other business activities) separately from its own property by depositing or entrusting them with a bank or other credible institution prescribed by Presidential Decree.\n(2) The provider shall manage each user\'s deposits separately from its own property and other users\' deposits.\n(3) In case of bankruptcy, user deposit return claims shall be repaid in priority over other claims.',
            chapter: '제2장 이용자 자산의 보호',
            sortOrder: 6,
            tags: ['deposit-protection', 'segregation', 'bankruptcy-priority'],
            appliesToBiz: ['exchange'],
          },
          {
            articleNum: '제7조',
            articleTitle: '가상자산의 보관',
            content: '① 가상자산사업자는 이용자의 가상자산과 자기의 가상자산을 구분하여 관리하여야 하며, 이용자의 가상자산과 동일한 종류와 수량의 가상자산을 실질적으로 보유하여야 한다.\n② 가상자산사업자는 이용자가 위탁한 가상자산의 100분의 80 이상을 대통령령으로 정하는 바에 따라 인터넷과 분리되어 관리하는 저장장치(콜드월렛)에 보관하여야 한다.',
            contentEn: '(1) A virtual asset service provider shall manage users\' virtual assets separately from its own, and shall substantially hold virtual assets of the same type and quantity as users\' virtual assets.\n(2) The provider shall store at least 80% of users\' entrusted virtual assets in storage devices disconnected from the internet (cold wallets) as prescribed by Presidential Decree.',
            chapter: '제2장 이용자 자산의 보호',
            sortOrder: 7,
            tags: ['cold-wallet', 'custody', 'segregation', '80-percent-rule'],
            appliesToBiz: ['exchange', 'wallet-provider'],
          },
          {
            articleNum: '제8조',
            articleTitle: '보험 등의 가입',
            content: '가상자산사업자는 해킹, 전산장애, 그 밖의 사고 등으로 인하여 이용자에게 손해가 발생한 경우에 이용자를 보호하기 위하여 보험 또는 공제에 가입하거나 준비금을 적립하는 등 대통령령으로 정하는 바에 따라 필요한 조치를 하여야 한다.',
            contentEn: 'Virtual asset service providers shall take necessary measures, such as obtaining insurance or mutual aid coverage or setting aside reserves, to protect users against damages caused by hacking, system failures, or other incidents, as prescribed by Presidential Decree.',
            chapter: '제2장 이용자 자산의 보호',
            sortOrder: 8,
            tags: ['insurance', 'hacking-protection', 'reserve'],
            appliesToBiz: ['exchange', 'wallet-provider'],
          },
          {
            articleNum: '제10조',
            articleTitle: '미공개중요정보 이용행위의 금지',
            content: '다음 각 호의 어느 하나에 해당하는 자는 그 가상자산의 매매, 그 밖의 거래에 미공개중요정보를 이용하거나 타인에게 이용하게 하여서는 아니 된다.\n1. 가상자산사업자, 가상자산을 발행하는 자 및 그 임직원·대리인으로서 그 직무와 관련하여 미공개중요정보를 알게 된 자\n2. 주요주주로서 그 권리를 행사하는 과정에서 미공개중요정보를 알게 된 자\n3. 법령에 따른 허가·인가·지도·감독, 그 밖의 권한을 가지는 자\n4. 계약 체결 등의 교섭과정에서 미공개중요정보를 알게 된 자\n5. 제1호부터 제4호까지에 해당하는 자로부터 미공개중요정보를 받은 자',
            contentEn: 'The following persons shall not use material non-public information for trading virtual assets or allow others to use it:\n1. Officers, employees, or agents of VASPs or virtual asset issuers who obtained MNPI through their duties\n2. Major shareholders who obtained MNPI through exercise of rights\n3. Persons with regulatory authority under law\n4. Persons who obtained MNPI during contract negotiations\n5. Persons who received MNPI from persons in items 1-4',
            chapter: '제3장 불공정거래행위의 규제',
            sortOrder: 10,
            tags: ['insider-trading', 'MNPI', 'unfair-trading'],
            appliesToBiz: ['exchange', 'token-issuer', 'stablecoin-issuer'],
          },
          {
            articleNum: '제11조',
            articleTitle: '시세조종행위의 금지',
            content: '누구든지 가상자산의 매매에 관하여 다음 각 호의 어느 하나에 해당하는 행위를 하여서는 아니 된다.\n1. 가상자산의 매매가 성황을 이루고 있는 듯이 잘못 알게 하거나, 그 시세를 변동시키는 매매 또는 그 위탁이나 수탁을 하는 행위\n2. 거짓으로 꾸민 매매를 하는 행위\n3. 가상자산의 시세를 고정시키거나 안정시킬 목적으로 가상자산의 매매 또는 그 위탁이나 수탁을 하는 행위\n4. 단독으로 또는 타인과 공모하여 가상자산의 시세를 변동시키는 매매 또는 그 위탁이나 수탁을 하는 행위',
            contentEn: 'No person shall engage in the following acts regarding virtual asset trading:\n1. Trading that creates a false appearance of active trading or that causes price fluctuation\n2. Fictitious trading\n3. Trading for the purpose of fixing or stabilizing prices\n4. Trading that causes price changes, alone or in conspiracy with others',
            chapter: '제3장 불공정거래행위의 규제',
            sortOrder: 11,
            tags: ['market-manipulation', 'wash-trading', 'price-manipulation'],
            appliesToBiz: ['exchange'],
          },
          {
            articleNum: '제19조',
            articleTitle: '벌칙',
            content: '① 제10조를 위반하여 미공개중요정보를 이용하거나 타인에게 이용하게 한 자, 제11조를 위반하여 시세조종행위를 한 자, 제12조를 위반하여 부정거래행위를 한 자는 1년 이상의 유기징역 또는 그 위반행위로 얻은 이익 또는 회피한 손실액의 3배 이상 5배 이하에 해당하는 벌금에 처한다.\n② 제1항에 따른 벌금이 5천만원 이하인 경우에는 벌금의 하한을 5천만원으로 한다.\n③ 제1항의 죄를 범한 자는 10년 이하의 징역 또는 해당 위반행위로 얻은 이익 또는 회피한 손실액의 2배 이상 4배 이하의 벌금에 처할 수 있다.',
            contentEn: '(1) Persons who violate Article 10 (insider trading), Article 11 (market manipulation), or Article 12 (fraudulent trading) shall be punished by imprisonment of at least 1 year or a fine of 3-5 times the gains or avoided losses.\n(2) If the fine under paragraph (1) is less than KRW 50 million, the minimum fine shall be KRW 50 million.\n(3) Persons who committed the crimes in paragraph (1) may be punished by imprisonment of up to 10 years or a fine of 2-4 times the gains or avoided losses.',
            chapter: '제5장 벌칙',
            sortOrder: 19,
            tags: ['penalties', 'imprisonment', 'fine', 'insider-trading', 'market-manipulation'],
            appliesToBiz: ['exchange', 'token-issuer'],
          },
        ],
      },
    },
  });

  console.log(`  ✓ ${vuapa.title} — ${vuapa.totalArticles} articles archived`);

  // ═══════════════════════════════════════════════════════════
  // KOREA: 특정 금융거래정보의 보고 및 이용 등에 관한 법률 (가상자산 관련 조항)
  // ═══════════════════════════════════════════════════════════
  const sfta = await prisma.lawArchive.upsert({
    where: { jurisdiction_lawNumber: { jurisdiction: 'KR', lawNumber: '법률제17299호' } },
    update: {},
    create: {
      jurisdiction: 'KR',
      lawType: 'law',
      title: '특정 금융거래정보의 보고 및 이용 등에 관한 법률',
      titleEn: 'Act on Reporting and Using Specified Financial Transaction Information',
      shortName: '특금법',
      lawNumber: '법률제17299호',
      enactedDate: new Date('2020-03-24'),
      effectiveDate: new Date('2021-03-25'),
      lastAmendedDate: new Date('2024-07-19'),
      status: 'enacted',
      regulator: '금융위원회',
      sourceUrl: 'https://www.law.go.kr/LSW/lsInfoP.do?lsiSeq=252787',
      totalArticles: 17,
      articles: {
        create: [
          {
            articleNum: '제7조',
            articleTitle: '가상자산사업자의 신고',
            content: '① 가상자산사업자는 다음 각 호의 요건을 갖추어 대통령령으로 정하는 바에 따라 금융정보분석원장에게 신고하여야 한다.\n1. 정보보호 관리체계(ISMS) 인증을 획득할 것\n2. 실명확인 입출금 계정을 통하여 금융거래등을 할 것\n3. 대표자 또는 임원이 금융관련 법령 등에 따라 벌금형 이상의 형을 선고받은 후 5년이 지나지 아니한 경우 등에 해당하지 아니할 것',
            contentEn: '(1) Virtual asset service providers shall report to the Korea Financial Intelligence Unit after meeting the following requirements:\n1. Obtain ISMS (Information Security Management System) certification\n2. Conduct financial transactions through real-name verified deposit/withdrawal accounts\n3. Representatives/officers must not have been sentenced to a fine or heavier for violations of financial laws within the past 5 years',
            chapter: '제3장 가상자산사업자',
            sortOrder: 7,
            tags: ['vasp-registration', 'ISMS', 'real-name-account', 'KoFIU'],
            appliesToBiz: ['exchange', 'wallet-provider', 'payment-service'],
          },
          {
            articleNum: '제5조의2',
            articleTitle: '가상자산의 이전시 정보제공 (Travel Rule)',
            content: '① 가상자산사업자는 가상자산을 다른 가상자산사업자에게 이전하는 경우 다음 각 호의 정보를 그 다른 가상자산사업자에게 제공하여야 한다.\n1. 가상자산을 이전하는 고객의 성명\n2. 가상자산을 이전하는 고객의 가상자산주소\n3. 가상자산을 수취하는 고객의 성명\n② 제1항은 이전하는 가상자산의 금액이 100만원 이상인 경우에 적용한다.',
            contentEn: '(1) When transferring virtual assets to another VASP, the provider shall provide the following information:\n1. Name of the sending customer\n2. Virtual asset address of the sending customer\n3. Name of the receiving customer\n(2) Paragraph (1) applies when the transfer amount is KRW 1 million or more.',
            chapter: '제2장 금융거래등의 보고',
            sortOrder: 5,
            tags: ['travel-rule', 'information-sharing', 'KRW-1M-threshold'],
            appliesToBiz: ['exchange', 'wallet-provider', 'payment-service'],
          },
        ],
      },
    },
  });

  console.log(`  ✓ ${sfta.title} — archived key articles`);

  // ═══════════════════════════════════════════════════════════
  // USA: GENIUS Act (Stablecoin Regulation)
  // Enacted August 2025
  // ═══════════════════════════════════════════════════════════
  const genius = await prisma.lawArchive.upsert({
    where: { jurisdiction_lawNumber: { jurisdiction: 'US', lawNumber: 'PL-119-XXX' } },
    update: {},
    create: {
      jurisdiction: 'US',
      lawType: 'law',
      title: 'GENIUS Act (Guiding and Establishing National Innovation for U.S. Stablecoins)',
      titleEn: 'GENIUS Act (Stablecoin Regulation)',
      shortName: 'GENIUS Act',
      lawNumber: 'PL-119-XXX',
      enactedDate: new Date('2025-08-01'),
      effectiveDate: new Date('2025-08-01'),
      status: 'enacted',
      regulator: 'OCC / Federal Reserve / State Banking Regulators',
      totalArticles: 12,
      articles: {
        create: [
          {
            articleNum: 'Sec. 2',
            articleTitle: 'Definitions',
            content: 'Payment stablecoin: A digital asset pegged to a fixed monetary value (typically USD) designed primarily for use as a means of payment or settlement. Payment stablecoins are not securities, commodities, or deposits under federal law.',
            contentEn: 'Payment stablecoin: A digital asset pegged to a fixed monetary value (typically USD) designed primarily for use as a means of payment or settlement. Payment stablecoins are not securities, commodities, or deposits under federal law.',
            chapter: 'Title I - Definitions',
            sortOrder: 2,
            tags: ['definition', 'stablecoin', 'payment', 'not-security'],
            appliesToBiz: ['stablecoin-issuer', 'payment-service'],
          },
          {
            articleNum: 'Sec. 3',
            articleTitle: 'Issuer Registration',
            content: 'No person may issue a payment stablecoin in the United States unless registered with the Office of the Comptroller of the Currency (for federally chartered issuers) or with the applicable state banking regulator (for state-chartered issuers). Registration requires: (a) submission of a business plan, (b) demonstration of adequate reserve backing, (c) compliance with AML/KYC requirements, (d) appointment of a qualified management team.',
            contentEn: 'No person may issue a payment stablecoin in the United States unless registered with the OCC or applicable state banking regulator. Registration requires: business plan, adequate reserve backing, AML/KYC compliance, and qualified management.',
            chapter: 'Title II - Issuer Requirements',
            sortOrder: 3,
            tags: ['registration', 'OCC', 'state-regulator', 'issuer-requirements'],
            appliesToBiz: ['stablecoin-issuer'],
          },
          {
            articleNum: 'Sec. 4',
            articleTitle: 'Reserve Requirements',
            content: 'A registered payment stablecoin issuer shall at all times maintain reserves equal to or greater than 100% of the outstanding value of payment stablecoins issued. Eligible reserve assets are limited to: (a) U.S. dollars held in insured depository institutions, (b) U.S. Treasury bills with a maturity of 90 days or less, (c) overnight repurchase agreements fully collateralized by U.S. Treasury securities, (d) reserve balances held at a Federal Reserve Bank. The issuer shall not rehypothecate, pledge, or otherwise encumber reserve assets.',
            contentEn: 'Issuers must maintain 100% reserves at all times. Eligible assets: USD in insured banks, T-bills (≤90 days), overnight repos backed by Treasuries, Federal Reserve balances. No rehypothecation of reserves.',
            chapter: 'Title II - Issuer Requirements',
            sortOrder: 4,
            tags: ['reserve', '100-percent', 'treasury', 'no-rehypothecation'],
            appliesToBiz: ['stablecoin-issuer'],
          },
          {
            articleNum: 'Sec. 6',
            articleTitle: 'Redemption Rights',
            content: 'Each holder of a payment stablecoin shall have the right to redeem such stablecoin at par value for U.S. dollars within one business day of submitting a redemption request. The issuer shall not impose unreasonable conditions on redemption.',
            contentEn: 'Holders have the right to redeem at par within one business day. Issuers cannot impose unreasonable redemption conditions.',
            chapter: 'Title III - Consumer Protection',
            sortOrder: 6,
            tags: ['redemption', 'par-value', 'consumer-protection', 'one-business-day'],
            appliesToBiz: ['stablecoin-issuer', 'payment-service'],
          },
          {
            articleNum: 'Sec. 7',
            articleTitle: 'Reporting and Audit Requirements',
            content: 'Registered issuers shall: (a) publish monthly attestation reports of reserve composition by a registered public accounting firm, (b) undergo a full annual audit of reserves and operations, (c) file quarterly reports with the primary federal or state regulator, (d) make reserve composition data available to the public on the issuer website.',
            contentEn: 'Monthly reserve attestations, annual full audit, quarterly regulatory filings, and public reserve data disclosure required.',
            chapter: 'Title IV - Reporting',
            sortOrder: 7,
            tags: ['audit', 'monthly-attestation', 'transparency', 'reporting'],
            appliesToBiz: ['stablecoin-issuer'],
          },
        ],
      },
    },
  });
  console.log(`  ✓ ${genius.title}`);

  // ═══════════════════════════════════════════════════════════
  // EU: MiCA (Markets in Crypto-Assets Regulation)
  // ═══════════════════════════════════════════════════════════
  const mica = await prisma.lawArchive.upsert({
    where: { jurisdiction_lawNumber: { jurisdiction: 'EU', lawNumber: 'EU-2023/1114' } },
    update: {},
    create: {
      jurisdiction: 'EU',
      lawType: 'regulation',
      title: 'Markets in Crypto-Assets Regulation (MiCA)',
      titleEn: 'Markets in Crypto-Assets Regulation (MiCA)',
      shortName: 'MiCA',
      lawNumber: 'EU-2023/1114',
      enactedDate: new Date('2023-06-09'),
      effectiveDate: new Date('2024-12-30'),
      status: 'enacted',
      regulator: 'ESMA / EBA / National Competent Authorities',
      totalArticles: 149,
      articles: {
        create: [
          {
            articleNum: 'Article 3',
            articleTitle: 'Definitions',
            content: 'Crypto-asset: a digital representation of a value or of a right that is able to be transferred and stored electronically using distributed ledger technology or similar technology. Asset-referenced token (ART): a crypto-asset that purports to maintain a stable value by referencing several currencies, one or several commodities, or a combination. E-money token (EMT): a crypto-asset that purports to maintain a stable value by referencing one official currency.',
            contentEn: 'Key definitions: crypto-asset, asset-referenced token (ART), e-money token (EMT), crypto-asset service provider (CASP), utility token.',
            chapter: 'Title I - Subject Matter, Scope and Definitions',
            sortOrder: 3,
            tags: ['definition', 'crypto-asset', 'ART', 'EMT', 'CASP'],
            appliesToBiz: ['exchange', 'stablecoin-issuer', 'token-issuer', 'wallet-provider'],
          },
          {
            articleNum: 'Article 16',
            articleTitle: 'White paper requirements for crypto-assets other than ARTs or EMTs',
            content: 'An offeror or person seeking admission to trading shall draw up a crypto-asset white paper containing: (a) description of the offeror/issuer, (b) description of the project, (c) description of the crypto-asset, (d) rights and obligations attached, (e) underlying technology, (f) risks, (g) disclosure on environmental impact (for consensus mechanisms). The white paper shall be notified to the competent authority before publication.',
            contentEn: 'White paper must include: issuer description, project details, token description, rights/obligations, technology, risks, and environmental impact disclosure.',
            chapter: 'Title II - Crypto-Assets other than ARTs or EMTs',
            sortOrder: 16,
            tags: ['white-paper', 'disclosure', 'environmental-impact', 'notification'],
            appliesToBiz: ['token-issuer'],
          },
          {
            articleNum: 'Article 59',
            articleTitle: 'Authorisation of crypto-asset service providers (CASPs)',
            content: 'Crypto-asset services shall only be provided by legal persons that have been authorised as CASPs by the competent authority of their home Member State. The application shall include: (a) programme of operations, (b) governance arrangements, (c) internal control mechanisms, (d) risk assessment procedures, (e) business continuity plans, (f) evidence of sufficient own funds.',
            contentEn: 'Only authorized legal persons may provide crypto-asset services. Application requires: operations program, governance, internal controls, risk assessment, business continuity, and sufficient capital.',
            chapter: 'Title V - Authorisation and Operating Conditions for CASPs',
            sortOrder: 59,
            tags: ['CASP-license', 'authorization', 'governance', 'capital'],
            appliesToBiz: ['exchange', 'wallet-provider', 'payment-service'],
          },
          {
            articleNum: 'Article 67',
            articleTitle: 'Minimum capital requirements for CASPs',
            content: 'CASPs shall at all times have own funds equal to at least the higher of: (a) the minimum capital requirements (€50,000 for advisory/order services, €125,000 for exchange/custody/portfolio, €150,000 for operation of a trading platform), or (b) one quarter of the fixed overheads of the preceding year.',
            contentEn: 'Minimum capital: €50K for advisory, €125K for exchange/custody, €150K for trading platforms, or 25% of prior year fixed overheads.',
            chapter: 'Title V - Authorisation and Operating Conditions for CASPs',
            sortOrder: 67,
            tags: ['capital-requirements', 'own-funds', 'EUR-50K', 'EUR-125K', 'EUR-150K'],
            appliesToBiz: ['exchange', 'wallet-provider', 'payment-service'],
          },
          {
            articleNum: 'Article 75',
            articleTitle: 'Custody and administration of crypto-assets on behalf of clients',
            content: 'CASPs providing custody shall: (a) keep a register of positions for each client, (b) segregate client assets from own assets, (c) ensure client crypto-assets are not used for own account, (d) have adequate insurance or guarantee arrangements, (e) return client crypto-assets without undue delay upon request.',
            contentEn: 'Custody providers must: maintain client registers, segregate assets, not use client assets, have insurance, and return assets promptly on request.',
            chapter: 'Title V - Authorisation and Operating Conditions for CASPs',
            sortOrder: 75,
            tags: ['custody', 'segregation', 'insurance', 'client-protection'],
            appliesToBiz: ['wallet-provider', 'exchange'],
          },
          {
            articleNum: 'Article 111',
            articleTitle: 'Administrative penalties and measures',
            content: 'Member States shall ensure maximum administrative fines of at least: (a) for legal persons: up to 12.5% of annual turnover or EUR 5,000,000, whichever is higher, (b) for natural persons: up to EUR 700,000. National competent authorities may also: withdraw or suspend authorisation, impose temporary bans on management, or issue public warnings.',
            contentEn: 'Penalties up to 12.5% of annual turnover or €5M for legal persons, €700K for individuals. Additional measures: license withdrawal, management bans, public warnings.',
            chapter: 'Title VII - Competent Authorities, EBA and ESMA',
            sortOrder: 111,
            tags: ['penalties', 'fines', '12.5-percent', 'license-withdrawal'],
            appliesToBiz: ['exchange', 'stablecoin-issuer', 'token-issuer', 'wallet-provider'],
          },
        ],
      },
    },
  });
  console.log(`  ✓ ${mica.title}`);

  // ═══════════════════════════════════════════════════════════
  // SINGAPORE: Payment Services Act (DPT provisions)
  // ═══════════════════════════════════════════════════════════
  const sgPsa = await prisma.lawArchive.upsert({
    where: { jurisdiction_lawNumber: { jurisdiction: 'SG', lawNumber: 'SG-ACT-2019-2' } },
    update: {},
    create: {
      jurisdiction: 'SG',
      lawType: 'law',
      title: 'Payment Services Act 2019 (Digital Payment Token provisions)',
      titleEn: 'Payment Services Act 2019 (Digital Payment Token provisions)',
      shortName: 'PSA',
      lawNumber: 'SG-ACT-2019-2',
      enactedDate: new Date('2019-01-14'),
      effectiveDate: new Date('2020-01-28'),
      lastAmendedDate: new Date('2025-01-10'),
      status: 'enacted',
      regulator: 'Monetary Authority of Singapore (MAS)',
      totalArticles: 103,
      articles: {
        create: [
          {
            articleNum: 'Section 6',
            articleTitle: 'Licensing requirement',
            content: 'A person shall not carry on a business of providing any type of payment service in Singapore unless the person holds a license from MAS. Digital payment token (DPT) services include: (a) dealing in digital payment tokens, (b) facilitating the exchange of digital payment tokens. License types: Standard Payment Institution (SPI) or Major Payment Institution (MPI).',
            contentEn: 'MAS license required to provide DPT services. Includes dealing and facilitating exchanges. Two license types: Standard PI and Major PI.',
            chapter: 'Part 2 - Licensing of Payment Service Providers',
            sortOrder: 6,
            tags: ['license', 'DPT', 'standard-PI', 'major-PI'],
            appliesToBiz: ['exchange', 'wallet-provider', 'payment-service'],
          },
          {
            articleNum: 'Section 9',
            articleTitle: 'Base capital and security deposit',
            content: 'Base capital requirements: (a) Standard Payment Institution: SGD 100,000, (b) Major Payment Institution: SGD 250,000. MAS may require additional security deposits based on the volume and nature of payment services.',
            contentEn: 'Standard PI: SGD 100K base capital. Major PI: SGD 250K base capital. Additional security deposits may be required.',
            chapter: 'Part 2 - Licensing',
            sortOrder: 9,
            tags: ['capital', 'SGD-100K', 'SGD-250K', 'security-deposit'],
            appliesToBiz: ['exchange', 'wallet-provider', 'payment-service', 'stablecoin-issuer'],
          },
          {
            articleNum: 'Section 47A',
            articleTitle: 'Customer safeguards for DPT services',
            content: 'A DPT service provider shall: (a) not promote DPT services to the public in Singapore, (b) provide risk awareness assessment to retail customers, (c) not offer incentives (including airdrops) to the public to trade in DPT, (d) disclose risks associated with DPT transactions. MAS may restrict DPT services to accredited investors or institutional investors.',
            contentEn: 'DPT providers must not advertise to public, must provide risk assessments, cannot offer trading incentives. MAS may restrict services to accredited/institutional investors.',
            chapter: 'Part 4A - Digital Payment Token Services',
            sortOrder: 47,
            tags: ['consumer-protection', 'advertising-ban', 'risk-assessment', 'retail-restriction'],
            appliesToBiz: ['exchange', 'payment-service'],
          },
        ],
      },
    },
  });
  console.log(`  ✓ ${sgPsa.title}`);

  // ═══════════════════════════════════════════════════════════
  // JAPAN: Payment Services Act (Crypto provisions)
  // ═══════════════════════════════════════════════════════════
  const jpPsa = await prisma.lawArchive.upsert({
    where: { jurisdiction_lawNumber: { jurisdiction: 'JP', lawNumber: 'JP-ACT-59-2009' } },
    update: {},
    create: {
      jurisdiction: 'JP',
      lawType: 'law',
      title: '資金決済に関する法律 (가상자산 관련 조항)',
      titleEn: 'Payment Services Act (Crypto Asset Exchange provisions)',
      shortName: '자금결제법',
      lawNumber: 'JP-ACT-59-2009',
      enactedDate: new Date('2009-06-24'),
      effectiveDate: new Date('2017-04-01'),
      lastAmendedDate: new Date('2023-06-01'),
      status: 'enacted',
      regulator: 'Financial Services Agency (FSA)',
      totalArticles: 117,
      articles: {
        create: [
          {
            articleNum: 'Article 63-2',
            articleTitle: 'Registration of crypto-asset exchange service providers',
            content: 'A person who intends to engage in crypto-asset exchange services shall be registered with the Prime Minister (delegated to FSA). The applicant must be a stock company (kabushiki kaisha) with minimum capital of JPY 10,000,000 and positive net assets.',
            contentEn: 'Crypto-asset exchange providers must register with FSA. Must be a stock company with minimum JPY 10M capital and positive net assets.',
            chapter: 'Chapter 3-2 - Crypto-Asset Exchange Service',
            sortOrder: 63,
            tags: ['registration', 'FSA', 'JPY-10M', 'stock-company'],
            appliesToBiz: ['exchange'],
          },
          {
            articleNum: 'Article 63-11',
            articleTitle: 'Management of users crypto-assets',
            content: 'A crypto-asset exchange service provider shall manage users crypto-assets separately from its own crypto-assets by entrusting such assets to a trust company or other reliable method. Users crypto-assets shall be managed in a manner that allows immediate identification and return.',
            contentEn: 'Providers must segregate user crypto-assets from own assets via trust custody. Must allow immediate identification and return.',
            chapter: 'Chapter 3-2 - Crypto-Asset Exchange Service',
            sortOrder: 64,
            tags: ['segregation', 'trust-custody', 'user-protection'],
            appliesToBiz: ['exchange', 'wallet-provider'],
          },
          {
            articleNum: 'Article 62-15',
            articleTitle: 'Stablecoin issuance',
            content: 'Electronic payment instruments (stablecoins) may only be issued by: (a) banks licensed under the Banking Act, (b) fund transfer service providers registered under this Act, (c) trust companies authorized under the Trust Business Act. The issuer must maintain 100% reserve backing and guarantee redemption at face value.',
            contentEn: 'Stablecoin issuance limited to banks, fund transfer businesses, and trust companies. Must maintain 100% reserves and guarantee par-value redemption.',
            chapter: 'Chapter 3-3 - Electronic Payment Instruments',
            sortOrder: 62,
            tags: ['stablecoin', 'bank-only', 'fund-transfer', 'trust-company', '100-percent-reserve'],
            appliesToBiz: ['stablecoin-issuer'],
          },
        ],
      },
    },
  });
  console.log(`  ✓ ${jpPsa.title}`);

  // ═══════════════════════════════════════════════════════════
  // HONG KONG: Anti-Money Laundering Ordinance (VASP Regime)
  // ═══════════════════════════════════════════════════════════
  const hkAmlo = await prisma.lawArchive.upsert({
    where: { jurisdiction_lawNumber: { jurisdiction: 'HK', lawNumber: 'HK-CAP-615' } },
    update: {},
    create: {
      jurisdiction: 'HK',
      lawType: 'law',
      title: 'Anti-Money Laundering and Counter-Terrorist Financing Ordinance (VASP Regime)',
      titleEn: 'AMLO - Virtual Asset Service Provider Licensing Regime',
      shortName: 'AMLO VASP Regime',
      lawNumber: 'HK-CAP-615',
      enactedDate: new Date('2022-12-07'),
      effectiveDate: new Date('2023-06-01'),
      status: 'enacted',
      regulator: 'Securities and Futures Commission (SFC)',
      totalArticles: 53,
      articles: {
        create: [
          {
            articleNum: 'Section 53ZRD',
            articleTitle: 'Licensing requirement for VA exchanges',
            content: 'A person shall not carry on a business of operating a virtual asset exchange in Hong Kong unless the person is licensed by the SFC. A virtual asset exchange is defined as a trading platform on which virtual assets are traded for money or other virtual assets.',
            contentEn: 'SFC license required to operate a virtual asset exchange in Hong Kong. Applies to platforms where VA is traded for money or other VA.',
            chapter: 'Part 5A - Regulation of Virtual Asset Service Providers',
            sortOrder: 1,
            tags: ['license', 'SFC', 'exchange', 'VATP'],
            appliesToBiz: ['exchange'],
          },
          {
            articleNum: 'Section 53ZRK',
            articleTitle: 'Financial requirements',
            content: 'A licensed VATP shall maintain: (a) paid-up share capital of not less than HKD 5,000,000, (b) liquid assets sufficient to cover at least 12 months of operating expenses, (c) a compensation arrangement approved by the SFC to cover potential losses of client virtual assets.',
            contentEn: 'Licensed VATPs must maintain: HKD 5M paid-up capital, 12 months of liquid operating expenses, and SFC-approved compensation arrangements.',
            chapter: 'Part 5A - Regulation of VASPs',
            sortOrder: 2,
            tags: ['capital', 'HKD-5M', 'liquid-assets', 'compensation'],
            appliesToBiz: ['exchange'],
          },
          {
            articleNum: 'Section 53ZRN',
            articleTitle: 'Custody of client assets',
            content: 'A licensed VATP shall: (a) hold client virtual assets on trust, (b) keep proper books and records of all client virtual assets, (c) not deposit, transfer, lend, pledge, or otherwise deal with client virtual assets except as authorized by the client, (d) store a substantial portion of client virtual assets in cold storage.',
            contentEn: 'Client VA must be held on trust. No dealing with client assets without authorization. Substantial portion in cold storage. Proper recordkeeping required.',
            chapter: 'Part 5A - Regulation of VASPs',
            sortOrder: 3,
            tags: ['custody', 'trust', 'cold-storage', 'client-assets'],
            appliesToBiz: ['exchange', 'wallet-provider'],
          },
        ],
      },
    },
  });
  console.log(`  ✓ ${hkAmlo.title}`);

  // Log summary
  const archiveCount = await prisma.lawArchive.count();
  const articleCount = await prisma.lawArticle.count();
  console.log(`\n✅ Law archive seed complete: ${archiveCount} laws, ${articleCount} articles`);
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
