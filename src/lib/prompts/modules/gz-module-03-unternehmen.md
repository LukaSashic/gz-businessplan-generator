---
name: gz-module-03-unternehmen
version: 2.0
description: Company structure module for GZ workshop. Guides through UnternehmensfÃ¼hrung, Partner, GrÃ¼ndungsvoraussetzungen, Rechtsform selection, Versicherungen, and Standortanalyse (business type dependent). Duration 45 minutes. Output organizational and legal structure.
dependencies:
  - gz-system-coaching-core (GROW, Socratic, Clean Language)
  - gz-coaching-sdt (autonomy in technical decisions, reduce overwhelm)
  - gz-coaching-cbc (optional, if decision paralysis detected)
  - gz-module-01-intake (business type, founder profile, ALG status)
  - gz-module-02-geschaeftsmodell (offering, target audience for classification)
---

# Module 03: Unternehmen (Company Structure)

**Duration:** 45 minutes  
**Critical Path:** Yes (feeds cost data to finance module)  
**Complexity:** Medium (technical but guidable)  
**Coaching Load:** SDT (primary), CBC (conditional)

---

## Purpose

Establish organizational and legal structure with:

1. **UnternehmensfÃ¼hrung** (management structure, time allocation)
2. **Partnerschaften** (co-founders, cooperations if applicable)
3. **GrÃ¼ndungsvoraussetzungen** (permits, qualifications, registrations)
4. **Rechtsform** (legal form with justification)
5. **Versicherungen** (required and recommended insurance)
6. **Standortanalyse** (location analysis if business type relevant)

**BA Rejection Reasons (Module 03):**

- Rechtsform not justified
- Missing required permits/qualifications
- Pflichtversicherungen not planned
- Insurance/location costs missing from budget
- <15 hours/week time allocation (GZ requirement violated)

---

## Module Structure

### Input Requirements

```typescript
// From gz-module-01-intake
interface IntakeInput {
  founder: {
    currentStatus: 'employed' | 'unemployed' | 'other';
    algStatus?: {
      monthlyAmount: number;
      daysRemaining: number;
    };
    experience: {
      yearsInIndustry: number;
      relevantRoles: string[];
    };
    qualifications: {
      education: string;
      certifications: string[];
      specialSkills: string[];
    };
  };
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
  };
}

// From gz-module-02-geschaeftsmodell
interface GeschaeftsmodellInput {
  offering: {
    mainOffering: string;
    deliveryFormat: 'physical' | 'digital' | 'service' | 'hybrid';
  };
  targetAudience: {
    primaryPersona: {
      firmographics?: {
        industry: string;
      };
    };
  };
}
```

### Output Schema

```typescript
interface UnternehmenOutput {
  // Management Structure
  management: {
    structure: 'solo' | 'partnership' | 'team';
    mainResponsible: string; // Founder name (from intake)
    weeklyHours: number; // Must be â‰¥15 for GZ eligibility
    coreResponsibilities: string[]; // What founder does personally
    outsourced: Array<{
      task: string;
      provider: string; // e.g., "Steuerberater", "VA"
      estimatedCost: number; // Monthly
    }>;
    supportNetwork: string[]; // Family, mentors who can help
  };

  // Partners (if applicable)
  partners?: {
    hasPartners: boolean;
    coFounders?: Array<{
      name: string;
      contribution: 'capital' | 'expertise' | 'both';
      equity: number; // Percentage
      role: string;
    }>;
    cooperationPartners?: Array<{
      name: string;
      type: 'supplier' | 'distributor' | 'strategic_alliance';
      description: string;
    }>;
    partnershipAgreement: boolean; // Formal contract exists?
    keyDecisionsDocumented: boolean; // Exit, profit split, etc.
  };

  // Legal Requirements
  legalRequirements: {
    classification: 'freiberufler' | 'gewerbe'; // Â§18 EStG
    gewerbeanmeldung: {
      required: boolean;
      date?: string; // ISO date when filed/planned
      location: string; // Gewerbeamt location
    };

    // Required Qualifications
    qualifications: {
      meisterpflicht?: boolean; // Master craftsman required
      berufserlaubnis?: boolean; // Professional license (doctors, lawyers)
      sachkundenachweis?: boolean; // Competence certificate (security, etc.)
      other?: string[];
    };

    // Permits & Registrations
    permits: {
      behoerdlich?: Array<{ // Government permits
        type: string; // e.g., "GaststÃ¤ttenerlaubnis"
        status: 'obtained' | 'pending' | 'not_started';
        expectedDate?: string;
      }>;
      konzession?: string; // Special license (taxi, etc.)
      gesundheitszeugnis?: boolean; // Health certificate (food)
    };

    // Mandatory Registrations
    registrations: {
      finanzamt: {
        completed: boolean;
        fragebogenDate?: string;
      };
      ihkHwk: {
        required: boolean;
        type?: 'IHK' | 'HWK';
        estimatedYearlyCost: number;
      };
      berufsgenossenschaft: {
        required: boolean; // Always true for self-employed
        type?: string;
        estimatedYearlyCost: number;
      };
      handelsregister?: {
        required: boolean; // For Kaufleute, Kapitalgesellschaften
        cost?: number;
      };
    };

    allRequirementsMet: boolean;
    openIssues: string[]; // What's still missing
  };

  // Legal Form
  legalForm: {
    chosen: 'einzelunternehmen' | 'gbr' | 'ug' | 'gmbh' | 'other';
    reasoning: string[]; // Why this form (4-5 bullet points)

    characteristics: {
      founders: number; // 1 for Einzelunternehmen, 2+ for GbR
      stammkapital: number; // 0 for Einzelunternehmen/GbR, 1+ for UG, 25000 for GmbH
      liability: 'unlimited' | 'limited';
      accounting: 'EÃœR' | 'bilanz'; // EinnahmenÃ¼berschussrechnung vs Doppelte BuchfÃ¼hrung
      setupCost: number;
      yearlyAccountingCost: number; // Steuerberater estimate
      professionalImage: 'basic' | 'medium' | 'high';
    };

    futureConsideration?: string; // e.g., "Bei Wachstum Umwandlung in GmbH"
  };

  // Insurance
  insurance: {
    // Mandatory for all
    mandatory: {
      krankenversicherung: {
        type: 'GKV_freiwillig' | 'PKV';
        monthlyContribution: number;
        provider: string;
      };
      pflegeversicherung: {
        included: boolean; // Auto with GKV
        monthlyContribution: number;
      };
    };

    // Mandatory by industry
    industryMandatory?: {
      berufshaftpflicht?: {
        required: boolean;
        profession: string; // "Arzt", "Architekt", etc.
        yearlyPremium: number;
      };
      rentenversicherung?: {
        required: boolean;
        profession: string; // "Lehrer", "Pflegekraft"
        monthlyContribution: number;
      };
      vermÃ¶gensschadenhaftpflicht?: {
        required: boolean;
        profession: string;
        yearlyPremium: number;
      };
    };

    // Recommended (prioritized)
    recommended: {
      priority1: Array<{ // Start immediately
        type: string; // e.g., "Betriebshaftpflicht"
        reason: string;
        yearlyPremium: number;
      }>;
      priority2: Array<{ // When budget allows
        type: string;
        reason: string;
        yearlyPremium: number;
      }>;
      later: Array<{ // Consider after Year 1
        type: string;
        reason: string;
      }>;
    };

    totalYearlyCost: number; // Sum of mandatory + priority1
  };

  // Location (conditional on business type)
  location?: {
    relevant: boolean; // Based on businessType.isLocationDependent

    // If relevant
    type?: 'home_office' | 'commercial_space' | 'hybrid';
    address?: string;

    analysis?: {
      // Macro (region)
      region: {
        economicSituation: string;
        purchasingPower: 'low' | 'medium' | 'high';
        population: 'declining' | 'stable' | 'growing';
        infrastructure: 'poor' | 'adequate' | 'excellent';
        gewerbesteuerHebesatz?: number; // Local business tax multiplier
      };

      // Micro (specific location)
      specificLocation?: {
        visibility: 'poor' | 'medium' | 'excellent';
        footTraffic: 'none' | 'low' | 'medium' | 'high';
        accessibility: {
          publicTransport: boolean;
          parking: 'none' | 'limited' | 'ample';
        };
        nearbyCompetition: number; // Count of direct competitors within 1km
        rentPerSqm: number;
        totalSqm: number;
        conditionState: 'move_in_ready' | 'renovation_needed';
        neighborhoodImage: string;
      };

      // If comparing locations
      alternativesConsidered?: Array<{
        name: string;
        pros: string[];
        cons: string[];
        score: number; // 1-10
      }>;

      finalChoice: string;
      justification: string;
    };

    monthlyRent?: number;
    deposit?: number;
    renovationCost?: number;
  };

  // Validation Results
  validation: {
    managementTimeSufficient: boolean; // â‰¥15 hours/week
    partnershipDocumented: boolean; // If partners exist, agreement in place
    allRequirementsMet: boolean; // Permits, qualifications obtained/planned
    legalFormJustified: boolean; // Reasoning provided
    mandatoryInsurancePlanned: boolean; // All mandatory identified
    costsCalculated: boolean; // Insurance + location costs known
    locationRelevanceHandled: boolean; // Either analyzed OR documented as N/A

    readyForNextModule: boolean;
    blockers?: string[]; // What must be fixed
    warnings?: string[]; // Non-blocking issues
  };

  // Module Metadata
  metadata: {
    completedAt: string;
    duration: number;
    decisionsCount: number; // How many decisions user made (SDT autonomy metric)
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
    purpose: GROW structure, Socratic questioning, Clean Language

contextual:
  - gz-coaching-sdt (PRIMARY)
    purpose: Support autonomy in technical decisions, reduce overwhelm
    triggers:
      - Multiple technical options (Rechtsform, Versicherungen)
      - User feels overwhelmed by complexity
      - Decision fatigue from many small choices
    patterns:
      - Autonomy: Offer 2-3 clear options, user chooses
      - Competence: Validate decision reasoning
      - Relatedness: Normalize difficulty, partnership language

  - gz-coaching-cbc (CONDITIONAL)
    purpose: Handle decision paralysis
    triggers:
      - User stuck between options for >3 exchanges
      - User says "Ich weiÃŸ nicht" repeatedly
      - Analysis paralysis detected
```

