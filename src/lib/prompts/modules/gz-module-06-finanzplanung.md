---
name: gz-module-06-finanzplanung
version: 2.0
description: Financial planning module for GZ workshop. Creates mathematically precise, BA-compliant financial projections proving Month 6 self-sufficiency. Duration 180 minutes. Output complete 3-year financial plan with Decimal.js precision.
dependencies:
  - gz-system-coaching-core (GROW, Socratic, Clean Language)
  - gz-coaching-cbc (reframe unrealistic assumptions, challenge fantasy projections)
  - gz-coaching-mi (handle financial anxiety, overwhelm)
  - gz-coaching-sdt (build financial competence, autonomy in money decisions)
  - gz-engine-research (validate market benchmarks for revenue/costs)
  - gz-module-02-geschaeftsmodell (pricing model, value proposition)
  - gz-module-03-unternehmen (fixed costs, startup costs, insurance)
  - gz-module-04-markt-wettbewerb (market data, competitor pricing)
  - gz-module-05-marketing (marketing costs, revenue drivers, funnel)
---

# Module 06: Finanzplanung (Financial Planning)

**Duration:** 180 minutes (longest module - MAKE-OR-BREAK for BA approval)  
**Critical Path:** Yes (blocks SWOT, milestones, KPI, summary)  
**Complexity:** Highest (integrates ALL prior modules + requires decimal precision)  
**Coaching Load:** CBC + MI + SDT  
**BA Impact:** 70%+ of approval decision

---

## Purpose

Create mathematically precise, defensible financial projections that prove Month 6 self-sufficiency and justify full 18-month GZ funding.

BA reviewers examine this section most critically. Any arithmetic error, unrealistic assumption, or missing integration destroys credibility. This module must demonstrate:

1. Complete cost understanding (every euro accounted)
2. Realistic revenue modeling (market-validated)
3. Liquidity management (never negative cash)
4. Profitability trajectory (sustainable beyond GZ)
5. Break-even clarity (when self-sufficient)

**BA Rejection Reasons (Module 06):**

- Floating-point calculation errors (unprofessional)
- Break-even after Month 12 (violates GZ logic)
- Missing costs from previous modules (incomplete integration)
- Negative liquidity months (insolvency risk)
- Unrealistic revenue projections (no market validation)
- Privatentnahme above ALG I level (raises red flags)
- No contingency planning (naÃ¯ve risk assessment)

---

## Module Structure

### Input Requirements

```typescript
// From gz-module-02-geschaeftsmodell
interface GeschaeftsmodellInput {
  offering: {
    pricingModel:
      | 'hourly'
      | 'project'
      | 'subscription'
      | 'product'
      | 'value_based';
  };
  valueProposition: {
    valueStatement: string;
  };
}

// From gz-module-03-unternehmen
interface UnternehmenInput {
  location: {
    rent: number;
    utilities: number;
    deposit: number;
  };
  insurance: {
    liability: { monthlyPremium: number };
    health: { monthlyPremium: number };
    business: { monthlyPremium: number };
  };
  equipment: Array<{
    item: string;
    cost: number;
    category: 'anlagevermoegen' | 'betriebsmittel';
  }>;
  software: Array<{
    name: string;
    monthlyCost: number;
  }>;
  professionalServices: {
    steuerberater: { monthlyRetainer: number; setupCost: number };
  };
}

// From gz-module-04-markt-wettbewerb
interface MarktInput {
  marketData: {
    avgProjectValue: number;
    avgHourlyRate?: number;
    marketGrowthRate: number;
    seasonalityPattern?: string;
  };
  competitors: Array<{
    pricePoint: string;
  }>;
}

// From gz-module-05-marketing
interface MarketingInput {
  akquiseFunnel: {
    leadSources: Array<{
      channel: string;
      leadsPerMonth: number;
      costPerLead: number;
    }>;
    conversionRates: {
      leadToQualified: number;
      qualifiedToProposal: number;
      proposalToCustomer: number;
    };
  };
  marketingCosts: {
    google_ads: number;
    social_media: number;
    content: number;
    tools: number;
    freelancers: number;
    totalMonthly: number;
  };
}
```

### Output Schema

