---
name: gz-module-04-markt-wettbewerb
version: 2.0
description: Market and competition analysis module for GZ workshop. Uses real-time web research to gather verifiable market data, industry statistics, and competitor information. Covers TAM/SAM/SOM calculations, competitive analysis, and positioning with documented sources for TragfÃ¤higkeitsbescheinigung. Duration 90 minutes. Output market validation for finance and marketing modules.
dependencies:
  - gz-system-coaching-core (GROW, Socratic, Clean Language)
  - gz-coaching-mi (handle disappointing data, market realities)
  - gz-coaching-cbc (challenge unfounded assumptions, validate numbers)
  - gz-engine-research (web search patterns, source documentation)
  - gz-module-01-intake (business type, founder profile)
  - gz-module-02-geschaeftsmodell (offering, target audience, USP, initial competitor list)
---

# Module 04: Markt & Wettbewerb (Market & Competition)

**Duration:** 90 minutes  
**Critical Path:** Yes (validates business viability, feeds finance + marketing)  
**Complexity:** High (requires web research, data interpretation, reality checks)  
**Coaching Load:** MI (primary), CBC (secondary)

---

## Purpose

Develop data-backed market and competitive analysis with:

1. **Branche & Marktsituation** (industry overview with statistics)
2. **Zielmarkt-Quantifizierung** (TAM/SAM/SOM with sources)
3. **Wettbewerbsanalyse** (3-5 competitors, deep analysis)
4. **Positionierung** (competitive positioning matrix)
5. **Quellenverzeichnis** (source documentation for BA approval)

**BA Rejection Reasons (Module 04):**

- No verifiable sources for market data
- Market size estimates unfounded ("Ich schÃ¤tze...")
- SOM unrealistically high (>5% of SAM for new business)
- "Keine Konkurrenz" claim (always alternatives exist)
- Positioning not differentiated from competitors

**âš ï¸ CRITICAL: Web Research Required**
This module MUST use active web research. Personal estimates without sources = BA rejection.

---

## Module Structure

### Input Requirements

```typescript
// From gz-module-01-intake
interface IntakeInput {
  businessType: {
    category: string;
    isLocationDependent: boolean;
  };
  founder: {
    experience: {
      yearsInIndustry: number;
    };
  };
}

// From gz-module-02-geschaeftsmodell
interface GeschaeftsmodellInput {
  offering: {
    mainOffering: string;
    deliveryFormat: string;
  };
  targetAudience: {
    primaryPersona: {
      demographics?: object;
      firmographics?: object;
      behavior: {
        informationSources: string[];
      };
    };
    marketSize: {
      totalAddressableMarket: number; // Initial estimate, will validate
      tamSource: string;
      serviceableMarket: number; // Initial estimate, will refine
    };
  };
  competitiveAnalysis: {
    directCompetitors: Array<{
      name: string;
      offering: string;
      yourAdvantage: string;
    }>; // Initial 3 from module 2, will expand
  };
  usp: {
    statement: string;
    category: string;
  };
}
```

### Output Schema

```typescript
interface MarktWettbewerbOutput {
  // Industry Overview
  industry: {
    name: string; // e.g., "IT-Beratung", "Gastronomie"
    classification: string; // Official classification (WZ 2008 code if available)
    description: string; // 2-3 sentences

    // Market Statistics (ALL with sources!)
    statistics: {
      marketVolume: {
        value: number; // â‚¬ in millions
        year: number;
        source: DocumentedSource;
        confidence: 'high' | 'medium' | 'low';
      };
      numberOfCompanies: {
        value: number;
        year: number;
        source: DocumentedSource;
      };
      numberOfEmployees?: {
        value: number;
        year: number;
        source: DocumentedSource;
      };
      averageRevenuePerCompany?: {
        value: number; // Calculated or sourced
        calculation?: string;
        source: DocumentedSource;
      };
      growthRate: {
        value: number; // % per year
        period: string; // e.g., "2020-2024"
        source: DocumentedSource;
      };
    };

    // Market Trends (3-5)
    trends: Array<{
      name: string;
      description: string;
      impact: 'opportunity' | 'risk' | 'neutral';
      relevanceToUser: string; // How it affects user's business
      source: DocumentedSource;
    }>;

    // Market Assessment
    attractiveness: 'high' | 'medium' | 'low';
    attractivenessReasoning: string;
  };

  // Target Market Quantification
  targetMarket: {
    // TAM (Total Addressable Market)
    tam: {
      value: number; // â‚¬ per year
      calculation: string; // Show math
      assumptions: string[];
      sources: DocumentedSource[];
      confidence: 'high' | 'medium' | 'low';
    };

    // SAM (Serviceable Addressable Market)
    sam: {
      value: number; // â‚¬ per year
      calculation: string;
      filters: {
        geographic?: string; // e.g., "Berlin, 3,7 Mio. Einwohner"
        segment?: string; // e.g., "Nur KMU 10-50 MA"
        other?: string[];
      };
      sources: DocumentedSource[];
    };

    // SOM (Serviceable Obtainable Market) - CRITICAL for BA
    som: {
      year1: number; // â‚¬ revenue target
      year2: number;
      year3: number;

      methodology: 'bottom_up' | 'top_down'; // Bottom-up preferred

      // Bottom-up calculation
      bottomUpCalc?: {
        year1: {
          customers: number;
          avgRevenuePerCustomer: number;
          calculation: string; // "20 customers Ã— â‚¬2,500 = â‚¬50,000"
        };
        year2: {
          customers: number;
          avgRevenuePerCustomer: number;
          calculation: string;
        };
        year3: {
          customers: number;
          avgRevenuePerCustomer: number;
          calculation: string;
        };
      };

      // Top-down validation
      marketShareYear3: number; // % of SAM
      isRealistic: boolean; // Should be <5% for startup
      reasoning: string;
    };

    // Market Entry Barriers
    barriers: {
      regulatory: string[]; // Legal barriers
      capital: string[]; // Financial barriers
      expertise: string[]; // Knowledge barriers
      network: string[]; // Relationship barriers
      userAdvantages: string[]; // How user overcomes these
    };
  };

  // Competitive Analysis
  competition: {
    // Direct Competitors (5-8 ideal)
    directCompetitors: Array<{
      name: string;
      website?: string;
      location?: string; // If relevant

      offering: {
        products: string[];
        targetAudience: string;
        positioning: string;
      };

      pricing: {
        model: string; // e.g., "Hourly", "Package"
        range?: string; // e.g., "â‚¬80-120/h"
        value: 'premium' | 'mid' | 'budget';
      };

      strengths: string[];
      weaknesses: string[];

      marketPresence: {
        yearsInBusiness?: number;
        teamSize?: string;
        onlinePresence: 'strong' | 'medium' | 'weak';
        customerBase?: string; // If known
      };

      userAdvantageVsThisCompetitor: string; // Specific differentiation

      source: string; // How competitor was found
    }>;

    // Indirect Competitors / Substitutes
    indirectCompetitors: Array<{
      type: string; // e.g., "DIY solution", "In-house"
      description: string;
      threat: 'high' | 'medium' | 'low';
      userAdvantage: string; // Why user is better
    }>;

    // Competitive Intensity Analysis (Porter's 5 Forces simplified)
    intensity: {
      rivalry: {
        level: 'high' | 'medium' | 'low';
        reasoning: string;
        numberOfCompetitors: number | string; // e.g., "50+ in Berlin"
      };
      threatOfNewEntrants: {
        level: 'high' | 'medium' | 'low';
        reasoning: string;
      };
      buyerPower: {
        level: 'high' | 'medium' | 'low';
        reasoning: string;
      };
      supplierPower: {
        level: 'high' | 'medium' | 'low';
        reasoning: string;
      };
      threatOfSubstitutes: {
        level: 'high' | 'medium' | 'low';
        reasoning: string;
      };
      overallAttractiveness: 'attractive' | 'neutral' | 'unattractive';
    };

    // Competitive Gaps (opportunities)
    marketGaps: string[]; // What NO competitor does (user's opportunity)
  };

  // Positioning
  positioning: {
    // Price vs. Specialization Matrix
    priceLevel: 'premium' | 'mid' | 'budget';
    specializationLevel: 'generalist' | 'specialist';
    quadrant:
      | 'premium_generalist'
      | 'premium_specialist'
      | 'budget_generalist'
      | 'niche_specialist';

    justification: string; // Why this positioning

    competitorPositions: Array<{
      competitor: string;
      quadrant: string;
    }>;

    differentiation: {
      primary: string; // Main differentiator
      secondary: string[]; // 2-3 additional differentiators
      proof: string[]; // Evidence for each claim
    };

    riskAssessment: {
      competitiveThreats: string[];
      mitigationStrategies: string[];
    };
  };

  // Source Documentation (CRITICAL for BA)
  sources: Array<{
    id: number; // [1], [2], etc.
    title: string;
    organization: string; // e.g., "Statistisches Bundesamt"
    url: string;
    accessDate: string; // ISO date
    usedFor: string[]; // Which facts from this source
    tier: 'tier1' | 'tier2' | 'tier3'; // Source quality
  }>;

  // Validation Results
  validation: {
    industryDataDocumented: boolean; // At least 3 statistics with sources
    tamSamSomCalculated: boolean; // All three levels present
    somRealistic: boolean; // <5% of SAM typically
    competitorsAnalyzed: number; // Should be â‰¥3
    competitorDetailsComplete: boolean; // Strengths/weaknesses for all
    positioningClear: boolean; // Differentiation defined
    allSourcesDocumented: boolean; // Every fact has source

    readyForNextModule: boolean;
    blockers?: string[];
    warnings?: string[];
  };

  // Module Metadata
  metadata: {
    completedAt: string;
    duration: number;
    webSearchesPerformed: number; // Track research intensity
    sourcesFound: number; // Quality metric
    coachingPatternsUsed: string[];
    realityChecks: number; // How many times MI was needed
  };
}

// Source Documentation Type
interface DocumentedSource {
  sourceId: number; // Reference to sources array
  fact: string; // Specific data point
  date: string; // When data is from
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
  - gz-coaching-mi (PRIMARY)
    purpose: Handle disappointing market realities, adjust expectations
    triggers:
      - Market smaller than user expected
      - More competition than anticipated
      - Trends unfavorable for user's idea
      - User's assumptions challenged by data
      - SOM calculation shows revenue targets unrealistic
    patterns:
      - Empathy when data disappoints
      - Explore options without discouraging
      - Develop discrepancy (ideal vs. reality)
      - Support user finding own solutions

  - gz-coaching-cbc (SECONDARY)
    purpose: Challenge unfounded assumptions, validate with evidence
    triggers:
      - User claims "no competition"
      - Market size stated without source
      - "Ich schÃ¤tze..." without research
      - Unrealistic market share assumptions
    patterns:
      - Gather evidence through web research
      - Challenge gently with data
      - Reframe understanding based on facts
```

