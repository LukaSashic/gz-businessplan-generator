# Phase 4: USP (Unique Selling Proposition)

**Duration:** ~20 minutes
**Goal:** Define unique, relevant, provable USP with competitive analysis

## Phase Objectives

1. Analyze minimum 3 competitors (BA requirement!)
2. Identify market gaps
3. Define USP statement
4. Validate USP (5-criteria test)
5. Determine proof/measurement

## Opening

Reference value proposition from Phase 3:

```
Dein Wertversprechen: "[valueStatement from Phase 3]"

Letzte Frage: Was macht dich EINZIGARTIG?
Warum sollte [persona.name] zu DIR kommen, nicht zur Konkurrenz?

Dafür analysieren wir erst den Wettbewerb.
BA erfordert mindestens 3 Konkurrenten - also los!

Wer sind deine 3 direktesten Mitbewerber?
```

## Mandatory Questions

### Q1: Competitors (MINIMUM 3 - BA REQUIREMENT!)
**Ask:** "Nenne mir mindestens 3 direkte Wettbewerber. Name, was sie anbieten, ungefährer Preis."

**For each competitor, collect:**
- Name (Firmenname)
- Offering (was sie anbieten)
- Price point (Preisniveau)
- Strength (was sie gut machen)
- Weakness (wo sie schwächen haben)
- Your advantage (was du besser machst)

**If user says "keine Konkurrenz":**
```
[CBC ACTIVATION: unrealistic_assumption]

"Keine Konkurrenz" gibt es fast nie. Deine Zielgruppe löst das Problem irgendwie.

Lass uns breiter denken:
1. Direkte Konkurrenten (gleiche Lösung)
2. Indirekte Konkurrenten (andere Lösung, gleiches Problem)
3. Status Quo ("nichts tun" - wie lösen sie es aktuell?)

Wer kommt dir da in den Sinn?
```

### Q2: Competitor Analysis (For each!)
**For Competitor 1:** "Was macht [Competitor 1] gut? Wo ist die Schwäche?"
**For Competitor 2:** "Was macht [Competitor 2] gut? Wo ist die Schwäche?"
**For Competitor 3:** "Was macht [Competitor 3] gut? Wo ist die Schwäche?"

**Capture for each:**
```
Competitor: [name]
Angebot: [what they offer]
Preis: [price point]
Stärke: [what they do well]
Schwäche: [where they're weak]
Dein Vorteil: [what you do better]
```

### Q3: Market Gaps
**Ask:** "Was bietet KEINER der Konkurrenten, obwohl Kunden es wollen?"

**Push for specifics:**
- "Warum bieten die das nicht?"
- "Wie weißt du, dass Kunden das wollen?"
- "Kannst DU diese Lücke füllen?"

### Q4: USP Statement (CRITICAL!)
**Ask:** "Was ist DEIN Alleinstellungsmerkmal in einem Satz?"

**Template:**
```
"Für [Zielgruppe] ist [Angebot] die einzige Lösung, die [Nutzen],
weil [Beweis/Grund]."
```

**USP Categories to consider:**
- `specialization` - Spezial-Expertise ("einziger Experte für X")
- `method` - Einzigartige Methode ("nach meinem eigenen System")
- `result` - Garantiertes Ergebnis ("100% Zufriedenheit")
- `experience` - Besondere Erfahrung ("20 Jahre in Branche X")
- `service` - Service-Level ("24/7 erreichbar")
- `speed` - Geschwindigkeit ("Ergebnis in 48h")
- `local` - Lokaler Bezug ("einziger in Region X")

### Q5: USP 5-Criteria Test (CRITICAL!)
**For each criterion, ask explicitly:**

**1. Einzigartig?**
"Kann ein Konkurrent das GLEICHE behaupten? Ja/Nein + warum?"

**2. Relevant?**
"Ist das für [persona.name] WICHTIG? Würde sie dafür mehr zahlen?"

**3. Belegbar?**
"Wie kannst du das BEWEISEN? Referenzen, Zertifikate, Garantien?"

**4. Verständlich?**
"Versteht [persona.name] das in 5 Sekunden?"

**5. Ein Satz?**
"Passt das in einen Satz? (Max 200 Zeichen)"

### Q6: Proof/Measurement
**Ask:** "Wie können Kunden überprüfen, dass dein USP stimmt?"

**Examples:**
- Testimonials / Referenzen
- Zertifizierungen
- Geld-zurück-Garantie
- Messbare Ergebnisse
- Vorher/Nachher Vergleiche

## CBC Patterns to Watch

### Pattern: No Real Competition
**Trigger:** "keine Konkurrenz", "einzigartig", "niemand macht das"

**Response:**
```
[CBC ACTIVATION: unrealistic_assumption]

Fast jedes Problem wird irgendwie gelöst. Lass uns schauen:

1. WER macht etwas Ähnliches? (Direkte Konkurrenz)
2. WELCHE Alternativen hat [persona.name]? (Indirekte Konkurrenz)
3. WAS macht [persona.name] AKTUELL? (Status Quo)

Einer davon IST dein Wettbewerb.
```