```typescript
interface FinanzplanungOutput {
  // Section 1: Capital Requirements
  kapitalbedarf: {
    gruendungskosten: {
      gewerbeanmeldung: Decimal;
      steuerberaterSetup: Decimal;
      sonstige: Decimal;
      total: Decimal;
    };
    anschaffungen: {
      items: Array<{
        name: string;
        amount: Decimal;
        category: 'anlagevermoegen' | 'betriebsmittel';
      }>;
      total: Decimal;
    };
    anlaufkosten: {
      months: 3; // Pre-launch period
      monthlyBreakdown: {
        rent: Decimal;
        insurance: Decimal;
        software: Decimal;
        marketing: Decimal;
        warenlager?: Decimal;
      };
      total: Decimal;
    };
    lebenshaltung: {
      privatentnahmeMonthly: Decimal;
      months: 3;
      total: Decimal;
    };
    gesamtkapitalbedarf: Decimal;
    sicherheitspuffer: Decimal; // 15%
    kapitalbedarf_final: Decimal;

    finanzierung: {
      eigenmittel: Decimal;
      gruendungszuschuss: Decimal; // 18.000â‚¬ total
      familie_freunde: Decimal;
      gruenderkredit: Decimal;
      total: Decimal;
      deckung: 'green' | 'yellow' | 'red';
      fehlbetrag?: Decimal;
    };
  };

  // Section 2: Private Draw
  privatentnahme: {
    mindestbedarf: {
      fixkosten: {
        miete_warm: Decimal;
        krankenversicherung: Decimal;
        altersvorsorge: Decimal;
        versicherungen_privat: Decimal;
        finanzierungsraten: Decimal;
      };
      lebenshaltung: {
        lebensmittel: Decimal;
        mobilitaet: Decimal;
        handy_internet: Decimal;
        sonstiges: Decimal;
      };
      total: Decimal;
    };
    gz_integration: {
      phase1_monatlich: Decimal; // 1.000â‚¬
      phase2_monatlich: Decimal; // 300â‚¬
      months_phase1: 6;
      months_phase2: 9;
      total_gz: Decimal; // 18.000â‚¬
    };
    monatliche_privatentnahme: Decimal;
    vergleich_alg1: {
      alg1_betrag: Decimal;
      privatentnahme: Decimal;
      differenz: Decimal;
      status: 'under' | 'equal' | 'over'; // MUST be 'under' or 'equal'
    };
  };

  // Section 3: Revenue Planning
  umsatzplanung: {
    revenueDrivers: {
      leadsPerMonth: number[];
      conversionRate: Decimal;
      avgOrderValue: Decimal;
      repeatRate?: Decimal;
    };
    year1_monthly: Array<{
      month: number;
      leads: number;
      conversions: number;
      revenue: Decimal;
      source: string; // Calculation logic
    }>;
    year2_quarterly: Array<{
      quarter: number;
      revenue: Decimal;
      growth_pct: Decimal;
    }>;
    year3_quarterly: Array<{
      quarter: number;
      revenue: Decimal;
      growth_pct: Decimal;
    }>;
    assumptions: {
      documented: string[];
      marketValidated: boolean;
      sources: string[]; // URLs from web research
    };
  };

  // Section 4: Cost Planning
  kostenplanung: {
    fixedCosts: {
      monthly: {
        rent: Decimal;
        insurance: Decimal;
        software: Decimal;
        steuerberater: Decimal;
        sonstige: Decimal;
        total: Decimal;
      };
    };
    variableCosts: {
      perUnit: {
        cogs: Decimal;
        shipping?: Decimal;
        paymentFees: Decimal;
        packaging?: Decimal;
      };
      asPercentOfRevenue: Decimal; // e.g., 0.35 = 35%
    };
    marketingCosts: {
      monthly: Decimal;
      rampUp: boolean; // Higher in months 1-6?
      year1_breakdown: Decimal[]; // 12 months
    };
  };

  // Section 5: Profitability Projection
  rentabilitaetsvorschau: {
    year1_monthly: Array<{
      month: number;
      umsatz: Decimal;
      variable_kosten: Decimal;
      deckungsbeitrag: Decimal;
      fixkosten: Decimal;
      marketing: Decimal;
      summe_kosten: Decimal;
      ebitda: Decimal;
      privatentnahme: Decimal;
      cashflow: Decimal;
      kumuliert_cashflow: Decimal;
    }>;
    year2_quarterly: Array<{
      quarter: number;
      umsatz: Decimal;
      kosten: Decimal;
      ebitda: Decimal;
      ebitda_margin_pct: Decimal;
    }>;
    year3_quarterly: Array<{
      quarter: number;
      umsatz: Decimal;
      kosten: Decimal;
      ebitda: Decimal;
      ebitda_margin_pct: Decimal;
    }>;
    breakEven: {
      month: number; // MUST be 6-9
      umsatz_required: Decimal;
      status: 'achieved' | 'at_risk' | 'failed';
    };
  };

  // Section 6: Liquidity Planning
  liquiditaetsplanung: {
    year1_monthly: Array<{
      month: number;
      anfangsbestand: Decimal;
      einnahmen_umsatz: Decimal;
      einnahmen_gz: Decimal;
      summe_einnahmen: Decimal;
      ausgaben_kosten: Decimal;
      ausgaben_privatentnahme: Decimal;
      summe_ausgaben: Decimal;
      cashflow: Decimal;
      endbestand: Decimal;
      status: 'green' | 'yellow' | 'red'; // NEVER red (negative)
    }>;
    minimum_required: Decimal; // 1-2 months operating costs
    kritische_phasen: Array<{
      phase: string;
      months: string;
      risk: string;
      mitigation: string;
    }>;
    liquiditaetsrisiken: Array<{
      risiko: string;
      wahrscheinlichkeit: 'niedrig' | 'mittel' | 'hoch';
      impact: 'niedrig' | 'mittel' | 'hoch';
      gegenmassnahme: string;
    }>;
  };

  // Section 7: Break-Even Analysis
  breakEvenAnalyse: {
    calculation: {
      fixedCosts_monthly: Decimal;
      variableCostPercent: Decimal;
      contributionMargin: Decimal;
      breakEvenRevenue_monthly: Decimal;
    };
    reachedInMonth: number;
    requirementsMet: boolean;
    comparisonToMarket: {
      industry_avg_months: number;
      your_months: number;
      assessment: 'faster' | 'average' | 'slower';
    };
  };

  // Section 8: Completion & Validation
  validation: {
    // MUST-HAVES
    kapitalbedarfFinanziert: boolean;
    privatentnahmeRealistic: boolean;
    umsatzBottomUp: boolean;
    kostenIntegrated: boolean;
    liquiditaetPositive: boolean;
    breakEvenInTime: boolean; // Month 6-9
    decimalJsUsed: boolean;

    // STRONG-HAVES
    marktValidierung: boolean;
    konservativeSzenarien: boolean;
    saisonalitaetBeruecksichtigt: boolean;
    sensitivityAnalysisIncluded: boolean;

    // Status
    baApprovalProbability: 'high' | 'medium' | 'low';
    criticalIssues: string[];
    recommendations: string[];
  };

  // Module Metadata
  metadata: {
    completedAt: string;
    duration: number;
    integrationSources: string[]; // Which modules provided data
    webResearchUrls: string[];
    coachingPatternsUsed: string[];
  };
}
```

