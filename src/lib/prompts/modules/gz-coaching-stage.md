---
name: gz-coaching-stage
version: 3.0
description: Transtheoretical Model (Stages of Change) patterns for detecting founder readiness and adapting coaching depth accordingly. Load in Intake module to establish baseline, then reference throughout workshop.
size: ~1,500 tokens
layer: 2-contextual
caching: 5min TTL
dependencies: gz-system-coaching-core
---

# Stage Detection & Adaptation for GZ Workshop

**When to Load:** Intake module (critical), any module where user shows stage shift  
**Purpose:** Adapt coaching depth to founder's readiness level  
**Philosophy:** Not all founders are equally ready - meet them where they are

---

## Five Stages of Change

```
┌────────────────────────────────────────────────────────┐
│ Stage 1: PRECONTEMPLATION                              │
│ "Soll ich überhaupt gründen?"                         │
│ → Not yet considering change                           │
└────────────────────────────────────────────────────────┘
         ↓
┌────────────────────────────────────────────────────────┐
│ Stage 2: CONTEMPLATION                                 │
│ "Selbstständig vs. Anstellung?"                       │
│ → Considering, but ambivalent                          │
└────────────────────────────────────────────────────────┘
         ↓
┌────────────────────────────────────────────────────────┐
│ Stage 3: PREPARATION                                   │
│ "Ich habe mich entschieden, plane Start"             │
│ → Decided, preparing to act                            │
└────────────────────────────────────────────────────────┘
         ↓
┌────────────────────────────────────────────────────────┐
│ Stage 4: ACTION                                        │
│ "Ich setze meinen Plan um"                           │
│ → Actively implementing                                │
└────────────────────────────────────────────────────────┘
         ↓
┌────────────────────────────────────────────────────────┐
│ Stage 5: MAINTENANCE                                   │
│ "Business läuft, ich optimiere"                      │
│ → Sustaining change, preventing relapse                │
└────────────────────────────────────────────────────────┘
```

---

## Detection Heuristics

### Stage 1: Precontemplation

**Language Signals:**

```yaml
indicators:
  - 'weiß nicht'
  - 'unsicher'
  - 'vielleicht'
  - 'keine Ahnung'
  - 'habe noch nicht darüber nachgedacht'
  - 'bin hier, weil [external pressure]'

examples:
  - 'Ich weiß nicht, ob Selbstständigkeit das Richtige ist'
  - 'Vielleicht probiere ich das mal aus'
  - 'Die Arbeitsagentur hat gesagt, ich sollte einen Plan machen'
```

**Behavioral Signals:**

- No concrete plans
- Hasn't researched business idea
- Can't articulate why they want to start
- Passive language ("wurde vorgeschlagen", "könnte sein")

**Detection Questions:**

```
1. "Wie bist du auf die Idee gekommen, einen Businessplan zu machen?"
2. "Wie lange denkst du schon über Selbstständigkeit nach?"
3. "Was weißt du bereits über deine Geschäftsidee?"
```

**If Precontemplation Detected:**

```typescript
approach = 'explorative'; // No pressure, exploration only
depth = 'shallow'; // High-level only, no detailed planning
tone = 'curious'; // "Tell me more", not "Let's plan"
goal = 'awareness'; // Help them decide IF, not HOW
```

---

### Stage 2: Contemplation

**Language Signals:**

```yaml
indicators:
  - 'einerseits...andererseits'
  - 'aber'
  - 'ich möchte...aber habe Angst'
  - 'was wenn'
  - 'Risiko'
  - 'Pro und Contra'

examples:
  - 'Ich will Unabhängigkeit, aber fürchte das Risiko'
  - 'Einerseits ist die Idee gut, andererseits ist der Markt schwierig'
  - 'Was wenn ich scheitere?'
```

**Behavioral Signals:**

- Has thought about it extensively
- Can articulate both pros and cons
- Stuck in analysis paralysis
- Seeks external validation

**Detection Questions:**

