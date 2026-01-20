---
name: gz-module-02-geschaeftsmodell
version: 2.0
description: Business model development module for GZ workshop. Develops clear offering, specific target audience, customer value proposition, and unique selling proposition using Value Proposition Canvas. Duration 60 minutes. Output structured data for market analysis.
dependencies:
  - gz-system-coaching-core (GROW, Socratic, Clean Language)
  - gz-coaching-cbc (reframe vague statements, challenge assumptions)
  - gz-coaching-mi (handle idea doubts, ambivalence)
  - gz-module-01-intake (business type, founder profile)
---

# Module 02: GeschÃ¤ftsmodell (Business Model)

**Duration:** 60 minutes  
**Critical Path:** Yes (blocks market, marketing, finance)  
**Complexity:** High (requires abstract â†’ concrete translation)  
**Coaching Load:** CBC + MI

---

## Purpose

Develop a BA-compliant business model with:

1. **Konkrete Angebotsbeschreibung** (specific offering)
2. **Definierte Zielgruppe** (quantified target audience)
3. **Kundennutzen aus Kundensicht** (value from customer perspective)
4. **Messbares Alleinstellungsmerkmal** (measurable USP)
5. **Wettbewerbsdifferenzierung** (competitive positioning)

**BA Rejection Reasons (Module 02):**

- Angebot zu vage ("guter Service", "Beratung")
- Zielgruppe zu breit ("alle Unternehmen")
- USP nicht differenzierend
- Kundennutzen aus Anbietersicht statt Kundensicht
- Keine Wettbewerbsabgrenzung

---

## Module Structure

### Input Requirements

```typescript
// From gz-module-01-intake
interface IntakeInput {
  businessIdea: {
    elevator_pitch: string;
    problem: string;
    solution: string;
    targetAudience: string; // Often too broad here
    uniqueValue: string;
  };
  businessType: {
    category: string;
    isLocationDependent: boolean;
    requiresPhysicalInventory: boolean;
  };
  founder: {
    experience: {
      yearsInIndustry: number;
      relevantRoles: string[];
    };
    qualifications: {
      specialSkills: string[];
    };
  };
}
```

### Output Schema

```typescript
interface GeschaeftsmodellOutput {
  // Offering Description
  offering: {
    mainOffering: string; // Core product/service
    deliveryFormat: 'physical' | 'digital' | 'service' | 'hybrid';
    pricingModel:
      | 'hourly'
      | 'project'
      | 'subscription'
      | 'product'
      | 'value_based';
    scope: {
      included: string[]; // What's explicitly in scope
      excluded: string[]; // What's explicitly NOT offered
    };
    oneSentencePitch: string; // "Oma-Test" - verstÃ¤ndlich fÃ¼r Laien
  };

  // Target Audience
  targetAudience: {
    // Primary Persona (required)
    primaryPersona: {
      name: string; // e.g., "Tech-Startup GrÃ¼nderin Sarah"
      demographics: {
        ageRange?: string; // B2C
        gender?: 'male' | 'female' | 'diverse' | 'not_relevant';
        occupation: string;
        income?: string; // B2C
        location: string;
      };
      firmographics?: {
        // B2B
        industry: string;
        companySize: string; // e.g., "10-50 Mitarbeiter"
        position: string; // Decision-maker position
        budget: string; // Budget range
      };
      psychographics: {
        goals: string[];
        challenges: string[];
        values: string[];
        interests: string[];
      };
      behavior: {
        informationSources: string[]; // Where they research
        decisionProcess: string; // How they decide
        previousAttempts: string[]; // What they've tried before
      };
      buyingTrigger: string; // What makes them buy NOW
    };

    // Market Size Quantification
    marketSize: {
      totalAddressableMarket: number; // TAM
      tamSource: string; // URL or citation
      serviceableMarket: number; // SAM (your actual reach)
      samCalculation: string; // Show your work
      targetFirstYear: number; // How many customers Year 1
      reasoning: string; // Why this is realistic
    };

    // Secondary personas (optional, max 1 for focus)
    secondaryPersona?: typeof primaryPersona;
  };

  // Value Proposition (Value Proposition Canvas)
  valueProposition: {
    // Customer Side (right side of canvas)
    customerJobs: string[]; // What customer wants to accomplish
    customerPains: string[]; // What frustrates them
    customerGains: string[]; // What would delight them

    // Offering Side (left side of canvas)
    productsServices: string[]; // Your offerings
    painRelievers: string[]; // How you solve their pains
    gainCreators: string[]; // How you create value beyond expected

    // Synthesized value statement (customer perspective!)
    valueStatement: string; // "[Target] kann mit [Angebot] [Ergebnis erreichen], ohne [Problem]"

    // Example: "Coaches kÃ¶nnen mit meiner KI-Automatisierung qualifizierte
    // Leads gewinnen, ohne stundenlang in Social Media zu posten."
  };

  // Unique Selling Proposition
  usp: {
    statement: string; // One sentence USP
    // "FÃ¼r [Zielgruppe] ist [Angebot] die einzige LÃ¶sung, die [Nutzen], weil [Beweis]"

    category:
      | 'specialization'
      | 'method'
      | 'result'
      | 'experience'
      | 'service'
      | 'speed'
      | 'local'
      | 'other';
    proof: string; // How you prove/deliver this
    measurement: string; // How customer can verify (if applicable)

    // USP Validation
    uspTest: {
      isUnique: boolean; // Can competitors claim same?
      isRelevant: boolean; // Does target audience care?
      isProvable: boolean; // Can you deliver/prove it?
      isUnderstandable: boolean; // Clear in 5 seconds?
      isOneSentence: boolean;
    };
  };

  // Competitive Positioning
  competitiveAnalysis: {
    directCompetitors: Array<{
      name: string;
      offering: string;
      pricePoint: string;
      strength: string;
      weakness: string;
      yourAdvantage: string; // What you do better
    }>; // Minimum 3, max 5

    competitiveAdvantages: string[]; // Your key differentiators
    marketGaps: string[]; // What nobody offers (that customers want)
  };

  // Validation Results
  validation: {
    offerClarity: 'clear' | 'vague' | 'needs_work';
    offerClarityReason?: string;

    targetAudienceSpecific: boolean;
    targetAudienceIssue?: string; // If false, why

    marketSizeQuantified: boolean;
    marketSizeSource?: string;

    valueFromCustomerPerspective: boolean;
    valuePerspectiveIssue?: string;

    uspUnique: boolean;
    uspRelevant: boolean;
    uspProvable: boolean;
    uspIssues?: string[];

    competitorsAnalyzed: boolean;
    minCompetitors: boolean; // At least 3

    readyForNextModule: boolean;
    blockers?: string[]; // What must be fixed before progressing
  };

  // Module Metadata
  metadata: {
    completedAt: string;
    duration: number; // Minutes
    iterationsNeeded: number; // How many refinement cycles
    coachingPatternsUsed: string[]; // e.g., ['CBC-vague-reframe', 'MI-doubt-resolution']
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
  - gz-coaching-cbc (CRITICAL)
    purpose: Reframe vague statements, challenge limiting beliefs
    triggers:
      - User says "guter Service", "professionell", "QualitÃ¤t"
      - Zielgruppe "alle", "jeder", "Unternehmen"
      - USP nicht konkret/messbar

  - gz-coaching-mi (CONDITIONAL)
    purpose: Handle doubts about idea viability
    triggers:
      - User says "vielleicht", "weiÃŸ nicht ob", "Zweifel"
      - Reality check reveals smaller market than expected
      - User realizes competition is stronger than thought
```

