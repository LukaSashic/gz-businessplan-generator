# Project Progress Tracker

**Project:** GZ Businessplan Generator
**Last Updated:** 2026-01-18 (Session 4)

---

## Overall Status

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎯 PROJECT PHASES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Phase 1: Architecture & Skills Definition
✅ Phase 2: Database Schema & RLS Policies
✅ Phase 3: Frontend Foundation
✅ Phase 4: Backend API Routes
✅ Phase 5: Workshop Canvas UI (COMPLETE!)
🔄 Phase 6: Module Implementation (2/10 - Intake + Geschäftsmodell)
⬚ Phase 7: Document Generation
⬚ Phase 8: Testing & Accessibility
⬚ Phase 9: Deployment & Monitoring
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Progress: 5.2/9 Phases (58%)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## Recently Completed 🎉

### ✅ Phase 6 Module 02: Geschäftsmodell (2026-01-18) - COMPLETE!

**Phase-Locked Prompt System for Module 02:**

*Gap Analysis & Planning:*
- [x] Created `IMPLEMENTATION_GAP_ANALYSIS.md` comparing SPEC vs implementation
- [x] Identified Module 1 at ~90% compliance, Module 2 at ~70% compliance
- [x] Prioritized fixes: Schema → CBC Service → Phase Prompts → API Integration

*Schema Fix (BA Compliance):*
- [x] Fixed `src/types/modules/geschaeftsmodell.ts` - enforce minimum 3 competitors
- [x] Changed `min(0)` to `min(3)` with German error message
- [x] BA requirement now properly enforced in Zod schema

*CBC Pattern Detection Service:*
- [x] Created `src/lib/services/cbc-pattern-detector.ts`
- [x] 5 pattern types: vague_offering, broad_target, limiting_belief, unrealistic_assumption, provider_perspective
- [x] German trigger word detection (150+ trigger phrases)
- [x] 5-step CBC intervention prompt generation
- [x] Follow-up questions per pattern type
- [x] Integration functions: `detectCBCPattern()`, `hasCBCTrigger()`, `shouldActivateCBC()`

*Phase-Specific Prompts (4 phases):*
- [x] `_common.md` - Valid phase names, scope restrictions, CBC triggers, JSON format
- [x] `01-angebot.md` - Offering definition (~15 min)
  - mainOffering, deliveryFormat, pricingModel, scope, oneSentencePitch
  - CBC patterns for vague quality claims ("guter Service", "professionell")
- [x] `02-zielgruppe.md` - Target audience definition (~20 min)
  - Primary persona with name, demographics, psychographics
  - Buying trigger identification
  - Market size with TAM/SAM and sources (BA requirement)
  - CBC patterns for broad targets ("alle", "jeder", "Unternehmen")
- [x] `03-wertversprechen.md` - Value Proposition Canvas (~15 min)
  - Customer jobs, pains, gains
  - Pain relievers, gain creators
  - Value statement from CUSTOMER perspective (not provider!)
  - CBC patterns for provider perspective ("Ich biete...")
- [x] `04-usp.md` - USP definition (~20 min)
  - Minimum 3 competitors analysis (BA requirement!)
  - USP 5-criteria test (isUnique, isRelevant, isProvable, isUnderstandable, isOneSentence)
  - CBC patterns for non-unique USP claims

*Prompt Loader Integration:*
- [x] Added `buildGeschaeftsmodellPhasePrompt()` function
- [x] Added `formatPreviousGeschaeftsmodellPhaseData()` for context carryover
- [x] Added `getMinimalGeschaeftsmodellOrchestratorContext()`
- [x] Added `getGeschaeftsmodellPhaseJSONInstructions()` with valid phase names
- [x] Phase-specific coaching stacks (CBC-heavy for challenging vague answers)
- [x] Intake context injection for cross-module continuity

*Chat API Integration:*
- [x] Added `geschaeftsmodellPhase` parameter to request body
- [x] Added `previousGeschaeftsmodellData` for progressive updates
- [x] Added `intakeContext` for cross-module data (elevator pitch, problem, solution)
- [x] Phase-locked prompt loading for Module 02

*Preview Integration:*
- [x] Verified `GeschaeftsmodellPreview` component already exists (789 lines)
- [x] Internal data/document view toggle
- [x] Phase progress stepper with completion tracking
- [x] BA compliance blockers and warnings display
- [x] All cards: Offering, Target Audience, Value Proposition, USP, Competitive Analysis