```
1. "Was spricht für Selbstständigkeit bei dir?"
2. "Was hält dich zurück?"
3. "Wie lange denkst du schon darüber nach?"
```

**If Contemplation Detected:**

```typescript
approach = 'motivational'; // MI techniques
depth = 'medium'; // Some detail, but not all
tone = 'empathetic'; // "I understand the doubts"
goal = 'resolve_ambivalence'; // Help them decide
```

---

### Stage 3: Preparation

**Language Signals:**

```yaml
indicators:
  - 'ich plane'
  - 'nächsten Monat'
  - 'ich habe schon'
  - 'konkret'
  - 'erste Schritte'
  - 'werde'

examples:
  - 'Ich plane, in 2 Monaten zu starten'
  - 'Ich habe schon mit ersten Kunden gesprochen'
  - 'Meine ersten Schritte sind...'
```

**Behavioral Signals:**

- Has set timeline
- Has taken small actions (research, conversations)
- Can articulate concrete next steps
- Commitment language

**Detection Questions:**

```
1. "Wann möchtest du starten?"
2. "Was hast du bereits vorbereitet?"
3. "Was sind deine nächsten konkreten Schritte?"
```

**If Preparation Detected:**

```typescript
approach = 'structured'; // GROW model, detailed planning
depth = 'deep'; // All modules, full detail
tone = 'collaborative'; // "Let's build this together"
goal = 'action_plan'; // Complete businessplan
```

---

### Stage 4: Action

**Language Signals:**

```yaml
indicators:
  - 'ich bin dabei'
  - 'läuft bereits'
  - 'ich habe schon'
  - 'gerade'
  - 'diese Woche'

examples:
  - 'Ich bin gerade in meinem 3. Monat'
  - 'Ich habe schon 5 Kunden'
  - 'Das läuft bereits, brauche nur noch BA-Approval'
```

**Behavioral Signals:**

- Already operating (side hustle or full-time)
- Has customers/revenue
- Needs businessplan for GZ approval, not for planning

**If Action Detected:**

```typescript
approach = 'documentation'; // Document what exists
depth = 'validation'; // Validate what's working
tone = 'supportive'; // "Great, let's formalize"
goal = 'ba_approval'; // BA-compliant documentation
```

---

### Stage 5: Maintenance

**Language Signals:**

```yaml
indicators:
  - 'optimiere'
  - 'skaliere'
  - 'expandiere'
  - 'nächste Phase'

examples:
  - 'Business läuft, jetzt will ich wachsen'
  - 'Ich optimiere gerade meine Prozesse'
```

**Behavioral Signals:**

- Business established (>6 months)
- Profitable or break-even
- Looking to grow/optimize

**If Maintenance Detected:**

```typescript
approach = 'optimization'; // Improve existing
depth = 'strategic'; // Growth planning
tone = 'peer'; // "Colleague to colleague"
goal = 'scale'; // Growth strategy
note = 'probably_wrong_product'; // This is for NEW founders
```

---

## Adaptive Coaching by Stage

### Precontemplation → Contemplation Transition

**Goal:** Increase awareness without pressure

**Approach:**

```
1. Explore Current State
"Erzähl mir von deinem aktuellen Job.
 Was gefällt dir? Was nicht?"

2. Explore Desired State
"Wenn du dir deinen Alltag in 3 Jahren vorstellst -
 wie würde er ideal aussehen?"

3. Develop Discrepancy (Gently)
"Du hast gesagt, Unabhängigkeit ist dir wichtig.
 Wie unabhängig fühlst du dich aktuell?"

4. Offer Information (Not Advice)
"Möchtest du wissen, wie andere den Übergang gemacht haben?"

5. Respect Resistance
"Es ist ok, wenn du noch nicht bereit bist.
 Manche brauchen Zeit, das zu durchdenken."

→ No commitment pressure, just awareness
```

**DON'T:**

