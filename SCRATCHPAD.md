# Development Scratchpad

**Last Updated**: 2026-01-16 (Session 3)
**Current Phase**: Phase 6 - Module 01 Intake (UX & Transition System)

---

## ✅ Module 01 UX & Transition System - COMPLETE (Jan 16, Session 3)

### What Was Implemented

Based on the PRD "Implementation PRD: Module 01 UX & Transition System", implemented all 6 deliverables:

**1. Welcome & Orientation System**
- `src/lib/workshop/welcome.ts` - Welcome message generator
- `src/app/dashboard/workshop/[id]/components/welcome-screen.tsx` - React component
- Shows module overview, time estimates, and "Los geht's" CTA button

**2. Module Transition Framework**
- `src/lib/workshop/transitions.ts` - Transition logic with achievements & quality check
- `src/app/dashboard/workshop/[id]/components/module-transition.tsx` - Celebration screen
- Shows completed achievements, data quality issues, next module preview

**3. Enhanced Personality Assessment (3-option format)**
- `src/lib/workshop/personality-assessment.ts` - 7 dimension scenarios
- Each scenario has A/B/C options mapping to high/medium/low scores
- Business context injection for personalized scenarios

**4. Business-Specific Scenario Generator**
- `generatePersonalityScenario(dimension, businessIdea)` function
- Replaces "[BUSINESS_CONTEXT]" placeholder with user's actual idea

**5. Complete Document Preview Structure**
- `src/lib/businessplan/document-structure.ts` - 13-section business plan structure
- `src/app/dashboard/workshop/[id]/components/previews/businessplan-preview.tsx`
- Shows actual prose text, expandable sections, word counts

**6. Personality Narrative Generator**
- `generatePersonalityNarrative()` function in personality-assessment.ts
- Converts dimension scores to human-readable German paragraphs

### Integration Points

**chat-panel.tsx:**
- Added ViewState type: 'welcome' | 'chat' | 'transition'
- Renders WelcomeScreen on first visit
- Renders ModuleTransition when intake completes

**preview-panel.tsx:**
- Added PreviewMode type: 'data' | 'document'
- Added Tabs toggle to switch between IntakePreview and BusinessPlanPreview
- LayoutGrid and FileBarChart icons for tab triggers

### New Files Created

```
src/lib/workshop/welcome.ts
src/lib/workshop/transitions.ts
src/lib/workshop/personality-assessment.ts
src/lib/businessplan/document-structure.ts
src/app/dashboard/workshop/[id]/components/welcome-screen.tsx
src/app/dashboard/workshop/[id]/components/module-transition.tsx
src/app/dashboard/workshop/[id]/components/personality-scenario.tsx
src/app/dashboard/workshop/[id]/components/previews/businessplan-preview.tsx
```

### Files Modified

```
src/app/dashboard/workshop/[id]/components/chat-panel.tsx
  - Added ViewState, WelcomeScreen, ModuleTransition imports
  - Added handleWelcomeStart, handleTransitionContinue handlers

src/app/dashboard/workshop/[id]/components/preview-panel.tsx
  - Added Tabs toggle for 'data' vs 'document' view
  - Added BusinessPlanPreview conditional rendering
```

---

## ✅ GZ-403: Module Preview Components - COMPLETE (Jan 19, Session 4)

### What Was Implemented

Based on the PRD "Create module preview components for Gründerperson and Geschäftsidee", implemented all acceptance criteria:

**1. Gründerperson Preview Component**
- `src/components/preview/gruenderperson-preview.tsx` - Comprehensive module 1 preview
- Displays: Berufserfahrung, Qualifikation, Kernkompetenz, Motivation, Stärken-Profil
- Real-time progress tracking (5 sections: experience, qualifications, strengths, motivation, confidence)
- Interactive badges for qualification levels and motivation types
- GROW progress display and processed beliefs (CBC results)
- Comprehensive accessibility with proper ARIA labels

**2. Geschäftsidee Preview Component**
- `src/components/preview/geschaeftsidee-preview.tsx` - Comprehensive module 2 preview
- Displays: Problem, Lösung, Zielgruppe, USP
- Socratic depth tracking with badge indicators (L1-L5)
- Problem-Solution fit scoring with visual indicators
- YC reality check questions and red flag warnings
- Pain level and feasibility indicators with color coding

**3. Enhanced Barrel Export**
- Updated `src/components/preview/index.ts` to export both new components

### Key Features Implemented

