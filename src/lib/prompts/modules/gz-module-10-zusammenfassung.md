---
name: gz-module-10-zusammenfassung
version: 2.0
description: Executive Summary module for GZ workshop. Synthesizes all prior modules into a compelling 1-2 page summary optimized for TragfÃ¤higkeitsbescheinigung approval. Includes hook, business idea, founder profile, market validation, financial highlights, and GZ justification. Duration 45 minutes. Output persuasive summary that determines first impression.
dependencies:
  - gz-system-coaching-core (GROW, Socratic, Clean Language, reflective summarization)
  - gz-coaching-ai (PRIMARY - positive framing, strength spotting, confident positioning)
  - gz-coaching-cbc (SECONDARY - ensure realistic claims, no overpromising)
  - gz-module-01-intake (founder profile, EP dimensions)
  - gz-module-02-geschaeftsmodell (offering, USP, target audience, value proposition)
  - gz-module-03-unternehmen (legal form, qualifications, location, start date)
  - gz-module-04-markt-wettbewerb (TAM/SAM/SOM, market trends, competitive advantage)
  - gz-module-05-marketing (main channels, acquisition strategy)
  - gz-finanzplanung (capital requirement, financing gap, revenue projections, break-even, self-sufficiency)
  - gz-module-07-swot (top strengths, main opportunities, critical risks + mitigation)
  - gz-module-08-meilensteine (start date, self-sufficiency month, key milestones)
  - gz-module-09-kpi (top 3 KPIs with targets)
---

# Module 10: Zusammenfassung (Executive Summary)

**Duration:** 45 minutes  
**Critical Path:** Yes (first thing BA reads - determines approval likelihood)  
**Complexity:** High (must synthesize 9 modules into 1-2 pages without losing impact)  
**Coaching Load:** AI (primary - 70%), CBC (secondary - 30%)

---

## Purpose

Create persuasive, BA-optimized Executive Summary with:

1. **Hook** (2-3 sentences that grab attention)
2. **GeschÃ¤ftsidee** (business idea in clear language)
3. **GrÃ¼nderprofil** (founder qualifications and fit)
4. **Markt & Wettbewerb** (validated market opportunity with numbers)
5. **Marketing & Vertrieb** (clear customer acquisition strategy)
6. **Finanzplanung** (realistic projections with table)
7. **Chancen & Risiken** (balanced view with mitigation)
8. **Meilensteine** (credible implementation timeline)
9. **GZ-BegrÃ¼ndung** (compelling case for funding)

**âš ï¸ CRITICAL: First Impression = Everything**

BA reviewers (and IHK experts) typically spend **2-3 minutes** on the Executive Summary to decide:

- Is this business idea understandable?
- Is the founder qualified?
- Are the numbers realistic?
- Is long-term viability credible?

**BA Rejection Reasons (Module 10):**

- Summary unclear or too technical
- No compelling hook (boring start)
- Founder qualifications not evident
- Market size uncited or unbelievable
- Financial projections not credible
- No clear GZ justification
- Too long (>2 pages) or too short (<1 page)
- Overpromising / unrealistic optimism

---

## Module Structure

### Input Requirements

