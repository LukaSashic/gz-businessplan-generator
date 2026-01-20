# Phase 6 Takeoff Prompt: Module 01 Intake Implementation

**Project:** GZ Businessplan Generator
**Phase:** 6 - Module Implementation (Module 01: Intake)
**Date:** 2026-01-16

---

## Architecture Overview

### Skill Hierarchy (from gz-orchestrator)

```
gz-orchestrator (Master Controller)
├── Session Management (memory/state)
├── Workshop Flow Coordination
└── Module Execution
    ├── gz-module-01-intake → gz-validator (after completion)
    ├── gz-module-02-geschaeftsmodell → gz-validator
    ├── ... (8 more modules)
    └── gz-module-10-zusammenfassung → gz-validator → Document Generator
```

### Coaching Methodology (Mandatory for All Modules)

From orchestrator - combine these approaches:

1. **GROW Model**: Goal → Reality → Options → Will
2. **Design Thinking**: Empathy → Define → Ideate → Prototype → Test
3. **YC Validation**: "Who has this problem? How do they solve it today? Why will they pay you?"

### Coaching Rules

- Max 2-3 questions per message
- Concrete, honest feedback (no superficial praise)
- Challenge assumptions constructively ("Sanity Check")
- Use examples and analogies
- Summarize regularly
- All communication in German

---

## Context Summary

### What's Already Built (Phases 1-5)

**Infrastructure:**
- Next.js 15 + TypeScript + Tailwind + shadcn/ui
- Supabase (auth, database, RLS policies)
- Jotai state management (15+ atoms)
- IndexedDB persistence layer

**Backend:**
- Claude API streaming endpoint (`/api/chat`) with retry logic
- Workshop CRUD endpoints (8 routes)
- Rate limiting (10 req/min chat, 30 req/min workshops)
- Zero Data Retention headers (GDPR)
- Streaming JSON parser with partial-json

**Frontend:**
- Canvas Pattern UI (40% chat / 60% preview split-view)
- Chat panel with streaming (`useChatStream` hook)
- Preview panel with markdown rendering
- Module selector dropdown (10 modules)
- Auto-save to IndexedDB every 5 seconds
- Keyboard shortcuts (Enter, Cmd+Enter, Escape)
- Mobile responsive (tabs layout)

**Key Files:**
```
src/app/api/chat/route.ts           # Claude streaming API
src/app/dashboard/workshop/[id]/    # Workshop Canvas UI
src/lib/prompts/prompt-loader.ts    # Currently uses fallback prompts
src/lib/prompts/modules/            # NEW: Module skill files
src/lib/state/workshop-atoms.ts     # Jotai atoms
src/lib/state/hooks.ts              # useAutoSave, useWorkshopData
src/hooks/use-chat-stream.ts        # Chat streaming hook
```

---

## Business Type Classification (Critical for Module Relevance)

From `gz-orchestrator/references/module-definitions.md`:

```typescript
type BusinessType =
  | 'DIGITAL_SERVICE'    // Remote consulting, coaching, freelancing, SaaS
  | 'LOCAL_SERVICE'      // Hairdresser, craft, gastronomy, retail
  | 'HYBRID_SERVICE'     // Agency with office, local consulting
  | 'PRODUCT_DIGITAL'    // Software, apps, online courses
  | 'PRODUCT_PHYSICAL'   // E-commerce, manufacturing, trade
  | 'FRANCHISE';         // Franchise concepts
```

**Why it matters:** Business type determines which module sections are:
- ✅ **Pflicht** (Required)
- ⚪ **Optional**
- ❌ **Nicht relevant** (Skip)

Example: `DIGITAL_SERVICE` skips location analysis (3.6) but requires online marketing (5.3.2).

---

## Workshop Session State (from gz-orchestrator)

### Memory Structure for Progress Tracking

```typescript
interface WorkshopSession {
  userId: string;
  workshopId: string;
  status: 'active' | 'completed';
  currentModule: string;
  completedModules: string[];
  skippedModules: string[];
  businessType: BusinessType;
  lastActivity: string; // ISO date
  moduleData: Record<string, any>; // Structured output per module
  validationResults: Record<string, ValidationResult>;
}
```

### User Commands (to implement)

| Command | Action |
|---------|--------|
| `!status` | Show current progress |
| `!zurück` | Go to previous module |
| `!überspringen` | Skip current module (with reason) |
| `!export` | Export current draft |
| `!neustart` | Restart workshop completely |

---

## Phase 6 Goal: Module 01 Intake

### What to Build

Transform the current chat from generic Q&A into a structured coaching conversation that:

1. **Loads the actual module prompt** from `gz-module-01-intake.md`
2. **Guides conversation** through 7 phases (Warm-Up → Founder Profile → Personality → etc.)
3. **Extracts structured JSON** from Claude's responses matching `IntakeOutput` schema
4. **Displays structured data** in the preview panel
5. **Saves module data** to database/IndexedDB

---

## Technical Requirements

### 1. Prompt Loader Upgrade

**Current State:** `prompt-loader.ts` uses hardcoded fallback prompts

**Module Name Mapping:**
```typescript
// UI uses short names, files use numbered names
const MODULE_FILE_MAP: Record<GZModule, string> = {
  'gz-intake': 'gz-module-01-intake.md',
  'gz-geschaeftsmodell': 'gz-module-02-geschaeftsmodell.md',
  'gz-unternehmen': 'gz-module-03-unternehmen.md',
  'gz-markt-wettbewerb': 'gz-module-04-markt-wettbewerb.md',
  'gz-marketing': 'gz-module-05-marketing.md',
  'gz-finanzplanung': 'gz-module-06-finanzplanung.md',
  'gz-swot': 'gz-module-07-swot.md',
  'gz-meilensteine': 'gz-module-08-meilensteine.md',
  'gz-kpi': 'gz-module-09-kpi.md',
  'gz-zusammenfassung': 'gz-module-10-zusammenfassung.md',
};
```

**Required:**
- Read actual markdown files from `src/lib/prompts/modules/`
- Map UI module names to file names using MODULE_FILE_MAP
- Implement layered loading per `MODULAR_COACHING_MODULE_MAPPING.md`:
  - Layer 1: `gz-system-coaching-core` (always loaded)
  - Layer 2: Module-specific coaching (for Module 01: stage, ai, mi)
  - Layer 3: Module content (`gz-module-01-intake.md`)
- Cache loaded prompts (5 min TTL)
- Handle file read errors gracefully

**Module 01 Coaching Stack:**
```typescript
const MODULE_01_COACHING = [
  'gz-system-coaching-core',  // GROW model, Socratic questioning
  'gz-coaching-stage',        // Stage detection
  'gz-coaching-ai',           // Appreciative Inquiry
  'gz-coaching-mi',           // Motivational Interviewing
];
```

### 2. Structured Output Extraction

**IntakeOutput Schema** (from gz-module-01-intake.md):
```typescript
interface IntakeOutput {
  founder: {
    name: string;
    currentStatus: 'employed' | 'unemployed' | 'other';
    algStatus?: { monthlyAmount: number; daysRemaining: number; };
    experience: { yearsInIndustry: number; relevantRoles: string[]; previousFounder: boolean; };
    qualifications: { education: string; certifications: string[]; specialSkills: string[]; };
    motivation: { push: string[]; pull: string[]; };
  };
  businessIdea: {
    elevator_pitch: string;
    problem: string;
    solution: string;
    targetAudience: string;
    uniqueValue: string;
  };
  personality: {
    innovativeness: 'high' | 'medium' | 'low';
    riskTaking: 'high' | 'medium' | 'low';
    achievement: 'high' | 'medium' | 'low';
    proactiveness: 'high' | 'medium' | 'low';
    locusOfControl: 'high' | 'medium' | 'low';
    selfEfficacy: 'high' | 'medium' | 'low';
    autonomy: 'high' | 'medium' | 'low';
    narrative: string;
    redFlags?: string[];
  };
  businessType: {
    category: 'consulting' | 'ecommerce' | 'local_service' | 'local_retail' | 'manufacturing' | 'hybrid';
    isLocationDependent: boolean;
    requiresPhysicalInventory: boolean;
    isDigitalFirst: boolean;
    reasoning: string;
  };
  resources: {
    financial: { availableCapital: number; expectedGZ: number; monthlyObligations: number; };
    time: { plannedStartDate: string; hoursPerWeek: number; isFullTime: boolean; };
    network: { industryContacts: number; potentialFirstCustomers: string[]; supporters: string[]; };
    infrastructure: { hasWorkspace: boolean; hasEquipment: boolean; hasLegalClarity: boolean; };
  };
  validation: {
    isGZEligible: boolean;
    majorConcerns: string[];
    minorConcerns: string[];
    strengths: string[];
  };
  metadata: {
    completedAt: string;
    duration: number;
    conversationTurns: number;
  };
}
```

**Extraction Strategy:**
- Instruct Claude to output `<json>...</json>` blocks after each phase
- Use streaming JSON parser (partial-json already installed)
- Merge partial updates into complete IntakeOutput
- Validate with Zod schema

