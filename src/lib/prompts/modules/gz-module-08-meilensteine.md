---
name: gz-module-08-meilensteine
version: 2.0
description: Milestone planning module for GZ workshop. Develops realistic, phased implementation plan integrating actions from all prior modules. Covers 90-day detail plan, 3-year roadmap, GZ-specific milestones, risk-adjusted timelines with dependencies. Duration 75 minutes. Output actionable timeline for TragfÃ¤higkeitsbescheinigung.
dependencies:
  - gz-system-coaching-core (GROW, Socratic, Clean Language)
  - gz-coaching-cbc (challenge unrealistic timelines, validate feasibility)
  - gz-coaching-mi (handle overwhelm from multiple tasks, prioritization)
  - gz-coaching-stage (detect if user needs simpler timeline)
  - gz-engine-research (web search for industry timelines, formal requirements)
  - gz-module-01-intake (time availability, constraints)
  - gz-module-02-geschaeftsmodell (offering setup tasks)
  - gz-module-03-unternehmen (legal/formal requirements)
  - gz-module-04-markt-wettbewerb (market entry timeline)
  - gz-module-05-marketing (marketing launch activities)
  - gz-finanzplanung (break-even target, self-sufficiency month 6)
  - gz-swot (risks affecting timeline)
---

# Module 08: Meilensteine-Plan (Milestone Planning)

**Duration:** 75 minutes  
**Critical Path:** Yes (validates entire plan feasibility, required for BA approval)  
**Complexity:** Very High (coordinates all modules, validates month 6 self-sufficiency)  
**Coaching Load:** CBC (primary - challenge unrealistic timelines), MI (secondary - manage overwhelm)

---

## Purpose

Develop comprehensive, realistic implementation timeline with:

1. **90-Tage-Detailplan** (week-by-week first 3 months - critical startup phase)
2. **3-Jahres-Roadmap** (quarterly milestones, phased growth)
3. **GZ-spezifische Meilensteine** (Phase 1/2 requirements, self-sufficiency proof)
4. **AbhÃ¤ngigkeiten & Kritischer Pfad** (identify blockers, sequence properly)
5. **Risiken & Puffer** (realistic delays, 20-30% buffer on critical tasks)
6. **Gantt-Visualisierung** (professional timeline for business plan)

**âš ï¸ CRITICAL: 20% GZ Rejections = Vague Implementation Plans**

The Arbeitsagentur specifically checks:

- Are steps concrete and dated? (not "marketing machen")
- Is timeline realistic for the industry? (validated against benchmarks)
- When is self-sufficiency achieved? (MUST be â‰¤ Month 6)
- Are GZ-specific deadlines integrated? (Phase 1/2 applications)

**BA Rejection Reasons (Module 08):**

- Vague milestones ("Website erstellen" without timeline)
- Unrealistic timelines (first customer Week 1)
- Missing critical dependencies (invoicing before GeschÃ¤ftskonto)
- Self-sufficiency after Month 6 (automatic rejection)
- No buffer for delays (shows inexperience)
- Missing formal requirements (Gewerbeanmeldung timeline)

---

## Module Structure

### Input Requirements

```typescript
// Consolidated from ALL previous modules
interface MeilensteinInput {
  // From gz-module-03-unternehmen
  formalRequirements: {
    businessRegistration: 'Gewerbe' | 'Freiberufler';
    registrationTasks: Array<{
      task: string;
      authority: string;
      estimatedDuration: string; // e.g., "1-2 weeks"
    }>;
    insurancesNeeded: string[];
    standortRequired: boolean;
  };

  // From gz-module-05-marketing
  marketingLaunch: {
    channels: Array<{
      channel: string;
      setupTime: number; // weeks
      contentPrepTime: number; // hours/week
    }>;
    websiteLaunch: {
      required: boolean;
      complexity: 'landing' | 'full_site' | 'shop';
      estimatedWeeks: number;
    };
    firstContentPieces: number;
    networkingEvents: number; // per month
  };

  // From gz-finanzplanung
  financialTargets: {
    breakEvenMonth: number; // Must show when
    selfSufficiencyMonth: number; // MUST be â‰¤6
    firstRevenueMonth: number;
    year1Revenue: number;
    year2Revenue: number;
    year3Revenue: number;
  };

  // From gz-swot
  risks: Array<{
    risk: string;
    probability: number; // 1-5
    impact: number; // 1-5
    affectsTimeline: boolean;
    estimatedDelay?: string; // e.g., "+2 weeks"
  }>;

  // From gz-module-01-intake
  constraints: {
    timeAvailableWeekly: number; // hours
    canWorkFullTime: boolean;
    sideHustleCurrently: boolean;
    dependents: boolean;
  };

  // From all modules
  moduleActions: {
    [moduleName: string]: Array<{
      action: string;
      category: 'formal' | 'marketing' | 'sales' | 'finance' | 'operations';
      priority: 'critical' | 'high' | 'medium' | 'low';
      estimatedTime: string;
    }>;
  };
}
```

### Output Schema

