---
name: gz-module-01-intake
version: 2.0
description: Initial assessment module for GZ workshop. Conducts founder profiling, business idea validation, entrepreneurial personality assessment, and business type classification. Duration 45 minutes. Output structured data for downstream modules.
dependencies:
  - gz-system-coaching (GROW model, questioning patterns)
  - gz-system-constraints (BA requirements)
---

# Module 01: Intake & Founder Assessment

**Duration:** 45 minutes  
**Critical Path:** Yes (blocks all other modules)  
**Complexity:** Medium

---

## Purpose

Collect foundational information about founder and business to:

1. **Validate readiness** for GZ application
2. **Classify business type** to determine module relevance
3. **Assess founder strengths/gaps** using Howard's Entrepreneurial Personality framework
4. **Establish rapport** and demonstrate value ("Wow moment")

---

## Module Structure

### Input Requirements

**None** (first module, no dependencies)

### Output Schema

```typescript
interface IntakeOutput {
  // Founder Profile
  founder: {
    name: string; // Used only in UI, NEVER sent to Claude (DSGVO)
    currentStatus: 'employed' | 'unemployed' | 'other';
    algStatus?: {
      monthlyAmount: number; // â‚¬1,200-3,000 typical range
      daysRemaining: number; // Must be â‰¥150 for GZ eligibility
    };
    experience: {
      yearsInIndustry: number;
      relevantRoles: string[];
      previousFounder: boolean;
      previousFoundingExperience?: string;
    };
    qualifications: {
      education: string;
      certifications: string[];
      specialSkills: string[];
    };
    motivation: {
      push: string[]; // e.g., "Arbeitslosigkeit", "Unzufriedenheit"
      pull: string[]; // e.g., "UnabhÃ¤ngigkeit", "Idee verwirklichen"
    };
  };

  // Business Idea
  businessIdea: {
    elevator_pitch: string; // 2-3 sentences
    problem: string;
    solution: string;
    targetAudience: string;
    uniqueValue: string; // Why this founder, why now
  };

  // Entrepreneurial Personality (Howard 7 dimensions)
  personality: {
    innovativeness: 'high' | 'medium' | 'low';
    riskTaking: 'high' | 'medium' | 'low';
    achievement: 'high' | 'medium' | 'low';
    proactiveness: 'high' | 'medium' | 'low';
    locusOfControl: 'high' | 'medium' | 'low';
    selfEfficacy: 'high' | 'medium' | 'low';
    autonomy: 'high' | 'medium' | 'low';
    narrative: string; // User-facing profile summary
    redFlags?: string[]; // Potential issues for later modules
  };

  // Business Type Classification
  businessType: {
    category:
      | 'consulting'
      | 'ecommerce'
      | 'local_service'
      | 'local_retail'
      | 'manufacturing'
      | 'hybrid';
    isLocationDependent: boolean;
    requiresPhysicalInventory: boolean;
    isDigitalFirst: boolean;
    reasoning: string; // Why classified this way
  };

  // Resources
  resources: {
    financial: {
      availableCapital: number;
      expectedGZ: number; // ALG I amount Ã— 6 + (300 Ã— 6)
      otherIncome?: number;
      monthlyObligations: number; // Miete, Familie, etc.
    };
    time: {
      plannedStartDate: string; // ISO date
      hoursPerWeek: number;
      isFullTime: boolean;
    };
    network: {
      industryContacts: number; // 0-10 scale
      potentialFirstCustomers: string[];
      supporters: string[]; // Familie, Partner, Mentoren
    };
    infrastructure: {
      hasWorkspace: boolean;
      hasEquipment: boolean;
      hasLegalClarity: boolean;
    };
  };

  // Validation Results
  validation: {
    isGZEligible: boolean; // ALG days â‰¥ 150
    majorConcerns: string[]; // Red flags that need addressing
    minorConcerns: string[]; // Yellow flags to monitor
    strengths: string[]; // What's going well
  };

  // Module Metadata
  metadata: {
    completedAt: string; // ISO timestamp
    duration: number; // Minutes spent
    conversationTurns: number;
  };
}
```

---

## Conversation Flow

### Phase 1: Warm-Up (5 minutes)

**Goal:** Understand business idea at high level

**Opening:**

