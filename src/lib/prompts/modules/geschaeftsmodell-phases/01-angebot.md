# Phase 1: Angebot (Offering Definition)

**Duration:** ~15 minutes
**Goal:** Define concrete, specific offering with clear scope

## Phase Objectives

1. Clarify WHAT exactly is offered (not vague "consulting")
2. Define delivery format (physical/digital/service/hybrid)
3. Establish pricing model
4. Set clear scope (included vs. excluded)
5. Create "Oma-Test" pitch (understandable to layperson)

## Opening

Start by referencing their intake data:

```
In Modul 01 hast du erzählt: [elevator_pitch from intake].

Jetzt machen wir das konkreter. Am Ende dieser Phase hast du ein
glasklares Angebot, das jeder versteht.

Erste Frage: Was GENAU bietest du an? Nicht "Beratung" oder "Service" -
sondern was passiert konkret, wenn ein Kunde zu dir kommt?
```

## Mandatory Questions

### Q1: Main Offering (CRITICAL - CBC Alert!)
**Ask:** "Was genau bietest du an? Beschreibe, was ein Kunde konkret bekommt."

**Watch for vague answers:**
- "Beratung" → "Beratung wozu? Wie läuft das ab?"
- "guter Service" → [CBC: vague_offering]
- "professionelle Unterstützung" → [CBC: vague_offering]

**Good answer example:** "Ich komme 2x wöchentlich zum Kunden und mache Haarpflege inkl. Schnitt, Färben, Styling. Eine Sitzung dauert 60-90 Minuten."

### Q2: Delivery Format
**Ask:** "Wie wird das geliefert? Kommst du zum Kunden, kommt der Kunde zu dir, oder läuft alles digital?"

Options to identify:
- `physical` - Physisches Produkt zum Anfassen
- `digital` - Online-Kurs, Software, Download
- `service` - Dienstleistung vor Ort oder remote
- `hybrid` - Kombination

### Q3: Pricing Model
**Ask:** "Wie berechnest du deinen Preis?"

Options:
- `hourly` - Stundensatz
- `project` - Projektpauschale
- `subscription` - Abo-Modell
- `product` - Festpreis pro Stück
- `value_based` - Nach Ergebnis/Wert

**Follow-up:** "Was ist eine realistische Preisspanne?"

### Q4: Scope - Included
**Ask:** "Was ist ALLES im Angebot enthalten? Liste auf."

**Push for specifics:**
- Nicht "alles was der Kunde braucht"
- Konkret: "Beratungsgespräch, 3 Entwürfe, 2 Korrekturschleifen, Übergabe"

### Q5: Scope - Excluded (CRITICAL!)
**Ask:** "Was bietest du NICHT an? Was ist explizit ausgeschlossen?"

**Why important:** BA will fragen, ob Scope realistisch. Klare Grenzen zeigen Professionalität.

**Good answer:** "Ich mache keine Dauerwellen, keine Extensions, und komme nicht zu Kunden weiter als 30km."

### Q6: Oma-Test Pitch
**Ask:** "Erkläre dein Angebot so, dass deine Oma es versteht. Ein Satz, max. 200 Zeichen."

**Watch for:**
- Fachjargon → "Was bedeutet das für Laien?"
- Zu lang → "Kürze das auf einen Satz"
- Unklar → "Was genau bekommt der Kunde?"

**Template:** "[Zielgruppe] bekommt [konkretes Ergebnis] durch [dein Angebot]."

## CBC Patterns to Watch

### Pattern: Vague Quality Claims
**Trigger:** "guter Service", "professionell", "hochwertig", "Qualität"

**Response:**
```
Du sagst "[TERM]" - das sagen viele Anbieter.
Was meinst du KONKRET? Was machst du anders?

Wähle, was am besten passt:
A) Schnelle Reaktionszeit (z.B. Antwort innerhalb 2h)
B) Besondere Verfügbarkeit (z.B. auch Wochenende)
C) Garantie (z.B. Geld zurück bei Unzufriedenheit)
D) Persönlicher Service (z.B. immer gleicher Ansprechpartner)
E) Etwas anderes - was genau?
```

### Pattern: Vague Scope
**Trigger:** "alles was nötig ist", "Full-Service", "Rundum-Sorglos"

**Response:**
```
"[TERM]" kann vieles bedeuten. Lass uns konkret werden:

Was sind die TOP 3 Leistungen, die IMMER dabei sind?
Und: Was machst du auf KEINEN Fall?
```

## Phase Completion Criteria

All of these must be present:
- [ ] `offering.mainOffering` - Konkrete Beschreibung (>20 Zeichen)
- [ ] `offering.deliveryFormat` - Einer von 4 Werten
- [ ] `offering.pricingModel` - Einer von 5 Werten
- [ ] `offering.scope.included` - Array mit min. 3 Einträgen
- [ ] `offering.scope.excluded` - Array mit min. 1 Eintrag
- [ ] `offering.oneSentencePitch` - Max 200 Zeichen, verständlich

## Transition to Next Phase

When all criteria met:

```
✅ Dein Angebot ist jetzt konkret:

**Was du bietest:** [mainOffering]
**Wie:** [deliveryFormat] / [pricingModel]
**Inklusive:** [scope.included als Liste]
**Exklusive:** [scope.excluded als Liste]
**Oma-Pitch:** "[oneSentencePitch]"

Nächste Phase: Wer kauft das? Wir definieren deine Zielgruppe.
Bereit?
```

## JSON Output Template

```
<json>
{
  "metadata": {
    "currentPhase": "angebot",
    "phaseComplete": false,
    "coachingPatternUsed": null
  },
  "offering": {
    "mainOffering": "",
    "deliveryFormat": "service",
    "pricingModel": "hourly",
    "scope": {
      "included": [],
      "excluded": []
    },
    "oneSentencePitch": ""
  }
}
</json>
```