### Common CBC Patterns in This Module

#### Pattern 1: Vague Offering ("Guter Service")

```typescript
// User Input
user: "Mein USP ist guter Service."

// CBC 5-Step Response

// 1. IDENTIFY
ai: "Du sagst 'guter Service' - das sagen viele.
     Was meinst du konkret?"

[User struggles to specify]

// 2. EVIDENCE (Offer Options)
ai: "Lass uns konkreter werden. Was GENAU machst du anders:

     A) Reaktionszeit: Antwortest du innerhalb 2 Stunden?
     B) VerfÃ¼gbarkeit: Erreichbar 24/7 oder feste Zeiten?
     C) Garantie: Geld-zurÃ¼ck wenn nicht zufrieden?
     D) PersÃ¶nlich: Immer gleicher Ansprechpartner (nicht Callcenter)?
     E) Nachsorge: Kostenloser Follow-up nach 2 Wochen?

     Welches davon trifft am besten zu?"

[User picks: "Ich antworte immer innerhalb 2 Stunden"]

// 3. CHALLENGE (Gently test)
ai: "Innerhalb 2 Stunden - auch abends? Am Wochenende?"

[User: "Werktags bis 20 Uhr"]

// 4. REFRAME
ai: "Perfekt! Jetzt ist es konkret:
     Nicht 'guter Service' sondern '2h Response Time Guarantee
     (Mo-Fr, 8-20 Uhr)'.

     Das ist:
     âœ“ Messbar (Kunde kann nachprÃ¼fen)
     âœ“ Differenzierend (Wettbewerber machen 24-48h)
     âœ“ Relevant (Deine Zielgruppe braucht schnelle Hilfe)

     DAS ist ein BA-konformer USP."

// 5. ACTION
ai: "Wie garantierst du das?
     - Benachrichtigungen auf Handy?
     - Backup-Person wenn du krank?
     - Was wenn Urlaub?"

[User develops implementation plan]

// RESULT: Concrete, measurable, BA-compliant USP
```

#### Pattern 2: Broad Target Audience ("Alle Unternehmen")

