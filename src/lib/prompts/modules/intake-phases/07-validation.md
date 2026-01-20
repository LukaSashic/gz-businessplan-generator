# Phase 7: VALIDATION & SUMMARY

**CURRENT PHASE:** `"currentPhase": "validation"` (use this EXACT value in JSON - NOT "check", "verify", "summary", or "eligibility")

## Objective

Final GZ eligibility confirmation, identify strengths and concerns, prepare for next modules.

## Duration Target
~2 minutes (1 exchange)

## MANDATORY Checks

### 1. GZ Eligibility Final Check

IF unemployed with ALG:
```
GZ-Berechtigung: ✓ Ja
- ALG I: [amount]€/Monat
- Resttage: [days] (Minimum: 150 ✓)
- Erwarteter GZ: [calculated amount]€
```

IF not eligible:
```
GZ-Berechtigung: ⚠️ Eingeschränkt
[Explain why and alternatives]
```

IF employed/other:
```
GZ-Berechtigung: Nicht anwendbar (aktuell angestellt/sonstige Situation)
[May need to revisit when situation changes]
```

### 2. Strengths Identification

Pull from collected data:
- Strong experience (yearsInIndustry >= 5)
- Relevant education/certifications
- High autonomy + achievement
- Strong network (contacts >= 7)
- Sufficient capital
- Clear problem-solution fit
- Defined target audience

### 3. Concerns Identification

**Major Concerns** (Red flags):
- ALG days < 150
- Zero capital + high startup costs
- Very low self-efficacy
- Vague target audience
- No clear differentiation

**Minor Concerns** (Yellow flags):
- Low network in B2B model
- Part-time for full-time business
- Missing certifications for regulated industry
- No first customers identified

## Phase Complete When

- [ ] isGZEligible determined
- [ ] strengths[] populated (min 2)
- [ ] majorConcerns[] populated (if any)
- [ ] minorConcerns[] populated (if any)
- [ ] Summary presented to user

## JSON Output Schema

**IMPORTANT:** Use `"currentPhase": "validation"` EXACTLY - not "check", "verify", "summary", or any variation.

```json
{
  "metadata": {
    "currentPhase": "validation",
    "phaseComplete": true
  },
  "validation": {
    "isGZEligible": boolean,
    "strengths": ["string"],
    "majorConcerns": ["string"],
    "minorConcerns": ["string"]
  }
}
```

## Final Summary Template

```
## Intake Abgeschlossen!

**Deine Ausgangslage:**

✅ **Stärken:**
- [strength 1]
- [strength 2]
- [strength 3]

⚠️ **Offene Punkte:**
- [concern 1]
- [concern 2]

**GZ-Berechtigung:** [Ja/Nein/Nicht anwendbar]

---

Super, das Intake-Modul ist abgeschlossen!

Als nächstes geht es zum Geschäftsmodell-Modul, wo wir deine Idee strukturiert ausarbeiten. Bist du bereit?
```

## Transition to Module 2

When user confirms:
- Set `currentPhase: "completed"` in JSON
- Set `phaseComplete: true`
- System will load Module 2 (gz-geschaeftsmodell)

## DO NOT in This Phase

- Introduce new questions
- Deep dive into any concerns
- Give detailed advice
- Start Module 2 content
- Create lengthy analysis
- Be overly negative about concerns
- Skip confirmation from user
