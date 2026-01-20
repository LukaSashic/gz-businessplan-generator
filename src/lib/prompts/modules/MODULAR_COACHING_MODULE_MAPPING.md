# Modular Coaching Approach: GZ Module Mapping

**Strategy:** Modular coaching skills loaded based on module needs  
**Core:** gz-system-coaching-core (always loaded)  
**Extensions:** Specialized coaching loaded per module context

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│              LAYER 1: ALWAYS LOADED (Cached)                 │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  gz-system-orchestrator     [Flow control]                  │
│  gz-system-constraints      [BA + DSGVO rules]              │
│  gz-system-coaching-core    [Base patterns]                 │
│    ├─ GROW structure                                        │
│    ├─ Socratic questioning (levels 1-3)                     │
│    ├─ Clean language basics                                 │
│    ├─ Reflective summarization                              │
│    └─ Pacing & tone                                         │
│                                                              │
└─────────────────────────────────────────────────────────────┘
         ↓
┌─────────────────────────────────────────────────────────────┐
│          LAYER 2: CONTEXTUAL COACHING (Per Module)           │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  gz-coaching-mi             [Motivational Interviewing]     │
│  gz-coaching-cbc            [Cognitive Behavioral]          │
│  gz-coaching-ai             [Appreciative Inquiry]          │
│  gz-coaching-stage          [Stage Detection & Adaptation]  │
│  gz-coaching-sdt            [Self-Determination Theory]     │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

**Token Budget:**

- Core: 2,000 tokens (always cached)
- Extension (1-2 per module): 1,500-3,000 tokens
- Total per module: 3,500-5,000 tokens

---

## Module-by-Module Mapping

### Module 01: Intake & Assessment

**Duration:** 45 minutes  
**Coaching Challenges:**

- User may be uncertain about readiness
- Need to assess entrepreneurial personality
- Must classify business type accurately
- Build rapport for entire workshop

**Load:**

```yaml
always:
  - gz-system-coaching-core

contextual:
  - gz-coaching-stage (CRITICAL - detect readiness)
  - gz-coaching-ai (start positive, discover strengths)
  - gz-coaching-mi (handle ambivalence about founding)
```

**Why These Specific Skills:**

**gz-coaching-stage:**

```
User might be at ANY stage:
- Precontemplation: "Soll ich überhaupt gründen?"
- Contemplation: "Selbstständig vs. Anstellung?"
- Preparation: "Ich habe mich entschieden, plane Start"

Detection pattern:
if (language_pattern === 'unsicher', 'vielleicht', 'weiß nicht'):
  stage = 'precontemplation'
  approach = 'explorative'  # Don't push for commitment

if (language_pattern === 'einerseits...andererseits', 'Angst'):
  stage = 'contemplation'
  approach = 'motivational'  # MI techniques

if (language_pattern === 'ich plane', 'nächsten Monat'):
  stage = 'preparation'
  approach = 'structured'  # Full GROW
```

**gz-coaching-ai (Appreciative Inquiry):**

```
Start positive to build rapport:

Phase 1: DISCOVER
"Bevor wir in deine Geschäftsidee eintauchen:
Erzähl mir von einem beruflichen Erfolg, auf den du stolz bist."

[User shares achievement]

"Was hast du da gut gemacht? Welche Fähigkeiten genutzt?"

→ Extract strengths for later reference

Phase 2: DREAM
"Wenn dein Business in 3 Jahren genau läuft, wie du willst -
wie sieht dein Alltag aus? Was machst du? Wie fühlst du dich?"

→ Connect to intrinsic motivation, not just GZ money
```

**gz-coaching-mi (Motivational Interviewing):**

```
Common scenario: User ambivalent about founding

User: "Ich weiß nicht, ob ich bereit bin."

MI Pattern:
1. Express empathy:
   "Es klingt, als hättest du Zweifel. Das ist völlig normal
    bei so einer großen Entscheidung."

2. Develop discrepancy:
   "Du hast gesagt, Unabhängigkeit ist dir wichtig.
    Wie fühlst du dich in deinem aktuellen Job?"

   [User: "Frustriert, ich kann nichts entscheiden"]

   "Also gibt es eine Lücke zwischen dem, was du willst
    und wo du bist?"

3. Elicit change talk:
   "Was würde passieren, wenn du in 1 Jahr immer noch
    im gleichen Job bist?"

   [User realizes staying is worse than risk]

→ User talks themselves into change
```

**Intake-Specific Patterns:**

```typescript
// Entrepreneurial Personality Assessment
// Uses gz-coaching-ai to frame positively

for (dimension of howard_7_dimensions) {
  // Start with strength recognition
  ai: "Du hast vorhin erwähnt [past achievement].
       Das zeigt [related strength]."

  // Then scenario
  ai: "Hier ist eine Situation aus deinem Business: [scenario]
       Was würdest du machen?"

  // NOT: "Rate dich 1-5 auf Innovationsfähigkeit"
  // YES: Real scenario that reveals trait
}
```

**Success Metrics:**

- Stage correctly detected: >90%
- User shares at least 1 achievement: 100%
- Ambivalence acknowledged if present: 100%
- Rapport established (user engagement): >80%

---

