/**
 * BA Compliance Checker Tests (GZ-803)
 *
 * Comprehensive test suite for BA compliance validation system.
 * Tests all 7 validation rules (4 critical blockers + 3 warnings).
 *
 * Based on real BA-approved business plan template scenarios.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  validateBACompliance,
  generateValidationReport,
  getValidationSummary,
} from '@/lib/validation/ba-compliance-checker';
import {
  validateExportReadiness,
  checkExportEligibility,
} from '@/lib/validation/final-validator';
import {
  checkMonth6SelfSufficiency,
  checkLiquidityNonNegative,
  checkFinancialTablesComplete,
  checkBreakEvenReasonable,
  checkGZFundingIncluded,
  extractFinancialData,
} from '@/lib/validation/checks/financial';
import {
  checkRequiredSectionsComplete,
  checkSourcesDocumented,
  extractStructureData,
} from '@/lib/validation/checks/structure';
import type { WorkshopSession } from '@/types/workshop-session';
import type { PartialFinanzplanungOutput } from '@/types/modules/finanzplanung';
import type { FinancialValidationData, StructureValidationData } from '@/lib/validation/types';

// ============================================================================
// Test Data Factories
// ============================================================================

/**
 * Create a valid workshop session (passes all checks)
 */
function createValidWorkshop(): WorkshopSession {
  return {
    id: 'test-workshop-123',
    userId: 'user-123',
    businessName: 'Test Consulting GmbH',
    businessType: 'DIGITAL_SERVICE',
    status: 'active',
    currentModule: 'gz-zusammenfassung',
    modules: {
      'gz-intake': {
        status: 'completed',
        startedAt: '2024-01-01T00:00:00Z',
        completedAt: '2024-01-01T01:00:00Z',
        data: {
          founder: {
            currentStatus: 'unemployed',
            description: 'Experienced IT consultant with 10 years in software development and project management seeking independence through consulting services.'
          }
        },
      },
      'gz-geschaeftsmodell': {
        status: 'completed',
        data: {
          geschaeftsidee: 'Professional IT consulting services specifically designed for small and medium enterprises across Germany and the DACH region. We provide comprehensive software development guidance, expert project management consulting, and strategic digital transformation advisory services that bridge the gap between complex technology solutions and practical business needs. Our unique value proposition combines deep technical expertise with strong business understanding to deliver measurable results for our clients. The business model focuses on retainer-based consulting relationships that ensure recurring revenue streams while providing consistent value to client organizations through improved operational efficiency and strategic technology adoption. We specialize in helping SMEs navigate the complexities of modern software development, from legacy system modernization to cloud migration strategies. Our approach emphasizes long-term partnerships rather than transactional relationships, enabling us to understand client businesses deeply and provide tailored solutions that drive sustainable growth. The service portfolio includes technical architecture consulting, software development best practices implementation, agile methodology coaching, and digital transformation roadmap development. Each engagement is designed to transfer knowledge to client teams while delivering immediate value through improved processes and technology adoption.',
          zielgruppe: 'Small and medium enterprises in Germany with 50-500 employees seeking digital transformation and software development guidance. Primary sectors include manufacturing, retail, and professional services industries that are increasingly recognizing the need for technology modernization. Target companies typically have annual revenues between 5-50 million EUR and are looking to modernize their technology infrastructure or improve operational processes through better software solutions and strategic technology adoption. Decision makers include IT directors, operations managers, and business owners who value expertise and proven track records in technology implementation. These companies often struggle with outdated systems, manual processes, and lack of integration between different business functions. They require consultants who understand both technology capabilities and business requirements, enabling them to make informed decisions about technology investments that deliver tangible ROI. The target audience values long-term partnerships over transactional relationships and seeks consultants who can provide ongoing guidance and support throughout their digital transformation journey. Geographic focus includes major metropolitan areas where SMEs are concentrated and have greater access to technology resources and skilled personnel.',
          alleinstellungsmerkmal: 'Combination of deep technical knowledge with strong business acumen, allowing us to bridge the gap between technology and business objectives.',
          geschaeftsmodell: 'Retainer-based consulting model with additional project-based engagements for specific implementations.'
        },
      },
      'gz-unternehmen': {
        status: 'completed',
        data: {
          standort: 'Berlin, Germany with flexible remote work capabilities',
          rechtsform: 'GmbH for liability protection and professional credibility',
          beschreibung: 'Technology consulting company specializing in comprehensive digital transformation services for small and medium enterprises across the DACH region. Founded by experienced IT professional with proven track record in software development and business process optimization spanning over a decade in enterprise and startup environments. The company leverages modern development practices, agile methodologies, and cutting-edge technology solutions to deliver value-driven outcomes that align with specific client business objectives and growth strategies. Our approach emphasizes collaboration, transparency, and measurable outcomes to build long-term strategic partnerships with client organizations. We understand that SMEs face unique challenges in technology adoption, including limited resources, budget constraints, and the need for immediate ROI on technology investments. Our methodology addresses these challenges through phased implementation strategies, knowledge transfer programs, and ongoing support structures that ensure sustainable technology adoption and continuous improvement. The company culture promotes innovation, continuous learning, and client success as primary drivers of business growth. We maintain strong partnerships with leading technology vendors and stay current with emerging trends to provide clients with future-ready solutions that scale with their business growth.',
          vision: 'To become the leading technology consulting partner for SMEs in the DACH region, helping businesses achieve sustainable growth through strategic technology adoption.',
          mission: 'We empower small and medium enterprises to leverage technology effectively by providing expert guidance, practical solutions, and ongoing support that drives measurable business results.'
        },
      },
      'gz-markt-wettbewerb': {
        status: 'completed',
        data: {
          marktgroesse: '500 Millionen EUR laut Bitkom Studie 2023',
          marktanalyse: 'The German IT consulting market continues to experience robust growth, driven by accelerating digitalization needs across all industries and sectors. According to Bitkom Research 2023, the market for IT consulting services in Germany reached 500 million EUR with a sustained annual growth rate of 8-12%, demonstrating the strong demand for professional technology guidance and implementation support. Small and medium enterprises represent approximately 35% of this market, creating significant opportunities for specialized providers who understand the unique challenges and requirements of SME technology adoption. Key growth drivers include widespread cloud migration initiatives, increasing cybersecurity threats and compliance requirements, digital transformation mandates, and the need for data-driven decision making capabilities. The market shows particularly strong demand for consultants who can combine deep technical expertise with practical business understanding, enabling them to translate complex technology concepts into actionable business strategies. Regional factors include government digitalization initiatives, Industry 4.0 adoption requirements, and EU regulatory compliance demands such as GDPR and emerging AI regulations. The SME segment specifically values consultants who can provide hands-on implementation support, knowledge transfer, and ongoing guidance rather than theoretical recommendations. Market research indicates that SMEs prioritize consultants with proven track records, transparent pricing models, and the ability to deliver measurable ROI on technology investments.',
          wettbewerber: 'Major competitors include large consulting firms like Accenture and Capgemini, as well as specialized SME-focused consultancies. However, most large firms focus on enterprise clients, leaving opportunities in the SME segment. Regional competitors typically lack the combination of technical depth and business acumen that we provide.',
          wettbewerbsvorteile: 'Specialized focus on SME needs, personal attention, faster response times, and cost-effective pricing compared to large consulting firms.'
        },
      },
      'gz-marketing': {
        status: 'completed',
        data: {
          kanäle: 'Digital Marketing, LinkedIn networking, industry events, referral program',
          marketingstrategie: 'Our comprehensive marketing strategy focuses on establishing thought leadership and building authentic trust within the SME technology community through multiple integrated channels and approaches. We utilize strategic content marketing through LinkedIn articles, industry publications, and technical blogs to consistently demonstrate expertise and share valuable insights that address real business challenges faced by our target audience. Regular networking at industry events, technology conferences, and local business meetups helps build meaningful personal relationships with potential clients and strategic partners. A structured referral program with clear incentives encourages existing satisfied clients to recommend our services to their professional networks. Digital marketing efforts include targeted LinkedIn advertising campaigns, search engine optimization for relevant consulting keywords, and email marketing campaigns that deliver valuable content to prospects and clients. The approach emphasizes relationship building, value demonstration, and educational content delivery over aggressive sales tactics or pressure-based approaches. We maintain an active presence in relevant online communities and forums where our target audience seeks advice and solutions. Speaking engagements at industry events and webinars help establish credibility and reach broader audiences. Case studies and success stories showcase tangible results achieved for clients while respecting confidentiality requirements. The marketing strategy includes regular assessment and optimization based on performance metrics and client feedback to ensure maximum effectiveness and return on marketing investment.',
          zielkunden: 'Small and medium enterprises with 50-500 employees, annual revenues of 5-50 million EUR, located primarily in Berlin-Brandenburg region',
          kundenakquisition: 'Combination of inbound marketing through content creation and outbound networking through industry events and personal referrals.'
        },
      },
      'gz-finanzplanung': {
        status: 'completed',
        data: createValidFinancialPlan(),
      },
      'gz-swot': {
        status: 'completed',
        data: {
          staerken: 'Extensive industry experience with over 10 years in software development, project management, and technical leadership across diverse sectors including fintech, manufacturing, and professional services. Strong technical skills spanning multiple programming languages, frameworks, and modern development methodologies including agile and DevOps practices. Excellent communication abilities that enable effective client relationship management, complex technical concept translation, and stakeholder alignment across all organizational levels. Proven track record of successful project deliveries in previous corporate roles, with demonstrated ability to manage complex implementations from conception to deployment. Deep understanding of business processes and how strategic technology adoption can drive operational improvements, cost reductions, and competitive advantages. Established network of industry contacts, former colleagues, and potential clients through previous professional relationships and ongoing industry engagement. Strong problem-solving capabilities with ability to analyze complex business challenges and design appropriate technology solutions. Experience with both waterfall and agile project methodologies enables flexibility in adapting to different client preferences and project requirements. Track record of building and mentoring technical teams demonstrates leadership capabilities that translate well to consulting engagements.',
          schwaechen: 'Limited initial capital for extensive marketing campaigns and business development activities. Relatively small team size may limit capacity for handling multiple large projects simultaneously. Lack of established brand recognition in the market requiring significant effort to build credibility. No existing client base requiring intensive business development efforts during startup phase. Limited experience with business operations and administrative tasks outside of technical delivery.',
          chancen: 'Growing market demand for digital transformation services among SMEs. Increasing regulatory requirements driving need for compliance consulting. Rising awareness of cybersecurity risks creating opportunities for security consulting. Government initiatives supporting SME digitalization through funding programs. Potential for expansion into adjacent markets such as training and coaching services.',
          risiken: 'Economic uncertainty affecting client budgets for consulting services. Intense competition from established consulting firms with greater resources. Technology changes requiring continuous learning and adaptation. Client dependency risk with potential for project cancellations. Regulatory changes affecting business operations and compliance requirements.'
        },
      },
      'gz-meilensteine': {
        status: 'completed',
        data: {
          meilensteine: [
            {
              name: 'Business Registration and Setup',
              datum: '2024-06-01',
              beschreibung: 'Complete legal registration, obtain necessary licenses, and establish business infrastructure including banking and accounting systems.'
            },
            {
              name: 'First Client Acquisition',
              datum: '2024-08-01',
              beschreibung: 'Secure first paying client through networking and marketing efforts, establishing proof of concept for business model.'
            },
            {
              name: 'Break-even Achievement',
              datum: '2024-12-01',
              beschreibung: 'Reach monthly break-even point with sufficient recurring revenue to cover all operational expenses and owner compensation.'
            }
          ]
        },
      },
      'gz-kpi': {
        status: 'completed',
        data: {
          kpis: [
            {
              name: 'Monthly Recurring Revenue',
              zielwert: 10000,
              beschreibung: 'Target monthly recurring revenue from retainer agreements and ongoing consulting engagements, representing the core foundation of sustainable business operations and growth trajectory.'
            },
            {
              name: 'Client Acquisition Cost',
              zielwert: 500,
              beschreibung: 'Average cost to acquire new client including marketing expenses, business development time, and networking activities, measured to ensure sustainable growth economics.'
            },
            {
              name: 'Client Lifetime Value',
              zielwert: 25000,
              beschreibung: 'Expected total revenue from average client relationship over entire engagement duration, including initial projects and ongoing retainer agreements.'
            },
            {
              name: 'Project Delivery Success Rate',
              zielwert: 95,
              beschreibung: 'Percentage of projects delivered on time and within budget, maintaining high client satisfaction and supporting referral generation and reputation management.'
            }
          ],
          erfolgsmessung: 'Key performance indicators will be monitored monthly through comprehensive reporting dashboards that track financial metrics, client satisfaction scores, and operational efficiency measures. Regular quarterly reviews will assess progress toward annual targets and identify optimization opportunities for continuous improvement. Monthly monitoring includes revenue tracking, client acquisition costs, project profitability analysis, and resource utilization metrics. Quarterly reviews involve deeper analysis of market trends, competitive positioning, and strategic goal alignment. Annual strategic planning sessions will incorporate KPI performance data to refine business objectives and adjust tactical approaches. Client satisfaction surveys will be conducted quarterly to ensure service quality meets expectations. Team productivity metrics will track billable hours, project completion rates, and professional development progress.'
        },
      },
    },
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T02:00:00Z',
  };
}