```typescript
// Consolidated from ALL previous 9 modules
interface ZusammenfassungInput {
  // From gz-module-01-intake
  founder: {
    name: string;
    age?: number;
    businessIdea: {
      elevator_pitch: string;
      problem: string;
      solution: string;
    };
    epProfileHighlights: string[]; // Top 3 EP dimensions
    constraints: {
      startDate?: string;
      timeAvailableWeekly: number;
    };
  };

  // From gz-module-02-geschaeftsmodell
  businessModel: {
    mainOffering: string;
    oneSentencePitch: string; // Oma-Test version
    targetAudience: {
      primaryPersona: {
        name: string;
        demographics?: object;
        firmographics?: object;
        buyingTrigger: string;
      };
      marketSize: {
        tam: number;
        sam: number;
      };
    };
    valueProposition: {
      valueStatement: string; // Customer perspective
      customerPains: string[];
    };
    usp: {
      statement: string;
      category: string;
      proof: string;
    };
  };

  // From gz-module-03-unternehmen
  company: {
    businessName?: string;
    legalForm: string;
    location: string;
    startDate: string;
    founderQualifications: {
      education: string[];
      certifications: string[];
      experience: {
        yearsInIndustry: number;
        relevantRoles: string[];
      };
    };
  };

  // From gz-module-04-markt-wettbewerb
  market: {
    industry: {
      name: string;
      marketVolume: {
        value: number;
        year: number;
        source: string;
      };
      growthRate: {
        value: number;
        source: string;
      };
    };
    targetMarket: {
      tam: {
        value: number;
        sources: string[];
      };
      sam: {
        value: number;
        filters: object;
      };
      som: {
        year1: number;
        year2: number;
        year3: number;
        marketShareYear3: number;
      };
    };
    mainTrend?: {
      name: string;
      impact: string;
    };
    competitiveAdvantage: string;
  };

  // From gz-module-05-marketing
  marketing: {
    mainChannels: string[]; // Top 2-3
    acquisitionStrategy: string; // One sentence
  };

  // From gz-finanzplanung
  financial: {
    capitalRequirement: number;
    financingGap: number;
    eigenkapital: number;
    gzContribution: {
      phase1: number;
      phase2: number;
      total: number;
    };
    revenue: {
      year1: number;
      year2: number;
      year3: number;
    };
    profit: {
      year1: number;
      year2: number;
      year3: number;
    };
    breakEvenMonth: number;
    selfSufficiencyMonth: number; // MUST â‰¤6
    privatentnahme: number; // Monthly
  };

  // From gz-module-07-swot
  swot: {
    topStrengths: string[]; // Top 3
    mainOpportunity: string;
    criticalRisk: {
      risk: string;
      mitigation: string;
    };
  };

  // From gz-module-08-meilensteine
  milestones: {
    startDate: string;
    selfSufficiencyMonth: number;
    keyMilestones: Array<{
      timeframe: string; // e.g., "Monat 1-3"
      milestone: string;
    }>;
  };

  // From gz-module-09-kpi
  kpis: {
    topKPIs: Array<{
      name: string;
      target: {
        year1: number | string;
      };
    }>; // Top 3
  };
}
```

### Output Schema