### Key MI Patterns in This Module

#### Pattern 1: Market Smaller Than Expected

```typescript
// Scenario: Web research shows TAM is â‚¬50M, user expected â‚¬500M

user: "Nur â‚¬50 Millionen? Ich dachte der Markt ist viel grÃ¶ÃŸer."

// MI Response (NOT dismissive, NOT fake positive)

// 1. EMPATHY
ai: "Das ist frustrierend. Du hattest dir mehr erhofft.

     Lass uns ehrlich durchdenken, was das bedeutet."

// 2. REALITY CHECK (with data)
ai: "Die Zahlen:

     TAM (Deutschland gesamt): â‚¬50 Mio.
     (Quelle: Destatis 2024)

     Dein SAM (Berlin, KMU): â‚¬2,5 Mio.
     SOM Jahr 3 (2% Marktanteil): â‚¬50.000

     Das ist deutlich unter deinem Umsatzziel von â‚¬120.000.

     Was denkst du darÃ¼ber?"

// 3. EXPLORE OPTIONS (not tell what to do)
ai: "Du hast mehrere Optionen:

     A) Zielgruppe erweitern
        (Mehr Regionen, grÃ¶ÃŸere Firmen)
        â†’ SAM steigt

     B) Angebot erweitern
        (ZusÃ¤tzliche Services, hÃ¶here Preise)
        â†’ â‚¬ pro Kunde steigt

     C) GeschÃ¤ftsmodell pivoten
        (Andere Zielgruppe oder ProblemlÃ¶sung)
        â†’ Neuer Markt

     D) Ziele anpassen
        (Realistischer Umsatz, vielleicht Teilzeit)
        â†’ Akzeptiere kleineren Markt

     Welche Option fÃ¼hlt sich machbar an?"

// 4. USER GENERATES SOLUTION (MI principle)
[User explores options]

ai: "Du tendierst zu [option].
     Was wÃ¤re dein nÃ¤chster Schritt?"

[User plans adjustment]

// 5. VALIDATE DECISION
ai: "Du hast einen Plan. Das ist mehr als viele haben.

     Lass uns die Zahlen mit [chosen option] neu berechnen
     und schauen, ob es funktioniert."

// RESULT: User owns adjustment, stays motivated
```

#### Pattern 2: Intense Competition Discovered