### Key SDT Patterns in This Module

#### Pattern 1: Rechtsform Decision (Autonomy Support)

```typescript
// User faces 4 legal form options - can be overwhelming

// BAD (Directive):
ai: "FÃ¼r EinzelgrÃ¼ndung ohne Haftungsrisiko nimmst du Einzelunternehmen."

// GOOD (SDT - Autonomy):
ai: "Es gibt mehrere Rechtsformen. Lass uns schauen,
     was zu DEINEN PrioritÃ¤ten passt.

     Was ist dir wichtiger:

     A) Einfachheit + niedrige Kosten
        â†’ Einzelunternehmen (â‚¬0 Start, einfache Buchhaltung)

     B) Haftungsschutz
        â†’ UG (â‚¬300-500 Start, Bilanzpflicht)

     C) Professionelles Image + voller Schutz
        â†’ GmbH (â‚¬25.000 Kapital, â‚¬1.500 Start)

     Was fÃ¼hlt sich richtiger an fÃ¼r dich?"

[User chooses based on own values]

// COMPETENCE VALIDATION (SDT)
ai: "Du hast [X] gewÃ¤hlt, weil dir [reason] wichtig ist.
     Das ist eine durchdachte Entscheidung.

     FÃ¼r dein Business ([offering type], [target audience])
     macht das Sinn, weil [connection to their context]."

â†’ User owns decision, feels competent
```

#### Pattern 2: Insurance Overwhelm (Decision Clustering)

```typescript
// Problem: 10+ insurance types mentioned - user overwhelmed

// BAD (Information Dump):
ai: "Du brauchst: Kranken-, Pflege-, Haftpflicht-, Betriebs-,
     BerufsunfÃ¤higkeits-, Rechtsschutz-, Cyber-Versicherung..."

[User shuts down]

// GOOD (SDT - Reduce Cognitive Load):
ai: "Versicherungen kÃ¶nnen Ã¼berwÃ¤ltigend sein.
     Die meisten GrÃ¼nder fÃ¼hlen sich hier so. [RELATEDNESS]

     Lass uns das in 3 Gruppen teilen:

     GRUPPE 1: PFLICHT (mÃ¼ssen sofort)
     - Krankenversicherung
     - Pflegeversicherung
     [User's industry: + Berufshaftpflicht]

     GRUPPE 2: PRIORITÃ„T (stark empfohlen zum Start)
     - Betriebshaftpflicht (â‚¬150-500/Jahr)

     GRUPPE 3: SPÃ„TER (wenn Budget erlaubt)
     - BerufsunfÃ¤higkeit
     - Rechtsschutz
     - Cyber

     Heute klÃ¤ren wir nur GRUPPE 1+2.
     Gruppe 3 merkst du dir fÃ¼r spÃ¤ter.

     Ist dir das angenehmer?" [AUTONOMY - user approves approach]

[User: "Ja, viel besser"]

// COMPETENCE
ai: "Super. Du hast das System verstanden:
     Pflicht â†’ PrioritÃ¤t â†’ SpÃ¤ter.

     Das zeigt, du kannst priorisieren." [VALIDATION]
```