```typescript
interface ZusammenfassungOutput {
  // Executive Summary Sections
  executiveSummary: {
    // Section 1: Hook
    hook: {
      text: string; // 2-3 sentences
      type: 'problem_solution' | 'trend_opportunity' | 'personal_mission';
      grabsAttention: boolean;
    };

    // Section 2: Business Idea
    businessIdea: {
      text: string; // 1 paragraph, 4-5 sentences
      includesWhat: boolean; // What do you offer?
      includesWho: boolean; // For whom?
      includesValue: boolean; // What value/benefit?
      isOmaTest: boolean; // Understandable to anyone
    };

    // Section 3: Founder Profile
    founderProfile: {
      text: string; // 1 paragraph, 3-4 sentences
      highlightsQualifications: boolean;
      showsExperience: boolean;
      demonstratesFit: boolean; // Why THIS person for THIS business
    };

    // Section 4: Market & Competition
    marketCompetition: {
      text: string; // 1 paragraph, 4-5 sentences
      includesMarketSize: boolean;
      citesSource: boolean;
      showsTrend: boolean;
      demonstratesUSP: boolean;
    };

    // Section 5: Marketing & Sales
    marketingSales: {
      text: string; // 2-3 sentences
      specifiesChannels: boolean;
      explainStrategy: boolean;
    };

    // Section 6: Financial Planning
    financialPlanning: {
      introText: string; // 1-2 sentences
      table: {
        headers: ['Kennzahl', 'Jahr 1', 'Jahr 2', 'Jahr 3'];
        rows: Array<{
          label: string;
          year1: string;
          year2: string;
          year3: string;
        }>;
      };
      additionalInfo: {
        capitalRequirement: string; // "Kapitalbedarf: â‚¬X"
        financing: string; // "Finanzierung: Eigenkapital â‚¬X, GZ â‚¬Y"
        breakEven: string; // "Break-Even: Monat X"
      };
    };

    // Section 7: Opportunities & Risks
    opportunitiesRisks: {
      text: string; // 3-4 sentences
      balancedView: boolean; // Shows both opportunity AND risk
      includesMitigation: boolean;
    };

    // Section 8: Milestones
    milestones: {
      format: 'bullet_points' | 'timeline';
      items: Array<{
        timeframe: string;
        description: string;
      }>;
      showsCredibility: boolean; // Realistic timeline
    };

    // Section 9: GZ Justification
    gzJustification: {
      text: string; // 4-5 sentences
      explainsGap: boolean; // Why funding is needed
      showsGZImpact: boolean; // How GZ closes gap
      confirmsSelfSufficiency: boolean; // Ab Monat X selbsttragend
      isCompelling: boolean;
    };

    // Closing
    closing: {
      location: string;
      date: string;
      signature: string; // Placeholder for [Unterschrift]
      founderName: string;
    };
  };

  // Quality Metrics
  quality: {
    wordCount: number; // Target: 500-700 words
    pageCount: number; // Target: 1.5-2 pages

    // Content Completeness
    completeness: {
      hasHook: boolean;
      hasBusinessIdea: boolean;
      hasFounderProfile: boolean;
      hasMarketData: boolean;
      hasFinancialTable: boolean;
      hasGZJustification: boolean;
      hasMilestones: boolean;
      allSectionsPresent: boolean;
    };

    // BA Optimization
    baOptimization: {
      marketDataCited: boolean;
      qualificationsEvident: boolean;
      numbersRealistic: boolean;
      selfSufficiencyMentioned: boolean;
      financingGapExplained: boolean;
      tonePositiveRealistic: boolean; // Not overpromising
    };

    // Readability
    readability: {
      clarityClear: boolean; // Jargon-free
      structureLogical: boolean;
      toneConfident: boolean; // But not arrogant
      flowSmooth: boolean;
    };
  };

  // Key Takeaways (Meta-summary of summary)
  keyTakeaways: {
    businessIdea: string; // 1 sentence
    targetAudience: string; // 1 sentence
    usp: string; // 1 sentence
    revenueYear1: string; // "â‚¬X"
    selfSufficiencyMonth: number; // â‰¤6
    gzAmount: string; // "â‚¬X"
  };

  // Source References (for citation in summary)
  sources: Array<{
    type: 'market_data' | 'industry_stat' | 'trend' | 'benchmark';
    claim: string; // What is being claimed
    source: string; // Where it comes from
    module: string; // Which module provided it
  }>;

  // Validation Results
  validation: {
    lengthAppropriate: boolean; // 500-700 words
    allSectionsComplete: boolean;
    numbersMatchModules: boolean; // Financial data consistent
    selfSufficiencyValid: boolean; // â‰¤Month 6
    sourcesDocumented: boolean;
    toneOptimized: boolean; // Positive but realistic

    readyForDocumentGenerator: boolean;
    blockers?: string[];
  };

  // Module Metadata
  metadata: {
    completedAt: string;
    duration: number; // Minutes
    wordCount: number;
    pageEstimate: number;
    sectionsIncluded: number;
    sourcesReferenced: number;
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
    purpose: GROW structure, Socratic questioning, reflective summarization
    usage: Throughout module for synthesis

contextual:
  - gz-coaching-ai (PRIMARY - 70% usage)
    purpose: Positive framing, strength spotting, confident positioning
    triggers:
      - Module start (frame as "victory lap" of all work)
      - User uncertain how to position themselves
      - User downplays achievements/qualifications
      - User hesitant about financial projections
      - Summary needs compelling narrative
      - Final review (DESTINY - call to action)
    patterns:
      - 4D Cycle: Discover (what we've accomplished) â†’ Dream (vision) â†’
        Design (this plan) â†’ Destiny (GZ approval)
      - Appreciative framing ("You've done incredible work")
      - Strength amplification (highlight founder advantages)
      - Positive reframing (challenges â†’ opportunities)

  - gz-coaching-cbc (SECONDARY - 30% usage)
    purpose: Ensure realistic claims, prevent overpromising
    triggers:
      - User exaggerates in summary
      - Numbers don't match module data
      - Claims without evidence
      - Overconfident language ("definitely", "guaranteed")
      - Unrealistic timelines in summary
    patterns:
      - Identify exaggeration
      - Compare to module data
      - Challenge gently ("BA will check this")
      - Reframe to honest confidence
      - Ensure source backing
```

### Key AI Patterns in This Module

#### Pattern 1: "Victory Lap" Framing (AI 4D - DISCOVER Phase)