```typescript
// Scenario: Web search finds 50+ direct competitors in user's region

user: "50 Wettbewerber?! Das wusste ich nicht. Vielleicht ist
      die Idee doch nicht so gut..."

// MI Response (Handle Discouragement)

// 1. EMPATHY + NORMALIZE
ai: "50 klingt viel. Das kann entmutigend sein.

     Aber: Viel Konkurrenz bedeutet auch, der Markt existiert
     und Menschen zahlen dafÃ¼r.

     Lass uns genauer hinschauen."

// 2. DIFFERENTIATION EXERCISE
ai: "Von diesen 50 - schauen wir uns die Top 5 an.

     [Show 5 competitors with strengths/weaknesses]

     Frage: Was machen DIE ALLE gleich oder Ã¤hnlich?"

[User identifies common patterns]

ai: "Und was machst DU anders?

     [Reference user's USP from module 2]

     Erinnere dich: Dein USP war '[statement]'.
     Macht dich das einzigartig?"

// 3. NICHE POSITIONING
ai: "Vielleicht ist die Frage nicht:
     'Kann ich gegen 50 Wettbewerber bestehen?'

     Sondern:
     'Wo ist meine Nische, die die 50 nicht bedienen?'

     Schau die Top 5 nochmal an:
     - Wer wird NICHT bedient?
     - Welches Problem wird NICHT gelÃ¶st?
     - Was frustriert Kunden an denen?"

[User identifies gaps]

// 4. REFRAME COMPETITION
ai: "Du hast LÃ¼cken gefunden:
     - [Gap 1]
     - [Gap 2]

     Das sind NICHT 50 Wettbewerber.
     Das sind 50 Anbieter, die [gap] nicht machen.

     Wenn du [gap] als Fokus nimmst,
     hast du vielleicht nur 5 echte Konkurrenten.

     Ã„ndert das deine Perspektive?"

// 5. CONFIDENCE REBUILD
ai: "Konkurrenz zeigt: Markt existiert.
     Deine Nische: UnerfÃ¼lltes BedÃ¼rfnis.
     Dein USP: LÃ¶st genau das.

     Das ist eine starke Position.

     Wie fÃ¼hlst du dich jetzt Ã¼ber die Idee?"

// RESULT: Competition reframed as validation, not threat
```

#### Pattern 3: Unrealistic SOM Calculation

```typescript
// User calculates SOM Year 3 = â‚¬500k, but SAM is only â‚¬2M (25% market share!)

ai: "Lass uns deine SOM-Rechnung checken:

     SAM (dein erreichbarer Markt): â‚¬2 Mio.
     SOM Jahr 3 (dein Ziel): â‚¬500.000

     Das wÃ¤re 25% Marktanteil.

     FÃ¼r Kontext: Amazon hat in Deutschland ~40%
     E-Commerce nach 25 Jahren.

     25% in Jahr 3 ist... sehr ambitioniert."

// User realizes: "Oh. Das ist unrealistisch."

// MI (not "you're wrong", but explore together)
ai: "Lass uns realistisch schauen.

     Typische Marktanteile fÃ¼r neue Anbieter:
     - Jahr 1: 0,5-1%
     - Jahr 3: 1-3%
     - Jahr 5: 3-5%

     Was wÃ¤re fÃ¼r dich:

     A) Konservativ (1% in Jahr 3)
        â†’ â‚¬20.000 Umsatz

     B) Realistisch (2% in Jahr 3)
        â†’ â‚¬40.000 Umsatz

     C) Optimistisch (3% in Jahr 3)
        â†’ â‚¬60.000 Umsatz

     Welches fÃ¼hlt sich ehrlich machbar an?"

[User chooses B or C]

ai: "Ok, â‚¬40.000 in Jahr 3.

     Das ist 2% Marktanteil - ambitioniert aber machbar.

     Passt das zu deinen Kosten aus Modul 3?"

# Cross-module validation
if som_year3 < (fixed_costs + private_entnahme):
  ai: "âš ï¸ Problem: â‚¬40k Umsatz reicht nicht fÃ¼r deine Kosten.

       Du hast zwei Optionen:
       1. GrÃ¶ÃŸeren Markt finden (andere Region/Zielgruppe)
       2. Kosten senken (Teilzeit, Home Office)

       Was machbar?"

# RESULT: Realistic numbers, BA-compliant
```

### Key CBC Patterns in This Module

#### Pattern 1: "Es gibt keine Konkurrenz"

```typescript
user: "Ich habe geschaut, es gibt keine direkten Wettbewerber."

// CBC Response (Challenge with Evidence)

// 1. IDENTIFY the assumption
ai: "Du sagst 'keine Konkurrenz'.

     Lass uns das prÃ¼fen mit Recherche."

// 2. EVIDENCE gathering (Web Search)
ai: "[Performing web search...]

     Suche 1: '[user's service] [user's city]'
     â†’ 15 Ergebnisse gefunden

     Suche 2: '[user's service] [broader region]'
     â†’ 50+ Ergebnisse

     Suche 3: '[problem user solves] LÃ¶sung'
     â†’ 30 Anbieter mit Ã¤hnlichem Ansatz"

// 3. CHALLENGE (with data, not judgment)
ai: "Ich finde tatsÃ¤chlich Wettbewerber.

     Hier die Top 5:
     [List competitors with websites]

     Kanntest du diese?"

[User: "Ach, die machen aber was anderes"]

// 4. REFRAME understanding
ai: "Vielleicht ist die Frage nicht 'Gibt es Konkurrenz?'
     sondern 'Wie ist die Konkurrenz positioniert?'

     Die 5 gefundenen machen:
     - [What they do]

     Du machst:
     - [What user does]

     Unterschied:
     - [Specific differentiation]

     Das SIND Wettbewerber, aber mit anderem Fokus.
     Das ist gut - zeigt, du hast eine Nische!"

// 5. ACTION
ai: "Lass uns diese 5 genauer analysieren:
     StÃ¤rken, SchwÃ¤chen, was machst du besser?"

// RESULT: Realistic competition assessment with differentiation
```

#### Pattern 2: Market Size Without Source

```typescript
user: "Der Markt ist etwa â‚¬100 Millionen."

// CBC Response (Validate with Evidence)

// 1. IDENTIFY source of number
ai: "â‚¬100 Millionen - woher kommt diese Zahl?"

[User: "Habe ich geschÃ¤tzt" OR "Habe ich gelesen"]

// 2. EVIDENCE (Web Research)
ai: "Lass uns das validieren mit offiziellen Daten.

     [Performing searches on Destatis, Statista, industry associations]

     Gefunden:

     [1] Statistisches Bundesamt (2024)
         Marktvolumen [industry]: â‚¬45 Mio.
         Link: [url]

     [2] [Branchenverband] Jahresbericht
         Umsatz [sector]: â‚¬52 Mio.
         Link: [url]

     Die Zahlen zeigen: â‚¬45-52 Mio., nicht â‚¬100 Mio."

// 3. CHALLENGE assumption (gently)
ai: "Deine SchÃ¤tzung: â‚¬100 Mio.
     Recherchierte Daten: â‚¬45-52 Mio.

     Fast 50% Unterschied.

     Was passiert mit deiner Planung, wenn wir die
     validierten â‚¬50 Mio. nehmen?"

// 4. REFRAME to accurate understanding
ai: "Mit korrigierten Zahlen:

     TAM: â‚¬50 Mio. (nicht â‚¬100 Mio.)
     SAM (Berlin, 10%): â‚¬5 Mio.
     SOM Jahr 3 (2%): â‚¬100.000

     Das ist niedriger, aber DAFÃœR:
     - BA-konform (mit Quelle)
     - GlaubwÃ¼rdig
     - Defensible

     Besser eine belegbare â‚¬100k als
     unbelegte â‚¬200k, die abgelehnt wird."

// 5. ACTION
ai: "Lass uns mit den â‚¬50 Mio. weiterrechnen.
     Ich dokumentiere die Quelle fÃ¼r den Businessplan."

// RESULT: Evidence-based numbers, BA-compliant
```

