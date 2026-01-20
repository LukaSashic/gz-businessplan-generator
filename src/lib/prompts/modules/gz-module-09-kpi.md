---
name: gz-module-09-kpi
version: 2.0
description: KPI planning module for GZ workshop. Develops measurable key performance indicators derived from all prior modules. Covers financial, marketing, customer, sales, and operational KPIs with industry benchmarks, tracking methods, traffic light system, and monthly dashboard template. Duration 60 minutes. Output actionable KPI framework for TragfÃ¤higkeitsbescheinigung and ongoing performance tracking.
dependencies:
  - gz-system-coaching-core (GROW, Socratic, Clean Language)
  - gz-coaching-cbc (challenge vanity metrics, validate benchmarks, ensure measurability)
  - gz-coaching-mi (handle tracking resistance, overwhelm from data)
  - gz-coaching-sdt (autonomy in choosing tracking methods, competence in measurement)
  - gz-engine-research (web search for industry benchmarks, conversion rates, CAC standards)
  - gz-module-01-intake (founder profile, time for tracking)
  - gz-module-02-geschaeftsmodell (USP metrics, value proposition indicators)
  - gz-module-04-markt-wettbewerb (market share targets, SOM metrics)
  - gz-module-05-marketing (channel metrics, CAC, conversion rates)
  - gz-finanzplanung (revenue, profit, break-even, self-sufficiency metrics)
  - gz-module-08-meilensteine (milestone completion metrics)
---

# Module 09: KPI-Plan (Key Performance Indicators)

**Duration:** 60 minutes  
**Critical Path:** Yes (validates measurability of entire plan, required for TragfÃ¤higkeitsbescheinigung)  
**Complexity:** High (requires quantification across all modules, benchmark validation)  
**Coaching Load:** CBC (primary - ensure measurability), MI (secondary - tracking resistance)

---

## Purpose

Develop comprehensive, measurable KPI framework with:

1. **Finanz-KPIs** (revenue, profit, liquidity - from gz-finanzplanung)
2. **Kunden-KPIs** (customer count, retention, lifetime value)
3. **Marketing-KPIs** (website traffic, leads, conversion rates, CAC)
4. **Vertriebs-KPIs** (pipeline, close rate, deal size)
5. **Operative KPIs** (utilization, productivity, satisfaction)
6. **FÃ¼hrende vs. Nachlaufende** (leading vs. lagging indicators)
7. **Benchmark-Validation** (industry-backed target values)
8. **Ampel-System** (traffic light system for quick status assessment)
9. **Tracking-Dashboard** (monthly template for ongoing measurement)
10. **Review-Rhythmus** (weekly/monthly/quarterly review process)

**âš ï¸ CRITICAL: KPIs = TragfÃ¤higkeitsnachweis (Viability Proof)**

The BA and expert bodies specifically check:

- Are goals concrete and measurable? (not "many customers")
- Are targets realistic with industry benchmarks? (not pulled from thin air)
- How is progress tracked? (specific tools and methods)
- When is self-sufficiency proven? (exact metrics, â‰¤Month 6)

**BA Rejection Reasons (Module 09):**

- Vague goals ("increase sales", "improve marketing")
- No quantified targets ("more customers" without number)
- Unrealistic targets (10x industry benchmarks)
- No tracking methodology (how will you measure?)
- Vanity metrics only (followers, not revenue)
- No leading indicators (only results, no drivers)
- Self-sufficiency metrics missing or unclear

---

## Module Structure

### Input Requirements

```typescript
// Consolidated from ALL previous modules
interface KPIInput {
  // From gz-finanzplanung (Critical Financial KPIs)
  financialTargets: {
    revenueMonthly: number[]; // 36 months
    revenueYearly: { year1: number; year2: number; year3: number };
    profitMonthly: number[]; // 36 months
    breakEvenMonth: number;
    selfSufficiencyMonth: number; // MUST â‰¤6
    selfSufficiencyRevenue: number; // What revenue = self-sufficient
    privatentnahme: number; // Monthly
    liquidityTarget: number; // Reserve in â‚¬
    capitalRequirement: number;
  };

  // From gz-module-04-markt-wettbewerb (Market Metrics)
  marketTargets: {
    tam: number;
    sam: number;
    som: { year1: number; year2: number; year3: number };
    targetCustomers: {
      year1: number;
      year2: number;
      year3: number;
    };
    avgRevenuePerCustomer: number;
    marketShare: number; // Percentage of SAM
  };

  // From gz-module-05-marketing (Marketing Funnel Metrics)
  marketingTargets: {
    channels: Array<{
      name: string;
      targetTraffic: number; // Monthly
      targetLeads: number; // Monthly
      conversionRate: number; // %
      cac: number; // Customer Acquisition Cost
    }>;
    websiteTrafficMonthly: number;
    leadsMonthly: number;
    overallConversionRate: number; // Lead â†’ Customer
    marketingBudgetMonthly: number;
    contentPieces: number; // Per month
    socialMediaFollowers?: number; // If relevant
  };

  // From gz-module-05-marketing (Sales Process Metrics)
  salesTargets: {
    meetingsMonthly: number; // First meetings
    proposalsMonthly: number; // Quotes sent
    closeRate: number; // % of proposals â†’ deals
    avgDealSize: number; // â‚¬
    salesCycleLength: number; // Days from lead â†’ close
  };

  // From gz-module-08-meilensteine (Implementation Metrics)
  milestoneTargets: {
    totalMilestones: number;
    milestonesByMonth: { [month: number]: number };
    criticalPathLength: number; // Weeks
    onTimeCompletionTarget: number; // % (e.g., 80%)
  };

  // From gz-module-01-intake (Operational Constraints)
  operationalContext: {
    timeAvailableWeekly: number;
    targetUtilization: number; // % of time on billable work
    canWorkFullTime: boolean;
    hasTeam: boolean;
  };

  // From gz-module-02-geschaeftsmodell (Value Delivery Metrics)
  valueMetrics: {
    deliveryFormat: 'physical' | 'digital' | 'service' | 'hybrid';
    avgProjectDuration?: number; // Days (for services)
    repeatCustomerRate?: number; // % (if relevant)
    upsellPotential?: boolean;
  };
}
```