```typescript
// User Input
user: "Meine Zielgruppe sind alle kleinen Unternehmen."

// CBC 5-Step Response

// 1. IDENTIFY
ai: "Das ist ein groÃŸer Markt. Lass uns fokussieren.
     Warum ist das wichtig?"

[User: "Mehr potenzielle Kunden"]

// 2. EVIDENCE (Reality Check)
ai: "Verstehe den Gedanken. Aber lass uns rechnen:

     Kleine Unternehmen in Deutschland: ~2,5 Millionen
     Realistisch erreichbar in Jahr 1: ?

     Du kannst nicht 2,5 Millionen ansprechen.
     Lass uns spitzer werden:

     Von allen kleinen Unternehmen - welche haben dein Problem
     am DRINGENDSTEN?"

[User thinks]

// 3. CHALLENGE (Focus Question)
ai: "Hier eine Ãœbung:
     Stell dir vor, du kannst in Jahr 1 nur 10 Kunden gewinnen.

     Welche 10 wÃ¼rdest du wÃ¤hlen?
     - Welche Branche?
     - Welche GrÃ¶ÃŸe?
     - Warum diese?"

[User: "10-50 Mitarbeiter, IT-Branche, weil ich die Sprache spreche"]

// 4. REFRAME
ai: "Jetzt ist es spitz!

     Vorher: 'Alle kleinen Unternehmen' (2,5 Mio)
     Jetzt: '10-50 MA, IT-Dienstleister' (~50.000 in DE)

     Das ist:
     âœ“ Fokussiert genug fÃ¼r Marketing
     âœ“ GroÃŸ genug fÃ¼r Wachstum
     âœ“ BegrÃ¼ndet (deine Expertise)

     SpÃ¤ter kannst du in andere Branchen expandieren.
     Aber fÃ¼r GZ-Antrag: Fokus ist KÃ¶nig."

// 5. ACTION
ai: "Kennst du konkret 10 Unternehmen in deiner Zielgruppe?
     Liste sie auf - das brauchen wir fÃ¼r Marktanalyse."

[User lists specific companies]

// RESULT: Focused, quantified, BA-compliant target audience
```

#### Pattern 3: Limiting Belief ("Ich bin kein VerkÃ¤ufer")

```typescript
// User shows doubt about marketing/sales capability

user: "Marketing ist nicht mein Ding. Ich bin kein VerkÃ¤ufer."

// CBC 5-Step Response

// 1. IDENTIFY
ai: "Du sagst 'kein VerkÃ¤ufer'.
     Woran machst du das fest?"

[User: "Kaltakquise ist unangenehm, kann ich nicht"]

// 2. EVIDENCE (Find Counter-Example)
ai: "Kaltakquise ist fÃ¼r viele unangenehm - verstehe ich.

     Aber lass uns anders schauen:
     Hast du schon mal jemanden von einer Idee Ã¼berzeugt?
     - Im Job den Chef?
     - Einen Kunden?
     - Einen Freund?"

[User: "Ja, meinen Chef habe ich Ã¼berzeugt, ein Projekt zu starten"]

// 3. CHALLENGE (Reframe)
ai: "Was hast du da genau gemacht?"

[User: "PrÃ¤sentation gemacht, Vorteile erklÃ¤rt, auf EinwÃ¤nde eingegangen"]

ai: "Das IST Verkaufen!

     Du hast:
     - Problem identifiziert (Chef's Schmerz)
     - LÃ¶sung prÃ¤sentiert (deine Idee)
     - Nutzen dargelegt (Vorteile)
     - EinwÃ¤nde behandelt (VerkaufsgesprÃ¤ch)

     Ergebnis: Chef hat 'gekauft' (Zeit + Budget investiert).

     Das ist Verkaufen - nur in anderem Kontext."

// 4. REFRAME
ai: "Vielleicht ist es nicht:
     'Ich bin kein VerkÃ¤ufer'

     Sondern:
     'Ich verkaufe, nur nicht per Kaltakquise.
      Meine StÃ¤rke ist Ideen Ã¼berzeugend prÃ¤sentieren.'

     Wie kÃ¶nntest du DIESE StÃ¤rke fÃ¼r Kundengewinnung nutzen?"

[User realizes: "Networking Events, Empfehlungen, Content Marketing"]

// 5. ACTION
ai: "Perfekt! Deine Akquisestrategie:

     Nicht: Kaltakquise (nicht deine StÃ¤rke)
     Sondern:
     - Networking (deine StÃ¤rke)
     - Empfehlungen (vertrauensbasiert)
     - Content (zeige Expertise)

     Das passt zu dir UND funktioniert.

     Lass uns das in Marketing-Modul ausarbeiten."

// RESULT: Belief reframed from deficit to asset
```

### When to Activate MI (Motivational Interviewing)