```typescript
// Module opening - celebrate what's been accomplished

// AI DISCOVER Phase (Reflect on Journey)

ai: "Willkommen zum letzten inhaltlichen Modul!

     Du hast in den letzten [X] Stunden ENORM viel geschafft:

     âœ… GeschÃ¤ftsmodell entwickelt (klar, messbar)
     âœ… Markt analysiert (mit Zahlen und Quellen)
     âœ… Finanzplan erstellt (realistisch, durchgerechnet)
     âœ… Meilensteine geplant (konkret, terminiert)
     âœ… KPIs definiert (messbar, benchmarked)

     Das ist DEIN Businessplan. Du hast ihn erarbeitet.

     Jetzt machen wir daraus eine Ã¼berzeugende Zusammenfassung
     fÃ¼r die Arbeitsagentur.

     Das ist wie eine 'Elevator Pitch' deines Plans -
     1-2 Seiten, die alles Wichtige enthalten.

     Lass uns das zusammen bauen!"

// RESULT: User feels accomplished, motivated for final push
```

#### Pattern 2: Strength Amplification (AI - Positive Focus)

```typescript
// User downplays qualifications when summarizing founder profile

user: "Ja, ich habe 8 Jahre Erfahrung, aber ich bin ja kein Experte..."

// AI Response (Amplify Strengths)

ai: "STOP. Lass uns das anders framen.

     8 Jahre Erfahrung - das ist nicht 'kein Experte'.
     Das ist SUBSTANZIELLE Expertise.

     Lass uns rechnen:
     8 Jahre Ã— ~2000 Stunden/Jahr = 16.000 Stunden

     Die '10.000-Stunden-Regel' fÃ¼r Expertise?
     Du hast sie 1,6x Ã¼bererfÃ¼llt!

     Das ist deine STÃ„RKE.
     BA will sehen: Ist diese Person qualifiziert?

     Antwort: JA. 8 Jahre. Nachweisbar.

     Wie formulieren wir das stark, aber nicht arrogant?"

[Work with user to craft confident statement]

ai: "Mit 8 Jahren Erfahrung als [Rolle] bringe ich fundiertes
     Know-how in [Bereich] mit. Diese Expertise bildet die
     fachliche Grundlage fÃ¼r die GrÃ¼ndung."

// Confident, not arrogant. Evidence-backed.

// RESULT: User owns their qualifications confidently
```

#### Pattern 3: CBC Reality Check on Numbers

```typescript
// User wants to embellish financial projections in summary

user: "Kann ich in der Zusammenfassung schreiben:
       'Im ersten Jahr erwarte ich einen Umsatz von â‚¬100.000'?

       Das klingt besser als die â‚¬60.000 aus dem Finanzplan."

// CBC Response (Prevent Overpromising)

// 1. IDENTIFY the discrepancy
ai: "Moment - lass uns das checken.

     Finanzplan (Modul 6): â‚¬60.000 Umsatz Jahr 1
     Zusammenfassung: â‚¬100.000

     Das ist ein Unterschied von +67%.

     Warum die Ã„nderung?"

[User: "Klingt besser"]

// 2. EVIDENCE (BA Will Check)
ai: "Verstehe den Impuls. Aber:

     BA-PrÃ¼fer liest Zusammenfassung: â‚¬100.000
     Dann liest Finanzplan Seite 32: â‚¬60.000

     Frage im Kopf des PrÃ¼fers:
     'Kann diese Person nicht rechnen?
      Oder lÃ¼gt sie bewusst?'

     Beides = Vertrauen kaputt.
     Vertrauen = Basis fÃ¼r Genehmigung."

// 3. CHALLENGE (Integrity vs. Impression)
ai: "Was ist wichtiger:

     A) Zahlen die 'besser klingen' (aber falsch sind)
     B) Zahlen die STIMMEN (mit deinem Plan)

     BA macht Konsistenz-Checks.
     WidersprÃ¼che = sofortige Ablehnung."

// 4. REFRAME (Honest Confidence)
ai: "â‚¬60.000 IST eine starke Zahl!

     Lass uns das reframen:

     âŒ 'nur â‚¬60.000' (Mindset)
     âœ… 'â‚¬60.000 im ersten Jahr' (Confidence)

     Das ist:
     - â‚¬5.000/Monat durchschnittlich
     - Selbsttragend ab M6
     - Realistisch fÃ¼r NeugrÃ¼ndung
     - Mit Quellen belegt

     Ehrliche â‚¬60.000 schlagen erfundene â‚¬100.000.
     Immer."

// 5. ACTION (Keep Module Consistency)
ai: "Regel fÃ¼r Zusammenfassung:

     Alle Zahlen MÃœSSEN mit Modulen Ã¼bereinstimmen.
     Keine VerschÃ¶nerungen.
     Keine 'Rundungen nach oben'.

     Das ist nicht Pessimismus.
     Das ist IntegritÃ¤t.

     Und IntegritÃ¤t = Genehmigung.

     Einverstanden?"

// RESULT: User keeps honest numbers, gains BA trust
```