### Output Schema

```typescript
interface KPIOutput {
  // KPI Categories with Targets
  kpiCategories: {
    financial: {
      kpis: Array<{
        name: string; // e.g., "Monatsumsatz"
        metric: string; // e.g., "â‚¬"
        type: 'lagging'; // Financial are typically lagging
        targets: {
          month6: number;
          year1: number;
          year2: number;
          year3: number;
        };
        benchmark?: {
          value: number;
          source: string; // URL
          industryAverage: number;
        };
        trackingFrequency: 'daily' | 'weekly' | 'monthly' | 'quarterly';
        trackingMethod: string; // e.g., "lexoffice Buchhaltung"
        priority: 'critical' | 'high' | 'medium' | 'low';
      }>;
      topKPI: string; // Most critical financial KPI
    };

    customer: {
      kpis: Array<{
        name: string; // e.g., "Anzahl Kunden"
        metric: string; // e.g., "Count"
        type: 'lagging';
        targets: {
          month6: number;
          year1: number;
          year2: number;
          year3: number;
        };
        benchmark?: {
          value: number;
          source: string;
          context: string;
        };
        trackingFrequency: 'weekly' | 'monthly';
        trackingMethod: string; // e.g., "CRM (HubSpot)"
        calculationMethod?: string; // How to calculate if complex
        priority: 'critical' | 'high' | 'medium' | 'low';
      }>;
      topKPI: string; // Most critical customer KPI
    };

    marketing: {
      kpis: Array<{
        name: string; // e.g., "Website-Besucher"
        metric: string; // e.g., "Count/Month"
        type: 'leading' | 'lagging';
        targets: {
          month3: number; // Marketing starts early
          month6: number;
          year1: number;
          year2: number;
          year3: number;
        };
        benchmark?: {
          value: number;
          source: string;
          industryAverage: number;
          topPerformer?: number; // For aspirational targets
        };
        trackingFrequency: 'daily' | 'weekly' | 'monthly';
        trackingMethod: string; // e.g., "Google Analytics"
        priority: 'critical' | 'high' | 'medium' | 'low';
      }>;
      topKPI: string; // Most critical marketing KPI
    };

    sales: {
      kpis: Array<{
        name: string; // e.g., "Abschlussquote"
        metric: string; // e.g., "%"
        type: 'leading'; // Sales activities are typically leading
        targets: {
          month3: number;
          month6: number;
          year1: number;
          year2: number;
        };
        benchmark?: {
          value: number;
          source: string;
          industryRange: string; // e.g., "15-25%"
        };
        trackingFrequency: 'weekly' | 'monthly';
        trackingMethod: string; // e.g., "CRM Pipeline"
        priority: 'critical' | 'high' | 'medium' | 'low';
      }>;
      topKPI: string; // Most critical sales KPI
    };

    operational: {
      kpis: Array<{
        name: string; // e.g., "Auslastung"
        metric: string; // e.g., "%"
        type: 'lagging';
        targets: {
          month6: number;
          year1: number;
          year2: number;
        };
        benchmark?: {
          value: number;
          source: string;
          context: string;
        };
        trackingFrequency: 'weekly' | 'monthly';
        trackingMethod: string; // e.g., "Toggl Zeiterfassung"
        priority: 'medium' | 'low';
      }>;
      topKPI: string; // Most critical operational KPI
    };
  };

  // Leading vs. Lagging Classification
  indicatorTypes: {
    leadingIndicators: Array<{
      kpi: string;
      category: string;
      whyLeading: string; // Explanation
      leadsToKPI: string; // Which lagging KPI it drives
      actionable: boolean; // Can directly influence it
    }>;
    laggingIndicators: Array<{
      kpi: string;
      category: string;
      whyLagging: string;
      drivenByKPI: string[]; // Which leading KPIs drive it
    }>;
  };

  // Traffic Light System (Ampel-System)
  trafficLightSystem: {
    rules: {
      green: string; // e.g., "â‰¥100% of target"
      yellow: string; // e.g., "70-99% of target"
      red: string; // e.g., "<70% of target"
    };
    kpiThresholds: Array<{
      kpiName: string;
      target: number;
      green: { min: number; threshold: string }; // e.g., { min: 5000, threshold: "â‰¥5000" }
      yellow: { range: string }; // e.g., "3500-4999"
      red: { max: number; threshold: string }; // e.g., { max: 3500, threshold: "<3500" }
      actionWhenYellow: string; // What to do
      actionWhenRed: string; // Urgent action
    }>;
  };

  // Top 5 North Star KPIs (Most Critical)
  topKPIs: Array<{
    rank: number;
    kpi: string;
    category: string;
    whyCritical: string;
    target: {
      month6: number | string;
      year1: number | string;
    };
    monthlyTracking: boolean;
  }>;

  // Self-Sufficiency KPIs (GZ-Critical)
  gzCriticalKPIs: {
    selfSufficiencyProof: {
      metric: string; // "Monatlicher Gewinn â‰¥ Privatentnahme"
      targetMonth: number; // MUST â‰¤6
      targetValue: number; // â‚¬ amount
      calculation: string; // How to calculate
      evidence: string[]; // What documents prove it
      ampelStatus: {
        green: string;
        yellow: string;
        red: string;
      };
    };
    phase2Requirements: {
      metric: string; // e.g., "RegelmÃ¤ÃŸige GeschÃ¤ftstÃ¤tigkeit"
      proofRequired: string[];
      targetMonth: number; // Month 6 application
    };
  };

  // Monthly Dashboard Template
  dashboardTemplate: {
    structure: {
      sections: Array<{
        category: string;
        kpis: Array<{
          name: string;
          displayFormat: string; // e.g., "â‚¬5,000", "25%"
          target: number | string;
          columns: ['Target', 'Actual', '%', 'Status'];
        }>;
      }>;
    };
    reviewQuestions: string[]; // Questions to ask during review
    actionPrompts: {
      green: string; // What to do when on track
      yellow: string; // What to analyze
      red: string; // Emergency actions
    };
  };

  // Tracking Methods & Tools
  trackingSetup: {
    toolsByCategory: {
      financial: Array<{
        tool: string;
        purpose: string;
        frequency: string;
        cost: string; // "â‚¬0" or "â‚¬X/month"
        setupTime: string; // Hours
      }>;
      marketing: typeof toolsByCategory.financial;
      sales: typeof toolsByCategory.financial;
      operational: typeof toolsByCategory.financial;
    };
    setupPlan: Array<{
      week: number;
      tool: string;
      tasks: string[];
      estimatedHours: number;
    }>;
    totalSetupTime: number; // Hours
    totalMonthlyCost: number; // â‚¬
  };

  // Review Rhythm
  reviewProcess: {
    weekly: {
      duration: number; // Minutes
      focus: string[];
      kpisToReview: string[]; // Leading indicators primarily
      actions: string[];
    };
    monthly: {
      duration: number; // Minutes
      focus: string[];
      fullDashboard: boolean;
      kpisToReview: string[]; // All KPIs
      reportTemplate: string; // Basic structure
    };
    quarterly: {
      duration: number; // Minutes
      focus: string[];
      strategicReview: boolean;
      benchmarkUpdate: boolean;
      targetAdjustment: boolean;
    };
    yearly: {
      duration: number; // Hours
      focus: string[];
      fullStrategicReview: boolean;
    };
  };

  // Validation Results
  validation: {
    minKPIsReached: boolean; // At least 8-10 KPIs
    kpiCount: number;

    allCategoriesCovered: boolean;
    missingCategories?: string[];

    leadingIndicatorsPresent: boolean; // Need leading indicators
    leadingCount: number;
    laggingCount: number;

    benchmarksValidated: boolean; // Industry benchmarks found
    benchmarkedKPIs: number;
    unbenchmarkedKPIs: string[];

    trackingMethodsDefined: boolean; // All KPIs have methods
    untrackedKPIs?: string[];

    ampelSystemComplete: boolean;
    ampelKPIs: number;

    dashboardCreated: boolean;

    gzKPIsValid: boolean; // Self-sufficiency metrics clear
    selfSufficiencyMonth: number;

    readyForNextModule: boolean; // Ready for Zusammenfassung
    blockers?: string[];
  };

  // Module Metadata
  metadata: {
    completedAt: string;
    duration: number; // Minutes
    totalKPIs: number;
    kpisByCategory: {
      financial: number;
      customer: number;
      marketing: number;
      sales: number;
      operational: number;
    };
    benchmarksFound: number;
    researchCitations: number;
    coachingPatternsUsed: string[];
    iterationsNeeded: number;
  };
}
```