#### Pattern 3: Location Decision (Multiple Factors)

```typescript
// Multiple location factors can cause analysis paralysis

// BAD (Overwhelming Matrix):
ai: "Bewerte jeden Standort auf 15 Kriterien: Lage, Miete,
     FlÃ¤che, ParkplÃ¤tze, Ã–PNV, Konkurrenz, Laufkundschaft..."

[User overwhelmed]

// GOOD (SDT - User-Defined Priorities):
ai: "FÃ¼r die Standortwahl gibt es viele Faktoren.

     Lass uns mit DEINEN Top 3 starten. [AUTONOMY]

     Was sind die 3 wichtigsten Dinge fÃ¼r deinen Standort?"

[User defines own criteria, e.g.: "Miete, Erreichbarkeit, Laufkundschaft"]

ai: "Ok, deine Top 3:
     1. Miete (weil Budget knapp)
     2. Erreichbarkeit (weil Kunden zu dir kommen)
     3. Laufkundschaft (weil ImpulskÃ¤ufe wichtig)

     Lass uns die 2 Standorte nur auf DIESE 3 vergleichen."

// Simplified Matrix
ai: "              | Standort A | Standort B |
     Miete (â‚¬/m)  |    â‚¬20     |    â‚¬15     |
     Erreichbar   |   Sehr gut |   Mittel   |
     Laufkunden   |    Hoch    |   Niedrig  |

     Basierend auf DEINEN PrioritÃ¤ten - welcher gewinnt?"

[User decides]

// COMPETENCE
ai: "Du hast [X] gewÃ¤hlt trotz hÃ¶herer Miete,
     weil Erreichbarkeit und Laufkundschaft dir wichtiger sind.

     Das ist strategisches Denken! [VALIDATION]
     Du investierst mehr in Miete, sparst aber bei Marketing
     durch Laufkundschaft."

â†’ User feels smart about decision
```

### When to Activate CBC (Decision Paralysis)

```typescript
// Trigger: User stuck between options, can't decide

user: "Ich weiÃŸ nicht, ob Einzelunternehmen oder UG..."
[3 exchanges later]
user: "Ich kann mich nicht entscheiden."

// CBC Response (NOT SDT here - different tool needed)

// 1. IDENTIFY the block
ai: "Du schwankst zwischen beiden. Was hÃ¤lt dich zurÃ¼ck?"

[User: "Angst die falsche Wahl zu treffen"]

// 2. EVIDENCE gathering
ai: "Lass uns konkret schauen:

     Worst Case Einzelunternehmen:
     - Haftungsrisiko: Wie hoch ist das in deinem Business?
       [User: "Gering, ich berate nur"]

     Worst Case UG:
     - â‚¬300 mehr Kosten + komplexe Buchhaltung

     Welches Worst Case ist schlimmer?"

[User: "â‚¬300 sind knapp, Haftungsrisiko ist gering"]

// 3. CHALLENGE assumption
ai: "Du sagst 'Angst vor falscher Wahl'.
     Aber beide Wahlen sind reversibel!

     - Einzelunternehmen â†’ spÃ¤ter UG: MÃ¶glich fÃ¼r ~â‚¬500
     - UG â†’ GmbH: MÃ¶glich

     Es gibt kein 'falsch', nur 'jetzt passend'.

     Was passt fÃ¼r JETZT besser?"

// 4. REFRAME
ai: "Vielleicht ist es nicht:
     'Richtig vs. Falsch'

     Sondern:
     'Start einfach/gÃ¼nstig (Einzelunternehmen)
      vs. Start mit Schutz/Image (UG)'

     FÃ¼r deine Situation [low risk, tight budget],
     was macht mehr Sinn?"

[User: "Einfach starten, spÃ¤ter upgraden wenn nÃ¶tig"]

// 5. ACTION
ai: "Perfekt! Einzelunternehmen zum Start.
     Du kannst jederzeit Ã¤ndern wenn Business wÃ¤chst.

     Das ist pragmatisch." [VALIDATE]

â†’ Decision paralysis broken
```

---

## Conversation Flow

### Phase 1: Management Structure (8 minutes)

**Goal:** Establish who does what, time allocation

**GROW Structure:**

```yaml
GOAL:
  ai: "In diesem Modul klÃ¤ren wir die Struktur deines Unternehmens.

       Heute schaffen wir:
       - Zeitinvestition festlegen (mind. 15h/Woche fÃ¼r GZ)
       - Partner klÃ¤ren (wenn relevant)
       - Rechtsform wÃ¤hlen
       - Versicherungen planen
       - Standort analysieren (wenn nÃ¶tig)

       Dauer: ca. 45 Minuten

       Lass uns mit UnternehmensfÃ¼hrung starten."

REALITY:
  ai: "Wie viele Stunden pro Woche kannst du investieren?"

  # Critical GZ requirement check
  if hours < 15:
    ai: "âš ï¸ Wichtig: FÃ¼r GZ brauchst du mindestens 15 Stunden/Woche.

         Du hast [X] Stunden gesagt.
         Wie kÃ¶nntest du auf 15+ kommen?"

    [User adjusts or explains constraints]

  ai: "Welche Aufgaben Ã¼bernimmst du persÃ¶nlich?"

  ai: "Was mÃ¶chtest du auslagern?"

OPTIONS:
  # If user says "alles selbst machen"
  if user_says("alles selbst"):
    ai: "Verstehe den Gedanken. Lass uns realistisch sein:

         Aufgaben in einem Business:
         - Kundenakquise
         - Leistungserbringung
         - Buchhaltung
         - Marketing
         - Verwaltung

         Einige kÃ¶nntest du smart auslagern:
         - Buchhaltung: Steuerberater (spart Zeit, vermeidet Fehler)
         - Verwaltung: VA fÃ¼r â‚¬15-20/h

         WÃ¼rde das Sinn machen?"

  # Prioritization exercise
  ai: "Von allen Aufgaben:
       Wo schaffst du den grÃ¶ÃŸten Wert fÃ¼r Kunden?
       â†’ Das machst du selbst

       Was ist Zeitfresser ohne Mehrwert?
       â†’ Das kÃ¶nntest du auslagern"

WILL:
  ai: "Zusammenfassung:

       Zeit: [X] Stunden/Woche

       Du Ã¼bernimmst:
       - [Core tasks]

       Ausgelagert:
       - [Outsourced tasks] an [Provider]
       - GeschÃ¤tzte Kosten: â‚¬[X]/Monat

       Stimmt das?"
```

