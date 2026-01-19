# Workshop Modules - Detailed Specifications

**Version:** 1.0
**Last Updated:** 2026-01-19

---

## Module Overview

| # | Module ID | Name | Duration | Dependencies |
|---|-----------|------|----------|--------------|
| 0 | gz-intake | Intake & Assessment | 45 min | None |
| 1 | gz-geschaeftsmodell | Geschäftsmodell | 70 min | 0 |
| 2 | gz-unternehmen | Unternehmen | 60 min | 0, 1 |
| 3 | gz-markt-wettbewerb | Markt & Wettbewerb | 90 min | 0-2 |
| 4 | gz-marketing | Marketing & Vertrieb | 90 min | 0-3 |
| 5 | gz-finanzplanung | Finanzplanung | 180 min | 1-4 |
| 6 | gz-swot | SWOT-Analyse | 45 min | 0-5 |
| 7 | gz-meilensteine | Meilensteine | 45 min | 0-6 |
| 8 | gz-kpi | KPIs | 45 min | 0-7 |
| 9 | gz-zusammenfassung | Zusammenfassung | 30 min | 0-8 |

---

## Module 0: Intake & Assessment

### Purpose
Capture user's situation, business idea, personality, and determine business type.

### Phases

#### Phase 1: Warm-up (5 min)
**Approach:** Appreciative Inquiry DISCOVER
```
"Bevor wir in die Details gehen - erzähl mir von einem beruflichen Erfolg,
auf den du stolz bist. Was hast du da gut gemacht?"
```
**Output:** `discoveredStrengths[]`

#### Phase 2: Basic Context (5 min)
**Questions:**
- Beruflicher Status (employed/unemployed/other)
- ALG I Status (if unemployed) - CRITICAL: exact days remaining
- Geplanter Starttermin
- Zeitbudget (Vollzeit/Teilzeit)

**Blocking Check:** If unemployed, MUST get exact ALG days.
```
"Für den Gründungszuschuss ist die exakte Anzahl wichtig.
Wie viele Tage ALG I-Restanspruch stehen in deinem Bescheid?"
```

#### Phase 3: Business Idea (10 min)
**Questions:**
- Was ist deine Geschäftsidee? (Elevator Pitch)
- Welches Problem löst du?
- Wer hat dieses Problem?
- Warum du? (Unique qualification)

**Output:** `businessIdea` object

#### Phase 4: Founder Profile (10 min)
**Questions:**
- Berufliche Erfahrung (Jahre, Rollen)
- Qualifikationen (Ausbildung, Zertifikate)
- Frühere Gründungserfahrung
- Motivation (Push/Pull)

**Output:** `founder` object

#### Phase 5: Personality Assessment (15 min)
**Approach:** Howard's 7 dimensions through conversation
- Innovativeness
- Risk-taking
- Achievement orientation
- Proactiveness
- Locus of control
- Self-efficacy
- Autonomy

**Output:** `personality` object with narrative

#### Phase 6: Business Type Classification (3 min)
**Determination:** Based on answers, classify into one of 15 types
**Output:** `businessType` object

#### Phase 7: Validation (2 min)
**Checks:**
- GZ eligibility (ALG days ≥ 150)
- Major concerns identified
- Strengths summarized

**Output:** `validation` object

### Coaching Focus
- **Primary:** Appreciative Inquiry (Discover)
- **Secondary:** TTM Stage Detection
- **Watch for:** Precontemplation indicators

### Transition to Module 1
```
"Super, ich habe jetzt ein gutes Bild von dir und deiner Idee.
Deine Stärken liegen besonders in [X, Y, Z].
Im nächsten Modul schauen wir uns dein Geschäftsmodell genauer an."
```

---

## Module 1: Geschäftsmodell

### Purpose
Define clear offering, specific target audience, customer value proposition, and USP.

### Phases

#### Phase 1: Angebot (15 min)
**GROW:** Goal & Reality
**Questions:**
- Was bietest du konkret an?
- Wie wird es geliefert? (physisch/digital/service)
- Was ist NICHT enthalten?
- Kannst du es in einem Satz erklären? (Oma-Test)

**Output:** `offering` object

**Coaching Pattern:**
```
If vague: "Stell dir vor, jemand fragt am Fahrstuhl: Was machst du?
         Was antwortest du in 30 Sekunden?"
```

#### Phase 2: Zielgruppe (20 min)
**GROW:** Reality deep-dive
**Questions:**
- Wer genau kauft das? (nicht "alle")
- Wo findest du diese Menschen?
- Was ist ihr größtes Problem?
- Was haben sie schon probiert?
- Was würde sie zum Kauf bewegen?

**Output:** `targetAudience.primaryPersona` object

**Coaching Pattern (too broad):**
```
"'Alle KMUs' ist sehr breit. Wenn du nur 10 Kunden im ersten Jahr
gewinnen könntest - welche wären das genau?"
```