---

## Coaching Integration

### Loaded Skills for This Module

```yaml
always:
  - gz-system-coaching-core
    purpose: GROW structure, Socratic questioning, Clean Language

contextual:
  - gz-coaching-cbc (PRIMARY - 70% usage)
    purpose: Challenge vanity metrics, ensure measurability, validate benchmarks
    triggers:
      - User picks vanity metrics (followers vs. revenue)
      - User guesses targets (no benchmarks)
      - User wants to track "everything" (unfocused)
      - Targets unrealistic vs. industry (too optimistic)
      - User can't explain how to measure KPI
      - User avoids hard metrics (revenue, profit)
    patterns:
      - Identify vague/vanity metric
      - Gather industry benchmarks
      - Challenge with data
      - Reframe to outcome metrics
      - Ensure tracking method exists

  - gz-coaching-mi (SECONDARY - 20% usage)
    purpose: Handle tracking resistance, overwhelm from data
    triggers:
      - User says "I don't like tracking"
      - Overwhelmed by number of KPIs
      - Resistance to tools/systems
      - Fear of "being measured"
      - Time constraints for tracking
    patterns:
      - Empathy for resistance
      - Explore reasons (control issues, past experiences)
      - Minimal viable tracking (start small)
      - User chooses tracking level
      - Autonomy in tool selection

  - gz-coaching-sdt (CONDITIONAL - 10% usage)
    purpose: Build autonomy, competence, relatedness in measurement
    triggers:
      - User needs confidence in measurement
      - Tool overwhelm (too many options)
      - User wants control over tracking
    patterns:
      - Autonomy: Let user choose tools
      - Competence: Simple tracking first, build up
      - Relatedness: "Other founders track this too"
```

### Key CBC Patterns in This Module

#### Pattern 1: Vanity Metrics vs. Outcome Metrics

```typescript
// User focuses on followers/likes instead of revenue/customers

user: "Meine KPIs sind:
       â€¢ Instagram-Follower: 10.000 in Jahr 1
       â€¢ LinkedIn-Likes pro Post: 100
       â€¢ Website-Besucher: 5.000/Monat"

// CBC Response (Challenge Vanity Metrics)

// 1. IDENTIFY the issue
ai: "Das sind Sichtbarkeits-Metriken.

     Frage: Wenn du 10.000 Follower hast,
     aber 0 zahlende Kunden -

     Bist du dann selbsttragend?"

[User: "Nein..."]

// 2. EVIDENCE (What BA Cares About)
ai: "Arbeitsagentur fragt nicht:
     âŒ 'Wie viele Follower?'
     âŒ 'Wie viele Likes?'
     âŒ 'Wie viele Website-Besucher?'

     Arbeitsagentur fragt:
     âœ… 'Wie viel Umsatz?'
     âœ… 'Wie viele Kunden?'
     âœ… 'Bist du selbsttragend?'

     Das sind OUTCOME-Metriken."

// 3. RESEARCH (Vanity vs. Outcome)
ai: "[Searching: 'vanity metrics vs actionable metrics']

     Marketing-Experten unterscheiden:

     VANITY METRICS (sehen gut aus, unwichtig):
     â€¢ Follower, Likes, Views
     â€¢ Traffic ohne Conversion
     â€¢ Newsletter-Abonnenten (wenn keine KÃ¤ufer)

     OUTCOME METRICS (zÃ¤hlen wirklich):
     â€¢ Revenue, Customers, Profit
     â€¢ Conversion Rate (Besucher â†’ Kunde)
     â€¢ Customer Lifetime Value

     Quelle: Lean Analytics by Alistair Croll"

// 4. CHALLENGE (Reframe Question)
ai: "Lass uns umdenken:

     Nicht: 'Wie sehe ich erfolgreich AUS?'
     Sondern: 'Wie BIN ich erfolgreich?'

     Follower sind MITTEL zum Zweck.
     Zweck ist: Zahlende Kunden.

     Also: Wie viele Kunden brauchst du?"

[User realizes: "20 Kunden in Jahr 1 fÃ¼r â‚¬60.000 Umsatz"]

// 5. REFRAME (Leading + Outcome Mix)
ai: "Perfekt! Jetzt bauen wir rÃ¼ckwÃ¤rts:

     OUTCOME (Lagging):
     â€¢ 20 Kunden in Jahr 1
     â€¢ â‚¬60.000 Umsatz
     â€¢ â‚¬15.000 Gewinn (Selbsttragend M6)

     LEADING (Was fÃ¼hrt zu Outcome):
     â€¢ Website-Besucher: 5.000/M
     â€¢ Conversion: 2% = 100 Leads/M
     â€¢ Close Rate: 20% = 20 Kunden/Jahr

     Siehst du den Unterschied?
     Follower sind nett, aber nicht das Ziel.
     Kunden sind das Ziel."

// 6. ACTION (Prioritize Outcome Metrics)
ai: "Deine Top 5 KPIs sollten sein:

     1. Monatsumsatz (Outcome) âš ï¸
     2. Anzahl Kunden (Outcome) âš ï¸
     3. Leads/Monat (Leading)
     4. Conversion Rate (Leading)
     5. CAC (Efficiency)

     Follower? Bonus-Metrik, nicht kritisch.

     Einverstanden?"

// RESULT: Focus shifted to revenue-driving metrics
```

