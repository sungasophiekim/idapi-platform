import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log('📚 Seeding EU additional laws (eu4)...');

  // 1. MiFIR
  await prisma.lawArchive.create({
    data: {
      jurisdiction: 'EU',
      lawType: 'regulation',
      regulator: 'European Parliament / ESMA',
      title: 'Markets in Financial Instruments Regulation (MiFIR)',
      lawNumber: 'EU-MiFIR-600-2014',
      status: 'active',
      enactedDate: new Date('2014-05-15'),
      effectiveDate: new Date('2018-01-03'),
      lastAmendedDate: new Date('2024-03-08'),
      totalArticles: 12,
      articles: {
        create: [
          {
            articleNum: '1', articleTitle: 'Subject matter and scope', chapter: 'Title I', sortOrder: 1,
            content: 'Subject matter and scope of MiFIR.',
            contentEn: 'MiFIR establishes uniform requirements relating to the disclosure of trade data to the public, reporting of transactions to competent authorities, trading of derivatives and shares on organized venues, non-discriminatory access to clearing, and product intervention powers of ESMA and EBA. The regulation applies to investment firms, market operators, data reporting services providers, and third-country firms providing investment services in the Union. Tokenized securities that qualify as financial instruments under MiFID II fall within MiFIR scope and must comply with transparency and reporting obligations.',
            tags: ['mifir', 'scope', 'transparency', 'tokenized-securities'],
            appliesToBiz: ['exchange', 'sto-issuer', 'rwa-issuer'],
          },
          {
            articleNum: '2', articleTitle: 'Definitions', chapter: 'Title I', sortOrder: 2,
            content: 'Definitions under MiFIR.',
            contentEn: 'Article 2 defines key terms used throughout MiFIR including systematic internaliser, multilateral trading facility (MTF), organized trading facility (OTF), regulated market, liquid market, and financial instrument. These definitions determine which trading venues and activities fall within scope, directly affecting platforms trading tokenized securities. The definitions are aligned with MiFID II to ensure consistent application across the EU financial markets framework.',
            tags: ['definitions', 'mtf', 'otf', 'systematic-internaliser'],
            appliesToBiz: ['exchange', 'sto-issuer'],
          },
          {
            articleNum: '4', articleTitle: 'Pre-trade transparency for trading venues', chapter: 'Title II', sortOrder: 3,
            content: 'Pre-trade transparency obligations.',
            contentEn: 'Trading venues must make public current bid and offer prices and the depth of trading interests at those prices for shares, depositary receipts, ETFs, certificates, and similar financial instruments. Waivers from pre-trade transparency may be granted by competent authorities for large-in-scale orders, reference price systems, and negotiated transactions. Tokenized equity and debt securities traded on MTFs must comply with these order book transparency rules unless a waiver applies.',
            tags: ['pre-trade', 'transparency', 'order-book'],
            appliesToBiz: ['exchange', 'sto-issuer'],
          },
          {
            articleNum: '6', articleTitle: 'Post-trade transparency', chapter: 'Title II', sortOrder: 4,
            content: 'Post-trade transparency for trading venues.',
            contentEn: 'Trading venues must make public the price, volume and time of transactions executed as close to real-time as technically possible. Competent authorities may authorize deferred publication for transactions that are large in scale compared with normal market size. For tokenized securities, post-trade data must be published through Approved Publication Arrangements (APAs) ensuring market-wide price discovery.',
            tags: ['post-trade', 'transparency', 'apa'],
            appliesToBiz: ['exchange', 'sto-issuer'],
          },
          {
            articleNum: '14', articleTitle: 'Obligation for systematic internalisers', chapter: 'Title III', sortOrder: 5,
            content: 'Quote obligation for systematic internalisers.',
            contentEn: 'Systematic internalisers (SIs) must publish firm quotes in liquid shares when they are dealing in sizes up to standard market size. Quotes must be made public on a regular and continuous basis during normal trading hours and must reflect prevailing market conditions. Firms operating bilateral trading platforms for tokenized securities exceeding SI thresholds must meet these quote obligations.',
            tags: ['systematic-internaliser', 'quotes', 'liquidity'],
            appliesToBiz: ['exchange', 'sto-issuer'],
          },
          {
            articleNum: '20', articleTitle: 'Post-trade disclosure by investment firms', chapter: 'Title III', sortOrder: 6,
            content: 'OTC post-trade disclosure.',
            contentEn: 'Investment firms concluding OTC transactions in shares, depositary receipts, ETFs and similar instruments must publish volume, price and time of those transactions through an APA. Publication must occur as close to real-time as possible, subject to deferral regimes for large orders. This captures off-venue trading in tokenized securities between investment firms and institutional clients.',
            tags: ['otc', 'post-trade', 'disclosure'],
            appliesToBiz: ['exchange', 'sto-issuer'],
          },
          {
            articleNum: '23', articleTitle: 'Trading obligation for shares', chapter: 'Title IV', sortOrder: 7,
            content: 'Share trading obligation.',
            contentEn: 'Investment firms must ensure trades in shares admitted to trading on a regulated market or traded on a trading venue take place on a regulated market, MTF, SI or equivalent third-country venue. Exemptions apply for non-systematic, ad-hoc, irregular and infrequent trades. Tokenized shares that qualify as admitted to trading are subject to this on-venue trading mandate.',
            tags: ['trading-obligation', 'shares', 'sto'],
            appliesToBiz: ['exchange', 'sto-issuer'],
          },
          {
            articleNum: '24', articleTitle: 'Trading obligation for derivatives', chapter: 'Title V', sortOrder: 8,
            content: 'Derivatives trading obligation.',
            contentEn: 'Financial counterparties and qualifying non-financial counterparties must conclude transactions in derivatives declared subject to the trading obligation only on regulated markets, MTFs, OTFs, or equivalent third-country venues. ESMA develops draft RTS specifying which classes of derivatives are subject to the obligation. Tokenized derivative contracts meeting classification criteria must be traded on authorized venues.',
            tags: ['derivatives', 'trading-obligation', 'otf'],
            appliesToBiz: ['exchange', 'defi-protocol'],
          },
          {
            articleNum: '26', articleTitle: 'Obligation to report transactions', chapter: 'Title IV', sortOrder: 9,
            content: 'Transaction reporting to competent authorities.',
            contentEn: 'Investment firms executing transactions in financial instruments must report complete and accurate details to the competent authority as quickly as possible, and no later than the close of the following working day (T+1). Reports must include 65 fields covering instrument identification (ISIN), buyer/seller identification (LEI), quantity, price, venue and decision maker. Firms trading tokenized securities must ensure their transaction reporting systems capture DLT-based trades with equivalent data quality.',
            tags: ['transaction-reporting', 't+1', 'lei', 'isin'],
            appliesToBiz: ['exchange', 'sto-issuer', 'rwa-issuer'],
          },
          {
            articleNum: '28', articleTitle: 'Obligation to trade on regulated venues', chapter: 'Title V', sortOrder: 10,
            content: 'Venue trading obligation for derivatives.',
            contentEn: 'Financial counterparties and qualifying non-financial counterparties must trade derivatives subject to the clearing obligation only on regulated markets, MTFs, OTFs or equivalent third-country venues. This complements the EMIR clearing obligation by mandating transparent execution. DeFi protocols offering derivative contracts to EU counterparties must assess whether they fall within scope.',
            tags: ['venue-obligation', 'derivatives', 'emir'],
            appliesToBiz: ['exchange', 'defi-protocol'],
          },
          {
            articleNum: '36', articleTitle: 'Non-discriminatory access to CCPs', chapter: 'Title VI', sortOrder: 11,
            content: 'Open access for CCPs to trading venues.',
            contentEn: 'Central counterparties (CCPs) must accept to clear financial instruments on a non-discriminatory and transparent basis, including as regards collateral requirements and fees relating to access, regardless of the trading venue on which the transaction is executed. This open access provision is critical to enabling interoperability between tokenized securities venues and traditional clearing infrastructure.',
            tags: ['ccp', 'open-access', 'clearing'],
            appliesToBiz: ['exchange', 'sto-issuer'],
          },
          {
            articleNum: '41', articleTitle: 'Non-discriminatory access to benchmarks', chapter: 'Title VI', sortOrder: 12,
            content: 'Open access to benchmarks for CCPs and venues.',
            contentEn: 'Where the value of a financial instrument is calculated by reference to a benchmark, the person with proprietary rights to the benchmark must ensure non-discriminatory access for clearing and trading purposes for CCPs and trading venues. Access must include licenses of relevant information and pricing. Providers of crypto-asset indices used to reference tokenized derivatives may fall within these obligations.',
            tags: ['benchmark', 'open-access', 'indices'],
            appliesToBiz: ['exchange', 'defi-protocol'],
          },
        ],
      },
    },
  });

  // 2. CSDR
  await prisma.lawArchive.create({
    data: {
      jurisdiction: 'EU',
      lawType: 'regulation',
      regulator: 'European Parliament / ESMA',
      title: 'Central Securities Depositories Regulation (CSDR)',
      lawNumber: 'EU-CSDR-909-2014',
      status: 'active',
      enactedDate: new Date('2014-07-23'),
      effectiveDate: new Date('2014-09-17'),
      lastAmendedDate: new Date('2023-12-27'),
      totalArticles: 10,
      articles: {
        create: [
          {
            articleNum: '1', articleTitle: 'Subject matter', chapter: 'Title I', sortOrder: 1,
            content: 'Subject matter.',
            contentEn: 'CSDR lays down uniform requirements for the settlement of financial instruments in the EU and rules on the organization and conduct of central securities depositories (CSDs) to promote safe, efficient and smooth settlement. The regulation is directly relevant for tokenized securities since DLT-based settlement systems must achieve equivalent levels of safety and legal certainty. The DLT Pilot Regime (Regulation 2022/858) provides targeted exemptions from CSDR for eligible DLT market infrastructures.',
            tags: ['csdr', 'settlement', 'dlt-pilot'],
            appliesToBiz: ['sto-issuer', 'rwa-issuer', 'exchange'],
          },
          {
            articleNum: '2', articleTitle: 'Definitions', chapter: 'Title I', sortOrder: 2,
            content: 'Definitions.',
            contentEn: 'Article 2 defines CSD, securities settlement system, settlement, settlement fail, book-entry form, dematerialised form, and immobilisation. These definitions determine the perimeter of CSD authorization and settlement obligations. Tokenized securities using DLT must be analyzed against book-entry and dematerialised form concepts to determine CSDR treatment.',
            tags: ['definitions', 'book-entry', 'dematerialised'],
            appliesToBiz: ['sto-issuer', 'rwa-issuer'],
          },
          {
            articleNum: '3', articleTitle: 'Book-entry form', chapter: 'Title II', sortOrder: 3,
            content: 'Requirement for book-entry form.',
            contentEn: 'Issuers established in the Union that issue or have issued transferable securities admitted to trading or traded on trading venues must arrange for such securities to be represented in book-entry form through immobilisation or subsequent to direct issuance in dematerialised form. This requirement is a cornerstone question for tokenized securities: DLT-based tokens must be structured to satisfy book-entry form under national and EU law.',
            tags: ['book-entry', 'dematerialisation', 'issuers'],
            appliesToBiz: ['sto-issuer', 'rwa-issuer', 'token-issuer'],
          },
          {
            articleNum: '5', articleTitle: 'Intended settlement date', chapter: 'Title II', sortOrder: 4,
            content: 'T+2 settlement cycle.',
            contentEn: 'Any participant in a securities settlement system which settles transactions in transferable securities, money-market instruments, units in collective investment undertakings and emission allowances must settle those transactions on the intended settlement date, which must be no later than the second business day after trading takes place (T+2). DLT-based settlement systems aim to achieve near-instant or atomic settlement, which is consistent with or faster than the T+2 maximum.',
            tags: ['t+2', 'settlement-cycle', 'atomic-settlement'],
            appliesToBiz: ['sto-issuer', 'exchange'],
          },
          {
            articleNum: '6', articleTitle: 'Measures to prevent settlement fails', chapter: 'Title II', sortOrder: 5,
            content: 'Settlement discipline.',
            contentEn: 'Trading venues must establish procedures that enable confirmation of relevant details of transactions on the date the transaction has been executed. Investment firms must take measures to limit the number of settlement fails including matching trade details, maintaining standing settlement instructions and facilitating timely settlement. These operational requirements translate to allocation and confirmation workflows in tokenized securities platforms.',
            tags: ['settlement-discipline', 'prevention', 'matching'],
            appliesToBiz: ['sto-issuer', 'exchange'],
          },
          {
            articleNum: '7', articleTitle: 'Measures to address settlement fails', chapter: 'Title II', sortOrder: 6,
            content: 'Cash penalties and buy-ins.',
            contentEn: 'CSDs must have in place a system that monitors settlement fails and imposes cash penalties on participants that cause settlement fails. Penalties are calculated daily for each business day a transaction fails to settle. The mandatory buy-in regime has been deferred and is being reviewed under the CSDR Refit. DLT-based settlement claims to reduce settlement fails via atomic DvP mechanisms.',
            tags: ['cash-penalties', 'buy-in', 'dvp'],
            appliesToBiz: ['sto-issuer', 'exchange'],
          },
          {
            articleNum: '16', articleTitle: 'Authorization of CSDs', chapter: 'Title III', sortOrder: 7,
            content: 'CSD authorization.',
            contentEn: 'Any legal person that falls within the definition of a CSD must obtain authorization from the competent authority of the Member State where it is established before commencing activities. Authorization covers core services (notary, central maintenance and settlement) and specifies which services may be provided. Entities operating tokenized securities settlement infrastructures must assess CSD authorization or rely on the DLT Pilot Regime sandbox.',
            tags: ['authorization', 'csd', 'core-services'],
            appliesToBiz: ['sto-issuer', 'exchange'],
          },
          {
            articleNum: '23', articleTitle: 'Freedom to provide services', chapter: 'Title III', sortOrder: 8,
            content: 'Passporting and CSD operating requirements.',
            contentEn: 'An authorized CSD may provide services referred to in the Annex within the territory of the Union, including through establishing a branch, provided that those services are covered by the authorization. CSDs must comply with prudential, organizational and conduct of business requirements on an ongoing basis, including IT systems, cybersecurity, and outsourcing rules. DLT-based CSDs must demonstrate equivalent operational resilience.',
            tags: ['passporting', 'operating-requirements', 'resilience'],
            appliesToBiz: ['sto-issuer', 'exchange'],
          },
          {
            articleNum: '36', articleTitle: 'General provisions on settlement finality', chapter: 'Title IV', sortOrder: 9,
            content: 'Settlement finality.',
            contentEn: 'For each securities settlement system it operates, a CSD must have rules and procedures that ensure the finality of settlement no later than the end of the business day of the intended settlement date. The CSD must clearly define the moments of entry and irrevocability of transfer orders in the securities settlement system, in line with Directive 98/26/EC. Settlement finality in DLT systems must be legally robust against re-orgs and forks.',
            tags: ['settlement-finality', 'irrevocability', 'finality-directive'],
            appliesToBiz: ['sto-issuer', 'exchange'],
          },
          {
            articleNum: '37', articleTitle: 'CSD links', chapter: 'Title IV', sortOrder: 10,
            content: 'CSD links and interoperability.',
            contentEn: 'Before establishing a link, and on an ongoing basis once the link has been established, a CSD must identify, assess, monitor and manage all potential sources of risk for itself and its participants arising from the link arrangement. Links must be based on an adequate legal arrangement that grants clarity to the respective rights and obligations. Interoperability between traditional CSDs and DLT settlement platforms requires carefully engineered legal and technical bridges.',
            tags: ['csd-links', 'interoperability', 'bridges'],
            appliesToBiz: ['sto-issuer', 'exchange'],
          },
        ],
      },
    },
  });

  // 3. Prospectus Regulation
  await prisma.lawArchive.create({
    data: {
      jurisdiction: 'EU',
      lawType: 'regulation',
      regulator: 'European Parliament / ESMA',
      title: 'Prospectus Regulation',
      lawNumber: 'EU-Prospectus-2017-1129',
      status: 'active',
      enactedDate: new Date('2017-06-14'),
      effectiveDate: new Date('2019-07-21'),
      lastAmendedDate: new Date('2024-04-14'),
      totalArticles: 12,
      articles: {
        create: [
          {
            articleNum: '1', articleTitle: 'Subject matter, scope and exemptions', chapter: 'Chapter I', sortOrder: 1,
            content: 'Scope of the Prospectus Regulation.',
            contentEn: 'The Prospectus Regulation lays down requirements for the drawing up, approval and distribution of the prospectus to be published when securities are offered to the public or admitted to trading on a regulated market situated or operating within a Member State. The regulation exempts small offerings below EUR 1 million over 12 months and certain qualified investor offerings. Security token offerings (STOs) fall within scope where tokens constitute transferable securities.',
            tags: ['prospectus', 'scope', 'sto'],
            appliesToBiz: ['sto-issuer', 'ico-issuer', 'rwa-issuer'],
          },
          {
            articleNum: '2', articleTitle: 'Definitions', chapter: 'Chapter I', sortOrder: 2,
            content: 'Definitions.',
            contentEn: 'Article 2 defines transferable securities, equity securities, non-equity securities, offer of securities to the public, qualified investors, home Member State and host Member State. The definition of "transferable securities" incorporates MiFID II and is the key gateway for determining whether a crypto-asset requires a prospectus. Tokens with equity-like features (dividends, voting) are typically captured.',
            tags: ['definitions', 'transferable-securities'],
            appliesToBiz: ['sto-issuer', 'ico-issuer'],
          },
          {
            articleNum: '3', articleTitle: 'Obligation to publish prospectus', chapter: 'Chapter II', sortOrder: 3,
            content: 'Prospectus publication obligation.',
            contentEn: 'Securities shall only be offered to the public in the Union after prior publication of a prospectus approved by the competent authority. Securities shall only be admitted to trading on a regulated market situated or operating in the Union after prior publication of a prospectus. STO issuers must publish an approved prospectus unless an exemption applies, before marketing tokens to EU retail investors.',
            tags: ['publication', 'obligation', 'approval'],
            appliesToBiz: ['sto-issuer', 'ico-issuer', 'rwa-issuer'],
          },
          {
            articleNum: '4', articleTitle: 'Voluntary prospectus', chapter: 'Chapter II', sortOrder: 4,
            content: 'Voluntary drawing up of a prospectus.',
            contentEn: 'Where an offer of securities to the public or an admission to trading on a regulated market is outside the scope of this Regulation, the issuer, the offeror or person asking for admission may voluntarily draw up a prospectus in accordance with this Regulation. A voluntary prospectus approved by the competent authority entails the rights and obligations provided for under this Regulation and is subject to all provisions as supervised by that authority. Exempt issuers may opt-in to gain passporting rights.',
            tags: ['voluntary', 'opt-in', 'passporting'],
            appliesToBiz: ['sto-issuer', 'rwa-issuer'],
          },
          {
            articleNum: '5', articleTitle: 'Subsequent resale of securities', chapter: 'Chapter II', sortOrder: 5,
            content: 'Exemptions and subsequent resale.',
            contentEn: 'Any subsequent resale of securities which were previously the subject of one or more of the types of offer of securities to the public listed in points (a) to (d) of Article 1(4) shall be considered as a separate offer and the definition in point (d) of Article 2 applies for determining whether that resale is an offer of securities to the public. Secondary market resale of exempt STO tokens requires fresh analysis of whether a new public offer is triggered.',
            tags: ['resale', 'secondary-market', 'exemption'],
            appliesToBiz: ['sto-issuer', 'exchange'],
          },
          {
            articleNum: '6', articleTitle: 'Information in prospectus', chapter: 'Chapter II', sortOrder: 6,
            content: 'Information required in a prospectus.',
            contentEn: 'The prospectus must contain the necessary information which is material to an investor for making an informed assessment of the assets and liabilities, profits and losses, financial position and prospects of the issuer and any guarantor, the rights attaching to the securities and the reasons for the issuance and its impact on the issuer. This information may vary depending on the nature of the issuer, the type of securities, the circumstances of the issuer and, where relevant, whether or not the non-equity securities have a denomination per unit of at least EUR 100,000.',
            tags: ['disclosure', 'material-information', 'risk-factors'],
            appliesToBiz: ['sto-issuer', 'rwa-issuer'],
          },
          {
            articleNum: '7', articleTitle: 'The prospectus summary', chapter: 'Chapter II', sortOrder: 7,
            content: 'Summary requirements.',
            contentEn: 'The prospectus must include a summary providing the key information that investors need in order to understand the nature and the risks of the issuer, the guarantor and the securities being offered or admitted to trading. The summary must be accurate, fair, clear and not misleading and be presented and laid out in a way that is easy to read, using characters of readable size. It must be a maximum of seven sides of A4-sized paper when printed.',
            tags: ['summary', 'key-information', 'retail'],
            appliesToBiz: ['sto-issuer', 'rwa-issuer'],
          },
          {
            articleNum: '8', articleTitle: 'Universal Registration Document', chapter: 'Chapter III', sortOrder: 8,
            content: 'URD.',
            contentEn: 'Any issuer whose securities are admitted to trading on a regulated market or a multilateral trading facility may draw up every financial year a registration document in the form of a universal registration document (URD) describing the company organization, business, financial position, earnings and prospects, governance and shareholding structure. The URD acts as a shelf registration enabling fast-track prospectus approval for subsequent offerings.',
            tags: ['urd', 'shelf-registration', 'frequent-issuer'],
            appliesToBiz: ['sto-issuer', 'rwa-issuer'],
          },
          {
            articleNum: '11', articleTitle: 'Responsibility attaching to the prospectus', chapter: 'Chapter III', sortOrder: 9,
            content: 'Prospectus liability.',
            contentEn: 'Member States must ensure that responsibility for the information given in a prospectus, and any supplement thereto, attaches to at least the issuer or its administrative, management or supervisory bodies, the offeror, the person asking for admission to trading on a regulated market or the guarantor, as the case may be. The persons responsible for the prospectus must be clearly identified in the prospectus by their names and functions, together with a declaration that the information is in accordance with the facts and contains no omission likely to affect its import.',
            tags: ['liability', 'responsibility', 'approval'],
            appliesToBiz: ['sto-issuer', 'rwa-issuer'],
          },
          {
            articleNum: '12', articleTitle: 'Validity of a prospectus', chapter: 'Chapter III', sortOrder: 10,
            content: '12-month validity.',
            contentEn: 'A prospectus, whether a single document or consisting of separate documents, shall be valid for 12 months after its approval for offers to the public or admissions to trading on a regulated market, provided that it is completed by any supplement required pursuant to Article 23. Where a prospectus consists of separate documents, the validity period shall begin upon approval of the securities note.',
            tags: ['validity', '12-months', 'supplement'],
            appliesToBiz: ['sto-issuer', 'rwa-issuer'],
          },
          {
            articleNum: '17', articleTitle: 'Final offer price and amount', chapter: 'Chapter III', sortOrder: 11,
            content: 'Price and amount disclosure.',
            contentEn: 'Where the final offer price and/or amount of securities to be offered to the public cannot be included in the prospectus, the prospectus must disclose the maximum price and/or the maximum amount of securities, where available, or the valuation methods and criteria, and/or conditions, in accordance with which the final offer price is to be determined and an explanation of any valuation methods used. Investors who have accepted to purchase the securities before the final offer price or amount is disclosed have the right to withdraw their acceptances within two working days.',
            tags: ['price-range', 'withdrawal-rights', 'book-building'],
            appliesToBiz: ['sto-issuer', 'ico-issuer'],
          },
          {
            articleNum: '22', articleTitle: 'Advertisements', chapter: 'Chapter IV', sortOrder: 12,
            content: 'Marketing and advertising rules.',
            contentEn: 'Any advertisement relating either to an offer of securities to the public or to an admission to trading on a regulated market shall comply with the principles contained in this Article. Advertisements must state that a prospectus has been or will be published, indicate where investors are or will be able to obtain it, and be clearly recognizable as such. Information contained in an advertisement shall not be inaccurate or misleading and shall be consistent with the information contained in the prospectus.',
            tags: ['advertising', 'marketing', 'consistency'],
            appliesToBiz: ['sto-issuer', 'ico-issuer'],
          },
        ],
      },
    },
  });

  // 4. Consumer Credit Directive
  await prisma.lawArchive.create({
    data: {
      jurisdiction: 'EU',
      lawType: 'directive',
      regulator: 'European Parliament / EBA',
      title: 'Consumer Credit Directive (CCD II)',
      lawNumber: 'EU-CCD-2023-2225',
      status: 'active',
      enactedDate: new Date('2023-10-18'),
      effectiveDate: new Date('2026-11-20'),
      totalArticles: 8,
      articles: {
        create: [
          {
            articleNum: '1', articleTitle: 'Scope', chapter: 'Chapter I', sortOrder: 1,
            content: 'Scope of CCD II.',
            contentEn: 'The Directive applies to credit agreements between consumers and creditors or credit intermediaries, including credit agreements up to EUR 100,000 and, importantly for crypto, credit agreements collateralized by crypto-assets or intended to acquire crypto-assets. Interest-free credit, BNPL, and small-amount credit previously excluded are now brought within scope. The Directive replaces Directive 2008/48/EC and aims to modernize consumer protection for digital lending.',
            tags: ['scope', 'consumer-credit', 'crypto-collateral'],
            appliesToBiz: ['defi-protocol', 'payment-service', 'exchange'],
          },
          {
            articleNum: '3', articleTitle: 'Definitions', chapter: 'Chapter I', sortOrder: 2,
            content: 'Definitions including crypto-asset credit.',
            contentEn: 'Article 3 defines consumer, creditor, credit intermediary, credit agreement, overdraft, APR, total cost of credit, and introduces concepts relevant to crypto lending such as credit collateralized by crypto-assets. A crypto-collateralized loan to a consumer triggers full CCD II obligations including pre-contractual disclosure and creditworthiness assessment. DeFi lending protocols serving EU consumers must assess whether their offerings constitute regulated credit.',
            tags: ['definitions', 'apr', 'crypto-lending'],
            appliesToBiz: ['defi-protocol', 'exchange'],
          },
          {
            articleNum: '5', articleTitle: 'Information disclosure - APR', chapter: 'Chapter II', sortOrder: 3,
            content: 'Pre-contractual information and APR.',
            contentEn: 'Creditors and, where applicable, credit intermediaries must provide the consumer with the personalised information needed to compare different offers in order to take an informed decision on whether to conclude a credit agreement. The Standard European Consumer Credit Information (SECCI) form must disclose the Annual Percentage Rate (APR) calculated on a standardised basis, total amount payable, number and periodicity of installments, and all charges. Crypto-denominated credit must convert values for transparency.',
            tags: ['secci', 'apr', 'pre-contractual'],
            appliesToBiz: ['defi-protocol', 'payment-service'],
          },
          {
            articleNum: '9', articleTitle: 'Creditworthiness assessment', chapter: 'Chapter III', sortOrder: 4,
            content: 'Mandatory creditworthiness assessment.',
            contentEn: 'Before concluding a credit agreement, the creditor must make a thorough assessment of the consumers creditworthiness based on necessary, sufficient and proportionate information about the consumers income, expenses and other financial and economic circumstances. The creditor shall grant credit only where the result of the creditworthiness assessment indicates that the obligations resulting from the credit agreement are likely to be met. Automated decision making is permitted but consumers have a right to human review.',
            tags: ['creditworthiness', 'affordability', 'automated-decision'],
            appliesToBiz: ['defi-protocol', 'payment-service'],
          },
          {
            articleNum: '16', articleTitle: 'Right of withdrawal', chapter: 'Chapter IV', sortOrder: 5,
            content: '14-day cooling-off period.',
            contentEn: 'The consumer has a period of 14 calendar days in which to withdraw from the credit agreement without giving any reason. The period of withdrawal begins either from the day of the conclusion of the credit agreement, or from the day on which the consumer receives the contractual terms and conditions and the information, if that day is later than the date of conclusion. For crypto-backed loans the collateral must be promptly released upon effective withdrawal.',
            tags: ['withdrawal', 'cooling-off', '14-days'],
            appliesToBiz: ['defi-protocol', 'payment-service'],
          },
          {
            articleNum: '17', articleTitle: 'Early repayment', chapter: 'Chapter IV', sortOrder: 6,
            content: 'Right to early repayment.',
            contentEn: 'The consumer has the right at any time to discharge fully or partially his obligations under a credit agreement. In such cases, the consumer is entitled to a reduction in the total cost of the credit for the remaining duration of the contract. The creditor may be entitled to fair and objectively justified compensation for possible costs directly linked to early repayment, subject to caps defined in the Directive.',
            tags: ['early-repayment', 'prepayment', 'compensation'],
            appliesToBiz: ['defi-protocol', 'payment-service'],
          },
          {
            articleNum: '21', articleTitle: 'Forbearance measures', chapter: 'Chapter V', sortOrder: 7,
            content: 'Forbearance for struggling consumers.',
            contentEn: 'Creditors shall, where appropriate, adopt reasonable forbearance measures before enforcement proceedings are initiated. Such measures may include total or partial refinancing of a credit agreement, modification of the existing terms and conditions such as extension of the term, change of the type of credit, deferral of all or part of the instalment repayments, change of the interest rate, or temporary suspension of payments. This is particularly important to prevent cascading liquidations in crypto-collateralized lending during market stress.',
            tags: ['forbearance', 'arrears', 'liquidation'],
            appliesToBiz: ['defi-protocol', 'payment-service'],
          },
          {
            articleNum: '36', articleTitle: 'Penalties', chapter: 'Chapter VI', sortOrder: 8,
            content: 'Penalties for non-compliance.',
            contentEn: 'Member States shall lay down the rules on penalties applicable to infringements of national provisions adopted pursuant to this Directive and shall take all measures necessary to ensure that they are implemented. The penalties provided for must be effective, proportionate and dissuasive. For legal persons maximum fines shall be at least 4% of annual turnover. Member States shall notify the Commission of those rules and measures by 20 November 2026.',
            tags: ['penalties', 'enforcement', 'fines'],
            appliesToBiz: ['defi-protocol', 'payment-service', 'exchange'],
          },
        ],
      },
    },
  });

  // 5. SFDR
  await prisma.lawArchive.create({
    data: {
      jurisdiction: 'EU',
      lawType: 'regulation',
      regulator: 'European Parliament / ESAs',
      title: 'Sustainable Finance Disclosure Regulation (SFDR)',
      lawNumber: 'EU-SFDR-2019-2088',
      status: 'active',
      enactedDate: new Date('2019-11-27'),
      effectiveDate: new Date('2021-03-10'),
      totalArticles: 8,
      articles: {
        create: [
          {
            articleNum: '1', articleTitle: 'Subject matter', chapter: 'Chapter I', sortOrder: 1,
            content: 'Subject matter.',
            contentEn: 'SFDR lays down harmonised rules for financial market participants and financial advisers on transparency with regard to the integration of sustainability risks and the consideration of adverse sustainability impacts in their processes and the provision of sustainability-related information with respect to financial products. Crypto-focused funds and tokenized fund structures fall within scope and must provide ESG disclosures aligned with SFDR.',
            tags: ['sfdr', 'sustainability', 'esg'],
            appliesToBiz: ['fund-manager', 'rwa-issuer'],
          },
          {
            articleNum: '2', articleTitle: 'Definitions', chapter: 'Chapter I', sortOrder: 2,
            content: 'Definitions.',
            contentEn: 'Article 2 defines financial market participant, financial adviser, financial product, sustainable investment, sustainability risk, sustainability factors, principal adverse impacts and environmental or social characteristics. The definitions determine whether an entity must comply with SFDR and which disclosure category applies. Asset managers running crypto-themed funds must map their strategies to these categories.',
            tags: ['definitions', 'sustainable-investment', 'pai'],
            appliesToBiz: ['fund-manager'],
          },
          {
            articleNum: '3', articleTitle: 'Transparency of sustainability risk policies', chapter: 'Chapter II', sortOrder: 3,
            content: 'Sustainability risk policies.',
            contentEn: 'Financial market participants must publish on their websites information about their policies on the integration of sustainability risks in their investment decision-making process. Financial advisers must similarly publish information about integration into their investment or insurance advice. For crypto funds this includes assessing environmental risks of proof-of-work assets and governance risks of unaudited protocols.',
            tags: ['policy', 'integration', 'website-disclosure'],
            appliesToBiz: ['fund-manager'],
          },
          {
            articleNum: '4', articleTitle: 'Principal adverse impacts', chapter: 'Chapter II', sortOrder: 4,
            content: 'PAI statement.',
            contentEn: 'Financial market participants must publish and maintain on their websites, where they consider principal adverse impacts of investment decisions on sustainability factors, a statement on their due diligence policies with respect to those impacts, or, where they do not consider such impacts, clear reasons why they do not (comply-or-explain). Entities with more than 500 employees must consider PAIs on a mandatory basis. PAI indicators include GHG emissions, biodiversity, water, and social factors.',
            tags: ['pai', 'comply-or-explain', 'ghg-emissions'],
            appliesToBiz: ['fund-manager'],
          },
          {
            articleNum: '6', articleTitle: 'Pre-contractual disclosures', chapter: 'Chapter III', sortOrder: 5,
            content: 'Pre-contractual sustainability risk disclosures.',
            contentEn: 'All financial products must include in pre-contractual disclosures a description of the manner in which sustainability risks are integrated into investment decisions, and the results of the assessment of the likely impacts of sustainability risks on the returns of the financial product. Where sustainability risks are not deemed relevant, the disclosures must contain a clear and concise explanation of the reasons therefor.',
            tags: ['pre-contractual', 'risk-disclosure', 'article-6'],
            appliesToBiz: ['fund-manager'],
          },
          {
            articleNum: '8', articleTitle: 'Article 8 products', chapter: 'Chapter III', sortOrder: 6,
            content: 'Light green funds.',
            contentEn: 'Where a financial product promotes, among other characteristics, environmental or social characteristics, or a combination of those characteristics, provided that the companies in which the investments are made follow good governance practices, the pre-contractual disclosures must include information on how those characteristics are met and, if an index has been designated as a reference benchmark, information on whether and how this index is consistent with those characteristics. These are commonly called "light green" funds.',
            tags: ['article-8', 'light-green', 'esg-promotion'],
            appliesToBiz: ['fund-manager'],
          },
          {
            articleNum: '9', articleTitle: 'Article 9 products', chapter: 'Chapter III', sortOrder: 7,
            content: 'Dark green funds.',
            contentEn: 'Where a financial product has sustainable investment as its objective and an index has been designated as a reference benchmark, the information to be disclosed in pre-contractual disclosures must be accompanied by information on how the designated index is aligned with that objective and an explanation as to why and how the designated index aligned with that objective differs from a broad market index. These are "dark green" products subject to the strictest disclosure regime.',
            tags: ['article-9', 'dark-green', 'sustainable-objective'],
            appliesToBiz: ['fund-manager'],
          },
          {
            articleNum: '11', articleTitle: 'Periodic reporting', chapter: 'Chapter IV', sortOrder: 8,
            content: 'Periodic reports.',
            contentEn: 'Where financial market participants make available a financial product as referred to in Article 8 or Article 9, they must include a description of the extent to which environmental or social characteristics are met or, for Article 9 products, the overall sustainability-related impact of the financial product by means of relevant sustainability indicators. Periodic reports must be integrated into existing annual reports and comply with RTS technical templates.',
            tags: ['periodic-reporting', 'rts-template', 'annual-report'],
            appliesToBiz: ['fund-manager'],
          },
        ],
      },
    },
  });

  // 6. BRRD
  await prisma.lawArchive.create({
    data: {
      jurisdiction: 'EU',
      lawType: 'directive',
      regulator: 'European Parliament / EBA',
      title: 'Bank Recovery and Resolution Directive (BRRD)',
      lawNumber: 'EU-BRRD-2014-59',
      status: 'active',
      enactedDate: new Date('2014-05-15'),
      effectiveDate: new Date('2015-01-01'),
      lastAmendedDate: new Date('2019-05-20'),
      totalArticles: 8,
      articles: {
        create: [
          {
            articleNum: '1', articleTitle: 'Subject matter and scope', chapter: 'Title I', sortOrder: 1,
            content: 'Subject matter.',
            contentEn: 'BRRD lays down rules and procedures relating to the recovery and resolution of credit institutions and investment firms, their parents, financial holding companies and branches of third-country institutions established in the Union. Banks providing crypto custody, tokenization, or stablecoin reserve services fall within scope and must integrate these activities into recovery and resolution planning.',
            tags: ['brrd', 'recovery', 'resolution'],
            appliesToBiz: ['exchange', 'stablecoin-issuer'],
          },
          {
            articleNum: '4', articleTitle: 'Simplified obligations for certain institutions', chapter: 'Title I', sortOrder: 2,
            content: 'Determination of resolution authorities and proportionality.',
            contentEn: 'Member States must designate one or more resolution authorities empowered to apply the resolution tools and exercise the resolution powers. Authorities may apply simplified obligations to institutions whose failure would have limited systemic impact. Crypto-facing banks should document their crypto-asset activities (custody, reserves, trading) as part of institutional risk assessments relevant to resolution planning.',
            tags: ['resolution-authority', 'proportionality', 'designation'],
            appliesToBiz: ['exchange', 'stablecoin-issuer'],
          },
          {
            articleNum: '27', articleTitle: 'Early intervention measures', chapter: 'Title III', sortOrder: 3,
            content: 'Early intervention triggers.',
            contentEn: 'Where an institution infringes or, due inter alia to a rapidly deteriorating financial condition, is likely in the near future to infringe the requirements of Regulation 575/2013, Directive 2013/36/EU, MiFID II or any of Articles 3 to 7, 14 to 17, and 24 to 26 of Regulation 600/2014, competent authorities have at their disposal early intervention measures including requiring the institution to implement arrangements provided in the recovery plan, draw up an action programme, convene a meeting of shareholders, and change business strategy.',
            tags: ['early-intervention', 'triggers', 'recovery-plan'],
            appliesToBiz: ['exchange', 'stablecoin-issuer'],
          },
          {
            articleNum: '32', articleTitle: 'Conditions for resolution', chapter: 'Title IV', sortOrder: 4,
            content: 'Resolution conditions.',
            contentEn: 'A resolution action shall be taken only if the resolution authority considers that all of the following conditions are met: (a) the determination that the institution is failing or likely to fail; (b) there is no reasonable prospect that any alternative private sector measures or supervisory action would prevent the failure within a reasonable timeframe; and (c) a resolution action is necessary in the public interest. Failures of crypto-exposed banks have tested these conditions during stress events.',
            tags: ['failing-or-likely-to-fail', 'public-interest', 'resolution'],
            appliesToBiz: ['exchange', 'stablecoin-issuer'],
          },
          {
            articleNum: '37', articleTitle: 'General principles of resolution tools', chapter: 'Title IV', sortOrder: 5,
            content: 'Resolution tools.',
            contentEn: 'Member States shall ensure that the resolution authorities have the necessary powers to apply the resolution tools to institutions and entities that meet the applicable conditions for resolution. The resolution tools are: (a) the sale of business tool; (b) the bridge institution tool; (c) the asset separation tool; and (d) the bail-in tool. The tools may be applied individually or in any combination, except that the asset separation tool may be applied only together with another resolution tool.',
            tags: ['resolution-tools', 'bridge-institution', 'sale-of-business'],
            appliesToBiz: ['exchange', 'stablecoin-issuer'],
          },
          {
            articleNum: '43', articleTitle: 'Bail-in tool', chapter: 'Title IV', sortOrder: 6,
            content: 'Bail-in.',
            contentEn: 'Member States shall ensure that the resolution authorities have the necessary powers to apply the bail-in tool to recapitalize an institution, to convert to equity or reduce the principal amount of claims or debt instruments that are transferred, or to convert debt to equity. When the bail-in tool is applied for recapitalization, the institution must continue to meet the conditions for authorization. Tokenized deposit claims held via DLT may be subject to bail-in in the same way as traditional liabilities.',
            tags: ['bail-in', 'write-down', 'conversion'],
            appliesToBiz: ['exchange', 'stablecoin-issuer'],
          },
          {
            articleNum: '81', articleTitle: 'Recovery plans', chapter: 'Title III', sortOrder: 7,
            content: 'Recovery planning.',
            contentEn: 'Member States shall ensure that each institution which is not part of a group subject to consolidated supervision draws up and maintains a recovery plan providing for measures to be taken by the institution to restore its financial position following a significant deterioration of its financial situation. The recovery plan must be updated at least annually and after any change to the legal or organizational structure. Banks with material crypto exposures should include scenarios modeling crypto market shocks.',
            tags: ['recovery-plan', 'scenarios', 'stress-testing'],
            appliesToBiz: ['exchange', 'stablecoin-issuer'],
          },
          {
            articleNum: '102', articleTitle: 'Target level for resolution financing arrangements', chapter: 'Title VII', sortOrder: 8,
            content: 'Single Resolution Fund contributions.',
            contentEn: 'Member States shall ensure that, by 31 December 2024, the available financial means of their financing arrangements reach at least 1% of the amount of covered deposits of all the institutions authorised in their territory. The financing arrangements may be used only for the purposes set out in Article 101 (guarantees, loans, asset purchases, contributions to bridge institution). Funding requirements apply equally to banks that provide services to crypto-asset market participants.',
            tags: ['srf', 'funding', 'covered-deposits'],
            appliesToBiz: ['exchange', 'stablecoin-issuer'],
          },
        ],
      },
    },
  });

  // 7. DAC8
  await prisma.lawArchive.create({
    data: {
      jurisdiction: 'EU',
      lawType: 'directive',
      regulator: 'European Commission / DG TAXUD',
      title: 'DAC8 - Crypto-Asset Reporting Framework',
      lawNumber: 'EU-DAC8-2023-2226',
      status: 'active',
      enactedDate: new Date('2023-10-17'),
      effectiveDate: new Date('2026-01-01'),
      totalArticles: 8,
      articles: {
        create: [
          {
            articleNum: '1', articleTitle: 'Subject matter', chapter: 'Chapter I', sortOrder: 1,
            content: 'Subject matter - automatic exchange on crypto-assets.',
            contentEn: 'DAC8 amends Directive 2011/16/EU on administrative cooperation in the field of taxation to introduce mandatory automatic exchange of information (AEOI) on crypto-assets. The Directive transposes the OECDs Crypto-Asset Reporting Framework (CARF) into EU law and aligns reporting obligations across the single market. It ensures that tax authorities can track income and gains from crypto-asset transactions of EU-resident users across all 27 Member States.',
            tags: ['dac8', 'carf', 'aeoi', 'tax'],
            appliesToBiz: ['exchange', 'wallet-provider', 'defi-protocol'],
          },
          {
            articleNum: '2', articleTitle: 'Scope of application', chapter: 'Chapter I', sortOrder: 2,
            content: 'Scope.',
            contentEn: 'The Directive applies to all Reporting Crypto-Asset Service Providers (RCASPs) that are authorised under MiCA or otherwise carry out crypto-asset services for EU-resident users. It covers reportable crypto-assets including all crypto-assets that may be used for payment or investment purposes, with limited exclusions for central bank digital currencies (CBDCs) and specified e-money products already covered by DAC2. Non-EU providers with EU customers also fall within scope through a registration mechanism.',
            tags: ['scope', 'rcasp', 'mica-alignment'],
            appliesToBiz: ['exchange', 'wallet-provider', 'defi-protocol'],
          },
          {
            articleNum: '3', articleTitle: 'Definitions', chapter: 'Chapter I', sortOrder: 3,
            content: 'Definitions of reportable crypto-asset users and service providers.',
            contentEn: 'Article 3 defines Reporting Crypto-Asset Service Provider (RCASP), Crypto-Asset User, Reportable User, Reportable Transaction, and Reportable Crypto-Asset. Reportable transactions include exchanges between crypto-assets and fiat, exchanges between crypto-assets, and transfers of crypto-assets including reportable retail payment transactions exceeding USD 50,000. The definitions closely mirror OECD CARF for consistency.',
            tags: ['definitions', 'rcasp', 'reportable-transaction'],
            appliesToBiz: ['exchange', 'wallet-provider'],
          },
          {
            articleNum: '8ab', articleTitle: 'Reporting obligations for crypto-asset service providers', chapter: 'Chapter II', sortOrder: 4,
            content: 'Reporting obligations.',
            contentEn: 'Each Reporting Crypto-Asset Service Provider must report information to the competent authority of the Member State of registration on Reportable Users and their Reportable Transactions during the calendar year. The information must be reported by 31 January of the year following the calendar year to which the information relates. RCASPs must carry out due diligence procedures, including self-certification to establish the tax residence of users.',
            tags: ['reporting', 'due-diligence', 'self-certification'],
            appliesToBiz: ['exchange', 'wallet-provider'],
          },
          {
            articleNum: '8ac', articleTitle: 'Information to be reported', chapter: 'Chapter II', sortOrder: 5,
            content: 'Reportable information - transactions.',
            contentEn: 'Reportable information includes the name, address, Member State(s) of residence, TIN(s), date and place of birth of each Reportable User, as well as aggregate fair market value, aggregate number of units, and number of Reportable Transactions per type of Reportable Crypto-Asset, separated into acquisitions and disposals for both fiat-crypto exchanges and crypto-crypto exchanges. Transfer data must also be reported, including for wallet addresses not associated with a known VASP.',
            tags: ['reportable-data', 'tin', 'fair-market-value'],
            appliesToBiz: ['exchange', 'wallet-provider'],
          },
          {
            articleNum: '21', articleTitle: 'Confidentiality', chapter: 'Chapter V', sortOrder: 6,
            content: 'Confidentiality of exchanged information.',
            contentEn: 'Information communicated to a Member State under this Directive shall be covered by the obligation of official secrecy and enjoy the protection extended to similar information under the national law of the Member State which received it. Such information may be used for the assessment, administration and enforcement of the domestic laws of the Member States concerning the taxes covered and may be disclosed in public court proceedings and judicial decisions.',
            tags: ['confidentiality', 'official-secrecy', 'data-protection'],
            appliesToBiz: ['exchange', 'wallet-provider'],
          },
          {
            articleNum: '25a', articleTitle: 'Penalties', chapter: 'Chapter VII', sortOrder: 7,
            content: 'Penalties for non-compliance.',
            contentEn: 'Member States shall lay down the rules on penalties applicable to infringements of national provisions adopted pursuant to this Directive concerning Articles 8aa, 8ab and 8ac, and shall take all measures necessary to ensure that they are implemented and enforced. The penalties provided for shall be effective, proportionate and dissuasive. Minimum monetary penalties for serious infringements such as failure to report must not be less than EUR 20,000 and may reach EUR 150,000 for legal persons.',
            tags: ['penalties', 'enforcement', 'fines'],
            appliesToBiz: ['exchange', 'wallet-provider'],
          },
          {
            articleNum: '27', articleTitle: 'Transposition', chapter: 'Chapter VIII', sortOrder: 8,
            content: 'Implementation deadline.',
            contentEn: 'Member States shall adopt and publish, by 31 December 2025, the laws, regulations and administrative provisions necessary to comply with this Directive. They shall apply those provisions from 1 January 2026. The first reporting by RCASPs shall take place in 2027 in respect of reportable information relating to calendar year 2026. The Commission will review the implementation and may propose further amendments based on OECD developments.',
            tags: ['transposition', 'implementation', '2026'],
            appliesToBiz: ['exchange', 'wallet-provider'],
          },
        ],
      },
    },
  });

  console.log('✅ EU additional laws seeded');
}

main().catch(console.error).finally(() => prisma.$disconnect());
