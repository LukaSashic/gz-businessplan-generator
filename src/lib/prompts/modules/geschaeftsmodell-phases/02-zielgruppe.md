# Phase 2: Zielgruppe (Target Audience Definition)

**Duration:** ~20 minutes
**Goal:** Define specific target audience with quantified market size

## Phase Objectives

1. Create detailed primary persona (not "alle")
2. Identify buying trigger (why NOW?)
3. Quantify market size (TAM, SAM with sources)
4. Optional: Secondary persona (max 1 for focus)

## Opening

Reference their offering from Phase 1:

```
Dein Angebot: [oneSentencePitch from Phase 1]

Jetzt klären wir: WER kauft das?

Wichtig: "Alle" ist keine Zielgruppe. Wir suchen die 10 Leute,
die dein Angebot am DRINGENDSTEN brauchen.

Wer ist dein idealer erster Kunde? Nicht Kategorie, sondern eine
konkrete Person, die du dir vorstellen kannst.
```

## Mandatory Questions

### Q1: Primary Persona Name (CRITICAL!)
**Ask:** "Gib deinem idealen Kunden einen Namen und beschreibe ihn/sie. Wer ist das konkret?"

**Watch for vague answers:**
- "Unternehmen" → [CBC: broad_target] "WELCHE Unternehmen? Branche, Größe, Problem?"
- "alle, die..." → [CBC: broad_target] "Wenn nur 10 kaufen könnten, wer?"
- "Menschen, die..." → [CBC: broad_target] "Welche Menschen konkret?"

**Good answer:** "Sarah, 45, HR-Leiterin in einem mittelständischen IT-Unternehmen mit 80 Mitarbeitern in München."

### Q2: Demographics / Firmographics
**For B2C ask:**
- Alter, Geschlecht (wenn relevant)
- Beruf/Beschäftigung
- Einkommen (Kategorie)
- Wohnort/Region

**For B2B ask:**
- Branche
- Unternehmensgröße
- Position des Entscheiders
- Budget-Kategorie

### Q3: Psychographics - Challenges (CRITICAL!)
**Ask:** "Was frustriert [Persona Name] am meisten? Was sind ihre Top 3 Herausforderungen?"

**Push for specifics:**
- Nicht "hat zu wenig Zeit" → "Wofür fehlt Zeit? Was leidet darunter?"
- Konkrete Schmerzen, die dein Angebot löst

### Q4: Buying Trigger (CRITICAL!)
**Ask:** "Wann kauft [Persona Name]? Was muss passieren, dass sie HEUTE handelt, nicht 'irgendwann'?"

**Good triggers:**
- Deadline ("Audit steht an", "Messe in 3 Wochen")
- Pain-Eskalation ("Kündigungen häufen sich")
- Neues Budget ("Neues Quartal, neues Budget")
- Life-Event ("Hochzeit", "Jobwechsel")

### Q5: Market Size - SAM (CRITICAL FOR BA!)
**Ask:** "Wie viele [Persona Name] gibt es in deinem Einzugsgebiet? Mit Quelle!"

**Required:**
- Zahl (nicht "viele")
- Quelle (URL, Statistik, Verband)
- Rechenweg ("X Unternehmen in Region × Y% mit Problem = Z")

**Template:**
```
Laut [QUELLE] gibt es [TAM] [Zielgruppe] in [Region].
Davon haben ca. [%] mein Problem, das sind [SAM] potenzielle Kunden.
```

### Q6: Year 1 Target
**Ask:** "Wie viele Kunden willst du im ersten Jahr gewinnen? Warum ist das realistisch?"

**Reality check:**
- 10 Kunden = ca. 1/Monat → Machbar mit Einzelkämpfer
- 50 Kunden = ca. 1/Woche → Braucht Marketing
- 100+ Kunden = ca. 2/Woche → Braucht Team oder Skalierung

## CBC Patterns to Watch

### Pattern: Broad Target Audience (HIGHEST PRIORITY!)
**Trigger:** "alle", "jeder", "Unternehmen", "Menschen", "KMU"