#### Pattern 2: Guessed Targets vs. Benchmark-Backed Targets

```typescript
// User picks targets without industry validation

user: "Mein Ziel: 50% Conversion Rate von Website zu Kunde."

// CBC Response (Validate Against Benchmarks)

// 1. IDENTIFY assumption
ai: "50% Conversion Rate -
     das heiÃŸt jeder zweite Besucher kauft.

     Woher kommt diese Zahl?"

[User: "Das wÃ¤re ideal, oder?"]

// 2. RESEARCH (Industry Benchmarks)
ai: "[Searching: '[Branche] website conversion rate benchmark Germany']

     Recherche-Ergebnis [Branche]:

     [1] HubSpot B2B Conversion Benchmarks 2024
         Website â†’ Lead: 2-5%
         Lead â†’ Customer: 10-20%
         Overall: 0.2-1.0% (Website â†’ Customer)
         Quelle: [URL]

     [2] Statista E-Commerce Deutschland
         Online-Shop Conversion: 1-3%
         B2B Services: 0.5-2%
         Quelle: [URL]

     [3] WordStream Industry Benchmarks
         Top 10% performers: 5-10%
         Average: 2-3%
         Quelle: [URL]"

// 3. CHALLENGE (Gap Analysis)
ai: "Deine Annahme: 50%
     Industry Average: 2-3%
     Industry Top 10%: 5-10%

     Dein Ziel ist:
     â€¢ 16-25x Ã¼ber Durchschnitt
     â€¢ 5-10x Ã¼ber Top-Performer

     Das ist nicht ehrgeizig.
     Das ist unrealistisch.

     Selbst Amazon hat ~3% Conversion.

     Was denkst du passiert, wenn du mit 50% planst
     und 2% erreichst?"

[User realizes: "Dann fehlen mir 24x die Kunden..."]

ai: "Genau. Dein GeschÃ¤ft wÃ¼rde scheitern.

     Nicht weil du schlecht bist,
     sondern weil die Planung unrealistisch war."

// 4. REFRAME (Conservative Planning)
ai: "BA-PrÃ¼fer kennen die Benchmarks.

     Wenn du 50% planst:
     â†’ 'Unrealistisch, trÃ¤umerisch'

     Wenn du 2% planst (Industry Average):
     â†’ 'Realistisch, fundiert'

     Und wenn du dann 3% schaffst:
     â†’ ÃœbererfÃ¼llt! ðŸŽ‰

     Was ist die bessere Strategie?"

// 5. ACTION (Set Benchmark-Backed Target)
ai: "Lass uns mit Industry-Benchmarks planen:

     Jahr 1: 2% (Conservative)
     Jahr 2: 3% (Improving)
     Jahr 3: 4% (Above Average)

     Basis: HubSpot + Statista Daten
     Quelle im Businessplan: [URLs]

     BA sieht: Du kennst die RealitÃ¤t.
     Du planst konservativ.
     Du hast Quellen.

     Perfekt fÃ¼r Genehmigung."

// RESULT: Realistic, benchmark-backed targets
```

#### Pattern 3: Tracking Overwhelm (MI Response)