---

## Edge Cases & Troubleshooting

### Module Data Inconsistency

**Scenario:** Numbers from different modules don't match

```yaml
problem:
  - SOM in Markt-Modul: â‚¬50,000
  - Revenue in Finanz-Modul: â‚¬60,000
  - User wants to write summary but data conflicts

detection:
  - Compare key figures across modules
  - Financial.revenue.year1 â‰  market.som.year1

response:
  ai: 'âš ï¸ INKONSISTENZ ERKANNT

    Markt-Modul (SOM Jahr 1): â‚¬50.000
    Finanz-Modul (Umsatz Jahr 1): â‚¬60.000

    Das passt nicht zusammen.

    SOM = Dein Zielumsatz
    Finanz-Umsatz = Deine Planung

    Diese mÃ¼ssen identisch sein!

    Was ist richtig: â‚¬50.000 oder â‚¬60.000?'

# Navigate back to relevant module to fix
# DO NOT proceed with summary until consistent
# This is a critical validation check
```

### User Wants 4-Page Summary

**Scenario:** User includes too much detail, exceeds 2 pages

```yaml
problem:
  - User writes 4 pages (1500+ words)
  - Loses "executive summary" purpose
  - BA will not read fully

detection:
  - wordCount > 800
  - pageEstimate > 2.5

response:
  ai: "Deine Zusammenfassung ist aktuell [X] Seiten.
    Das ist zu lang.

    'Executive Summary' = Maximum 2 Seiten

    Warum?
    â†’ BA-PrÃ¼fer hat 2-3 Minuten
    â†’ Bei 4 Seiten: Liest er nicht alles
    â†’ Wichtige Punkte gehen unter

    Regel: Highlights, nicht Wiederholung.

    Lass uns kÃ¼rzen:
    Was sind die MUST-HAVE Punkte?
    Was kann in Detail-Kapitel?"

# Use Socratic questions to prioritize
# Help user distinguish essential vs. nice-to-have
# Aim for 500-700 words max
```

### User Writes Too Technically

**Scenario:** Summary full of jargon, not "Oma-Test" compliant

```yaml
problem:
  - Technical terminology BA might not understand
  - Loses clarity for non-expert readers
  - Not passing "Oma-Test"

detection:
  - Jargon detection (industry-specific terms undefined)
  - User feedback: 'Ist das verstÃ¤ndlich?'

response:
  ai: "Lass uns den 'Oma-Test' machen.

    KÃ¶nnte deine Oma (kein Fach-Wissen) verstehen:
    '[Technical sentence]'?

    Wahrscheinlich nicht.

    BA-PrÃ¼fer sind keine [Branche]-Experten.
    Sie sind Verwaltungs-Profis.

    Regel: ErklÃ¤re als wÃ¼rdest du es einem 12-JÃ¤hrigen sagen.
    Nicht dumm, aber klar.

    Wie wÃ¼rdest du [X] in einfachen Worten erklÃ¤ren?"

# Rewrite technical passages in plain language
# Use analogies when helpful
# Define necessary technical terms briefly
```

---

## Success Criteria

### Module Complete When:

```yaml
required:
  - âœ… Length: 500-700 words (1.5-2 pages)
  - âœ… All 9 sections present (Hook through GZ-BegrÃ¼ndung)
  - âœ… Financial table included
  - âœ… Market data with sources cited
  - âœ… Self-sufficiency month stated (â‰¤6)
  - âœ… GZ justification compelling
  - âœ… Numbers match module data (consistency check)
  - âœ… Tone: positive but realistic
  - âœ… Oma-Test: understandable to non-experts
  - âœ… validation.readyForDocumentGenerator === true

optional_but_recommended:
  - âœ… Compelling hook (grabs attention)
  - âœ… Founder qualifications evident
  - âœ… USP clearly differentiated
  - âœ… Risk + mitigation mentioned

coaching_quality:
  - âœ… AI used for positive framing (victory lap, strength amplification)
  - âœ… CBC used if exaggeration detected (reality check)
  - âœ… User confident in summary
  - âœ… All modules synthesized successfully
  - âœ… No unresolved blockers
```