### 3. Preview Panel Enhancement

**Current State:** Shows raw markdown

**Required:**
- Detect current module and render appropriate component
- For Module 01: Show intake progress card with:
  - Founder profile summary
  - Business idea card
  - Personality radar chart (7 dimensions)
  - Business type badge
  - GZ eligibility indicator (green/red)
  - Validation warnings/strengths
- Update in real-time as JSON is extracted

### 4. Conversation Flow Control

**7 Phases from gz-module-01-intake.md:**
1. Warm-Up (5 min) - Business idea high-level
2. Founder Profile (10 min) - Experience, qualifications, motivation
3. Entrepreneurial Personality (20 min) - Howard's 7 dimensions
4. Profile Generation (5 min) - Synthesize findings
5. Resources (5 min) - Financial, time, network
6. Business Type Classification (3 min) - Category determination
7. Validation (2 min) - Eligibility check, concerns, strengths

**Implementation:**
- Track current phase in state
- Show phase progress indicator
- Prompt Claude to transition phases naturally
- Allow phase skipping for returning users

### 5. Data Persistence

**Database:**
```sql
-- workshops.data JSONB column already exists
-- Store IntakeOutput as:
UPDATE workshops
SET data = jsonb_set(data, '{modules,gz-intake}', $intakeOutput::jsonb)
WHERE id = $workshopId;
```

**IndexedDB:**
- Use existing `useAutoSave` hook
- Sync to Supabase on completion

---

## Implementation Steps

### Step 1: Upgrade Prompt Loader
1. Add `loadModuleFile()` function to read `.md` files from disk
2. Update `getContextualPrompt()` to load module + coaching stack
3. Add caching layer

### Step 2: Create IntakeOutput Types
1. Create `src/types/modules/intake.ts` with full schema
2. Add Zod validation schema
3. Create type guards for partial data

### Step 3: Enhance Chat Panel
1. Add JSON extraction from streaming response
2. Update `useChatStream` to emit structured data events
3. Track conversation phase

### Step 4: Build Intake Preview Component
1. Create `src/app/dashboard/workshop/[id]/components/previews/intake-preview.tsx`
2. Implement sections for each IntakeOutput field
3. Add real-time update capability

### Step 5: Update Preview Panel
1. Switch renderer based on `currentModule`
2. For `gz-intake`, render `IntakePreview`
3. Pass extracted data as props

### Step 6: Test End-to-End
1. Start new workshop
2. Go through intake conversation
3. Verify data extraction
4. Check preview updates
5. Confirm persistence

---

## Validator Integration (gz-validator)

### When to Validate

After Module 01 completion, run intake-specific validation:

```typescript
interface IntakeValidation {
  // Critical checks (MUST pass)
  algDaysRemaining: number;      // Must be >= 150 for GZ eligibility
  isGZEligible: boolean;

  // Completeness checks
  founderProfileComplete: boolean;
  businessIdeaComplete: boolean;
  personalityAssessed: boolean;
  businessTypeClassified: boolean;
  resourcesDocumented: boolean;

  // Quality indicators
  majorConcerns: string[];       // Red flags to address
  minorConcerns: string[];       // Yellow flags to monitor
  strengths: string[];           // What's going well
}
```

### Critical Validation Rule (from gz-validator)

```typescript
// GZ eligibility is a HARD requirement
if (algDaysRemaining < 150) {
  return {
    isGZEligible: false,
    blockingError: `Für den Gründungszuschuss brauchst du mindestens 150 Tage
                    ALG I-Restanspruch. Du hast aktuell ${algDaysRemaining} Tage.

                    Optionen:
                    - Warte bis du wieder ≥150 Tage hast
                    - Prüfe Einstiegsgeld als Alternative
                    - Kontaktiere deine Arbeitsagentur für Beratung`
  };
}
```

### Post-Module Flow

```
Module 01 Complete
      ↓
Run Intake Validation
      ↓
┌─────────────────────────────────┐
│ Validation Results              │
│ ✅ GZ Eligibility: Passed       │
│ ✅ Founder Profile: Complete    │
│ ✅ Business Type: DIGITAL_SERVICE│
│ ⚠️ Minor: No previous founding  │
│ ✅ Strengths: 10yr experience   │
└─────────────────────────────────┘
      ↓
Save to Workshop State
      ↓
Show Progress Display
      ↓
Transition to Module 02
```