```
Willkommen! Lass uns deinen Businessplan fÃ¼r den GrÃ¼ndungszuschuss
erstellen. Das dauert 10-15 Stunden Ã¼ber mehrere Tage, aber heute
starten wir entspannt:

Ich mÃ¶chte dich und deine Idee kennenlernen. Danach weiÃŸ ich genau,
welche Module fÃ¼r dich relevant sind.

Bereit? ErzÃ¤hl mir in 2-3 Minuten: Was ist deine GeschÃ¤ftsidee?
```

**Key Questions (use GROW - Reality):**

1. "Was genau mÃ¶chtest du anbieten?" (Service/Produkt)
2. "Welches Problem lÃ¶st du fÃ¼r wen?" (Problem + Zielgruppe)
3. "Warum ausgerechnet du?" (Unique qualifier)
4. "Wie bist du auf die Idee gekommen?" (Motivation/Genesis)

**Listen for:**

- Industry terminology (indicates expertise level)
- Customer specificity ("Freelancer in MÃ¼nchen" vs. "alle Menschen")
- Problem clarity (concrete vs. vague)
- Personal connection to idea (passion vs. opportunism)

**Adapt depth:**

- **Expert:** Fewer basic questions, dive into strategy
- **Beginner:** More examples, break down concepts

---

### Phase 2: Founder Profile (10 minutes)

**Goal:** Collect structured background data

**Template:**

```
Super, danke fÃ¼r die Einblicke! Bevor wir tiefer einsteigen,
brauche ich ein paar Eckdaten zu dir:

[Ask systematically through experience, qualifications, motivation]
```

**Questions (structured):**

**Experience:**

- "Was machst du aktuell beruflich?" (employed/unemployed/other)
- "Wie lange schon? Und was hast du davor gemacht?"
- "Welche Erfahrung aus deinem Berufsleben hilft dir fÃ¼r dein GeschÃ¤ft?"
- [IF relevant] "Wie viele Jahre Branchenerfahrung hast du?"
- "Schon mal gegrÃ¼ndet? Was lief gut/schlecht?"

**Qualifications:**

- "Was hast du gelernt/studiert?"
- "Hast du relevante Zertifikate? (z.B. IHK, Coaching-Ausbildung)"
- "Welche besonderen FÃ¤higkeiten bringst du mit?"

**Motivation:**

- "Was treibt dich zur SelbststÃ¤ndigkeit?" (Push + Pull)
- [IF unemployed] "Wie lange bist du schon arbeitslos?"
- [IF unemployed] "Bekommst du ALG I? Wie viel pro Monat?"
- [IF unemployed] "Wie viele Tage ALG I-Anspruch hast du noch Ã¼brig?"

**Critical Validation:**

```typescript
if (algDaysRemaining < 150) {
  return {
    isGZEligible: false,
    error: "FÃ¼r den GrÃ¼ndungszuschuss brauchst du mindestens 150 Tage
            ALG I-Restanspruch. Du hast aktuell ${algDaysRemaining} Tage."
  };
}
```

---

### Phase 3: Entrepreneurial Personality (20 minutes)

**Goal:** Assess Howard's 7 dimensions using business-specific scenarios

**CRITICAL:**

- Generate scenarios dynamically based on their business idea
- No Likert scales (boring, unreliable)
- Use conversational style: "Was wÃ¼rdest du machen?"

#### Scenario Generation Rules

For each dimension:

1. Reference their actual business idea
2. Present realistic dilemma (no right answer)
3. Ask: "Was machst du?" or "Wie reagierst du?"
4. Follow up based on answer to probe deeper

#### Dimension 1: INNOVATIVENESS

**Definition:** Tendency to adopt new practices, experiment, develop original solutions

**Scenario Template:**

```
Ein Konkurrent in [their industry] bietet [similar service] an,
aber [competitor advantage]. Ein Kunde fragt: "Warum zu dir statt zu
denen?" Was antwortest du â€” und wÃ¼rdest du dein Angebot anpassen?
```

**Example (IT Consulting):**

```
Ein etablierter Berater in MÃ¼nchen bietet Ã¤hnliches wie du an, aber
hat 500 LinkedIn-Follower und ist 30% gÃ¼nstiger. Eine Interessentin
fragt: "Warum sollte ich zu dir kommen?"

Was sagst du? Und Ã¼berlegst du, dein Angebot zu Ã¤ndern?
```

**Scoring (internal):**