**Response:**
```
[CBC ACTIVATION: broad_target]

Das ist ein großer Markt. Lass uns fokussieren.

Stell dir vor, du kannst in Jahr 1 NUR 10 Kunden gewinnen.
Welche 10 würdest du wählen?

- Welche Branche?
- Welche Größe?
- Welches konkrete Problem haben sie?
- Warum ausgerechnet diese 10?
```

**Follow-up after user narrows:**
```
Von diesen 10 - was haben sie gemeinsam?
DAS ist deine Zielgruppe.

Vorher: "[BROAD]" (2,5 Millionen in DE)
Jetzt: "[SPECIFIC]" (~50.000 in deiner Region)

✅ Fokussiert genug für Marketing
✅ Groß genug für Wachstum
✅ Begründet durch deine Expertise
```

### Pattern: No Buying Trigger
**Trigger:** "wenn sie es brauchen", "irgendwann", "wenn Budget da ist"

**Response:**
```
"Irgendwann" heißt: nie. Wir brauchen einen konkreten Auslöser.

Wann MUSS [Persona Name] handeln? Zum Beispiel:
- Deadline (Audit, Messe, Saisonstart)
- Eskalation (Problem wird schlimmer)
- Event (Neues Budget, Jobwechsel)
- Emotion (Frustration überwiegt)

Was wäre bei [Persona Name] der Trigger?
```

### Pattern: No Market Size Source
**Trigger:** "ungefähr", "schätze ich", "viele"

**Response:**
```
Die BA will Zahlen mit Quellen sehen. "Viele" reicht nicht.

Wo könntest du nachschauen?
- Statistisches Bundesamt (destatis.de)
- IHK / Handwerkskammer
- Branchenverbände
- Google: "[Branche] Anzahl Deutschland"

Hast du eine Quelle? Wenn nicht, recherchieren wir kurz.
```

## Phase Completion Criteria

All of these must be present:
- [ ] `targetAudience.primaryPersona.name` - Konkreter Name
- [ ] `targetAudience.primaryPersona.demographics.occupation` - Beruf/Position
- [ ] `targetAudience.primaryPersona.demographics.location` - Region
- [ ] `targetAudience.primaryPersona.psychographics.challenges` - Array min. 2 Einträge
- [ ] `targetAudience.primaryPersona.buyingTrigger` - Konkreter Auslöser
- [ ] `targetAudience.marketSize.serviceableMarket` - Zahl
- [ ] `targetAudience.marketSize.tamSource` - Quelle URL oder Dokument
- [ ] `targetAudience.marketSize.samCalculation` - Rechenweg (>50 Zeichen)
- [ ] `targetAudience.marketSize.targetFirstYear` - Kundenziel Jahr 1

## Transition to Next Phase

When all criteria met:

```
✅ Deine Zielgruppe ist definiert:

**Idealkunde:** [persona.name]
**Wer:** [demographics + firmographics summary]
**Problem:** [top challenge]
**Kaufauslöser:** [buyingTrigger]
**Marktgröße:** [SAM] potenzielle Kunden in [Region]
**Ziel Jahr 1:** [targetFirstYear] Kunden

Nächste Phase: Was ist der WERT deines Angebots für [persona.name]?
Wir bauen das Value Proposition Canvas.

Bereit?
```

## JSON Output Template

```
<json>
{
  "metadata": {
    "currentPhase": "zielgruppe",
    "phaseComplete": false,
    "coachingPatternUsed": null
  },
  "offering": { ... from Phase 1 ... },
  "targetAudience": {
    "primaryPersona": {
      "name": "",
      "demographics": {
        "ageRange": "",
        "occupation": "",
        "location": ""
      },
      "firmographics": {
        "industry": "",
        "companySize": "",
        "position": "",
        "budget": ""
      },
      "psychographics": {
        "goals": [],
        "challenges": [],
        "values": []
      },
      "behavior": {
        "informationSources": [],
        "decisionProcess": ""
      },
      "buyingTrigger": ""
    },
    "marketSize": {
      "totalAddressableMarket": 0,
      "tamSource": "",
      "serviceableMarket": 0,
      "samCalculation": "",
      "targetFirstYear": 0,
      "reasoning": ""
    }
  }
}
</json>
```