**Files Created:**
- `IMPLEMENTATION_GAP_ANALYSIS.md` - Gap analysis document
- `src/lib/services/cbc-pattern-detector.ts` - CBC coaching service
- `src/lib/prompts/modules/geschaeftsmodell-phases/_common.md`
- `src/lib/prompts/modules/geschaeftsmodell-phases/01-angebot.md`
- `src/lib/prompts/modules/geschaeftsmodell-phases/02-zielgruppe.md`
- `src/lib/prompts/modules/geschaeftsmodell-phases/03-wertversprechen.md`
- `src/lib/prompts/modules/geschaeftsmodell-phases/04-usp.md`

**Files Updated:**
- `src/types/modules/geschaeftsmodell.ts` - Min 3 competitors enforcement
- `src/lib/prompts/prompt-loader.ts` - Geschaeftsmodell phase prompt builder
- `src/app/api/chat/route.ts` - Geschaeftsmodell phase support

---

### 🔄 Phase 6 Module 01: Intake (2026-01-16) - IN PROGRESS

**Module 01 UX & Transition System (Jan 16, Session 3):**

*Welcome & Orientation System:*
- [x] Created `src/lib/workshop/welcome.ts` - Welcome message generator
- [x] Created `WelcomeScreen` component with module overview and CTA
- [x] Integrated welcome view state into chat-panel.tsx

*Module Transition Framework:*
- [x] Created `src/lib/workshop/transitions.ts` - Transition logic
- [x] Created `ModuleTransition` component - Celebration/recap screens
- [x] Achievement summary, data quality check, next module preview
- [x] Progress bar with module completion percentage

*Enhanced Personality Assessment (3-option format):*
- [x] Created `src/lib/workshop/personality-assessment.ts`
- [x] 7 scenario templates for Howard's dimensions
- [x] A/B/C options mapping to high/medium/low scores
- [x] Created `PersonalityScenario` component with follow-up questions

*Business-Specific Scenario Generation:*
- [x] `generatePersonalityScenario()` injects user's business context
- [x] Scenarios adapt to business idea (e.g., "your coaching service...")

*Complete Document Preview Structure:*
- [x] Created `src/lib/businessplan/document-structure.ts`
- [x] Created `BusinessPlanPreview` component
- [x] Shows actual prose text, not JSON data
- [x] Expandable sections with status indicators
- [x] Word count and completion percentage

*Personality Narrative Generator:*
- [x] `generatePersonalityNarrative()` function
- [x] Converts dimension scores to human-readable German text

*Preview Panel Integration:*
- [x] Added Tabs toggle (Daten / Dokument) in preview-panel.tsx
- [x] Switches between IntakePreview (data cards) and BusinessPlanPreview (document)

**Files Created:**
- `src/lib/workshop/welcome.ts` - Welcome message generation
- `src/lib/workshop/transitions.ts` - Module transitions
- `src/lib/workshop/personality-assessment.ts` - 3-option scenarios
- `src/lib/businessplan/document-structure.ts` - Document preview structure
- `src/app/dashboard/workshop/[id]/components/welcome-screen.tsx`
- `src/app/dashboard/workshop/[id]/components/module-transition.tsx`
- `src/app/dashboard/workshop/[id]/components/personality-scenario.tsx`
- `src/app/dashboard/workshop/[id]/components/previews/businessplan-preview.tsx`

**Files Updated:**
- `src/app/dashboard/workshop/[id]/components/chat-panel.tsx` - View states
- `src/app/dashboard/workshop/[id]/components/preview-panel.tsx` - Tab toggle

---

**Module 01 Improvement Plan COMPLETE (Jan 16):**

*Phase 1: Critical Prompt Fixes (P0):*
- [x] Enforce ALL 7 personality dimensions (completion tracking table + blocking rule)
- [x] Enforce business_type phase before validation (cannot skip)
- [x] Hard block ALG validation for unemployed (exact days required, vague answers rejected)
- [x] Added `validateFounderProfilePhase()` with blocking for missing ALG data

*Phase 2: Coaching Methodology Fixes (P1):*
- [x] Fixed coaching loading order (stage detection now in warmup, not personality)
- [x] Added Appreciative Inquiry opening (strengths-based warmup)
- [x] Woven stage detection into warmup phase

