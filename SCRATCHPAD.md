# Scratchpad - Current Session Notes

**Date:** 2026-01-14  
**Time:** 12:00 (Start of Implementation Phase)  
**Session Type:** Foundation Work  
**Context Window:** Fresh session

---

## Current Status

**Phase:** Phase 0 Complete ✅ → Starting Phase 1  
**Focus:** Project initialization and setup  
**Branch:** main  
**Last Commit:** Initial documentation setup

---

## Today's Goals

### Primary Goal
- [ ] Initialize Next.js 15 project with TypeScript
- [ ] Configure Tailwind CSS + shadcn/ui
- [ ] Set up Supabase project (Frankfurt region)

### Secondary Goals
- [ ] Create initial database schema
- [ ] Set up environment variables
- [ ] Configure Git properly (.gitignore, .env.local)

### Stretch Goals
- [ ] Implement basic app layout
- [ ] Set up Google OAuth (if time permits)

---

## Session Context

### What We Just Completed

**Documentation Phase (Complete):**
1. ✅ Fixed Module 01 (Intake) - Added complete Coaching Integration
2. ✅ Fixed Module 05 (Marketing) - Expanded full Conversation Flow
3. ✅ Fixed Module 06 (Finanzplanung) - YAML header + Coaching patterns
4. ✅ Generated production-ready CLAUDE.md (38KB)
5. ✅ Created PROGRESS.md for project tracking
6. ✅ Created this SCRATCHPAD.md for session notes

**Current State:**
- All planning complete
- All module specs finalized
- Documentation foundation in place
- Ready to start implementation

### Files in Project Root

```
C:\Users\Lenovo\Documents\gz-businessplan-generator\
├── CLAUDE.md ✅ (production guide)
├── PROGRESS.md ✅ (project tracking)
├── SCRATCHPAD.md ✅ (this file)
├── README.md ⬚ (to be created)
└── .gitignore ⬚ (empty, needs content)
```

---

## Current Work

### Not Started Yet

**Next Steps:**
1. Populate README.md with public project description
2. Initialize Next.js 15 project
3. Install dependencies
4. Configure TypeScript strict mode

**Waiting On:**
- Nothing (ready to proceed)

**Blockers:**
- None

---

## Important Reminders

### Critical Rules (Review Before Coding)

1. **Financial Math:** ALWAYS use decimal.js, NEVER JavaScript numbers
2. **DSGVO:** Include `'anthropic-beta': 'zdr-2024-10-22'` header in ALL Claude API calls
3. **Security:** Use Supabase anon key (NOT service role) on client side
4. **Accessibility:** Every button needs `aria-label`, keyboard navigation required
5. **Type Safety:** TypeScript strict mode, no `any` types allowed

### Reference Files

**Before starting implementation, read:**
- [x] CLAUDE.md (this session)
- [ ] GZ_DEVELOPMENT_STRATEGY.md (next - for detailed approach)
- [ ] GZ_PRODUCT_REQUIREMENTS_DOCUMENT.md (reference when needed)
- [ ] Relevant module skill files (as needed during implementation)

---

## Decision Points

### Decisions Made This Session

1. **CLAUDE.md Structure:** Comprehensive 31-page guide
   - Why: Single source of truth, easy onboarding
   - Impact: All project context in one place

2. **Module Fix Priority:** Fixed 01, 05, 06 first
   - Why: Critical modules with missing/incomplete content
   - Impact: All modules now implementation-ready

### Decisions Needed

1. **Project Initialization Method:**
   - Option A: `npx create-next-app@latest` (recommended)
   - Option B: Manual setup
   - Decision: TBD when starting Phase 1

2. **Database Setup:**
   - Create Supabase project now or wait until needed?
   - Decision: TBD (can be done in parallel)

---

## Code Snippets & Notes

### Environment Variables Template

```bash
# .env.local (NEVER commit this file)
NEXT_PUBLIC_SUPABASE_URL=https://[project].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[anon_key]
SUPABASE_SERVICE_ROLE_KEY=[service_key] # Server-side only
ANTHROPIC_API_KEY=[api_key]
```

### Initial Dependencies

```json
{
  "dependencies": {
    "next": "^15.0.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "@supabase/supabase-js": "^2.39.0",
    "@anthropic-ai/sdk": "^0.34.0",
    "ai": "^3.0.0",
    "jotai": "^2.6.0",
    "decimal.js": "^10.4.3",
    "zod": "^3.22.0",
    "idb-keyval": "^6.2.1",
    "nuqs": "^1.17.0"
  },
  "devDependencies": {
    "typescript": "^5.3.0",
    "@types/node": "^20.10.0",
    "@types/react": "^18.2.0",
    "tailwindcss": "^3.4.0",
    "eslint": "^8.56.0",
    "prettier": "^3.1.0"
  }
}
```

---

## Questions & Answers

**Q: Should we use App Router or Pages Router?**  
A: App Router (Next.js 15 default). Enables RSC, PPR, better performance.

**Q: Where do skill files go in the actual project?**  
A: Copy from `/mnt/project/` to `public/skills/` so they can be loaded at runtime.

**Q: How to handle skill prompt loading?**  
A: Read from `public/skills/[module].md` server-side, inject into Claude system prompt.

**Q: What's the module build order?**  
A: See PROGRESS.md Phase 4. Start with Module 01 (no deps), end with Module 10 (needs all).

---

## Links & References

### Project Files
- [CLAUDE.md](./CLAUDE.md)
- [PROGRESS.md](./PROGRESS.md)
- [README.md](./README.md) (to be created)

### Skills (in /mnt/project/)
- `gz-module-01-intake-STREAMLINED.md`
- `gz-module-02-geschaeftsmodell-STREAMLINED.md`
- ... (all 10 modules)
- `gz-coaching-*.md` (6 coaching skills)

### External Docs
- [Next.js 15](https://nextjs.org/docs)
- [Supabase](https://supabase.com/docs)
- [Claude API](https://docs.anthropic.com)
- [decimal.js](https://mikemcl.github.io/decimal.js/)

---

## Parking Lot

**Ideas to explore later:**
- Voice coaching feature (premium tier)
- Mobile app (React Native)
- Template marketplace (sell business plan templates)
- Partnership with BA advisors

**Technical improvements:**
- Prompt caching optimization
- Background sync with service workers
- Collaborative editing (multi-user)

---

## Session End Checklist

Before ending this session:
- [ ] Update this SCRATCHPAD.md with progress
- [ ] Update PROGRESS.md if phase/milestone complete
- [ ] Commit code with descriptive message
- [ ] Note any blockers or decisions needed
- [ ] Write "Next Steps" for next session

---

## Next Session

**When:** TBD  
**Focus:** Phase 1 - Project Setup  
**First Steps:**
1. Read GZ_DEVELOPMENT_STRATEGY.md
2. Initialize Next.js 15 project
3. Install core dependencies
4. Configure TypeScript strict mode
5. Update this SCRATCHPAD.md

**Context to Load:**
- CLAUDE.md (project guide)
- PROGRESS.md (status)
- This SCRATCHPAD.md (session notes)
- GZ_DEVELOPMENT_STRATEGY.md (implementation approach)

---

**💡 Tip:** Update this file throughout your work session. Write down thoughts, decisions, and progress. It's your external memory - make it detailed!

**Last Updated:** 2026-01-14 12:00  
**Next Update:** After Phase 1 starts