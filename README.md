# GZ Businessplan Generator

> AI-powered business plan generator for German Gründungszuschuss (startup grant) applications

**Status:** 🔵 In Development  
**Version:** 0.1.0 (MVP)  
**License:** Private (Not yet open source)

---

## Overview

The **GZ Businessplan Generator** is an intelligent coaching system that guides unemployed entrepreneurs through creating **BA-compliant business plans** for the German **Gründungszuschuss** startup grant program (€18,000 over 15 months).

### The Problem

Applying for Gründungszuschuss requires:
- ✅ Comprehensive business plan (20-30 pages)
- ✅ BA (Bundesagentur für Arbeit) approval
- ✅ IHK Tragfähigkeitsbescheinigung (viability certificate)
- ⏱️ 40-60 hours of work OR
- 💰 €2,000-5,000 for professional consultants

**Rejection rate:** 30-40% due to incomplete or unrealistic plans

### Our Solution

An AI-powered workshop that:
- 🤖 **Guides** through 10 structured modules using evidence-based coaching
- 📊 **Validates** financial calculations with exact arithmetic (no rounding errors)
- 📄 **Generates** BA-compliant documents ready for submission
- ⏱️ **Saves** 30+ hours vs. manual creation
- 💰 **Costs** 95% less than professional consultants

**Target:** 90%+ BA approval rate

---

## Key Features

### 1. Evidence-Based Coaching

Integrates **4 scientific coaching methodologies:**
- **MI** (Motivational Interviewing) - Handle ambivalence, build motivation
- **CBC** (Cognitive Behavioral Coaching) - Challenge limiting beliefs, reframe assumptions
- **AI** (Appreciative Inquiry) - Discover strengths, build on successes
- **SDT** (Self-Determination Theory) - Support autonomy, competence, relatedness

### 2. Canvas Pattern UI

**Desktop:** Split-view interface
```
┌──────────────┬───────────────────┐
│   💬 Chat    │  📄 Live Preview  │
│   AI Coach   │  Business Plan    │
│              │  (grows in RT)    │
└──────────────┴───────────────────┘
```

**Mobile:** Tab-based navigation

### 3. Financial Precision

- ✅ **decimal.js** for exact arithmetic (no floating-point errors)
- ✅ **3-year financial projections** with monthly granularity
- ✅ **Break-even analysis** validated against market benchmarks
- ✅ **Web research integration** for realistic assumptions

### 4. BA Compliance Built-In

- Month 6 self-sufficiency validation
- Privatentnahme ≤ ALG I requirement check
- Market data with documented sources
- Cross-module consistency validation

### 5. DSGVO Compliant

- 🇪🇺 **EU hosting** (Supabase Frankfurt, Vercel Frankfurt)
- 🔒 **Zero Data Retention** for Claude API
- 🛡️ **Row Level Security** (RLS) policies
- ❌ **No PII** in logs or external services

---

## Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | Next.js 15 | React framework with App Router |
| **UI** | Tailwind CSS + shadcn/ui | Styling + accessible components |
| **State** | Jotai + IndexedDB | Atomic state + offline persistence |
| **Backend** | Next.js API Routes | Serverless functions |
| **Database** | Supabase (PostgreSQL) | Data storage + Auth + RLS |
| **AI** | Claude Sonnet 4.5 | Business coaching + generation |
| **Math** | decimal.js | Exact financial calculations |
| **Auth** | Supabase Auth (Google) | OAuth authentication |
| **Hosting** | Vercel (Frankfurt) | Edge deployment |
| **Monitoring** | Sentry + Langfuse | Error tracking + LLM observability |

---

## Workshop Modules

The workshop consists of **10 guided modules** completed over 10-15 hours:

| # | Module | Focus | Duration |
|---|--------|-------|----------|
| 1 | Intake & Assessment | Founder profile, business validation | 45 min |
| 2 | Geschäftsmodell | Value proposition, target audience, USP | 60 min |
| 3 | Unternehmen | Legal form, insurance, location | 60 min |
| 4 | Markt & Wettbewerb | Market analysis with web research | 90 min |
| 5 | Marketing | 4Ps, acquisition funnel, budget | 90 min |
| 6 | Finanzplanung | 3-year financials (CRITICAL) | 180 min |
| 7 | SWOT | Strengths, weaknesses, opportunities, threats | 45 min |
| 8 | Meilensteine | 90-day plan, 3-year roadmap | 45 min |
| 9 | KPIs | Key performance indicators | 45 min |
| 10 | Zusammenfassung | Executive summary | 30 min |

**Total:** 10-15 hours over 2-4 weeks

---

## Project Status

### ✅ Completed

- **Planning & Architecture** (Phase 0)
  - All 10 modules designed
  - Coaching methodologies integrated
  - Technical architecture finalized
  - Documentation complete

### 🔵 In Progress

- **Foundation Setup** (Phase 1)
  - Next.js project initialization
  - Supabase configuration
  - Database schema creation

### ⬚ Upcoming

- **Core UI** (Phase 2)
- **Claude Integration** (Phase 3)
- **Module Implementation** (Phase 4)
- **Quality & Deploy** (Phase 5)

**Target Launch:** 30 days from start

---

## Development

### Prerequisites

- Node.js 18+ (LTS recommended)
- npm or pnpm
- Git
- Supabase account
- Anthropic API key