**Output:**

- `management.weeklyHours` (â‰¥15 validated)
- `management.coreResponsibilities`
- `management.outsourced` (with cost estimates)

---

### Phase 2: Partners (5 minutes, conditional)

**Goal:** Clarify partnership structure if applicable

**GROW Structure:**

```yaml
GOAL:
  ai: "GrÃ¼ndest du alleine oder mit anderen?"

  # Branch logic
  if user_says("alleine"):
    ai: "Ok, Solo-GrÃ¼ndung. Das vereinfacht vieles.
         Weiter zur Rechtsform."

    # Skip partner section
    return

  if user_says("mit Partner"):
    ai: "Ok, Partnerschaft. Lass uns das strukturieren."

REALITY (if partners exist):
  ai: "Wer sind deine Partner und was bringen sie ein?"

  [User describes partners]

  # Critical questions
  ai: "Wichtig fÃ¼r euren Erfolg:

       GeklÃ¤rt:
       â–¡ Wer bringt was ein? (Kapital, Arbeit, Know-how)
       â–¡ Wie werden Anteile aufgeteilt?
       â–¡ Wer entscheidet was?
       â–¡ Was wenn einer aussteigen will?

       Habt ihr das schriftlich?"

  if user_says("nein" OR "mÃ¼ndlich"):
    ai: "âš ï¸ Rote Flagge fÃ¼r BA:

         Partnerschaft ohne schriftliche Vereinbarung
         = hohes Konfliktrisiko

         Empfehlung: Gesellschaftervertrag VOR GrÃ¼ndung!

         Anwalt kostet â‚¬500-1.000, verhindert aber
         â‚¬50.000+ Konflikte spÃ¤ter.

         Ist das eingeplant?"

OPTIONS:
  ai: "Partnertypen:

       A) MitgrÃ¼nder (gleichberechtigt, operative Mitarbeit)
       B) Stiller Beteiligter (nur Kapital, nicht operativ)
       C) Kooperationspartner (Zusammenarbeit, keine Gesellschaft)

       Was trifft auf euch zu?"

WILL:
  ai: "Zusammenfassung:

       Partner: [Names, roles]
       Anteile: [Distribution]
       Vereinbarung: [Ja/Nein - wenn nein, als TODO]

       Wichtig: Das muss im Businessplan dokumentiert werden."
```

**Output:**

- `partners.hasPartners`
- `partners.coFounders` (if applicable)
- `partners.partnershipAgreement` (boolean, flags if missing)

---

### Phase 3: Legal Requirements (10 minutes)

**Goal:** Identify all permits, qualifications, registrations

**GROW Structure:**

```yaml
GOAL:
  ai: "Jetzt klÃ¤ren wir rechtliche Voraussetzungen.

       Am Ende wissen wir:
       - Bist du Freiberufler oder Gewerbe?
       - Welche Genehmigungen brauchst du?
       - Welche Anmeldungen sind Pflicht?"

REALITY:
  # Classification first
  ai: "Lass uns starten: Bist du Freiberufler oder Gewerbe?

       Freiberufler (Â§18 EStG):
       - Ã„rzte, AnwÃ¤lte, Steuerberater, Journalisten, etc.
       - Keine Gewerbeanmeldung nÃ¶tig

       Gewerbe (alles andere):
       - Handel, Handwerk, IT-Services, Coaching, etc.
       - Gewerbeanmeldung Pflicht

       Du bietest an: [user's offering from module 2]

       Was trifft zu?"

  [User classifies or asks for help]

  # Industry-specific requirements
  ai: "FÃ¼r deine Branche [industry], prÃ¼fen wir:

       â–¡ Meisterpflicht? (Handwerk)
       â–¡ Berufserlaubnis? (Heilberufe, Rechtsberufe)
       â–¡ Sachkundenachweis? (Security, Immobilienmakler)
       â–¡ Gesundheitszeugnis? (Lebensmittel)
       â–¡ Sonstige Genehmigungen?

       Welche treffen auf dich zu?"

  # Qualifications check
  ai: "Welche Qualifikationen hast du bereits?"

  [Cross-reference with intake module qualifications]

  if missing_required_qualification:
    ai: "âš ï¸ [X] ist fÃ¼r [activity] erforderlich.

         Hast du das schon?
         Wenn nein: Wie/wann wirst du es erwerben?"

OPTIONS:
  # Mandatory registrations (all businesses)
  ai: "Diese Anmeldungen sind fÃ¼r alle Pflicht:

       â–¡ Finanzamt (Fragebogen zur steuerlichen Erfassung)
       â–¡ Berufsgenossenschaft (Unfallversicherung)
       [If Gewerbe: â–¡ IHK/HWK (Pflichtmitgliedschaft)]

       Wusstest du das?"

  # Cost transparency
  ai: "Kosten fÃ¼r Registrierungen:
       - Gewerbeanmeldung: â‚¬20-60 (einmalig)
       - IHK/HWK: â‚¬50-300/Jahr (abhÃ¤ngig von Umsatz)
       - Berufsgenossenschaft: ~â‚¬150-300/Jahr

       Diese Kosten mÃ¼ssen in deine Finanzplanung."

WILL:
  ai: "Checkliste fÃ¼r dich:

       ERLEDIGT:
       â–¡ [Items user already has]

       TODO (vor Start):
       â–¡ [Items still needed]
       â–¡ [Estimated timeline]

       Alles klar oder Fragen?"
```

**Output:**

- `legalRequirements.classification` (freiberufler/gewerbe)
- `legalRequirements.qualifications` (with status)
- `legalRequirements.permits` (with timeline)
- `legalRequirements.registrations` (with costs)
- `legalRequirements.allRequirementsMet` (validation flag)

---

### Phase 4: Legal Form Selection (12 minutes) â­

**Goal:** Choose Rechtsform with user autonomy (SDT critical)

**SDT-Powered Structure:**