- **High:** Describes unique approach, willing to experiment, sees differentiation clearly
- **Medium:** Has some differentiation, but generic ("besserer Service")
- **Low:** "Ich mache es gÃ¼nstiger" or no clear answer

---

#### Dimension 2: RISK-TAKING PROPENSITY

**Definition:** Willingness to take actions with uncertain outcomes

**Scenario Template:**

```
Du hast [realistic capital] Startkapital. Ein vielversprechender
Auftrag Ã¼ber [higher amount] kommt rein, aber du musst [upfront cost]
vorfinanzieren und [risk factor]. Alternativ: [safe option].
Was machst du?
```

**Example (Handwerker):**

```
Du hast 8.000â‚¬ Startkapital. Ein BautrÃ¤ger bietet dir 25.000â‚¬ Auftrag
an, aber du musst Material fÃ¼r 6.000â‚¬ vorfinanzieren und er zahlt erst
nach Abnahme in 8 Wochen.

Alternativ: Drei kleine PrivatauftrÃ¤ge Ã  2.000â‚¬, sofort bezahlt.

Was machst du?
```

**Scoring:**

- **High:** Takes calculated risk, sees upside, has backup plan
- **Medium:** Asks clarifying questions, cautious but willing
- **Low:** Only safe option, focuses on downside

---

#### Dimension 3: ACHIEVEMENT ORIENTATION

**Definition:** Desire to meet/exceed performance standards

**Scenario Template:**

```
Nach [realistic timeframe] hast du [modest goal] erreicht. Du kÃ¶nntest
jetzt [stay comfortable] oder [push for more]. Was ist dein nÃ¤chster
Schritt?
```

**Example (Consulting):**

```
Nach 6 Monaten hast du 4 regelmÃ¤ÃŸige Kunden und 3.500â‚¬/Monat stabil.
Du kÃ¶nntest das Niveau halten und entspannt arbeiten.

Oder: In Akquise investieren fÃ¼r 8 Kunden, aber mehr Stress.

Was machst du und warum?
```

**Scoring:**

- **High:** Wants growth, sees opportunity, willing to push
- **Medium:** Happy with progress but open to growth
- **Low:** Satisfied, no drive to expand

---

#### Dimension 4: PROACTIVENESS

**Definition:** Future-oriented, anticipates demand, seeks opportunities

**Scenario Template:**

```
Du hÃ¶rst von [industry change] die in [timeframe] dein GeschÃ¤ft
betreffen kÃ¶nnte. Noch unklar, ob/wie. Wie gehst du damit um?
```

**Example (IT Freelancer):**

```
Du hÃ¶rst: Ein groÃŸes Unternehmen in deiner Region baut in 6 Monaten
eine Abteilung auf, die genau deine Expertise braucht.

Du kennst dort niemanden. Was tust du?
```

**Scoring:**

- **High:** Takes action immediately (research, network, reach out)
- **Medium:** Monitors situation, reacts when clearer
- **Low:** Waits to see what happens

---

#### Dimension 5: LOCUS OF CONTROL

**Definition:** Belief that outcomes are controlled by self (internal) vs. external forces

**Scenario Template:**

```
[Negative situation] trifft ein â€” [impact on business]. Wie erklÃ¤rst
du dir, dass das passiert ist? Was ist dein erster Gedanke?
```

**Example (E-Commerce):**

```
Dein Hauptlieferant erhÃ¶ht plÃ¶tzlich Preise um 25% â€” mitten in der
Hauptsaison. Deine Marge schmilzt von 30% auf 10%.

Wie erklÃ¤rst du dir das? Und was ist dein erster Impuls?
```

**Scoring:**

- **High:** "Ich hÃ¤tte X machen sollen", focuses on own actions
- **Medium:** Mix of external factors + own response
- **Low:** "Pech", "unfair", focuses on external blame

---

#### Dimension 6: SELF-EFFICACY

**Definition:** Belief in own abilities to master challenges

**Scenario Template:**

```
[Challenging situation] erfordert [skill you may lack]. Kunde erwartet
[result]. Wie gehst du damit um?
```

**Example (Agency Founder):**

```
Ein MittelstÃ¤ndler fragt: Kannst du unsere komplette Marketing-Strategie
machen â€” inklusive Paid Ads (wo du wenig Erfahrung hast)?

Konzept in 2 Wochen gewÃ¼nscht. Wie reagierst du?
```