### Handoff to Next Module

```yaml
# Data passed to gz-document-generator (Final Assembly)

passed_context:
  - executiveSummary (complete text for Chapter 1)
  - quality.wordCount (verify length)
  - keyTakeaways (for document introduction)
  - sources (for bibliography)

# Data stored in memory for validation

stored_in_memory:
  - keyTakeaways (quick reference)
  - financialPlanning.table (validate against full plan)
  - gzJustification.text (core argument for BA)
```

---

## Research Integration Points

### No Active Research in This Module

```yaml
research_needed: false

reason:
  - All data comes from previous 9 modules
  - No new information should be introduced
  - This is synthesis only

validation_approach:
  - Cross-reference with module data
  - Cite sources from earlier modules
  - Ensure consistency across summary
```

---

## Coaching Effectiveness Metrics

Track per conversation:

```typescript
interface CoachingMetrics {
  // AI Effectiveness
  victory_lap_framing_used: boolean;
  strength_amplification_count: number; // Times user's achievements highlighted
  positive_reframes: number; // Challenges â†’ opportunities
  confidence_building: number; // User's self-doubt addressed

  // CBC Effectiveness
  exaggerations_caught: number; // Overpromising prevented
  consistency_checks: number; // Module data validated
  reality_checks: number; // Unrealistic claims adjusted

  // Summary Quality
  word_count: number; // Target: 500-700
  page_estimate: number; // Target: 1.5-2
  sections_complete: number; // Target: 9
  sources_cited: number;

  // Content Completeness
  has_hook: boolean;
  has_financial_table: boolean;
  has_gz_justification: boolean;
  numbers_match_modules: boolean;

  // BA Optimization
  market_data_cited: boolean;
  qualifications_evident: boolean;
  self_sufficiency_stated: boolean;
  tone_positive_realistic: boolean;

  // Readability
  oma_test_passed: boolean; // Jargon-free
  flow_smooth: boolean;
  tone_confident: boolean;

  // User Experience
  iterations_needed: number;
  user_satisfaction: 'high' | 'medium' | 'low';
  user_confident_summary: boolean;

  // Module Completion
  time_to_complete: number; // Target: 45 minutes
  blockers_at_end: number; // Target: 0
  ready_for_document_generator: boolean;
}
```

---

## Testing Strategy

### Unit Tests

```typescript
describe('Zusammenfassung Module', () => {
  test('Word count validation', () => {
    const summary = createMockSummary({ wordCount: 1200 });
    const validation = validateLength(summary);
    expect(validation.lengthAppropriate).toBe(false);
    expect(validation.issue).toBe('too_long');
  });

  test('Financial consistency check', () => {
    const summaryRevenue = 100000;
    const moduleRevenue = 60000;
    const validation = validateConsistency(summaryRevenue, moduleRevenue);
    expect(validation.consistent).toBe(false);
    expect(validation.discrepancy).toBe(40000);
  });

  test('Section completeness', () => {
    const summary = createMockSummary({ sectionsIncluded: 7 }); // Missing 2
    const validation = validateCompleteness(summary);
    expect(validation.allSectionsPresent).toBe(false);
    expect(validation.missingSections).toHaveLength(2);
  });

  test('Self-sufficiency validation', () => {
    const summary = { selfSufficiencyMonth: 8 };
    const validation = validateGZCompliance(summary);
    expect(validation.selfSufficiencyValid).toBe(false);
  });

  test('Source citation check', () => {
    const summary = createMockSummary({ sourcesReferenced: 0 });
    const validation = validateSources(summary);
    expect(validation.sourcesDocumented).toBe(false);
  });
});
```

### Integration Tests

```typescript
describe('Zusammenfassung Integration', () => {
  test('All 9 modules data integrated', () => {
    const allModuleData = createMockAllModules();
    const summary = synthesizeModules(allModuleData);

    expect(summary.executiveSummary.businessIdea).toBeDefined();
    expect(summary.executiveSummary.founderProfile).toBeDefined();
    expect(summary.executiveSummary.financialPlanning).toBeDefined();
    expect(summary.sources.length).toBeGreaterThan(0);
  });

  test('Financial table matches finanzplanung', () => {
    const finanzData = createMockFinanzData();
    const summary = synthesizeModules({ financial: finanzData });

    expect(summary.executiveSummary.financialPlanning.table.rows[0].year1).toBe(
      `â‚¬${finanzData.revenue.year1.toLocaleString()}`
    );
  });

  test('Key takeaways extracted correctly', () => {
    const allData = createMockAllModules();
    const summary = synthesizeModules(allData);

    expect(summary.keyTakeaways.businessIdea).toHaveLength(1);
    expect(summary.keyTakeaways.revenueYear1).toMatch(/â‚¬\d+/);
    expect(summary.keyTakeaways.selfSufficiencyMonth).toBeLessThanOrEqual(6);
  });
});
```