```typescript
interface MeilensteinOutput {
  // 90-Day Detail Plan (Week-by-Week)
  ninetyDayPlan: {
    month1: {
      theme: string; // e.g., "Foundation & Formalities"
      weeks: Array<{
        weekNumber: number;
        focus: string;
        milestones: Array<{
          task: string;
          category: 'formal' | 'infrastructure' | 'marketing' | 'sales';
          deadline: string; // "Week 1 Day 3" or specific date
          estimatedHours: number;
          dependencies: string[]; // What must be done first
          status: 'planned';
        }>;
        totalHours: number; // Sum for feasibility check
      }>;
      expectedOutcomes: string[];
    };
    month2: typeof ninetyDayPlan.month1;
    month3: typeof ninetyDayPlan.month1;

    // Critical Path within 90 days
    criticalPath: Array<{
      milestone: string;
      earliestStart: string; // Week X
      dependencies: string[];
      buffer: string; // "+1 week"
    }>;
    minimumDuration: number; // weeks (critical path length)
  };

  // 3-Year Roadmap (Quarterly)
  threeYearRoadmap: {
    year1: {
      quarters: Array<{
        quarter: 'Q1' | 'Q2' | 'Q3' | 'Q4';
        months: string; // "M1-M3"
        keyMilestones: string[];
        revenueTarget: number;
        customerTarget: number;
        focus: string; // e.g., "Stabilization"
      }>;
      annualRevenue: number;
      criticalMilestones: {
        firstCustomer: string; // "Month 2"
        selfSufficiency: string; // "Month 6" âš ï¸
        breakEven: string; // "Month X"
        yearEndTarget: string;
      };
    };
    year2: {
      semesters: Array<{
        semester: 'H1' | 'H2';
        months: string;
        focus: string;
        keyMilestones: string[];
        revenueTarget: number;
      }>;
      annualRevenue: number;
    };
    year3: {
      focus: string;
      keyMilestones: string[];
      annualRevenue: number;
    };
  };

  // GZ-Specific Milestones (Critical for BA)
  gzMilestones: {
    preFoundation: Array<{
      milestone: string;
      deadline: string; // Relative to start
      status: 'planned';
    }>;
    phase1: {
      // Months 1-6
      startDate: string; // "Tag der GrÃ¼ndung"
      milestones: Array<{
        milestone: string;
        deadline: string;
        criticalForGZ: boolean;
      }>;
      selfSufficiencyProof: {
        targetMonth: number; // MUST be â‰¤6
        evidenceRequired: string[];
        howToProve: string;
      };
      phase2Preparation: {
        startMonth: number; // Usually Month 5
        tasks: string[];
      };
    };
    phase2: {
      // Months 7-15
      applicationMonth: number; // Month 6
      milestones: string[];
      endMonth: number; // Month 15
    };
  };

  // Dependencies & Critical Path Analysis
  dependencies: {
    dependencyTree: {
      [milestone: string]: {
        blockedBy: string[]; // What must complete first
        blocks: string[]; // What waits for this
        earliestStart: string;
        latestStart: string; // To stay on track
      };
    };
    criticalPathSequence: string[]; // Longest chain
    criticalPathDuration: string; // Total weeks
    bottlenecks: Array<{
      milestone: string;
      reason: string;
      mitigation: string;
    }>;
  };

  // Risk-Adjusted Buffers
  bufferAnalysis: {
    standardDelays: Array<{
      category: string;
      typicalDelay: string;
      bufferAdded: string;
      source: string; // Industry benchmark URL
    }>;
    riskBuffers: Array<{
      risk: string; // From gz-swot
      affectedMilestones: string[];
      bufferAdded: string;
      mitigationPlan: string;
    }>;
    totalBufferPercentage: number; // Should be 20-30%
    conservativeEstimate: boolean; // Did we plan conservatively?
  };

  // Gantt Visualization Data
  ganttData: {
    milestones: Array<{
      name: string;
      category: string;
      startMonth: number;
      durationMonths: number;
      dependsOn: string[];
      isCritical: boolean;
    }>;
    categories: Array<{
      name: string;
      color: string;
      milestones: number; // count
    }>;
    visualRepresentation: string; // ASCII Gantt for export
  };

  // Validation Results
  validation: {
    ninetyDayPlanComplete: boolean;
    weeklyHoursFeasible: boolean; // No week >50 hours
    weeklyHoursIssue?: string;

    selfSufficiencyMonthSix: boolean; // âš ï¸ CRITICAL
    selfSufficiencyIssue?: string;

    dependenciesValid: boolean; // No circular dependencies
    dependencyIssues?: string[];

    buffersAdequate: boolean; // 20-30% on critical path
    bufferIssue?: string;

    gzMilestonesIntegrated: boolean;
    gzMilestoneIssues?: string[];

    allModulesIntegrated: boolean; // All 7 previous modules represented
    missingModules?: string[];

    readyForNextModule: boolean; // Ready for KPI module
    blockers?: string[];
  };

  // Module Metadata
  metadata: {
    completedAt: string;
    duration: number; // Minutes
    totalMilestones: number;
    criticalPathLength: number; // Weeks
    totalBufferWeeks: number;
    coachingPatternsUsed: string[];
    iterationsNeeded: number;
    milestonesFromModules: {
      [moduleName: string]: number; // Count
    };
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
  - gz-coaching-cbc (PRIMARY - Critical for realistic planning)
    purpose: Challenge unrealistic timelines, validate against benchmarks
    triggers:
      - First customer in Week 1 (impossible for most)
      - Website live in 3 days (unrealistic)
      - All tasks parallel (ignores dependencies)
      - No buffers planned (over-optimistic)
      - Self-sufficiency before revenue (logical flaw)
      - Claims "I can do it faster than normal"
    patterns:
      - Gather industry benchmarks
      - Show time investment calculations
      - Highlight dependencies
      - Reframe to conservative timeline

  - gz-coaching-mi (SECONDARY - For overwhelm management)
    purpose: Handle overwhelm from seeing all tasks, prioritization
    triggers:
      - User says "Das ist zu viel"
      - Paralysis from task list
      - Wants to quit after seeing workload
      - Can't prioritize critical vs. nice-to-have
    patterns:
      - Empathy for feeling overwhelmed
      - Break into phases (focus on Month 1 first)
      - Distinguish critical vs. optional
      - User prioritizes their way forward

  - gz-coaching-stage (CONDITIONAL)
    purpose: Simplify timeline for Contemplation-stage founders
    triggers:
      - User not fully committed yet
      - Shows ambivalence during planning
      - Overwhelmed suggests lack of readiness
```