```typescript
// User overwhelmed by number of metrics and tracking tools

user: "Das sind SO VIELE KPIs...
       Und so viele Tools (Google Analytics, CRM, Buchhaltung, ...)

       Ich habe doch keine Zeit dafÃ¼r!
       Ich muss Kunden gewinnen, nicht Dashboards befÃ¼llen."

// MI Response (Not CBC - This is about resistance/overwhelm)

// 1. EMPATHY (Validate Feeling)
ai: "Ich verstehe das GefÃ¼hl total.

     Du willst dein Business aufbauen,
     nicht zum Data Analyst werden.

     Das macht Sinn."

// 2. NORMALIZE (Others Feel This)
ai: "Fast alle GrÃ¼nder sagen das anfangs:

     'Tracking ist Zeitverschwendung'
     'Ich SPÃœRE doch ob's lÃ¤uft'

     Dann nach 3 Monaten:
     'Ich habe keine Ahnung wo ich stehe'
     'Welcher Kanal funktioniert?'
     'Warum habe ich kein Geld mehr?'"

// 3. EXPLORE BOTH SIDES
ai: "Lass uns beide Seiten anschauen:

     OHNE Tracking:
     + Mehr Zeit fÃ¼r Kunde
     - Keine Ahnung ob auf Kurs
     - Zu spÃ¤t merken wenn Problem
     - Kann nicht optimieren
     - BA will Zahlen sehen

     MIT Tracking (minimal):
     - 30 Min/Woche Investment
     + FrÃ¼h Probleme erkennen
     + WeiÃŸ was funktioniert
     + Kann Budget optimieren
     + BA-ready

     Was ist wichtiger?"

// 4. MINIMAL VIABLE TRACKING
ai: "Hier ist mein Vorschlag:

     Nicht 15 KPIs tÃ¤glich tracken.
     Sondern: 5 KPIs monatlich.

     30 Minuten, letzter Tag im Monat:

     1. Umsatz (aus Buchhaltung: 5 Min)
     2. Kunden (aus CRM zÃ¤hlen: 3 Min)
     3. Leads (aus CRM: 2 Min)
     4. Website-Besucher (Google Analytics: 2 Min)
     5. Gewinn (Umsatz - Kosten: 5 Min)

     â†’ In Ampel-Excel eintragen: 10 Min
     â†’ Fertig.

     Total: 27 Minuten/Monat

     Ist DAS machbar?"

[User: "Ja, 30 Min/Monat geht."]

// 5. AUTONOMY (User Chooses Tools)
ai: "Welche Tools nutzt du bereits?

     - Buchhaltung?
     - CRM?
     - Website Analytics?

     Wir bauen dein Tracking auf dem auf,
     was du eh schon hast.

     Keine neuen Tools, die du lernen musst."

// 6. START SMALL, BUILD UP
ai: "So bauen wir auf:

     MONAT 1-3: Nur Top 5 KPIs
     (GewÃ¶hnung, Routine aufbauen)

     MONAT 4-6: +3 Marketing-KPIs
     (Wenn erste 5 laufen)

     MONAT 7+: VollstÃ¤ndiges Dashboard
     (Wenn du bereit bist)

     Du kontrollierst das Tempo.
     Nicht umgekehrt.

     Deal?"

// RESULT: Resistance reduced, minimal tracking accepted
```

---

## Edge Cases & Troubleshooting

### No Benchmarks Available for Niche Industry

**Scenario:** User in very niche industry, no public benchmarks

```yaml
problem:
  - User operates in niche with no published benchmarks
  - Can't validate targets against industry data
  - BA might question target validity

detection:
  - Research returns no relevant benchmarks
  - Industry too specific or new

response:
  ai: "Deine Branche ist sehr spezialisiert.
    Ich finde keine direkten Benchmarks.

    Wir haben 3 Optionen:

    A) VERWANDTE BRANCHEN
    Suche Benchmarks aus Ã¤hnlichen Branchen
    Beispiel: 'Keine Zahlen fÃ¼r [X-Coaching]?
    Nutze Coaching-allgemein'

    B) EIGENE DATEN (falls vorhanden)
    Hast du Nebenbei-Kunden?
    Welche Conversion siehst du da?
    â†’ Das ist DEIN Benchmark

    C) CONSERVATIVE ASSUMPTIONS
    Nutze allgemeine B2B/B2C Benchmarks
    + 50% Puffer fÃ¼r Nische
    + Dokumentiere Logik

    Was passt fÃ¼r dich?"

# Use related industry or conservative general benchmarks
# Document reasoning for BA
```

### User Wants to Track Everything (Unfocused)

**Scenario:** User wants 30+ KPIs, loses focus

```yaml
problem:
  - User enthusiastic about tracking
  - Wants to measure everything
  - Will lead to overwhelm and abandonment

detection:
  - User lists >15 KPIs
  - Includes very granular metrics
  - No prioritization

response:
  ai: "Du bist sehr grÃ¼ndlich! Das ist gut.

       Aber 30 KPIs tracken = 30 Ablenkungen.

       Pareto-Prinzip (80/20):
       20% der KPIs bringen 80% der Insights.

       Lass uns die TOP 5 finden.

       Von deinen 30 KPIs:
       Welche 5 zeigen dir am besten,
       ob du auf Kurs zu SelbsttragfÃ¤higkeit bist?"

# Use Socratic questioning to prioritize
# Focus on "North Star" metrics
# Secondary KPIs as "nice to have, but optional"

  ai: "So strukturieren wir:

       TIER 1 (Monatlich tracken, kritisch):
       â€¢ 5 Top-KPIs

       TIER 2 (Quartalsweise, wichtig):
       â€¢ 5 SekundÃ¤r-KPIs

       TIER 3 (JÃ¤hrlich, nice-to-have):
       â€¢ Rest (wenn Zeit ist)

       Focus auf TIER 1 fÃ¼r GZ-Antrag."
```

### User Avoids Financial Metrics

**Scenario:** User focuses on activity metrics, avoids revenue/profit

```yaml
problem:
  - User lists marketing metrics only
  - Avoids hard financial KPIs
  - Usually fear-based or imposter syndrome

detection:
  - No revenue/profit KPIs listed
  - Only activity metrics (posts, meetings)
  - User deflects when asked about money

response:
  ai: 'Ich sehe viele AktivitÃ¤ts-Metriken:
    â€¢ Posts pro Woche
    â€¢ Meetings pro Monat
    â€¢ Content-StÃ¼cke

    Aber keine Umsatz- oder Gewinn-KPIs.

    Ist da ein Grund?'

  # Listen for resistance
  # Usually one of:

  if fear_of_failure:
    ai: "Ich verstehe - Umsatz fÃ¼hlt sich 'hart' an.
      Als wÃ¼rde man gemessen.

      Aber: BA MUSS Umsatz sehen.
      GZ-Anforderung: SelbsttragfÃ¤higkeit = Gewinn â‰¥ Entnahme

      Das ist nicht optional.

      Lass uns das zusammen durchgehen.
      Schritt fÃ¼r Schritt."

  if imposter_syndrome:
    ai: "Manchmal vermeiden wir Zahlen,
      weil wir denken: 'Was wenn ich's nicht schaffe?'

      Aber: Planung ist nicht Versagen.
      Planung ist Vorbereitung.

      Wenn du â‚¬5.000/M planst und â‚¬4.000 erreichst:
      â†’ Das ist 80% Erfolg, nicht Versagen!

      Welchen Umsatz brauchst du mindestens?"

  if no_financial_background:
    ai: 'Vielleicht fÃ¼hlst du dich unsicher mit Finanzkennzahlen?

      Das ist normal! Viele GrÃ¼nder sind Experten in ihrem Fach,
      nicht in BWL.

      Lass uns die 3 wichtigsten erklÃ¤ren:

      1. UMSATZ: Was kommt rein (alle Rechnungen)
      2. KOSTEN: Was geht raus (alle Ausgaben)
      3. GEWINN: Umsatz - Kosten (was Ã¼brig bleibt)

      FÃ¼r GZ brauchst du:
      Gewinn â‰¥ deine Privatentnahme

      Das trackst du einfach in lexoffice.
      Machbar?'
```