```typescript
// Trigger: User shows ambivalence about idea viability

user: "Vielleicht ist meine Idee doch nicht so gut..."

// MI Response (NOT CBC here - wrong tool for doubt)

// 1. EMPATHY
ai: "Zweifel sind normal und sogar gesund - sie zeigen,
     dass du ehrlich Ã¼berlegst.

     Lass uns das gemeinsam durchdenken."

// 2. EXPLORE AMBIVALENCE
ai: "Was begeistert dich an der Idee?"

[User lists pros]

ai: "Und was macht dir Sorgen?"

[User lists cons]

// 3. DEVELOP DISCREPANCY
ai: "Lass uns ehrlich prÃ¼fen. Drei Fragen:

     1. Haben Menschen das Problem, das du lÃ¶st?
        [User: "Ja, ich sehe es bei Kunden"]

     2. Zahlen sie fÃ¼r LÃ¶sungen?
        [User: "Ja, Wettbewerber verdienen Geld damit"]

     3. Kannst du es besser machen?
        [User: "Ich glaube schon, weil..."]

     Was sagt dir das?"

// 4. USER GENERATES SOLUTION (Not coach dictating)
ai: "Wenn die Idee nicht tragfÃ¤hig ist - besser JETZT wissen
     als nach 6 Monaten.

     Was brÃ¤uchtest du, um sicherer zu sein?

     A) Mit 5 potenziellen Kunden sprechen?
     B) Wettbewerber-Recherche vertiefen?
     C) Pilot-Angebot testen?

     Was wÃ¼rde dir helfen?"

[User chooses action]

// 5. SUPPORT (NOT pressure)
ai: "Gut! Lass uns [chosen action] machen.
     Wenn die Antwort 'Ja, tragfÃ¤hig' ist - super, weiter.
     Wenn 'Nein' - gut dass wir's wissen, dann Pivot.

     Beide Outcomes sind ok."

// RESULT: User explores doubt constructively, makes informed decision
```

---

## Conversation Flow

### Phase 1: Offering Definition (15 minutes)

**Goal:** Transform vague idea into concrete offering

**GROW Structure:**

```yaml
GOAL:
  ai: "In diesem Abschnitt definieren wir dein Angebot so klar,
       dass deine Oma es versteht.

       Am Ende hast du:
       - 1-2 Satz Beschreibung
       - Klare Leistungsabgrenzung (was JA, was NEIN)
       - VerstÃ¤ndliches Preismodell

       Bereit?"

REALITY:
  ai: "Was bietest du aktuell an?
       (Auch wenn noch nicht offiziell gestartet)"

  # Listen for vague answers
  if user_says("Beratung" OR "Dienstleistung" OR "Service"):
    activate_cbc()
    ai: "'[vague term]' ist sehr breit.
         Was GENAU machst du fÃ¼r Kunden?"

  # Socratic Level 2
  ai: "Welche Leistung hat bisher am besten funktioniert?
       Warum war sie erfolgreich?"

OPTIONS:
  ai: "Welche verschiedenen Leistungen KÃ–NNTEST du anbieten?"

  [User brainstorms]

  ai: "Von allen Optionen:
       Was bringt hÃ¶chsten Wert fÃ¼r Kunden bei geringstem
       Aufwand fÃ¼r dich?"

  # Help prioritize
  ai: "Wir starten fokussiert. Du kannst spÃ¤ter erweitern.
       Auf welche 1-3 Kernleistungen fokussierst du dich?"

WILL:
  ai: "Ok, deine Kernleistungen sind:
       1. [Primary]
       2. [Secondary - optional]

       Was bietest du explizit NICHT an?
       (Das hilft Kunden verstehen, was sie erwarten kÃ¶nnen)"

  # Capture exclusions
  ai: "Perfekt. Jetzt der Oma-Test:
       ErklÃ¤re in 2 SÃ¤tzen, was du machst."

  [User explains]

  if not_clear_enough():
    ai: "Noch zu abstrakt. Versuch so:
         'Ich helfe [Zielgruppe] [Problem] zu lÃ¶sen,
          indem ich [konkrete Leistung] mache.'"
```

**Output:**

- `offering.mainOffering`
- `offering.scope.included`
- `offering.scope.excluded`
- `offering.oneSentencePitch`

---

### Phase 2: Target Audience Definition (20 minutes)

**Goal:** Narrow from "alle" to specific, quantified persona

**GROW Structure:**

```yaml
GOAL:
  ai: "Jetzt definieren wir deine Zielgruppe.

       Ziel: Eine konkrete Person beschreiben kÃ¶nnen.
       Nicht 'alle' oder 'Unternehmen'.

       Die BA prÃ¼ft: Ist die Zielgruppe quantifizierbar?"

REALITY:
  ai: "Wer hat bisher fÃ¼r deine Leistung bezahlt?
       (Oder wÃ¼rde bezahlen, wenn du anbietest)"

  [User describes]

  # Check for "alle" red flag
  if user_says("alle" OR "jeder" OR "Unternehmen"):
    activate_cbc()

    ai: "Das ist ein sehr breiter Markt.

         Stell dir vor: Du kannst in Jahr 1 nur 10 Kunden gewinnen.

         Welche 10 wÃ¼rdest du wÃ¤hlen? Warum?"

    # Force specificity
    ai: "Von diesen 10 - was haben sie gemeinsam?
         - Branche?
         - GrÃ¶ÃŸe?
         - Problem?
         - Budget?"

OPTIONS:
  ai: "Welche verschiedenen Kundentypen kÃ¶nntest du ansprechen?"

  [User lists segments]

  ai: "Von allen Segmenten:
       - Wer hat das Problem am DRINGENDSTEN?
       - Wer hat das BUDGET?
       - Wen kannst du am LEICHTESTEN erreichen?"

  # Prioritization matrix
  ai: "Ranking:

       Segment A: Dringend (8/10), Budget (6/10), Erreichbar (9/10)
       Segment B: Dringend (5/10), Budget (9/10), Erreichbar (4/10)

       Welches Segment fÃ¼r Start?"

WILL:
  ai: "Deine Haupt-Zielgruppe ist: [Segment]

       Jetzt erstellen wir eine detaillierte Persona.
       Gib ihr einen Namen (hilft beim Visualisieren)."

  # Persona Development (Systematic)
  ai: "Beschreibe [Persona Name]:

       1. Beruf/Position:
       2. Alter (falls relevant):
       3. Standort:
       4. Hauptziel (beruflich/privat):
       5. GrÃ¶ÃŸte Herausforderung:
       6. Was hat er/sie bisher versucht?"

  [User fills in]

  # Buying Trigger (CRITICAL)
  ai: "Wichtigste Frage:
       Was mÃ¼sste passieren, damit [Persona] JETZT kauft?

       Welches Ereignis triggert den Bedarf?"

  [User defines trigger - this becomes marketing insight]
```