### Progress Display Format (from gz-orchestrator)

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 WORKSHOP-FORTSCHRITT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Intake & Assessment
🔄 Geschäftsmodell ← Aktuell
⬚ Unternehmen
⬚ Markt & Wettbewerb
⬚ Marketingkonzept
⬚ Finanzplanung
⬚ SWOT-Analyse
⬚ Meilensteine
⬚ KPIs
⬚ Zusammenfassung
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Fortschritt: 1/10 Module (10%)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## Success Criteria

- [ ] Module prompt loads from `gz-module-01-intake.md`
- [ ] Coaching stack loads (core + stage + ai + mi)
- [ ] Claude follows 7-phase conversation flow
- [ ] Structured JSON extracted from responses
- [ ] Preview shows founder profile in real-time
- [ ] Preview shows business idea card
- [ ] Preview shows personality assessment
- [ ] GZ eligibility validated (150 ALG days check)
- [ ] Data persists to IndexedDB
- [ ] Data syncs to Supabase
- [ ] Phase transitions are smooth
- [ ] No hardcoded fallback prompts for Module 01

---

## Files to Create/Modify

**Create:**
- `src/types/modules/intake.ts` - IntakeOutput type + Zod schema
- `src/types/modules/validation.ts` - IntakeValidation type
- `src/types/workshop-session.ts` - WorkshopSession state type
- `src/app/dashboard/workshop/[id]/components/previews/intake-preview.tsx` - Preview component
- `src/lib/validation/intake-validator.ts` - Validation logic for Module 01

**Modify:**
- `src/lib/prompts/prompt-loader.ts` - Load actual module files (including orchestrator/validator)
- `src/hooks/use-chat-stream.ts` - Extract structured JSON
- `src/app/dashboard/workshop/[id]/components/preview-panel.tsx` - Module-specific rendering
- `src/app/dashboard/workshop/[id]/components/chat-panel.tsx` - Phase tracking + user commands
- `src/lib/state/workshop-atoms.ts` - Module data atoms + session state

**Skill Files Available:**
```
src/lib/prompts/modules/
├── gz-orchestrator-extracted/gz-orchestrator/
│   ├── SKILL.md                           # Master controller
│   └── references/module-definitions.md   # Business types + module relevance
├── gz-validator-extracted/gz-validator/
│   ├── SKILL.md                           # Validation rules
│   └── references/rejection-reasons.md    # Common errors + fixes
├── gz-module-01-intake.md                 # Module 01 (1109 lines)
├── gz-system-coaching-core.md             # Always loaded
├── gz-coaching-stage.md                   # Stage detection
├── gz-coaching-ai.md                      # Appreciative Inquiry
└── gz-coaching-mi.md                      # Motivational Interviewing
```

---

## Coaching Integration Notes

From `MODULAR_COACHING_MODULE_MAPPING.md`:

**Module 01 Pattern:**
- Uses GROW model (Goal → Reality → Options → Will)
- Stage detection for readiness adaptation
- Appreciative Inquiry for strengths-first approach
- Motivational Interviewing for ambivalence

**Key Coaching Behaviors:**
- Max 2-3 questions per message
- Reflective summaries every 5-7 exchanges
- Clean Language (no "Du solltest...", "Am besten...")
- User-discovered insights > prescribed solutions

---

## Notes

1. **GDPR:** Founder name stored locally only, NEVER sent to Claude
2. **Validation:** ALG days ≥ 150 is hard requirement for GZ eligibility
3. **Module 06 (Finance):** Will need decimal.js - not relevant for Module 01
4. **Cross-module:** IntakeOutput feeds into all downstream modules
5. **Orchestrator role:** In production, orchestrator coordinates all modules and handles session continuity
6. **Validator timing:** Run validation after each module completion, not just at the end

---

## Common Rejection Reasons to Watch (from gz-validator)

From the rejection statistics, **80%+ of rejections are preventable**:

| Rank | Reason | Frequency | Module 01 Relevance |
|------|--------|-----------|---------------------|
| 1 | Unrealistic financial planning | 25-30% | Sets expectations |
| 2 | No self-sustainability by M6 | 20-25% | Validates resources |
| 3 | Insufficient qualification | 15-20% | **CRITICAL - captured here** |
| 4 | Missing/weak market analysis | 10-15% | Business type informs depth |
| 5 | Inconsistent numbers | 10-15% | N/A for Module 01 |
| 6 | Formal errors | 5-10% | N/A for Module 01 |
| 7 | No financing gap | 5% | Resources section |

**Module 01 specifically validates:**
- Qualification documentation (reason #3)
- Resource availability (feeds into reasons #1, #2, #7)
- GZ eligibility (ALG ≥ 150 days)

---

*Ready to implement Phase 6 - Module 01 Intake!*
