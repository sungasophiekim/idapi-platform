// prisma/seed-law-archive-kr2.ts
// Run: npx tsx prisma/seed-law-archive-kr2.ts
// Seeds additional Korean digital asset laws (시행령, 과세, 자본시장법)

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log('📚 Seeding KR additional laws...');

  // ═══════════════════════════════════════════════════════════
  // 1. 가상자산 이용자 보호 등에 관한 법률 시행령
  //    대통령령 제34819호, 2024.7.19 시행
  // ═══════════════════════════════════════════════════════════
  const vuapaDecree = await prisma.lawArchive.upsert({
    where: { jurisdiction_lawNumber: { jurisdiction: 'KR', lawNumber: '대통령령제34819호' } },
    update: {},
    create: {
      jurisdiction: 'KR',
      lawType: 'decree',
      title: '가상자산 이용자 보호 등에 관한 법률 시행령',
      titleEn: 'Enforcement Decree of the Act on the Protection of Virtual Asset Users',
      shortName: '가상자산보호법시행령',
      lawNumber: '대통령령제34819호',
      enactedDate: new Date('2024-06-18'),
      effectiveDate: new Date('2024-07-19'),
      status: 'enacted',
      regulator: '금융위원회',
      sourceUrl: 'https://www.law.go.kr/LSW/lsInfoP.do?lsiSeq=263080',
      totalArticles: 20,
      articles: {
        create: [
          {
            articleNum: '제2조',
            articleTitle: '가상자산의 범위',
            content:
              '① 법 제2조제1호 단서에서 "대통령령으로 정하는 것"이란 다음 각 호의 어느 하나에 해당하는 것을 말한다.\n1. 「전자금융거래법」 제2조제14호에 따른 선불전자지급수단 및 같은 조 제15호에 따른 전자화폐\n2. 「게임산업진흥에 관한 법률」 제2조제6호의2에 따른 게임머니\n3. 「전자상거래 등에서의 소비자보호에 관한 법률」 제2조제5호에 따른 통신판매업자가 발행한 포인트로서 해당 통신판매업자의 사이버몰에서만 사용할 수 있는 것\n4. 그 밖에 화폐·재화·용역 등과의 교환이 제한되고 불특정 다수를 상대로 거래되지 아니하는 전자적 증표로서 금융위원회가 정하여 고시하는 것\n② 제1항에도 불구하고, 발행 당시에는 제1항 각 호에 해당하였으나 이후 불특정 다수를 상대로 매매 또는 교환의 대상이 된 경우에는 법 제2조제1호에 따른 가상자산으로 본다.',
            contentEn:
              '(1) "Those prescribed by Presidential Decree" under Article 2(1) proviso of the Act refers to the following:\n1. Prepaid electronic payment means and electronic currency under the Electronic Financial Transactions Act\n2. Game money under the Game Industry Promotion Act\n3. Points issued by telecommunications sellers under the E-commerce Consumer Protection Act, usable only on the seller\'s cyber mall\n4. Other electronic tokens with limited exchangeability that are not traded with unspecified persons, as designated by the Financial Services Commission\n(2) Notwithstanding paragraph (1), if an item initially falling under paragraph (1) subsequently becomes subject to trading or exchange with unspecified persons, it shall be deemed a virtual asset under Article 2(1) of the Act.',
            chapter: '제1장 총칙',
            sortOrder: 1,
            tags: ['definition', 'virtual-asset', 'exclusion', 'game-money', 'prepaid', 'scope'],
            appliesToBiz: ['exchange', 'token-issuer', 'nft-platform', 'defi-protocol', 'stablecoin-issuer'],
          },
          {
            articleNum: '제3조',
            articleTitle: '가상자산사업자의 의무',
            content:
              '① 가상자산사업자는 이용자 보호를 위하여 다음 각 호의 사항을 준수하여야 한다.\n1. 가상자산의 매매, 교환, 이전 등에 관한 거래 내역을 정확하게 기록하고 관리할 것\n2. 이용자에게 가상자산의 거래 조건, 수수료, 위험 요인 등 중요 사항을 사전에 충분히 고지할 것\n3. 이용자의 불만 및 피해 구제를 위한 절차를 마련하고 운영할 것\n4. 이용자 자산의 안전한 보관 및 관리를 위한 내부통제기준을 수립하고 이행할 것\n② 가상자산사업자는 제1항 각 호의 사항에 관한 세부 이행계획을 매년 금융위원회에 제출하여야 한다.',
            contentEn:
              '(1) Virtual asset service providers shall comply with the following for user protection:\n1. Accurately record and manage transaction details for trading, exchange, and transfer of virtual assets\n2. Provide users with sufficient advance notice of transaction conditions, fees, risk factors, and other important matters\n3. Establish and operate procedures for user complaint resolution and damage remediation\n4. Establish and implement internal control standards for safe custody and management of user assets\n(2) VASPs shall submit detailed implementation plans for the matters in paragraph (1) to the Financial Services Commission annually.',
            chapter: '제2장 이용자 보호',
            sortOrder: 2,
            tags: ['operator-obligation', 'internal-control', 'disclosure', 'complaint-handling', 'record-keeping'],
            appliesToBiz: ['exchange', 'wallet-provider', 'stablecoin-issuer', 'token-issuer'],
          },
          {
            articleNum: '제5조',
            articleTitle: '이용자 예치금 관리',
            content:
              '① 법 제6조제1항에서 "은행 등 대통령령으로 정하는 공신력 있는 기관"이란 「은행법」에 따른 은행(외국은행의 국내지점을 포함한다)을 말한다.\n② 가상자산사업자는 이용자 예치금을 예치 또는 신탁하는 경우 다음 각 호의 사항을 준수하여야 한다.\n1. 가상자산사업자의 고유재산과 분리된 별도의 계좌에 관리할 것\n2. 이용자별로 예치금 내역을 구분하여 기록·관리할 것\n3. 예치금에 대한 이자 등 수익이 발생하는 경우 해당 수익의 배분에 관한 사항을 미리 이용자에게 알릴 것\n③ 가상자산사업자는 이용자 예치금의 인출 요청에 대하여 정당한 사유 없이 이를 지연하거나 거부하여서는 아니 된다. 다만, 법령에 따른 거래 제한 사유가 있는 경우에는 그러하지 아니하다.',
            contentEn:
              '(1) "Banks or other credible institutions prescribed by Presidential Decree" under Article 6(1) of the Act refers to banks under the Banking Act (including domestic branches of foreign banks).\n(2) When depositing or entrusting user deposits, VASPs shall comply with the following:\n1. Manage deposits in separate accounts segregated from the VASP\'s own property\n2. Record and manage deposit details separately for each user\n3. If interest or other returns accrue on deposits, notify users in advance regarding the distribution of such returns\n(3) VASPs shall not delay or refuse withdrawal requests for user deposits without justifiable grounds, unless there are transaction restriction grounds under applicable laws.',
            chapter: '제2장 이용자 보호',
            sortOrder: 3,
            tags: ['deposit-management', 'segregated-account', 'bank', 'withdrawal', 'interest'],
            appliesToBiz: ['exchange'],
          },
          {
            articleNum: '제6조',
            articleTitle: '이용자 가상자산의 보관·관리',
            content:
              '① 법 제7조제2항에 따라 가상자산사업자가 이용자의 가상자산을 인터넷과 분리된 콜드월렛에 보관하여야 하는 비율은 이용자가 위탁한 가상자산의 100분의 80 이상으로 한다.\n② 가상자산사업자는 콜드월렛과 핫월렛 간의 가상자산 이동 시 다음 각 호의 기준을 준수하여야 한다.\n1. 복수의 서명(멀티시그)을 요구하는 절차를 마련할 것\n2. 가상자산의 이동 내역을 실시간으로 기록하고, 해당 기록을 5년 이상 보관할 것\n3. 비정상적인 대량 출금 등에 대비한 긴급 중단 절차를 수립할 것\n③ 가상자산사업자는 보관 중인 가상자산의 수량과 이용자 잔액의 총합이 일치하는지를 매일 확인하고, 그 결과를 기록·보관하여야 한다.',
            contentEn:
              '(1) The ratio of user virtual assets that a VASP must store in cold wallets disconnected from the internet under Article 7(2) of the Act shall be at least 80% of the virtual assets entrusted by users.\n(2) When moving virtual assets between cold wallets and hot wallets, VASPs shall comply with the following standards:\n1. Establish procedures requiring multiple signatures (multi-sig)\n2. Record virtual asset transfers in real-time and retain such records for at least 5 years\n3. Establish emergency suspension procedures for abnormal large-scale withdrawals\n(3) VASPs shall verify daily that the total quantity of virtual assets in custody matches the aggregate user balances and shall record and retain such verification results.',
            chapter: '제2장 이용자 보호',
            sortOrder: 4,
            tags: ['cold-wallet', 'hot-wallet', 'multi-sig', 'custody', '80-percent', 'daily-reconciliation'],
            appliesToBiz: ['exchange', 'wallet-provider'],
          },
          {
            articleNum: '제7조',
            articleTitle: '보험 가입 등',
            content:
              '① 법 제8조에 따라 가상자산사업자가 하여야 하는 조치는 다음 각 호와 같다.\n1. 다음 각 목의 어느 하나에 해당하는 보험 또는 공제에 가입하는 것\n  가. 해킹, 전산장애 등 사고로 인한 이용자의 가상자산 손실을 보상하는 보험\n  나. 가상자산사업자의 횡령, 배임 등 부정행위로 인한 이용자의 손실을 보상하는 보험\n2. 제1호에 따른 보험 또는 공제에 가입하지 아니하는 경우에는 보호대상 가상자산 평가액의 100분의 5 이상에 해당하는 금액을 준비금으로 적립하는 것\n② 제1항제1호에 따른 보험 또는 공제의 보상한도는 핫월렛에 보관 중인 이용자 가상자산 평가액의 전부 이상이어야 한다.\n③ 가상자산사업자는 보험 가입 또는 준비금 적립 현황을 매 분기 금융위원회에 보고하여야 한다.',
            contentEn:
              '(1) Measures required of VASPs under Article 8 of the Act are as follows:\n1. Obtaining one of the following insurance or mutual aid coverage:\n  a. Insurance covering user virtual asset losses from hacking, system failures, or other incidents\n  b. Insurance covering user losses from embezzlement, breach of duty, or other misconduct by the VASP\n2. If not obtaining insurance under item 1, setting aside reserves of at least 5% of the assessed value of protected virtual assets\n(2) The coverage limit of insurance under paragraph (1)(1) shall be at least the full assessed value of user virtual assets stored in hot wallets.\n(3) VASPs shall report their insurance enrollment or reserve accumulation status to the Financial Services Commission quarterly.',
            chapter: '제2장 이용자 보호',
            sortOrder: 5,
            tags: ['insurance', 'reserve', 'hot-wallet-coverage', 'hacking', 'embezzlement', 'quarterly-report'],
            appliesToBiz: ['exchange', 'wallet-provider'],
          },
          {
            articleNum: '제8조',
            articleTitle: '이상거래 감시',
            content:
              '① 가상자산사업자는 다음 각 호의 이상거래를 탐지·분석하기 위한 전담 조직을 설치·운영하여야 한다.\n1. 비정상적으로 대규모인 가상자산의 입출금 또는 매매 거래\n2. 단기간에 반복적으로 이루어지는 가상자산의 입출금 또는 매매 거래\n3. 시세에 중대한 영향을 줄 수 있는 비정상적 거래 패턴\n4. 자금세탁 등 불법행위가 의심되는 거래\n② 가상자산사업자는 이상거래가 탐지된 경우 즉시 해당 거래를 임시로 정지하거나 제한하는 조치를 취할 수 있으며, 금융정보분석원장에게 지체 없이 보고하여야 한다.\n③ 이상거래 감시 시스템의 구축 및 운영에 관한 세부 기준은 금융위원회가 정하여 고시한다.',
            contentEn:
              '(1) VASPs shall establish and operate a dedicated unit for detecting and analyzing the following abnormal transactions:\n1. Abnormally large-scale deposits, withdrawals, or trades of virtual assets\n2. Deposits, withdrawals, or trades of virtual assets carried out repeatedly within a short period\n3. Abnormal transaction patterns that could significantly affect market prices\n4. Transactions suspected of money laundering or other illegal activities\n(2) Upon detecting abnormal transactions, VASPs may immediately suspend or restrict such transactions and shall promptly report to the head of KoFIU.\n(3) Detailed standards for the establishment and operation of abnormal transaction monitoring systems shall be determined and publicly notified by the Financial Services Commission.',
            chapter: '제3장 불공정거래행위의 규제',
            sortOrder: 6,
            tags: ['abnormal-transaction', 'monitoring', 'kofiu', 'aml', 'surveillance', 'dedicated-unit'],
            appliesToBiz: ['exchange', 'defi-protocol'],
          },
          {
            articleNum: '제10조',
            articleTitle: '미공개중요정보 이용행위의 금지',
            content:
              '① 법 제10조에서 "미공개중요정보"란 다음 각 호의 어느 하나에 해당하는 정보로서 불특정 다수인이 알 수 있도록 공개되기 전의 것을 말한다.\n1. 가상자산의 상장 또는 상장폐지에 관한 정보\n2. 가상자산사업자의 경영·재무 상태에 중대한 영향을 미치는 정보\n3. 가상자산의 기술적 결함, 보안사고 또는 프로토콜 변경에 관한 정보\n4. 가상자산의 발행량 변경, 소각, 에어드랍 등 수급에 중대한 영향을 미치는 정보\n5. 가상자산사업자 간의 합병, 제휴 등 중요한 사업상 결정에 관한 정보\n② 가상자산사업자는 미공개중요정보의 관리를 위한 내부통제기준을 수립하고, 정보접근자 목록을 작성·관리하여야 한다.',
            contentEn:
              '(1) "Material non-public information" under Article 10 of the Act means information falling under any of the following that has not been disclosed to the general public:\n1. Information regarding listing or delisting of virtual assets\n2. Information that materially affects the management or financial condition of a VASP\n3. Information regarding technical defects, security incidents, or protocol changes of virtual assets\n4. Information that materially affects supply and demand, such as changes in issuance volume, token burns, or airdrops\n5. Information regarding important business decisions such as mergers or partnerships between VASPs\n(2) VASPs shall establish internal control standards for managing MNPI and shall create and maintain a list of persons with access to such information.',
            chapter: '제3장 불공정거래행위의 규제',
            sortOrder: 7,
            tags: ['insider-trading', 'MNPI', 'listing', 'delisting', 'internal-control', 'information-barrier'],
            appliesToBiz: ['exchange', 'token-issuer', 'stablecoin-issuer'],
          },
          {
            articleNum: '제11조',
            articleTitle: '시세조종행위의 금지',
            content:
              '① 법 제11조 각 호에 따른 시세조종행위의 구체적 유형은 다음 각 호와 같다.\n1. 통정매매: 사전에 약정된 시간, 가격, 수량에 따라 자기가 매도하는 것과 같은 시기에 그와 같은 가격으로 타인이 매수할 것을 알면서 매도하거나 그 반대의 행위를 하는 것\n2. 가장매매: 권리의 이전을 목적으로 하지 아니하는 거짓의 매매를 하는 것\n3. 자전거래: 동일인이 동일 가상자산에 대하여 동시에 매도와 매수의 주문을 내는 것\n4. 스푸핑(Spoofing): 체결할 의사 없이 호가를 제출한 후 이를 취소하는 방법으로 시세에 영향을 주는 행위\n② 금융위원회는 시세조종행위의 탐지를 위하여 가상자산사업자에게 거래 데이터의 제출을 요구할 수 있다.',
            contentEn:
              '(1) Specific types of market manipulation under Article 11 of the Act are as follows:\n1. Collusive trading: Selling while knowing another person will buy at the same price and time under a pre-arranged agreement, or vice versa\n2. Fictitious trading: Engaging in false trades not intended for actual transfer of rights\n3. Self-trading (wash trading): Simultaneously placing buy and sell orders for the same virtual asset by the same person\n4. Spoofing: Submitting orders without intention to execute and canceling them to influence prices\n(2) The Financial Services Commission may require VASPs to submit trading data for the detection of market manipulation.',
            chapter: '제3장 불공정거래행위의 규제',
            sortOrder: 8,
            tags: ['market-manipulation', 'wash-trading', 'spoofing', 'collusive-trading', 'fictitious-trading'],
            appliesToBiz: ['exchange'],
          },
          {
            articleNum: '제12조',
            articleTitle: '부정거래행위의 금지',
            content:
              '① 법 제12조에서 "부정한 수단, 계획 또는 기교를 사용하는 행위"란 다음 각 호의 어느 하나에 해당하는 행위를 말한다.\n1. 가상자산의 가치에 중대한 영향을 미칠 수 있는 허위의 사실 또는 오해를 유발하는 정보를 유포하는 행위\n2. 가상자산의 거래와 관련하여 중요한 사실을 숨기거나 누락하는 행위\n3. 가상자산의 가격이나 거래량에 관하여 타인을 오인하게 하거나 오인할 수 있는 표시를 하는 행위\n4. 가상자산의 기술적 특성, 개발 현황 등에 관하여 허위의 정보를 제공하는 행위\n② 가상자산사업자는 자신이 운영하는 플랫폼에서 부정거래행위를 방지하기 위한 모니터링 체계를 구축하고 운영하여야 한다.',
            contentEn:
              '(1) "Acts using fraudulent means, plans, or schemes" under Article 12 of the Act refer to the following:\n1. Disseminating false facts or misleading information that could materially affect the value of virtual assets\n2. Concealing or omitting material facts related to virtual asset transactions\n3. Making representations that mislead or could mislead others regarding virtual asset prices or trading volumes\n4. Providing false information regarding technical characteristics or development status of virtual assets\n(2) VASPs shall establish and operate monitoring systems to prevent fraudulent trading on their platforms.',
            chapter: '제3장 불공정거래행위의 규제',
            sortOrder: 9,
            tags: ['unfair-trading', 'fraud', 'misinformation', 'monitoring', 'false-information'],
            appliesToBiz: ['exchange', 'token-issuer', 'nft-platform'],
          },
          {
            articleNum: '제15조',
            articleTitle: '과징금',
            content:
              '① 금융위원회는 법 제19조에 따른 위반행위와 관련하여 다음 각 호의 기준에 따라 과징금을 부과할 수 있다.\n1. 위반행위로 얻은 이익 또는 회피한 손실액의 산정이 가능한 경우: 해당 금액의 100분의 40 이내\n2. 위반행위로 얻은 이익 또는 회피한 손실액의 산정이 곤란한 경우: 위반행위와 관련된 거래금액의 100분의 10 이내\n② 과징금의 산정 시 다음 각 호의 사항을 고려하여야 한다.\n1. 위반행위의 내용 및 정도\n2. 위반행위의 기간 및 횟수\n3. 위반행위로 취득하거나 회피한 이익의 규모\n4. 피해자의 수 및 피해 규모\n③ 과징금은 위반행위가 종료된 날부터 5년이 경과한 경우에는 부과하지 아니한다.',
            contentEn:
              '(1) The Financial Services Commission may impose administrative fines based on the following criteria for violations under Article 19 of the Act:\n1. If gains or avoided losses from the violation can be calculated: Up to 40% of such amount\n2. If gains or avoided losses are difficult to calculate: Up to 10% of the transaction amount related to the violation\n(2) The following matters shall be considered when calculating fines:\n1. Content and degree of the violation\n2. Duration and frequency of the violation\n3. Scale of gains obtained or losses avoided through the violation\n4. Number of victims and scale of damages\n(3) Administrative fines shall not be imposed if 5 years have elapsed from the date the violation ended.',
            chapter: '제4장 감독 및 제재',
            sortOrder: 10,
            tags: ['penalty', 'administrative-fine', 'calculation', 'statute-of-limitations'],
            appliesToBiz: ['exchange', 'token-issuer', 'stablecoin-issuer', 'wallet-provider'],
          },
        ],
      },
    },
  });

  console.log(`  ✓ ${vuapaDecree.title} — ${vuapaDecree.totalArticles} articles archived`);

  // ═══════════════════════════════════════════════════════════
  // 2. 특정 금융거래정보의 보고 및 이용 등에 관한 법률 시행령
  //    (가상자산 관련 조항)
  // ═══════════════════════════════════════════════════════════
  const sftaDecree = await prisma.lawArchive.upsert({
    where: { jurisdiction_lawNumber: { jurisdiction: 'KR', lawNumber: '특금법시행령-가상자산' } },
    update: {},
    create: {
      jurisdiction: 'KR',
      lawType: 'decree',
      title: '특정 금융거래정보의 보고 및 이용 등에 관한 법률 시행령',
      titleEn: 'Enforcement Decree of the Act on Reporting and Using Specified Financial Transaction Information (Virtual Asset Provisions)',
      shortName: '특금법시행령',
      lawNumber: '특금법시행령-가상자산',
      enactedDate: new Date('2021-03-25'),
      effectiveDate: new Date('2021-03-25'),
      lastAmendedDate: new Date('2024-07-19'),
      status: 'enacted',
      regulator: '금융위원회',
      sourceUrl: 'https://www.law.go.kr/LSW/lsInfoP.do?lsiSeq=252788',
      totalArticles: 10,
      articles: {
        create: [
          {
            articleNum: '제10조의5',
            articleTitle: '가상자산사업자 신고요건',
            content:
              '① 법 제7조제1항에 따라 가상자산사업자가 갖추어야 하는 요건은 다음 각 호와 같다.\n1. 「정보통신망 이용촉진 및 정보보호 등에 관한 법률」 제47조에 따른 정보보호 관리체계(ISMS) 인증을 획득할 것\n2. 「전기통신사업법」에 따른 부가통신사업의 신고를 할 것\n3. 금융회사등에 개설된 실명확인 입출금 계정(이하 "실명확인 계정"이라 한다)을 통하여 가상자산의 매매와 관련된 금융거래를 할 것\n4. 대표자 및 임원이 다음 각 목의 어느 하나에 해당하지 아니할 것\n  가. 금고 이상의 형의 집행이 종료되거나 집행이 면제된 날부터 5년이 미경과한 자\n  나. 금융관련 법령에 따라 벌금형을 선고받고 5년이 미경과한 자\n  다. 금융관련 법령에 따라 해임 또는 면직 요구를 받은 날부터 5년이 미경과한 자\n② 가상자산사업자는 신고수리 후 6개월 이내에 영업을 개시하여야 하며, 정당한 사유 없이 6개월 이상 영업을 하지 아니한 경우 신고가 효력을 잃는다.',
            contentEn:
              '(1) Requirements for VASPs under Article 7(1) of the Act are as follows:\n1. Obtain ISMS (Information Security Management System) certification under the Act on Promotion of Information and Communications Network Utilization and Information Protection\n2. Report as a value-added telecommunications business under the Telecommunications Business Act\n3. Conduct financial transactions related to virtual asset trading through real-name verified deposit/withdrawal accounts opened at financial companies\n4. Representatives and officers shall not fall under any of the following:\n  a. Persons for whom less than 5 years have passed since completion or exemption of imprisonment\n  b. Persons for whom less than 5 years have passed since being sentenced to a fine under financial laws\n  c. Persons for whom less than 5 years have passed since receiving a dismissal or removal request under financial laws\n(2) VASPs shall commence business within 6 months after acceptance of the report; the report shall lose effect if business is not conducted for 6 months or more without justifiable grounds.',
            chapter: '제3장의2 가상자산사업자',
            sortOrder: 1,
            tags: ['vasp-registration', 'isms', 'real-name-account', 'fit-and-proper', 'licensing'],
            appliesToBiz: ['exchange', 'wallet-provider', 'payment-service'],
          },
          {
            articleNum: '제10조의6',
            articleTitle: 'Travel Rule 세부사항',
            content:
              '① 가상자산사업자는 가상자산을 다른 가상자산사업자에게 이전하는 경우로서 그 이전금액이 100만원 이상인 경우에는 다음 각 호의 정보를 해당 수취 가상자산사업자에게 제공하여야 한다.\n1. 송금인의 성명(법인인 경우 상호 또는 명칭)\n2. 송금인의 가상자산주소\n3. 송금인의 주민등록번호(외국인의 경우 여권번호 또는 외국인등록번호)\n4. 수취인의 성명(법인인 경우 상호 또는 명칭)\n5. 수취인의 가상자산주소\n② 수취 가상자산사업자는 제1항에 따른 정보가 제공되지 아니하거나 정보의 내용이 불완전한 경우 해당 가상자산의 수취를 거부하거나 해당 거래를 보류할 수 있다.\n③ 가상자산사업자는 제1항에 따라 제공하거나 제공받은 정보를 5년간 보존하여야 한다.\n④ 개인 지갑(언호스티드 월렛)으로의 이전 시에도 100만원 이상인 경우 송금인의 정보를 기록·보관하여야 한다.',
            contentEn:
              '(1) When a VASP transfers virtual assets to another VASP and the transfer amount is KRW 1 million or more, the following information shall be provided to the receiving VASP:\n1. Sender\'s name (company name for corporations)\n2. Sender\'s virtual asset address\n3. Sender\'s resident registration number (passport or alien registration number for foreigners)\n4. Recipient\'s name (company name for corporations)\n5. Recipient\'s virtual asset address\n(2) The receiving VASP may refuse receipt or suspend the transaction if the information under paragraph (1) is not provided or is incomplete.\n(3) VASPs shall retain information provided or received under paragraph (1) for 5 years.\n(4) For transfers to personal wallets (unhosted wallets) of KRW 1 million or more, sender information shall also be recorded and retained.',
            chapter: '제3장의2 가상자산사업자',
            sortOrder: 2,
            tags: ['travel-rule', 'sender-info', 'receiver-info', 'threshold', '1-million-krw', 'unhosted-wallet'],
            appliesToBiz: ['exchange', 'wallet-provider', 'payment-service'],
          },
          {
            articleNum: '제10조의7',
            articleTitle: '의심거래 보고',
            content:
              '① 가상자산사업자는 다음 각 호의 어느 하나에 해당하는 거래를 인지한 경우에는 지체 없이 금융정보분석원장에게 의심거래보고(STR)를 하여야 한다.\n1. 거래상대방이 자금세탁등의 행위를 하고 있다고 의심되는 합리적인 근거가 있는 경우\n2. 거래상대방이 테러자금 조달행위를 하고 있다고 의심되는 합리적인 근거가 있는 경우\n3. 거래가 불법재산과 관련되어 있다고 의심되는 합리적인 근거가 있는 경우\n② 가상자산사업자는 의심거래보고의 사실을 해당 거래상대방 또는 제3자에게 알려서는 아니 된다(비밀유지 의무).\n③ 가상자산사업자는 의심거래 탐지를 위하여 고객의 거래 패턴, 거래 빈도, 거래 규모 등을 지속적으로 모니터링하여야 하며, 이를 위한 전담인력을 배치하여야 한다.',
            contentEn:
              '(1) When a VASP becomes aware of a transaction falling under any of the following, it shall promptly file a Suspicious Transaction Report (STR) with the head of KoFIU:\n1. Reasonable grounds to suspect the counterparty is engaging in money laundering\n2. Reasonable grounds to suspect the counterparty is engaged in terrorist financing\n3. Reasonable grounds to suspect the transaction involves illegal proceeds\n(2) VASPs shall not disclose the fact of an STR filing to the relevant counterparty or third parties (duty of confidentiality).\n(3) VASPs shall continuously monitor customer transaction patterns, frequency, and scale for suspicious transaction detection, and shall assign dedicated personnel for this purpose.',
            chapter: '제3장의2 가상자산사업자',
            sortOrder: 3,
            tags: ['str', 'suspicious-transaction', 'money-laundering', 'terrorist-financing', 'kofiu', 'confidentiality'],
            appliesToBiz: ['exchange', 'wallet-provider', 'payment-service', 'defi-protocol'],
          },
          {
            articleNum: '제10조의8',
            articleTitle: '고객확인의무 강화',
            content:
              '① 가상자산사업자는 고객과의 거래 시 다음 각 호의 사항을 확인하여야 한다.\n1. 고객의 실지명의(실명, 주민등록번호 또는 사업자등록번호)\n2. 거래의 목적\n3. 자금의 원천\n4. 고객이 실제소유자(수익적 소유자)인지 여부\n② 가상자산사업자는 다음 각 호의 경우에 강화된 고객확인(EDD)을 실시하여야 한다.\n1. 고위험 국가 또는 지역과 관련된 거래\n2. 거래 금액이 대통령령이 정하는 기준 이상인 경우\n3. 자금세탁 위험이 높다고 판단되는 고객\n4. 정치적 주요인물(PEP)과의 거래\n③ 가상자산사업자는 고객확인 결과 자금세탁등의 우려가 있는 경우 해당 거래를 거절하여야 한다.',
            contentEn:
              '(1) VASPs shall verify the following matters when transacting with customers:\n1. Customer\'s real identity (real name, resident registration number, or business registration number)\n2. Purpose of the transaction\n3. Source of funds\n4. Whether the customer is the actual beneficial owner\n(2) VASPs shall conduct Enhanced Due Diligence (EDD) in the following cases:\n1. Transactions related to high-risk countries or regions\n2. Transactions exceeding the threshold prescribed by Presidential Decree\n3. Customers assessed as having high money laundering risk\n4. Transactions with Politically Exposed Persons (PEPs)\n(3) VASPs shall refuse transactions where customer verification results indicate concerns regarding money laundering.',
            chapter: '제3장의2 가상자산사업자',
            sortOrder: 4,
            tags: ['kyc', 'cdd', 'edd', 'beneficial-owner', 'pep', 'source-of-funds', 'aml'],
            appliesToBiz: ['exchange', 'wallet-provider', 'payment-service', 'defi-protocol'],
          },
          {
            articleNum: '제10조의9',
            articleTitle: '기록보관',
            content:
              '① 가상자산사업자는 다음 각 호의 자료를 해당 거래가 종료된 날 또는 고객과의 관계가 종료된 날부터 5년간 보관하여야 한다.\n1. 고객확인 시 수집한 고객의 신원에 관한 자료\n2. 가상자산의 매매, 교환, 이전 등 모든 거래기록(거래일시, 거래 유형, 거래금액, 거래상대방 정보 포함)\n3. 의심거래보고(STR) 관련 자료\n4. 내부보고 관련 자료\n5. Travel Rule에 따라 제공하거나 제공받은 정보\n② 제1항의 자료는 수사기관, 금융정보분석원 또는 금융위원회의 요청이 있는 경우 지체 없이 제공하여야 한다.\n③ 가상자산사업자는 기록을 안전하게 보관하기 위한 정보보안 체계를 구축하여야 하며, 해당 기록의 무결성을 보장하기 위한 기술적 조치를 취하여야 한다.',
            contentEn:
              '(1) VASPs shall retain the following materials for 5 years from the date the transaction ended or the customer relationship was terminated:\n1. Customer identity information collected during customer verification\n2. All transaction records including trading, exchange, and transfers (including transaction date/time, type, amount, and counterparty information)\n3. Materials related to Suspicious Transaction Reports (STRs)\n4. Internal reporting materials\n5. Information provided or received under the Travel Rule\n(2) Materials under paragraph (1) shall be provided without delay upon request from investigative agencies, KoFIU, or the Financial Services Commission.\n(3) VASPs shall establish information security systems for safe retention of records and take technical measures to ensure the integrity of such records.',
            chapter: '제3장의2 가상자산사업자',
            sortOrder: 5,
            tags: ['record-keeping', '5-year-retention', 'transaction-records', 'data-integrity', 'law-enforcement'],
            appliesToBiz: ['exchange', 'wallet-provider', 'payment-service', 'defi-protocol', 'data-analytics'],
          },
        ],
      },
    },
  });

  console.log(`  ✓ ${sftaDecree.title} — ${sftaDecree.totalArticles} articles archived`);

  // ═══════════════════════════════════════════════════════════
  // 3. 소득세법 가상자산 과세 조항
  // ═══════════════════════════════════════════════════════════
  const incomeTax = await prisma.lawArchive.upsert({
    where: { jurisdiction_lawNumber: { jurisdiction: 'KR', lawNumber: 'partial' } },
    update: {},
    create: {
      jurisdiction: 'KR',
      lawType: 'law',
      title: '소득세법 가상자산 과세 조항',
      titleEn: 'Income Tax Act - Virtual Asset Taxation Provisions',
      shortName: '소득세법(가상자산)',
      lawNumber: 'partial',
      enactedDate: new Date('2020-12-29'),
      effectiveDate: new Date('2027-01-01'),
      status: 'enacted',
      regulator: '기획재정부',
      sourceUrl: 'https://www.law.go.kr/LSW/lsInfoP.do?lsiSeq=225981',
      totalArticles: 5,
      articles: {
        create: [
          {
            articleNum: '제21조제1항제27호',
            articleTitle: '가상자산소득 기타소득 분류',
            content:
              '기타소득은 이자소득·배당소득·사업소득·근로소득·연금소득·퇴직소득 및 양도소득 외의 소득으로서 다음 각 호의 것으로 한다.\n제27호: 가상자산을 양도하거나 대여함으로써 발생하는 소득(이하 "가상자산소득"이라 한다). 여기서 "가상자산"이란 「가상자산 이용자 보호 등에 관한 법률」 제2조제1호에 따른 가상자산을 말하며, 가상자산의 양도에는 매매, 교환, 그 밖에 유상으로 사실상 이전하는 것을 포함한다. 가상자산의 대여에는 가상자산을 빌려주고 그 대가로 이자 또는 보수를 받는 것을 포함한다.',
            contentEn:
              'Other income refers to income other than interest, dividends, business, employment, pension, retirement, and transfer income, including the following:\nItem 27: Income arising from the transfer or lending of virtual assets (hereinafter "virtual asset income"). "Virtual assets" refers to virtual assets under Article 2(1) of the Act on the Protection of Virtual Asset Users. Transfer of virtual assets includes sale, exchange, and other forms of actual transfer for consideration. Lending of virtual assets includes lending virtual assets and receiving interest or compensation in return.',
            chapter: '제2편 거주자의 소득에 대한 납세의무',
            sortOrder: 1,
            tags: ['other-income', 'classification', 'transfer', 'lending', 'taxable-event'],
            appliesToBiz: ['exchange', 'defi-protocol', 'mining-staking', 'fund-manager'],
          },
          {
            articleNum: '제37조제1항제4호의2',
            articleTitle: '가상자산소득 필요경비',
            content:
              '① 기타소득금액은 해당 과세기간의 총수입금액에서 이에 사용된 필요경비를 공제한 금액으로 한다.\n제4호의2: 가상자산소득의 필요경비는 다음 각 목의 금액으로 한다.\n가. 가상자산의 실제 취득가액. 다만, 이 법 시행일(2027년 1월 1일) 전에 이미 보유하고 있는 가상자산에 대해서는 시행일 전일의 시가와 실제 취득가액 중 큰 금액을 취득가액으로 한다.\n나. 가상자산의 양도 또는 대여와 관련하여 직접 지출한 거래수수료, 평가수수료 등 부대비용\n다. 취득가액의 산정방법은 이동평균법 또는 총평균법 중 납세자가 선택한 방법에 따른다. 다만, 한번 선택한 방법은 계속 적용하여야 한다.',
            contentEn:
              '(1) Other income amount shall be the total revenue for the taxable period less the necessary expenses.\nItem 4-2: Necessary expenses for virtual asset income are as follows:\na. Actual acquisition cost of the virtual asset. However, for virtual assets held prior to the enforcement date (January 1, 2027), the greater of the market value on the day before the enforcement date or the actual acquisition cost shall be the acquisition cost.\nb. Incidental expenses directly incurred in connection with the transfer or lending, such as transaction fees and valuation fees\nc. The method of calculating acquisition cost shall follow the moving average method or total average method selected by the taxpayer. However, the selected method must be continuously applied.',
            chapter: '제2편 거주자의 소득에 대한 납세의무',
            sortOrder: 2,
            tags: ['deductible-expense', 'acquisition-cost', 'moving-average', 'total-average', 'grandfathering'],
            appliesToBiz: ['exchange', 'defi-protocol', 'fund-manager', 'data-analytics'],
          },
          {
            articleNum: '제84조의2',
            articleTitle: '가상자산소득에 대한 과세특례',
            content:
              '① 거주자의 가상자산소득에 대해서는 해당 과세기간의 가상자산소득금액에서 250만원을 공제한 금액(이하 "과세표준"이라 한다)에 100분의 20을 적용하여 산출한 세액을 그 소득세로 한다.\n② 가상자산소득금액이 250만원 이하인 경우에는 과세하지 아니한다.\n③ 거주자는 가상자산소득 과세표준을 해당 과세기간의 다음 연도 5월 1일부터 5월 31일까지 납세지 관할 세무서장에게 확정신고하여야 한다.\n④ 가상자산사업자는 가상자산소득의 원천징수의무가 없으며, 납세자가 직접 신고·납부하여야 한다. 다만, 비거주자에 대해서는 제156조의2에 따른 원천징수 특례가 적용된다.',
            contentEn:
              '(1) For virtual asset income of residents, the income tax shall be calculated by applying a rate of 20% to the amount obtained by deducting KRW 2.5 million from the virtual asset income for the taxable period (the "tax base").\n(2) No tax shall be imposed if the virtual asset income amount is KRW 2.5 million or less.\n(3) Residents shall file a final return on the virtual asset income tax base with the competent tax office from May 1 to May 31 of the year following the taxable period.\n(4) VASPs have no obligation to withhold tax on virtual asset income; taxpayers shall file and pay directly. However, the withholding tax special provisions under Article 156-2 apply to non-residents.',
            chapter: '제3편 과세표준과 세액의 계산',
            sortOrder: 3,
            tags: ['tax-rate', '20-percent', '2.5-million-deduction', 'filing', 'annual-return', 'no-withholding'],
            appliesToBiz: ['exchange', 'defi-protocol', 'fund-manager', 'mining-staking'],
          },
          {
            articleNum: '제119조의2',
            articleTitle: '비거주자 가상자산소득',
            content:
              '① 비거주자의 가상자산소득은 다음 각 호의 어느 하나에 해당하는 경우 국내원천소득으로 본다.\n1. 국내에 소재하는 가상자산사업자를 통하여 가상자산을 양도하거나 대여하는 경우\n2. 국내에서 가상자산 관련 서비스를 제공하는 사업자를 통하여 소득이 발생하는 경우\n② 비거주자의 가상자산소득에 대해서는 거주자와 동일하게 250만원을 공제하고 100분의 20의 세율을 적용한다. 다만, 조세조약에 따라 면제 또는 경감될 수 있다.\n③ 비거주자가 가상자산소득을 얻은 경우 해당 가상자산사업자가 원천징수하여 납부하여야 한다.',
            contentEn:
              '(1) Virtual asset income of non-residents shall be deemed domestic source income in the following cases:\n1. When virtual assets are transferred or lent through a VASP located in Korea\n2. When income arises through a business providing virtual asset-related services in Korea\n(2) For non-resident virtual asset income, the same KRW 2.5 million deduction and 20% tax rate shall apply as for residents. However, exemption or reduction may apply under tax treaties.\n(3) When a non-resident earns virtual asset income, the VASP shall withhold and pay the tax.',
            chapter: '제6편 비거주자의 납세의무',
            sortOrder: 4,
            tags: ['non-resident', 'domestic-source', 'withholding', 'tax-treaty', 'cross-border'],
            appliesToBiz: ['exchange', 'defi-protocol', 'fund-manager'],
          },
          {
            articleNum: '제156조의2',
            articleTitle: '원천징수 특례',
            content:
              '① 비거주자가 국내의 가상자산사업자를 통하여 가상자산소득을 얻은 경우, 해당 가상자산사업자는 비거주자의 가상자산소득에 대하여 다음 각 호의 구분에 따라 원천징수하여야 한다.\n1. 양도가액의 100분의 10 또는 양도차익의 100분의 20 중 적은 금액\n2. 대여소득의 경우 그 대여 대가의 100분의 20\n② 가상자산사업자는 원천징수한 세액을 그 징수일이 속하는 달의 다음 달 10일까지 납세지 관할 세무서에 납부하여야 한다.\n③ 가상자산사업자는 비거주자의 국적, 거주지국, 거래내역 등을 기록·보관하여야 하며, 매년 2월 말일까지 전년도 원천징수 내역을 납세지 관할 세무서장에게 제출하여야 한다.',
            contentEn:
              '(1) When a non-resident earns virtual asset income through a Korean VASP, the VASP shall withhold tax as follows:\n1. The lesser of 10% of the transfer price or 20% of the transfer gains\n2. For lending income, 20% of the lending consideration\n(2) VASPs shall pay the withheld tax to the competent tax office by the 10th of the month following the month in which it was collected.\n(3) VASPs shall record and retain the nationality, country of residence, and transaction details of non-residents, and shall submit the previous year\'s withholding details to the competent tax office by the end of February each year.',
            chapter: '제6편 비거주자의 납세의무',
            sortOrder: 5,
            tags: ['withholding-tax', 'non-resident', 'reporting', '10-percent', '20-percent', 'vasp-obligation'],
            appliesToBiz: ['exchange', 'defi-protocol'],
          },
        ],
      },
    },
  });

  console.log(`  ✓ ${incomeTax.title} — ${incomeTax.totalArticles} articles archived`);

  // ═══════════════════════════════════════════════════════════
  // 4. 자본시장과 금융투자업에 관한 법률 (토큰증권 관련)
  // ═══════════════════════════════════════════════════════════
  const capitalMarket = await prisma.lawArchive.upsert({
    where: { jurisdiction_lawNumber: { jurisdiction: 'KR', lawNumber: '자본시장법-토큰증권' } },
    update: {},
    create: {
      jurisdiction: 'KR',
      lawType: 'law',
      title: '자본시장과 금융투자업에 관한 법률',
      titleEn: 'Financial Investment Services and Capital Markets Act (Token Securities Provisions)',
      shortName: '자본시장법(STO)',
      lawNumber: '자본시장법-토큰증권',
      enactedDate: new Date('2007-08-03'),
      effectiveDate: new Date('2009-02-04'),
      lastAmendedDate: new Date('2024-01-02'),
      status: 'enacted',
      regulator: '금융위원회',
      sourceUrl: 'https://www.law.go.kr/LSW/lsInfoP.do?lsiSeq=253318',
      totalArticles: 449,
      articles: {
        create: [
          {
            articleNum: '제4조',
            articleTitle: '증권의 정의',
            content:
              '① "증권"이란 내국인 또는 외국인이 발행한 금융투자상품으로서 투자자가 취득과 동시에 지급한 금전등 외에 어떠한 명목으로든지 추가로 지급의무(투자자가 기초자산에 대한 매매를 성립시킬 수 있는 권리를 행사함으로써 부담하게 되는 지급의무를 제외한다)를 부담하지 아니하는 것을 말한다.\n② 증권은 다음 각 호와 같이 구분한다.\n1. 채무증권\n2. 지분증권\n3. 수익증권\n4. 투자계약증권\n5. 파생결합증권\n6. 증권예탁증권\n③ 가상자산 형태로 발행되는 것으로서 제2항 각 호의 성격을 가지는 경우에는 해당 증권의 유형에 따라 이 법의 적용을 받는다. 이는 발행 형태가 블록체인 기반의 분산원장 기술을 활용하는지 여부와 관계없이 적용된다.',
            contentEn:
              '(1) "Securities" means financial investment instruments issued by domestic or foreign persons where the investor does not bear any additional payment obligation beyond the money paid upon acquisition.\n(2) Securities are classified as follows:\n1. Debt securities\n2. Equity securities\n3. Beneficiary certificates\n4. Investment contract securities\n5. Derivatives-linked securities\n6. Depositary receipts\n(3) Where securities are issued in the form of virtual assets and possess the characteristics of any type under paragraph (2), they shall be subject to this Act according to their type. This applies regardless of whether the issuance form utilizes blockchain-based distributed ledger technology.',
            chapter: '제1편 총칙',
            sortOrder: 1,
            tags: ['securities-definition', 'token-securities', 'classification', 'sto', 'blockchain'],
            appliesToBiz: ['token-issuer', 'exchange', 'fund-manager'],
          },
          {
            articleNum: '제4조제6항',
            articleTitle: '투자계약증권',
            content:
              '⑥ "투자계약증권"이란 특정 투자자가 그 투자자와 타인(다른 투자자를 포함한다) 간의 공동사업에 금전등을 투자하고 주로 타인이 수행한 공동사업의 결과에 따른 손익을 귀속받는 계약상의 권리가 표시된 것을 말한다. 이 경우 다음 각 호의 요건을 모두 충족하는 경우에 해당한다.\n1. 금전등의 투자가 있을 것\n2. 공동사업에 대한 투자일 것\n3. 이익이 주로 타인의 노력에 의하여 발생할 것\n4. 위의 내용이 계약으로 정하여져 있을 것\n이는 분산원장 기술을 활용하여 발행되는 토큰 중 위 요건을 충족하는 것에 대하여도 동일하게 적용되며, ICO(Initial Coin Offering), IEO(Initial Exchange Offering), IDO(Initial DEX Offering) 등의 방식으로 발행되는 토큰이 위 요건을 충족하는 경우 투자계약증권에 해당할 수 있다.',
            contentEn:
              '(6) "Investment contract securities" means a contractual right representing an investment of money by a specific investor in a joint enterprise between that investor and others (including other investors), where the investor receives profits or losses primarily resulting from the efforts of others. The following requirements must all be met:\n1. There must be an investment of money\n2. It must be an investment in a joint enterprise\n3. Profits must arise primarily from the efforts of others\n4. The above must be stipulated in a contract\nThis applies equally to tokens issued using distributed ledger technology that meet the above requirements. Tokens issued through ICO, IEO, IDO, or similar methods may constitute investment contract securities if they meet the above requirements.',
            chapter: '제1편 총칙',
            sortOrder: 2,
            tags: ['investment-contract', 'howey-test', 'ico', 'ieo', 'ido', 'token-offering', 'sto'],
            appliesToBiz: ['token-issuer', 'exchange', 'defi-protocol', 'fund-manager'],
          },
          {
            articleNum: '제9조제27항',
            articleTitle: '전자증권',
            content:
              '㉗ "전자증권"이란 「주식·사채 등의 전자등록에 관한 법률」에 따라 전자등록된 증권을 말한다. 분산원장 기술을 활용하여 전자적으로 등록·유통되는 증권(이하 "토큰증권"이라 한다)은 전자증권의 범주에 포함되며, 다음 각 호의 요건을 갖추어야 한다.\n1. 전자등록기관 또는 금융위원회가 인정하는 분산원장 기반 등록기관에 등록할 것\n2. 발행인과 증권의 내용을 특정할 수 있는 기록이 분산원장에 포함되어 있을 것\n3. 「전자서명법」에 따른 전자서명 등으로 위·변조를 방지할 수 있는 기술적 조치가 적용되어 있을 것\n토큰증권은 이 법에 따른 증권의 공모·사모, 유통시장 규제, 공시의무 등의 규정을 동일하게 적용받는다.',
            contentEn:
              '(27) "Electronic securities" means securities electronically registered under the Act on Electronic Registration of Stocks and Bonds. Securities electronically registered and distributed using distributed ledger technology (hereinafter "token securities") are included within the category of electronic securities and shall meet the following requirements:\n1. Registration with an electronic registration institution or a distributed ledger-based registration institution recognized by the Financial Services Commission\n2. Records identifying the issuer and the content of the securities are included in the distributed ledger\n3. Technical measures to prevent forgery or alteration, such as electronic signatures under the Electronic Signatures Act, are applied\nToken securities are subject to the same regulations under this Act regarding public offering/private placement, secondary market regulation, and disclosure obligations.',
            chapter: '제1편 총칙',
            sortOrder: 3,
            tags: ['electronic-securities', 'token-securities', 'distributed-ledger', 'registration', 'sto'],
            appliesToBiz: ['token-issuer', 'exchange', 'fund-manager'],
          },
          {
            articleNum: '제119조',
            articleTitle: '증권신고서 제출',
            content:
              '① 증권을 모집 또는 매출하려는 자는 그 모집 또는 매출에 관한 신고서(이하 "증권신고서"라 한다)를 금융위원회에 제출하여야 한다. 다만, 대통령령으로 정하는 모집 또는 매출에 대하여는 그러하지 아니하다.\n② 토큰증권을 발행하려는 자가 증권신고서를 제출하는 경우에는 제1항에 따른 사항 외에 다음 각 호의 사항을 추가로 기재하여야 한다.\n1. 토큰증권의 발행에 사용되는 분산원장 기술의 종류 및 특성\n2. 스마트계약(Smart Contract)의 주요 내용 및 외부 감사 결과\n3. 토큰증권의 보관·관리 방법\n4. 블록체인 네트워크의 장애 또는 보안사고 발생 시 투자자 보호 방안\n③ 증권신고서의 효력은 해당 신고서를 제출한 날부터 15일이 경과한 날에 발생한다.',
            contentEn:
              '(1) Any person intending to make a public offering or sale of securities shall file a registration statement (hereinafter "securities registration statement") with the Financial Services Commission. However, this shall not apply to public offerings or sales prescribed by Presidential Decree.\n(2) When a person intending to issue token securities files a registration statement, the following matters shall be additionally stated in addition to those under paragraph (1):\n1. Type and characteristics of the distributed ledger technology used for issuance\n2. Key contents of the smart contract and external audit results\n3. Methods of custody and management of token securities\n4. Investor protection measures in case of blockchain network failures or security incidents\n(3) The securities registration statement shall become effective 15 days after the date of filing.',
            chapter: '제3편 증권의 발행 및 유통',
            sortOrder: 4,
            tags: ['securities-registration', 'public-offering', 'smart-contract-audit', 'disclosure', 'filing'],
            appliesToBiz: ['token-issuer', 'fund-manager'],
          },
          {
            articleNum: '제130조',
            articleTitle: '투자설명서',
            content:
              '① 증권신고의 효력이 발생한 증권을 취득하고자 하는 자에게는 투자설명서를 교부하여야 한다.\n② 투자설명서에는 다음 각 호의 사항이 기재되어야 한다.\n1. 증권의 종류 및 발행조건\n2. 발행인의 재무상태 및 경영실적\n3. 투자위험에 관한 사항\n4. 해당 증권의 기초가 되는 자산 또는 사업에 관한 사항\n③ 토큰증권에 대한 투자설명서에는 제2항에 따른 사항 외에 다음 각 호의 사항을 추가로 포함하여야 한다.\n1. 분산원장 기술 및 스마트계약의 기술적 위험\n2. 토큰의 권리내용 및 행사방법\n3. 디지털 자산 시장의 가격변동성에 관한 위험\n4. 해킹, 개인키 분실 등에 따른 투자자산 손실 위험\n5. 관련 법령의 변경에 따른 규제 위험',
            contentEn:
              '(1) A prospectus shall be delivered to any person intending to acquire securities for which the securities registration has become effective.\n(2) The prospectus shall include the following:\n1. Type and issuance conditions of the securities\n2. Financial condition and business performance of the issuer\n3. Matters regarding investment risks\n4. Matters regarding the assets or business underlying the securities\n(3) For token securities, the prospectus shall additionally include the following beyond paragraph (2):\n1. Technical risks of distributed ledger technology and smart contracts\n2. Rights represented by the token and methods of exercising them\n3. Risks regarding price volatility of digital asset markets\n4. Risks of investment loss due to hacking, private key loss, etc.\n5. Regulatory risks due to changes in applicable laws',
            chapter: '제3편 증권의 발행 및 유통',
            sortOrder: 5,
            tags: ['prospectus', 'investor-protection', 'risk-disclosure', 'token-risk', 'smart-contract-risk'],
            appliesToBiz: ['token-issuer', 'exchange', 'fund-manager'],
          },
          {
            articleNum: '제178조',
            articleTitle: '부정거래행위 등의 금지',
            content:
              '① 누구든지 금융투자상품의 매매, 그 밖의 거래와 관련하여 다음 각 호의 어느 하나에 해당하는 행위를 하여서는 아니 된다.\n1. 부정한 수단, 계획 또는 기교를 사용하는 행위\n2. 중요사항에 관하여 거짓의 기재 또는 표시를 하거나 타인에게 오해를 유발시키지 아니하기 위하여 필요한 중요사항의 기재 또는 표시가 누락된 문서, 그 밖의 기재 또는 표시를 사용하여 금전, 그 밖의 재산상의 이익을 얻고자 하는 행위\n3. 금융투자상품의 매매, 그 밖의 거래를 유인할 목적으로 거짓의 시세를 이용하는 행위\n② 토큰증권의 거래에 대하여도 제1항 각 호의 규정이 동일하게 적용되며, 탈중앙화 거래소(DEX) 등 블록체인 기반 플랫폼을 통한 토큰증권 거래에 대하여도 이 조의 적용을 받는다.\n③ 금융위원회는 토큰증권 시장의 공정한 거래질서 확립을 위하여 필요한 경우 분산원장 분석 등 기술적 수단을 활용한 조사를 실시할 수 있다.',
            contentEn:
              '(1) No person shall engage in any of the following in connection with the trading of financial investment instruments:\n1. Using fraudulent means, plans, or schemes\n2. Using documents with false statements or omissions of material facts to obtain money or other property benefits\n3. Using false market prices to induce trading of financial investment instruments\n(2) The provisions of paragraph (1) apply equally to token securities transactions, including transactions conducted through blockchain-based platforms such as decentralized exchanges (DEXs).\n(3) The Financial Services Commission may conduct investigations utilizing technical means such as distributed ledger analysis when necessary to establish fair trading order in the token securities market.',
            chapter: '제4편 불공정거래의 규제',
            sortOrder: 6,
            tags: ['unfair-trading', 'fraud', 'token-securities', 'dex', 'market-integrity', 'blockchain-analysis'],
            appliesToBiz: ['exchange', 'token-issuer', 'defi-protocol', 'fund-manager'],
          },
          {
            articleNum: '제449조',
            articleTitle: '벌칙',
            content:
              '① 다음 각 호의 어느 하나에 해당하는 자는 10년 이하의 징역 또는 그 위반행위로 얻은 이익 또는 회피한 손실액의 1배 이상 3배 이하에 상당하는 벌금에 처한다. 다만, 그 위반행위로 얻은 이익 또는 회피한 손실액이 없거나 산정하기 곤란한 경우 또는 그 벌금이 5억원 이하인 경우에는 벌금의 상한을 5억원으로 한다.\n1. 제178조제1항 각 호의 어느 하나를 위반한 자\n② 토큰증권과 관련하여 제1항 각 호에 해당하는 위반행위를 한 자에 대해서는 동일한 기준의 벌칙이 적용되며, 스마트계약을 이용한 자동화된 부정거래행위의 경우에도 본 조의 벌칙이 적용된다.\n③ 제1항의 징역과 벌금은 이를 병과할 수 있다.',
            contentEn:
              '(1) Any person falling under any of the following shall be punished by imprisonment for not more than 10 years or a fine of 1 to 3 times the gains or avoided losses. If there are no gains or avoided losses, they are difficult to calculate, or the fine is KRW 500 million or less, the maximum fine shall be KRW 500 million.\n1. A person who violates any of Article 178(1)\n(2) The same penalty standards apply to violations related to token securities, including automated fraudulent trading through smart contracts.\n(3) Imprisonment and fine under paragraph (1) may be imposed concurrently.',
            chapter: '제10편 벌칙',
            sortOrder: 7,
            tags: ['penalties', 'imprisonment', 'fine', 'smart-contract-fraud', 'criminal-liability'],
            appliesToBiz: ['exchange', 'token-issuer', 'defi-protocol', 'fund-manager'],
          },
        ],
      },
    },
  });

  console.log(`  ✓ ${capitalMarket.title} — ${capitalMarket.totalArticles} articles archived`);

  console.log('\n✅ KR additional laws seeded');
}

main().catch(console.error).finally(() => prisma.$disconnect());
