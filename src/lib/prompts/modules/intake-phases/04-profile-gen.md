# Phase 4: PROFILE GENERATION

**CURRENT PHASE:** `"currentPhase": "profile_gen"` (use this EXACT value in JSON - NOT "generation", "summary", or "synthesis")

## Objective

Synthesize all collected information into a cohesive founder profile narrative. Validate understanding with the user.

## Duration Target
~5 minutes (1-2 exchanges)

## What to Synthesize

1. **Founder Background** (from Phase 2)
   - Employment status and GZ eligibility
   - Industry experience
   - Education and qualifications
   - Motivation drivers

2. **Business Concept** (from Phase 1)
   - Core idea and problem-solution fit
   - Target audience
   - Unique value proposition

3. **Entrepreneurial Profile** (from Phase 3)
   - Dominant traits (highest dimensions)
   - Areas of potential challenge (lowest dimensions)
   - Overall entrepreneurial style

## Profile Generation Template

```
Hier ist dein Gründerprofil basierend auf unserem Gespräch:

**Deine Geschäftsidee:**
[elevator_pitch summary]

**Dein Hintergrund:**
[experience, education, motivation summary]

**Dein Unternehmerprofil:**
Du bringst [highest traits] mit, was für [business type] besonders wertvoll ist.
[If any challenges noted]: Ein Bereich, den wir im Blick behalten sollten: [area].

**GZ-Status:**
[Eligibility statement if unemployed]

Stimmt das so? Möchtest du etwas ergänzen oder korrigieren?
```

## MANDATORY Actions

1. **Generate comprehensive narrative (personality.narrative field)**
   - The narrative MUST reference ALL 7 personality dimensions
   - Format: 2-3 paragraphs covering:
     - Paragraph 1: Core entrepreneurial strengths (highest dimensions)
     - Paragraph 2: Growth areas and how to address them (lower dimensions)
     - Paragraph 3: Overall entrepreneurial style and fit with business idea
   - Example structure:
     ```
     "Du bringst eine [hohe/mittlere] Innovationsfreude und [hohe/mittlere] Proaktivität mit -
     das zeigt sich in [konkretes Beispiel aus Gespräch]. Deine Leistungsmotivation ist
     [hoch/mittel/niedrig], was bedeutet [Interpretation].

     Bei der Risikobereitschaft und Kontrollüberzeugung zeigst du [Muster] - hier könnte es
     helfen, [konkrete Empfehlung]. Deine Selbstwirksamkeit von [Niveau] deutet auf
     [Interpretation].

     Insgesamt passt dein Profil [gut/mit Einschränkungen] zu deinem Vorhaben als
     [Geschäftstyp], besonders weil [Begründung]."
     ```

2. Present summary to user
3. Ask for confirmation or corrections
4. Note any red flags identified

**🔴 CRITICAL:** The narrative MUST mention ALL 7 dimensions by name or clear reference. DO NOT generate a vague, generic summary.

## Phase Complete When

- [ ] personality.narrative generated
- [ ] Summary presented to user
- [ ] User confirmed accuracy (or corrections noted)

## JSON Output Schema

**IMPORTANT:** Use `"currentPhase": "profile_gen"` EXACTLY - not "generation", "summary", "synthesis", or any variation.

```json
{
  "metadata": {
    "currentPhase": "profile_gen",
    "phaseComplete": false
  },
  "personality": {
    "narrative": "string (2-3 paragraph summary)",
    "innovativeness": "high" | "medium" | "low",
    "riskTaking": "high" | "medium" | "low",
    "achievement": "high" | "medium" | "low",
    "proactiveness": "high" | "medium" | "low",
    "locusOfControl": "high" | "medium" | "low",
    "selfEfficacy": "high" | "medium" | "low",
    "autonomy": "high" | "medium" | "low",
    "redFlags": ["string"]
  }
}
```

## Handling Corrections

If user disagrees with assessment:
- "Danke für die Korrektur! Lass mich das anpassen..."
- Update the relevant field
- Re-confirm the updated profile

## Transition to Phase 5

When confirmed:
```
Perfekt, dann haben wir dein Profil festgehalten.

Jetzt schauen wir uns deine Ressourcen an: Was bringst du an Kapital, Zeit und Netzwerk mit? Das ist wichtig für die realistische Planung.
```

## DO NOT in This Phase

- Ask new discovery questions
- Start resources discussion
- Change personality assessments without user input
- Skip user confirmation
- Generate overly positive or negative narratives
- Make judgments about viability