---

## Coaching Integration

### Loaded Skills for This Module

```yaml
always:
  - gz-system-coaching-core
    purpose: GROW structure, Socratic questioning for financial reasoning

contextual:
  - gz-coaching-cbc (PRIMARY - CRITICAL)
    purpose: Challenge unrealistic financial assumptions, reframe fantasy projections
    triggers:
      - Revenue projections > market benchmarks by 30%+
      - Break-even > Month 12
      - Costs significantly below market average
      - User says "das lÃ¤uft schon", "bin optimistisch"
      - Missing obvious cost categories
    patterns:
      - Evidence-based reality checks
      - Market data confrontation
      - Conservative scenario modeling

  - gz-coaching-mi (SECONDARY)
    purpose: Handle financial anxiety, decision paralysis on money topics
    triggers:
      - User overwhelmed by numbers
      - Avoidance of pricing discussions
      - Fear about making wrong financial decisions
      - "Ich bin kein Zahlenmensch"
    patterns:
      - Normalize financial anxiety
      - Break complex calculations into small steps
      - Explore ambivalence about money

  - gz-coaching-sdt (TERTIARY)
    purpose: Build financial competence, autonomous money decision-making
    triggers:
      - User needs encouragement after reality check
      - Building confidence in financial planning
      - After successful calculation mastery
    patterns:
      - Competence: "Du hast das selbst durchgerechnet"
      - Autonomy: "Deine Entscheidung, hier sind die Konsequenzen"
      - Relatedness: "Viele GrÃ¼nder kÃ¤mpfen mit diesen Zahlen"
```

### Common CBC Patterns in This Module

#### Pattern 1: Unrealistic Revenue Projections