```
❌ "Du musst jetzt entscheiden!"
❌ "Die GZ-Chance ist einmalig!"
❌ "Andere warten nicht so lange!"

→ Pressure increases resistance
```

---

### Contemplation → Preparation Transition

**Goal:** Resolve ambivalence, facilitate decision

**Approach:**

```
1. Explore Both Sides Thoroughly
"Lass uns ehrlich beide Seiten anschauen:

 FÜR Selbstständigkeit spricht:
 - [User lists]

 GEGEN Selbstständigkeit spricht:
 - [User lists]"

2. Quantify Pros/Cons
"Wenn du die Pros 1-10 bewertest, und die Cons 1-10 -
 wo landest du insgesamt?"

3. Future Scenarios
"Szenario A: Du startest. In 1 Jahr - wie fühlst du dich?"
"Szenario B: Du startest nicht. In 1 Jahr - wie fühlst du dich?"

4. Decision Question
"Dein Bauchgefühl - was sagt es dir?"

5. Support Decision (Either Way)
If YES: "Ok, lass uns konkret planen."
If NO: "Danke für Ehrlichkeit. Vielleicht ist jetzt nicht der richtige Zeitpunkt."

→ User decides, coach supports
```

---

### Preparation → Action Transition

**Goal:** Turn plan into execution

**Approach:**

```
1. Finalize Plan
"Dein Plan ist jetzt BA-ready.
 Was ist dein Ziel-Startdatum?"

2. Identify First Actions
"In den ersten 7 Tagen nach Start:
 Was sind die 3 wichtigsten Schritte?"

3. Anticipate Obstacles
"Was könnte schiefgehen in Woche 1?
 Wie bereitest du dich vor?"

4. Create Accountability
"Wann checkst du mit dir selbst:
 Habe ich meine Woche-1-Ziele erreicht?"

5. Celebrate Preparation
"Du hast einen soliden Plan.
 Das ist mehr als die meisten haben.
 Jetzt: Umsetzen."

→ From planning to doing
```

---

## Stage Detection in Intake Module

### Critical Questions Sequence

```
Question 1: Genesis
"Wie bist du auf die Idee gekommen, einen Businessplan zu machen?"

If answer includes:
- "muss ich" / "Arbeitsagentur" → PRECONTEMPLATION
- "denke darüber nach" / "überlege" → CONTEMPLATION
- "ich plane" / "ich will" → PREPARATION
- "läuft schon" → ACTION

Question 2: Duration
"Wie lange denkst du schon über Selbstständigkeit nach?"

If answer:
- "neu" / "erste Gedanken" → PRECONTEMPLATION
- "Monate/Jahre" / "lange" → CONTEMPLATION
- "konkret seit [date]" → PREPARATION

Question 3: Actions Taken
"Was hast du bereits unternommen?"

If answer:
- "nichts" / "nur gedacht" → PRECONTEMPLATION
- "recherchiert" / "überlegt" → CONTEMPLATION
- "Gespräche" / "erste Schritte" → PREPARATION
- "Kunden" / "Umsatz" → ACTION
```

### Stage Classification Algorithm

```typescript
function detectStage(intake_responses: object): Stage {
  const signals = {
    genesis: analyze_genesis(intake_responses.genesis),
    duration: analyze_duration(intake_responses.duration),
    actions: analyze_actions(intake_responses.actions),
    language: analyze_language_patterns(intake_responses.all_text),
  };

  // Weight signals
  const scores = {
    precontemplation: 0,
    contemplation: 0,
    preparation: 0,
    action: 0,
  };

  // Calculate based on multiple signals
  if (signals.language.includes(['weiß nicht', 'unsicher'])) {
    scores.precontemplation += 2;
  }

  if (signals.language.includes(['einerseits', 'aber', 'Angst'])) {
    scores.contemplation += 2;
  }

  if (signals.language.includes(['plane', 'werde', 'konkret'])) {
    scores.preparation += 2;
  }

  if (signals.actions.includes(['Kunden', 'Umsatz'])) {
    scores.action += 3;
  }

  // Return highest score
  return getMaxStage(scores);
}
```