#### Phase 3: Wertversprechen (15 min)
**Approach:** Value Proposition Canvas
**Questions:**
- Customer Jobs: Was will dein Kunde erreichen?
- Customer Pains: Was frustriert ihn?
- Customer Gains: Was würde ihn begeistern?
- Pain Relievers: Wie löst du seine Probleme?
- Gain Creators: Wie schaffst du Mehrwert?

**Output:** `valueProposition` object

**Synthesis:**
```
"[Zielgruppe] kann mit [Angebot] [Ergebnis erreichen],
ohne [Problem/Schmerz]."
```

#### Phase 4: USP (20 min)
**GROW:** Options & Will
**Questions:**
- Was unterscheidet dich von Wettbewerbern?
- Warum sollte jemand dich wählen statt Alternative?
- Wie kannst du das beweisen?

**USP Test:**
- Unique: Kann ein Wettbewerber das gleiche behaupten?
- Relevant: Interessiert das die Zielgruppe?
- Provable: Kannst du es belegen?
- Understandable: Ist es in 5 Sekunden klar?

**Output:** `usp` object

**Coaching Pattern (not unique):**
```
"'Gute Qualität' kann jeder sagen. Was ist es, das NUR DU bieten kannst?
Denk an deine Erfahrung, deine Methode, dein Ergebnis."
```

### Coaching Focus
- **Primary:** CBC (for vague statements, limiting beliefs)
- **Secondary:** Socratic questioning (depth levels 3-5)
- **Watch for:** "Ich bin kein Verkäufer" belief

### BA Requirements
- Angebot klar und konkret
- Zielgruppe spezifisch (nicht "alle")
- USP differenziert

---

## Module 2: Unternehmen

### Purpose
Define legal structure, team, location, and organization.

### Phases

#### Phase 1: Rechtsform (15 min)
**Questions:**
- Welche Rechtsform planst du?
- Warum diese Form?
- Haftungskonsequenzen bekannt?
- Steuerliche Auswirkungen?

**Business Type Specific:**
- Handwerk → Meisterpflicht Check
- Freiberufler → §18 EStG Check
- Regulated → Permits needed

**Output:** `rechtsform` object

#### Phase 2: Gründungsteam (15 min)
**Questions:**
- Gründest du allein oder im Team?
- Wer bringt welche Kompetenzen ein?
- Wie werden Entscheidungen getroffen?
- Wie werden Konflikte gelöst?

**Output:** `gruendungsteam` object

#### Phase 3: Standort (15 min)
**Questions:**
- Von wo aus arbeitest du?
- Warum dieser Standort?
- Welche Ausstattung brauchst du?
- Welche Kosten fallen an?

**Output:** `standort` object

#### Phase 4: Organisation (15 min)
**Questions:**
- Brauchst du Mitarbeiter?
- Was wirst du outsourcen?
- Welche Partner brauchst du?

**Output:** `organisation` object

### Coaching Focus
- **Primary:** GROW (practical planning)
- **Secondary:** Options exploration (analysis paralysis)

---

## Module 3: Markt & Wettbewerb

### Purpose
Analyze market size, competition, and positioning.

### Phases

#### Phase 1: Marktanalyse (25 min)
**Questions:**
- Wie groß ist dein Markt? (TAM/SAM/SOM)
- Wo kommen diese Zahlen her?
- Wächst oder schrumpft der Markt?
- Was treibt den Markt?

**Coaching Pattern (no data):**
```
"'Der Markt ist groß' reicht für die BA nicht.
Lass mich recherchieren, was ich über [Branche] in [Region] finde."
```

**Output:** `marktanalyse` object

#### Phase 2: Zielmarkt (20 min)
**Questions:**
- Auf welche Region konzentrierst du dich?
- Welche Kundensegmente?
- Gibt es Saisonalität?

**Output:** `zielmarkt` object

#### Phase 3: Wettbewerbsanalyse (30 min)
**BA Requirement:** Minimum 3 Wettbewerber

**Per Competitor:**
- Name und Angebot
- Stärken und Schwächen
- Preispositionierung
- Dein Vorteil vs. diesem Wettbewerber

**Coaching Pattern (no competitors):**
```
"Wenn es wirklich keine Wettbewerber gibt, fragen sich Gutachter:
Gibt es überhaupt einen Markt? Lass uns nach indirekten
Wettbewerbern oder Alternativen suchen."
```

**Output:** `wettbewerbsanalyse` object

#### Phase 4: Positionierung (15 min)
**Questions:**
- Wo positionierst du dich? (Preis vs. Qualität)
- Was ist dein Alleinstellungsmerkmal?
- Welche Marktlücke füllst du?

**Output:** `positionierung` object