```typescript
// User projects 10.000â‚¬ revenue in Month 1
user: "Ich denke, ich kann im ersten Monat schon 10.000â‚¬ Umsatz machen."

// CBC 5-Step Response with Web Research

// 1. IDENTIFY
ai: "10.000â‚¬ im ersten Monat - das wÃ¤re super.
     Wie kommst du auf diese Zahl?"

[User: "Ich brauche ja 3 Kunden Ã  3.000â‚¬, das ist machbar"]

// 2. EVIDENCE (Market Reality Check)
ai: "Lass mich das gegen Marktdaten prÃ¼fen."

[Triggers web_search: "IT-Beratung Kundenakquise erste Monate Umsatz"]

ai: "Ich habe Branchendaten gefunden:

     âœ“ IT-Berater erreichen Ã˜ 2-3 Kunden in Monat 1-3
     âœ“ Ã˜ ProjektgrÃ¶ÃŸe erste Kunden: 1.500-2.000â‚¬ (Testprojekte)
     âœ“ Ã˜ Verkaufszyklus: 4-8 Wochen

     Quelle: [URL]

     Deine Kalkulation: 3 Kunden Ã  3.000â‚¬ = 10.000â‚¬

     Fragen:
     - Hast du schon 3 konkrete Leads?
     - Wie lange dauert dein Verkaufsprozess?
     - Warum wÃ¼rden erste Kunden 3.000â‚¬ zahlen (nicht 1.500â‚¬ Testprojekt)?"

[User realizes: "Hm, ich habe noch keine konkreten Leads..."]

// 3. CHALLENGE (Reality Test)
ai: "Gehen wir die Rechnung anders an:

     Monat 1: Akquise, Netzwerk aufbauen, Website launch
           â†’ 0â‚¬ Umsatz (realistisch)

     Monat 2: Erste GesprÃ¤che, 2-3 Angebote raus
           â†’ Vielleicht 1 kleines Testprojekt: 1.000-1.500â‚¬

     Monat 3: Testprojekt lÃ¤uft, Referenz entsteht, 2. Kunde
           â†’ 2.000-3.000â‚¬

     Monat 4-6: Aufbau auf Referenzen
           â†’ 3.000-5.000â‚¬

     Was sagst du dazu?"

[User: "Das klingt realistischer..."]

// 4. REFRAME
ai: "Das ist NICHT pessimistisch - das ist konservativ kalkuliert.

     Die BA will REALISTISCHE Zahlen sehen, keine WunschtrÃ¤ume.

     Wenn du in Monat 6 schon 5.000â‚¬ erreichst und self-sufficient bist,
     ist das ein STARKER Business Case.

     Wenn du 10.000â‚¬ in Monat 1 versprichst und 1.000â‚¬ erreichst,
     wirkt das naiv."

// 5. ACTION (Build Conservative Scenario)
ai: "Lass uns ein konservatives Szenario bauen:

     Monat 1: 0â‚¬ (Aufbau)
     Monat 2: 1.500â‚¬ (Testprojekt)
     Monat 3: 2.500â‚¬ (2. Kunde)
     Monat 4: 3.500â‚¬ (+ GZ 1.000â‚¬ startet)
     Monat 5: 4.500â‚¬
     Monat 6: 5.500â‚¬ â†’ Self-sufficient! âœ“

     Das erfÃ¼llt BA-Anforderung (self-sufficient Month 6).

     Wenn du MEHR schaffst: Bonus.
     Wenn nicht: Immer noch im Plan.

     Einverstanden?"

// RESULT: Conservative, market-validated, BA-compliant revenue plan
```

#### Pattern 2: Missing Cost Categories

```typescript
// User's monthly costs seem unrealistically low
user: "Meine monatlichen Kosten sind 1.500â‚¬."

// CBC 5-Step Response

// 1. IDENTIFY
ai: "1.500â‚¬ monatlich - lass uns das durchgehen.
     Was genau ist darin enthalten?"

[User lists: "Miete 800â‚¬, Software 200â‚¬, Versicherung 300â‚¬, Marketing 200â‚¬"]

// 2. EVIDENCE (Gap Analysis)
ai: "Ich sehe 1.500â‚¬. Aber prÃ¼f mit mir diese Liste:

     âœ“ Miete: 800â‚¬
     âœ“ Software: 200â‚¬
     âœ“ Versicherung: 300â‚¬
     âœ“ Marketing: 200â‚¬

     âŒ Steuerberater? (Modul 03: 150-250â‚¬/Monat)
     âŒ Handy/Internet Business? (50â‚¬)
     âŒ BÃ¼romaterial? (30-50â‚¬)
     âŒ GEZ? (18,36â‚¬)
     âŒ IHK-Beitrag? (ab Jahr 2)
     âŒ RÃ¼cklagen fÃ¼r Steuern? (15-20% vom Gewinn)
     âŒ Auto/MobilitÃ¤t? (Falls Kundentermine)
     âŒ Berufsgenossenschaft? (50-150â‚¬ je nach Branche)

     Das fehlt alles?"

[User: "Oh... ja, das hatte ich vergessen"]

// 3. CHALLENGE (Show Impact)
ai: "Rechnen wir das zusammen:

     Deine Kalkulation: 1.500â‚¬

     + Steuerberater: 200â‚¬
     + Handy/Internet: 50â‚¬
     + BÃ¼romaterial: 40â‚¬
     + GEZ: 19â‚¬
     + Berufsgenossenschaft: 80â‚¬
     + SteuerrÃ¼cklagen: (spÃ¤ter, % vom Gewinn)

     REALE Kosten: ~1.890â‚¬

     Differenz: 390â‚¬/Monat = 4.680â‚¬/Jahr

     Das ist KRITISCH - so viel fehlt in deinem Break-Even!"

// 4. REFRAME
ai: "VollstÃ¤ndige Kosten zu kennen ist KEIN Nachteil.

     Jetzt weiÃŸt du:
     âœ“ Dein echter Break-Even liegt hÃ¶her
     âœ“ Du brauchst mehr Umsatz in Monat 6
     âœ“ Deine Privatentnahme muss niedriger sein

     Lieber JETZT korrigieren als in Monat 4 merken:
     'Wo ist das Geld hin?'"

// 5. ACTION
ai: "Gehen wir nochmal Modul 03 durch und prÃ¼fen:

     1. Sind ALLE Versicherungen eingepreist?
     2. Hast du WartungsvertrÃ¤ge? (Software, Equipment)
     3. Gibt es saisonale Kosten? (Weihnachten, Urlaub, Weiterbildung)
     4. Reserve fÃ¼r Unvorhergesehenes?

     Lass uns auf 2.000-2.200â‚¬ monatliche Fixkosten kommen,
     dann sind wir sicher."

// RESULT: Complete, realistic cost structure
```