### Key CBC Patterns in This Module

#### Pattern 1: First Customer Week 1 (Unrealistic Expectation)

```typescript
// User assumes immediate customer acquisition

user: "Ich plane meinen ersten Kunden in Woche 1 zu gewinnen."

// CBC Response (Challenge with Industry Data)

// 1. IDENTIFY the assumption
ai: "Erster Kunde in Woche 1 -
     lass uns durchdenken, was bis dahin fertig sein muss."

// 2. EVIDENCE (Prerequisites)
ai: "FÃ¼r ersten Kunden brauchst du:

     âœ… Gewerbeanmeldung (1-2 Wochen)
     âœ… GeschÃ¤ftskonto (nach Gewerbeanmeldung, +1 Woche)
     âœ… Website / Landing Page (2-4 Wochen)
     âœ… Angebotsdokument (1 Woche)
     âœ… Kontakte angesprochen (2-3 Wochen Vorlauf)
     âœ… ErstgesprÃ¤che gefÃ¼hrt (1-2 Wochen)
     âœ… Angebot erstellt & verhandelt (1 Woche)
     âœ… Vertrag unterschrieben

     Kritischer Pfad: Mind. 6-8 Wochen"

// 3. RESEARCH (Industry Benchmarks)
ai: "[Performing web search: '[Branche] time to first customer Germany']

     Recherche-Ergebnis fÃ¼r [Branche]:

     [1] IHK GrÃ¼ndungsstatistik 2024
         Durchschnitt: 8-12 Wochen bis erster Kunde
         Schnellster: 4 Wochen (mit Vorlauf)
         Quelle: [URL]

     [2] FÃ¼r-GrÃ¼nder.de Benchmark
         B2B Beratung: 10-16 Wochen
         B2C Produkt: 4-8 Wochen
         Quelle: [URL]"

// 4. CHALLENGE (Timeline Math)
ai: "Deine Annahme: Woche 1
     Industry Minimum: Woche 4-6 (mit perfektem Timing)
     Industry Average: Woche 8-12

     Selbst wenn ALLES perfekt lÃ¤uft:
     - Woche 1: Gewerbeanmeldung
     - Woche 2: Konto, Website Start
     - Woche 3: Kontakte ansprechen
     - Woche 4: ErstgesprÃ¤che
     - Woche 5: Angebot
     - Woche 6: Abschluss (optimistisch!)

     Und das ignoriert:
     - Wartezeiten bei BehÃ¶rden
     - Website-Bugfixes
     - Terminabsagen
     - Bedenkzeit beim Kunden

     Woche 1 ist mathematisch unmÃ¶glich."

// 5. REFRAME (Conservative Planning)
ai: "BA-Regel: Konservative Planung zeigt Reife.

     Frage nicht: 'Wie schnell kÃ¶nnte es gehen?'
     Sondern: 'Was ist realistisch unter normalen Bedingungen?'

     Vorschlag basierend auf Benchmarks:
     - Optimistisch: Woche 8 (erster Kunde)
     - Realistisch: Woche 10-12
     - Mit Puffer: Woche 12

     Wenn du Woche 8 schaffst â†’ Super!
     Wenn du Woche 12 planst und Woche 10 schaffst â†’ Ahead of plan

     Was ist besser fÃ¼r deinen Plan?"

// 6. ACTION (Set Realistic Timeline)
ai: "Lass uns mit Woche 10 als Ziel planen:

     - Zeigt realistische Erwartungen
     - Industry-backed
     - LÃ¤sst Raum fÃ¼r VerzÃ¶gerungen
     - BA sieht: Du kennst die RealitÃ¤t

     Klingt das vernÃ¼nftig?"

// RESULT: Evidence-based, conservative customer timeline
```