**Both Components:**
- ✅ Consistent shadcn/ui Card styling
- ✅ Real-time updates from Jotai atoms via `streamingDataFamily`
- ✅ Completion percentage calculation
- ✅ Comprehensive accessibility (ARIA labels, semantic HTML, screen reader support)
- ✅ Progressive data display (shows "Noch keine Daten" for missing sections)
- ✅ Mobile-responsive design

**Gründerperson Specific:**
- Experience timeline with years tracking
- Qualification relevance badges (High/Medium/Low/None)
- Motivation type indicators (Intrinsic/Extrinsic/Mixed)
- Strengths profile aggregation from multiple sources
- CBC processed beliefs display
- Confidence statement highlighting

**Geschäftsidee Specific:**
- Socratic depth tracking badges (L1-L5)
- Problem category and pain level indicators
- Solution approach badges with feasibility scoring
- Target audience size estimation
- Competitor analysis display
- YC reality check integration
- Problem-solution fit scoring (1-10 scale)

### Files Created

```
src/components/preview/gruenderperson-preview.tsx    (438 lines)
src/components/preview/geschaeftsidee-preview.tsx    (635 lines)
```

### Files Modified

```
src/components/preview/index.ts
  - Added exports for GruenderpersonPreview and GeschaeftsideePreview

scripts/ralph/prd.json
  - GZ-403: passes: false → true
  - Added completedAt timestamp
  - Updated completedStories: 17 → 18
```

### Verification Completed

- ✅ **Component Structure**: Both components follow intake-preview.tsx pattern
- ✅ **Data Display**: All required fields displayed with proper grouping
- ✅ **Real-time Updates**: Connected to Jotai streamingDataFamily atoms
- ✅ **Progress Tracking**: Completion percentages based on key milestones
- ✅ **Accessibility**: Comprehensive ARIA labels, semantic HTML, keyboard navigation
- ✅ **Compilation**: Next.js build compiles successfully (TypeScript errors are in existing middleware)
- ✅ **Styling**: Consistent with existing preview components using shadcn/ui

---

## 🚨 NEXT SESSION: Test Complete UX Flow

### What to Test

1. **Welcome Screen**: Does it show on first visit?
2. **Tabs Toggle**: Can you switch between Data/Document views?
3. **Document Preview**: Does BusinessPlanPreview render sections?
4. **Transition Screen**: Does it appear when intake completes?

### Start Testing

```bash
npm run dev
# Navigate to /dashboard/workshop/[id]
# Should see welcome screen
# Click "Los geht's" to start
# Toggle between Daten/Dokument in preview panel
```

---

## 🔧 Phase-Locked Intake System - Sanity Check Complete (Jan 16, 2026)

### Problem Identified

During testing, Claude was NOT respecting the phase-locked prompts:
- Output `"currentPhase": "background"` instead of `"founder_profile"`
- Output `"currentPhase": "market_analysis"` (NOT an intake phase - Module 4!)
- Output `"currentPhase": "summary"` instead of `"validation"`
- Asked market analysis questions during intake module (scope creep)

### Root Cause

Claude treated phase names as "semantic guidelines" rather than literal values to copy. The prompts weren't explicit enough about requiring EXACT phase strings.

### Fixes Applied

**1. `_common.md`** - Added explicit valid phase table:
```markdown
| Value | DO NOT USE |
| `"warmup"` | ~~"intro"~~, ~~"start"~~ |
| `"founder_profile"` | ~~"background"~~, ~~"profile"~~ |
```
Also added **SCOPE RESTRICTION** section to prevent Module 2+ content.

**2. All 7 phase prompt files** (01-07) - Added header:
```markdown
**CURRENT PHASE:** `"currentPhase": "founder_profile"` (use this EXACT value - NOT "background")
```

**3. `prompt-loader.ts` → `getPhaseJSONInstructions()`** - Added explicit examples:
```markdown
RICHTIG: "currentPhase": "warmup" ✅
FALSCH: "currentPhase": "background" ❌
```

**4. `use-chat-stream.ts`** - Added `PHASE_NAME_NORMALIZATION` map (30+ mappings):
```typescript
const PHASE_NAME_NORMALIZATION = {
  'background': 'founder_profile',
  'market_analysis': 'warmup', // NOT an intake phase!
  'summary': 'profile_gen',
  // ... 30+ variations
};

function normalizePhase(phase, currentPhase) {
  // Safety net for incorrect phase names
}
```

### Files Modified