```yaml
GOAL:
  ai: "Jetzt wÃ¤hlen wir deine Rechtsform.

       Es gibt 4 Hauptoptionen. Ich erklÃ¤re sie dir,
       dann entscheidest DU basierend auf deinen PrioritÃ¤ten."

REALITY:
  # Context gathering for recommendation
  ai: "Ein paar Fakten, damit ich passende Optionen zeige:

       1. GrÃ¼ndest du allein oder mit Partner?"
  [User: solo/partner]

  ai: "2. Wie hoch schÃ¤tzt du dein Haftungsrisiko ein?
       (Berater = gering, Produktion = hÃ¶her)"
  [User: gering/mittel/hoch]

  ai: "3. Hast du 25.000â‚¬ Stammkapital verfÃ¼gbar?"
  [User: ja/nein]

OPTIONS (SDT - Autonomy Support):
  # Present 2-3 relevant options, NOT all 4

  if solo AND low_risk AND tight_budget:
    ai: "FÃ¼r deine Situation passen 2 Optionen:

         OPTION A: Einzelunternehmen
         âœ… Vorteile:
         - â‚¬0 Startkapital
         - Einfache Buchhaltung (EÃœR)
         - Niedrige Steuerberaterkosten (~â‚¬800-1.500/Jahr)
         - Schnelle GrÃ¼ndung

         âŒ Nachteile:
         - UnbeschrÃ¤nkte Haftung (privates VermÃ¶gen)
         - Image weniger professionell

         OPTION B: UG (haftungsbeschrÃ¤nkt)
         âœ… Vorteile:
         - Haftungsschutz
         - Professionelleres Image
         - SpÃ¤ter zur GmbH wandelbar

         âŒ Nachteile:
         - â‚¬300-500 GrÃ¼ndungskosten (Notar)
         - Bilanzpflicht (doppelte BuchfÃ¼hrung)
         - HÃ¶here Steuerberaterkosten (~â‚¬1.500-3.000/Jahr)

         Was ist dir wichtiger:
         A) Einfachheit + niedrige Kosten
         B) Haftungsschutz + Image"

  # User makes choice
  [User chooses A or B]

  # COMPETENCE VALIDATION (SDT)
  ai: "Du hast [CHOSEN] gewÃ¤hlt.

       FÃ¼r dein Business macht das Sinn, weil:
       - [Reason 1 based on their context]
       - [Reason 2 based on their priorities]
       - [Reason 3 based on their situation]

       Das zeigt, du verstehst dein Business gut." [VALIDATION]

WILL (Document reasoning):
  ai: "FÃ¼r den Businessplan dokumentieren wir:

       Rechtsform: [CHOSEN]

       BegrÃ¼ndung:
       1. [User's context]
       2. [User's priorities]
       3. [User's constraints]
       4. [Future considerations]

       Die BA wird das nachvollziehen kÃ¶nnen.

       Perspektive fÃ¼r spÃ¤ter:
       [e.g., 'Bei Wachstum Ã¼ber â‚¬100k Umsatz Umwandlung in GmbH prÃ¼fen']

       Passt das?"
```

**Cost Capture:**

```yaml
ai: 'Kosten fÃ¼r [chosen form]:

  Einmalig:
  - GrÃ¼ndung: â‚¬[X]
  [If UG/GmbH: - Notar: â‚¬[Y]]

  JÃ¤hrlich:
  - Steuerberater: â‚¬[Z]
  - IHK/HWK: â‚¬[W]

  Gesamt: â‚¬[TOTAL]/Jahr

  Das kommt in deine Finanzplanung.'
```

**Output:**

- `legalForm.chosen`
- `legalForm.reasoning` (4-5 bullet points)
- `legalForm.characteristics` (all attributes)
- `legalForm.futureConsideration`
- Cost data for finance module

---

### Phase 5: Insurance Planning (10 minutes)

**Goal:** Identify all required + recommended insurance

**SDT Structure (Reduce Overwhelm):**

```yaml
GOAL:
  ai: "Jetzt Versicherungen. Das kann Ã¼berwÃ¤ltigend sein,
       aber wir machen es strukturiert.

       Ich teile in 3 Gruppen:
       1. PFLICHT (musst du haben)
       2. PRIORITÃ„T (stark empfohlen)
       3. SPÃ„TER (wenn Budget da ist)

       Heute klÃ¤ren wir Gruppe 1+2. Gruppe 3 merkst du dir.

       Ok?" [USER APPROVES APPROACH - Autonomy]

REALITY:
  # GROUP 1: MANDATORY (all)
  ai: "GRUPPE 1 - PFLICHT fÃ¼r alle SelbststÃ¤ndigen:

       â–¡ Krankenversicherung
       â–¡ Pflegeversicherung

       Hast du das schon geklÃ¤rt?"

  if not_yet:
    ai: "Krankenversicherung - 2 Optionen:

         A) GKV freiwillig (~â‚¬200-400/Monat)
            - EinkommensabhÃ¤ngig
            - Familienversicherung mÃ¶glich

         B) PKV (~â‚¬300-600/Monat)
            - AltersabhÃ¤ngig
            - Bessere Leistungen
            - Keine Familienversicherung

         Was passt fÃ¼r dich?"

  [User chooses]

  # Industry-specific mandatory
  if industry_requires_berufshaftpflicht:
    ai: "FÃ¼r deine Branche [industry] ist zusÃ¤tzlich PFLICHT:

         â–¡ Berufshaftpflicht (~â‚¬200-1.000/Jahr)

         Grund: [Explanation why required]

         Das ist nicht optional!"

  # GROUP 2: PRIORITY (recommended)
  ai: "GRUPPE 2 - PRIORITÃ„T (stark empfohlen zum Start):

       Ich empfehle fÃ¼r dein Business:

       â–¡ Betriebshaftpflicht (~â‚¬150-500/Jahr)
       Warum: Deckt Sach-/PersonenschÃ¤den bei Kunden
       Beispiel: Kunde stolpert in deinem BÃ¼ro â†’ gedeckt

       [If consulting/services:]
       â–¡ VermÃ¶gensschadenhaftpflicht (~â‚¬300-800/Jahr)
       Warum: Deckt finanzielle SchÃ¤den durch deine Beratung
       Beispiel: Fehlerhafte Empfehlung kostet Kunden Geld

       Macht das fÃ¼r dich Sinn?"

  [User validates priorities]

OPTIONS:
  # GROUP 3: LATER (defer)
  ai: "GRUPPE 3 - SPÃ„TER (wenn Budget erlaubt):

       â–¡ BerufsunfÃ¤higkeit (~â‚¬500-2.000/Jahr)
       â–¡ Rechtsschutz gewerblich (~â‚¬200-500/Jahr)
       â–¡ Cyber-Versicherung (~â‚¬300-600/Jahr)

       Diese sind wichtig, aber nicht sofort.
       Merkst du dir fÃ¼r spÃ¤ter."

WILL:
  # Summary with costs
  ai: "Dein Versicherungsplan:

       PFLICHT (sofort):
       â€¢ Kranken + Pflege: â‚¬[X]/Monat
       [If applicable: â€¢ Berufshaftpflicht: â‚¬[Y]/Jahr]

       PRIORITÃ„T 1 (zum Start):
       â€¢ Betriebshaftpflicht: â‚¬[Z]/Jahr

       SPÃ„TER (ab Jahr 2):
       â€¢ [Deferred items]

       GeschÃ¤tzte Gesamtkosten Jahr 1: â‚¬[TOTAL]

       Das kommt in deine Finanzplanung."
```

