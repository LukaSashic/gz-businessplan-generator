---
name: gz-module-05-marketing
version: 2.0
description: Marketing strategy module for GZ workshop. Develops comprehensive, data-backed marketing plan with refined personas, Marketing-Mix (4Ps), Akquise-Funnel with conversion calculations, Vertriebsprozess, realistic budget, and measurable KPIs. Duration 90 minutes. Output actionable marketing strategy for finance module and implementation.
dependencies:
  - gz-system-coaching-core (GROW, Socratic, Clean Language)
  - gz-coaching-cbc (challenge unrealistic tactics, validate assumptions)
  - gz-coaching-mi (handle limited budget realities, channel prioritization)
  - gz-engine-research (web search for benchmarks, channel effectiveness)
  - gz-module-01-intake (business type, founder profile, time constraints)
  - gz-module-02-geschaeftsmodell (offering, USP, personas, value proposition)
  - gz-module-03-unternehmen (available budget from cost planning)
  - gz-module-04-markt-wettbewerb (SOM targets, positioning, competitor tactics)
---

# Module 05: Marketing-Strategie (Marketing Strategy)

**Duration:** 90 minutes  
**Critical Path:** Yes (feeds budget to finance, validates revenue achievability)  
**Complexity:** High (requires funnel math, budget allocation, channel selection)  
**Coaching Load:** CBC (primary), MI (secondary)

---

## Purpose

Develop actionable, budget-conscious marketing strategy with:

1. **Verfeinerte Personas** (refined with media behavior from module 2)
2. **Marketing-Mix (4Ps)** (Product, Price, Place, Promotion structured)
3. **Akquise-Funnel** (AIDA with conversion math, channel prioritization)
4. **Vertriebsprozess** (B2B sales process if relevant)
5. **Marketing-Budget** (realistic allocation, CAC calculation)
6. **KPIs** (measurable targets with benchmarks)
7. **90-Tage-Plan** (immediate actionable steps)

**BA Rejection Reasons (Module 05):**