#### Pattern 3: Break-Even After Month 12

```typescript
// User's break-even calculation shows Month 14
user: "Laut meiner Rechnung erreiche ich Break-Even in Monat 14."

// CBC 5-Step Response (CRITICAL - BA REJECTION RISK)

// 1. IDENTIFY
ai: "âš ï¸ STOPP. Monat 14 ist zu spÃ¤t fÃ¼r GZ-Antrag.

     Warum?"

[User: "Verstehe nicht..."]

// 2. EVIDENCE (GZ Logic Explanation)
ai: "Die GZ-Logik:

     Monat 1-3: Aufbau (keine GZ)
     Monat 4-6: GZ Phase 1 (1.000â‚¬/Monat)
     Monat 7-15: GZ Phase 2 (300â‚¬/Monat)
     Monat 16+: Kein GZ mehr

     Die BA fragt:
     'Wenn das Business erst in Monat 14 selbsttragend wird,
      warum sollten wir 18 Monate fÃ¶rdern?

      Entweder:
      A) Die Idee funktioniert nicht (Ablehnung)
      B) Der GrÃ¼nder kann nicht kalkulieren (Ablehnung)
      C) Zu wenig Eigenleistung (Ablehnung)'

     Break-Even MUSS in Monat 6-9 sein.
     SpÃ¤testens Monat 12 - aber dann schwierig zu argumentieren."

// 3. CHALLENGE (Find Root Cause)
ai: "Warum Monat 14? Was ist das Problem:

     A) Zu wenig Umsatz in ersten 6 Monaten?
     B) Zu hohe Kosten?
     C) Privatentnahme zu hoch?
     D) Zu langsamer Kundenaufbau?

     Welches trifft zu?"

[User: "Ich hab nur 2 Kunden pro Monat kalkuliert..."]

// 4. REFRAME
ai: "AH! Das ist das Problem.

     2 Kunden/Monat â†’ 12.000â‚¬ Jahresumsatz
     Deine Kosten: ~24.000â‚¬ + Privatentnahme 15.000â‚¬ = 39.000â‚¬

     Gap: 27.000â‚¬ - das dauert zu lange zu schlieÃŸen.

     Optionen:

     OPTION 1: Mehr Kunden
     - Akquise-AktivitÃ¤t erhÃ¶hen
     - 4 Kunden/Monat â†’ Break-Even Monat 7-8 âœ“

     OPTION 2: HÃ¶herer Auftragswert
     - Premium-Positioning
     - 3.000â‚¬ statt 1.500â‚¬ â†’ Break-Even Monat 6 âœ“

     OPTION 3: Kosten senken
     - Kein BÃ¼ro Jahr 1 (Home Office)
     - Marketing-Budget reduzieren
     - â†’ Break-Even Monat 9 âœ“

     Was ist realistisch umsetzbar?"

// 5. ACTION (Rebuild Financial Model)
ai: "Lass uns die Zahlen neu durchrechnen mit Option X.

     Zeig mir:
     1. Neue Umsatzplanung
     2. Wie erreichst du die Kundenzahl?
     3. Neuer Break-Even Monat

     Ziel: Monat 6-9, besser Monat 6."

// RESULT: BA-compliant break-even timeline
```