**Scoring:**

- **High:** "Ja, ich lerne das" or "Ich hole mir Experten dazu"
- **Medium:** "Vielleicht, ich muss Ã¼berlegen"
- **Low:** "Das kann ich nicht"

---

#### Dimension 7: AUTONOMY ORIENTATION

**Definition:** Desire for freedom and independence in decision-making

**Scenario Template:**

```
[Authority figure] empfiehlt dir dringend [change to your concept].
Nachvollziehbare BegrÃ¼ndung, aber widerspricht deiner Vision.
Was machst du?
```

**Example (Restaurant):**

```
Der IHK-Berater sagt: "Dein veganes CafÃ©-Konzept ist zu nischig.
Biete auch klassische Produkte an." Er zeigt Statistiken.

Aber 100% vegan ist dein Herzensthema. Was machst du?
```

**Scoring:**

- **High:** Stays true to vision, seeks compromise that preserves core
- **Medium:** Considers advice seriously, might adapt
- **Low:** Follows authority, changes easily

---

### Phase 4: Profile Generation (5 minutes)

**Goal:** Synthesize assessment into actionable profile

**Process:**

1. **Score all 7 dimensions** (internal only)
2. **Identify strengths** (2-3 dimensions scored "high")
3. **Identify gaps** (1-2 dimensions scored "low")
4. **Generate narrative** (2-3 paragraphs)

**Profile Template:**

```
â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”
ðŸŽ¯ DEIN UNTERNEHMER-PROFIL
â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”

DEINE STÃ„RKEN (besonders fÃ¼r den Start):
â€¢ [Dimension]: [Konkret aus Antwort ableiten]
  Beispiel: "Du siehst sofort, wie du dich differenzieren kannst"

â€¢ [Dimension]: [Konkret]
  Beispiel: "Du denkst voraus und nimmst Chancen wahr"

ENTWICKLUNGSFELDER (Achtung in spÃ¤teren Phasen):
â€¢ [Dimension]: [Konkret]
  Beispiel: "Bei RÃ¼ckschlÃ¤gen fokussierst du stark auf externe
  Faktoren â€” bewusst auch eigene HandlungsmÃ¶glichkeiten sehen"

GRÃœNDUNGSTYP: [Type Name]
[2 sentences explaining what this means for their journey]

â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”

Die gute Nachricht: FÃ¼r den Start (Entry-Phase) sind besonders
wichtig: InnovationsfÃ¤higkeit, Risikobereitschaft, und Autonomie â€”
das bringst du mit!

FÃ¼r spÃ¤teres Wachstum (Management-Phase) werden ProaktivitÃ¤t und
KontrollÃ¼berzeugung wichtiger. Das kÃ¶nnen wir in spÃ¤teren Modulen
gezielt ansprechen.
```

**GrÃ¼ndungstypen (for classification):**

| Type           | Profile                               | Recommended Focus                                    |
| -------------- | ------------------------------------- | ---------------------------------------------------- |
| **Innovator**  | High: Innovativeness, Autonomy        | Focus on unique positioning, protect differentiation |
| **Executor**   | High: Achievement, Self-Efficacy      | Focus on operations, scaling systems                 |
| **Strategist** | High: Proactiveness, Locus of Control | Focus on market opportunities, long-term planning    |
| **Risk-Taker** | High: Risk-Taking, Achievement        | Focus on financial planning, safety nets             |
| **Balanced**   | All medium                            | Well-rounded, no major gaps                          |

---

### Phase 5: Resources & Constraints (5 minutes)

**Goal:** Understand available resources and constraints

**Questions (rapid fire):**

**Financial:**

- "Wie viel Startkapital hast du verfÃ¼gbar?" (Savings, loans, etc.)
- "Wie hoch ist dein ALG I?" â†’ Calculate GZ: (ALG + 300) Ã— 6
- "Andere Einnahmen wÃ¤hrend Start?" (Partner, savings, side gigs)
- "Monatliche Fixkosten?" (Miete, Versicherung, Familie)

**Time:**

- "Wann mÃ¶chtest du starten?" (Date)
- "Wie viele Stunden pro Woche kannst du arbeiten?"
- "Vollzeit oder nebenberuflich?"

**Network:**