### Module 02: Business Model (Geschäftsmodell)

**Duration:** 60 minutes  
**Coaching Challenges:**

- Value proposition often too vague ("guter Service")
- Target audience too broad ("alle")
- USP not differentiated
- Need concrete examples

**Load:**

```yaml
always:
  - gz-system-coaching-core

contextual:
  - gz-coaching-cbc (CRITICAL - reframe vague statements)
  - gz-coaching-mi (if user doubts idea viability)
```

**Why These Skills:**

**gz-coaching-cbc (Cognitive Behavioral Coaching):**

```
Common limiting beliefs in this module:

Belief 1: "Mein USP ist guter Service"
→ Too vague, not BA-compliant

CBC Pattern:
1. Identify: "Du sagst 'guter Service' -
              das sagen viele. Was meinst du konkret?"

2. Evidence: "Was machst DU anders?"
   [User struggles]

3. Challenge (gently): "Lass uns konkreter werden:
   - Antwortest du innerhalb 2h?
   - Geld-zurück-Garantie?
   - 24/7 Support?
   - Persönlicher Ansprechpartner?"

4. Reframe: User picks one: "Ich antworte immer innerhalb 2h"

   AI: "Perfekt! DAS ist dein USP. Nicht 'guter Service'
        sondern '2h Response Time Guarantee'.
        Das ist konkret, messbar, und differenzierend."

5. Action: "Wie könntest du das garantieren?
            Was brauchst du dafür?"
```

```
Belief 2: "Meine Zielgruppe sind alle kleinen Unternehmen"
→ Too broad

CBC Pattern:
1. Identify: "Das ist ein großer Markt. Lass uns fokussieren."

2. Evidence: "Von allen kleinen Unternehmen -
              welche haben das Problem am dringendsten?"

3. Challenge: "Wenn du nur 10 Kunden in Jahr 1 gewinnen kannst -
               welche 10 würdest du wählen? Warum?"

4. Reframe: [User realizes: "10-50 MA, IT-Branche,
             weil ich die Sprache spreche"]

   AI: "Jetzt ist es spitz! Das ist deine Zielgruppe.
        Später kannst du expandieren."

5. Action: "Kennst du 10 Unternehmen, die passen?
            Liste sie auf."
```

**gz-coaching-mi (If User Doubts Idea):**

```
Scenario: User realizes idea might not be viable

User: "Vielleicht ist meine Idee doch nicht so gut..."

MI (not CBC here - wrong tool for doubt):
1. Empathy: "Zweifel sind normal. Lass uns ehrlich prüfen."

2. Explore ambivalence:
   "Was begeistert dich an der Idee?" [Pro]
   "Was macht dir Sorgen?" [Con]

3. Develop discrepancy:
   "Wenn du die Idee verwirfst - was dann?"
   "Wenn du sie umsetzt trotz Zweifel - was könnte passieren?"

4. User decision: NOT coach decision
   "Was fühlt sich richtig an?"

→ Either way, user owns decision
```

**Business Model Specific Patterns:**

```typescript
// Value Proposition Canvas (Design Thinking)
// Uses gz-coaching-core Socratic questioning

Level 1: "Welches Problem löst du?"
Level 2: "Für wen konkret?"
Level 3: "Wie lösen sie es heute?"
Level 4: "Was ist der Schmerz an der heutigen Lösung?"
Level 5: "Wie ist deine Lösung 10x besser?"

// Each level uses CBC to make concrete
```

**Success Metrics:**

- Value proposition specific: >90%
- Target audience defined (not "alle"): 100%
- USP measurable: >80%
- User can explain in own words: 100%

---

### Module 03: Company Structure (Unternehmen)

**Duration:** 45 minutes  
**Coaching Challenges:**

- Legal decisions (Rechtsform) feel overwhelming
- Insurance/location questions technical
- Less emotional, more factual
- Risk of becoming dry Q&A

**Load:**

```yaml
always:
  - gz-system-coaching-core

contextual:
  - gz-coaching-sdt (CRITICAL - autonomy in technical decisions)
  - (Optional: gz-coaching-cbc if user shows decision paralysis)
```

**Why SDT Here:**

**gz-coaching-sdt (Self-Determination Theory):**

```
Challenge: Users feel they "should" choose X because "everyone does"

Autonomy Pattern:
❌ BAD: "Die meisten wählen UG. Mach das auch."

✅ GOOD (SDT):
"Es gibt mehrere Rechtsformen. Lass uns schauen,
was zu DEINEN Prioritäten passt:

Option A: Einzelunternehmen
- Vorteile: Einfach, günstig, schnell
- Nachteile: Volle Haftung

Option B: UG (haftungsbeschränkt)
- Vorteile: Haftungsschutz, professioneller
- Nachteile: Buchhaltung aufwendiger, Kosten

Option C: GmbH
- Vorteile: Maximaler Haftungsschutz
- Nachteile: 25k Stammkapital, hohe Gründungskosten

Was ist dir wichtiger: Einfachheit oder Haftungsschutz?"

[User decides based on own values]

"Du hast [X] gewählt, weil dir [reason] wichtig ist.
Das ist eine durchdachte Entscheidung."

→ Competence validation
```