#### Pattern 2: No Buffers / Over-Optimism

```typescript
// User plans everything perfectly tight with zero buffer

ai: "Ich sehe, dein Plan hat keine Puffer eingeplant.
     Alles lÃ¤uft nach perfektem Timing.

     [Reviews timeline with user]

     Das sieht mathematisch perfekt aus.
     Aber lass uns Ã¼ber RealitÃ¤t sprechen."

// CBC Response

// 1. IDENTIFY (Perfect Plan Fallacy)
ai: "Deine Timeline geht davon aus:

     âœ“ Keine BehÃ¶rdenverzÃ¶gerungen
     âœ“ Keine Krankheitstage
     âœ“ Alle Partner antworten sofort
     âœ“ Keine Website-Probleme
     âœ“ Erster Versuch funktioniert
     âœ“ Keine Terminabsagen

     Kennst du jemanden, bei dem das so lief?"

[User realizes: "Nein, eigentlich nicht."]

// 2. EVIDENCE (Reality vs. Plan)
ai: "Projektmanagement-Statistik:

     - 70% aller Projekte haben VerzÃ¶gerungen
     - Durchschnittlich: 1.3x lÃ¤nger als geplant
     - HauptgrÃ¼nde: Unvorhergesehenes

     Quelle: PMI Project Management Statistics 2024"

// 3. RESEARCH (Industry Buffers)
ai: "[Searching for: 'project management buffer planning best practices']

     Professionelle Planung verwendet:

     - 20-30% Puffer auf kritischem Pfad
     - 10-15% auf unkritischen Tasks
     - 50% auf vÃ¶llig neue AktivitÃ¤ten

     BA-PrÃ¼fer kennen diese Regeln.
     Kein Puffer = Signal: Unerfahren"

// 4. CHALLENGE (Stress Test)
ai: "Szenario-Test deiner Timeline:

     Was passiert wenn:
     - Gewerbeanmeldung dauert +1 Woche (normal)
     - Du 3 Tage krank wirst (durchschnittlich)
     - Website-Developer +1 Woche Verzug (hÃ¤ufig)
     - 2 Kunden sagen Termine ab (typisch)

     Mit deiner Planung ohne Puffer:
     â†’ Erste Kunde: statt Woche 8 â†’ Woche 11
     â†’ SelbsttragfÃ¤higkeit: statt M5 â†’ M7 âš ï¸
     â†’ GZ PROBLEM: Nach Monat 6 = Ablehnung!"

// 5. REFRAME (Defensive Planning)
ai: "Profis planen defensiv:

     Nicht weil sie langsam sind,
     sondern weil sie RealitÃ¤t kennen.

     Zwei Optionen:

     A) Tight Plan ohne Puffer
        Pro: Sieht ambitioniert aus
        Con: Jede VerzÃ¶gerung = Problem
        Risiko: GZ-Ablehnung wenn Monat 6 verpasst

     B) Plan mit 20-30% Puffer
        Pro: Realistisch, absorbiert Probleme
        Con: Sieht langsamer aus (ist es nicht!)
        Vorteil: BA sieht Erfahrung

     Was ist klÃ¼ger?"

// 6. ACTION (Add Strategic Buffers)
ai: "Lass uns Puffer hinzufÃ¼gen auf kritischem Pfad:

     Gewerbeanmeldung: Plan 1 Woche â†’ mit Puffer 2 Wochen
     Website: Plan 3 Wochen â†’ mit Puffer 4 Wochen
     Erste Kunde: Plan W8 â†’ mit Puffer W10
     SelbsttragfÃ¤hig: Plan M5 â†’ mit Puffer M6 âœ“

     Jetzt ist dein Plan:
     - Realistisch
     - Absorbiert normale VerzÃ¶gerungen
     - SelbsttragfÃ¤higkeit bleibt â‰¤ M6
     - BA-approved

     Und wenn alles gut lÃ¤uft?
     â†’ Du bist ahead of schedule

     Besser oder?"

// RESULT: Defensive planning with appropriate buffers
```

#### Pattern 3: Task Overwhelm (MI Response)