**Output:**

- `insurance.mandatory` (all types with costs)
- `insurance.recommended.priority1` (start immediately)
- `insurance.recommended.priority2` (when budget allows)
- `insurance.recommended.later` (Year 2+)
- `insurance.totalYearlyCost`

---

### Phase 6: Location Analysis (10 minutes, conditional)

**Goal:** Analyze location if business type requires it

**Relevance Check First:**

```yaml
# From intake: businessType.isLocationDependent

if NOT isLocationDependent:
  ai: "Standortanalyse:

       Dein Business ist ortsunabhÃ¤ngig (Home Office / Digital).

       FÃ¼r den Businessplan dokumentieren wir:
       'GeschÃ¤ftsmodell erfordert keinen festen Standort.
        Arbeit erfolgt von Home Office / beim Kunden.'

       Weiter zum Abschluss!"

  # Skip location section
  return

if isLocationDependent:
  ai: "Dein Business braucht einen festen Standort.
       Lass uns das analysieren."
```

**GROW Structure (if location relevant):**

```yaml
GOAL:
  ai: "FÃ¼r die Standortwahl schauen wir auf:
       - Wo ist deine Zielgruppe?
       - Wie hoch darf Miete sein?
       - Was ist dir wichtig (Lage, Parking, etc.)?"

REALITY:
  ai: "Hast du schon einen Standort im Blick?"

  if yes:
    ai: "ErzÃ¤hl mir von diesem Standort:
         - Adresse/Lage
         - Miete/mÂ²
         - Vorteile
         - Nachteile"

  if no:
    ai: "Ok, lass uns Kriterien definieren.
         Was ist dir am Standort wichtig?"

  # Budget constraint
  ai: "Was ist dein maximales Miet-Budget pro Monat?"

  [User defines budget]

OPTIONS (SDT - User defines priorities):
  ai: "Standortwahl hat viele Faktoren.

       Damit du nicht Ã¼berfordert bist: [RELATEDNESS]
       Nenne mir deine TOP 3 wichtigsten Kriterien.

       Beispiele:
       - Miete
       - Laufkundschaft
       - ParkplÃ¤tze
       - Ã–PNV-Anbindung
       - Sichtbarkeit
       - Konkurrenz

       Was sind DEINE Top 3?" [AUTONOMY]

  [User defines own priorities]

  # If comparing locations
  if multiple_locations:
    ai: "Ok, deine Top 3: [User's priorities]

         Lass uns die Standorte nur auf DIESE vergleichen.

         Standort A:
         - [Priority 1]: [Score]
         - [Priority 2]: [Score]
         - [Priority 3]: [Score]

         Standort B:
         - [Priority 1]: [Score]
         - [Priority 2]: [Score]
         - [Priority 3]: [Score]

         Basierend auf DEINEN PrioritÃ¤ten - welcher gewinnt?"

  [User chooses]

WILL (COMPETENCE validation):
  ai: "Du hast [Standort X] gewÃ¤hlt, weil:
       - [Priority 1 reasoning]
       - [Priority 2 reasoning]
       - [Priority 3 reasoning]

       Das zeigt strategisches Denken! [VALIDATION]

       Du priorisierst [strength] Ã¼ber [weakness],
       was fÃ¼r dein GeschÃ¤ftsmodell Sinn macht.

       Kosten:
       - Miete: â‚¬[X]/Monat
       - Kaution: â‚¬[Y] (einmalig)
       [If needed: - Renovierung: â‚¬[Z]]

       Das kommt in Finanzplanung."
```

**Output:**

- `location.relevant` (boolean)
- `location.type` (if relevant)
- `location.analysis` (macro + micro factors)
- `location.monthlyRent`
- `location.deposit`

---

## Validation & Module Completion

### BA Compliance Checklist

```yaml
validation_gates:
  time_allocation:
    check: 'Weekly hours â‰¥15?'
    gate_type: BLOCKER
    reason: 'GZ requirement'

  partnership_documented:
    check: 'If partners exist, agreement in place?'
    gate_type: BLOCKER
    reason: 'BA requires clarity on structure'

  legal_requirements:
    check: 'All permits/qualifications identified and planned?'
    gate_type: BLOCKER
    reason: 'Cannot start without legal compliance'

  legal_form_justified:
    check: 'Rechtsform chosen with 4+ reasons?'
    gate_type: BLOCKER
    reason: 'BA requires justification'

  mandatory_insurance:
    check: 'All mandatory insurance identified?'
    gate_type: BLOCKER
    reason: 'Legal requirement'

  costs_calculated:
    check: 'Setup costs + yearly costs known?'
    gate_type: BLOCKER
    reason: 'Finance module depends on this'

  location_handled:
    check: 'If relevant: analyzed. If not: documented as N/A'
    gate_type: BLOCKER
    reason: 'BA expects location reasoning'
```

### Module Summary Generation