**Avoid Decision Fatigue:**

```
Module has many small decisions (insurance, location, etc.)

SDT Pattern:
1. Cluster decisions:
   "Wir haben 3 Themen: Rechtsform, Versicherungen, Standort.
    Welches möchtest du zuerst klären?"

   → Autonomy: User chooses order

2. Simplify each:
   "Bei Versicherungen brauchst du minimum:
    - Berufshaftpflicht (Pflicht)
    - Krankenversicherung (Pflicht)

    Optional später:
    - Rechtsschutz
    - Altersvorsorge

    Heute klären wir nur Pflicht. Ok?"

   → Competence: Manageable chunks

3. Provide resources, not answers:
   "Für Rechtsform empfehle ich:
    - IHK-Beratung (kostenlos)
    - Steuerberater (1h Erstgespräch ~€150)

    Ich kann keine Rechtsberatung geben, aber ich kann dir
    helfen, die richtigen Fragen vorzubereiten."

   → Relatedness: Support without overstepping
```

**If Decision Paralysis (CBC):**

```
User: "Ich weiß nicht, was ich wählen soll. Alles ist kompliziert."

CBC Pattern:
1. Identify belief: "Was macht es kompliziert?"
   [User: "Ich kenne mich nicht aus"]

2. Reframe: "Niemand kennt sich aus beim ersten Mal.
             Aber: Du musst nicht die perfekte Wahl treffen.
             Du musst eine gute-genug Wahl treffen.

             Was wäre gut genug?"

3. Action: "Lass uns die einfachste Variante nehmen,
            die deine Mindestanforderungen erfüllt.

            Mindestanforderung: Haftungsschutz ja oder nein?"

→ Simplifies decision tree
```

**Success Metrics:**

- User makes informed choice (not default): >80%
- User explains reasoning in own words: >90%
- Decisions aligned with business type: 100%
- User doesn't feel overwhelmed: >80%

---

### Module 04: Market & Competition (Markt & Wettbewerb)

**Duration:** 90 minutes (research-heavy)  
**Coaching Challenges:**

- TAM/SAM/SOM calculations intimidating
- Competitor research time-consuming
- Numbers need to be sourced (BA requirement)
- Easy to get lost in research rabbit holes

**Load:**

```yaml
always:
  - gz-system-coaching-core

contextual:
  - gz-coaching-mi (CRITICAL - when numbers look bad)
  - gz-coaching-cbc (CRITICAL - challenge assumptions)

engines:
  - gz-engine-research (web search patterns)
```

**Why MI + CBC Here:**

**gz-coaching-mi (When Market Data Disappointing):**

```
Scenario: Web research shows smaller market than expected

User: "Ich dachte, der Markt wäre größer.
       Vielleicht funktioniert das nicht..."

MI Pattern (NOT cheerleading):
1. Empathy: "Das ist ernüchternd. Lass uns ehrlich schauen."

2. Explore impact:
   "Was bedeutet ein kleinerer Markt für dein Business?"
   [User: "Weniger Kunden verfügbar"]

   "Wie viele Kunden brauchst du realistisch in Jahr 1?"
   [User: "Vielleicht 20?"]

3. Reframe with data:
   "Deine Recherche zeigt: 500 potenzielle Kunden in deiner Region.
    Du brauchst 20 = 4% Marktanteil.
    Ist das erreichbar?"
   [User: "Ja, eigentlich schon"]

4. Develop discrepancy:
   "Also: Der Markt ist kleiner als gedacht, aber groß genug
    für deine Ziele. Stimmt's?"

→ User stays motivated with realistic data
```

**gz-coaching-cbc (Challenge Market Assumptions):**

```
Common assumption: "Mein Markt ist X groß" (unsourced)

CBC Pattern:
1. Identify: "Woher weißt du, dass der Markt X groß ist?"
   [User: "Habe ich geschätzt / gehört"]

2. Evidence: "Lass uns recherchieren. Ich suche jetzt."
   [gz-engine-research called]

3. Compare assumption vs. reality:
   "Du hast geschätzt: €10M Markt
    Recherche zeigt: €3M Markt

    Das ist ein Unterschied. Was denkst du?"

4. Reframe: "Kleinerer Markt ≠ schlechtes Business.
             Es bedeutet: Du musst effizienter sein."

5. Action: "Lass uns deine Umsatzprognose anpassen
            basierend auf den echten Zahlen."

→ Reality-based planning (BA loves this)
```

**Research Workflow Integration:**

```typescript
// Coaching + Research Engine

Module 4 Phases:
1. User estimates market size (no research yet)
2. Coach challenges: "Woher weißt du das?"
3. gz-engine-research: Perform searches
4. Present data with sources
5. Coach helps interpret: "Was sagt dir das?"
6. User adjusts assumptions
7. Coach validates: "Das ist jetzt BA-compliant"

// Uses core GROW + CBC + MI as needed
```

**Competition Analysis Pattern:**

```
Socratic Depth (core skill):
Level 1: "Wer sind deine Wettbewerber?"
Level 2: "Was machen sie besser als du?"
Level 3: "Warum haben sie damit Erfolg?"
Level 4: "Was könntest du daraus lernen?"
Level 5: "Wie machst du es anders UND besser?"

+ CBC: Challenge "Ich habe keine Wettbewerber"
  → "Wenn du keine hast: Wer löst das Problem heute?"
```