---

## Conversation Flow

### Phase 1: Industry Overview (20 minutes)

**Goal:** Describe industry with statistics and trends

**GROW Structure with Web Research:**

```yaml
GOAL:
  ai: "In diesem Modul analysieren wir deinen Markt mit ECHTEN Daten.

       Wir machen:
       1. Branche beschreiben (mit Statistiken)
       2. MarktgrÃ¶ÃŸe berechnen (TAM, SAM, SOM)
       3. Wettbewerber analysieren (5-8 konkret)
       4. Deine Position definieren

       Dauer: ca. 90 Minuten

       WICHTIG: Ich recherchiere aktiv mit Web-Suche.
       Alle Zahlen werden mit Quellen belegt.

       Bereit?"

REALITY:
  ai: "Wie wÃ¼rdest du deine Branche beschreiben?

       Beispiel: 'IT-Beratung fÃ¼r KMU' oder
                 'Gastronomie - Fast-Casual-Restaurant'"

  [User describes industry]

  # Classify for search strategy
  ai: "Ok, [industry name].

       Lass mich aktuelle Marktdaten recherchieren.

       [Performing web searches...]"

# WEB RESEARCH BLOCK 1: Industry Statistics
searches:
  - "[industry] Marktvolumen Deutschland 2024"
  - "[industry] Anzahl Unternehmen Deutschland Statistik"
  - "[industry] Wachstum Prognose"
  - "site:destatis.de [industry]"
  - "site:statista.com [industry] Deutschland"

# Process search results
ai: "Recherche-Ergebnisse:

     ðŸ“Š Marktvolumen:
     [1] [Organization]: â‚¬[X] Mrd. (Jahr [Y])
         Quelle: [URL]

     ðŸ“Š Anzahl Unternehmen:
     [2] [Organization]: [N] Betriebe
         Quelle: [URL]

     ðŸ“Š Wachstum:
     [3] [Organization]: +[X]% p.a. (2020-2024)
         Quelle: [URL]

     Siehst du dich in diesen Zahlen wieder?"

OPTIONS:
  # If good data found
  if sources_found >= 3:
    ai: "Starke Datenlage! 3+ Quellen gefunden.

         Das gibt deinem Businessplan GlaubwÃ¼rdigkeit."

  # If limited data
  if sources_found < 3:
    ai: "Begrenzte Daten fÃ¼r diese spezifische Branche.

         Optionen:
         A) Branche breiter definieren fÃ¼r bessere Daten
         B) Verwandte Branchen als Proxy nutzen
         C) Mit vorhandenen Daten arbeiten + Limitationen erklÃ¤ren

         Was macht Sinn?"

  # Trend Research
  ai: "Lass uns Trends recherchieren:

       [Search: '[industry] Trends 2025']
       [Search: '[industry] Digitalisierung']
       [Search: '[industry] Herausforderungen']"

  [Process and present 3-5 trends with sources]

WILL:
  ai: "Branchen-Zusammenfassung:

       Branche: [name]
       Marktvolumen: â‚¬[X] Mrd.
       Unternehmen: [N]
       Wachstum: [Y]% p.a.

       Trends:
       1. [Trend] â†’ [Chance/Risiko fÃ¼r dich]
       2. [Trend] â†’ [Chance/Risiko fÃ¼r dich]
       3. [Trend] â†’ [Chance/Risiko fÃ¼r dich]

       Quellen: [N] dokumentiert

       Passt das zu deiner Wahrnehmung der Branche?"
```

**Output:**

- `industry.name`, `industry.statistics` (all with sources)
- `industry.trends` (3-5 with impact assessment)
- `sources[]` (IDs 1-N)

---

### Phase 2: Target Market Quantification (25 minutes) â­

**Goal:** Calculate TAM â†’ SAM â†’ SOM with bottom-up validation

**GROW Structure with Calculations:**

```yaml
GOAL:
  ai: "Jetzt quantifizieren wir deinen Markt.

       Wir berechnen 3 Ebenen:

       TAM = Gesamtmarkt Deutschland
       SAM = Dein erreichbarer Teil
       SOM = Was du realistisch gewinnst

       Am Ende weiÃŸt du: Rechtfertigt der Markt
       dein Umsatzziel?"

REALITY (TAM Calculation):
  ai: "TAM-Berechnung:

       Aus Modul 2 hattest du geschÃ¤tzt:
       TAM: â‚¬[user's initial estimate]

       Lass uns das validieren mit Recherche."

  # WEB RESEARCH BLOCK 2: Target Market Size
  searches:
    - "[target audience] Anzahl Deutschland"
    - "[target audience] Ausgaben [service category]"
    - "[market segment] Marktvolumen"

  ai: "Recherche-Ergebnisse:

       Zielgruppe: [target audience]
       Anzahl in Deutschland: [N]
       (Quelle: [URL])

       Durchschn. Ausgaben fÃ¼r [service]: â‚¬[X]/Jahr
       (Quelle: [URL])

       TAM-Berechnung:
       [N] Ã— â‚¬[X] = â‚¬[TAM]

       Deine ursprÃ¼ngliche SchÃ¤tzung: â‚¬[original]

       Differenz: [% difference]"

  # If large discrepancy (>30%)
  if abs(difference) > 30%:
    # ACTIVATE MI (disappointing data)
    ai: "Die recherchierte Zahl weicht deutlich ab.

         Das ist frustrierend, aber besser jetzt wissen
         als nach 6 Monaten.

         Lass uns ehrlich durchdenken, was das bedeutet."

    [Run MI Pattern 1: Market Smaller Than Expected]

OPTIONS (SAM Calculation):
  ai: "SAM = TAM eingegrenzt auf das, was du ERREICHST.

       Filter:

       1. GEOGRAFISCH
          Wo bietest du an?
          [If local: Stadt/Region]
          [If online: Ganz Deutschland]

       2. SEGMENT
          Aus Modul 2: [user's persona segment]
          [Firmographics OR demographics]

       3. SONSTIGE
          [Any other limitations]

       Lass uns jeden Filter recherchieren:"

  # Geographic Filter
  if isLocationDependent:
    ai: "[Search: '[target] [city] Anzahl']

         Gefunden: [N] in [city]
         Das sind [%] von Deutschland gesamt."

    geographic_filter = N / total

  # Segment Filter
  ai: "Dein Segment: [segment description]

       [Search relevant statistics]

       Von allen [target], sind ca. [%] in deinem Segment."

  segment_filter = percentage

  # Calculate SAM
  ai: "SAM-Berechnung:

       TAM: â‚¬[tam]
       Ã— Geografisch ([region]): [geo_filter]
       Ã— Segment ([segment]): [seg_filter]

       SAM = â‚¬[tam] Ã— [geo] Ã— [seg] = â‚¬[sam]

       Das ist dein ERREICHBARER Markt."

WILL (SOM Calculation - CRITICAL):
  ai: "SOM = Was du REALISTISCH gewinnst.

       BA-Regel: <5% Marktanteil fÃ¼r neue Anbieter

       Wir rechnen BOTTOM-UP (bevorzugt):

       Jahr 1: Wie viele Kunden realistisch?"

  [User estimates]

  ai: "â‚¬-Wert pro Kunde durchschnittlich?"

  [User estimates based on offering]

  ai: "Jahr 1:
       [N] Kunden Ã— â‚¬[X]/Kunde = â‚¬[SOM_Y1]

       Jahr 2: Wachstum realistisch?"

  [User estimates growth]

  ai: "Jahr 3:
       [N] Kunden Ã— â‚¬[X]/Kunde = â‚¬[SOM_Y3]

       VALIDIERUNG:

       SOM Jahr 3: â‚¬[som_y3]
       SAM: â‚¬[sam]
       Marktanteil: â‚¬[som] / â‚¬[sam] = [%]

       Status: [% < 5% ? 'âœ… Realistisch' : 'âš ï¸ Zu optimistisch']"

  # If unrealistic (>5%)
  if market_share > 5%:
    # ACTIVATE MI (adjust expectations)
    ai: "[%] Marktanteil in 3 Jahren ist sehr ambitioniert.

         Amazon hat ~40% nach 25 Jahren.
         Du planst [%] nach 3 Jahren.

         Lass uns die Zahlen anpassen."

    [Run MI Pattern 3: Unrealistic SOM]

  # Cross-validate with finance module inputs
  ai: "PrÃ¼fung gegen deine Kosten:

       Aus Modul 3:
       - Fixkosten: â‚¬[X]/Monat
       - Privatentnahme: â‚¬[Y]/Monat
       - NÃ¶tig: â‚¬[(X+Y)*12]/Jahr

       Dein SOM Jahr 3: â‚¬[som_y3]

       Status: [som_y3 >= costs ? 'âœ… Ausreichend' : 'âš ï¸ Zu niedrig']"

  if som_y3 < yearly_costs:
    ai: "âš ï¸ Problem: SOM reicht nicht fÃ¼r Kosten.

         Optionen:
         A) HÃ¶here Preise (mehr â‚¬ pro Kunde)
         B) Mehr Kunden (grÃ¶ÃŸerer Markt, mehr Akquise)
         C) Kosten senken (Teilzeit, gÃ¼nstigerer Standort)

         Was ist machbar?"

    [User explores options with MI support]
```