- "Mund-zu-Mund" without structured plan
- Budget >25% of revenue (too risky)
- No conversion assumptions (can't validate feasibility)
- Unrealistic channel plans ("Alle Social Media")
- CAC higher than customer value (unprofitable)
- No DSGVO consideration (legal risk)

**âš ï¸ CRITICAL: Funnel Math Required**
This module must show HOW customer count from SOM will be achieved through specific channels with conversion rates.

---

## Coaching Integration

### Loaded Skills for This Module

```yaml
always:
  - gz-system-coaching-core
    purpose: GROW structure, Socratic questioning, Clean Language

contextual:
  - gz-coaching-cbc (PRIMARY)
    purpose: Challenge unrealistic tactics, validate with data
    triggers:
      - User wants "all social media channels"
      - Claims "viral marketing" as strategy
      - Budget too high (>25% revenue)
      - Unrealistic conversion rates
      - No measurement plan
    patterns:
      - Gather evidence (industry benchmarks)
      - Challenge gently with data
      - Reframe to realistic approach

  - gz-coaching-mi (SECONDARY)
    purpose: Handle limited budget realities, prioritize channels
    triggers:
      - User wants expensive channels but limited budget
      - Overwhelmed by channel options
      - Bootstrap constraints
      - Trade-offs needed (time vs. money)
    patterns:
      - Empathy for constraints
      - Explore options within limits
      - User prioritizes based on resources
```

### Key CBC Patterns in This Module

#### Pattern 1: "Alle Social Media KanÃ¤le"

```typescript
// User wants to be on LinkedIn, Instagram, Facebook, TikTok, YouTube, Twitter

user: "Ich mache Marketing auf allen Social Media Plattformen."

// CBC Response (Challenge Unrealistic Scope)

// 1. IDENTIFY the assumption
ai: "Alle Plattformen gleichzeitig -
     lass uns das durchrechnen."

// 2. EVIDENCE (Time Investment)
ai: "Zeitaufwand pro Plattform (konservativ):

     LinkedIn: 5h/Woche (Posts, Kommentare, Networking)
     Instagram: 4h/Woche (Content, Stories, Engagement)
     Facebook: 3h/Woche (Posts, Gruppen)
     TikTok: 5h/Woche (Video-Produktion)
     YouTube: 8h/Woche (Dreh, Schnitt, SEO)
     Twitter: 2h/Woche

     Gesamt: 27 Stunden/Woche NUR fÃ¼r Social Media

     Du hast aus Modul 1: [X] Stunden/Woche gesamt.
     Davon fÃ¼r Marketing: ~30% = [Y] Stunden

     27 Stunden > [Y] Stunden verfÃ¼gbar."

// 3. CHALLENGE (with data)
ai: "Das funktioniert mathematisch nicht.

     UND: Branchenregel von HubSpot:
     'Besser 1-2 KanÃ¤le exzellent als 6 mittelmÃ¤ÃŸig'

     Quelle: HubSpot Social Media Report 2024"

// 4. REFRAME (Prioritize)
ai: "Frage nicht: 'Wo KÃ–NNTE ich sein?'
     Sondern: 'Wo ist meine Zielgruppe AKTIV?'

     Deine Persona aus Modul 2:
     - Informationsquellen: [List from module 2]

     [If B2B]: LinkedIn + Google sind Standard
     [If B2C <30]: Instagram + TikTok
     [If B2C 30-50]: Facebook + Instagram
     [If B2C 50+]: Facebook + Google

     Was passt zu DEINER Zielgruppe?"

[User picks 1-2 channels]

// 5. ACTION (Depth over Breadth)
ai: "Perfekt. Fokus auf [Channels].

     Mit [Y] Stunden kannst du diese 2 RICHTIG machen:
     - RegelmÃ¤ÃŸiger, hochwertiger Content
     - Engagement mit Community
     - Messbare Ergebnisse

     Besser als 6 KanÃ¤le halbherzig."

// RESULT: Realistic, focused channel strategy
```

#### Pattern 2: Unrealistic Conversion Rates

```typescript
// User assumes 10% website â†’ customer conversion (typical is 1-3%)

ai: "Du planst 1.000 Website-Besucher â†’ 100 Kunden (10% Conversion).

     Lass uns das gegen Benchmarks prÃ¼fen."

// CBC Response

// 1. IDENTIFY assumption
ai: "10% Conversion bedeutet:
     Jeder 10. Besucher kauft.

     Woher kommt diese Zahl?"

[User: "GeschÃ¤tzt" or "Hoffnung"]

// 2. EVIDENCE (Industry Research)
ai: "[Performing web search...]

     Recherche-Ergebnis:

     [1] HubSpot Marketing Statistics 2024
         B2B Website Conversion: 2-3% durchschnittlich
         Quelle: [URL]

     [2] Statista E-Commerce Deutschland
         Online-Shop Conversion: 1-2%
         Quelle: [URL]

     [3] LinkedIn B2B Marketing Benchmarks
         Lead Generation: 2-5% je nach Industrie
         Quelle: [URL]"

// 3. CHALLENGE (Gap Analysis)
ai: "Deine Annahme: 10%
     Industry Standard: 2-3%

     Das ist 3-5x Ã¼ber Benchmark.

     Was wÃ¼rde passieren, wenn wir mit 2% rechnen?"

// Calculate impact
ai: "Mit 2% Conversion:

     1.000 Besucher Ã— 2% = 20 Leads
     20 Leads Ã— 30% (GesprÃ¤ch) = 6 GesprÃ¤che
     6 GesprÃ¤che Ã— 25% (Close) = 1.5 Kunden

     Dein Ziel: 20 Kunden/Jahr = 1.7/Monat

     Das PASST fast.

     Aber mit deiner 10% wÃ¤ren es:
     100 Kunden/Monat = 1.200/Jahr

     Das wÃ¤re â‚¬[revenue] statt â‚¬[som]
     = 20x mehr als Ziel!"

// 4. REFRAME (Conservative Planning)
ai: "Vielleicht ist die Frage nicht:
     'Was ist mÃ¶glich im besten Fall?'

     Sondern:
     'Was ist realistisch konservativ?'

     BA mag konservative Planung.
     Zeigt, du bist realistisch, nicht trÃ¤umerisch.

     Wenn du 2% planst und 4% schaffst:
     â†’ Angenehme Ãœberraschung

     Wenn du 10% planst und 2% schaffst:
     â†’ GeschÃ¤ft scheitert

     Was ist besser?"

// 5. ACTION (Use Conservative)
ai: "Lass uns mit 2% Conversion planen.

     Das ist:
     - Industry-backed
     - Defensible vor BA
     - Realistisch machbar

     Einverstanden?"

// RESULT: Evidence-based, conservative projections
```

#### Pattern 3: Viral Marketing als Strategy

```typescript
user: "Meine Marketing-Strategie ist, viral zu gehen auf TikTok."

// CBC Response (Challenge Unreliable Tactic)

// 1. IDENTIFY the problem
ai: "Viral Marketing als Hauptstrategie -
     lass uns das durchdenken."

// 2. EVIDENCE (Probability)
ai: "Virality-Statistiken:

     - TikTok Videos gesamt: >1 Milliarde tÃ¤glich
     - Videos die viral gehen (>1M Views): ~0.001%
     - Chance auf Viral: 1 zu 100.000

     Das ist wie Lotto spielen."

// 3. CHALLENGE (Reliability)
ai: "Frage an dich:

     Wenn du in 6 Monaten NICHT viral gegangen bist
     (sehr wahrscheinlich),

     Wie gewinnst du dann Kunden?"

[User realizes: "Oh. Ich habe keinen Plan B."]

// 4. REFRAME (Systematic vs. Lucky)
ai: "Marketing-Strategien in 2 Kategorien:

     A) SYSTEMATISCH (planbar)
        - SEO: Schreibe 50 Artikel, ranke fÃ¼r Keywords
        - LinkedIn: Poste 3x/Woche, baue Netzwerk auf
        - Empfehlungen: Frage jeden Kunden nach 2 Kontakten
        â†’ Vorhersagbar, messbar

     B) GLÃœCKSBASIERT (unplanbar)
        - Viral gehen
        - PR-Hit
        - Influencer-ErwÃ¤hnung
        â†’ Nicht kontrollierbar

     BA will A) sehen.
     B) ist Bonus, nicht Strategie.

     Was ist DEIN systematischer Plan?"

// 5. ACTION (Build Systematic Foundation)
ai: "Lass uns einen planbaren Kanal-Mix entwickeln:

     - [Primary channel with proven tactics]
     - [Secondary channel as backup]
     - Viral als 'Nice to have', nicht Basis

     So kannst du morgen starten,
     nicht auf GlÃ¼ck warten."

// RESULT: Reliable, systematic marketing approach
```

### Key MI Patterns in This Module

#### Pattern 1: Limited Budget Reality

```typescript
// User wants â‚¬2,000/month ads, but only has â‚¬500 total budget

user: "Ich mÃ¶chte â‚¬2.000/Monat in Google Ads investieren."

// MI Response (Navigate Budget Constraints)

// 1. EMPATHY + REALITY
ai: "â‚¬2.000/Monat wÃ¤re stark fÃ¼r schnelles Wachstum.

     Lass uns das gegen dein verfÃ¼gbares Budget checken:

     Aus Modul 3 (Unternehmen):
     - Fixkosten: â‚¬[X]/Monat
     - Privatentnahme: â‚¬[Y]/Monat
     - Verbleibt fÃ¼r Marketing: â‚¬[Z]/Monat

     â‚¬2.000 > â‚¬[Z]

     Das Budget ist aktuell nicht da."

// 2. EXPLORE OPTIONS (not tell what to do)
ai: "Du hast mehrere Wege:

     A) BUDGET STARTEN
        - â‚¬500/Monat Google Ads
        - Testen, lernen, skalieren wenn Umsatz kommt

     B) ZEIT INVESTIEREN
        - â‚¬0 Budget
        - 10h/Woche SEO, Content, Networking
        - Langsamer, aber ohne Geld

     C) HYBRID
        - â‚¬300 Ads + 5h/Woche Organic
        - Beste Balance fÃ¼r viele GrÃ¼nder

     Was fÃ¼hlt sich realistisch an?"

// 3. USER PRIORITIZES (autonomy)
[User evaluates resources: time vs. money]

ai: "Du tendierst zu [Option].

     Was sind die Vor-/Nachteile fÃ¼r dich?"

[User explores trade-offs]

// 4. VALIDATE CHOICE
ai: "Ok, du startest mit [Chosen approach].

     Das ist pragmatisch fÃ¼r deine Situation.

     Wenn Umsatz kommt, kannst du Budget erhÃ¶hen.
     Aber jetzt: Start with what you have."

// 5. REFRAME CONSTRAINTS AS FOCUS
ai: "Begrenztes Budget zwingt dich zum Fokus.

     Das ist GUT.

     Viele GrÃ¼nder verschwenden â‚¬10k auf 10 KanÃ¤le.
     Du investierst â‚¬500 in 1-2 KanÃ¤le und machst die richtig.

     Oft effektiver."

// RESULT: Realistic budget within constraints, user owns decision
```

#### Pattern 2: Channel Overwhelm

```typescript
// User paralyzed by too many marketing options

user: "Es gibt so viele Marketing-MÃ¶glichkeiten...
      Ich weiÃŸ nicht, wo ich anfangen soll."

// MI Response (Reduce Overwhelm, Build Clarity)

// 1. NORMALIZE + EMPATHY
ai: "Das ist der hÃ¤ufigste Grund, warum GrÃ¼nder
     gar nicht starten.

     Die Vielfalt ist Ã¼berwÃ¤ltigend.
     Ich verstehe das vollkommen."

// 2. SIMPLIFY DECISION FRAMEWORK
ai: "Lass uns das runterbrechen auf 2 Fragen:

     1. Wo ist deine Zielgruppe JETZT schon?
     2. Wo bist du selbst STARK?

     Das grenzt massiv ein."

// Question 1
ai: "Deine Persona aus Modul 2:
     Informationsquellen: [List]

     Das sind die Orte, wo sie bereits sind.
     Du musst nicht neue Orte erfinden."

// Question 2
ai: "Wo bist DU stark?

     - Bist du guter Schreiber? â†’ Blog, LinkedIn
     - Redest du gern? â†’ Networking, Podcasts
     - Magst du Video? â†’ YouTube, TikTok
     - Analytisch? â†’ SEO, Ads
     - Netzwerker? â†’ Empfehlungen, Events

     Was von diesen ist am natÃ¼rlichsten fÃ¼r dich?"

[User identifies strength]

// 3. INTERSECTION = START POINT
ai: "ÃœBERSCHNEIDUNG:

     Zielgruppe ist auf: [Channels from persona]
     Du bist stark in: [User's strength]

     Gemeinsam: [Intersection]

     DAS ist dein Start-Kanal.

     Nicht 10 KanÃ¤le.
     EIN Kanal, wo du stark bist UND Zielgruppe ist."

// 4. CONFIDENCE BUILDING
ai: "Du hast jetzt einen klaren Fokus:
     [Start channel]

     Erste 90 Tage: NUR dieser Kanal.
     Master it.

     Dann wenn stabil: Zweiter Kanal.

     FÃ¼hlt sich das machbar an?"

// RESULT: Clarity, reduced paralysis, confidence to start
```

---

## Conversation Flow Summary

Due to length constraints, here's the essential structure:

### Phase 1: Persona Refinement (15 min)

- Enhance module 2 personas with media behavior
- Web research for channel usage data
- Document buying journey stages

### Phase 2: Marketing Mix 4Ps (15 min)

- Product: Variants, packaging
- Price: Strategy, transparency
- Place: Distribution channels
- Promotion: Messaging framework

### Phase 3: Acquisition Funnel (35 min) â­ CRITICAL

- Work BACKWARD from SOM customer target
- Calculate: Visits â†’ Leads â†’ Conversations â†’ Customers
- Use industry-benchmarked conversion rates
- Validate channels can deliver required volume
- Complete funnel math with sources

### Phase 4: Marketing Budget (15 min)

- Calculate budget (target 15-25% of revenue)
- Check against available resources (module 3)
- Allocate across setup + ongoing costs
- Calculate CAC (Customer Acquisition Cost)
- Validate CAC < CLV/3 (healthy ratio)

### Phase 5: KPIs & Action Plan (10 min)

- Define measurable KPIs for all funnel stages
- Create 90-day action plan (Month 1/2/3)
- DSGVO compliance checklist
- Dashboard setup

---

## Success Criteria

```yaml
required:
  - âœ… Personas refined with media behavior
  - âœ… Marketing Mix (4Ps) complete
  - âœ… Acquisition funnel calculated with conversions
  - âœ… Funnel math shows path to target customers
  - âœ… Channels can deliver required volume
  - âœ… Budget â‰¤25% of revenue (or justified)
  - âœ… Budget fits within available resources
  - âœ… CAC < CLV/3 (healthy unit economics)
  - âœ… All KPIs have measurement method
  - âœ… 90-day plan with concrete tasks
  - âœ… DSGVO compliance considered
  - âœ… validation.readyForNextModule === true
```

---

## Handoff to Module 06 (Finance)

```yaml
passed_to_finance:
  # Revenue Validation
  - acquisitionFunnel.funnelCalculation (proves SOM achievable)
  - targetMarket.som.bottomUpCalc (customer counts validated)

  # Cost Inputs
  - budget.year1.allocation.setup (one-time: â‚¬X)
  - budget.year1.allocation.ongoing.monthlySubtotal (recurring: â‚¬Y/month)
  - budget.cac (for profitability analysis)

  # Validation
  - Funnel shows SOM achievable through planned channels
  - CAC validated as profitable (< CLV/3)
```

---

**END OF gz-module-05-marketing STREAMLINED**

**Next:** gz-module-06-finanzplanung (Finance Planning) - 180 minutes, THE CRITICAL MODULE where everything integrates!