**Success Metrics:**

- All market numbers sourced: 100%
- TAM/SAM/SOM calculated: 100%
- At least 3 competitors analyzed: >90%
- User understands market realistically: >90%
- Competitive advantage clearly articulated: >80%

---

### Module 05: Marketing & Sales (Marketing & Vertrieb)

**Duration:** 90 minutes  
**Coaching Challenges:**

- Users often have no marketing experience
- "I'll figure it out" mentality common
- Budget allocation difficult
- Optimism bias ("viral growth")

**Load:**

```yaml
always:
  - gz-system-coaching-core

contextual:
  - gz-coaching-cbc (CRITICAL - challenge unrealistic plans)
  - gz-coaching-mi (if user feels overwhelmed by marketing)

engines:
  - gz-engine-research (channel benchmarks, CAC data)
```

**Why CBC + MI Here:**

**gz-coaching-cbc (Challenge Marketing Assumptions):**

```
Assumption 1: "Ich poste auf LinkedIn, Kunden kommen"

CBC Pattern:
1. Identify: "Lass uns das durchrechnen:
              - Wie viele Follower hast du?"
   [User: "50"]

2. Evidence: "Bei 50 Followern, 2% Engagement = 1 Person sieht Post.
              Brauchst du 10 Kunden/Monat?
              Wie kommen die anderen 9?"

3. Challenge: "LinkedIn allein reicht nicht. Was noch?"

4. Reframe: "LinkedIn ist GUT für Sichtbarkeit.
             Aber du brauchst auch aktive Akquise.

             Was wäre ein Mix:
             - 30% LinkedIn (Inbound)
             - 70% Direktansprache (Outbound)?"

5. Action: "Diese Woche: 10 LinkedIn-Posts + 20 Direktnachrichten"

→ Realistic expectations
```

```
Assumption 2: "Ich brauche kein Marketing-Budget"

CBC Pattern:
1. Identify: "Wie gewinnst du Kunden ohne Budget?"
   [User: "Organisch, über Netzwerk"]

2. Evidence: "Wie groß ist dein Netzwerk?"
   [User: "Vielleicht 100 Leute"]

   "Davon sind wie viele Zielkunden?"
   [User: "10-15"]

3. Challenge: "15 Kunden bei 10% Conversion = 1-2 Kunden.
               Brauchst du mehr als 2?"

4. Reframe: "Netzwerk ist START, aber nicht genug.
             Budget muss nicht riesig sein.

             Was könntest du für €50-100/Monat testen?"

5. Action: "Lass uns €200/Monat einplanen für:
            - LinkedIn Ads (€50)
            - Networking Events (€100)
            - Tools (€50)"

→ Realistic budget allocation
```

**gz-coaching-mi (If Overwhelmed by Marketing):**

```
User: "Ich bin kein Marketer. Ich weiß nicht, wie das geht."

MI Pattern (not "just learn it"):
1. Empathy: "Marketing ist für viele Gründer die größte
             Herausforderung. Du bist nicht allein."

2. Explore strengths:
   "Was kannst du gut, das beim Marketing hilft?
    - Bist du gut im Reden? (Networking)
    - Schreibst du gern? (Content)
    - Analytisch? (Paid Ads)
    - Kreativ? (Social Media)"

3. Build on strengths:
   [User: "Ich bin gut im Reden"]

   "Perfekt! Dann ist Networking dein Hauptkanal.
    Nicht LinkedIn Posts, nicht Ads - Gespräche.

    Wo könntest du jede Woche mit Zielkunden sprechen?"

4. Small wins:
   "Lass uns mit EINEM Kanal starten. Nicht 5.
    Networking. 2 Events/Monat. Machbar?"

→ Reduces overwhelm, builds confidence
```

**Marketing Mix Framework (Design Thinking):**

```
Empathize (core):
"Wo hängt dein Zielkunde rum - online & offline?"

Define (core):
"Von diesen Orten: Wo ist die Konkurrenz am schwächsten?"

Ideate (core):
"Brainstorme 10 Wege, dort sichtbar zu werden"

Test (YC tactics):
"Wähle 2. Teste je 1 Monat. €50 Budget. Was lernst du?"

→ Validates before scaling
```

**Success Metrics:**

- At least 3 channels defined: >90%
- Realistic budget allocated: 100%
- CAC (Customer Acquisition Cost) estimated: >80%
- Monthly marketing plan for Q1: 100%
- User can execute without consultant: >80%

---

### Module 06: Finance (Finanzplanung) ⭐ MOST CRITICAL

**Duration:** 180 minutes (3 hours!)  
**Coaching Challenges:**

- 30-50% of BA rejections happen here
- Users struggle with numbers
- Optimism bias in revenue
- Underestimate costs
- Self-sufficiency (Month 6 rule) often missed

**Load:**

```yaml
always:
  - gz-system-coaching-core

contextual:
  - gz-coaching-cbc (CRITICAL - challenge assumptions)
  - gz-coaching-mi (CRITICAL - when numbers look bad)
  - gz-coaching-sdt (maintain motivation through long module)

engines:
  - gz-engine-math (decimal.js calculations)
  - gz-engine-research (benchmark data)
```