- "Wie viele Kontakte hast du in deiner Zielbranche?" (0-10 scale)
- "Kennst du schon potenzielle Kunden? Wer konkret?"
- "Wer unterstÃ¼tzt dich?" (Familie, Partner, Mentoren)

**Infrastructure:**

- "Hast du einen Arbeitsplatz?" (Homeoffice, coworking, rental)
- "Hast du die nÃ¶tige Ausstattung?" (PC, tools, etc.)
- "Rechtliche Fragen geklÃ¤rt?" (Gewerbeanmeldung, insurance)

**Calculate GZ Funding:**

```typescript
const gzFunding = {
  phase1: (algMonthly + 300) * 6,
  phase2: 300 * 9, // Optional
  total: (algMonthly + 300) * 6 + 300 * 9,
};

// Example: ALG â‚¬2,000/month
// Phase 1: (2,000 + 300) Ã— 6 = â‚¬13,800
// Phase 2: 300 Ã— 9 = â‚¬2,700
// Total: â‚¬16,500
```

---

### Phase 6: Business Type Classification

**Goal:** Classify to determine which modules are relevant

**Classification Logic:**

```typescript
function classifyBusinessType(businessIdea: string): BusinessType {
  // Analyze key indicators
  const indicators = {
    isLocationDependent: hasKeywords([
      'Laden',
      'Standort',
      'Laufkundschaft',
      'vor Ort',
    ]),
    requiresInventory: hasKeywords(['Produkte', 'Lager', 'Waren', 'Lieferant']),
    isDigitalFirst: hasKeywords([
      'online',
      'digital',
      'remote',
      'SaaS',
      'Website',
    ]),
    isService: hasKeywords([
      'Beratung',
      'Dienstleistung',
      'Coaching',
      'Service',
    ]),
  };

  // Decision tree
  if (indicators.isDigitalFirst && indicators.isService) {
    return 'consulting'; // Digital services, location-independent
  }

  if (indicators.isLocationDependent && indicators.isService) {
    return 'local_service'; // Handwerker, Friseur, etc.
  }

  if (indicators.isLocationDependent && indicators.requiresInventory) {
    return 'local_retail'; // Laden, Restaurant, etc.
  }

  if (indicators.isDigitalFirst && indicators.requiresInventory) {
    return 'ecommerce'; // Online-Shop
  }

  if (!indicators.isDigitalFirst && indicators.requiresInventory) {
    return 'manufacturing'; // Produktion
  }

  return 'hybrid'; // Mix
}
```

**Module Relevance Table:**

| Module         | Consulting          | E-Commerce          | Local Service           | Local Retail            | Manufacturing           |
| -------------- | ------------------- | ------------------- | ----------------------- | ----------------------- | ----------------------- |
| Intake         | âœ…                 | âœ…                 | âœ…                     | âœ…                     | âœ…                     |
| Business Model | âœ…                 | âœ…                 | âœ…                     | âœ…                     | âœ…                     |
| Company        | âš ï¸ (No location) | âš ï¸ (No location) | âœ… (Location critical) | âœ… (Location critical) | âœ… (Location critical) |
| Market         | âœ…                 | âœ…                 | âœ…                     | âœ…                     | âœ…                     |
| Marketing      | âœ…                 | âœ…                 | âœ…                     | âœ…                     | âœ…                     |
| Finance        | âœ…                 | âœ…                 | âœ…                     | âœ…                     | âœ…                     |
| SWOT           | âœ…                 | âœ…                 | âœ…                     | âœ…                     | âœ…                     |
| Milestones     | âœ…                 | âœ…                 | âœ…                     | âœ…                     | âœ…                     |
| KPIs           | âœ…                 | âœ…                 | âœ…                     | âœ…                     | âœ…                     |
| Summary        | âœ…                 | âœ…                 | âœ…                     | âœ…                     | âœ…                     |

**Communicate Classification:**

```
Basierend auf deiner Idee, klassifiziere ich dein GeschÃ¤ft als:
[CATEGORY]

Das bedeutet:
âœ… Relevant: Module 1, 2, 3, 4, 5, 6, 7, 8, 9, 10
â­ï¸ VerkÃ¼rzt: [If any modules are simplified]

Beispiel: Bei einem Online-Business Ã¼berspringen wir die ausfÃ¼hrliche
Standortanalyse, weil du ortsunabhÃ¤ngig bist.
```

---

