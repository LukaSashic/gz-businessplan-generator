# GZ Businessplan Generator - Product Requirements Document

**Version:** 0.2
**Last Updated:** 2026-01-19
**Status:** Implementation Ready

---

## 1. Executive Summary

The GZ Businessplan Generator is an AI-powered coaching system that guides German Gründungszuschuss (startup grant) applicants through creating BA-compliant business plans. The system combines evidence-based coaching methodologies with financial precision to achieve a 90%+ BA approval rate.

### Core Value Proposition

- **For:** Gründungszuschuss applicants (unemployed starting businesses in Germany)
- **Who:** Need BA-approved business plans for €18,000 grant
- **The Product:** AI coaching system with 10 modules
- **That:** Combines evidence-based coaching with financial precision
- **Unlike:** Generic templates or expensive consultants
- **Our Product:** Provides personalized, BA-compliant plans at 95% cost reduction

---

## 2. System Architecture

### 2.1 High-Level Components

```
┌─────────────────────────────────────────────────────────────┐
│                    USER INTERFACE                            │
│  ┌──────────────────┬──────────────────────────────────┐    │
│  │  💬 Chat Panel   │  📄 Live Document Preview        │    │
│  │  (AI Coach)      │  (Real-time updates)             │    │
│  └──────────────────┴──────────────────────────────────┘    │
│                    Canvas Pattern (Split-View)              │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                   COACHING ENGINE                            │
│  ┌─────────┬─────────┬─────────┬─────────┬─────────┐       │
│  │   SDT   │  GROW   │   MI    │   CBC   │   TTM   │       │
│  └─────────┴─────────┴─────────┴─────────┴─────────┘       │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                   10 WORKSHOP MODULES                        │
│  Intake → Geschäftsmodell → Unternehmen → Markt → ...      │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 Technology Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| Frontend | Next.js 15, TypeScript, Tailwind, shadcn/ui | UI |
| State | Jotai + IndexedDB | Offline-first persistence |
| AI | Claude Sonnet 4.5 with ZDR header | Coaching engine |
| Database | Supabase (Frankfurt) | User data, RLS |
| Math | decimal.js | Exact financial calculations |

---

## 3. AI Coach Persona: Greta

### 3.1 Core Identity

**Name:** Greta
**Role:** Experienced business coach specializing in Gründungszuschuss applications
**Tone:** Warm, professional, encouraging but honest

### 3.2 Communication Guidelines

**DO:**
- Use open questions (Was, Wie, Welche)
- Reflect back what user said
- Acknowledge emotions explicitly
- Support autonomy ("Was denkst DU?")
- Build competence ("Du hast bereits X geschafft")
- Create relatedness ("Viele Gründer erleben das")

**DON'T (FORBIDDEN):**
- "Du solltest..." (directive advice)
- "Du musst..." (commands)
- "Am besten wäre..." (prescriptive)
- Generic praise without specifics
- Leading questions
- Assumptions about user's situation

### 3.3 Address Form

- Default: "Sie" (formal)
- Switch to "Du" only if user explicitly requests
- Consistent throughout session once chosen

---

## 4. Coaching Methodology Framework

See `docs/coaching-methodology.md` for detailed specifications.

### 4.1 Primary Frameworks

1. **SDT (Self-Determination Theory)** - Foundation
   - Autonomy: Support user's choices
   - Competence: Build mastery
   - Relatedness: Create connection

2. **GROW Model** - Conversation Structure
   - Goal: What do you want?
   - Reality: Where are you now?
   - Options: What could you do?
   - Will: What will you do?

3. **TTM (Transtheoretical Model)** - Stage Detection
   - Precontemplation → Contemplation → Preparation → Action → Maintenance

4. **MI (Motivational Interviewing)** - Change Talk
   - DARN-CAT: Desire, Ability, Reason, Need, Commitment, Activation, Taking Steps

5. **CBC (Cognitive Behavioral Coaching)** - Limiting Beliefs
   - Identify → Evidence → Challenge → Reframe → Action

6. **Appreciative Inquiry** - Strengths Focus
   - Discover → Dream → Design → Destiny

---

## 5. Workshop Modules

See `docs/workshop-modules.md` for detailed specifications.

| # | Module | Duration | Primary Coaching |
|---|--------|----------|------------------|
| 0 | Intake & Assessment | 45 min | AI (Discover), TTM |
| 1 | Gründerperson | 30 min | CBC, AI |
| 2 | Geschäftsmodell | 70 min | CBC, Socratic |
| 3 | Unternehmen | 60 min | GROW |
| 4 | Markt & Wettbewerb | 90 min | Socratic, MI |
| 5 | Marketing & Vertrieb | 90 min | MI, CBC |
| 6 | Finanzplanung | 180 min | CBC, MI |
| 7 | SWOT-Analyse | 45 min | Balanced |
| 8 | Meilensteine | 45 min | GROW (Will) |
| 9 | KPIs | 45 min | GROW |
| 10 | Zusammenfassung | 30 min | AI (Celebrate) |

**Total:** 10-15 hours over 2-4 weeks

---

## 6. Business Types

See `docs/business-types.md` for detailed specifications.

### 6.1 The 15 Business Types

| ID | Type | Category | Key Characteristics |
|----|------|----------|---------------------|
| 1 | Beratung | Service | B2B, hourly/project, low capital |
| 2 | Agentur | Service | B2B, team-based, project fees |
| 3 | Freiberufler | Service | B2B/B2C, solo, hourly |
| 4 | Gesundheit | Service | B2C, regulated, certifications |
| 5 | E-Commerce | Product | B2C, inventory, shipping |
| 6 | Einzelhandel | Product | B2C, location, inventory |
| 7 | Hybrid-Handel | Product | B2B+B2C, omnichannel |
| 8 | Handwerk | Service | B2C, Meisterpflicht, local |
| 9 | Gewerbe | Service | B2B/B2C, permits required |
| 10 | Mobile-Dienste | Service | B2C, vehicle-based |
| 11 | Restaurant | Gastro | B2C, high fixed costs |
| 12 | FoodTruck | Gastro | B2C, mobile, permits |
| 13 | Catering | Gastro | B2B/B2C, event-based |
| 14 | SaaS | Digital | B2B, MRR, scalable |
| 15 | IT-Dienstleistung | Digital | B2B, project/retainer |

### 6.2 Business Type Influences

Each business type affects:
- **Question Variations:** Different questions per module
- **Validation Rules:** Industry-specific thresholds
- **Financial Templates:** Revenue models, cost structures
- **Coaching Focus:** Specific challenges and beliefs

---

## 7. Validation Engine

### 7.1 Validation Levels

1. **Inline Validation** - During conversation
   - Detect unrealistic numbers
   - Challenge with Socratic questions
   - NOT judgmental

2. **Cross-Module Validation** - Between modules
   - Consistency checks
   - Price alignment
   - Timeline alignment

3. **BA Compliance** - Before export
   - All sections complete
   - Minimum requirements met
   - Critical blockers resolved

### 7.2 Critical Blockers

| Issue | Level | Action |
|-------|-------|--------|
| Negative liquidity | BLOCKER | Cannot export |
| < 3 competitors | BLOCKER | Cannot export |
| ALG days < 150 | BLOCKER | Alternative paths |
| Break-even > 36 months | WARNING | Flag but allow |

---

## 8. Financial Requirements

### 8.1 Calculation Rules

**CRITICAL:** All financial calculations MUST use decimal.js

```typescript
// WRONG - floating point errors
const total = 2500.50 * 12; // 30006.000000000004