/**
 * Create valid financial plan (passes all financial checks)
 */
function createValidFinancialPlan(): PartialFinanzplanungOutput {
  // Create 36 months of liquidity data (all positive, properly cumulative)
  const liquidityMonths = [];
  let currentEndbestand = 50000; // Start with enough cash

  for (let i = 0; i < 36; i++) {
    const umsatz = i < 12 ? 6000 + i * 500 : i < 24 ? 12000 : 14000; // Growing revenue
    const gzFunding = i < 6 ? 300 : i < 15 ? 300 : 0; // GZ funding pattern
    const investition = i === 0 ? 15000 : 0; // Initial investment

    const einzahlungenGesamt = umsatz + gzFunding;
    const auszahlungenGesamt = 4000 + investition + 500 + 1800; // Lower costs + privatentnahme

    const endbestand = currentEndbestand + einzahlungenGesamt - auszahlungenGesamt;

    liquidityMonths.push({
      monat: i + 1,
      anfangsbestand: currentEndbestand,
      einzahlungenUmsatz: umsatz,
      einzahlungenSonstige: gzFunding,
      einzahlungenGesamt,
      auszahlungenBetrieb: 4000,
      auszahlungenInvestitionen: investition,
      auszahlungenTilgung: 500,
      auszahlungenPrivat: 1800, // Lower than month 6 profit
      auszahlungenGesamt,
      endbestand,
    });

    currentEndbestand = endbestand;
  }

  return {
    kapitalbedarf: {
      gruendungskosten: {
        notar: 1500,
        handelsregister: 150,
        beratung: 2000,
        marketing: 1000,
        sonstige: 500,
        summe: 5150,
      },
      investitionen: [
        { name: 'Laptop', kategorie: 'it', betrag: 2000 },
        { name: 'Büroausstattung', kategorie: 'ausstattung', betrag: 3000 },
      ],
      investitionenSumme: 5000,
      anlaufkosten: {
        monate: 6,
        monatlicheKosten: 3500,
        reserve: 5000,
        summe: 26000, // 6 * 3500 + 5000
      },
      gesamtkapitalbedarf: 36150, // 5150 + 5000 + 26000
    },
    finanzierung: {
      quellen: [
        {
          typ: 'eigenkapital',
          bezeichnung: 'Eigenkapital',
          betrag: 25000,
          status: 'gesichert',
        },
        {
          typ: 'gruendungszuschuss',
          bezeichnung: 'Gründungszuschuss',
          betrag: 15000,
          status: 'beantragt',
          monatlicheZahlung: 300,
          laufzeitMonate: 15,
        },
      ],
      eigenkapitalQuote: 62.5, // 25000/40000
      fremdkapitalQuote: 37.5, // 15000/40000
      gesamtfinanzierung: 40000,
      finanzierungsluecke: 0, // 40000 - 36150 = positive
    },
    privatentnahme: {
      miete: 800,
      lebensmittel: 400,
      versicherungen: 300,
      mobilitaet: 200,
      kommunikation: 100,
      sonstigeAusgaben: 200,
      sparrate: 0,
      monatlichePrivatentnahme: 1800, // Less than month 6 profit
      jaehrlichePrivatentnahme: 21600,
    },
    umsatzplanung: {
      umsatzstroeme: [
        {
          name: 'IT Beratung',
          typ: 'dienstleistung',
          einheit: 'Stunde',
          preis: 120,
          mengeJahr1: [50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 100, 100], // Growing capacity
          mengeJahr2: 1200, // 100 hours/month average
          mengeJahr3: 1400,
        },
      ],
      umsatzJahr1: [6000, 6600, 7200, 7800, 8400, 9000, 9600, 10200, 10800, 11400, 12000, 12000], // Progressive growth
      umsatzJahr1Summe: 111000,
      umsatzJahr2: 144000, // 1200 * 120
      umsatzJahr3: 168000, // 1400 * 120
      wachstumsrateJahr2: 29.7, // (144000-111000)/111000 * 100
      wachstumsrateJahr3: 16.7, // (168000-144000)/144000 * 100
      annahmen: ['Steigende Nachfrage nach IT-Beratung laut Bitkom'],
    },
    kostenplanung: {
      fixkosten: [
        { name: 'Büro', kategorie: 'miete', fixOderVariabel: 'fix', betragMonatlich: 800, betragJaehrlich: 9600 },
        { name: 'Versicherung', kategorie: 'versicherung', fixOderVariabel: 'fix', betragMonatlich: 200, betragJaehrlich: 2400 },
        { name: 'Software', kategorie: 'sonstige', fixOderVariabel: 'fix', betragMonatlich: 300, betragJaehrlich: 3600 },
      ],
      variableKosten: [
        { name: 'Marketing', kategorie: 'marketing', fixOderVariabel: 'variabel', betragMonatlich: 500, betragJaehrlich: 6000 },
      ],
      fixkostenSummeMonatlich: 1300,
      fixkostenSummeJaehrlich: 15600,
      variableKostenSummeJahr1: 6000,
      variableKostenSummeJahr2: 7200,
      variableKostenSummeJahr3: 8400,
      gesamtkostenJahr1: 21600, // 15600 + 6000
      gesamtkostenJahr2: 22800, // 15600 + 7200
      gesamtkostenJahr3: 24000, // 15600 + 8400
    },
    rentabilitaet: {
      jahr1: {
        umsatz: 111000,
        materialaufwand: 0,
        rohertrag: 111000,
        personalkosten: 0,
        sonstigeBetriebskosten: 21600,
        abschreibungen: 1667, // 5000/3 years
        zinsen: 0,
        ergebnisVorSteuern: 87733,
        steuern: 17547, // ~20%
        jahresueberschuss: 70186,
        rohertragsmarge: 100,
        umsatzrendite: 63.2,
      },
      jahr2: {
        umsatz: 144000,
        materialaufwand: 0,
        rohertrag: 144000,
        personalkosten: 0,
        sonstigeBetriebskosten: 22800,
        abschreibungen: 1667,
        zinsen: 0,
        ergebnisVorSteuern: 119533,
        steuern: 23907,
        jahresueberschuss: 95626,
        rohertragsmarge: 100,
        umsatzrendite: 66.4,
      },
      jahr3: {
        umsatz: 168000,
        materialaufwand: 0,
        rohertrag: 168000,
        personalkosten: 0,
        sonstigeBetriebskosten: 24000,
        abschreibungen: 1667,
        zinsen: 0,
        ergebnisVorSteuern: 142333,
        steuern: 28467,
        jahresueberschuss: 113866,
        rohertragsmarge: 100,
        umsatzrendite: 67.8,
      },
      breakEvenMonat: 4, // Profitable from month 4
      breakEvenUmsatz: 7800, // Monthly revenue needed
    },
    liquiditaet: {
      monate: liquidityMonths,
      minimumLiquiditaet: Math.min(...liquidityMonths.map(m => m.endbestand)),
      minimumMonat: liquidityMonths.findIndex(m => m.endbestand === Math.min(...liquidityMonths.map(x => x.endbestand))) + 1,
      durchschnittLiquiditaet: liquidityMonths.reduce((sum, m) => sum + m.endbestand, 0) / 36,
      liquiditaetsReserve: 5000,
      hatNegativeLiquiditaet: false,
    },
    validation: {
      kapitalbedarfComplete: true,
      finanzierungComplete: true,
      privatentnahmeComplete: true,
      umsatzComplete: true,
      kostenComplete: true,
      rentabilitaetComplete: true,
      liquiditaetComplete: true,
      finanzierungGedeckt: true,
      liquiditaetPositiv: true,
      breakEvenInnerhalb36Monate: true,
      umsatzRealistisch: true,
      kostenVollstaendig: true,
      margenBranchenueblich: true,
      blockers: [],
      warnings: [],
      readyForNextModule: true,
    },
  };
}