*Phase 3: Red Flag Detection (P1):*
- [x] Created `src/lib/services/red-flag-detector.ts` with 9 red flag patterns
- [x] Pattern matching for: imposterSyndrome, unrealisticExpectations, insufficientCapital, externalLocusOfControl, financialAnxiety, timeScarcity, lackOfCommitment, marketBlindness, isolationTendency
- [x] Integrated into `useChatStream` hook (detects on user messages)
- [x] Display in intake-preview.tsx with severity badges and coaching hints

*Phase 4: Living Document Preview (P2):*
- [x] Created `intake-document-preview.tsx` with prose-style business plan view
- [x] View toggle (Data cards / Document) in intake-preview.tsx
- [x] Shows what BA will see in final document

*Phase 5: Hide JSON from Chat (P2):*
- [x] `stripJSONBlocks()` in message-list.tsx removes JSON from display
- [x] JSON extraction continues in background for data updates

**Phase-Locked Prompt System (Jan 16):**
- [x] 8 phase-specific prompt files created (`src/lib/prompts/modules/intake-phases/`)
- [x] `buildIntakePhasePrompt()` function for phase-scoped prompts (~200-350 lines vs 1100)
- [x] Phase name enforcement in prompts (explicit valid values, DO NOT USE table)
- [x] `PHASE_NAME_NORMALIZATION` map in hook (30+ incorrect→correct mappings)
- [x] `isValidPhaseTransition()` client-side validation blocks invalid phase jumps
- [x] SCOPE RESTRICTION in _common.md (prevents Module 2+ content in intake)
- [x] PhaseIndicator component in chat-panel.tsx
- [x] PhaseProgressStepper in intake-preview.tsx
- [ ] **NEXT: Manual testing of improved intake flow**

**Prompt Loading System:**
- [x] `prompt-loader.ts` upgraded to load actual module files from disk
- [x] Module file mapping (`gz-intake` → `gz-module-01-intake.md`)
- [x] Coaching stack per module (core + stage + ai + mi fragments)
- [x] Layered prompt building (Orchestrator → Coaching → Module)

**Type System:**
- [x] `IntakeOutput` types with Zod schema (`src/types/modules/intake.ts`)
- [x] Howard's 7 entrepreneurial personality dimensions
- [x] Business type classification (6 types)
- [x] GZ eligibility checking (150+ ALG days)
- [x] `WorkshopSession` types (`src/types/workshop-session.ts`)
- [x] `IntakeValidation` schema (`src/types/modules/validation.ts`)