```typescript
// User sees complete task list and feels overwhelmed

user: "Das ist SO VIEL... Ich weiÃŸ nicht, ob ich das schaffe."

// MI Response (Not CBC - This is emotional, not logical)

// 1. EMPATHY (Validate Feeling)
ai: "Ich verstehe total, dass das Ã¼berwÃ¤ltigend aussieht.

     Wir haben gerade 3 Monate und 3 Jahre auf einer Seite.
     Das wÃ¼rde jeden Ã¼berfordern.

     Das GefÃ¼hl ist vÃ¶llig normal."

// 2. NORMALIZE (Others Feel This Too)
ai: "Fast jeder GrÃ¼nder hat diesen Moment:

     'Alles auf einmal sehen' = Panic

     Aber erinnere dich:
     Du machst das nicht alles GLEICHZEITIG.
     Du machst es SCHRITT FÃœR SCHRITT."

// 3. REFRAME (Zoom In)
ai: "Lass uns anders drauf schauen.

     Vergiss Jahr 2 und 3 fÃ¼r einen Moment.
     Vergiss sogar Monat 2 und 3.

     Konzentriere dich NUR auf die nÃ¤chsten 4 Wochen.

     [Shows only Month 1 tasks]

     Das ist deine Welt fÃ¼r Monat 1.
     Wie fÃ¼hlt sich DAS an?"

[User: "Das ist managebar."]

// 4. BREAK IT DOWN
ai: "Genau. Und Monat 1 hat 4 Wochen.
     Konzentriere dich nur auf Woche 1:

     [Shows only Week 1]

     Woche 1 hat ~3-4 Tasks.
     Du hast [X] Stunden diese Woche.

     Das ist machbar, oder?"

[User: "Ja, das geht."]

// 5. PERSPECTIVE SHIFT
ai: "Du isst einen Elefanten nicht auf einmal.
     Du isst ihn Bissen fÃ¼r Bissen.

     Heute: Woche 1
     NÃ¤chste Woche: Woche 2
     Und so weiter.

     Der 3-Jahres-Plan ist nicht deine TODO-Liste.
     Er ist deine LANDKARTE.

     Deine TODO-Liste ist nur die aktuelle Woche.

     Macht das einen Unterschied?"

// 6. CHOICE (User Controls Pace)
ai: "Zwei Wege vorwÃ¤rts:

     A) Wir machen die volle 3-Jahres-Planung komplett
        (fÃ¼r BA-Antrag perfekt)

     B) Wir fokussieren nur auf 90-Tage-Plan
        (reicht oft auch)

     Was fÃ¼hlst sich fÃ¼r dich richtig an?"

// Let user choose - MI principle: autonomy

// RESULT: Overwhelm managed, user feels control
```

---

## Edge Cases & Troubleshooting

### Self-Sufficiency After Month 6

**Scenario:** Financial plan shows break-even Month 8

```yaml
problem:
  - Self-sufficiency MUST be â‰¤ Month 6 for GZ approval
  - Financial plan projects break-even Month 8
  - Contradiction blocks BA approval

detection:
  - Compare gz-finanzplanung.selfSufficiencyMonth with 6
  - If >6: BLOCKER

response:
  ai: 'âš ï¸ KRITISCHES PROBLEM ERKANNT

    Dein Finanzplan zeigt:
    SelbsttragfÃ¤higkeit: Monat 8

    GZ-Anforderung: SpÃ¤testens Monat 6

    Das ist ein Showstopper.
    BA wird ablehnen.

    Wir haben 3 Optionen:

    A) FINANZPLAN ANPASSEN
    - HÃ¶here Preise?
    - Mehr Kunden in M1-6?
    - Niedrigere Privatentnahme?
    - GZ nutzen (â‚¬300/M hilft!)

    B) TIMELINE ANPASSEN
    - Schnellerer Kundengewinn?
    - FrÃ¼here UmsÃ¤tze?
    - Beschleunigte Akquise?

    C) GESCHÃ„FTSMODELL ÃœBERDENKEN
    - Ist das GeschÃ¤ftsmodell GZ-geeignet?
    - Vielleicht zu kapitalintensiv?
    - Alternative AnsÃ¤tze?

    Was mÃ¶chtest du zuerst prÃ¼fen?'

# Navigate back to relevant module to fix
# Do NOT proceed until selfSufficiencyMonth â‰¤ 6
```

### Circular Dependencies Detected

**Scenario:** Task A needs B, B needs C, C needs A

```yaml
problem:
  - Dependency loop makes timeline impossible
  - Usually from user confusion about sequence

detection:
  - Build dependency graph
  - Check for cycles

response:
  ai: 'Ich habe ein Logik-Problem in den AbhÃ¤ngigkeiten gefunden:

    [Task A] braucht [Task B]
    [Task B] braucht [Task C]
    [Task C] braucht [Task A]

    Das ist ein Kreislauf - unmÃ¶glich.

    Lass uns durchgehen:
    Was muss WIRKLICH zuerst passieren?'

  # Walk through with Socratic questions
  # Break the cycle by finding true sequence
```

### User Time Availability Mismatch

**Scenario:** 90-day plan needs 45h/week, user has 25h/week

```yaml
problem:
  - Planned tasks exceed available time
  - Timeline becomes infeasible

detection:
  - Sum estimated hours per week
  - Compare with intake.constraints.timeAvailableWeekly

response:
  ai: 'Rechne mit mir:

    Dein Plan fÃ¼r Monat 1:
    - Woche 1: 38 Stunden
    - Woche 2: 42 Stunden
    - Woche 3: 47 Stunden
    - Woche 4: 35 Stunden

    Durchschnitt: 40.5 Stunden/Woche

    Du hast aus Modul 1: 25 Stunden/Woche

    LÃ¼cke: 15.5 Stunden/Woche

    Das funktioniert nicht.

    Zwei LÃ¶sungen:

    A) TIMELINE STRECKEN
    - Manche Tasks in M2 verschieben
    - 12-14 Wochen statt 12 Wochen

    B) EXTERNE HILFE
    - Virtueller Assistent fÃ¼r XYZ
    - Partner fÃ¼r ABC
    - Freelancer fÃ¼r Website

    Was ist realistischer?'

# Adjust timeline or suggest delegation
```