/**
 * Create workshop with failing Month 6 check
 */
function createMonth6FailingWorkshop(): WorkshopSession {
  const workshop = createValidWorkshop();

  // Make Month 6 profit too low (below privatentnahme)
  const finPlan = workshop.modules['gz-finanzplanung'].data as PartialFinanzplanungOutput;
  finPlan.privatentnahme!.monatlichePrivatentnahme = 3000; // Require €3000/month

  // But month 6 profit only €2000
  finPlan.rentabilitaet!.jahr1.jahresueberschuss = 24000; // €2000/month average

  return workshop;
}

/**
 * Create workshop with negative liquidity
 */
function createNegativeLiquidityWorkshop(): WorkshopSession {
  const workshop = createValidWorkshop();

  const finPlan = workshop.modules['gz-finanzplanung'].data as PartialFinanzplanungOutput;

  // Make months 3-5 negative
  finPlan.liquiditaet!.monate[2].endbestand = -500; // Month 3
  finPlan.liquiditaet!.monate[3].endbestand = -1200; // Month 4 (worst)
  finPlan.liquiditaet!.monate[4].endbestand = -300; // Month 5
  finPlan.liquiditaet!.hatNegativeLiquiditaet = true;

  return workshop;
}

/**
 * Create workshop with incomplete modules
 */