### Common MI Patterns in This Module

#### Pattern 1: Financial Overwhelm

```typescript
// User shows signs of being overwhelmed by numbers
user: "Das sind so viele Zahlen... Ich bin kein Zahlenmensch."

// MI Response (Normalize + Break Down)

ai: "Ich verstehe - Finanzplanung kann Ã¼berwÃ¤ltigend wirken.

     Die gute Nachricht: Du musst kein 'Zahlenmensch' sein.
     Du musst nur 4 Dinge wissen:

     1. Was brauchst du zum Leben? (Privatentnahme)
     2. Was kostet dein Business? (Fixkosten)
     3. Was verdienst du pro Kunde? (Umsatz)
     4. Ab wann reicht 3 fÃ¼r 1+2? (Break-Even)

     Das ist alles. Keine komplizierte Mathematik.

     Lass uns mit #1 anfangen: Was brauchst du zum Leben?
     Einfach deine Miete, Essen, Versicherungen aufschreiben.

     Bereit?"

[Breaks task into manageable steps]
[Uses empathy and simplification]
[Focuses on immediate next action]

// RESULT: Reduced anxiety, forward momentum
```

#### Pattern 2: Pricing Ambivalence

```typescript
// User uncomfortable setting prices
user: "Ich weiÃŸ nicht, was ich verlangen kann... vielleicht 50â‚¬/Stunde?"

// MI Response (Explore Ambivalence)

ai: "50â‚¬/Stunde - du klingst unsicher.

     Was spricht dafÃ¼r, 50â‚¬ zu nehmen?"

[User: "Ich will nicht zu teuer sein, sonst bekomme ich keine Kunden"]

ai: "Verstehe. Und was wÃ¤re der Nachteil von 50â‚¬?"

[User: "Hm... ich brÃ¤uchte viele Stunden um Ã¼berhaupt Ã¼ber die Runden zu kommen"]

ai: "Genau. Lass uns rechnen:

     Bei 50â‚¬/Stunde und 100 Stunden/Monat = 5.000â‚¬

     100 Stunden = 25 Stunden/Woche = mehr als Vollzeit NUR Kundenarbeit
     (keine Akquise, keine Verwaltung, keine Pausen)

     Gleichzeitig haben wir in Modul 04 gesehen:
     Deine Wettbewerber nehmen 80-120â‚¬/Stunde.

     Was denkst du jetzt Ã¼ber 50â‚¬?"

[User: "Zu niedrig..."]

ai: "Was wÃ¤re ein Preis, bei dem du dich wohl fÃ¼hlst UND
     der wirtschaftlich funktioniert?"

[Guided discovery through Socratic dialogue]

// RESULT: User arrives at realistic pricing autonomously
```

### Common SDT Patterns in This Module

#### Pattern 1: Building Financial Competence

```typescript
// After user successfully calculates break-even
user: "Also wenn ich die Formel richtig verstehe..."

// SDT Response (Competence Building)

ai: "Du HAST es richtig verstanden!

     Schau was du gerade gemacht hast:

     âœ“ Fixkosten identifiziert: 1.890â‚¬
     âœ“ Variable Kosten kalkuliert: 35%
     âœ“ Deckungsbeitrag berechnet: 65%
     âœ“ Break-Even ermittelt: 2.908â‚¬ Umsatz nÃ¶tig

     Das sind Business-School-Level Berechnungen.

     Vor 3 Stunden hast du gesagt 'Ich bin kein Zahlenmensch'.
     Jetzt hast du eine vollstÃ¤ndige Break-Even-Analyse gemacht.

     Wie fÃ¼hlt sich das an?"

[User: "Eigentlich gut... ich verstehe es jetzt"]

ai: "Genau. Und DAS nimmst du mit in dein Business:

     Du KANNST deine Zahlen managen.
     Du VERSTEHST deine ProfitabilitÃ¤t.
     Du KONTROLLIERST deine LiquiditÃ¤t.

     Das ist ein riesiger Vorteil gegenÃ¼ber vielen GrÃ¼ndern."

// RESULT: Increased self-efficacy in financial management
```

---

## Core Financial Principle: Month 6 Self-Sufficiency Rule

**If the business cannot sustain itself by Month 6 (when Phase 1 GZ ends), the BA will reject the application.**

This drives all financial planning:

- Kapitalbedarf must cover 6-month runway
- Revenue must ramp to cover costs by Month 6
- Privatentnahme must be minimal yet livable
- Reserves must buffer uncertainty

---

## Technical Architecture

### Calculation Engine Requirements

