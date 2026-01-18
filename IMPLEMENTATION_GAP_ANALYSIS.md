# Implementation Gap Analysis: Module 1 & 2

**Created:** 2026-01-18
**Status:** Analysis Complete

---

## Executive Summary

Module 1 (Intake) is **~90% SPEC-compliant**. Module 2 (Geschäftsmodell) is **~70% SPEC-compliant**.

### Critical Gaps:
1. Module 2 schema doesn't enforce minimum 3 competitors
2. Module 2 lacks phase-specific prompts (only intake has these)
3. CBC/MI coaching trigger detection services missing
4. Module 2 preview component missing
5. Value Proposition Canvas visualization missing

---

## Module 1: Intake & Assessment

### SOURCE OF TRUTH
- **SPEC File:** `src/lib/prompts/modules/gz-module-01-intake.md`
- **Conversation Flow:** 7 Phases
- **Output Schema:** Complete IntakeOutput type

### CURRENT STATE ✅ MOSTLY COMPLETE

#### Schemas - COMPLETE ✅
- **File:** `src/types/modules/intake.ts`
- [x] `IntakeOutputSchema` with all required fields
- [x] All 7 Howard personality dimensions (`innovativeness`, `riskTaking`, `achievement`, `proactiveness`, `locusOfControl`, `selfEfficacy`, `autonomy`)
- [x] Business type classification (6 types)
- [x] Resources (financial, time, network, infrastructure)
- [x] Validation schema with GZ eligibility

#### Validators - COMPLETE ✅
- **File:** `src/types/modules/intake.ts` (integrated)
- **File:** `src/lib/services/intake-validator.ts`
- [x] `checkGZEligibility()` - 150 days minimum
- [x] `validateIntakePhase()` - per-phase validation
- [x] `validateFounderProfilePhase()` - ALG blocking for unemployed
- [x] `calculateIntakeProgress()` - 0-100% progress

#### Phase Prompts - COMPLETE ✅
- **Directory:** `src/lib/prompts/modules/intake-phases/`
- [x] `_common.md` - Valid phase names, scope rules
- [x] `01-warmup.md` - Business idea collection
- [x] `02-founder-profile.md` - ALG status (CRITICAL)
- [x] `03-personality.md` - Howard's 7 dimensions
- [x] `04-profile-gen.md` - Synthesize profile
- [x] `05-resources.md` - Financial, time, network
- [x] `06-business-type.md` - Classification
- [x] `07-validation.md` - GZ eligibility check

#### Personality Assessment - COMPLETE ✅
- **File:** `src/lib/workshop/personality-assessment.ts`
- [x] 7 scenario templates for Howard's dimensions
- [x] A/B/C options mapping to high/medium/low
- [x] `generatePersonalityScenario()` with business context
- [x] `generatePersonalityNarrative()` - German text

#### Red Flag Detection - COMPLETE ✅
- **File:** `src/lib/services/red-flag-detector.ts`
- [x] 9 red flag patterns (imposterSyndrome, unrealisticExpectations, etc.)
- [x] Severity levels and coaching hints

#### Preview Component - COMPLETE ✅
- **File:** `src/app/dashboard/workshop/[id]/components/previews/intake-preview.tsx`
- [x] Progress card
- [x] GZ eligibility alert
- [x] Founder profile card
- [x] Business idea card
- [x] Personality visualization
- [x] Business type badge
- [x] Resources summary
- [x] Validation summary

### GAPS IDENTIFIED - MINOR

1. **Missing: Module transition integration** - TransitionScreen exists but not wired to phase completion
2. **Missing: Streaming JSON accumulation improvements** - Parser works but could be more robust

### SUCCESS CRITERIA - MET ✅
- [x] All 7 Howard dimensions captured
- [x] Business type classified correctly
- [x] GZ funding calculated and displayed
- [x] Structured profile output generated
- [x] Validation summary with strengths/concerns

---

## Module 2: Geschäftsmodell

### SOURCE OF TRUTH
- **SPEC File:** `src/lib/prompts/modules/gz-module-02-geschaeftsmodell.md`
- **Conversation Flow:** 4 Phases (Angebot, Zielgruppe, Wertversprechen, USP)
- **Output Schema:** Complete GeschaeftsmodellOutput type

### CURRENT STATE ⚠️ PARTIALLY COMPLETE