---

## Success Criteria

### Module Complete When:

```yaml
required:
  - âœ… 8-10 core KPIs defined (min. 8)
  - âœ… All 5 categories covered (Financial, Customer, Marketing, Sales, Operational)
  - âœ… Leading + Lagging indicators identified
  - âœ… At least 50% of KPIs have industry benchmarks with sources
  - âœ… Ampel-System (traffic light) defined for critical KPIs
  - âœ… Tracking methods specified for all KPIs
  - âœ… Self-sufficiency KPIs clear (â‰¤Month 6)
  - âœ… Monthly dashboard template created
  - âœ… Review rhythm planned (weekly/monthly/quarterly)
  - âœ… validation.readyForNextModule === true

optional_but_recommended:
  - âœ… Top 5 "North Star" KPIs prioritized
  - âœ… Tool setup plan with timeline
  - âœ… KPI relationships mapped (leading â†’ lagging)
  - âœ… Quarterly target progression realistic

coaching_quality:
  - âœ… CBC used â‰¥2 times (vanity â†’ outcome, guessed â†’ validated)
  - âœ… If resistance occurred: MI pattern used
  - âœ… Benchmarks found for critical KPIs
  - âœ… User confident in tracking approach
  - âœ… No unresolved blockers
```

### Handoff to Next Module

```yaml
# Data passed to gz-module-10-zusammenfassung (Executive Summary)

passed_context:
  - topKPIs (5 North Star metrics for summary)
  - gzCriticalKPIs.selfSufficiencyProof (critical for BA approval)
  - kpiCategories.financial.topKPI (highlight in summary)
  - financialTargets (revenue/profit for summary)

# Data passed to gz-validator (Validation Module)

passed_context:
  - validation (check if KPIs measurable)
  - benchmarks (validate targets realistic)
  - trackingSetup (ensure trackability)
  - gzCriticalKPIs (validate GZ compliance)

# Data passed to gz-document-generator

passed_context:
  - dashboardTemplate (include in business plan appendix)
  - kpiCategories (full KPI table for Chapter 9)
  - trafficLightSystem (visual system for BA)
  - reviewProcess (show ongoing control)

# Data stored in memory for cross-module validation

stored_in_memory:
  - selfSufficiencyMonth (validate â‰¤6)
  - topKPIs (reference in other modules)
  - benchmarks (validate realism across plan)
```

---

## Research Integration Points

### Web Search Triggers

```typescript
// Automatically trigger research for:

1. Industry Conversion Rates
   trigger: Any conversion metric mentioned
   search: "[Branche] conversion rate benchmark"
           "[Branche] website lead conversion"
           "[Branche] sales close rate"

2. Customer Acquisition Cost (CAC)
   trigger: CAC metric or marketing budget discussed
   search: "[Branche] CAC benchmark Germany"
           "[Branche] customer acquisition cost"
           "B2B CAC benchmarks [industry]"

3. Revenue Per Customer
   trigger: Customer count and revenue discussed
   search: "[Branche] average revenue per customer"
           "[Branche] ARPU benchmark"
           "[Branche] customer lifetime value"

4. Marketing Channel Effectiveness
   trigger: Specific channel mentioned (LinkedIn, Google Ads, etc.)
   search: "[Channel] [Branche] ROI benchmark"
           "[Channel] conversion rate [industry]"
           "[Channel] cost per lead [Branche]"

5. Sales Cycle Length
   trigger: B2B sales process discussed
   search: "[Branche] B2B sales cycle length"
           "[Branche] time to close deal"
           "average sales cycle [industry] Germany"

6. Utilization Rates
   trigger: Service business with billable hours
   search: "[Branche] utilization rate benchmark"
           "consultant billable hours percentage"
           "service business capacity utilization"

7. Customer Retention
   trigger: Repeat business model
   search: "[Branche] customer retention rate"
           "[Branche] churn rate benchmark"
           "[industry] customer loyalty statistics"

8. Industry-Specific KPIs
   trigger: Unique business model or metrics
   search: "[Branche] wichtigste Kennzahlen"
           "[Branche] KPIs SelbststÃ¤ndige"
           "[industry] key performance indicators"
```

### Research Results Integration

```typescript
// How to integrate benchmarks into KPI planning

interface BenchmarkResult {
  metric: string;
  industryAverage: number;
  industryRange: { min: number; max: number };
  topPerformer: number;
  source: string;
  credibility: 'high' | 'medium' | 'low';
  geography: 'Germany' | 'Europe' | 'Global';
}

function integrateResearch(
  result: BenchmarkResult,
  userTarget: number
): KPITarget {
  // Compare user's target with benchmark
  const comparison = {
    vsAverage: (userTarget / result.industryAverage - 1) * 100,
    vsTopPerformer: (userTarget / result.topPerformer - 1) * 100,
  };

  if (comparison.vsAverage > 50) {
    // User target >50% above industry average
    return triggerCBC({
      issue: 'unrealistic_target',
      evidence: result,
      userTarget: userTarget,
      industryAverage: result.industryAverage,
      recommendation: 'conservative_planning',
      suggestedTarget: result.industryAverage * 1.1, // 10% above average
    });
  } else if (comparison.vsAverage < -30) {
    // User target 30% below industry average
    return discussLowTarget({
      userTarget: userTarget,
      benchmark: result.industryAverage,
      question: 'Warum planst du unter Industry Average?',
    });
  }

  // Within reasonable range - accept and document
  return {
    target: userTarget,
    benchmark: result.industryAverage,
    positioning: comparison.vsAverage > 0 ? 'above_average' : 'conservative',
    source: result.source,
    validated: true,
  };
}

// Example:
// User: "Conversion Rate 5%"
// Research: "Industry Average 2-3%"
// Result: 5% is top-performer level, accept if user has strong justification
//         OR suggest 3% (conservative) for BA approval
```