**Market Size Quantification (CRITICAL for BA):**

```yaml
# MUST quantify, cannot stay abstract

ai: "Jetzt Markt-Mathematik (BA braucht das):

     Schritt 1: Wie viele [Persona-Typ] gibt es in [Einzugsgebiet]?

     Quelle: LinkedIn-Suche, Statistisches Bundesamt, Branchenverband?"

[User researches or estimates]

ai: "Ok, [Zahl] gesamt.

     Schritt 2: Wie viele davon haben dein Problem?"

[User estimates percentage]

ai: "Schritt 3: Wie viele davon kÃ¶nnen/wollen bezahlen?"

[User estimates percentage]

# Calculation
ai: "Rechnung:

     Gesamt: [A]
     Mit Problem: [A] Ã— [B%] = [C]
     Zahlungsbereit: [C] Ã— [D%] = [E]

     Dein adressierbarer Markt: [E] potenzielle Kunden

     Jahr 1 Ziel: [E] Ã— 5% = [realistic first year target]

     Stimmt die Rechnung?"

# Source documentation
ai: "Woher kommen diese Zahlen?
     LinkedIn-Suche? Branchenreport? Eigene Netzwerk-Analyse?

     (BA will Quellen sehen)"
```

**Output:**

- `targetAudience.primaryPersona` (full persona)
- `targetAudience.marketSize` (with calculation + source)

---

### Phase 3: Value Proposition Development (15 minutes)

**Goal:** Articulate value from CUSTOMER perspective (not yours)

**Value Proposition Canvas (Structured):**

```yaml
# Right Side: Customer Profile

ai: "Lass uns [Persona Name]'s Welt verstehen.

     Customer Jobs (Was will er/sie erreichen?):"

[User lists jobs-to-be-done]

ai: "Customer Pains (Was frustriert dabei?)"

[User lists pains]

ai: "Customer Gains (Was wÃ¤re ideal?)"

[User lists desired gains]

# Left Side: Value Map

ai: "Jetzt deine Seite.

     Pain Relievers: Wie lÃ¶st du die Probleme?"

[User explains solutions]

ai: "Gain Creators: Welchen Mehrwert schaffst du?"

[User explains value creation]

# Fit Check
ai: "Abgleich:

     [Persona] will: [Job]
     Hat Problem: [Pain]
     Du lÃ¶st es: [Pain Reliever]
     Du bietest Bonus: [Gain Creator]

     Passt das zusammen?"
```

**Value Statement Formulation (CRITICAL for BA):**

```yaml
# Must be from CUSTOMER perspective

ai: "Jetzt formulieren wir den Kundennutzen.

     WICHTIG: Aus Kundensicht, nicht deiner!

     Formel:
     '[Zielgruppe] kann mit [Angebot] [Ergebnis erreichen],
      ohne [typisches Problem].'

     Versuch mal:"

[User attempts]

# Common error: Anbieter-Perspektive
if contains("Ich biete" OR "Ich mache"):
  ai: "Das ist noch aus deiner Sicht.

       Dreh es um:
       âŒ 'Ich biete professionelles Coaching'
       âœ… 'Meine Kunden gewinnen Klarheit Ã¼ber nÃ¤chste Schritte'

       Versuch nochmal, aus Kundensicht:"

[User refines]

ai: "Sehr gut! Das ist kundenzentrism."
```

**Output:**

- `valueProposition.customerJobs/Pains/Gains`
- `valueProposition.painRelievers/gainCreators`
- `valueProposition.valueStatement`

---

### Phase 4: USP Definition (20 minutes)

**Goal:** One-sentence, measurable, unique selling proposition

**USP Formula Application:**

```yaml
ai: "Jetzt das Alleinstellungsmerkmal.

     Formel:
     'FÃ¼r [Zielgruppe] ist [Angebot] die einzige LÃ¶sung,
      die [einzigartiger Nutzen], weil [BegrÃ¼ndung/Beweis].'

     Versuch mal:"

[User attempts]

# Common error: "besser" or "gÃ¼nstiger" (not unique)
if contains("besser" OR "gÃ¼nstiger" OR "professioneller"):
  activate_cbc()

  ai: "'Besser' sagen alle. Was machst du KONKRET anders?

       USP-Kategorien:
       A) Spezialisierung: 'Nur fÃ¼r [Nische]'
       B) Methode: 'Mit [spezifischem System]'
       C) Ergebnis: 'Garantiert [messbares Ergebnis]'
       D) Erfahrung: '[X] Jahre in [Branche]'
       E) Service: '[Konkrete Service-Garantie]'
       F) Geschwindigkeit: '[Zeitraum] oder Geld zurÃ¼ck'
       G) Lokalbezug: 'Der [Profession] aus [Kiez]'

       Welche Kategorie passt am besten?"

[User picks category]

ai: "Ok, [Kategorie]. Jetzt konkret:
     Was GENAU ist dein [Kategorie]-Vorteil?"

[User specifies]
```