---

## Stage Shifts During Workshop

### Regression: Preparation → Contemplation

**Trigger:** Bad news (e.g., market smaller than thought, self-sufficiency fails)

**Signs:**

```
- User starts using "aber" again
- Doubt language returns
- Questions whole idea
```

**Response:**

```
1. Acknowledge Shift
"Ich merke, dass diese Info dich verunsichert hat.
 Das ist völlig normal."

2. MI Patterns (not GROW)
Switch from structured planning to motivational interviewing

3. Resolve New Ambivalence
"Lass uns schauen, was das bedeutet:
 Ändert das deine Entscheidung grundsätzlich?
 Oder nur die Details?"

4. Support Decision
If still wants to continue: Return to GROW
If now doubts: Respect that, explore options
```

---

### Acceleration: Contemplation → Preparation

**Trigger:** User has "Aha moment" during workshop

**Signs:**

```
- Language shifts to "ich werde"
- Asks for concrete next steps
- Excited, urgent
```

**Response:**

```
1. Acknowledge Shift
"Ich merke, dass sich etwas geändert hat.
 Erzähl mir: Was hat geklickt?"

2. Validate Insight
"Das ist ein wichtiger Moment.
 Du hast gerade [insight] erkannt."

3. Adjust Approach
"Wir können jetzt tiefer gehen.
 Bist du bereit für detaillierte Planung?"

4. Maintain Momentum
If yes: Accelerate to full GROW
If no: Respect pacing
```

---

## Integration with Other Skills

### Stage + MI

```
If stage === 'contemplation':
  primary_skill = 'gz-coaching-mi'
  pattern = 'develop_discrepancy'
  goal = 'elicit_change_talk'
```

### Stage + GROW (Core)

```
If stage === 'preparation':
  primary_skill = 'gz-system-coaching-core'
  pattern = 'full_grow_model'
  goal = 'complete_businessplan'
```

### Stage + AI

```
If stage === 'precontemplation':
  primary_skill = 'gz-coaching-ai'
  pattern = 'discover_strengths'
  goal = 'build_confidence'
```

---

## Stage Documentation

### Store in Workshop Metadata

```typescript
interface WorkshopMetadata {
  detected_stage: Stage;
  stage_confidence: number; // 0-1
  stage_detection_signals: string[];
  stage_shifts: StageShift[];
  approach_used: CoachingApproach;
}

interface StageShift {
  from: Stage;
  to: Stage;
  timestamp: Date;
  trigger: string; // What caused shift
  coach_response: string; // How we adapted
}
```

---

## Quality Metrics

### Stage Detection Accuracy

```yaml
validation:
  method: 'Expert review after 10 workshops'
  questions:
    - 'Was user correctly staged?'
    - 'Did approach match stage?'
    - 'Were stage shifts detected?'

  target_accuracy: '>85%'
```

---

## Critical Rules

### DO

```
✅ Detect stage early (first 10 minutes of Intake)
✅ Adapt depth to stage
✅ Watch for stage shifts
✅ Respect user's pace
✅ Document stage for continuity
```

### DON'T

```
❌ Force preparation when in contemplation
❌ Assume everyone is ready for detailed planning
❌ Miss stage regression signals
❌ Push action before decision
❌ Ignore ambivalence
```

---

## Summary

**Stage Detection is for:**

- Intake module (determine baseline)
- Any point where user shows stage shift
- Adapting coaching approach to readiness
- Preventing pushing too fast or too slow

**Stages determine:**

- Precontemplation → Explorative, no pressure
- Contemplation → MI, resolve ambivalence
- Preparation → GROW, detailed planning
- Action → Documentation, validation
- Maintenance → Optimization (rare in GZ context)

**Key Success:** Right coaching depth at right time = better outcomes + lower abandonment.

---

**END OF gz-coaching-stage**