#### Schemas - MOSTLY COMPLETE ⚠️
- **File:** `src/types/modules/geschaeftsmodell.ts`
- [x] `GeschaeftsmodellOutputSchema` with most required fields
- [x] Offering schema (mainOffering, deliveryFormat, pricingModel, scope)
- [x] Target audience with persona and market size
- [x] Value proposition canvas structure
- [x] USP with 5-criteria test
- [x] Competitive analysis structure
- [x] BA compliance blockers/warnings functions

**GAP:** Competitor array allows `min(0)` but SPEC requires minimum 3

#### Validators - COMPLETE ✅
- **File:** `src/types/modules/geschaeftsmodell.ts` (integrated)
- [x] `validateGeschaeftsmodellPhase()` - per-phase validation
- [x] `isGeschaeftsmodellComplete()` - readiness check
- [x] `getBAComplianceBlockers()` - BA blockers
- [x] `getBAComplianceWarnings()` - BA warnings

#### Phase Prompts - MISSING ❌
- **Expected:** `src/lib/prompts/modules/geschaeftsmodell-phases/`
- [ ] `_common.md` - Valid phase names, scope rules
- [ ] `01-angebot.md` - Offering definition
- [ ] `02-zielgruppe.md` - Target audience with CBC triggers
- [ ] `03-wertversprechen.md` - Value proposition canvas
- [ ] `04-usp.md` - USP definition with competitor analysis

#### CBC Pattern Detection - MISSING ❌
- **Expected:** `src/lib/services/cbc-pattern-detector.ts`
- [ ] Vague offering trigger ("guter service", "professionell", "qualität")
- [ ] Broad target trigger ("alle", "jeder", "jede", "unternehmen")
- [ ] Limiting belief trigger ("ich bin kein", "kann nicht")
- [ ] `detectCBCTrigger()` function
- [ ] `getCBCResponse()` function

#### Preview Component - MISSING ❌
- **Expected:** `src/app/dashboard/workshop/[id]/components/previews/geschaeftsmodell-preview.tsx`
- [ ] Offering card (mainOffering, deliveryFormat, pricingModel, pitch)
- [ ] Target audience persona card
- [ ] Market size card (TAM, SAM, Year 1 target)
- [ ] Value proposition canvas visualization
- [ ] USP card with 5-criteria test badges
- [ ] Competitors list (3+ required)
- [ ] BA compliance status

#### Value Proposition Canvas - MISSING ❌
- **Expected:** `src/components/modules/value-proposition-canvas.tsx`
- [ ] Visual canvas layout (customer side | offering side)
- [ ] Jobs, Pains, Gains columns
- [ ] Products, Pain Relievers, Gain Creators columns
- [ ] Synthesized value statement

### GAPS IDENTIFIED - CRITICAL

1. **Schema Fix:** Change `directCompetitors` from `min(0)` to `min(3)`
2. **Phase Prompts:** Create 4 phase-specific prompt files
3. **CBC Service:** Create trigger detection service
4. **Preview Component:** Create geschaeftsmodell preview
5. **Canvas Component:** Create value proposition canvas visualization

### SUCCESS CRITERIA - NOT MET
- [x] 4-phase structure defined in types
- [ ] CBC activated for "alle", vague terms (service missing)
- [x] Market size quantified with sources (schema ready)
- [x] Value Proposition Canvas structure (schema ready, component missing)
- [x] USP validated (5 criteria in schema)
- [ ] Min 3 competitors analyzed (schema allows 0)
- [ ] Preview component exists

---

## Cross-Module: Coaching Services

### SOURCE OF TRUTH
- **CBC:** `src/lib/prompts/modules/gz-coaching-cbc.md`
- **MI:** `src/lib/prompts/modules/gz-coaching-mi.md`
- **Core:** `src/lib/prompts/modules/gz-system-coaching-core.md`

### CURRENT STATE ⚠️ PROMPTS EXIST, SERVICES MISSING

#### Coaching Prompts - COMPLETE ✅
- [x] CBC patterns defined (5-step: Identify, Evidence, Challenge, Reframe, Action)
- [x] MI patterns defined (Express Empathy, Develop Discrepancy, Roll with Resistance, Support Self-Efficacy)
- [x] GROW framework defined
- [x] Socratic questioning patterns