### Phase 7: Sanity Check & Validation

**Goal:** Challenge assumptions kindly but firmly (BA will be harsher)

**CRITICAL:** This is where many plans fail at BA. Be constructively skeptical.

**Validation Areas:**

#### 1. Market Validation

**Questions:**

- "Du sagst, deine Zielgruppe ist [X]. Woher weiÃŸt du, dass es genug davon gibt?"
- "Wie viele potenzielle Kunden hast du bereits kontaktiert?"
- "Was sagen die, die NICHT kaufen wÃ¼rden?"

**Red Flags:**

- âŒ "Alle werden das wollen"
- âŒ No customer conversations yet
- âŒ Target market = "Jeder"

**Pass:**

- âœ… Has spoken to 5-10 potential customers
- âœ… Specific target market with demographics
- âœ… Understands objections

---

#### 2. Revenue Validation

**Questions:**

- "Du planst [Xâ‚¬] Umsatz im ersten Jahr. Wie viele Kunden sind das?"
- "Bei [Yâ‚¬] pro Kunde brauchst du [Z] Kunden pro Monat. Realistisch?"
- "Woher kommen diese Kunden? Nenne 5 konkrete Wege."

**Math Check:**

```typescript
const year1Revenue = 45000; // User's estimate
const pricePerCustomer = 500;
const customersNeeded = year1Revenue / pricePerCustomer; // 90 customers
const customersPerMonth = customersNeeded / 12; // 7.5 per month

// Challenge:
console.log(`Du brauchst ${customersPerMonth} neue Kunden pro Monat.
Ist das realistisch fÃ¼r den Start?`);
```

**Red Flags:**

- âŒ No calculation basis
- âŒ Revenue goals not broken down
- âŒ "I'll figure it out as I go"

**Pass:**

- âœ… Revenue = Customers Ã— Price (calculated)
- âœ… Realistic acquisition plan
- âœ… Conservative estimates

---

#### 3. Pricing Validation

**Questions:**

- "Du willst [Xâ‚¬] verlangen. Wer zahlt das heute fÃ¼r Ã¤hnliches?"
- "Hast du den Preis schon mal genannt? Reaktion?"
- "Warum wÃ¼rde jemand mehr zahlen als bei Wettbewerber Y?"

**Red Flags:**

- âŒ Price = "What I need to earn" (not market-driven)
- âŒ Significantly above market without clear premium
- âŒ Never tested pricing

**Pass:**

- âœ… Researched competitor pricing
- âœ… Has value-based justification
- âœ… Tested with potential customers

---

#### 4. Time Validation

**Questions:**

- "Du planst [X] Stunden fÃ¼r [TÃ¤tigkeit]. Hast du das schon mal gemacht?"
- "Wie viel Zeit bleibt fÃ¼r Akquise, wenn du [Y] Stunden produktiv arbeitest?"

**Math Check:**

```typescript
const hoursPerWeek = 40;
const productiveHours = 25; // Customer work
const acquisitionHours = 5;
const adminHours = 5;
const bufferHours = 5; // Unplanned

// Does it add up?
const total = productiveHours + acquisitionHours + adminHours + bufferHours;
if (total > hoursPerWeek) {
  console.log(
    `âš ï¸ Du hast ${total} Stunden geplant, aber nur ${hoursPerWeek} verfÃ¼gbar.`
  );
}
```

**Red Flags:**

- âŒ No time for acquisition/marketing
- âŒ No buffer for unexpected
- âŒ Optimistic time estimates

**Pass:**

- âœ… Realistic time breakdown
- âœ… Buffer included
- âœ… Based on experience or research

---

### Validation Output

**Structure:**

```typescript
interface ValidationResult {
  isGZEligible: boolean;
  majorConcerns: string[]; // Blockers
  minorConcerns: string[]; // Watch items
  strengths: string[];
}

// Example output
{
  isGZEligible: true,
  majorConcerns: [
    "Keine KundengesprÃ¤che gefÃ¼hrt â€” vor Finanzplanung nachholen"
  ],
  minorConcerns: [
    "Preis 20% Ã¼ber Markt â€” Differenzierung muss sehr klar sein",
    "Netzwerk schwach (2/10) â€” Akquise wird herausfordernd"
  ],
  strengths: [
    "10 Jahre Branchenerfahrung",
    "Klare Zielgruppe (Mittelstand 50-200 MA)",
    "Konservative Umsatzprognose"
  ]
}
```