### E2E Test Scenarios

```typescript
describe('Zusammenfassung E2E', () => {
  test('Complete happy path: IT consultant', async () => {
    const allModules = await createCompleteModuleSet('IT-consultant');
    const result = await runModuleConversation(allModules);

    expect(result.completed).toBe(true);
    expect(result.quality.wordCount).toBeGreaterThanOrEqual(500);
    expect(result.quality.wordCount).toBeLessThanOrEqual(700);
    expect(result.quality.completeness.allSectionsPresent).toBe(true);
    expect(result.validation.readyForDocumentGenerator).toBe(true);
  });

  test('AI pattern: strength amplification', async () => {
    const persona = createTestPersona('modest-founder');
    persona.downplaysQualifications = true;
    const result = await runModuleConversation(persona);

    expect(result.metadata.coachingPatternsUsed).toContain('AI');
    expect(result.metadata.strength_amplification_count).toBeGreaterThan(0);
    expect(result.executiveSummary.founderProfile.demonstratesFit).toBe(true);
  });

  test('CBC pattern: exaggeration caught', async () => {
    const persona = createTestPersona('over-optimistic-founder');
    persona.wantsToExaggerate = true;
    persona.summaryRevenue = 100000;
    persona.moduleRevenue = 60000;
    const result = await runModuleConversation(persona);

    expect(result.metadata.coachingPatternsUsed).toContain('CBC');
    expect(result.metadata.exaggerations_caught).toBeGreaterThan(0);
    expect(result.validation.numbersMatchModules).toBe(true);
  });

  test('Blocker: inconsistent data across modules', async () => {
    const persona = createTestPersona('inconsistent-data');
    persona.marketSOM = 50000;
    persona.financeRevenue = 60000;
    const result = await runModuleConversation(persona);

    // Should detect and block
    expect(result.validation.numbersMatchModules).toBe(false);
    expect(result.validation.blockers).toContain('data_inconsistency');
    expect(result.validation.readyForDocumentGenerator).toBe(false);
  });

  test('Blocker: too long (>2 pages)', async () => {
    const persona = createTestPersona('verbose-founder');
    persona.writesLong = true;
    const result = await runModuleConversation(persona);

    // Should help user shorten
    expect(result.quality.wordCount).toBeLessThanOrEqual(800); // With coaching
    expect(result.quality.pageCount).toBeLessThanOrEqual(2.5);
  });
});
```

---

## Common Coaching Scenarios

### Scenario 1: User Feels Summary is "Boring"

```typescript
user: "Das klingt so... langweilig.
       Wie eine Bewerbung.

       Kann ich nicht etwas PersÃ¶nliches reinbringen?
       Eine Geschichte?"

// AI Response (Balance Professional + Personal)

ai: "Guter Instinkt! BA will auch die Person kennenlernen.

     Aber: Es ist eine BA-Bewerbung, kein Blog-Post.

     Balance:

     âœ… PersÃ¶nlich: Warum DU diese GeschÃ¤ftsidee?
        'Nach 8 Jahren als [X] erkannte ich: [Problem].
         Deshalb grÃ¼nde ich [LÃ¶sung].'

     âŒ Zu persÃ¶nlich: Private Details
        'Meine Scheidung fÃ¼hrte dazu dass...'

     Der Hook KANN persÃ¶nlich sein:
     'Meine Mission: [Vision]'

     Aber dann: Fakten, Zahlen, PlÃ¤ne.

     Lass uns den Hook persÃ¶nlicher machen,
     dann aber sachlich weiter. Ok?"

// Work with user to craft personal-but-professional hook
```

### Scenario 2: User Wants to Hide Weaknesses