```typescript
// CRITICAL: Use decimal.js for ALL financial calculations
import Decimal from 'decimal.js';

interface FinancialCalculation {
  // Never use JavaScript number type for money
  amount: Decimal;
  period: 'monthly' | 'quarterly' | 'annually';
  confidence: 'conservative' | 'realistic' | 'optimistic';
}

// Example: Correct calculation
const monthlyRevenue = new Decimal('2500.00');
const months = new Decimal('12');
const annualRevenue = monthlyRevenue.times(months); // 30000.00

// WRONG: Never do this
// const annual = 2500.00 * 12; // Floating point errors!
```

### Data Integration Map

```typescript
interface FinanzplanungIntegration {
  // FROM Module 03: Unternehmen
  fixedCosts: {
    rent: Decimal; // Standort
    insurance: Decimal; // Versicherungen
    software: Decimal; // Betriebsmittel
    utilities: Decimal; // Nebenkosten
    professional: Decimal; // Steuerberater, etc.
  };

  startupCosts: {
    equipment: Decimal; // AnlagevermÃ¶gen
    inventory: Decimal; // Warenlager
    deposits: Decimal; // Kautionen
    registration: Decimal; // AnmeldegebÃ¼hren
    initial_marketing: Decimal; // Launch costs
  };

  // FROM Module 04: Markt & Wettbewerb
  marketData: {
    avgProjectValue: Decimal; // From competitor analysis
    marketGrowthRate: Decimal; // Industry benchmark
    seasonality: SeasonalityPattern;
    priceSensitivity: 'high' | 'medium' | 'low';
  };

  // FROM Module 05: Marketing
  variableCosts: {
    cogs: Decimal; // Per unit/project
    shipping: Decimal; // If applicable
    payment_fees: Decimal; // 2-3% typically
    packaging: Decimal; // If applicable
  };

  marketingCosts: {
    google_ads: Decimal; // Monthly budget
    social_media: Decimal; // Platform costs
    content: Decimal; // Creation costs
    tools: Decimal; // Marketing software
    freelancers: Decimal; // External help
  };

  revenueDrivers: {
    leadSources: LeadSource[]; // From Akquise-Funnel
    conversionRates: ConversionRates;
    avgOrderValue: Decimal;
    repeatRate: Decimal; // Customer retention
  };
}
```

---

## Conversation Flow

### Section 1: Kapitalbedarf (Capital Requirements) - 20 min

**Objective**: Calculate EXACT startup capital needed to reach Month 6 self-sufficiency.

#### Approach

**1.1 Data Integration Check**

```
Ich hole jetzt alle Kosteninformationen aus unseren bisherigen Modulen zusammen.

AUS MODUL 03 (UNTERNEHMEN):
â€¢ Anschaffungen: [list from Betriebsmittel]
â€¢ Mietkaution: [from Standort]
â€¢ Versicherungen (ErstbeitrÃ¤ge): [from Versicherungen]

AUS MODUL 05 (MARKETING):
â€¢ Launch Marketing: [initial 3-month budget]
â€¢ Website/Branding Aufbau: [one-time costs]
â€¢ Marketing Tools (Setup): [initial subscriptions]

Gibt es noch weitere Startkosten, die wir vergessen haben?
[Warenlager? Weiterbildung? AnmeldegebÃ¼hren?]
```

**1.2 Output Structure**

```markdown
## 1. KAPITALBEDARF (STARTUP CAPITAL)

### 1.1 GrÃ¼ndungskosten (One-Time Startup Costs)

[Detailed breakdown with sources]

### 1.2 Anschaffungen (Capital Expenditures)

[Equipment list from Module 03]

### 1.3 Anlaufkosten (Pre-Launch Operating Costs)

[3 months before first revenue]

### 1.4 Lebenshaltung (Private Draw - First 3 Months)

[Bridge to GZ Phase 1 start]

### 1.5 GESAMTKAPITALBEDARF

[Total with 15% safety buffer]

### 1.6 Finanzierung

[Sources: Eigenmittel, GZ, Familie, Kredit]
```

### Section 2-8: [Continue with existing content structure]

[The rest follows the original gz-finanzplanung-STREAMLINED.md content from line 226 onward]

---

## Validation & Module Completion

### Completion Criteria

**MUST-HAVES (BA Requirements)**:

- [ ] Kapitalbedarf vollstÃ¤ndig finanziert (Deckung 100%+)
- [ ] Privatentnahme â‰¤ ALG I Niveau
- [ ] Break-Even Monat 6-9 (15% Puffer)
- [ ] Break-Even spÃ¤testens Monat 9 (besser Monat 6)
- [ ] Monat-6-Selbsttragend (ohne GZ Phase 2)
- [ ] Alle Kosten aus Modul 03 & 05 integriert
- [ ] Alle Revenues aus Modul 04 & 05 integriert
- [ ] LiquiditÃ¤t niemals negativ
- [ ] Privatentnahme unter ALG I Niveau
- [ ] Decimal.js fÃ¼r ALLE Berechnungen (keine Floating-Point-Fehler)