function createIncompleteWorkshop(): WorkshopSession {
  const workshop = createValidWorkshop();

  // Remove 3 modules
  delete workshop.modules['gz-swot'];
  delete workshop.modules['gz-meilensteine'];
  delete workshop.modules['gz-kpi'];

  return workshop;
}

// ============================================================================
// Financial Validation Tests
// ============================================================================

describe('Financial Validation Checks', () => {

  describe('checkMonth6SelfSufficiency', () => {
    it('should pass when month 6 profit >= privatentnahme', () => {
      const financialData: FinancialValidationData = {
        month6Profit: 2500,
        privatentnahme: 2000,
        liquidityMonths: [],
        monthlyProfits: [],
        breakEvenMonth: null,
        hasKapitalbedarfTable: true,
        hasUmsatzTable: true,
        hasLebenshaltungskostenTable: true,
        hasLiquiditaetTable: true,
        gzFundingMonths: [],
      };

      const result = checkMonth6SelfSufficiency(financialData);
      expect(result).toBeNull(); // No issue
    });

    it('should fail when month 6 profit < privatentnahme', () => {
      const financialData: FinancialValidationData = {
        month6Profit: 1500,
        privatentnahme: 2000,
        liquidityMonths: [],
        monthlyProfits: [],
        breakEvenMonth: null,
        hasKapitalbedarfTable: true,
        hasUmsatzTable: true,
        hasLebenshaltungskostenTable: true,
        hasLiquiditaetTable: true,
        gzFundingMonths: [],
      };

      const result = checkMonth6SelfSufficiency(financialData);

      expect(result).not.toBeNull();
      expect(result!.severity).toBe('BLOCKER');
      expect(result!.id).toBe('month-6-self-sufficiency');
      expect(result!.message).toContain('KRITISCHER FEHLER');
      expect(result!.message).toContain('Fehlbetrag: 500');
      expect(result!.detectedValues.shortfall).toBe(500);
    });

    it('should show correct German currency formatting', () => {
      const financialData: FinancialValidationData = {
        month6Profit: 1234.56,
        privatentnahme: 2345.67,
        liquidityMonths: [],
        monthlyProfits: [],
        breakEvenMonth: null,
        hasKapitalbedarfTable: true,
        hasUmsatzTable: true,
        hasLebenshaltungskostenTable: true,
        hasLiquiditaetTable: true,
        gzFundingMonths: [],
      };

      const result = checkMonth6SelfSufficiency(financialData);

      expect(result!.message).toContain('1.234,56 €'); // German format
      expect(result!.message).toContain('2.345,67 €');
    });
  });

  describe('checkLiquidityNonNegative', () => {
    it('should pass when all months have positive liquidity', () => {
      const financialData: FinancialValidationData = {
        month6Profit: 2000,
        privatentnahme: 1500,
        liquidityMonths: [
          { month: 1, endbestand: 10000, anfangsbestand: 5000, einzahlungen: 8000, auszahlungen: 3000 },
          { month: 2, endbestand: 12000, anfangsbestand: 10000, einzahlungen: 8000, auszahlungen: 6000 },
          { month: 3, endbestand: 15000, anfangsbestand: 12000, einzahlungen: 9000, auszahlungen: 6000 },
        ],
        monthlyProfits: [],
        breakEvenMonth: null,
        hasKapitalbedarfTable: true,
        hasUmsatzTable: true,
        hasLebenshaltungskostenTable: true,
        hasLiquiditaetTable: true,
        gzFundingMonths: [],
      };

      const result = checkLiquidityNonNegative(financialData);
      expect(result).toBeNull();
    });

    it('should fail when any month has negative liquidity', () => {
      const financialData: FinancialValidationData = {
        month6Profit: 2000,
        privatentnahme: 1500,
        liquidityMonths: [
          { month: 1, endbestand: 5000, anfangsbestand: 5000, einzahlungen: 3000, auszahlungen: 3000 },
          { month: 2, endbestand: -500, anfangsbestand: 5000, einzahlungen: 2000, auszahlungen: 7500 },
          { month: 3, endbestand: -1200, anfangsbestand: -500, einzahlungen: 2000, auszahlungen: 2700 },
        ],
        monthlyProfits: [],
        breakEvenMonth: null,
        hasKapitalbedarfTable: true,
        hasUmsatzTable: true,
        hasLebenshaltungskostenTable: true,
        hasLiquiditaetTable: true,
        gzFundingMonths: [],
      };

      const result = checkLiquidityNonNegative(financialData);

      expect(result).not.toBeNull();
      expect(result!.severity).toBe('BLOCKER');
      expect(result!.id).toBe('liquidity-non-negative');
      expect(result!.message).toContain('Monat 2: -500');
      expect(result!.message).toContain('Monat 3: -1.200');
      expect(result!.detectedValues.negativeMonthsCount).toBe(2);
      expect(result!.detectedValues.worstMonth).toBe(3);
    });
  });

  describe('checkBreakEvenReasonable', () => {
    it('should pass when break-even is <= 18 months', () => {
      const financialData: FinancialValidationData = {
        month6Profit: 2000,
        privatentnahme: 1500,
        liquidityMonths: [],
        monthlyProfits: [],
        breakEvenMonth: 12, // Month 12 is acceptable
        hasKapitalbedarfTable: true,
        hasUmsatzTable: true,
        hasLebenshaltungskostenTable: true,
        hasLiquiditaetTable: true,
        gzFundingMonths: [],
      };

      const result = checkBreakEvenReasonable(financialData);
      expect(result).toBeNull();
    });

    it('should warn when break-even is > 18 months', () => {
      const financialData: FinancialValidationData = {
        month6Profit: 2000,
        privatentnahme: 1500,
        liquidityMonths: [],
        monthlyProfits: [],
        breakEvenMonth: 24, // Month 24 triggers warning
        hasKapitalbedarfTable: true,
        hasUmsatzTable: true,
        hasLebenshaltungskostenTable: true,
        hasLiquiditaetTable: true,
        gzFundingMonths: [],
      };

      const result = checkBreakEvenReasonable(financialData);

      expect(result).not.toBeNull();
      expect(result!.severity).toBe('WARNING');
      expect(result!.id).toBe('break-even-reasonable');
      expect(result!.message).toContain('Monat 24');
      expect(result!.detectedValues.exceedsBy).toBe(6); // 24 - 18
    });

    it('should warn when no break-even achieved', () => {
      const financialData: FinancialValidationData = {
        month6Profit: 2000,
        privatentnahme: 1500,
        liquidityMonths: [],
        monthlyProfits: [],
        breakEvenMonth: null, // Never profitable
        hasKapitalbedarfTable: true,
        hasUmsatzTable: true,
        hasLebenshaltungskostenTable: true,
        hasLiquiditaetTable: true,
        gzFundingMonths: [],
      };

      const result = checkBreakEvenReasonable(financialData);

      expect(result).not.toBeNull();
      expect(result!.severity).toBe('WARNING');
      expect(result!.message).toContain('Break-Even nicht erreicht');
    });
  });

  describe('checkGZFundingIncluded', () => {
    it('should pass when GZ funding appears in >= 6 months', () => {
      const financialData: FinancialValidationData = {
        month6Profit: 2000,
        privatentnahme: 1500,
        liquidityMonths: [],
        monthlyProfits: [],
        breakEvenMonth: 6,
        hasKapitalbedarfTable: true,
        hasUmsatzTable: true,
        hasLebenshaltungskostenTable: true,
        hasLiquiditaetTable: true,
        gzFundingMonths: [1, 2, 3, 4, 5, 6, 7, 8, 9], // 9 months of GZ
      };

      const result = checkGZFundingIncluded(financialData);
      expect(result).toBeNull();
    });

    it('should warn when GZ funding appears in < 6 months', () => {
      const financialData: FinancialValidationData = {
        month6Profit: 2000,
        privatentnahme: 1500,
        liquidityMonths: [],
        monthlyProfits: [],
        breakEvenMonth: 6,
        hasKapitalbedarfTable: true,
        hasUmsatzTable: true,
        hasLebenshaltungskostenTable: true,
        hasLiquiditaetTable: true,
        gzFundingMonths: [1, 2, 3], // Only 3 months
      };

      const result = checkGZFundingIncluded(financialData);

      expect(result).not.toBeNull();
      expect(result!.severity).toBe('WARNING');
      expect(result!.id).toBe('gz-funding-included');
      expect(result!.detectedValues.gzMonthsFound).toBe(3);
    });
  });
});