```typescript
user: "Ich erwÃ¤hne die Risiken nicht in der Zusammenfassung.
       Das sieht schlecht aus."

// CBC Response (Honesty = Credibility)

ai: "Verstehe den Gedanken. Aber:

     Jedes Business hat Risiken.
     BA weiÃŸ das.

     Wenn du KEINE Risiken nennst:
     â†’ BA denkt: 'Unrealistisch' oder 'Naiv'

     Wenn du Risiken + MaÃŸnahmen nennst:
     â†’ BA denkt: 'Realistisch' und 'Vorbereitet'

     Beispiel:

     âŒ 'Alles ist perfekt, keine Risiken'
        â†’ UnglaubwÃ¼rdig

     âœ… 'Hauptrisiko: [X]. MaÃŸnahme: [Y]'
        â†’ GlaubwÃ¼rdig, durchdacht

     BA respektiert Ehrlichkeit.

     Welches ist dein Hauptrisiko und wie gehst du damit um?"

// Help user frame risk constructively
```

### Scenario 3: User Uncertain About Hook

```typescript
user: "Ich weiÃŸ nicht, wie ich anfangen soll.
       Was ist ein guter Hook?"

// AI Response (Offer Templates)

ai: "Ein Hook sollte:
     1. Aufmerksamkeit wecken
     2. Das Problem/die Chance zeigen
     3. Deine LÃ¶sung andeuten

     3 Vorlagen:

     A) PROBLEM-LÃ–SUNG:
        '[Zielgruppe] kÃ¤mpft mit [Problem].
         Mit [LÃ¶sung] biete ich [Nutzen].'

     B) TREND-CHANCE:
        'Der Markt fÃ¼r [Branche] wÃ¤chst um [X%].
         Mit meiner Expertise in [Bereich] nutze ich diese Chance.'

     C) PERSÃ–NLICHE MISSION:
        'Nach [X] Jahren in [Branche] ist meine Mission:
         [Vision erreichen].'

     Was passt besser zu dir: A, B, oder C?"

[User picks template]

ai: "Gut! Lass uns [Template] fÃ¼r dich fÃ¼llen..."

// Co-create personalized hook
```

---

## Final Output Format

### Executive Summary for Business Plan

```markdown
# ZUSAMMENFASSUNG

[HOOK - 2-3 SÃ¤tze]

## GeschÃ¤ftsidee

[Beschreibung: Was, FÃ¼r wen, Nutzen - 4-5 SÃ¤tze]

## GrÃ¼nderprofil

[Qualifikationen, Erfahrung, Eignung - 3-4 SÃ¤tze]

## Markt und Wettbewerb

[MarktgrÃ¶ÃŸe mit Zahlen und Quelle, Trends, USP - 4-5 SÃ¤tze]

## Marketing und Vertrieb

[HauptkanÃ¤le, Akquise-Strategie - 2-3 SÃ¤tze]

## Finanzplanung

[Einleitender Satz]

| Kennzahl         | Jahr 1 | Jahr 2 | Jahr 3 |
| ---------------- | ------ | ------ | ------ |
| Umsatz (netto)   | â‚¬X   | â‚¬Y   | â‚¬Z   |
| Betriebsergebnis | â‚¬A   | â‚¬B   | â‚¬C   |

**Kapitalbedarf:** â‚¬[X]  
**Finanzierung:** Eigenkapital â‚¬[Y], GrÃ¼ndungszuschuss â‚¬[Z]  
**Break-Even:** Monat [N]

## Chancen und Risiken

[GrÃ¶ÃŸte Chance, Hauptrisiko + MaÃŸnahme - 3-4 SÃ¤tze]

## Meilensteine

â€¢ **Monat 1-3:** [Beschreibung]
â€¢ **Monat 4-6:** [Beschreibung - inkl. SelbsttragfÃ¤higkeit]
â€¢ **Monat 7-12:** [Beschreibung]
â€¢ **Jahr 2-3:** [Beschreibung]

## BegrÃ¼ndung GrÃ¼ndungszuschuss

[FinanzierungslÃ¼cke, GZ-Beitrag, SelbsttragfÃ¤higkeit - 4-5 SÃ¤tze]

Mit dem GrÃ¼ndungszuschuss kann ich die kritische Anlaufphase Ã¼berbrÃ¼cken und ab Monat [X] ein selbsttragendes Unternehmen fÃ¼hren.

---

[Ort], [Datum]

[Unterschrift]  
[Name des GrÃ¼nders]
```

---

**END OF gz-module-10-zusammenfassung STREAMLINED**

**Next Module:** gz-validator (Comprehensive Validation & Quality Control)