#### Coaching Detection Services - MISSING ❌
- **Expected:** `src/lib/services/coaching-detector.ts`
- [ ] `detectCoachingTrigger(userMessage)` → 'cbc' | 'mi' | 'sdt' | null
- [ ] `getCBCTriggerPattern(userMessage)` → specific pattern
- [ ] `getMITriggerSignals(userMessage)` → ambivalence signals

### GAPS IDENTIFIED
1. **CBC Service:** Create `src/lib/services/cbc-pattern-detector.ts`
2. **MI Service:** Create `src/lib/services/mi-signal-detector.ts`
3. **Integration:** Hook detection into chat flow

---

## Implementation Plan

### Priority 1: Critical Fixes (2-3 hours)

1. **Fix Module 2 Schema** - Enforce min 3 competitors
   - File: `src/types/modules/geschaeftsmodell.ts`
   - Change: `min(0)` → `min(3)`

2. **Create CBC Pattern Detector**
   - File: `src/lib/services/cbc-pattern-detector.ts`
   - Patterns: vague_offering, broad_target, limiting_belief

### Priority 2: Module 2 Prompts (2-3 hours)

3. **Create Phase Prompts**
   - Directory: `src/lib/prompts/modules/geschaeftsmodell-phases/`
   - Files: _common.md, 01-angebot.md, 02-zielgruppe.md, 03-wertversprechen.md, 04-usp.md

4. **Update Prompt Loader**
   - File: `src/lib/prompts/prompt-loader.ts`
   - Add: `buildGeschaeftsmodellPhasePrompt()` function

### Priority 3: UI Components (3-4 hours)

5. **Create Geschäftsmodell Preview**
   - File: `src/app/dashboard/workshop/[id]/components/previews/geschaeftsmodell-preview.tsx`

6. **Create Value Proposition Canvas**
   - File: `src/components/modules/value-proposition-canvas.tsx`

### Priority 4: Integration (2 hours)

7. **Wire Module 2 into Chat API**
   - Update: `src/app/api/chat/route.ts`
   - Add: Phase support for geschaeftsmodell

8. **Wire Preview into Workshop Canvas**
   - Update: `src/app/dashboard/workshop/[id]/components/preview-panel.tsx`

### Total Estimated Time: 9-12 hours

---

## Files to Create

```
src/lib/services/
├── cbc-pattern-detector.ts        # CBC trigger detection
└── mi-signal-detector.ts          # MI trigger detection (optional)

src/lib/prompts/modules/geschaeftsmodell-phases/
├── _common.md                     # Valid phase names
├── 01-angebot.md                  # Offering phase
├── 02-zielgruppe.md               # Target audience phase
├── 03-wertversprechen.md          # Value proposition phase
└── 04-usp.md                      # USP phase

src/app/dashboard/workshop/[id]/components/previews/
└── geschaeftsmodell-preview.tsx   # Module 2 preview

src/components/modules/
└── value-proposition-canvas.tsx   # VPC visualization
```

## Files to Modify

```
src/types/modules/geschaeftsmodell.ts
  - Change: CompetitiveAnalysisSchema.directCompetitors min(0) → min(3)

src/lib/prompts/prompt-loader.ts
  - Add: buildGeschaeftsmodellPhasePrompt() function
  - Add: GESCHAEFTSMODELL_PHASE_PROMPT_FILES mapping

src/app/api/chat/route.ts
  - Add: geschaeftsmodellPhase parameter support
  - Add: buildGeschaeftsmodellPhasePrompt() call

src/app/dashboard/workshop/[id]/components/preview-panel.tsx
  - Add: GeschaeftsmodellPreview rendering for module 2
```

---

## Verification Checklist

After implementation, verify:

### Module 1
- [ ] All 7 Howard dimensions captured in test run
- [ ] GZ eligibility correctly calculated
- [ ] Business type classification working
- [ ] Profile narrative generated
- [ ] Validation summary shows strengths/concerns

### Module 2
- [ ] CBC triggered for vague statements
- [ ] CBC triggered for "alle" / broad targets
- [ ] Market size enforced with source
- [ ] Value Proposition Canvas populated
- [ ] USP 5-criteria test passes
- [ ] Min 3 competitors required
- [ ] Preview shows all data

### Cross-Module
- [ ] Module 1 → Module 2 data handoff
- [ ] Coaching patterns activate on triggers
- [ ] Streaming JSON accumulates correctly

---

*End of Gap Analysis*