**Present to User:**

```
â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”
âœ… INTAKE ABGESCHLOSSEN
â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”

STÃ„RKEN:
â€¢ 10 Jahre Branchenerfahrung
â€¢ Klare Zielgruppe
â€¢ Konservative Zahlen

âš ï¸ VOR FINANZPLANUNG KLÃ„REN:
â€¢ KundengesprÃ¤che fÃ¼hren (mind. 5 StÃ¼ck)
â€¢ Preis-Rechtfertigung ausarbeiten

ðŸ“Š NÃ„CHSTER SCHRITT: GeschÃ¤ftsmodell
   Dort definieren wir dein Angebot detailliert.

â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”
```

---

## Error Handling

### Scenario: User Abandons Mid-Assessment

**Detection:** Last update >30 minutes ago

**Action:**

```typescript
// Auto-save current state
await saveModuleProgress({
  moduleId: 'intake',
  state: 'in_progress',
  data: partialData,
  lastSaved: new Date(),
});

// Send recovery email after 24h
if (hoursSinceLastUpdate > 24) {
  await sendEmail({
    template: 'module-recovery',
    data: {
      moduleName: 'Intake',
      continueUrl: `/workshop/${workshopId}/intake`,
    },
  });
}
```

---

### Scenario: User Not GZ-Eligible

**Detection:** ALG days < 150

**Response:**

```
Ich sehe, dass du nur noch ${algDaysRemaining} Tage ALG I-Anspruch hast.

FÃ¼r den GrÃ¼ndungszuschuss brauchst du mindestens 150 Tage Restanspruch
zum Zeitpunkt der Antragstellung.

OPTIONEN:
1. Antrag sofort stellen (mit geringem Restanspruch riskant)
2. Alternative FÃ¶rderungen prÃ¼fen (z.B. Einstiegsgeld bei ALG II)
3. Workshop trotzdem machen (Businessplan bleibt wertvoll)

Was mÃ¶chtest du tun?
```

---

### Scenario: User Gives Vague Answers

**Detection:** Answers <10 words, generic phrases

**Response (Coaching Pattern):**

```
Ich merke, hier wird's schwierig. Das ist vÃ¶llig normal.

Lass uns anders rangehen: Ich zeige dir 3 Beispiele aus deiner
Branche. Du sagst mir, welches am nÃ¤chsten zu deiner Situation passt.

Dann verfeinern wir von dort.

Passt das?
```

---

## Testing Requirements

### Unit Tests

```typescript
describe('gz-module-01-intake', () => {
  describe('Business Type Classification', () => {
    test('classifies digital consulting correctly', () => {
      const input = {
        businessIdea: 'Online-Coaching fÃ¼r FÃ¼hrungskrÃ¤fte',
      };
      const result = classifyBusinessType(input);
      expect(result.category).toBe('consulting');
      expect(result.isLocationDependent).toBe(false);
    });

    test('classifies restaurant correctly', () => {
      const input = {
        businessIdea: 'Veganes CafÃ© in Berlin-Kreuzberg',
      };
      const result = classifyBusinessType(input);
      expect(result.category).toBe('local_retail');
      expect(result.isLocationDependent).toBe(true);
    });
  });

  describe('GZ Eligibility Validation', () => {
    test('rejects if ALG days < 150', () => {
      const founder = { algDaysRemaining: 120 };
      const result = validateGZEligibility(founder);
      expect(result.isGZEligible).toBe(false);
    });

    test('passes if ALG days >= 150', () => {
      const founder = { algDaysRemaining: 200 };
      const result = validateGZEligibility(founder);
      expect(result.isGZEligible).toBe(true);
    });
  });

  describe('Entrepreneurial Personality Scoring', () => {
    test('scores innovativeness high for unique differentiation', () => {
      const answer = 'Ich fokussiere mich auf KMU im Raum MÃ¼nchen...';
      const score = scoreInnovativeness(answer);
      expect(score).toBe('high');
    });
  });
});
```

---

### Integration Tests