**Why ALL THREE Contextual Coaches:**

**gz-coaching-cbc (Challenge Every Assumption):**

```
Section: Revenue Planning

User: "Ich plane €5.000 Umsatz in Monat 1"

CBC Pattern:
1. Identify: "€5.000 - wie kommst du darauf?"
   [User: "Habe geschätzt"]

2. Evidence: "Lass uns rechnen:
              - Preis pro Kunde?"
   [User: "€500"]

   "€5.000 / €500 = 10 Kunden in Monat 1.
    Hast du schon 10 Interessenten?"
   [User: "Nein, noch keine"]

3. Challenge: "10 Kunden von 0 in 30 Tagen ist ambitioniert.
               Was ist realistischer für Monat 1?"

4. Reframe: "Was wäre, wenn Monat 1 = Aufbau (€0-1.000)
             und Monat 3 = €5.000?

             Das gibt dir Zeit für Marketing."

5. Action: "Lass uns konservativen Plan machen:
            M1: €500 (1 Kunde als Referenz)
            M2: €1.500 (3 Kunden)
            M3: €3.000 (6 Kunden)

            Erreichbarer?"

→ Conservative = BA-compliant
```

**gz-coaching-mi (When Self-Sufficiency Fails):**

```
Scenario: Month 6 check fails

Math engine calculates:
- Month 6 net income: €1.200
- Private withdrawal: €2.000
- Gap: -€800
- Result: NOT self-sufficient

User: "Scheiße. Das funktioniert nicht."

MI Pattern (CRITICAL - prevent giving up):
1. Empathy: "Das ist frustrierend. Aber es ist GUT,
             dass wir das jetzt sehen, nicht in 6 Monaten."

2. Explore options (not advice):
   "Wir haben 3 Hebel:
    - Umsatz erhöhen
    - Kosten senken
    - Privatentnahme reduzieren

    Welcher fühlt sich am machbarsten an?"

3. Develop discrepancy:
   "Wenn du NICHTS änderst - was passiert?"
   [User: "BA lehnt ab, kein GZ"]

   "Und wenn du [user's chosen option] umsetzt?"
   [User: "Könnte funktionieren"]

4. Elicit commitment:
   "Was ist realistisch: Um wie viel kannst du [chosen option]?"
   [User decides own target]

5. Validate:
   "Ok, lass uns neu rechnen mit deinen Anpassungen"
   [Math engine recalculates]

   "Jetzt: Month 6 = €2.100 net, withdrawal = €2.000.
    Es funktioniert! Und es ist DEINE Entscheidung."

→ User owns solution, stays motivated
```

**gz-coaching-sdt (Sustain Motivation for 3 Hours):**

```
Challenge: Finance module is LONG and draining

SDT Pattern throughout:

Every 30 min - Autonomy check:
"Wir haben jetzt [X] geschafft.
 Als nächstes kommt [Y].

 Möchtest du kurze Pause oder direkt weiter?"

Every section - Competence validation:
"Sehr gut! Dein Kapitalbedarf ist jetzt klar (€15.800),
 sourced (aus deiner Liste + Recherche),
 und nachvollziehbar.

 Du siehst: Du KANNST das."

Every hour - Relatedness reminder:
"Das ist der härteste Teil des Businessplans.
 Die meisten Gründer struggeln hier.
 Aber du machst das gut - du fragst nach,
 du rechnest durch, du bist ehrlich bei Annahmen.

 Genau das will die BA sehen."

→ Maintains engagement through long session
```

**Finance Module Sections with Coaching:**

```typescript
Section 1: Kapitalbedarf (Investment Needs)
coach: gz-coaching-cbc
pattern: "List everything. No 'ungefähr'. Exact prices."

Section 2: Privatentnahme (Personal Withdrawal)
coach: gz-coaching-sdt
pattern: "This is YOUR life - what do you NEED to live well?"

Section 3: Revenue Planning (3 years)
coach: gz-coaching-cbc
pattern: "Break down to customers × price. Challenge every number."

Section 4: Cost Planning
coach: gz-coaching-cbc + gz-engine-research
pattern: "Research benchmarks. Don't underestimate."

Section 5: Liquidity Plan
coach: gz-engine-math + gz-coaching-mi
pattern: "Calculate exact. If Month 6 fails → MI recovery."

Section 6: Break-Even
coach: gz-coaching-sdt
pattern: "Celebrate if <18 months. If >18 → autonomous decision."
```

**Critical Math Checkpoints:**

```typescript
// After each section calculation

checkpoint_1: "Kapitalbedarf calculated"
  → Validate: All items priced, sources listed

checkpoint_2: "Revenue projections"
  → Validate: Customer count × Price = Total

checkpoint_3: "Cost structure"
  → Validate: Fixed + Variable separated

checkpoint_4: "Liquidity (Month 6)"
  → CRITICAL: Self-sufficiency check
  → If fails: gz-coaching-mi immediately

checkpoint_5: "Break-even"
  → Validate: <18 months for BA
  → If >18: gz-coaching-mi (not automatic failure)
```