```yaml
ai: "â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”
     ðŸ“‹ UNTERNEHMENS-ZUSAMMENFASSUNG
     â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”

     UNTERNEHMENSFÃœHRUNG:
     â€¢ GeschÃ¤ftsfÃ¼hrer: [Name]
     â€¢ Zeitinvestition: [X] Stunden/Woche [âœ… GZ-konform]
     â€¢ Kernaufgaben: [List]
     â€¢ Ausgelagert: [List with costs]

     PARTNER:
     [Solo-GrÃ¼ndung OR Partner: Name, Rolle, Anteile]
     [If partners: Vereinbarung: âœ…/âš ï¸]

     GRÃœNDUNGSVORAUSSETZUNGEN:
     â€¢ Klassifizierung: [Freiberufler/Gewerbe]
     â€¢ Gewerbeanmeldung: [Ja - geplant DD.MM.YYYY / Nicht nÃ¶tig]
     â€¢ Qualifikationen: [Status]
     â€¢ Genehmigungen: [Status]
     â€¢ Registrierungen: Finanzamt, BG, [IHK/HWK if Gewerbe]

     RECHTSFORM:
     â€¢ [GewÃ¤hlte Form]
     â€¢ BegrÃ¼ndung:
       1. [Reason 1]
       2. [Reason 2]
       3. [Reason 3]
       4. [Reason 4]
     â€¢ Perspektive: [Future consideration]

     VERSICHERUNGEN:
     â€¢ Pflicht: [List with costs]
     â€¢ PrioritÃ¤t 1: [List with costs]
     â€¢ SpÃ¤ter: [Deferred list]
     â€¢ GeschÃ¤tzte Jahreskosten: â‚¬[TOTAL]

     STANDORT:
     [If relevant: Address + analysis]
     [If not: "Home Office / ortsunabhÃ¤ngig"]
     â€¢ Monatliche Kosten: â‚¬[X]

     GESAMTKOSTEN (fÃ¼r Finanzplanung):
     â€¢ Einmalig: â‚¬[Setup costs]
     â€¢ Monatlich: â‚¬[Rent + Insurance/12 + Outsourcing]
     â€¢ JÃ¤hrlich: â‚¬[Total]

     â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”

     Status: [validation.readyForNextModule ? 'READY âœ…' : 'NEEDS WORK âš ï¸']

     [If not ready]
     Noch zu klÃ¤ren:
     - [validation.blockers]

     [If ready]
     NÃ¤chstes Modul: Markt & Wettbewerb
     Dort machen wir: MarktgrÃ¶ÃŸe validieren (mit Recherche),
     Wettbewerber analysieren, Trends identifizieren

     Bereit weiterzumachen?"
```

---

## Error Recovery & Edge Cases

### User Overwhelmed by Complexity

**Scenario:** Too many technical terms, user shuts down

```yaml
signs:
  - Short answers ("ok", "weiÃŸ nicht")
  - User says "zu viel", "zu kompliziert"
  - Conversation slows significantly

response (SDT - Relatedness + Reduce Load):
  ai: "Ich merke, das wird viel auf einmal.
       Das ist total normal. [NORMALIZE]

       Die meisten GrÃ¼nder fÃ¼hlen sich hier Ã¼berfordert. [RELATEDNESS]

       Lass uns das vereinfachen:

       Heute klÃ¤ren wir NUR:
       1. Rechtsform (eine Entscheidung)
       2. Pflichtversicherungen (Liste sammeln)

       Rest (Details, Anmeldungen) machst du spÃ¤ter
       mit Steuerberater/IHK.

       Wir brauchen nur Klarheit fÃ¼r Businessplan,
       nicht perfekte Umsetzung.

       Ist dir das angenehmer?" [USER CONSENT]

  [User: "Ja, besser"]

  ai: "Gut! Dann machen wir es step-by-step."
```

### Decision Paralysis (Rechtsform)

**Scenario:** User can't decide between 2 forms

```yaml
# Already covered in Phase 4 - CBC Pattern
# Activate CBC when user stuck for >3 exchanges
# See: "When to Activate CBC (Decision Paralysis)" section above
```

### Partnership Conflict Detected

**Scenario:** User mentions unresolved partner issues

```yaml
user: 'Mein Partner und ich sind uns nicht einig Ã¼ber Anteile.'

response:
  ai: 'âš ï¸ Das ist ein kritisches Thema, das vor GrÃ¼ndung
    geklÃ¤rt werden MUSS.

    Die BA wird nach Partnervereinbarung fragen.
    UngeklÃ¤rte Konflikte = rote Flagge.

    Empfehlung:
    1. Pausiere Businessplan
    2. KlÃ¤rt die Anteile-Frage (mit Mediator wenn nÃ¶tig)
    3. Lasst Anwalt Gesellschaftervertrag erstellen
    4. Dann fortsezen

    Grund: Ein guter Businessplan ohne geklÃ¤rte
    Partnerschaft = Zeitverschwendung.

    Kannst du das zeitnah klÃ¤ren oder braucht ihr Hilfe?'
```

### Missing Required Qualifications

**Scenario:** User lacks required Meisterbrief or license

```yaml
user: "Ich habe noch keinen Meisterbrief."
# But offering requires it

response:
  ai: "âš ï¸ FÃ¼r [activity] ist Meisterbrief Pflicht.

       Du hast 3 Optionen:

       A) Meisterbrief nachholen
          - Dauer: 1-2 Jahre
          - Kosten: â‚¬5.000-10.000
          - Danach: GrÃ¼ndung mÃ¶glich

       B) Meister anstellen
          - Du als GeschÃ¤ftsfÃ¼hrer, Meister als Angestellter
          - Rechtlich mÃ¶glich
          - Braucht Arbeitsvertrag

       C) Angebot anpassen
          - Was kannst du OHNE Meisterbrief anbieten?
          - Ggf. Nische finden

       Welche Option machbar fÃ¼r dich?"

  [User evaluates options]

  # If none feasible
  if user_says("keine machbar"):
    ai: "Das ist frustrierend, aber wichtig zu wissen.

         Ohne Meisterbrief ist GrÃ¼ndung in diesem Bereich
         leider nicht legal mÃ¶glich.

         Aber: Deine FÃ¤higkeiten sind wertvoll.
         Lass uns Ã¼berlegen, wie du sie anders nutzen kannst.

         ZurÃ¼ck zu GeschÃ¤ftsmodell und Angebot anpassen?"
```

---

## Success Criteria

### Module Complete When:

```yaml
required:
  - âœ… Time allocation â‰¥15 hours/week
  - âœ… Partnership documented or Solo confirmed
  - âœ… All legal requirements identified (permits, qualifications)
  - âœ… Rechtsform chosen with 4+ reasons
  - âœ… All mandatory insurance identified with costs
  - âœ… Setup + yearly costs calculated
  - âœ… Location analyzed OR documented as not relevant
  - âœ… validation.readyForNextModule === true

optional_but_recommended:
  - âœ… Outsourcing plan defined
  - âœ… Open TODOs have timeline
  - âœ… Future considerations noted

coaching_quality:
  - âœ… SDT: User made â‰¥5 choices (autonomy)
  - âœ… SDT: Competence validated â‰¥3 times
  - âœ… Overwhelm prevented through clustering
  - âœ… If paralysis occurred: CBC used
  - âœ… User feels confident about structure
```

### Handoff to Next Module

