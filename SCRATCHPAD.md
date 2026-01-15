# Development Scratchpad

**Purpose:** Track current work state, decisions, and blockers. Updated throughout sessions.

---

## Current Session

**Date:** 2026-01-15  
**Goal:** Complete Step 14 - Frontend Auth UI  
**Module/Feature:** Dashboard, Profile Settings, Workshop Management

---

## Active Work

### What I Just Completed
- [x] Part 1: Fixed uuid_generate_v7() encoding bug with CASCADE
- [x] Part 2: Enhanced middleware with route protection
- [x] Part 3: Dashboard layout with sidebar and header
- [x] Part 4: User profile settings page with form
- [x] Part 5: Workshop list, create, and delete functionality

### Next Up
- [ ] Part 6: Jotai state management setup
- [ ] Install jotai, jotai-devtools, idb-keyval
- [ ] Create atom definitions for workshop state
- [ ] Set up persistence layer

### Decisions Made Today
1. **Decision:** Use CASCADE when dropping uuid_generate_v7() function  
   **Why:** Function was used as default in 9 tables, needed to drop and recreate  
   **Result:** Clean replacement, all defaults restored

2. **Decision:** Add phone column to profiles table  
   **Why:** Profile update form expected it, useful for business context  
   **Result:** Profile editing now works completely

3. **Decision:** Match workshops table schema to actual database structure  
   **Why:** Form used business_name, current_module, data but they didn't exist  
   **Result:** Added missing columns, workshop creation now works

4. **Decision:** Use title field as primary workshop identifier  
   **Why:** title column is NOT NULL in database, business_name is nullable  
   **Result:** Workshop creation succeeds, proper data structure

---

## Blockers & Open Questions

### Blockers
None currently - all Step 14 blockers resolved!

### Questions Needing Answers
1. **Question:** Where to implement Canvas Pattern for workshop modules?  
   **Impact:** Need split-view chat + document preview for coaching flow  
   **Source to Check:** gz-tech-frontend SKILL.md, implement in /workshop/[id] route

2. **Question:** How to structure Jotai atoms for 10 modules?  
   **Impact:** Need efficient state management for workshop data  
   **Source to Check:** gz-tech-frontend SKILL.md has atom patterns

---

## Recent Changes

### Last 10 Changes
1. `src/components/dashboard/create-workshop-form.tsx` - Workshop creation form with validation
2. `src/components/dashboard/delete-workshop-button.tsx` - Delete workshop with confirmation
3. `src/app/dashboard/workshops/page.tsx` - Workshop list with grid layout
4. `src/app/dashboard/workshops/new/page.tsx` - New workshop creation page
5. `src/components/dashboard/profile-form.tsx` - Profile edit form (name, phone)
6. `src/app/dashboard/settings/page.tsx` - Settings page with profile management
7. `src/components/dashboard/sidebar.tsx` - Sidebar navigation with user info
8. `src/components/dashboard/header.tsx` - Top header for dashboard
9. `src/app/dashboard/layout.tsx` - Dashboard layout wrapper
10. `src/app/dashboard/page.tsx` - Main dashboard with workshop overview

### Files Modified Today
- `middleware.ts` - Enhanced with explicit route protection lists
- `src/lib/utils.ts` - Added cn() utility for className merging
- `src/components/ui/button.tsx` - Button component with variants
- Database: Added phone, business_name, current_module, data columns
- Database: Fixed uuid_generate_v7() function
- Database: Fixed RLS policy for profile updates

---

## Next Steps

### Immediate (This Session - Part 6)
1. Install Jotai dependencies (jotai, jotai-devtools, idb-keyval)
2. Create src/lib/state/ directory structure
3. Define workshop atoms (workshopAtom, currentModuleAtom)
4. Set up atom persistence with IndexedDB
5. Create useWorkshop hook for easy access

### Tomorrow (After Step 14)
1. Start Phase 4: Backend API Routes
2. Implement /api/chat endpoint with Claude streaming
3. Add Vercel AI SDK integration
4. Set up streaming JSON extraction
5. Test end-to-end Claude coaching flow

---

## Notes & Reminders

### Keep in Mind
- **lib/ folder location:** lib/ is in PROJECT ROOT, not src/. Always use relative paths like '../../../lib/supabase/server'
- **server.ts async cookies:** Use `const cookieStore = await cookies()` - it's async in Next.js 15
- **--legacy-peer-deps:** Always use this flag for npm install due to React 19 peer dependency conflicts
- **TypeScript server refresh:** Sometimes need to restart TS server in VS Code (Ctrl+Shift+P → "TypeScript: Restart TS Server")
- **RLS policies:** UPDATE policies need both USING and WITH CHECK expressions with same condition
- **Database schema:** Always check actual schema before assuming column names - use information_schema query

### Gotchas Encountered
1. **uuid_generate_v7() bug:** Original function generated invalid UUIDs - fixed with proper RFC 9562 implementation
2. **Missing columns:** workshops table needed business_name, current_module, data columns added manually
3. **Profile RLS policy:** Used user_id instead of id in USING clause - caused silent update failures
4. **Phone column:** Profile form expected phone column that didn't exist - added via ALTER TABLE
5. **Workshop title:** title field is NOT NULL, must provide it when creating workshops

### Reference Links
- [Supabase RLS Policies](https://supabase.com/docs/guides/auth/row-level-security)
- [Next.js 15 App Router](https://nextjs.org/docs/app)
- [Jotai Documentation](https://jotai.org/docs/introduction)

---

## Context Summary (For Recovery After /clear)

**Feature:** Frontend Authentication UI - Dashboard, Profile, Workshop Management  
**Current State:** Step 14 Parts 1-5 complete, starting Part 6 (Jotai state management)  
**Key Files:**
- `src/app/dashboard/layout.tsx` - Main dashboard layout with sidebar
- `src/app/dashboard/page.tsx` - Dashboard overview with workshops
- `src/app/dashboard/settings/page.tsx` - User profile settings
- `src/app/dashboard/workshops/page.tsx` - Workshop list view
- `src/components/dashboard/*` - Sidebar, header, forms, buttons
- `middleware.ts` - Enhanced route protection
- Database: profiles (with phone), workshops (title, business_name, current_module, data)

**Critical Context:**
- All authentication flows working (Google OAuth)
- Dashboard fully functional with sidebar navigation
- Profile editing works (name, phone)
- Workshop CRUD operations complete (create, list, delete)
- Ready for state management layer with Jotai
- Next: Implement atoms for workshop state, then move to backend API routes

---

**Last Updated:** 2026-01-15 14:00