**USP Test (5 Criteria):**

```yaml
ai: "Lass uns dein USP testen:

     '[User's USP statement]'

     1. Einzigartig: Kann ein Wettbewerber das Gleiche behaupten?
        [User: Nein/Ja]

     2. Relevant: Ist das deiner Zielgruppe wichtig?
        [User: Ja/Nein]

     3. Belegbar: Kannst du es beweisen/einhalten?
        [User: Ja/Nein]

     4. VerstÃ¤ndlich: Versteht es jemand in 5 Sekunden?
        [User: Ja/Nein]

     5. Ein Satz: Passt es in einen Satz?
        [User: Ja/Nein]"

if any_answer_no():
  ai: "Lass uns die schwachen Punkte verbessern:"

  for each_no:
    refine_with_cbc()

# Measurability Check
ai: "Kann ein Kunde dein USP Ã¼berprÃ¼fen?

     Beispiele:
     âœ“ '2h Response Time' â†’ Kunde kann timen
     âœ“ '10 Jahre Erfahrung' â†’ Kunde kann LinkedIn checken
     âœ“ 'Geld-zurÃ¼ck-Garantie' â†’ Kunde kann einfordern

     Wie kann man DEIN USP Ã¼berprÃ¼fen?"

[User explains measurement]
```

**Output:**

- `usp.statement` (final USP)
- `usp.category`
- `usp.proof`
- `usp.measurement`
- `usp.uspTest` (5 boolean checks)

---

### Phase 5: Competitive Analysis (10 minutes)

**Goal:** Identify 3-5 competitors, find differentiation gaps

**Competitor Identification:**

```yaml
ai: "Lass uns Wettbewerb analysieren.

     Nenne 3 direkte Wettbewerber:
     (Wer macht was Ã„hnliches fÃ¼r deine Zielgruppe?)"

[User lists competitors]

# Red flag: "Es gibt keine Konkurrenz"
if user_says("keine Konkurrenz" OR "keine direkten"):
  ai: "Wenn es keine Konkurrenz gibt, gibt es zwei MÃ¶glichkeiten:

       A) Der Markt existiert nicht (niemand zahlt dafÃ¼r)
       B) Du suchst an falscher Stelle

       Lass uns anders fragen:
       - Was macht deine Zielgruppe HEUTE, um ihr Problem zu lÃ¶sen?
       - Wer bietet Ã¤hnliche LÃ¶sungen (auch wenn nicht identisch)?
       - Was ist die 'Nichts tun' Alternative?"

  [User reconsiders]

# For each competitor
for competitor in competitors:
  ai: "Wettbewerber [Name]:

       1. Was bieten sie an?
       2. Was kosten sie?
       3. Was ist ihre StÃ¤rke?
       4. Was ist ihre SchwÃ¤che?
       5. Was machst DU besser/anders?"

  [User analyzes]
```

**Gap Analysis:**

```yaml
ai: "Schau dir alle 3 Wettbewerber an.

     Was bietet NIEMAND von ihnen, das Kunden wollen?"

[User identifies gaps]

ai: "Von diesen LÃ¼cken:
     Welche kannst DU fÃ¼llen mit deinen StÃ¤rken?"

[User matches gaps to capabilities]

# Positioning Statement
ai: "Deine Position im Markt:

     Wettbewerber machen: [Common approach]
     DU machst: [Your differentiation]

     FÃ¼r Kunden, die [specific need] haben,
     bist du die bessere Wahl weil [your advantage].

     Stimmt das?"
```

**Output:**

- `competitiveAnalysis.directCompetitors` (3-5)
- `competitiveAnalysis.competitiveAdvantages`
- `competitiveAnalysis.marketGaps`

---

## Validation & Module Completion

### BA Compliance Checklist

```yaml
validation_gates:
  offering_clarity:
    check: 'Can offer be explained in 2 sentences to a layperson?'
    gate_type: BLOCKER

  target_audience_specificity:
    check: "Is target audience defined beyond 'alle' or 'Unternehmen'?"
    gate_type: BLOCKER

  market_size_quantification:
    check: 'Is market size quantified with source?'
    gate_type: BLOCKER

  value_customer_perspective:
    check: "Is value statement from customer perspective (not 'Ich biete')?"
    gate_type: BLOCKER

  usp_measurability:
    check: 'Can USP be verified by customer?'
    gate_type: WARNING

  usp_uniqueness:
    check: 'USP passes all 5 tests (unique, relevant, provable, clear, one sentence)'
    gate_type: WARNING

  competitor_analysis:
    check: 'At least 3 competitors analyzed'
    gate_type: BLOCKER
```