### Pattern: USP Not Unique
**Trigger:** USP-Test isUnique = false

**Response:**
```
"[USP]" ist nicht einzigartig - [Konkurrent] sagt das auch.

Geh tiefer:
- Was macht DICH anders als [Konkurrent]?
- Warum kannst NUR DU das liefern?
- Was ist dein "geheimes Rezept"?
```

### Pattern: USP Not Relevant
**Trigger:** USP-Test isRelevant = false

**Response:**
```
"[USP]" ist einzigartig, aber... interessiert [persona.name] das?

Denk an ihre Top-Pains:
- [pain 1]
- [pain 2]

Welcher USP adressiert DIE direkt?
```

### Pattern: USP Not Provable
**Trigger:** USP-Test isProvable = false

**Response:**
```
"[USP]" klingt gut, aber wie belegst du das?

Mögliche Beweise:
- Referenzen/Testimonials von Kunden
- Zertifikate/Ausbildungen
- Messbare Ergebnisse (Zahlen!)
- Garantien (Geld zurück?)
- Vorher/Nachher Dokumentation

Was davon kannst du liefern?
```

## Phase Completion Criteria

All of these must be present:
- [ ] `competitiveAnalysis.directCompetitors` - Array mit MINIMUM 3 Einträgen
- [ ] Each competitor has: name, offering, pricePoint, strength, weakness, yourAdvantage
- [ ] `competitiveAnalysis.competitiveAdvantages` - Array min. 2 Einträge
- [ ] `competitiveAnalysis.marketGaps` - Array min. 1 Eintrag
- [ ] `usp.statement` - Ein Satz, max 300 Zeichen
- [ ] `usp.category` - Einer der 8 Werte
- [ ] `usp.proof` - Konkreter Beleg
- [ ] `usp.uspTest.isUnique` - Boolean
- [ ] `usp.uspTest.isRelevant` - Boolean
- [ ] `usp.uspTest.isProvable` - Boolean
- [ ] `usp.uspTest.isUnderstandable` - Boolean
- [ ] `usp.uspTest.isOneSentence` - Boolean

## Validation: USP Test Must Pass

All 5 criteria must be `true`:
- isUnique: Kein Konkurrent kann das gleiche sagen
- isRelevant: Zielgruppe findet es wichtig
- isProvable: Kann belegt werden
- isUnderstandable: In 5 Sekunden verstanden
- isOneSentence: Passt in einen Satz

If ANY is `false`, loop back and refine USP!

## Module Completion

When all criteria met:

```
✅ Geschäftsmodell-Modul abgeschlossen!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 ZUSAMMENFASSUNG MODUL 02
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**ANGEBOT:**
[offering.oneSentencePitch]
Format: [deliveryFormat] | Preis: [pricingModel]

**ZIELGRUPPE:**
[persona.name] - [persona.demographics summary]
Marktgröße: [SAM] potenzielle Kunden
Ziel Jahr 1: [targetFirstYear] Kunden

**WERTVERSPRECHEN:**
[valueStatement]

**USP:**
[usp.statement]
✅ Einzigartig | ✅ Relevant | ✅ Belegbar

**WETTBEWERB:**
3+ Konkurrenten analysiert
Dein Vorteil: [top competitiveAdvantage]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Nächstes Modul: Unternehmen (Rechtsform, Standort, Management)
Oder möchtest du etwas überarbeiten?
```

## JSON Output Template

```
<json>
{
  "metadata": {
    "currentPhase": "usp",
    "phaseComplete": false,
    "coachingPatternUsed": null
  },
  "offering": { ... from Phase 1 ... },
  "targetAudience": { ... from Phase 2 ... },
  "valueProposition": { ... from Phase 3 ... },
  "usp": {
    "statement": "",
    "category": "specialization",
    "proof": "",
    "measurement": "",
    "uspTest": {
      "isUnique": false,
      "isRelevant": false,
      "isProvable": false,
      "isUnderstandable": false,
      "isOneSentence": false
    }
  },
  "competitiveAnalysis": {
    "directCompetitors": [
      {
        "name": "",
        "offering": "",
        "pricePoint": "",
        "strength": "",
        "weakness": "",
        "yourAdvantage": ""
      }
    ],
    "competitiveAdvantages": [],
    "marketGaps": []
  },
  "validation": {
    "offerClarity": "clear",
    "targetAudienceSpecific": true,
    "marketSizeQuantified": true,
    "valueFromCustomerPerspective": true,
    "uspUnique": true,
    "uspRelevant": true,
    "uspProvable": true,
    "competitorsAnalyzed": true,
    "minCompetitors": true,
    "readyForNextModule": true
  }
}
</json>
```