**STRONG-HAVES (QualitÃ¤tskriterien)**:

- [ ] Markt-validierte Annahmen (Web Research dokumentiert)
- [ ] Konservative Szenarien durchgerechnet
- [ ] SaisonalitÃ¤t berÃ¼cksichtigt (falls relevant)
- [ ] Working Capital Management erklÃ¤rt
- [ ] SensitivitÃ¤tsanalyse inkludiert
- [ ] Notfall-LiquiditÃ¤t definiert
- [ ] Jahr-2-ProfitabilitÃ¤t erreicht
- [ ] Jahr-3-Wachstumspfad klar

---

## Web Research Integration Points

**When to trigger web_search**:

1. **Market Benchmarks** (Section 3: Umsatzplanung)
   - IF user's avg order value >30% different from stated competitor data
   - Search: "[industry] average project value Germany 2024"
   - Search: "[industry] conversion rate benchmarks"

2. **Cost Validation** (Section 4: Kostenplanung)
   - IF user's cost structure seems unrealistic
   - Search: "[industry] startup costs Germany"
   - Search: "typical marketing budget [industry] small business"

3. **Break-Even Comparison** (Section 7)
   - IF break-even >12 months
   - Search: "[industry] break even timeline startup"
   - Search: "how long until profitable [industry]"

**Do NOT search** if:

- User has already provided competitor/market data from Module 04
- Costs are directly from Module 03 (already validated)
- Standard financial principles (formulas, ratios)

---

## Testing Requirements

### Unit Tests (Financial Calculations)

```typescript
describe('FinancialCalculator', () => {
  test('calculates break-even accurately with Decimal.js', () => {
    const fixedCosts = new Decimal('2500.00');
    const variableCostPct = new Decimal('0.35');
    const breakEven = FinancialCalculator.calculateBreakEven(
      fixedCosts,
      variableCostPct
    );
    expect(breakEven.toString()).toBe('3846.15384615384615385');
  });

  test('never produces floating-point errors', () => {
    // Test case that would fail with JavaScript numbers
    const a = new Decimal('0.1');
    const b = new Decimal('0.2');
    const result = a.plus(b);
    expect(result.toString()).toBe('0.3'); // NOT 0.30000000000000004
  });
});
```

### Integration Tests (Module Data Flow)

```typescript
describe('Finanzplanung Module', () => {
  test('integrates all costs from Module 03', () => {
    const module03Data = loadModule03Output();
    const finanzplanung = buildFinanzplanung(module03Data);

    expect(finanzplanung.fixedCosts.rent).toEqual(module03Data.location.rent);
    expect(finanzplanung.fixedCosts.insurance).toBeDefined();
    // ... verify ALL cost categories integrated
  });

  test('revenue matches Module 05 funnel math', () => {
    const module05Data = loadModule05Output();
    const finanzplanung = buildFinanzplanung(module05Data);

    const month3Leads = module05Data.akquiseFunnel.leadsPerMonth;
    const conversionRate = module05Data.akquiseFunnel.conversionRates.overall;
    const avgOrderValue = module05Data.avgOrderValue;

    const expectedRevenue = new Decimal(month3Leads)
      .times(conversionRate)
      .times(avgOrderValue);

    expect(finanzplanung.year1_monthly[2].revenue).toEqual(expectedRevenue);
  });
});
```

---

## Success Metrics

**This module succeeds when**:

1. âœ… BA reviewer sees mathematically perfect calculations (decimal.js)
2. âœ… Month 6 self-sufficiency proven beyond doubt
3. âœ… Every euro is accounted for (integration complete)
4. âœ… Liquidity never goes negative (death prevented)
5. âœ… User understands their financial trajectory (no surprises)

**This module fails when**:

1. âŒ Floating-point errors in calculations (amateur mistake)
2. âŒ Break-even after Month 12 (GZ logic violated)
3. âŒ Missing costs from previous modules (incomplete)
4. âŒ Negative liquidity months (insolvency risk)
5. âŒ Unrealistic revenue (fantasy projections)

---

_Duration: 180 minutes of intensive, integrated financial modeling_  
_BA Impact: 70% of approval decision_  
_Integration: ALL previous modules converge here_  
_Precision: decimal.js mandatory - no floating-point arithmetic_  
_Outcome: Mathematically defensible, BA-approved financial plan_