**Output:**

- `targetMarket.tam` (with calculation + sources)
- `targetMarket.sam` (with filters + sources)
- `targetMarket.som` (Year 1-3, bottom-up calc)
- Validation flags (realistic market share, covers costs)

---

### Phase 3: Competitive Analysis (30 minutes)

**Goal:** Find and analyze 5-8 competitors in depth

**GROW Structure with Active Competitor Research:**

```yaml
GOAL:
  ai: "Jetzt Wettbewerbsanalyse.

       Ziel: 5-8 direkte Konkurrenten finden und analysieren.

       Aus Modul 2 hattest du bereits [N] genannt:
       - [Competitor 1]
       - [Competitor 2]
       - [Competitor 3]

       Lass uns weitere finden und ALLE detailliert analysieren."

REALITY (Competitor Discovery):
  # WEB RESEARCH BLOCK 3: Find Competitors
  ai: "Ich suche jetzt aktiv nach Wettbewerbern:

       [Performing searches...]"

  searches:
    - "[user's service] [user's city]"
    - "[user's service] [broader region]"
    - "Google Maps: [service] in [location]"
    - "[target audience problem] LÃ¶sung [region]"
    - "site:linkedin.com [service] [region]"

  ai: "Gefunden: [N] potenzielle Wettbewerber

       Top 8 nach Relevanz:
       1. [Name] - [URL]
       2. [Name] - [URL]
       ...
       8. [Name] - [URL]

       Kennst du einige davon?"

  [User reviews list]

  # If user says "Aber die machen was anderes"
  if user_challenges:
    ai: "Interessant. Lass uns genauer schauen:

         [Competitor X] macht:
         [Scrape website for offering description]

         Du machst:
         [User's offering from module 2]

         Unterschied:
         [Identify specific differences]

         Das SIND Wettbewerber, aber mit anderem Fokus.
         Genau das brauchst du - Differenzierung!"

OPTIONS (Competitive Analysis):
  ai: "FÃ¼r jeden Wettbewerber analysieren wir:

       1. Angebot
       2. Zielgruppe
       3. Preise (wenn sichtbar)
       4. StÃ¤rken
       5. SchwÃ¤chen
       6. Was machst DU besser

       Lass uns starten mit [Competitor 1]:"

  # For each competitor (iterate)
  for competitor in top_competitors:
    ai: "[Competitor name]
         Website: [URL]

         [If website accessible via web_fetch:]

         Ich analysiere deren Website:

         Angebot:
         [Extract services/products]

         Zielgruppe:
         [Infer from content]

         Positionierung:
         [Premium/Mid/Budget based on language]

         Was sind deren StÃ¤rken?"

    [User input or infer from web]

    ai: "Und SchwÃ¤chen?"

    [User input]

    ai: "Was machst DU konkret besser als [Competitor]?"

    [User explains differentiation]

    # VALIDATE differentiation (CBC)
    ai: "Du sagst '[differentiation]'.

         KÃ¶nnen Kunden das sehen/Ã¼berprÃ¼fen?
         Wie beweist du das?"

    [User provides proof]

  # After analyzing all competitors
  ai: "Muster erkannt:

       Alle [N] Wettbewerber haben gemeinsam:
       - [Common trait 1]
       - [Common trait 2]

       DU machst anders:
       - [User's differentiation]

       Das ist deine Nische!"

WILL (Competitive Positioning):
  # Porter's 5 Forces (Simplified)
  ai: "Branchen-AttraktivitÃ¤t nach Porter:

       1. WettbewerbsintensitÃ¤t
          [N] direkte Konkurrenten in [region]
          Bewertung: [Hoch/Mittel/Niedrig]

       2. Neue Anbieter
          Eintrittsbarrieren: [Licensing, Capital, etc.]
          Bewertung: [Easy/Medium/Hard]

       3. Kundenmacht
          Wechselkosten: [Low/Medium/High]
          Bewertung: [Buyers have power level]

       4. Lieferantenmacht
          AbhÃ¤ngigkeit: [Assessment]
          Bewertung: [Suppliers have power level]

       5. Substitute Produkte
          Alternativen: [DIY, In-house, etc.]
          Bewertung: [Threat level]

       GESAMT: Branche ist [Attraktiv/Neutral/Unattraktiv]"

  # Positioning Matrix
  ai: "Positionierung visualisiert:

            Hoher Preis
                 â”‚
       Premium   â”‚   Premium
       Generalistâ”‚   Spezialist
                 â”‚
       Breit â”€â”€â”€â”€â”¼â”€â”€â”€â”€ Spezialisiert
                 â”‚
       Budget    â”‚   Nischen-
       Generalistâ”‚   Anbieter
                 â”‚
            Niedriger Preis

       Wettbewerber:
       [C1]: [Quadrant]
       [C2]: [Quadrant]
       [C3]: [Quadrant]

       DU (aus Modul 2 USP):
       [User's quadrant based on USP category + pricing]

       Siehst du dich hier richtig positioniert?"
```