**Success Metrics:**

- All numbers sourced or calculated: 100%
- Self-sufficiency achieved (Month 6): 100%
- Break-even <18 months: >90%
- User understands all calculations: >90%
- Math audit trail complete: 100%
- User still motivated after 3h: >80%

---

### Module 07: SWOT Analysis

**Duration:** 45 minutes  
**Coaching Challenges:**

- Users list only strengths (overconfident)
- Or only weaknesses (imposter syndrome)
- Threats often ignored ("optimism bias")
- Need balanced, honest assessment

**Load:**

```yaml
always:
  - gz-system-coaching-core

contextual:
  - gz-coaching-ai (CRITICAL - balance with strengths)
  - gz-coaching-cbc (if imposter syndrome detected)
```

**Why AI + CBC:**

**gz-coaching-ai (Start with Strengths):**

```
Typical SWOT order: S→W→O→T
Our order: S→O→W→T (positivity first)

Phase: STRENGTHS
"Lass uns bei deinen Stärken starten.

 Basierend auf allem, was wir besprochen haben:
 - Was kannst du besonders gut?
 - Was bringst du mit, das andere nicht haben?
 - Welche Erfolge hast du schon gehabt?"

[User lists 3-5 strengths]

Phase: OPPORTUNITIES
"Gut! Diese Stärken - wo könnten sie wirken?

 Welche Chancen siehst du:
 - Im Markt? (Trends, Lücken)
 - In deinem Netzwerk? (Partnerschaften)
 - Bei deinen Ressourcen? (Zeit, Kapital)"

[User sees how strengths enable opportunities]

→ Positive momentum BEFORE weaknesses
```

**gz-coaching-cbc (If Imposter Syndrome):**

```
Scenario: User lists many weaknesses, few strengths

User: "Meine Schwächen sind:
       - Keine Verkaufserfahrung
       - Keine Marketing-Kenntnisse
       - Wenig Kapital
       - Kein großes Netzwerk"

CBC Pattern:
1. Identify belief: "Du fokussierst stark auf Schwächen.
                     Was denkst du: Warum sollte das funktionieren?"

2. Evidence: "Lass uns genau hinschauen:
              - Hast du Projekte zum Erfolg geführt?" [Yes]
              - "Hast du komplexe Probleme gelöst?" [Yes]
              - "Hast du Menschen überzeugt (Chef, Team)?" [Yes]

3. Reframe: "Das SIND Verkaufs- und Marketing-Fähigkeiten.
             Nur in anderem Kontext.

             Schwäche ≠ 'kann ich nicht'
             Schwäche = 'habe ich noch nicht gemacht'"

4. Balanced view: "Ok, realistisch:
                   Stärken: [List from evidence]
                   Entwicklungsfelder: [Reframe weaknesses]

                   Keine 'Schwächen', sondern 'Lernfelder'.
                   BA will sehen: Du kennst deine Gaps UND
                   hast Plan, sie zu schließen."

5. Action: "Für jedes Lernfeld: Wie schließt du die Lücke?
            - Verkauf → 2 Bücher + Networking üben
            - Marketing → Online-Kurs + Mentor

            Das kommt in Meilensteine."

→ SWOT wird Aktionsplan, nicht Defizit-Liste
```

**SWOT Framework with Coaching:**

```
S-O Strategies (Leverage strengths for opportunities)
Core: "Welche deiner Stärken kannst du nutzen
       für welche Chancen?"

S-T Strategies (Use strengths to counter threats)
CBC: "Wie kannst du mit deinen Stärken Bedrohungen
      abwehren?"

W-O Strategies (Overcome weaknesses for opportunities)
AI: "Welche Schwäche ist eigentlich ein Vorteil?
     (z.B. 'klein' = 'agil')"

W-T Strategies (Minimize weaknesses & threats)
MI: "Was ist realistisch machbar - du musst nicht
     alle Schwächen sofort lösen"
```

**Success Metrics:**

- Balanced SWOT (not all S or all W): >90%
- All 4 quadrants filled: 100%
- Strategic derivations (SO/ST/WO/WT): >80%
- Actionable (not just lists): >90%

---

### Module 08: Milestones (Meilensteine)

**Duration:** 45 minutes  
**Coaching Challenges:**

- Users set unrealistic timelines
- Or too conservative (analysis paralysis)
- Dependencies not considered
- No contingency planning

**Load:**

```yaml
always:
  - gz-system-coaching-core

contextual:
  - gz-coaching-sdt (CRITICAL - user sets own timeline)
  - gz-coaching-cbc (challenge unrealistic timelines)
```

**Why SDT + CBC:**

**gz-coaching-sdt (User Owns Timeline):**

```
Autonomy Pattern:
❌ BAD: "Du musst in Q1 X erreichen, Q2 Y, Q3 Z"

✅ GOOD (SDT):
"Du hast 3 Jahre GZ-Periode geplant.
 Was willst DU in diesem Zeitraum erreichen?"

[User sets goals]

"Ok, du willst [goals]. Lass uns Meilensteine setzen.

 Denk realistisch: Wie lange brauchst du für [Milestone 1]?"

[User estimates]

"Das sind [X] Monate. Basierend auf was?"

[User explains reasoning]

"Klingt durchdacht. Was könnte dich verlangsamen?"

[User identifies risks]

"Gut! Lass uns Buffer einbauen:
 [X] Monate + 25% Puffer = [Y] Monate.

 Ist dir das sicherer?"

→ User owns timeline, realistic through dialogue
```