---

## Coaching Effectiveness Metrics

Track per conversation:

```typescript
interface CoachingMetrics {
  // CBC Effectiveness
  vanity_metrics_reframed: number; // Target: â‰¥2
  unbenchmarked_targets_validated: number; // Research-backed
  measurement_methods_clarified: number; // "How to track" defined
  unrealistic_targets_adjusted: number;

  // MI Effectiveness (if triggered)
  tracking_resistance_resolved: boolean;
  overwhelm_managed: boolean;
  minimal_tracking_accepted: boolean;

  // KPI Quality
  total_kpis_defined: number; // Target: 8-10
  kpis_with_benchmarks: number; // Target: â‰¥50%
  leading_indicators: number; // Target: â‰¥40% of total
  lagging_indicators: number;
  outcome_vs_activity_ratio: number; // Target: â‰¥60% outcome

  // Coverage
  categories_covered: number; // Target: 5
  financial_kpis: number; // Target: â‰¥2
  gz_critical_kpis_defined: boolean; // Self-sufficiency

  // Tracking Setup
  tracking_methods_defined: number; // All KPIs
  tools_selected: number;
  dashboard_created: boolean;
  ampel_system_complete: boolean;

  // Validation
  self_sufficiency_month: number; // Target: â‰¤6
  benchmarks_sources: number; // Research citations
  targets_realistic: boolean; // vs. benchmarks

  // User Experience
  iterations_needed: number;
  user_confidence_tracking: 'high' | 'medium' | 'low';
  tracking_time_acceptable: boolean; // User finds time investment OK

  // Module Completion
  time_to_complete: number; // Target: 60 minutes
  blockers_at_end: number; // Target: 0
  ready_for_zusammenfassung: boolean;
}
```

---

## Testing Strategy

### Unit Tests

```typescript
describe('KPI Module', () => {
  test('Vanity metric detection', () => {
    const kpis = ['Instagram Followers', 'Likes per Post'];
    const analysis = analyzeMetricTypes(kpis);
    expect(analysis.hasVanityMetrics).toBe(true);
    expect(analysis.outcomeMetrics).toEqual([]);
  });

  test('Benchmark validation', () => {
    const userTarget = { conversionRate: 50 };
    const benchmark = { industryAverage: 2.5 };
    const validation = validateAgainstBenchmark(userTarget, benchmark);
    expect(validation.realistic).toBe(false);
    expect(validation.deviationPercent).toBeGreaterThan(1000);
  });

  test('Leading vs. lagging classification', () => {
    const kpi = { name: 'Website-Besucher', drivenBy: ['SEO', 'Ads'] };
    const type = classifyIndicator(kpi);
    expect(type).toBe('leading');
  });

  test('Traffic light thresholds', () => {
    const kpi = { name: 'Umsatz', target: 5000 };
    const ampel = calculateAmpelThresholds(kpi);
    expect(ampel.green.min).toBe(5000);
    expect(ampel.yellow.range).toBe('3500-4999');
    expect(ampel.red.max).toBe(3500);
  });

  test('Self-sufficiency KPI validation', () => {
    const data = { selfSufficiencyMonth: 8 };
    const validation = validateGZKPIs(data);
    expect(validation.valid).toBe(false);
    expect(validation.blocker).toBe('self_sufficiency_too_late');
  });
});
```

### Integration Tests

```typescript
describe('KPI Integration', () => {
  test('Financial KPIs match finanzplanung module', () => {
    const finanzData = createMockFinanzData();
    const kpiData = deriveKPIsFromModules(finanzData);
    expect(kpiData.kpiCategories.financial.kpis[0].targets.year1).toBe(
      finanzData.revenueYearly.year1
    );
  });

  test('Marketing KPIs match marketing module', () => {
    const marketingData = createMockMarketingData();
    const kpiData = deriveKPIsFromModules({}, marketingData);
    expect(kpiData.kpiCategories.marketing.kpis).toContainEqual(
      expect.objectContaining({ name: 'Leads/Monat' })
    );
  });

  test('Benchmark research triggered automatically', async () => {
    const spy = jest.spyOn(research, 'search');
    await buildKPIs({ businessType: 'consulting' });
    expect(spy).toHaveBeenCalledWith(
      expect.stringContaining('consulting conversion rate')
    );
  });
});
```

### E2E Test Scenarios

```typescript
describe('KPI Module E2E', () => {
  test('Complete happy path: IT consultant', async () => {
    const persona = createTestPersona('IT-consultant');
    const result = await runModuleConversation(persona);

    expect(result.completed).toBe(true);
    expect(result.totalKPIs).toBeGreaterThanOrEqual(8);
    expect(result.kpiCategories.financial.kpis.length).toBeGreaterThan(0);
    expect(result.benchmarksFound).toBeGreaterThan(0);
    expect(result.dashboardTemplate).toBeDefined();
    expect(result.validation.readyForNextModule).toBe(true);
  });

  test('CBC pattern: vanity metrics â†’ outcome metrics', async () => {
    const persona = createTestPersona('vanity-focused-founder');
    persona.initialKPIs = ['Instagram Followers', 'Likes'];
    const result = await runModuleConversation(persona);

    expect(result.metadata.coachingPatternsUsed).toContain('CBC');
    expect(result.metadata.vanity_metrics_reframed).toBeGreaterThan(0);
    expect(result.kpiCategories.financial.kpis).toContainEqual(
      expect.objectContaining({ name: expect.stringContaining('Umsatz') })
    );
  });

  test('CBC pattern: unbenchmarked â†’ researched targets', async () => {
    const persona = createTestPersona('optimistic-founder');
    persona.initialTargets = { conversionRate: 50 };
    const result = await runModuleConversation(persona);

    expect(result.metadata.coachingPatternsUsed).toContain('CBC');
    expect(result.metadata.unrealistic_targets_adjusted).toBeGreaterThan(0);
    expect(result.researchCitations).toBeGreaterThan(0);
    expect(result.kpiCategories.marketing.kpis[0].benchmark).toBeDefined();
  });

  test('MI pattern: tracking resistance â†’ acceptance', async () => {
    const persona = createTestPersona('tracking-resistant-founder');
    const result = await runModuleConversation(persona);

    expect(result.metadata.coachingPatternsUsed).toContain('MI');
    expect(result.metadata.tracking_resistance_resolved).toBe(true);
    expect(result.trackingSetup.totalSetupTime).toBeLessThan(2); // Hours
    expect(result.reviewProcess.monthly.duration).toBeLessThanOrEqual(60); // Min
  });

  test('Blocker: no financial KPIs', async () => {
    const persona = createTestPersona('financial-avoidant-founder');
    const result = await runModuleConversation(persona);

    // Should detect and insist on financial KPIs
    expect(result.kpiCategories.financial.kpis.length).toBeGreaterThan(0);
    expect(result.gzCriticalKPIs.selfSufficiencyProof).toBeDefined();
  });
});
```