**Output:**

- `competition.directCompetitors` (5-8 with full analysis)
- `competition.intensity` (Porter's 5 Forces)
- `positioning.quadrant` (with justification)
- `positioning.differentiation` (primary + secondary + proof)

---

### Phase 4: Market Gaps & Risk Assessment (15 minutes)

**Goal:** Identify opportunities and threats

**GROW Structure:**

```yaml
GOAL:
  ai: "AbschlieÃŸend: Chancen und Risiken.

       Wo sind LÃ¼cken, die du nutzen kannst?
       Welche Bedrohungen siehst du?"

REALITY:
  ai: "Schau nochmal alle [N] Wettbewerber an.

       Was macht KEINER von ihnen?
       Was frustriert Kunden an der aktuellen LÃ¶sung?"

  [User identifies gaps from research]

OPTIONS:
  ai: "Gefundene MarktlÃ¼cken:
       - [Gap 1]
       - [Gap 2]
       - [Gap 3]

       Welche davon kannst DU fÃ¼llen mit deinem Angebot?"

  [User selects opportunities]

  # Risk Assessment
  ai: "Jetzt Risiken:

       Wettbewerbsrisiken:
       - Neue Anbieter kÃ¶nnten eintreten
       - Bestehende kÃ¶nnten dein USP kopieren
       - Preiskampf mÃ¶glich

       Welche Risiken siehst du als real?"

  [User identifies threats]

WILL:
  ai: "FÃ¼r jedes Risiko: Wie begegnest du dem?

       Risiko: [Threat]
       Mitigation: [User's strategy]

       Risiko: [Threat]
       Mitigation: [User's strategy]"
```

**Output:**

- `competition.marketGaps` (opportunities)
- `positioning.riskAssessment` (threats + mitigations)

---

## Validation & Module Completion

### BA Compliance Checklist

```yaml
validation_gates:
  industry_data_sourced:
    check: 'At least 3 industry statistics with sources?'
    gate_type: BLOCKER
    reason: 'BA requires verifiable data'

  tam_sam_som_calculated:
    check: 'All three market levels calculated with sources?'
    gate_type: BLOCKER
    reason: 'Market quantification required'

  som_realistic:
    check: 'SOM Year 3 <5% of SAM?'
    gate_type: WARNING
    reason: 'High market share raises BA skepticism'

  som_covers_costs:
    check: 'SOM Year 3 â‰¥ (Fixed costs + Private Entnahme)?'
    gate_type: BLOCKER
    reason: 'Business must be viable'

  competitors_analyzed:
    check: 'â‰¥3 competitors with detailed analysis?'
    gate_type: BLOCKER
    reason: 'BA requires competitive awareness'

  differentiation_clear:
    check: 'User advantage vs. each competitor documented?'
    gate_type: BLOCKER
    reason: 'Must show how you win'

  positioning_defined:
    check: 'Price/specialization quadrant clear?'
    gate_type: WARNING
    reason: 'Helps BA understand strategy'

  all_sources_documented:
    check: 'Every statistic has source URL + date?'
    gate_type: BLOCKER
    reason: 'TragfÃ¤higkeitsbescheinigung requirement'
```

### Module Summary Generation

```yaml
ai:
  "â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”
  ðŸ“‹ MARKT- & WETTBEWERBSANALYSE ZUSAMMENFASSUNG
  â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”

  BRANCHE:
  â€¢ Name: [industry.name]
  â€¢ Marktvolumen: â‚¬[X] Mrd. (Quelle: [source])
  â€¢ Wachstum: [Y]% p.a.
  â€¢ Trends: [3 key trends]
  â€¢ AttraktivitÃ¤t: [High/Medium/Low]

  ZIELMARKT:
  â€¢ TAM (Deutschland): â‚¬[tam]
  â€¢ SAM (erreichbar): â‚¬[sam]
  â€¢ SOM Jahr 1: â‚¬[som_y1]
  â€¢ SOM Jahr 3: â‚¬[som_y3]
  â€¢ Marktanteil Jahr 3: [%] [âœ… Realistisch / âš ï¸ Optimistisch]
  â€¢ Deckt Kosten: [âœ… Ja / âš ï¸ Knapp / âŒ Nein]

  WETTBEWERB:
  â€¢ Direkte Konkurrenten analysiert: [N]
  â€¢ WettbewerbsintensitÃ¤t: [High/Medium/Low]
  â€¢ Hauptwettbewerber: [Top 3 names]
  â€¢ MarktlÃ¼cken gefunden: [N]

  POSITIONIERUNG:
  â€¢ Quadrant: [User's positioning]
  â€¢ Hauptdifferenzierung: [Primary differentiator]
  â€¢ USP aus Modul 2 validiert: [âœ…/âš ï¸]

  QUELLEN:
  â€¢ Dokumentiert: [N] Quellen
  â€¢ Tier 1 (Destatis, Statista): [N]
  â€¢ Tier 2 (BranchenverbÃ¤nde): [N]
  â€¢ Tier 3 (Sonstige): [N]

  â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”

  Status: [validation.readyForNextModule ? 'READY âœ…' : 'NEEDS WORK âš ï¸']

  [If blockers exist]
  Noch zu klÃ¤ren:
  - [validation.blockers]

  [If warnings exist]
  Hinweise:
  - [validation.warnings]

  [If ready]
  NÃ¤chstes Modul: Marketing-Strategie
  Dort entwickeln wir: Marketing-Mix (4Ps), Akquise-Funnel,
  KanÃ¤le, Budget basierend auf deiner Positionierung

  Bereit weiterzumachen?"
```

---

## Error Recovery & Edge Cases

### Scenario 1: No Market Data Found

**Problem:** Web search returns no usable statistics

```yaml
signs:
  - Multiple searches yield no tier 1/2 sources
  - Industry too niche or new
  - User's industry definition too specific

response:
  ai: "Ich finde keine direkten Marktdaten fÃ¼r
       '[user's specific industry]'.

       Das kann passieren bei sehr spezifischen Nischen.

       Optionen:

       A) Branche breiter definieren
          Statt: 'AI-Coaching fÃ¼r SaaS-GrÃ¼nder'
          Nutze: 'Business Coaching' (breitere Daten)
          Dann: Eingrenzung erklÃ¤ren im Businessplan

       B) Verwandte Branchen als Proxy
          '[Related industry]' hat Ã¤hnliche Charakteristiken
          Nutze deren Daten mit ErklÃ¤rung

       C) PrimÃ¤rforschung dokumentieren
          Eigene Umfrage bei [N] potenziellen Kunden
          Hochrechnung von kleiner Stichprobe

       Was machbar fÃ¼r dich?"

  [User chooses approach]

  if user_chooses_A:
    ai: "Ok, wir definieren breiter und grenzen spÃ¤ter ein.

         Das ist BA-konform, wenn du erklÃ¤rst:
         'Gesamtmarkt [broad]: â‚¬[X]
          Mein Segment davon: â‚¬[Y] (weil [reasoning])'"
```

### Scenario 2: Market Too Small for Goals

**Problem:** SOM calculation shows revenue won't cover costs

```yaml
# Already covered in Phase 2, but emphasizing recovery:

trigger:
  som_year3 < (fixed_costs + private_entnahme)

response (MI Pattern):
  ai: "âš ï¸ Kritisches Problem entdeckt:

       SOM Jahr 3: â‚¬[som]
       NÃ¶tig fÃ¼r Kosten: â‚¬[costs]
       Differenz: -â‚¬[gap]

       Ehrlich gesagt: In diesem Markt mit diesem Angebot
       wird es sehr schwierig.

       Ich sehe 4 Wege:

       A) PIVOT: Andere Zielgruppe (grÃ¶ÃŸerer Markt)
       B) EXPAND: Zusatz-Services (mehr â‚¬ pro Kunde)
       C) SCALE: Bundesweit statt regional (grÃ¶ÃŸerer SAM)
       D) ADJUST: Teilzeit statt Vollzeit (niedrigere Kosten)

       Was ist ehrlich realistisch?"

  [User explores with MI support]

  # If no solution feasible
  if no_viable_path:
    ai: "Das ist hart zu hÃ¶ren, aber:
         Besser jetzt erkennen als nach 6 Monaten und â‚¬10k.

         Deine FÃ¤higkeiten sind wertvoll.
         Lass uns zurÃ¼ck zu GeschÃ¤ftsmodell und eine
         tragfÃ¤hige Variante finden.

         Oder mÃ¶chtest du erstmal pausieren und Ã¼berdenken?"
```

### Scenario 3: User Rejects Competitor Analysis

**Problem:** User insists "Das sind keine echten Wettbewerber"

```yaml
user: "Die machen alle was anderes. Keine echte Konkurrenz."

response (CBC Pattern):
  ai: "Lass uns das systematisch prÃ¼fen.

       [Competitor 1]:
       - LÃ¶st Problem: [X]
       - FÃ¼r Zielgruppe: [Y]

       DU:
       - LÃ¶st Problem: [X']
       - FÃ¼r Zielgruppe: [Y']

       Ãœberlappung:
       - Problem: [Similarity %]
       - Zielgruppe: [Similarity %]

       Wenn >50% Ãœberlappung: Das SIND Wettbewerber.

       Unterschied ist dein USP, nicht Grund zu leugnen."

  # If user still resists
  ai: "BA-Perspektive:

       Wenn du schreibst 'Keine Konkurrenz',
       denkt BA: 'Kein Markt' oder 'Naive Analyse'.

       Besser: 'X Wettbewerber existieren, aber
       ich differenziere mich durch [Y]'

       Das zeigt MarktverstÃ¤ndnis."
```

### Scenario 4: Sources Not BA-Quality

**Problem:** Only tier 3 sources (blogs, forums) found

```yaml
ai: "Ich habe Daten gefunden, aber hauptsÃ¤chlich
     von Blogs und Foren.

     BA bevorzugt:
     - Tier 1: Destatis, Statista, Bundesministerien
     - Tier 2: IHK, BranchenverbÃ¤nde

     Wir haben nur Tier 3 (Blogs).

     Optionen:

     A) Breitere Suche (andere Keywords)
     B) Englische Quellen nutzen (z.B. Eurostat)
     C) Mit Tier 3 arbeiten + Limitationen erwÃ¤hnen

     Was probieren wir?"

  [Try broader search first]

  if still_no_tier1_tier2:
    ai: "Ok, wir arbeiten mit verfÃ¼gbaren Quellen.

         Im Businessplan schreiben wir:
         'Aufgrund der Nische existieren keine
          offiziellen Statistiken. SchÃ¤tzungen
          basieren auf [methodology] mit Quellen [X,Y,Z].'

         Das ist ehrlich und BA akzeptiert das bei
         echten Nischen."
```

---

## Success Criteria

### Module Complete When:

```yaml
required:
  - âœ… Industry described with â‰¥3 statistics (with sources)
  - âœ… TAM calculated with source
  - âœ… SAM calculated with clear filters
  - âœ… SOM calculated for Years 1-3 (bottom-up method)
  - âœ… SOM realistic (<5% market share typically)
  - âœ… SOM covers costs (cross-validation with module 3)
  - âœ… â‰¥3 competitors analyzed in depth
  - âœ… User advantage vs each competitor documented
  - âœ… Positioning defined (price/specialization matrix)
  - âœ… All sources documented (title, org, URL, date)
  - âœ… validation.readyForNextModule === true

optional_but_recommended:
  - âœ… 5-8 competitors analyzed (not just 3)
  - âœ… Tier 1 sources for major statistics
  - âœ… Market trends analyzed (3-5)
  - âœ… Porter's 5 Forces completed

coaching_quality:
  - âœ… MI used when data disappoints (â‰¥1 instance)
  - âœ… CBC used for unfounded claims (â‰¥2 instances)
  - âœ… User owns adjusted expectations
  - âœ… Web research performed (â‰¥10 searches)
  - âœ… Sources properly documented
  - âœ… No unresolved blockers
```

### Handoff to Next Module

```yaml
# Data passed to gz-module-05-marketing

passed_to_marketing:
  - targetMarket.som (revenue targets for Year 1-3)
  - competition.directCompetitors (for competitive marketing)
  - positioning.quadrant (informs pricing + messaging)
  - positioning.differentiation (marketing copy basis)
  - competition.marketGaps (marketing opportunities)
  - targetAudience.primaryPersona.behavior.informationSources (channel selection)

# Data passed to gz-module-06-finance

passed_to_finance:
  - targetMarket.som.year1/2/3 (revenue projections)
  - targetMarket.som.bottomUpCalc (customer count + avg revenue)
  - Validation that SOM covers costs

# Data stored for document generation

stored_for_document:
  - Full competitive analysis table
  - Source bibliography
  - TAM/SAM/SOM pyramid graphic
  - Positioning matrix
```

---

## Coaching Effectiveness Metrics

Track per conversation:

```typescript
interface CoachingMetrics {
  // MI Effectiveness
  disappointments_handled: number; // Data â‰  expectations
  expectations_adjusted: boolean; // User accepted reality
  user_found_solutions: boolean; // Not coach dictating
  motivation_maintained: boolean; // User didn't give up

  // CBC Effectiveness
  unfounded_claims_challenged: number; // "No competition" etc.
  evidence_gathered: number; // Web searches performed
  assumptions_validated: boolean; // Data backed claims

  // Web Research Quality
  searches_performed: number; // Target: â‰¥10
  tier1_sources_found: number; // Destatis, Statista
  tier2_sources_found: number; // IHK, associations
  total_sources_documented: number; // Target: â‰¥5

  // Data Quality
  tam_sam_som_sourced: boolean; // All with sources
  competitor_analysis_depth: number; // Avg fields per competitor

  // Core Patterns
  grow_structure_followed: boolean;
  reflective_summaries: number;

  // User Experience
  reality_checks_handled: number; // How many hard truths
  user_confidence_end: 1-10; // Despite reality checks
  time_to_complete: number; // Target: 90 minutes

  // Module Quality
  ba_compliance_score: number; // Target: 100%
  blockers_at_end: number; // Target: 0
}
```

---

## Testing Strategy

### Unit Tests

```typescript
describe('Markt Wettbewerb Module', () => {
  test('MI activates when market smaller than expected', () => {
    const context = {
      userExpectation: 100_000_000,
      researchedValue: 50_000_000,
    };
    const response = handleMarketData(context);
    expect(response.coaching_pattern).toBe('MI-disappointment');
    expect(response.text).toContain('frustrierend');
  });

  test('CBC activates on "keine Konkurrenz" claim', () => {
    const input = 'Es gibt keine direkten Wettbewerber';
    const response = processInput(input, context);
    expect(response.coaching_pattern).toBe('CBC-evidence-gathering');
    expect(response.action).toBe('web_search');
  });

  test('SOM validation flags unrealistic market share', () => {
    const data = {
      sam: 10_000_000,
      som_year3: 800_000, // 8% market share
    };
    const validation = validateSOM(data);
    expect(validation.isRealistic).toBe(false);
    expect(validation.warning).toContain('5%');
  });

  test('Source documentation required for all statistics', () => {
    const industry = {
      statistics: {
        marketVolume: { value: 100, source: null },
      },
    };
    const validation = validateModule(industry);
    expect(validation.ready).toBe(false);
    expect(validation.blockers).toContain('missing_sources');
  });

  test('Cross-validation with finance costs', () => {
    const market = { som_year3: 50_000 };
    const costs = { yearly_total: 60_000 };
    const validation = crossValidateViability(market, costs);
    expect(validation.viable).toBe(false);
    expect(validation.gap).toBe(-10_000);
  });
});
```

### Integration Tests

```typescript
describe('Markt Wettbewerb Integration', () => {
  test('Consumes geschaeftsmodell data correctly', () => {
    const intake = createMockIntakeOutput();
    const geschaeftsmodell = createMockGeschaeftsmodellOutput();
    const context = initModule(intake, geschaeftsmodell);

    expect(context.targetAudience).toBeDefined();
    expect(context.initialCompetitors.length).toBeGreaterThan(0);
  });

  test('Web research integration works', async () => {
    const query = 'IT-Beratung Marktvolumen Deutschland';
    const results = await performWebSearch(query);
    expect(results.length).toBeGreaterThan(0);
    expect(results[0]).toHaveProperty('url');
  });

  test('Passes validated data to marketing module', () => {
    const output = createMockMarktOutput();
    const marketingInput = transformForMarketing(output);

    expect(marketingInput.revenueTargets).toBeDefined();
    expect(marketingInput.positioning).toBeDefined();
    expect(marketingInput.competitors).toBeDefined();
  });

  test('Passes validated data to finance module', () => {
    const output = createMockMarktOutput();
    const financeInput = transformForFinance(output);

    expect(financeInput.revenue.year1).toBe(output.targetMarket.som.year1);
    expect(financeInput.revenue.year3).toBe(output.targetMarket.som.year3);
  });
});
```

### E2E Test Scenarios

```typescript
describe('Markt Wettbewerb E2E', () => {
  test('Complete happy path: IT consultant', async () => {
    const persona = createTestPersona('IT-consultant');
    const result = await runModuleConversation(persona);

    expect(result.completed).toBe(true);
    expect(result.industry.statistics.marketVolume.source).toBeDefined();
    expect(result.targetMarket.som.year3).toBeLessThan(
      result.targetMarket.sam.value * 0.05
    ); // <5% market share
    expect(result.competition.directCompetitors.length).toBeGreaterThanOrEqual(
      3
    );
    expect(result.sources.length).toBeGreaterThanOrEqual(5);
    expect(result.validation.readyForNextModule).toBe(true);
  });

  test('MI pattern: Market disappoints expectations', async () => {
    const persona = createTestPersona('overoptimistic-founder');
    persona.expectedMarket = 500_000_000;
    const result = await runModuleConversation(persona);

    expect(result.metadata.coachingPatternsUsed).toContain('MI');
    expect(result.metadata.disappointments_handled).toBeGreaterThan(0);
    expect(result.targetMarket.tam.value).toBeLessThan(500_000_000);
    // But user still completed module
    expect(result.validation.readyForNextModule).toBe(true);
  });

  test('CBC pattern: No competition claim challenged', async () => {
    const persona = createTestPersona('naive-founder');
    persona.competitorClaim = 'keine Konkurrenz';
    const result = await runModuleConversation(persona);

    expect(result.metadata.coachingPatternsUsed).toContain('CBC');
    expect(result.metadata.unfounded_claims_challenged).toBeGreaterThan(0);
    expect(result.competition.directCompetitors.length).toBeGreaterThan(0);
  });

  test('Web research: Tier 1 sources found', async () => {
    const persona = createTestPersona('established-industry');
    const result = await runModuleConversation(persona);

    const tier1Count = result.sources.filter((s) => s.tier === 'tier1').length;
    expect(tier1Count).toBeGreaterThan(0);
    expect(result.metadata.searches_performed).toBeGreaterThanOrEqual(10);
  });

  test('Cross-validation: SOM covers costs', async () => {
    const persona = createTestPersona('viable-business');
    const unternehmen = createMockUnternehmenOutput();
    const result = await runModuleConversation(persona, { unternehmen });

    expect(result.validation.somCoversNotes).toBe(true);
    expect(result.targetMarket.som.year3).toBeGreaterThan(
      unternehmen.totalYearlyCosts
    );
  });

  test('Source documentation complete', async () => {
    const persona = createTestPersona('generic-consultant');
    const result = await runModuleConversation(persona);

    expect(result.validation.allSourcesDocumented).toBe(true);

    // Every statistic should have source
    expect(result.industry.statistics.marketVolume.source).toBeDefined();
    expect(result.targetMarket.tam.sources.length).toBeGreaterThan(0);

    // Source bibliography complete
    result.sources.forEach((source) => {
      expect(source.url).toBeDefined();
      expect(source.accessDate).toBeDefined();
      expect(source.usedFor.length).toBeGreaterThan(0);
    });
  });
});
```

---

**END OF gz-module-04-markt-wettbewerb STREAMLINED**

**Next Module:** gz-module-05-marketing (Marketing Strategy)