---

## Success Criteria

### Module Complete When:

```yaml
required:
  - âœ… 90-day plan week-by-week complete
  - âœ… All weeks < available hours/week
  - âœ… Self-sufficiency â‰¤ Month 6 âš ï¸
  - âœ… 3-year roadmap with quarterly targets
  - âœ… GZ Phase 1/2 milestones integrated
  - âœ… Dependencies mapped, no circular loops
  - âœ… Buffers added (20-30% on critical path)
  - âœ… All 7 modules represented in timeline
  - âœ… validation.readyForNextModule === true

optional_but_recommended:
  - âœ… Gantt visualization created
  - âœ… Critical path identified
  - âœ… Risk-specific buffers calculated
  - âœ… Industry benchmarks cited for timelines

coaching_quality:
  - âœ… CBC used â‰¥2 times (unrealistic â†’ realistic)
  - âœ… If overwhelm occurred: MI pattern used
  - âœ… User confident timeline is achievable
  - âœ… No unresolved blockers
```

### Handoff to Next Module

```yaml
# Data passed to gz-module-09-kpi

passed_context:
  - ninetyDayPlan.month1.milestones (basis for KPIs)
  - gzMilestones.phase1.selfSufficiencyProof.targetMonth (Month 6 validation)
  - threeYearRoadmap.year1.criticalMilestones (KPI targets)
  - financialTargets (revenue/customer count for KPI setting)

# Data passed to gz-zusammenfassung (Executive Summary)

passed_context:
  - ninetyDayPlan (first 90 days highlight)
  - gzMilestones.phase1.selfSufficiencyProof (critical for BA)
  - threeYearRoadmap.year1.criticalMilestones (growth trajectory)

# Data passed to gz-document-generator

passed_context:
  - ganttData.visualRepresentation (include in business plan)
  - ninetyDayPlan (detailed implementation section)
  - threeYearRoadmap (strategic growth section)
  - dependencies.criticalPathSequence (risk section context)

# Data stored in memory for cross-module validation

stored_in_memory:
  - gzMilestones.phase1.selfSufficiencyProof.targetMonth (â‰¤6 validation)
  - criticalPath.minimumDuration (feasibility check)
  - bufferAnalysis.totalBufferPercentage (risk management indicator)
```

---

## Research Integration Points

### Web Search Triggers

```typescript
// Automatically trigger research for:

1. Industry-Specific Timelines
   trigger: Any mention of [Branche] + timeline
   search: "[Branche] time to first customer Germany"
           "[Branche] typical startup timeline"
           "[Branche] GrÃ¼ndung Dauer"

2. Formal Requirement Timelines
   trigger: Gewerbeanmeldung, IHK, Finanzamt mentioned
   search: "Gewerbeanmeldung Dauer [Stadt]"
           "IHK Anmeldung Bearbeitungszeit"
           "Finanzamt Steuernummer wie lange"

3. Website Launch Timelines
   trigger: Website in plan
   search: "[Website type] Entwicklung Dauer"
           "Landing Page erstellen Zeitaufwand"
           "Wix Webflow Setup Zeit"

4. First Customer Benchmarks
   trigger: First customer milestone
   search: "[Branche] time to first customer statistics"
           "[Branche] Kundengewinnung Dauer"
           "B2B sales cycle length [industry]"

5. Self-Sufficiency Validation
   trigger: Break-even > Month 6
   search: "GrÃ¼ndungszuschuss SelbsttragfÃ¤higkeit Monat 6"
           "TragfÃ¤higkeitsbescheinigung Anforderungen Zeitpunkt"

6. Marketing Channel Setup Times
   trigger: Marketing channels in plan
   search: "LinkedIn Unternehmensseite aufbauen Zeit"
           "Google My Business Einrichtung Dauer"
           "Website SEO ranking Zeit"
```

### Research Results Integration

```typescript
// How to use research results in milestone planning

interface ResearchResult {
  source: string;
  data: string;
  credibility: 'high' | 'medium' | 'low';
}

function integrateResearch(result: ResearchResult, userTimeline: Timeline): Timeline {
  // Compare user's estimate with benchmark
  const gap = userTimeline.estimate - result.benchmark;

  if (gap < -30%) {
    // User is too optimistic
    return triggerCBC({
      issue: 'unrealistic_timeline',
      evidence: result,
      userEstimate: userTimeline.estimate,
      benchmark: result.benchmark,
      recommendation: result.benchmark * 1.2 // Add 20% buffer
    });
  }

  // Within reasonable range - accept
  return userTimeline;
}

// Example:
// User: "Website in 1 week"
// Research: "Landing Page Wix: 2-3 weeks average"
// CBC: Challenge with evidence â†’ Reframe to 3 weeks + 1 week buffer = 4 weeks
```

---

## Coaching Effectiveness Metrics

Track per conversation:

```typescript
interface CoachingMetrics {
  // CBC Effectiveness
  unrealistic_timelines_adjusted: number; // Target: â‰¥3
  buffers_added: number; // Target: â‰¥5 on critical path
  dependencies_clarified: number; // Target: â‰¥3
  research_citations: number; // Benchmarks used

  // MI Effectiveness (if triggered)
  overwhelm_episodes: number;
  overwhelm_resolved: boolean;
  user_prioritized_autonomously: boolean;

  // Module Integration
  modules_integrated: number; // Target: 7
  cross_module_conflicts: number; // Target: 0
  self_sufficiency_month: number; // Target: â‰¤6

  // Timeline Quality
  total_milestones: number; // Target: 30-50
  milestones_per_category: {
    formal: number;
    marketing: number;
    sales: number;
    finance: number;
    operations: number;
  };
  buffer_percentage: number; // Target: 20-30%
  critical_path_weeks: number;

  // User Experience
  iterations_needed: number; // How many timeline adjustments
  user_confidence: 'high' | 'medium' | 'low';
  feasibility_rating: number; // 1-10, target: â‰¥8

  // BA Compliance
  gz_milestones_complete: boolean;
  self_sufficiency_valid: boolean; // â‰¤Month 6
  formal_requirements_included: boolean;
  timeline_realistic: boolean; // vs. benchmarks

  // Module Completion
  time_to_complete: number; // Target: 75 minutes
  blockers_at_end: number; // Target: 0
  ready_for_kpi_module: boolean;
}
```

---

## Testing Strategy

### Unit Tests

```typescript
describe('Meilensteine Module', () => {
  test('Self-sufficiency validation blocks if >Month 6', () => {
    const financialData = { selfSufficiencyMonth: 8 };
    const validation = validateSelfSufficiency(financialData);
    expect(validation.valid).toBe(false);
    expect(validation.blocker).toBe('self_sufficiency_too_late');
  });

  test('Circular dependency detection', () => {
    const dependencies = {
      taskA: ['taskB'],
      taskB: ['taskC'],
      taskC: ['taskA'],
    };
    const check = detectCircularDeps(dependencies);
    expect(check.hasCircular).toBe(true);
    expect(check.cycle).toEqual(['taskA', 'taskB', 'taskC', 'taskA']);
  });

  test('Weekly hours validation', () => {
    const weekPlan = { estimatedHours: 50 };
    const constraints = { timeAvailableWeekly: 30 };
    const validation = validateWeeklyHours(weekPlan, constraints);
    expect(validation.feasible).toBe(false);
  });

  test('Buffer calculation', () => {
    const criticalPath = [
      { task: 'A', duration: 2 },
      { task: 'B', duration: 3 },
    ];
    const withBuffer = addBuffers(criticalPath, 0.25);
    expect(withBuffer.totalDuration).toBe(6.25); // 5 * 1.25
  });

  test('CBC triggers on first customer Week 1', () => {
    const input = 'Erster Kunde in Woche 1';
    const response = processInput(input, context);
    expect(response.coaching_pattern).toBe('CBC-unrealistic-timeline');
    expect(response.text).toContain('kritischer Pfad');
  });
});
```

### Integration Tests

```typescript
describe('Meilensteine Integration', () => {
  test('All module actions integrated', () => {
    const allModules = [
      'gz-unternehmen',
      'gz-marketing',
      'gz-finanzplanung',
      'gz-swot',
    ];
    const timeline = buildTimeline(mockModuleOutputs);

    allModules.forEach((module) => {
      expect(timeline.actionsFrom[module]).toBeGreaterThan(0);
    });
  });

  test('GZ milestones properly integrated', () => {
    const timeline = buildTimeline(mockData);
    expect(
      timeline.gzMilestones.phase1.selfSufficiencyProof.targetMonth
    ).toBeLessThanOrEqual(6);
    expect(timeline.gzMilestones.phase2.applicationMonth).toBe(6);
  });

  test('Financial targets match timeline', () => {
    const financial = { breakEvenMonth: 7 };
    const timeline = buildTimeline({ financial });
    const breakEvenMilestone = timeline.findMilestone('break-even');
    expect(breakEvenMilestone.month).toBe(7);
  });
});
```

### E2E Test Scenarios