### Module Summary Generation

```yaml
ai:
  "â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”
  ðŸ“‹ GESCHÃ„FTSMODELL-ZUSAMMENFASSUNG
  â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”

  ANGEBOT:
  [offering.oneSentencePitch]

  ZIELGRUPPE:
  [primaryPersona.name] - [brief description]
  MarktgrÃ¶ÃŸe: [marketSize.serviceableMarket] potenzielle Kunden

  KUNDENNUTZEN:
  [valueProposition.valueStatement]

  ALLEINSTELLUNGSMERKMAL:
  [usp.statement]

  WETTBEWERBSVORTEIL:
  [Top competitive advantage]

  â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”

  Status: [validation.readyForNextModule ? 'READY âœ…' : 'NEEDS WORK âš ï¸']

  [If not ready]
  Noch zu klÃ¤ren:
  - [validation.blockers]

  [If ready]
  NÃ¤chstes Modul: Unternehmen & Standort
  Dort klÃ¤ren wir: Rechtsform, Versicherungen, Standort

  Bereit weiterzumachen?"
```

---

## Error Recovery & Edge Cases

### User Stuck on Abstract Concepts

**Scenario:** User struggles to make offering concrete

```yaml
signs:
  - Circular explanations
  - Keeps using abstract terms ("Beratung", "QualitÃ¤t")
  - Frustrated tone

response:
  ai: "Ich merke, hier wird's schwierig. Das ist normal.

       Lass uns anders rangehen - mit Beispielen:

       Beschreibe einen typischen Projekt-Tag:
       - Kunde kommt zu dir mit Problem [X]
       - Du machst [konkrete Schritte]
       - Am Ende hat Kunde [konkretes Ergebnis]

       Was sind [konkrete Schritte]?"

  # Work from example backward to abstraction
  ai: "Ok, du machst [steps].
       Das zusammengefasst ist: [abstraction].

       DAS ist dein Angebot."
```

### User Doubts Idea Mid-Module

**Scenario:** User realizes idea might not work

```yaml
trigger:
  - Market size smaller than expected
  - Too many strong competitors
  - USP not unique enough

response:
  activate_mi()

  ai: "Ich merke, dass dich etwas verunsichert.
       Das ist ein wichtiger Moment.

       Lass uns ehrlich durchsprechen:
       Was macht dir konkret Sorgen?"

  [User explains doubts]

  ai: "Ok. Wir haben zwei Optionen:

       A) Wir pausieren diesen Plan, du Ã¼berlegst nochmal
       B) Wir passen die Idee an (Pivot)

       Was fÃ¼hlt sich richtiger an?"

  # Support either choice
  if user_chooses_pause:
    ai: "Verstehe. Besser jetzt ehrlich sein als nach 6 Monaten.

         Dein Login bleibt aktiv. Wenn du eine bessere Idee hast
         oder diese weiterentwickelst, komm einfach zurÃ¼ck.

         Soll ich dir ein paar Pivot-Ideen mitgeben basierend
         auf deinen StÃ¤rken?"

  if user_chooses_pivot:
    ai: "Gut! Lass uns anpassen.
         Was mÃ¼sste anders sein, damit es funktioniert?

         - Andere Zielgruppe?
         - Anderer Ansatz?
         - Anderes Problem lÃ¶sen?"
```

### User Has Multiple Target Audiences

**Scenario:** User wants to serve 2-3 distinct segments

```yaml
challenge:
  - Focus vs. breadth tension
  - BA prefers focus for new founders
  - But user has valid multi-segment opportunity

response:
  ai: "Du hast [2-3] Zielgruppen identifiziert.

       Das ist fÃ¼r spÃ¤ter super (Skalierung).
       Aber fÃ¼r GZ-Antrag: Fokus ist besser.

       Warum?
       - Klare Positionierung
       - Focused Marketing
       - GlaubwÃ¼rdiger fÃ¼r BA

       WÃ¤hle EINE Hauptzielgruppe fÃ¼r Jahr 1.
       Die anderen sind 'SekundÃ¤r' (erwÃ¤hnen, aber nicht Fokus).

       Welche Zielgruppe ist:
       - Am zahlungskrÃ¤ftigsten?
       - Am leichtesten zu erreichen?
       - Am dringendsten?"

  [User prioritizes]

  ai: "Ok, [Primary] ist deine Hauptzielgruppe.
       [Secondary] sind 'Future Expansion'.

       Im Businessplan erwÃ¤hnen wir beide, aber Fokus auf [Primary].
       So zeigst du Wachstumspotenzial UND Fokus."
```

---

## Success Criteria

### Module Complete When:

```yaml
required:
  - âœ… Offering explainable in 2 sentences
  - âœ… Primary persona fully developed
  - âœ… Market size quantified with source
  - âœ… Value statement from customer perspective
  - âœ… USP passes all 5 tests
  - âœ… 3+ competitors analyzed
  - âœ… validation.readyForNextModule === true

optional_but_recommended:
  - âœ… Secondary persona defined
  - âœ… USP measurable by customer
  - âœ… Competitive advantages clear

coaching_quality:
  - âœ… CBC used â‰¥2 times (vague â†’ concrete)
  - âœ… If doubts occurred: MI pattern used
  - âœ… User feels confident about model
  - âœ… No unresolved blockers
```