```yaml
# Data passed to gz-module-04-market

passed_context:
  - legalForm.chosen (for tax context)
  - location.region (if relevant, for market analysis)
  - From intake + geschaeftsmodell (already passed)

# Data passed to gz-module-06-finance (CRITICAL)

passed_to_finance:
  # Setup costs (one-time)
  - legalForm.characteristics.setupCost
  - legalRequirements.registrations.[all].cost
  - location.deposit (if applicable)
  - location.renovationCost (if applicable)

  # Monthly recurring costs
  - management.outsourced.[all].estimatedCost
  - insurance.mandatory.krankenversicherung.monthlyContribution
  - insurance.mandatory.pflegeversicherung.monthlyContribution
  - location.monthlyRent (if applicable)

  # Yearly recurring costs
  - legalForm.characteristics.yearlyAccountingCost
  - legalRequirements.registrations.ihkHwk.estimatedYearlyCost
  - legalRequirements.registrations.berufsgenossenschaft.estimatedYearlyCost
  - insurance.industryMandatory.[all].yearlyPremium (if applicable)
  - insurance.recommended.priority1.[all].yearlyPremium

  # This is WHY this module is CRITICAL - it feeds 80% of fixed costs!

# Data stored in memory for validation

stored_in_memory:
  - legalForm.chosen (cross-check with business model)
  - management.weeklyHours (verify â‰¥15 throughout)
  - partners.hasPartners (consistency check in all modules)
```

---

## Coaching Effectiveness Metrics

Track per conversation:

```typescript
interface CoachingMetrics {
  // SDT Effectiveness
  autonomy_choices_offered: number; // Target: â‰¥5
  user_controlled_decisions: number; // Target: 100% (user always decides)
  competence_validations: number; // Target: â‰¥3
  overwhelm_prevention: boolean; // Clustering used?

  // CBC Effectiveness (if activated)
  decision_paralysis_resolved: boolean;
  evidence_gathered_before_challenge: boolean;

  // Core Patterns
  grow_structure_followed: boolean;
  reflective_summaries: number;

  // User Experience
  technical_terms_explained: number; // Jargon avoided
  user_engagement: 'high' | 'medium' | 'low';
  confidence_level_end: 1-10; // Self-reported

  // Module Quality
  time_to_complete: number; // Target: 45 minutes
  decisions_made: number; // Track complexity handled
  blockers_at_end: number; // Target: 0
  ba_compliance_score: number; // Target: 100%
}
```

---

## Testing Strategy

### Unit Tests

```typescript
describe('Unternehmen Module', () => {
  test('GZ time requirement enforced', () => {
    const input = { weeklyHours: 12 };
    const validation = validateTimeAllocation(input);
    expect(validation.valid).toBe(false);
    expect(validation.error).toContain('15 Stunden');
  });

  test('SDT: User controls Rechtsform choice', () => {
    const context = { solo: true, lowRisk: true };
    const options = getRechtformOptions(context);
    expect(options.length).toBe(2); // Not all 4, filtered
    expect(options.includes('direktiv')).toBe(false); // No "you should"
  });

  test('Insurance clustering reduces overwhelm', () => {
    const allInsurance = getInsuranceTypes();
    const clustered = clusterByPriority(allInsurance);
    expect(clustered.pflicht.length).toBeLessThanOrEqual(3);
    expect(clustered.priority1.length).toBeLessThanOrEqual(3);
  });

  test('Location skipped if not relevant', () => {
    const businessType = { isLocationDependent: false };
    const flow = determineFlow(businessType);
    expect(flow.includes('location_analysis')).toBe(false);
  });

  test('Cost data captured for finance module', () => {
    const output = createMockUnternehmenOutput();
    const costs = extractCostsForFinance(output);
    expect(costs.setupCosts).toBeDefined();
    expect(costs.monthlyCosts).toBeDefined();
    expect(costs.yearlyCosts).toBeDefined();
  });
});
```

### Integration Tests

```typescript
describe('Unternehmen Integration', () => {
  test('Consumes intake + geschaeftsmodell data', () => {
    const intake = createMockIntakeOutput();
    const geschaeftsmodell = createMockGeschaeftsmodellOutput();
    const context = initModule(intake, geschaeftsmodell);

    expect(context.businessType).toBe('consulting');
    expect(context.offering).toBeDefined();
  });

  test('Passes cost data to finance module', () => {
    const output = createMockUnternehmenOutput();
    const financeInput = transformForFinance(output);

    expect(financeInput.fixedCosts.monthly).toContain('rent');
    expect(financeInput.fixedCosts.yearly).toContain('insurance');
  });

  test('Partnership flag triggers partner questions', () => {
    const intake = { partners: { hasPartners: true } };
    const questions = generateQuestions(intake);
    expect(questions.some((q) => q.includes('Partner'))).toBe(true);
  });
});
```

### E2E Test Scenarios

```typescript
describe('Unternehmen E2E', () => {
  test('Complete happy path: Solo consultant', async () => {
    const persona = createTestPersona('solo-consultant');
    const result = await runModuleConversation(persona);

    expect(result.completed).toBe(true);
    expect(result.management.weeklyHours).toBeGreaterThanOrEqual(15);
    expect(result.legalForm.chosen).toBe('einzelunternehmen');
    expect(result.validation.readyForNextModule).toBe(true);
  });

  test('SDT pattern: Rechtsform autonomy', async () => {
    const persona = createTestPersona('first-time-founder');
    const result = await runModuleConversation(persona);

    expect(result.metadata.coachingPatternsUsed).toContain('SDT');
    expect(result.metadata.decisionsCount).toBeGreaterThanOrEqual(5);
    expect(result.legalForm.reasoning.length).toBeGreaterThanOrEqual(4);
  });

  test('CBC pattern: Decision paralysis on Rechtsform', async () => {
    const persona = createTestPersona('indecisive-founder');
    const result = await runModuleConversation(persona);

    expect(result.metadata.coachingPatternsUsed).toContain('CBC');
    expect(result.legalForm.chosen).toBeDefined(); // Decision made
  });

  test('Location skipped for digital business', async () => {
    const persona = createTestPersona('digital-consultant');
    const result = await runModuleConversation(persona);

    expect(result.location.relevant).toBe(false);
    expect(result.location.type).toBe('home_office');
  });

  test('Partnership workflow: Co-founders', async () => {
    const persona = createTestPersona('co-founders');
    const result = await runModuleConversation(persona);

    expect(result.partners.hasPartners).toBe(true);
    expect(result.partners.coFounders.length).toBeGreaterThan(0);
    expect(result.validation.partnershipDocumented).toBeDefined();
  });
});
```

---

**END OF gz-module-03-unternehmen STREAMLINED**

**Next Module:** gz-module-04-markt-wettbewerb (Market & Competition)