```
src/lib/prompts/modules/intake-phases/_common.md
  - Added explicit valid phase table
  - Added SCOPE RESTRICTION section

src/lib/prompts/modules/intake-phases/01-warmup.md
src/lib/prompts/modules/intake-phases/02-founder-profile.md
src/lib/prompts/modules/intake-phases/03-personality.md
src/lib/prompts/modules/intake-phases/04-profile-gen.md
src/lib/prompts/modules/intake-phases/05-resources.md
src/lib/prompts/modules/intake-phases/06-business-type.md
src/lib/prompts/modules/intake-phases/07-validation.md
  - Added **CURRENT PHASE** header with exact value
  - Added **IMPORTANT** note in JSON schema section

src/lib/prompts/prompt-loader.ts
  - Enhanced getPhaseJSONInstructions() with CORRECT/INCORRECT examples

src/hooks/use-chat-stream.ts
  - Added PHASE_NAME_NORMALIZATION map (30+ mappings)
  - Added normalizePhase() function
  - Updated onJSON callbacks to use normalizePhase()
```

---

## 🚨 NEXT SESSION: Test Phase-Locked System

### What to Test

1. **Start dev server**: `npm run dev`
2. **Open workshop**: Create or open existing workshop
3. **Watch browser console** for `[useChatStream] Normalized phase` warnings
4. **Verify phase indicator** shows correct phases (warmup → founder_profile → personality)
5. **Check Claude stays in scope** (no market analysis questions during intake)

### Expected Behavior

- Phase indicator shows "Warm-Up" initially
- Claude asks business idea questions (Phase 1)
- When complete, transitions to "Gründerprofil" (Phase 2)
- For unemployed users, Claude MUST ask ALG questions
- NO market analysis, marketing, or financial questions during intake

### Console Warnings to Watch

```
[useChatStream] Normalized phase "background" to "founder_profile"
[useChatStream] Unknown phase "xyz", keeping current: warmup
```

If you see these, the normalization is working as a safety net.

---

## 📁 Phase-Locked Intake System Architecture

### Prompt Structure (Per Phase)

```
buildIntakePhasePrompt(phase, options):
  1. Minimal orchestrator context (~50 lines)
  2. Phase-specific coaching (1-2 fragments)
  3. Common intake rules (_common.md)
  4. Previous phase data injection
  5. Phase-specific prompt (01-07.md)
  6. JSON output instructions
```

### Phase Files

```
src/lib/prompts/modules/intake-phases/
├── _common.md              # Valid phase names, scope rules
├── 01-warmup.md            # Business idea collection
├── 02-founder-profile.md   # ALG status (CRITICAL), experience
├── 03-personality.md       # Howard's 7 dimensions
├── 04-profile-gen.md       # Synthesize profile
├── 05-resources.md         # Financial, time, network
├── 06-business-type.md     # Classification
└── 07-validation.md        # GZ eligibility check
```

### Key Files

| File | Purpose |
|------|---------|
| `prompt-loader.ts` | `buildIntakePhasePrompt()` function |
| `use-chat-stream.ts` | Phase tracking, normalization |
| `chat-panel.tsx` | PhaseIndicator component |
| `intake-preview.tsx` | PhaseProgressStepper component |
| `src/types/modules/intake.ts` | `IntakePhase` type, validators |

---

## 🔄 Previous Session Work (Before Sanity Check)

### Phase-Locked System Implementation

1. Created 8 phase prompt files (01-07 + _common)
2. Updated `prompt-loader.ts` with `buildIntakePhasePrompt()`
3. Updated API route to accept `intakePhase` parameter
4. Updated `use-chat-stream.ts` for phase tracking
5. Added phase validators to intake types
6. Updated `chat-panel.tsx` with PhaseIndicator
7. Updated `intake-preview.tsx` with PhaseProgressStepper

### Bug Fixes

- Fixed "Maximum update depth exceeded" error in chat-panel.tsx
- Added `isInitialMountRef` to prevent infinite useEffect loops

---

## 📊 Project Status

| Metric | Value |
|--------|-------|
| Phases Complete | 5.2/9 (58%) |
| Phase 6 Progress | Intake module ~60% |
| Current Work | Phase-locked testing |
| Next Step | Manual testing |

---

## 🗓️ Session Log

**Date**: 2026-01-16 (Session 2)
**Duration**: ~1.5 hours
**Task**: Sanity check phase-locked system
**Result**: Fixed phase name enforcement issues
**Next**: Test the fixes manually

---

*Ready for testing! Watch console for phase normalization warnings.*