### Coaching Focus
- **Primary:** Socratic questioning (reality check)
- **Secondary:** MI (for competition anxiety)
- **Watch for:** Overconfidence OR fear

---

## Module 4: Marketing & Vertrieb

### Purpose
Define marketing strategy, channels, pricing, and sales approach.

### Phases

#### Phase 1: Marketingstrategie (20 min)
**Questions:**
- Was ist deine Kernbotschaft?
- Wie erreichst du deine Zielgruppe?
- Welche Marketingziele hast du?

**Output:** `strategie` object

#### Phase 2: Marketingkanäle (25 min)
**Questions:**
- Welche Kanäle nutzt du?
- Wie viel Budget pro Kanal?
- Was erwartest du von jedem Kanal?

**Business Type Specific:**
- B2B → LinkedIn, Networking, Referrals
- B2C → Social Media, Local, Events
- Digital → SEO, Content, Paid Ads

**Output:** `kanaele` object

#### Phase 3: Preisgestaltung (20 min)
**Questions:**
- Wie bildest du deine Preise?
- Wie liegen diese im Vergleich?
- Warum ist dieser Preis gerechtfertigt?

**Coaching Pattern (too cheap):**
```
"Bei €50/Stunde und deinen Kosten - lass uns rechnen,
wie viele Stunden du arbeiten müsstest..."
```

**Output:** `preisgestaltung` object

#### Phase 4: Vertrieb (25 min)
**Questions:**
- Wie verkaufst du? (Direkt/Indirekt)
- Wie sieht dein Verkaufsprozess aus?
- Wie lange dauert ein Verkauf?
- Wie viele Leads brauchst du?

**Output:** `vertrieb` object

### Coaching Focus
- **Primary:** MI (change talk for sales resistance)
- **Secondary:** CBC ("Ich bin kein Verkäufer")

### Critical Belief: "Ich bin kein Verkäufer"

**CBC Pattern:**
```
1. IDENTIFY: "Es klingt, als wäre Verkaufen für dich unangenehm."
2. EVIDENCE: "Hast du schon mal jemanden von etwas überzeugt?"
3. CHALLENGE: "Was ist der Unterschied zwischen Überzeugen und Verkaufen?"
4. REFRAME: "Verkaufen ist Problemlösung. Du hilfst Menschen."
5. ACTION: "Erzähl einem Bekannten von deiner Idee. Nur erzählen."
```

---

## Module 5: Finanzplanung

### Purpose
Complete financial planning across 7 parts.

### CRITICAL RULE
```
All calculations MUST use decimal.js - NO floating-point operators!
```

### Phases

#### Phase A: Kapitalbedarf (25 min)
**Questions:**
- Gründungskosten (Notar, Register, Beratung)
- Investitionen (Ausstattung, IT, Fahrzeug)
- Anlaufkosten (X Monate × monatliche Kosten)
- Reserve

**Output:** `kapitalbedarf` object

#### Phase B: Finanzierung (20 min)
**Questions:**
- Eigenkapital
- Gründungszuschuss (6 × ALG + 6 × €300)
- Kredite (Bank, KfW)
- Andere Quellen

**Validation:** Finanzierung ≥ Kapitalbedarf

**Output:** `finanzierung` object

#### Phase C: Privatentnahme (15 min)
**Questions:**
- Monatliche Lebenshaltungskosten
- Miete, Versicherung, Mobilität
- Sonstige Verpflichtungen

**Output:** `privatentnahme` object

#### Phase D: Umsatzplanung (40 min)
**Questions:**
- Umsatzströme definieren
- Monatliche Planung Jahr 1
- Jahre 2 und 3

**Reality Check:**
```
"Bei einem Tagessatz von €1.200 und €500.000 Umsatz wären das 417 Tage.
Bei 220 Arbeitstagen - wie erklärst du die Differenz?"
```

**Output:** `umsatzplanung` object

#### Phase E: Kostenplanung (30 min)
**Questions:**
- Fixkosten (Miete, Versicherung, Abos)
- Variable Kosten (Material, Provisionen)
- Personalkosten (wenn Mitarbeiter)

**Output:** `kostenplanung` object

#### Phase F: Rentabilität (25 min)
**Calculations:**
- Umsatz - Kosten = Gewinn/Verlust pro Jahr
- 3-Jahres-Prognose
- Break-Even-Berechnung

**Output:** `rentabilitaet` object

#### Phase G: Liquidität (25 min)
**Calculations:**
- Monatliche Cash-Flow-Planung
- 12-Monats-Übersicht
- Liquiditätsreserve

**BLOCKER:** Negative liquidity in any month
```
"Im Monat 4 wäre deine Liquidität negativ.
Das bedeutet, du kannst Rechnungen nicht bezahlen.
Wir müssen das anpassen."
```

**Output:** `liquiditaet` object