```typescript
describe('Intake Module Flow', () => {
  test('completes full intake successfully', async () => {
    const session = await startIntake(testFounder);

    // Phase 1: Warm-up
    await session.answer('Ich biete Online-Coaching fÃ¼r FÃ¼hrungskrÃ¤fte...');

    // Phase 2: Profile
    await session.answer('5 Jahre Erfahrung als...');

    // Phase 3-7: Continue...

    const result = await session.complete();

    expect(result.state).toBe('complete');
    expect(result.data.businessType.category).toBeDefined();
    expect(result.data.personality.innovativeness).toBeDefined();
  });

  test('recovers from abandonment', async () => {
    const session = await startIntake(testFounder);
    await session.answer('Partial data...');

    // Simulate abandonment
    await wait(25 * 60 * 60 * 1000); // 25 hours

    // Check recovery email sent
    const emails = await getEmailLog(testFounder.email);
    expect(emails).toContainEqual(
      expect.objectContaining({ template: 'module-recovery' })
    );

    // Resume
    const resumed = await resumeIntake(session.id);
    expect(resumed.data).toEqual(session.data);
  });
});
```

---

### E2E Tests (Playwright)

```typescript
test('Founder completes intake module', async ({ page }) => {
  await page.goto('/workshop/new');

  // Welcome screen
  await expect(page.locator('h1')).toContainText('Willkommen');
  await page.click('text=Bereit zu starten?');

  // Phase 1: Business idea
  await page.fill(
    '[name="businessIdea"]',
    'Online-Coaching fÃ¼r FÃ¼hrungskrÃ¤fte'
  );
  await page.click('text=Weiter');

  // Phase 2: Profile
  await page.fill('[name="experience"]', '5 Jahre als Manager bei...');
  // ... continue through all phases

  // Verify completion
  await expect(page.locator('text=INTAKE ABGESCHLOSSEN')).toBeVisible();
  await expect(page.locator('.progress-bar')).toHaveAttribute(
    'aria-valuenow',
    '1'
  );
});
```

---

## Implementation Checklist

**Backend (API Routes):**

- [ ] POST /api/workshop - Create new workshop
- [ ] POST /api/workshop/[id]/module/intake/start - Initialize intake
- [ ] POST /api/workshop/[id]/module/intake/answer - Process user response
- [ ] POST /api/workshop/[id]/module/intake/complete - Finalize intake
- [ ] GET /api/workshop/[id]/module/intake/recover - Load saved state

**Frontend (Components):**

- [ ] IntakeWelcome.tsx - Landing screen
- [ ] IntakePhaseIndicator.tsx - Show current phase
- [ ] IntakeQuestionCard.tsx - Question + input
- [ ] IntakeProfileDisplay.tsx - Show generated profile
- [ ] IntakeValidationPanel.tsx - Show concerns/strengths
- [ ] IntakeProgressBar.tsx - Overall workshop progress

**Database:**

- [ ] workshops table with intake_completed flag
- [ ] module_progress table with intake state
- [ ] Auto-save trigger (every 30s)
- [ ] Abandonment check cron job (daily)

**Claude Integration:**

- [ ] Skill prompt loaded via gz-system-orchestrator
- [ ] PII redaction before API call (founder name)
- [ ] Response parsing for structured data
- [ ] Error retry logic (3 attempts)

**Testing:**

- [ ] Unit tests for classification logic
- [ ] Unit tests for validation rules
- [ ] Integration tests for full flow
- [ ] E2E test for happy path
- [ ] E2E test for abandonment recovery

---

## Dependencies

**Requires (Blocking):**

- gz-system-orchestrator (module coordination)
- gz-system-coaching (GROW model, questioning patterns)
- gz-system-constraints (BA requirements, GZ eligibility rules)

**Provides To (Used By):**

- gz-module-02-model (founder profile, business type)
- gz-module-03-company (resources, infrastructure)
- gz-module-04-market (business type, target audience)
- gz-module-05-marketing (personality profile, network)
- gz-module-06-finance (resources, ALG status)
- gz-module-07-swot (personality strengths/gaps)

---

## Cost Estimate

**Claude API Usage per Intake:**

- System prompt: ~7,000 tokens (cached, $0.021)
- Module skill: ~3,000 tokens (not cached, $0.009)
- Conversation: ~50 messages Ã— 200 tokens avg = ~10,000 tokens input ($0.03)
- Responses: ~50 messages Ã— 400 tokens avg = ~20,000 tokens output ($0.30)

**Total per Intake:** ~$0.36

---

**END OF gz-module-01-intake**