// ============================================================================
// Structure Validation Tests
// ============================================================================

describe('Structure Validation Checks', () => {

  describe('checkRequiredSectionsComplete', () => {
    it('should pass when all 9 modules are completed', () => {
      const structureData: StructureValidationData = {
        completedModules: [
          'gz-intake', 'gz-geschaeftsmodell', 'gz-unternehmen',
          'gz-markt-wettbewerb', 'gz-marketing', 'gz-finanzplanung',
          'gz-swot', 'gz-meilensteine', 'gz-kpi'
        ],
        moduleWordCounts: {
          'gz-geschaeftsmodell': 600, // > 500 required
          'gz-unternehmen': 450,      // > 400 required
          'gz-markt-wettbewerb': 350, // > 300 required
          'gz-marketing': 500,        // > 400 required
          'gz-swot': 450,            // > 400 required
          'gz-kpi': 250,             // > 200 required
        },
        citationCount: 7,
        footnotes: [],
        hasTitlePage: true,
        hasTableOfContents: true,
        hasExecutiveSummary: true,
      };

      const result = checkRequiredSectionsComplete(structureData);
      expect(result).toBeNull();
    });

    it('should fail when modules are missing', () => {
      const structureData: StructureValidationData = {
        completedModules: [
          'gz-intake', 'gz-geschaeftsmodell', 'gz-unternehmen',
          'gz-markt-wettbewerb', 'gz-marketing', 'gz-finanzplanung',
          // Missing: swot, meilensteine, kpi
        ],
        moduleWordCounts: {},
        citationCount: 0,
        footnotes: [],
        hasTitlePage: false,
        hasTableOfContents: false,
        hasExecutiveSummary: false,
      };

      const result = checkRequiredSectionsComplete(structureData);

      expect(result).not.toBeNull();
      expect(result!.severity).toBe('BLOCKER');
      expect(result!.id).toBe('required-sections-complete');
      expect(result!.detectedValues.missingModules).toContain('gz-swot');
      expect(result!.detectedValues.missingModules).toContain('gz-meilensteine');
      expect(result!.detectedValues.missingModules).toContain('gz-kpi');
    });

    it('should fail when modules are too short', () => {
      const structureData: StructureValidationData = {
        completedModules: [
          'gz-intake', 'gz-geschaeftsmodell', 'gz-unternehmen',
          'gz-markt-wettbewerb', 'gz-marketing', 'gz-finanzplanung',
          'gz-swot', 'gz-meilensteine', 'gz-kpi'
        ],
        moduleWordCounts: {
          'gz-geschaeftsmodell': 200, // Too short (< 500)
          'gz-unternehmen': 150,      // Too short (< 400)
          'gz-markt-wettbewerb': 350,
          'gz-marketing': 100,        // Too short (< 400)
          'gz-swot': 450,
          'gz-kpi': 100,             // Too short (< 200)
        },
        citationCount: 0,
        footnotes: [],
        hasTitlePage: false,
        hasTableOfContents: false,
        hasExecutiveSummary: false,
      };

      const result = checkRequiredSectionsComplete(structureData);

      expect(result).not.toBeNull();
      expect(result!.severity).toBe('BLOCKER');
      expect(result!.detectedValues.tooShortModules).toContain('gz-geschaeftsmodell');
      expect(result!.detectedValues.tooShortModules).toContain('gz-unternehmen');
      expect(result!.detectedValues.tooShortModules).toContain('gz-marketing');
      expect(result!.detectedValues.tooShortModules).toContain('gz-kpi');
    });

    it('debug: should show actual word counts from createValidWorkshop', () => {
      const workshop = createValidWorkshop();
      const structureData = extractStructureData(workshop);

      console.log('DEBUG: Actual word counts:', structureData.moduleWordCounts);
      console.log('DEBUG: Required vs Actual:');
      console.log('  gz-geschaeftsmodell: required=500, actual=', structureData.moduleWordCounts['gz-geschaeftsmodell']);
      console.log('  gz-unternehmen: required=400, actual=', structureData.moduleWordCounts['gz-unternehmen']);
      console.log('  gz-markt-wettbewerb: required=300, actual=', structureData.moduleWordCounts['gz-markt-wettbewerb']);
      console.log('  gz-marketing: required=400, actual=', structureData.moduleWordCounts['gz-marketing']);
      console.log('  gz-swot: required=400, actual=', structureData.moduleWordCounts['gz-swot']);
      console.log('  gz-kpi: required=200, actual=', structureData.moduleWordCounts['gz-kpi']);

      const result = checkRequiredSectionsComplete(structureData);
      if (result) {
        console.log('DEBUG: Structure validation failed:', result.detectedValues);
      }

      // This test will help debug - expect it to show us the data
      expect(structureData.completedModules.length).toBe(9);
    });
  });

  describe('checkSourcesDocumented', () => {
    it('should pass when >= 5 citations exist', () => {
      const structureData: StructureValidationData = {
        completedModules: [],
        moduleWordCounts: {},
        citationCount: 7,
        footnotes: [
          'https://bitkom.org/study',
          'www.destatis.de/data',
          'Studie XYZ von ABC 2023',
          'IHK Berlin Report 2023',
          'Quelle: Marktforschung GmbH'
        ],
        hasTitlePage: true,
        hasTableOfContents: true,
        hasExecutiveSummary: true,
      };

      const result = checkSourcesDocumented(structureData);
      expect(result).toBeNull();
    });

    it('should warn when < 5 citations exist', () => {
      const structureData: StructureValidationData = {
        completedModules: [],
        moduleWordCounts: {},
        citationCount: 2,
        footnotes: ['https://example.com', 'www.test.de'],
        hasTitlePage: false,
        hasTableOfContents: false,
        hasExecutiveSummary: false,
      };

      const result = checkSourcesDocumented(structureData);

      expect(result).not.toBeNull();
      expect(result!.severity).toBe('WARNING');
      expect(result!.id).toBe('sources-documented');
      expect(result!.detectedValues.shortfall).toBe(3); // 5 - 2
    });
  });
});