```typescript
describe('Meilensteine E2E', () => {
  test('Complete happy path: IT consultant', async () => {
    const persona = createTestPersona('IT-consultant');
    const result = await runModuleConversation(persona);

    expect(result.completed).toBe(true);
    expect(result.ninetyDayPlan).toBeDefined();
    expect(result.threeYearRoadmap).toBeDefined();
    expect(
      result.gzMilestones.phase1.selfSufficiencyProof.targetMonth
    ).toBeLessThanOrEqual(6);
    expect(result.validation.readyForNextModule).toBe(true);
  });

  test('CBC pattern: unrealistic timeline â†’ adjusted', async () => {
    const persona = createTestPersona('over-optimistic-founder');
    const result = await runModuleConversation(persona);

    expect(result.metadata.coachingPatternsUsed).toContain('CBC');
    expect(result.bufferAnalysis.totalBufferPercentage).toBeGreaterThanOrEqual(
      20
    );
    expect(result.metadata.unrealistic_timelines_adjusted).toBeGreaterThan(0);
  });

  test('MI pattern: overwhelm â†’ managed', async () => {
    const persona = createTestPersona('overwhelmed-founder');
    const result = await runModuleConversation(persona);

    expect(result.metadata.coachingPatternsUsed).toContain('MI');
    expect(result.metadata.overwhelm_resolved).toBe(true);
    expect(result.validation.readyForNextModule).toBe(true);
  });

  test('Blocker: self-sufficiency Month 8', async () => {
    const persona = createTestPersona('slow-break-even-business');
    const result = await runModuleConversation(persona);

    // Should detect problem and navigate back to finance module
    expect(result.validation.selfSufficiencyMonthSix).toBe(false);
    expect(result.validation.blockers).toContain('self_sufficiency_too_late');
    expect(result.nextStep).toBe('revisit_finance_module');
  });

  test('Time constraint validation', async () => {
    const persona = createTestPersona('part-time-founder');
    persona.constraints.timeAvailableWeekly = 20;
    const result = await runModuleConversation(persona);

    // Should adjust timeline or suggest delegation
    const maxWeekHours = Math.max(
      ...result.ninetyDayPlan.month1.weeks.map((w) => w.totalHours)
    );
    expect(maxWeekHours).toBeLessThanOrEqual(20);
  });
});
```

---

## Common Coaching Scenarios

### Scenario 1: User Wants to Start Everything Simultaneously

```typescript
user: "Ich mache in Woche 1:
       - Gewerbeanmeldung
       - Website fertig
       - Social Media aufbauen
       - Erste Kunden kontaktieren
       - Flyer drucken"

// CBC Response
ai: "Das sind 5 groÃŸe Projekte parallel.
     Lass uns AbhÃ¤ngigkeiten checken:

     Website fertig:
     - Braucht: Branding, Texte, Fotos
     - Zeit: 2-4 Wochen

     Erste Kunden kontaktieren:
     - Braucht: Website live (fÃ¼r Credibility)
     - Braucht: GeschÃ¤ftskonto (fÃ¼r Rechnungen)

     Diese Tasks KÃ–NNEN nicht parallel laufen.
     Manche mÃ¼ssen VORHER fertig sein.

     Lass uns die Reihenfolge logisch aufbauen..."

// Build dependency tree with user
```

### Scenario 2: User Underestimates Bureaucracy

```typescript
user: "Gewerbeanmeldung - das geht online, 10 Minuten."

// Research + CBC
ai: "[Searching: 'Gewerbeanmeldung Dauer [Stadt] Online']

     Recherche-Ergebnis:

     - Online-Formular: 15-30 Min âœ“
     - Bearbeitung durch Amt: 3-7 Werktage
     - BestÃ¤tigung per Post: +2-3 Tage
     - IHK-Anmeldung (automatisch): +1 Woche
     - Finanzamt-Fragebogen: Kommt nach 2-4 Wochen

     Gesamt: 2-3 Wochen bis alles durch ist.

     10 Minuten ist NUR das Formular.
     Aber du kannst nicht rechnen ausstellen ohne BestÃ¤tigung.

     Lass uns 2 Wochen einplanen fÃ¼r den ganzen Prozess."
```

### Scenario 3: User Has Existing Side Business

```typescript
user: "Ich habe schon nebenbei Kunden, seit 2 Jahren.
       Ich brauche keinen Marketing-Plan, lÃ¤uft schon."

// Validate assumption
ai: "Super dass du schon Kunden hast!

     Frage: Diese Kunden -
     reichen sie fÃ¼r SelbsttragfÃ¤higkeit in Monat 6?

     [Calculate with user]

     Aktuell: â‚¬X/Monat (Nebenbei)
     Ziel: â‚¬Y/Monat (Vollzeit, ab M6)

     LÃ¼cke: â‚¬Z/Monat

     Bedeutet: Du brauchst doch [N] neue Kunden.

     WIE gewinnst du diese [N] Kunden?
     Das ist dein Marketing-Plan."

// Build focused plan for growth, not from zero
```

---

## Final Output Format

### Meilensteine Summary for Business Plan

```markdown
# 8. MEILENSTEINE-PLAN

## 8.1 90-Tage-Detailplan

[Week-by-week table from ninetyDayPlan]

**Kritischer Pfad:** [Duration] Wochen
**Puffer:** [Percentage]% eingeplant

## 8.2 3-Jahres-Roadmap

[Quarterly milestone table from threeYearRoadmap]

**SelbsttragfÃ¤higkeit:** Monat [X] âš ï¸
**Break-Even:** Monat [Y]

## 8.3 GrÃ¼ndungszuschuss-Meilensteine

**Phase 1 (Monat 1-6):**

- [List key GZ milestones]
- SelbsttragfÃ¤higkeit: Monat [X] âœ“

**Phase 2 (Monat 7-15):**

- [List Phase 2 milestones]

## 8.4 AbhÃ¤ngigkeiten

[Dependency diagram or list]

## 8.5 Gantt-Visualisierung

[ASCII Gantt chart from ganttData]
```

---

**END OF gz-module-08-meilensteine STREAMLINED**

**Next Module:** gz-module-09-kpi (Key Performance Indicators)