---

## Common Coaching Scenarios

### Scenario 1: User Wants Only Activity Metrics

```typescript
user: "Meine KPIs:
       â€¢ LinkedIn Posts pro Woche: 3
       â€¢ Networking Events pro Monat: 4
       â€¢ ErstgesprÃ¤che pro Woche: 2
       â€¢ Content-StÃ¼cke pro Monat: 8"

// All leading/activity, no outcomes

ai: "Das sind gute AktivitÃ¤ts-Metriken!
     Sie zeigen, was du TUST.

     Jetzt fehlen die Ergebnis-Metriken:
     Was kommt dabei RAUS?

     Von 2 ErstgesprÃ¤chen/Woche (8/Monat):
     â€¢ Wie viele werden zu Angeboten?
     â€¢ Wie viele zu Kunden?
     â€¢ Welcher Umsatz?

     Das sind die KPIs, die BA sehen will.

     Lass uns rÃ¼ckwÃ¤rts rechnen..."

// Build outcome metrics from activities
```

### Scenario 2: User Has Zero Data Background

```typescript
user: "Ich bin Handwerker, kein Betriebswirt.
       KPIs, Benchmarks, Conversion... ich verstehe nur Bahnhof."

// Empathy + Simplify

ai: "Verstehe total! Du bist Experte in [Handwerk],
     nicht in Zahlen.

     Lass uns KPIs in deine Sprache Ã¼bersetzen:

     KPI = Messzahl
     â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
     Wie beim Hausbau:
     'Ist das Fundament gerade?' â†’ Wasserwage
     'Ist die Wand stabil?' â†’ Druck-Test
     'Ist termingerecht?' â†’ Kalender

     FÃ¼r dein Business:
     'Verdiene ich genug?' â†’ Umsatz-KPI
     'Habe ich Kunden?' â†’ Kunden-Anzahl-KPI
     'Bin ich selbsttragend?' â†’ Gewinn-KPI

     Das sind nur MessgerÃ¤te fÃ¼r dein Business.

     Machbar?"

// Use analogies from user's domain
// Simplify language
// Focus on 3-5 simple KPIs only
```

### Scenario 3: Niche Business, No Benchmarks

```typescript
ai: "[Searching for benchmarks...]

     Hmm, fÃ¼r [Niche] finde ich keine direkten Benchmarks.
     Zu spezialisiert.

     Wir haben 3 Optionen:

     1. VERWANDTE BRANCHE
        [Niche] ist Ã¤hnlich zu [Related].
        Nutzen wir deren Benchmarks?

     2. EIGENE ERFAHRUNG
        Hast du schon Nebenbei-Kunden?
        Welche Zahlen siehst du da?

     3. CONSERVATIVE ESTIMATE
        Nutzen wir B2B-Standard (2% Conversion)
        + dokumentieren Logik fÃ¼r BA

     Was passt am besten?"

// Adapt when no direct benchmarks available
// Document reasoning for BA
```

---

## Final Output Format

### KPI Section for Business Plan

```markdown
# 9. KPI-PLAN & ERFOLGSKONTROLLE

## 9.1 Ãœbersicht Key Performance Indicators

[Main KPI table from kpiCategories]

## 9.2 Top 5 Kennzahlen (North Star KPIs)

1. **[KPI 1]**: [Target Year 1]
   - Kategorie: [Category]
   - Kritisch weil: [Reason]
   - Messung: [Method]

2. **[KPI 2]**: [Target Year 1]
   ...

## 9.3 SelbsttragfÃ¤higkeit-Nachweis (GZ-kritisch)

**Metrik:** Monatlicher Gewinn â‰¥ Privatentnahme
**Ziel-Monat:** [Month] (â‰¤6) âœ“
**Zielwert:** â‚¬[Amount]
**Nachweis:** Buchhaltung, Steuerberater-BestÃ¤tigung

## 9.4 Ampel-System (Traffic Light System)

[Traffic light table from trafficLightSystem]

ðŸŸ¢ GrÃ¼n: Ziel erreicht â†’ Weiter so
ðŸŸ¡ Gelb: Aufmerksamkeit nÃ¶tig â†’ Ursache analysieren
ðŸ”´ Rot: Handlung erforderlich â†’ Sofort MaÃŸnahmen

## 9.5 Tracking-Methoden

[Tracking methods table from trackingSetup]

## 9.6 Review-Rhythmus

- **WÃ¶chentlich (15 Min):** FÃ¼hrende KPIs
- **Monatlich (1 Std):** VollstÃ¤ndiges Dashboard
- **Quartalsweise (2 Std):** Trend-Analyse, Strategie
- **JÃ¤hrlich:** Ziel-Anpassung

## 9.7 Benchmark-Quellen

[List of research sources with URLs]
```

---

**END OF gz-module-09-kpi STREAMLINED**

**Next Module:** gz-module-10-zusammenfassung (Executive Summary)