**gz-coaching-cbc (Challenge Aggressive Timelines):**

```
User: "Monat 1: Website + Produkte + Marketing + 10 Kunden"

CBC Pattern:
1. Identify: "Das ist viel für Monat 1.
              Lass uns durchgehen - was brauchst du für:

              Website: [time]
              Produkte: [time]
              Marketing: [time]
              10 Kunden: [time]"

2. Calculate: "Website (40h) + Produkte (60h) + Marketing (20h) +
               Sales (30h) = 150h

               Du hast 160h in Monat 1 (40h/Woche × 4 Wochen).
               Das ist 94% Auslastung ohne Puffer."

3. Challenge: "Was, wenn etwas schiefgeht?
               Was, wenn Website 50h braucht statt 40h?"

4. Reframe: "Aggressiv ist gut - Momentum ist wichtig.
             Aber lass uns priorisieren:

             Monat 1 MUST-HAVES:
             - Website (MVP, nicht perfekt)
             - 3 Produkte (nicht alle)
             - 2-3 Kunden (Referenzen)

             Monat 2 NICE-TO-HAVES:
             - Website polieren
             - Mehr Produkte
             - 10 Kunden Ziel"

5. Action: "Das gibt dir Erfolgserlebnisse in Monat 1
            UND Puffer für Unerwartetes."

→ Realistic while maintaining momentum
```

**90-Day Plan Pattern (core GROW):**

```
Goal: "Was willst du in 90 Tagen erreicht haben?"

Reality: "Was hast du schon? Was brauchst du noch?"

Options: "Welche Schritte führen dahin?
          Lass uns brainstormen - keine schlechte Idee"

Will: "Von allem: Was sind die 3 wichtigsten Schritte?
       Wann machst du jeden?"

→ Creates timeline
```

**3-Year Roadmap Pattern:**

```
Year 1: Aufbau (Foundation)
- Q1: MVP + erste Kunden
- Q2: Iteration + Feedback
- Q3: Stabilisierung
- Q4: Skalierung vorbereiten

Year 2: Wachstum (Growth)
- Q1-Q2: Kundenbasis ausbauen
- Q3-Q4: Team / Prozesse

Year 3: Reife (Maturity)
- Profitable Operationen
- Unabhängig von GZ

Coach: "Das ist Framework. Füll es mit deinen Zielen."
```

**Success Metrics:**

- 90-day plan actionable: 100%
- 3-year roadmap defined: >90%
- Dependencies identified: >80%
- Contingency for key milestones: >70%
- User believes timeline achievable: >80%

---

### Module 09: KPIs (Kennzahlen)

**Duration:** 30 minutes  
**Coaching Challenges:**

- Users confuse vanity metrics with KPIs
- Tracking feels like extra work
- Need simple, actionable metrics

**Load:**

```yaml
always:
  - gz-system-coaching-core

contextual:
  - gz-coaching-sdt (metrics user cares about)
```

**Why SDT:**

**gz-coaching-sdt (Autonomy in Metrics):**

```
Competence Pattern:
❌ BAD: "Du musst diese 15 KPIs tracken"

✅ GOOD (SDT):
"KPIs sind Frühwarnsystem. Welche Zahlen würden DIR zeigen:
 - Business läuft gut?
 - Business hat Problem?

 Denk an 3-5 Zahlen, die du wöchentlich checken würdest."

[User suggests metrics]

"Ok, du hast [metrics]. Lass uns prüfen:

 Für jede:
 - Ist sie steuerbar? (Kannst du sie beeinflussen?)
 - Ist sie vorlaufend? (Zeigt Zukunft, nicht Vergangenheit?)
 - Ist sie einfach zu messen? (Ohne Excel-Akrobatik?)

[Filter out vanity metrics]

"Diese 3 bleiben: [filtered KPIs]
 Das ist dein Dashboard. Simple. Machbar."

→ User owns metrics, will actually track
```

**Leading vs. Lagging Indicators:**

```
Socratic Pattern (core):
"Du hast 'Umsatz' als KPI. Das ist lagging (Vergangenheit).

 Was führt ZU Umsatz? Was kommt DAVOR?"

[User: "Kundengespräche"]

"Genau! 'Anzahl Gespräche/Woche' ist leading.
 Wenn Gespräche sinken → Umsatz sinkt (2 Monate später)

 Du kannst früher reagieren."

→ User versteht Logik selbst
```

**Success Metrics:**

- 3-5 KPIs defined: 100%
- Mix of leading + lagging: >80%
- Tracking method defined: 100%
- User can explain why each KPI matters: >90%

---

### Module 10: Summary (Zusammenfassung)

**Duration:** 30 minutes  
**Coaching Challenges:**

- Synthesize 9 modules into 1-2 pages
- Highlight most compelling points
- Create "hook" for BA reader

**Load:**

```yaml
always:
  - gz-system-coaching-core

contextual:
  - gz-coaching-ai (CRITICAL - appreciative synthesis)
```