### Coaching Focus
- **Primary:** CBC ("Ich bin kein Zahlenmensch")
- **Secondary:** MI (financial anxiety)
- **Approach:** Scaffolding - step by step together

### Test Scenario: €50k GZ

```
Kapitalbedarf:
- Gründungskosten: €5,000
- Investitionen: €10,000
- Anlaufkosten (6 Mo × €4,167): €25,000
- Reserve: €10,000
= €50,000

Finanzierung:
- Gründungszuschuss: €18,000
- Eigenkapital: €22,000
- KfW-Kredit: €10,000
= €50,000
```

---

## Module 6: SWOT-Analyse

### Purpose
Balanced assessment of strengths, weaknesses, opportunities, threats.

### Phases

#### Phase 1: Stärken (10 min)
**Source:** Previous modules + AI Discover
**Minimum:** 3 strengths
**Questions:**
- Was sind deine größten Stärken?
- Was kannst du besser als andere?

#### Phase 2: Schwächen (10 min)
**Minimum:** 2 weaknesses
**Questions:**
- Wo siehst du Verbesserungspotential?
- Was fehlt dir noch?

**Coaching (if only positives):**
```
"Es ist wichtig, auch ehrlich über Schwächen nachzudenken.
Was könnte ein kritischer Gutachter bemängeln?"
```

#### Phase 3: Chancen (10 min)
**Minimum:** 2 opportunities
**Questions:**
- Welche Markttrends spielen dir in die Hände?
- Welche Chancen siehst du?

#### Phase 4: Risiken (10 min)
**Minimum:** 2 threats
**Questions:**
- Was könnte schiefgehen?
- Welche externen Risiken gibt es?

**Coaching (if only negatives):**
```
"Du siehst viele Risiken. Das zeigt, dass du realistisch denkst.
Aber welche Chancen hast du vielleicht übersehen?"
```

#### Phase 5: TOWS-Strategien (5 min)
**Combinations:**
- SO: Stärken nutzen für Chancen
- WO: Schwächen überwinden durch Chancen
- ST: Stärken gegen Risiken einsetzen
- WT: Schwächen minimieren, Risiken vermeiden

### Coaching Focus
- **Balance Check:** Not overly positive OR negative
- **Cross-Reference:** Mit vorherigen Modulen konsistent

---

## Module 7: Meilensteine

### Purpose
Create actionable timeline for first 3 years.

### Phases

#### Phase 1: Vorbereitung (10 min)
**Questions:**
- Was musst du VOR dem Start erledigen?
- Welche Genehmigungen brauchst du?
- Critical Path definieren

#### Phase 2: Gründung (10 min)
**Questions:**
- Wann ist dein geplanter Start?
- Wann erwartest du den ersten Kunden?
- Welche Meilensteine in den ersten 3 Monaten?

#### Phase 3: Jahr 1 (15 min)
**Questions:**
- Quartalsweise Ziele
- Umsatzziele (aligned mit Finanzplanung)
- Teamziele (wenn relevant)

#### Phase 4: Jahre 2-3 (10 min)
**Questions:**
- Jährliche Meilensteine
- Wachstumsziele
- Langfristige Vision

### Coaching Focus
- **Primary:** GROW (Will phase)
- **Focus:** Konkrete Aktionen, nicht vage Pläne
- **SMART Check:** Specific, Measurable, Achievable, Relevant, Time-bound

---

## Module 8: KPIs

### Purpose
Define metrics for tracking business success.

### Required KPIs

#### Financial (must have)
- Umsatz (monthly/quarterly)
- Bruttomarge
- Cashflow

#### Customer (must have)
- Neukunden pro Monat
- Kundenakquisitionskosten (CAC)

#### Operational (optional based on type)
- Auslastung (Service)
- Durchlaufzeit (Product)
- Churn Rate (SaaS)

### Output
Dashboard with 3-7 primary KPIs to track regularly.

---

## Module 9: Zusammenfassung

### Purpose
Generate executive summary and celebrate completion.

### Auto-Generated Content
- Gründerprofil Summary
- Geschäftsidee Summary
- Markt Summary
- Finanz Summary
- Strategie Summary

### Coaching Focus
- **Primary:** Appreciative Inquiry (Celebrate)
- **Anchor Wins:** Reference journey and growth
- **Next Steps:** What happens after workshop

### Closing Pattern
```
"Du hast in den letzten [X Stunden] einen vollständigen Businessplan
erarbeitet. Deine Stärken [X, Y, Z] sind klar erkennbar.
Du hast realistische Zahlen entwickelt und einen klaren Plan.

Ich bin zuversichtlich, dass dein Businessplan die BA-Prüfung bestehen wird.

Die nächsten Schritte sind:
1. Dokument exportieren
2. Fachkundige Stellungnahme einholen
3. Antrag bei der Arbeitsagentur stellen

Viel Erfolg bei deiner Gründung!"
```