### Setup (Coming Soon)

```bash
# Clone repository
git clone https://github.com/yourusername/gz-businessplan-generator.git
cd gz-businessplan-generator

# Install dependencies
npm install

# Configure environment
cp .env.example .env.local
# Edit .env.local with your keys

# Run database migrations
npm run db:migrate

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Project Structure

```
gz-businessplan-generator/
├── src/
│   ├── app/                # Next.js App Router
│   │   ├── (auth)/         # Auth routes
│   │   ├── (workshop)/     # Workshop routes (Canvas Pattern)
│   │   │   ├── @chat/      # Chat panel (Parallel Route)
│   │   │   └── @preview/   # Preview panel (Parallel Route)
│   │   └── api/            # API routes
│   ├── components/         # React components
│   ├── lib/                # Utilities
│   │   ├── supabase/       # Supabase client
│   │   ├── claude/         # Claude API integration
│   │   ├── state/          # Jotai atoms
│   │   ├── finance/        # Financial math (decimal.js)
│   │   └── validation/     # Zod schemas
│   └── types/              # TypeScript types
├── public/
│   └── skills/             # Module skill files
├── supabase/
│   └── migrations/         # Database migrations
└── tests/
    ├── unit/               # Vitest unit tests
    ├── integration/        # Integration tests
    └── e2e/                # Playwright E2E tests
```

---

## Documentation

- **[CLAUDE.md](./CLAUDE.md)** - Comprehensive project guide (38KB)
- **[PROGRESS.md](./PROGRESS.md)** - Project status tracking
- **[SCRATCHPAD.md](./SCRATCHPAD.md)** - Session notes (developers)
- **GZ_DEVELOPMENT_STRATEGY.md** - Detailed implementation strategy
- **GZ_PRODUCT_REQUIREMENTS_DOCUMENT.md** - Complete PRD

---

## Compliance

### DSGVO (GDPR)

- ✅ Zero Data Retention for Claude API
- ✅ EU-only hosting (Frankfurt)
- ✅ Row Level Security (RLS)
- ✅ No PII in logs
- ✅ User data deletion on request

### Accessibility

- ✅ WCAG 2.2 AA compliance
- ✅ Keyboard navigation
- ✅ Screen reader support
- ✅ EAA June 2025 ready

### BA Requirements

- ✅ Month 6 self-sufficiency validation
- ✅ Exact financial calculations (decimal.js)
- ✅ Market data with sources
- ✅ Cross-module consistency checks

---

## Cost Structure

### Development

- **Traditional Contractor:** €50,000-100,000
- **With Ralph Autonomous:** €450-650
- **Savings:** 99%+

### Operations (per month at 100 users)

- **Claude API:** €170
- **Supabase Pro:** €25
- **Vercel:** Free (Pro: €20)
- **Monitoring:** €26
- **Total:** €200-250/month

**Cost per Business Plan:** €1.00-1.25

---

## Roadmap

### MVP (v0.1) - 30 days

- [ ] All 10 modules functional
- [ ] Financial calculations accurate
- [ ] Document export (.docx)
- [ ] DSGVO compliant
- [ ] WCAG 2.2 AA accessible

### v1.0 - Post-MVP

- [ ] Voice coaching (premium feature)
- [ ] Template marketplace
- [ ] Multi-language support (English)
- [ ] API access for partners

### v2.0 - Future

- [ ] Mobile app (React Native)
- [ ] Collaborative editing
- [ ] AI-powered financial advisor
- [ ] Integration with BA portal

---

## Contributing

**Status:** Private repository (not accepting contributions yet)

Once open-sourced, we welcome contributions! Areas we'll need help:
- Module content improvements
- Coaching methodology enhancements
- UI/UX design
- Testing and quality assurance
- Documentation

---

## Support

- **Issues:** GitHub Issues (when repository is public)
- **Email:** support@gz-businessplan.de (placeholder)
- **Documentation:** [CLAUDE.md](./CLAUDE.md)

---

## License

**Private** - Not yet licensed for public use.

When open-sourced, likely **MIT License** for code, **CC BY-NC-SA 4.0** for content.

---

## Acknowledgments

### Coaching Methodologies

- **MI:** Miller & Rollnick (Motivational Interviewing)
- **CBC:** Palmer & Szymanska (Cognitive Behavioral Coaching)
- **AI:** Cooperrider & Whitney (Appreciative Inquiry)
- **SDT:** Ryan & Deci (Self-Determination Theory)
- **Stage Model:** Prochaska & DiClemente (Transtheoretical Model)

### Technology

- [Anthropic](https://www.anthropic.com) - Claude AI
- [Supabase](https://supabase.com) - Backend infrastructure
- [Vercel](https://vercel.com) - Hosting platform
- [Next.js](https://nextjs.org) - React framework
- [shadcn/ui](https://ui.shadcn.com) - UI components

---

## Author

**Sasa** - Solo Developer  
📧 Email: [contact info]  
🐙 GitHub: [github profile]  
🌐 Website: [personal site]

---

## Disclaimer

This tool assists in creating business plans but does **not guarantee** BA approval or Tragfähigkeitsbescheinigung certification. Users are responsible for the accuracy and completeness of their business plans. Consult professional advisors when needed.

---

**Built with ❤️ in Germany** 🇩🇪

**Last Updated:** 2026-01-14