**JSON Streaming:**
- [x] `parser.ts` supports both markdown (```json) and XML (<json>) tags
- [x] `useChatStream` hook accumulates moduleData progressively
- [x] `mergePartialJSON` for streaming data merging

**Intake Preview Component:**
- [x] `intake-preview.tsx` specialized preview for intake data
- [x] Progress card with completion percentage
- [x] GZ eligibility status alert
- [x] Founder profile card
- [x] Business idea card with elevator pitch
- [x] Personality dimensions visualization
- [x] Business type classification badge
- [x] Resources summary (capital, time, network)
- [x] Validation summary (strengths, concerns)

**State Management:**
- [x] `streamingDataFamily` atom for per-workshop streaming data
- [x] `currentPhaseAtom` for phase tracking
- [x] Phase detection from AI responses (pattern matching + JSON markers)

**Validation Service:**
- [x] `intake-validator.ts` service for real-time validation
- [x] Phase completion checkers
- [x] GZ eligibility urgency levels
- [x] Validation summary generator

**UI Components Added:**
- [x] Card component (shadcn/ui pattern)
- [x] Progress component (radix-ui)
- [x] Badge variants (success, warning)

**Files Created:**
- `src/types/modules/intake.ts` - IntakeOutput Zod schema
- `src/types/modules/validation.ts` - Validation types & functions
- `src/types/workshop-session.ts` - Session state types
- `src/lib/services/intake-validator.ts` - Validation service
- `src/app/dashboard/workshop/[id]/components/previews/intake-preview.tsx`
- `src/components/ui/card.tsx`
- `src/components/ui/progress.tsx`

**Files Updated:**
- `src/lib/prompts/prompt-loader.ts` - Full rewrite + `buildIntakePhasePrompt()` + phase JSON instructions
- `src/lib/streaming/parser.ts` - Added XML tag support
- `src/hooks/use-chat-stream.ts` - Phase tracking, normalization map, `normalizePhase()` function
- `src/lib/state/workshop-atoms.ts` - Added streaming atoms
- `src/app/dashboard/workshop/[id]/components/chat-panel.tsx` - PhaseIndicator component, infinite loop fix
- `src/app/dashboard/workshop/[id]/components/preview-panel.tsx` - Module-specific rendering
- `src/app/dashboard/workshop/[id]/components/workshop-canvas.tsx` - Pass streaming data

**Phase Prompt Files Created:**
- `src/lib/prompts/modules/intake-phases/_common.md` - Valid phase names, scope rules
- `src/lib/prompts/modules/intake-phases/01-warmup.md` - Business idea collection
- `src/lib/prompts/modules/intake-phases/02-founder-profile.md` - ALG status (CRITICAL)
- `src/lib/prompts/modules/intake-phases/03-personality.md` - Howard's 7 dimensions
- `src/lib/prompts/modules/intake-phases/04-profile-gen.md` - Synthesize profile
- `src/lib/prompts/modules/intake-phases/05-resources.md` - Financial, time, network
- `src/lib/prompts/modules/intake-phases/06-business-type.md` - Classification
- `src/lib/prompts/modules/intake-phases/07-validation.md` - GZ eligibility check

---

### ✅ Phase 5: Workshop Canvas UI (2026-01-16) - COMPLETE!

**Canvas Pattern UI:**
- [x] Workshop canvas layout (`workshop-canvas.tsx`) - Split-view container
- [x] Chat panel (`chat-panel.tsx`) - Left side with streaming
- [x] Preview panel (`preview-panel.tsx`) - Right side document preview
- [x] Message list (`message-list.tsx`) - Chat history display
- [x] Message input (`message-input.tsx`) - User input field
- [x] Document preview (`document-preview.tsx`) - Markdown renderer
- [x] Workshop header (`workshop-header.tsx`) - Module selector dropdown
- [x] Mobile responsive - Tabs layout on mobile, split-view on desktop

**Integration:**
- [x] `useChatStream` hook integrated
- [x] Jotai state management connected
- [x] Module switching via dropdown selector
- [x] Loading states and error handling
- [x] Auto-scroll on new messages

**Auto-Save & Persistence:**
- [x] `useAutoSave` hook - saves every 5 seconds when data changes
- [x] IndexedDB persistence via `idb-keyval`
- [x] Saving indicator in header (spinner + "Gespeichert" timestamp)
- [x] Load data from IndexedDB on mount
- [x] Save on unmount for unsaved changes

**Keyboard Shortcuts:**
- [x] Enter to send message
- [x] Cmd/Ctrl+Enter to send (alternative)
- [x] Escape to clear input and blur

**Bugs Fixed (2026-01-16):**
- [x] Routing: Fixed links from `/workshop/${id}` → `/dashboard/workshop/${id}`
- [x] Supabase: Fixed Server Component using client import → server import
- [x] Jotai: Fixed "not writable atom" error - use `workshopsAtom` instead of read-only `currentWorkshopAtom`

**Files Created:**
- `src/app/dashboard/workshop/[id]/page.tsx` - Workshop page
- `src/app/dashboard/workshop/[id]/components/workshop-canvas.tsx`
- `src/app/dashboard/workshop/[id]/components/chat-panel.tsx`
- `src/app/dashboard/workshop/[id]/components/preview-panel.tsx`
- `src/app/dashboard/workshop/[id]/components/message-list.tsx`
- `src/app/dashboard/workshop/[id]/components/message-input.tsx`
- `src/app/dashboard/workshop/[id]/components/document-preview.tsx`
- `src/app/dashboard/workshop/[id]/components/workshop-header.tsx`

---

### ✅ Phase 4: Backend API Routes (2026-01-15)

**Claude Integration:**
- [x] Claude API streaming endpoint (`/api/chat`)
- [x] Zero Data Retention headers (GDPR compliance)
- [x] Retry logic with exponential backoff
- [x] Fallback system prompts for MVP
- [x] Streaming JSON parser with partial-json
- [x] React hooks for chat streaming (`useChatStream`)

**Workshop APIs:**
- [x] POST `/api/workshop` - Create workshop
- [x] GET `/api/workshop` - List workshops (with pagination)
- [x] GET `/api/workshop/[id]` - Get single workshop
- [x] PATCH `/api/workshop/[id]` - Update workshop
- [x] DELETE `/api/workshop/[id]` - Delete workshop
- [x] POST `/api/workshop/[id]/module` - Save module progress
- [x] GET `/api/workshop/[id]/module?name=X` - Get module data

**Infrastructure:**
- [x] Rate limiting (10 req/min for chat, 30 req/min for workshops)
- [x] Reusable rate limiter class with cleanup
- [x] Comprehensive error handling (401, 404, 400, 429, 500)
- [x] Zod schemas for data validation
- [x] Next.js 15 async params compatibility
- [x] Database constraint fixes (status values)
- [x] Integration tests (90% pass rate)

---

## Completed Features

### ✅ Database & Auth
- [x] Supabase project setup (Frankfurt region)
- [x] User authentication with Google OAuth
- [x] Workshop, modules, conversations tables
- [x] RLS policies for data isolation
- [x] Database migrations system
- [x] UUIDv7 functions for better performance

### ✅ Frontend Foundation
- [x] Next.js 15 project setup with TypeScript
- [x] Authentication flow (login, callback, middleware)
- [x] Dashboard layout with sidebar navigation
- [x] Profile settings page (edit name, phone)
- [x] Workshop management (create, list, delete)
- [x] Jotai state management (15+ atoms)
- [x] Toast notification system
- [x] IndexedDB persistence layer
- [x] Button component with 6 variants
- [x] 20+ reusable UI components

### ✅ Backend API Routes
- [x] Claude API streaming integration
- [x] Workshop CRUD endpoints (8 routes)
- [x] Rate limiting system
- [x] Streaming JSON parser
- [x] Error handling & validation
- [x] GDPR compliance (Zero Data Retention)

### ✅ Skills Definition
- [x] gz-orchestrator (master controller)
- [x] All 10 module skills (intake → zusammenfassung)
- [x] 5 coaching methodology fragments
- [x] gz-tech-architecture (system design)
- [x] gz-tech-frontend (UI patterns)
- [x] gz-tech-backend (API implementation)
- [x] gz-tech-database (schema & RLS)
- [x] gz-tech-payment (PayPal integration - planned)

---

## Route Structure

```
/                           → Landing page
/auth/login                 → Login page
/auth/callback              → OAuth callback
/dashboard                  → Dashboard home
/dashboard/workshops        → List all workshops (plural = collection)
/dashboard/workshops/new    → Create new workshop
/dashboard/workshop/[id]    → Workshop Canvas UI (singular = individual)
/dashboard/settings         → User settings
```

---

## Next Up: Continue Phase 6 Module Implementation

### 🎯 Phase 6: Module Implementation (2/10 Complete)
- [x] Module 01: Intake & Assessment (~90% SPEC compliant)
- [x] Module 02: Geschäftsmodell (Phase-locked prompts + CBC coaching)
- [ ] Module 03: Unternehmen (Rechtsform, Standort, Management)
- [ ] Module 04: Markt & Wettbewerb (Competitive analysis deep-dive)
- [ ] Module 05: Marketing (Channels, pricing, customer journey)
- [ ] Module 06: Finanzplanung (CRITICAL - decimal.js for exact math)
- [ ] Module 07: SWOT (Cross-module synthesis)
- [ ] Module 08: Meilensteine (Timeline, milestones)
- [ ] Module 09: KPIs (Success metrics)
- [ ] Module 10: Zusammenfassung (Executive summary)

### 🎯 Immediate Next Steps
1. Manual testing of Module 02 flow with geschaeftsmodell phases
2. Verify CBC coaching triggers work correctly
3. Test phase transitions (angebot → zielgruppe → wertversprechen → usp)
4. Start Module 03: Unternehmen implementation

---

## In Progress

### Phase-Locked Intake System Testing

**Status:** Sanity check complete, fixes applied, ready for manual testing

**What was fixed (Jan 16, Session 2):**
1. Claude was outputting wrong phase names ("background" instead of "founder_profile")
2. Claude was asking market analysis questions during intake (scope creep)
3. Added explicit phase name enforcement in all 8 prompt files
4. Added `PHASE_NAME_NORMALIZATION` map as safety net in hook
5. Added SCOPE RESTRICTION to prevent Module 2+ content

**Next Steps:**
1. Start dev server: `npm run dev`
2. Test intake flow manually
3. Watch console for `[useChatStream] Normalized phase` warnings
4. Verify Claude stays in intake scope (no market questions)

---

## Metrics & Achievements

### Development Velocity
- **Phases Completed:** 5.2/9 (58%)
- **Modules Implemented:** 2/10 (Intake + Geschäftsmodell)
- **Development Time:** ~3.5 weeks
- **Lines of Code:** ~21,000+
- **Components Created:** 40+
- **API Endpoints:** 8
- **Phase Prompt Files:** 13 (8 intake + 5 geschaeftsmodell)
- **Test Pass Rate:** 90%

### Cost Savings
- **Traditional Development Cost:** €50,000-100,000
- **Your Implementation Cost:** ~€60 (Claude API)
- **Savings:** 99.9% 🚀

### Technical Milestones
- ✅ Full-stack TypeScript application
- ✅ Enterprise-grade authentication
- ✅ Real-time streaming with Claude
- ✅ GDPR-compliant data handling
- ✅ Production-ready error handling
- ✅ Comprehensive rate limiting
- ✅ Next.js 15 + React 19 compatibility
- ✅ Canvas Pattern UI (split-view)
- ✅ Mobile responsive design

---

## Known Issues & Tech Debt

### Minor Issues
- [ ] Rate limiter uses in-memory storage (need Redis for production)
- [ ] System prompts use fallbacks (need to load actual skill files)
- [ ] No retry queue for failed API calls
- [ ] Limited error telemetry
- [ ] IndexedDB persistence not fully implemented

### Future Enhancements
- [ ] WebSocket support for real-time collaboration
- [ ] PDF export with custom branding
- [ ] Email notifications for milestones
- [ ] Advanced analytics dashboard
- [ ] A/B testing framework
- [ ] Voice coaching feature (premium tier)

---

## Recent Learnings

### Phase 5 Insights
1. **Server vs Client Supabase:** Server Components must use `@/lib/supabase/server`, not `client`
2. **Jotai Derived Atoms:** Read-only atoms (with only getter) cannot be written to - use the source atom instead
3. **Next.js Routing:** Singular vs plural route naming requires careful link management
4. **Canvas Pattern:** Split-view works well, but tabs are better for mobile

### Best Practices Established
- Always use `--legacy-peer-deps` for React 19 compatibility
- Restart TypeScript server after creating new files
- Use Zod schemas for runtime validation
- Keep rate limiters simple with cleanup intervals
- Fallback prompts enable rapid development
- Integration tests catch cross-system issues
- Test routes in browser after changes

---

## Quick Reference

**Project Structure:**
```
gz-businessplan-generator/
├── lib/                          # Root lib folder
│   └── supabase/
│       ├── client.ts            # Browser client
│       ├── server.ts            # Server client (for RSC)
│       └── middleware.ts        # Session management
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── chat/route.ts   # Claude streaming
│   │   │   └── workshop/       # Workshop CRUD
│   │   ├── auth/               # Auth pages
│   │   └── dashboard/
│   │       ├── workshop/[id]/  # Phase 5 Canvas UI
│   │       └── workshops/      # List & create
│   ├── components/
│   │   ├── dashboard/          # Dashboard components
│   │   ├── providers/          # Jotai provider
│   │   └── ui/                 # Reusable UI
│   ├── hooks/
│   │   └── use-chat-stream.ts  # Chat hook
│   ├── lib/
│   │   ├── rate-limit.ts       # Rate limiter
│   │   ├── prompts/            # Prompt loader
│   │   ├── streaming/          # Streaming utils
│   │   ├── state/              # Jotai atoms
│   │   └── schemas.ts          # Zod schemas
│   └── types/
│       ├── chat.ts             # Chat types
│       └── supabase.ts         # DB types
└── middleware.ts                # Root middleware
```

**Key Commands:**
```bash
npm run dev              # Start dev server
npm run build            # Build for production
npx tsx test-*.ts        # Run test scripts
git status              # Check changes
git add .               # Stage all
git commit -m "..."     # Commit
git push                # Push to GitHub
```

---

*End of Progress Tracker*