// CORRECT - exact arithmetic
import Decimal from 'decimal.js';
const total = new Decimal('2500.50').times(12); // 30006.00
```

### 8.2 Standard Test Scenario

**€50k GZ Test Case:**
- Gründungskosten: €15,000
- Anlaufkosten: €25,000
- Reserve: €10,000
- **Total Kapitalbedarf:** €50,000

**Financing:**
- Gründungszuschuss: €18,000 (6 × €3,000)
- Eigenkapital: €22,000
- Förderkredit: €10,000

### 8.3 German Formatting

- Thousands: dot (1.234)
- Decimals: comma (1.234,56)
- Currency: trailing (1.234,56 €)

---

## 9. Compliance Requirements

### 9.1 DSGVO Compliance

**Zero Data Retention (ZDR):**
```typescript
headers: {
  'anthropic-beta': 'zdr-2024-10-22'
}
```

**Required for ALL Claude API calls.**

### 9.2 WCAG 2.2 AA

- Keyboard navigation
- Screen reader support
- Color contrast ≥ 4.5:1
- Focus indicators
- ARIA labels on all interactive elements

### 9.3 BA Requirements

- All 10 sections complete
- 3-year financial projections
- Minimum 3 competitors analyzed
- Qualifications documented
- Realistic revenue projections

---

## 10. Success Metrics

### 10.1 Product KPIs

| Metric | Target |
|--------|--------|
| BA Approval Rate | ≥ 90% |
| Workshop Completion | ≥ 70% |
| Time to Complete | 10-15 hours |
| User Satisfaction | ≥ 4.5/5 |

### 10.2 Coaching Quality KPIs

| Metric | Target |
|--------|--------|
| Open Question Ratio | ≥ 70% |
| Autonomy Instances | ≥ 5/module |
| Empathy Markers | ≥ 3/module |
| Advice Giving | 0 |
| Change Talk Ratio | ≥ 0.6 |

---

## Appendices

- **Appendix A:** Business Types - `docs/business-types.md`
- **Appendix B:** Coaching Methodology - `docs/coaching-methodology.md`
- **Appendix C:** Module Specifications - `docs/workshop-modules.md`
- **Appendix D:** Validation Rules - `docs/validation-rules.md`