### Handoff to Next Module

```yaml
# Data passed to gz-module-03-unternehmen

passed_context:
  - offering.mainOffering (for tax classification)
  - businessType.isLocationDependent (for Standortanalyse)
  - targetAudience.primaryPersona.location (for Standortwahl)
  - founder.experience (from intake, enriched by model context)

# Data passed to gz-module-04-market

passed_context:
  - targetAudience.marketSize (basis for TAM/SAM/SOM)
  - competitiveAnalysis.directCompetitors (for detailed analysis)
  - usp.statement (positioning foundation)
  - valueProposition.valueStatement (marketing copy basis)

# Data stored in memory for cross-module validation

stored_in_memory:
  - offering.scope.excluded (consistency check in Marketing)
  - usp.measurement (KPI basis)
  - valueProposition.customerPains (marketing messaging)
```

---

## Coaching Effectiveness Metrics

Track per conversation:

```typescript
interface CoachingMetrics {
  // CBC Effectiveness
  vague_statements_reframed: number; // Target: â‰¥2
  limiting_beliefs_challenged: number;
  concrete_examples_elicited: number;

  // MI Effectiveness (if triggered)
  ambivalence_resolved: boolean;
  user_generated_solution: boolean; // vs coach dictated

  // Core Patterns
  grow_structure_followed: boolean;
  reflective_summaries: number; // Target: Every 5-7 exchanges
  open_question_ratio: number; // Target: â‰¥70%

  // User Experience
  iterations_needed: number; // How many refinement cycles
  user_engagement: 'high' | 'medium' | 'low';
  aha_moments: number; // User says "Aha!", "Das macht Sinn"

  // Module Quality
  time_to_complete: number; // Target: 60 minutes
  blockers_at_end: number; // Target: 0
  ba_compliance_score: number; // Target: 100%
}
```

---

## Testing Strategy

### Unit Tests

```typescript
describe('GeschÃ¤ftsmodell Module', () => {
  test('CBC activates on vague offering', () => {
    const input = 'Mein USP ist guter Service';
    const response = processInput(input, context);
    expect(response.coaching_pattern).toBe('CBC-vague-reframe');
    expect(response.text).toContain('konkret');
  });

  test('Broad target audience triggers focus questions', () => {
    const input = 'Meine Zielgruppe sind alle Unternehmen';
    const response = processInput(input, context);
    expect(response.text).toContain('10 Kunden');
  });

  test('USP validation catches non-unique claims', () => {
    const usp = 'Wir sind besser und gÃ¼nstiger';
    const validation = validateUSP(usp);
    expect(validation.isUnique).toBe(false);
    expect(validation.feedback).toContain('konkret');
  });

  test('Market size must be quantified', () => {
    const data = { targetAudience: { marketSize: { tam: 0 } } };
    const validation = validateModule(data);
    expect(validation.ready).toBe(false);
    expect(validation.blockers).toContain('market_size');
  });
});
```

### Integration Tests

```typescript
describe('GeschÃ¤ftsmodell Integration', () => {
  test('Intake data properly consumed', () => {
    const intakeOutput = createMockIntakeOutput();
    const geschaeftsmodellContext = initModule(intakeOutput);
    expect(geschaeftsmodellContext.businessType).toBe('consulting');
    expect(geschaeftsmodellContext.founderExperience).toBeDefined();
  });

  test('Output schema valid for next module', () => {
    const output = createMockGeschaeftsmodellOutput();
    const validation = validateForNextModule(output);
    expect(validation.isValid).toBe(true);
  });
});
```

### E2E Test Scenarios

```typescript
describe('GeschÃ¤ftsmodell E2E', () => {
  test('Complete happy path: IT consultant', async () => {
    const persona = createTestPersona('IT-consultant');
    const result = await runModuleConversation(persona);

    expect(result.completed).toBe(true);
    expect(result.offering).toBeDefined();
    expect(result.targetAudience.marketSize.sam).toBeGreaterThan(0);
    expect(result.usp.uspTest.isUnique).toBe(true);
    expect(result.validation.readyForNextModule).toBe(true);
  });

  test('CBC pattern: vague USP â†’ concrete', async () => {
    const persona = createTestPersona('vague-service-provider');
    const result = await runModuleConversation(persona);

    expect(result.metadata.coachingPatternsUsed).toContain('CBC');
    expect(result.usp.measurement).toBeDefined();
  });

  test('MI pattern: user doubts idea', async () => {
    const persona = createTestPersona('uncertain-founder');
    const result = await runModuleConversation(persona);

    expect(result.metadata.coachingPatternsUsed).toContain('MI');
    // User either pivots or proceeds with confidence
    expect(result.validation.readyForNextModule).toBeDefined();
  });
});
```

---

**END OF gz-module-02-geschaeftsmodell STREAMLINED**

**Next Module:** gz-module-03-unternehmen (Company Structure)