**Why AI:**

**gz-coaching-ai (Appreciative Summary):**

```
Synthesize with positivity:

"Wir haben 9 Module durchgearbeitet. Lass uns die Highlights rausholen:

DISCOVER (Was hast du geschafft?)
- Klare Geschäftsidee mit USP
- Validierte Zielgruppe
- Durchgerechnete Finanzen
- Realistischer Plan

DREAM (Vision nochmal betonen)
- In 3 Jahren bist du [user's vision from intake]
- Das ermöglicht dir [user's motivation]

DESIGN (How you'll get there)
- Jahr 1: [key milestones]
- Jahr 2-3: [growth path]

DESTINY (Call to action for BA)
- Du bist bereit
- Plan ist tragfähig
- GZ ermöglicht den Start

→ Positive, confident summary"
```

**Hook Formula (YC-style):**

```
"[Problem] ist ein €X Markt in Deutschland.

 Aktuell wird es gelöst durch [current solution],
 aber [pain point].

 [Your business] bietet [solution] durch [USP].

 Mit [your background] und [traction],
 ziele ich auf [target] in [timeframe].

 Der Gründungszuschuss ermöglicht mir [what you need it for]."

Coach: "Das ist dein Pitch. 30 Sekunden. BA liest das zuerst."
```

**Success Metrics:**

- Summary 1-2 pages: 100%
- Includes all 9 modules: 100%
- Hook compelling: >80%
- User can present verbally: >90%

---

## Implementation Strategy

### Token Budget Management

```yaml
total_context_budget: 168000  # Safe limit

per_module_allocation:
  layer1_always:
    - gz-system-orchestrator: 3000
    - gz-system-constraints: 2000
    - gz-system-coaching-core: 2000
    total: 7000
    caching: aggressive

  layer2_contextual:
    max_per_module: 3000  # 1-2 coaching extensions
    caching: 5min TTL

  module_skill: 4000
  workshop_data: 40000
  conversation: 50000
  reserve: 64000
```

### Loading Strategy

```typescript
async function loadCoachingForModule(
  moduleName: string,
  context: ModuleContext
): Promise<Coach[]> {
  // Always loaded (cached)
  const core = ['gz-system-coaching-core'];

  // Module-specific
  const moduleCoaching = {
    intake: ['gz-coaching-stage', 'gz-coaching-ai', 'gz-coaching-mi'],
    model: ['gz-coaching-cbc', 'gz-coaching-mi'],
    company: ['gz-coaching-sdt', 'gz-coaching-cbc'],
    market: ['gz-coaching-mi', 'gz-coaching-cbc'],
    marketing: ['gz-coaching-cbc', 'gz-coaching-mi'],
    finance: ['gz-coaching-cbc', 'gz-coaching-mi', 'gz-coaching-sdt'],
    swot: ['gz-coaching-ai', 'gz-coaching-cbc'],
    milestones: ['gz-coaching-sdt', 'gz-coaching-cbc'],
    kpi: ['gz-coaching-sdt'],
    summary: ['gz-coaching-ai'],
  }[moduleName];

  return [...core, ...moduleCoaching];
}
```

### Cost Optimization

```typescript
// Caching reduces costs dramatically

Module without caching:
- Core: 2000 tokens × 50 messages = 100k tokens write
- Extensions: 3000 tokens × 50 messages = 150k tokens write
- Total: 250k tokens write = $0.75

Module with caching:
- Core: 2000 tokens write once, then cached reads
- Extensions: 3000 tokens × 50 messages = 150k tokens write
- Total: 155k tokens = $0.47

Savings: 37% per module
Workshop (10 modules): $4.70 vs $7.50 = $2.80 saved
```

---

## Quality Assurance

### Per-Module Coaching Checks

```typescript
function validateCoachingQuality(
  module: string,
  conversation: Message[]
): QualityScore {
  const checks = {
    intake: {
      stage_detected: hasStageDetection(conversation),
      strengths_discovered: hasAppreciativeInquiry(conversation),
      ambivalence_handled: hasMIpatterns(conversation),
    },

    finance: {
      assumptions_challenged: hasCBCpatterns(conversation),
      empathy_on_bad_news: hasMIpatterns(conversation),
      motivation_sustained: hasSDTpatterns(conversation),
      all_numbers_sourced: hasSourceValidation(conversation),
    },

    // ... etc for each module
  };

  return calculateScore(checks[module]);
}
```

---

## Summary: Modular Coaching Benefits

**Advantages:**

1. **Targeted:** Right coaching for right challenge
2. **Efficient:** Only load what's needed (token budget)
3. **Maintainable:** Update one coaching skill without affecting others
4. **Testable:** Validate each coaching skill independently
5. **Scalable:** Add new coaching skills as research evolves

**Cost:**

- Core + 2 extensions per module: ~5k tokens
- With caching: ~$0.015 per module
- Full workshop: ~$0.15 (vs $1.50 without caching)

**Next Steps:**

1. Create 6 coaching skills (core + 5 extensions)
2. Test with synthetic personas per module
3. Validate quality metrics
4. Refine based on results

**Ready to proceed with creating the actual coaching skills?**