// ============================================================================
// Integration Tests
// ============================================================================

describe('Full BA Compliance Validation', () => {

  it('should pass validation for complete, valid workshop', async () => {
    const workshop = createValidWorkshop();

    const result = await validateBACompliance(workshop);

    expect(result.passed).toBe(true);
    expect(result.blockers).toHaveLength(0);
    expect(result.summary.overallScore).toBeGreaterThan(80);
  });

  it('should fail validation for Month 6 insufficient profit', async () => {
    const workshop = createMonth6FailingWorkshop();

    const result = await validateBACompliance(workshop);

    expect(result.passed).toBe(false);
    expect(result.blockers).toHaveLength(1);
    expect(result.blockers[0].id).toBe('month-6-self-sufficiency');
    expect(result.blockers[0].severity).toBe('BLOCKER');
  });

  it('should fail validation for negative liquidity', async () => {
    const workshop = createNegativeLiquidityWorkshop();

    const result = await validateBACompliance(workshop);

    expect(result.passed).toBe(false);
    expect(result.blockers.some(b => b.id === 'liquidity-non-negative')).toBe(true);
  });

  it('should fail validation for incomplete modules', async () => {
    const workshop = createIncompleteWorkshop();

    const result = await validateBACompliance(workshop);

    expect(result.passed).toBe(false);
    expect(result.blockers.some(b => b.id === 'required-sections-complete')).toBe(true);
  });

  it('should complete validation within 500ms timeout', async () => {
    const workshop = createValidWorkshop();

    const startTime = Date.now();
    const result = await validateBACompliance(workshop);
    const duration = Date.now() - startTime;

    expect(duration).toBeLessThan(500);
    expect(result).toBeDefined();
  }, 1000); // 1 second test timeout

  it('should generate readable validation report', async () => {
    const workshop = createMonth6FailingWorkshop();

    const result = await validateBACompliance(workshop);
    const report = generateValidationReport(result);

    expect(report).toContain('BA-COMPLIANCE PRÜFUNG');
    expect(report).toContain('BLOCKIERT');
    expect(report).toContain('Selbstragfähigkeit nicht erreicht');
  });
});

// ============================================================================
// Export Validation Tests
// ============================================================================

describe('Export Validation System', () => {

  it('should allow export for valid workshop', async () => {
    const workshop = createValidWorkshop();

    const result = await validateExportReadiness(workshop);

    expect(result.canExport).toBe(true);
    expect(result.summary.status).toBe('ready');
  });

  it('should block export for invalid workshop', async () => {
    const workshop = createMonth6FailingWorkshop();

    const result = await validateExportReadiness(workshop);

    expect(result.canExport).toBe(false);
    expect(result.summary.status).toBe('blocked');
    expect(result.blockers).toHaveLength(1);
  });

  it('should check export eligibility quickly', async () => {
    const workshop = createValidWorkshop();

    const startTime = Date.now();
    const result = await checkExportEligibility(workshop, { quickOnly: true });
    const duration = Date.now() - startTime;

    expect(duration).toBeLessThan(50); // Very fast
    expect(result.canExport).toBe(true);
  }, 500);
});