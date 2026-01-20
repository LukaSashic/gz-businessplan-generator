---
name: gz-module-07-swot
version: 2.0
description: SWOT analysis module for GZ workshop. Develops balanced, honest assessment of Strengths, Weaknesses, Opportunities, and Threats with strategic derivations (SO/ST/WO/WT). Integrates all prior modules for comprehensive self-assessment. Duration 45 minutes. Output actionable SWOT matrix with strategic actions for Meilensteine and risk mitigation.
dependencies:
  - gz-system-coaching-core (GROW, Socratic, Clean Language, reflective summarization)
  - gz-coaching-ai (PRIMARY - start with strengths, build confidence, positive momentum)
  - gz-coaching-cbc (SECONDARY - reframe imposter syndrome, balance weaknesses)
  - gz-coaching-mi (TERTIARY - if user overwhelmed by threats, ambivalence about addressing weaknesses)
  - gz-module-01-intake (founder profile, entrepreneurial personality for strengths)
  - gz-module-02-geschaeftsmodell (USP as strength, value prop gaps as weaknesses)
  - gz-module-03-unternehmen (legal/operational setup as strength/weakness)
  - gz-module-04-markt-wettbewerb (market opportunities, competitive threats)
  - gz-module-05-marketing (channel expertise as strength, gaps as weaknesses)
  - gz-module-06-finanzplanung (financial viability as strength, capital gaps as weaknesses, break-even as opportunity/threat)
---

# Module 07: SWOT-Analyse (SWOT Analysis)

**Duration:** 45 minutes  
**Critical Path:** Yes (informs risk mitigation for Meilensteine, feeds Zusammenfassung)  
**Complexity:** Medium (requires synthesis of all prior modules)  
**Coaching Load:** AI (primary), CBC (secondary), MI (tertiary)

---

## Purpose

Develop balanced, actionable SWOT analysis with:

1. **StÃ¤rken (Strengths)** - internal positive factors from founder & business setup
2. **SchwÃ¤chen (Weaknesses)** - internal challenges & gaps to address
3. **Chancen (Opportunities)** - external positive factors in market/timing
4. **Bedrohungen (Threats)** - external risks & challenges
5. **Strategische Ableitungen (Strategic Derivations)** - SO/ST/WO/WT actions
6. **Risikobewertung (Risk Assessment)** - prioritize mitigation actions
7. **Aktionsplan (Action Plan)** - convert weaknesses/threats into Meilensteine

**BA Rejection Reasons (Module 07):**

- All strengths, no weaknesses (overconfident, not self-aware)
- All weaknesses, no strengths (imposter syndrome, not credible)
- No threats identified ("optimism bias" - unrealistic)
- Lists without strategic derivations (not actionable)
- Generic items ("harte Arbeit", "FlexibilitÃ¤t") without specifics
- Weaknesses listed without mitigation plan
- Threats without contingency strategies

**âš ï¸ CRITICAL: Balance is Key**
BA wants to see: Self-aware founder who knows strengths AND gaps, sees opportunities AND risks, and has plans to leverage/address each. Neither overly optimistic nor pessimistic.

---

## Coaching Integration

### Loaded Skills for This Module

```yaml
always:
  - gz-system-coaching-core
    purpose: GROW structure, Socratic questioning, reflective summarization
    usage: Throughout module for balanced questioning

contextual:
  - gz-coaching-ai (PRIMARY - 60% usage)
    purpose: Start with strengths, build positive momentum, appreciative framing
    triggers:
      - Module start (always begin with DISCOVER phase)
      - User struggles to identify strengths
      - User needs confidence boost before addressing weaknesses
      - Converting weaknesses to "development opportunities"
      - Framing threats as "challenges to overcome"
      - Summary phase (DESTINY - call to action)
    patterns:
      - 4D Cycle: Discover â†’ Dream â†’ Design â†’ Destiny
      - Strength-spotting (evidence from past achievements)
      - Positive reframing ("nicht SchwÃ¤che, sondern Lernfeld")
      - Opportunity amplification

  - gz-coaching-cbc (SECONDARY - 30% usage)
    purpose: Reframe imposter syndrome, balance extreme self-criticism
    triggers:
      - User lists many weaknesses, few strengths (imposter syndrome)
      - User uses absolute language ("Ich kann gar nicht...")
      - User catastrophizes threats ("Das wird nie funktionieren")
      - Weaknesses framed as permanent deficits vs. learnable skills
      - User dismisses own strengths ("Das kann doch jeder")
    patterns:
      - Identify limiting belief
      - Gather evidence of capability
      - Challenge absolute thinking
      - Reframe to growth mindset
      - Action plan for skill development

  - gz-coaching-mi (TERTIARY - 10% usage)
    purpose: Handle overwhelm from threats, ambivalence about addressing weaknesses
    triggers:
      - User overwhelmed by number of threats
      - Resistance to acknowledging weaknesses
      - Ambivalence about effort needed to address gaps
      - Fear of competition (threats section)
    patterns:
      - Express empathy for difficulty
      - Explore both sides (acknowledge vs. ignore)
      - Elicit user's own solutions
      - Support self-efficacy
```

### Key AI Patterns in This Module

#### Pattern 1: Strength Discovery (AI 4D - DISCOVER Phase)

```typescript
// Module opening - start with positive foundation

// AI DISCOVER Phase (Build on Past Wins)

ai: "Willkommen zur SWOT-Analyse!

     Bevor wir in SchwÃ¤chen und Bedrohungen eintauchen,
     lass uns mit deinen STÃ„RKEN starten.

     Wir haben in den letzten Modulen viel erarbeitet.
     Basierend darauf: Was bringst du mit, das andere nicht haben?"

// If user struggles to identify strengths

ai: "Lass mich dir helfen, deine StÃ¤rken zu sehen.

     Aus unserem Intake-GesprÃ¤ch (Modul 1):
     â€¢ Du hast [X Jahre] Erfahrung in [Branche]
     â€¢ Deine Entrepreneurial-PersÃ¶nlichkeit zeigt: [Top 3 Dimensionen]
     â€¢ FrÃ¼here Erfolge: [Achievement aus Modul 1]

     Aus dem GeschÃ¤ftsmodell (Modul 2):
     â€¢ Dein USP ist: [USP]
     â€¢ Du kennst deine Zielgruppe sehr genau
     â€¢ Dein Kundennutzen ist klar definiert

     Aus der Finanzplanung (Modul 6):
     â€¢ Du bist ab Monat [X] selbsttragend
     â€¢ Deine Finanzplanung ist durchgerechnet
     â€¢ Du hast [Kapitalbedarf] vollstÃ¤ndig finanziert

     Siehst du diese StÃ¤rken?"

[User often responds: "Ach ja, stimmt"]

ai: "Genau! Diese StÃ¤rken hast DU erarbeitet.

     Jetzt du: Welche persÃ¶nlichen FÃ¤higkeiten bringst du mit?
     â€¢ Fachliche Kompetenz?
     â€¢ Soft Skills?
     â€¢ Netzwerk?
     â€¢ Ressourcen?"

[User lists 3-5 strengths]

ai: "Sehr gut! Lass uns das konkretisieren.

     Du hast '[Strength 1]' genannt.
     Kannst du mir ein Beispiel geben, wo du das gezeigt hast?"

[User provides evidence]

ai: "Perfekt! Das ist keine Behauptung, sondern nachweisbar.
     BA liebt konkrete Beispiele.

     Lass uns die anderen auch konkretisieren..."

// RESULT: 5-7 specific, evidence-backed strengths identified
```

#### Pattern 2: Imposter Syndrome Reframe (CBC)

```typescript
// User lists many weaknesses, dismisses strengths

user: "Meine SchwÃ¤chen sind:
       â€¢ Keine Verkaufserfahrung
       â€¢ Keine Marketing-Kenntnisse
       â€¢ Wenig Kapital
       â€¢ Kein groÃŸes Netzwerk
       â€¢ Keine FÃ¼hrungserfahrung

       StÃ¤rken... ich weiÃŸ nicht. Nichts Besonderes."

// CBC Response (Reframe Capability Deficits)

// 1. IDENTIFY (Limiting Belief)
ai: "Du fokussierst sehr auf SchwÃ¤chen und sagst
     'nichts Besonderes' bei StÃ¤rken.

     Das ist ein Muster, das ich Ã¶fter sehe.
     Es heiÃŸt 'Imposter Syndrome' - das GefÃ¼hl,
     nicht gut genug zu sein.

     Lass uns das genauer anschauen."

// 2. EVIDENCE (Gather Proof of Capability)
ai: "Du sagst 'keine Verkaufserfahrung'.

     Hast du jemals:
     â€¢ Einen Chef von einer Idee Ã¼berzeugt?
     â€¢ Ein Team fÃ¼r ein Projekt gewonnen?
     â€¢ Kunden in frÃ¼herem Job betreut?"

[User: "Ja, ich habe mehrere Projekte durchgesetzt"]

ai: "Und 'keine Marketing-Kenntnisse'.

     Hast du jemals:
     â€¢ Dich selbst online prÃ¤sentiert (LinkedIn)?
     â€¢ Empfehlungen bekommen?
     â€¢ Networking gemacht?"

[User: "Ja, Ã¼ber LinkedIn bekomme ich Anfragen"]

ai: "Und 'kein Netzwerk'.

     Wie viele Menschen aus deiner Branche kennst du?"

[User: "Vielleicht 50-100"]

ai: "Das SIND 50-100 potenzielle erste Kunden oder Multiplikatoren!"

// 3. CHALLENGE (Question the Belief)
ai: "Lass uns die Aussagen vergleichen:

     **Was du sagtest:**
     'Keine Verkaufserfahrung, kein Marketing, kein Netzwerk'

     **Was die Fakten zeigen:**
     'Projekte durchgesetzt, LinkedIn-Marketing funktioniert,
      50-100 Branchenkontakte'

     Welche Version ist wahrer?"

// 4. REFRAME (Growth Mindset)
ai: "Ich schlage vor, wir reframen:

     âŒ 'SchwÃ¤che: Keine Verkaufserfahrung'
     âœ… 'Entwicklungsfeld: B2B-Verkaufstechniken verfeinern
         (habe bereits ÃœberzeugungsfÃ¤higkeit bewiesen)'

     âŒ 'SchwÃ¤che: Keine Marketing-Kenntnisse'
     âœ… 'StÃ¤rke: LinkedIn-Marketing funktioniert
         Entwicklungsfeld: Weitere KanÃ¤le (Google Ads) lernen'

     âŒ 'SchwÃ¤che: Kein Netzwerk'
     âœ… 'StÃ¤rke: 50-100 Branchenkontakte fÃ¼r Warm Outreach'

     Siehst du den Unterschied?
     Nicht 'kann ich nicht', sondern 'habe ich teilweise,
     baue ich aus'."

// 5. ACTION (Skill Development Plan)
ai: "FÃ¼r jedes Entwicklungsfeld: Wie schlieÃŸt du die LÃ¼cke?

     B2B-Verkauf:
     â†’ 2 BÃ¼cher: [Empfehlungen]
     â†’ 10 ÃœbungsgesprÃ¤che mit Netzwerk
     â†’ Sales-Coach fÃ¼r 3 Sessions

     Google Ads:
     â†’ Online-Kurs (50â‚¬, 10h)
     â†’ 200â‚¬ Test-Budget
     â†’ 2 Wochen Experiment

     Das kommt spÃ¤ter in deine Meilensteine (Modul 8).

     Machbar?"

[User: "Ja, das klingt realistisch"]

ai: "Sehr gut! Du siehst: Keine permanenten SchwÃ¤chen,
     sondern lernbare Skills mit konkretem Plan.

     DAS will die BA sehen."

// RESULT: Reframed mindset, weaknesses â†’ development opportunities with action plans
```

#### Pattern 3: Opportunity Amplification (AI 4D - DREAM Phase)

```typescript
// After strengths identified, move to opportunities

// AI DREAM Phase (Connect Strengths to Market Opportunities)

ai: "Sehr gut! Du hast diese StÃ¤rken:
     â€¢ [Strength 1]
     â€¢ [Strength 2]
     â€¢ [Strength 3]

     Jetzt zur spannenden Frage:
     Wo kÃ¶nnen diese StÃ¤rken wirken?

     Welche CHANCEN siehst du:

     **Im Markt?**
     â€¢ Gibt es Trends, die dir in die Karten spielen?
     â€¢ LÃ¼cken, die du fÃ¼llen kannst?
     â€¢ Wachstumsbereiche?"

[User identifies market opportunities]

ai: "Aus Modul 4 (Markt & Wettbewerb) hatten wir:
     â€¢ [Market trend from M04]
     â€¢ [Gap in competitor offerings]
     â€¢ [Growing segment]

     Passen diese zu deinen StÃ¤rken?"

[User makes connections]

ai: "**In deinem Netzwerk?**
     â€¢ Potenzielle Kooperationspartner?
     â€¢ Multiplikatoren?
     â€¢ Early Adopters?"

[User identifies network opportunities]

ai: "**In Ressourcen & Timing?**
     â€¢ GrÃ¼ndungszuschuss 18 Monate Runway
     â€¢ [Any other resources from M06]
     â€¢ Timing: Warum ist JETZT der richtige Moment?"

[User identifies timing opportunities]

ai: "GroÃŸartig! Du siehst: Deine StÃ¤rken treffen auf
     konkrete Marktchancen.

     Das ist die SO-Strategie (Strengths-Opportunities):
     'Wie nutzt du deine StÃ¤rken fÃ¼r die Chancen?'

     [Strength 1] Ã— [Opportunity 1] = Was kannst du tun?"

[User develops SO strategies]

// RESULT: Positive momentum, user sees potential before addressing threats
```

#### Pattern 4: Threat Normalization (AI + MI Hybrid)

```typescript
// User identifies threats, may feel overwhelmed

user: "Bedrohungen:
       â€¢ Starke Wettbewerber mit mehr Budget
       â€¢ Wirtschaftliche Unsicherheit
       â€¢ Technologie-VerÃ¤nderungen
       â€¢ Kunde kÃ¶nnten Zahlungsprobleme haben
       â€¢ Ich kÃ¶nnte krank werden

       Das sind zu viele Risiken. Vielleicht funktioniert es doch nicht?"

// HYBRID Response (AI Normalization + MI Support)

// 1. NORMALIZE (AI - Threats are Universal)
ai: "Du hast 5 echte Bedrohungen identifiziert.

     Das ist gut! Zu sagen 'keine Bedrohungen' wÃ¤re naiv.

     Wichtig: Jedes Business hat Risiken.
     Die Frage ist nicht 'Gibt es Risiken?'
     sondern 'Wie gehe ich damit um?'"

// 2. EMPATHY (MI - Acknowledge Concern)
ai: "Ich sehe, die Liste fÃ¼hlt sich Ã¼berwÃ¤ltigend an.

     Das ist verstÃ¤ndlich. Risiken zu sehen ist unangenehm.

     Wie geht es dir damit?"

[User: "Es macht mir Angst. Ist vielleicht zu riskant"]

// 3. REFRAME (AI - Controllable vs. Uncontrollable)
ai: "Lass uns die Bedrohungen kategorisieren:

     **Kontrollierbar (du kannst etwas tun):**
     â€¢ Wettbewerber â†’ Differenzierung (dein USP)
     â€¢ Technologie â†’ Weiterbildung, anpassen
     â€¢ Kunde Zahlungsprobleme â†’ Vorauskasse, Versicherung
     â€¢ Krankheit â†’ Krankentagegeld-Versicherung

     **Unkontrollierbar (externe Faktoren):**
     â€¢ Wirtschaftliche Unsicherheit â†’ betrifft alle,
       aber: Deine Branche [resilient/zyklisch]?

     Siehst du? 4 von 5 sind aktiv beeinflussbar!"

// 4. PRIORITIZE (MI - User Chooses)
ai: "Von diesen 5 Bedrohungen:

     Welche ist die WAHRSCHEINLICHSTE und GEFÃ„HRLICHSTE?

     Nicht alle werden eintreten.
     Lass uns die Top 2-3 fokussieren."

[User prioritizes]

ai: "Ok, du hast gewÃ¤hlt:
     1. [Threat 1]
     2. [Threat 2]

     FÃ¼r jede: Was ist dein Plan B?

     [Threat 1]: Wenn das passiert, was machst du?"

[User develops contingency]

ai: "[Threat 2]: Und hier?"

[User develops second contingency]

// 5. SUPPORT SELF-EFFICACY (MI)
ai: "Sehr gut! Du hast fÃ¼r die zwei grÃ¶ÃŸten Risiken
     konkrete NotfallplÃ¤ne.

     Das zeigt: Du bist nicht hilflos.
     Du kannst vorbeugen und reagieren.

     Das ist genau die Risikokompetenz, die BA sehen will:
     'Founder ist sich Risiken bewusst UND hat Strategien'.

     FÃ¼hlst du dich damit sicherer?"

[User: "Ja, es ist nicht so Ã¼berwÃ¤ltigend"]

// RESULT: Threats acknowledged but manageable, user stays motivated
```

### Key CBC Patterns in This Module

#### Pattern 5: Generic Weakness Challenge

```typescript
// User uses vague, generic weaknesses

user: "SchwÃ¤chen:
       â€¢ Manchmal ungeduldig
       â€¢ Perfektionismus
       â€¢ Zu wenig Zeit"

// CBC Response (Challenge Vagueness)

// 1. IDENTIFY (Generic Pattern)
ai: "Diese SchwÃ¤chen sind sehr allgemein.
     Fast jeder GrÃ¼nder kÃ¶nnte das sagen.

     BA will spezifische, geschÃ¤ftsrelevante SchwÃ¤chen sehen."

// 2. EVIDENCE (Get Specific)
ai: "'Ungeduldig' - wann wird das zum Problem?

     Im Kundenkontakt? In Produktentwicklung?
     Beim Warten auf BehÃ¶rden?"

[User: "Bei langsamen Entscheidungsprozessen mit Kunden"]

ai: "Ah! Das ist spezifisch: 'B2B-Verkaufszyklen testen Geduld'.

     Das ist geschÃ¤ftsrelevant.
     Wie gehst du damit um?"

// 3. REFRAME (Specific + Mitigation)
ai: "Lass uns reframen:

     âŒ 'SchwÃ¤che: Ungeduldig'
     âœ… 'Entwicklungsfeld: B2B-Verkaufszyklen (30-90 Tage)
         erfordern Geduld-Training
         MaÃŸnahme: Parallel mehrere Leads bearbeiten,
         um Wartezeit zu nutzen'

     Siehst du? Spezifisch, relevant, mit LÃ¶sung."

// RESULT: Weaknesses specific, business-relevant, with mitigation
```

---

## Module Structure

### Input Requirements

```typescript
// From gz-module-01-intake
interface IntakeInput {
  founder: {
    entrepreneurialPersonality: {
      dimensions: Array<{
        name: string; // e.g., "Achievement Orientation"
        score: 'low' | 'medium' | 'high';
        implications: string;
      }>;
      overallReadiness: string;
    };
    experience: {
      yearsInIndustry: number;
      relevantRoles: string[];
      achievements: string[]; // Past successes for DISCOVER phase
    };
    qualifications: {
      education: string;
      certifications: string[];
      specialSkills: string[];
    };
  };
  businessType: {
    category: string;
    characteristics: string[];
  };
}

// From gz-module-02-geschaeftsmodell
interface GeschaeftsmodellInput {
  offering: {
    mainOffering: string;
    oneSentencePitch: string;
  };
  targetAudience: {
    primaryPersona: {
      name: string;
      // Full persona details
    };
    marketSize: {
      tam: number;
      sam: number;
      som: number;
    };
  };
  valueProposition: {
    valueStatement: string;
    painRelievers: string[];
    gainCreators: string[];
  };
  usp: {
    statement: string;
    category: string;
    evidenceBacking: string;
  };
  competitiveAnalysis: {
    directCompetitors: Array<{
      name: string;
      yourAdvantage: string; // Your strength vs. them
    }>;
  };
}

// From gz-module-03-unternehmen
interface UnternehmenInput {
  management: {
    structure: 'solo' | 'partnership' | 'team';
    coreResponsibilities: string[];
    outsourced: Array<{ task: string; reason: string }>;
  };
  legal: {
    form: string;
    rationale: string;
  };
  qualifications: {
    permits: Array<{
      type: string;
      status: 'obtained' | 'in_progress' | 'required';
    }>;
    missingQualifications?: string[];
  };
  location: {
    hasPhysicalLocation: boolean;
    advantages?: string[];
    disadvantages?: string[];
  };
}

// From gz-module-04-markt-wettbewerb
interface MarktInput {
  market: {
    industryTrends: string[]; // Opportunities
    marketGaps: string[]; // Opportunities
    barriers: string[]; // Threats or Weaknesses
    seasonality?: { factors: string[]; impact: string }; // Threat if negative
  };
  competition: {
    landscape: string;
    competitiveAdvantages: string[]; // Your strengths
    competitiveDisadvantages?: string[]; // Your weaknesses
    threats: string[]; // From competitors
  };
  positioning: {
    strategy: string;
    differentiation: string[]; // Strengths
  };
}

// From gz-module-05-marketing
interface MarketingInput {
  channels: {
    primary: string[];
    expertise: { [channel: string]: 'high' | 'medium' | 'low' }; // Strength/Weakness
  };
  budget: {
    available: number;
    adequate: boolean; // If false, weakness
  };
  network: {
    size: number;
    quality: string;
    accessibility: string;
  };
}

// From gz-module-06-finanzplanung
interface FinanzplanungInput {
  capitalRequirements: {
    totalWithBuffer: number;
    gap: number; // If positive, weakness; if negative, strength
    financing: Array<{ source: string; secured: boolean }>;
  };
  breakEven: {
    month: number; // If <=6, strength; if >9, weakness
    withinGZ: boolean;
  };
  profitability: {
    year1EBITDA: number; // If positive, strength
    margins: { year1: number; year2: number; year3: number };
  };
  liquidity: {
    alwaysPositive: boolean; // If true, strength
    lowestBalance: { amount: number; safe: boolean };
  };
  baApproval: {
    status: 'green' | 'yellow' | 'red';
    criticalIssues: Array<{ issue: string }>; // Weaknesses
  };
}
```

### Output Schema

```typescript
interface SWOTOutput {
  // Strengths (Internal Positive)
  strengths: Array<{
    category:
      | 'founder'
      | 'business_model'
      | 'operations'
      | 'market_position'
      | 'financial';
    strength: string;
    evidence: string; // Konkrete BegrÃ¼ndung
    source: string; // Which module provided this
    relevance: 'critical' | 'important' | 'supporting';
  }>;

  // Weaknesses (Internal Negative)
  weaknesses: Array<{
    category:
      | 'founder'
      | 'business_model'
      | 'operations'
      | 'market_position'
      | 'financial';
    weakness: string;
    impact: 'high' | 'medium' | 'low'; // Business impact
    mitigationPlan: string; // How to address
    timeline: string; // When to address (e.g., "Monate 1-3")
    source: string; // Which module identified this
    addressable: boolean; // Can be fixed vs. inherent constraint
  }>;

  // Opportunities (External Positive)
  opportunities: Array<{
    category:
      | 'market_trend'
      | 'competitive_gap'
      | 'technology'
      | 'regulatory'
      | 'timing'
      | 'partnerships';
    opportunity: string;
    evidence: string; // Market data, source
    timeWindow: string; // "NÃ¤chste 12 Monate", "2025-2026", etc.
    probability: 'high' | 'medium' | 'low';
    source: string; // Which module or external research
  }>;

  // Threats (External Negative)
  threats: Array<{
    category:
      | 'competitive'
      | 'economic'
      | 'regulatory'
      | 'technological'
      | 'market_shift'
      | 'operational';
    threat: string;
    probability: 'high' | 'medium' | 'low';
    impact: 'high' | 'medium' | 'low';
    riskScore: number; // probability Ã— impact (1-9)
    contingencyPlan: string; // What to do if threat materializes
    earlyWarningSignals: string[]; // How to detect threat approaching
    source: string; // Which module or external awareness
  }>;

  // Strategic Derivations
  strategies: {
    SO: Array<{
      // Strengths + Opportunities = Growth strategies
      strength: string;
      opportunity: string;
      strategy: string;
      action: string; // Concrete step
      timeline: string;
    }>;
    ST: Array<{
      // Strengths + Threats = Defensive strategies
      strength: string;
      threat: string;
      strategy: string;
      action: string;
      timeline: string;
    }>;
    WO: Array<{
      // Weaknesses + Opportunities = Development strategies
      weakness: string;
      opportunity: string;
      strategy: string;
      action: string;
      timeline: string;
    }>;
    WT: Array<{
      // Weaknesses + Threats = Damage control strategies
      weakness: string;
      threat: string;
      strategy: string;
      action: string;
      priority: 'urgent' | 'important' | 'monitor';
    }>;
  };

  // Risk Assessment Matrix
  riskMatrix: {
    highPriorityRisks: Array<{
      // High probability + High impact
      threat: string;
      riskScore: number;
      contingency: string;
      responsible: string; // Usually "GrÃ¼nder" or outsourced
    }>;
    monitoringRisks: Array<{
      // Low probability or Low impact
      threat: string;
      riskScore: number;
      monitoringFrequency: string; // "Monthly", "Quarterly"
    }>;
  };

  // Balance Check (BA Quality Signal)
  balance: {
    strengthCount: number;
    weaknessCount: number;
    opportunityCount: number;
    threatCount: number;
    balanceScore: number; // 0-100, higher = more balanced
    balanceStatus: 'balanced' | 'too_optimistic' | 'too_pessimistic';
    recommendation?: string; // If not balanced
  };

  // Action Summary (For Module 08: Meilensteine)
  actionSummary: {
    urgentActions: Array<{
      // Do in Months 1-3
      action: string;
      reason: string; // Address which weakness/threat or leverage which strength/opportunity
      category:
        | 'mitigate_weakness'
        | 'counter_threat'
        | 'leverage_strength'
        | 'seize_opportunity';
    }>;
    importantActions: Array<{
      // Do in Months 4-12
      action: string;
      reason: string;
      category: string;
    }>;
    monitoringActions: Array<{
      // Ongoing monitoring
      action: string;
      frequency: string;
      trigger: string; // What would escalate this to urgent
    }>;
  };

  // Metadata
  metadata: {
    completedAt: string;
    modulesIntegrated: string[]; // ['01', '02', '03', '04', '05', '06']
    coachingMethodsUsed: string[]; // ['AI', 'CBC', 'MI']
    userMindset:
      | 'confident'
      | 'balanced'
      | 'overly_critical'
      | 'overly_optimistic';
    baReadiness: boolean; // True if balanced
  };
}

// Downstream Module Dependencies
interface DownstreamConsumers {
  module08_meilensteine: {
    needs: [
      'actionSummary.urgentActions', // For 90-day plan
      'weaknesses[].mitigationPlan', // Skill development milestones
      'threats[].contingencyPlan', // Risk mitigation milestones
      'strategies.SO', // Growth initiatives
    ];
  };
  module09_kpi: {
    needs: [
      'riskMatrix.highPriorityRisks', // KPIs to monitor these
      'weaknesses[].category', // KPIs to track improvement
      'opportunities[].timeWindow', // KPIs to measure capture
    ];
  };
  module10_zusammenfassung: {
    needs: [
      'strengths', // Key strengths for exec summary
      'opportunities', // Market opportunity statement
      'riskMatrix.highPriorityRisks', // Risk disclosure
      'balance.balanceStatus', // Self-awareness signal
    ];
  };
}
```

---

## Module Flow: 5 Integrated Sections

### GROW Opening (5 minutes)

```
GOAL:
"Willkommen zur SWOT-Analyse!

SWOT hilft uns, ehrlich zu bewerten:
âœ“ Was sind deine StÃ¤rken? (intern positiv)
âœ“ Wo hast du SchwÃ¤chen/LÃ¼cken? (intern negativ)
âœ“ Welche Chancen gibt es? (extern positiv)
âœ“ Welche Risiken drohen? (extern negativ)

Am Ende hast du:
â€¢ Klare SelbsteinschÃ¤tzung (BA liebt Selbstbewusstsein)
â€¢ Aktionsplan fÃ¼r LÃ¼cken
â€¢ Strategien fÃ¼r Chancen und Risiken

Das ist keine Selbstkritik-Session, sondern ehrliche Standortbestimmung.

Wichtig: BA will Balance sehen - weder nur StÃ¤rken noch nur SchwÃ¤chen.

Bereit?"

REALITY:
"Wie siehst du dich selbst aktuell?
- FÃ¼hlst du dich gut vorbereitet?
- Wo hast du noch Unsicherheiten?
- Kennst du deine grÃ¶ÃŸten Risiken?"

[User shares current self-perception]

[Proceed to Section 1: Strengths - always start positive (AI principle)]
```

### Section 1: StÃ¤rken (Strengths) - 10 min

**Objective:** Identify 5-7 specific, evidence-backed internal strengths.

**Approach:**

**1.1 AI DISCOVER Phase - Start Positive**

```
ai: "Lass uns mit deinen STÃ„RKEN starten.

     Wir haben sechs Module durchgearbeitet - da steckt viel drin!

     Ich zeige dir, was ich sehe:

     **AUS MODUL 1 (INTAKE):**
     â€¢ [X Jahre] Branchenerfahrung in [Bereich]
     â€¢ Entrepreneurial-PersÃ¶nlichkeit: [Top 3 dimensions]
     â€¢ FrÃ¼here Erfolge: [Achievement]

     **AUS MODUL 2 (GESCHÃ„FTSMODELL):**
     â€¢ Klarer USP: [USP statement]
     â€¢ Zielgruppe prÃ¤zise definiert
     â€¢ Kundennutzen nachvollziehbar

     **AUS MODUL 4 (MARKT):**
     â€¢ Wettbewerbsanalyse durchgefÃ¼hrt
     â€¢ Positionierung: [Differenzierung]

     **AUS MODUL 6 (FINANZEN):**
     â€¢ Break-Even Monat [X] (selbsttragend)
     â€¢ Kapitalbedarf [vollstÃ¤ndig finanziert / Xâ‚¬ Puffer]
     â€¢ LiquiditÃ¤t immer positiv

     Das sind schon starke Fundamente!

     Jetzt du: Welche PERSÃ–NLICHEN FÃ¤higkeiten bringst du mit?

     Denk an:
     â€¢ Fachliche Kompetenz
     â€¢ Soft Skills (Kommunikation, FÃ¼hrung, etc.)
     â€¢ Netzwerk
     â€¢ Ressourcen (Zeit, Kapital, Equipment)"

[User adds 3-5 personal strengths]

ai: "Sehr gut! Lass uns konkretisieren.

     Du hast '[Strength]' genannt.

     Kannst du mir ein KONKRETES Beispiel geben,
     wo du das bewiesen hast?"

[For each strength: get evidence]

[COACHING PATTERN: If user struggles or dismisses own strengths]
â†’ Trigger AI Pattern 1: Strength Discovery
â†’ Or CBC Pattern (if imposter syndrome): Pattern 2
```

**1.2 Categorize & Document**

```markdown
## STÃ„RKEN (STRENGTHS) - Interne positive Faktoren

### GrÃ¼nder-StÃ¤rken

| StÃ¤rke                           | Konkrete Evidenz                           | Relevanz fÃ¼rs Business              |
| --------------------------------- | ------------------------------------------ | ------------------------------------ |
| [X Jahre Branchenerfahrung]       | [Roles, achievements]                      | Branchenkenntnis = schnellerer Start |
| [Spezifische Fachkompetenz]       | [Zertifikate, Projekte]                    | QualitÃ¤t des Angebots               |
| [Soft Skill, z.B. Kommunikation]  | [Beispiel: PrÃ¤sentation vor 100 Personen] | Kundengewinnung, Netzwerk            |
| [Netzwerk: X Kontakte in Branche] | [Specific connections]                     | Warm Outreach, Referrals             |

### GeschÃ¤ftsmodell-StÃ¤rken

| StÃ¤rke                        | Konkrete Evidenz           | Quelle   |
| ------------------------------ | -------------------------- | -------- |
| Klarer USP: "[USP]"            | Modul 2, validiert in M04  | M02      |
| PrÃ¤zise Zielgruppe            | Persona "[Name]", SAM Xâ‚¬ | M02, M04 |
| Nachvollziehbarer Kundennutzen | Value Prop Canvas          | M02      |

### Operations-StÃ¤rken

| StÃ¤rke                       | Konkrete Evidenz      | Quelle |
| ----------------------------- | --------------------- | ------ |
| [Rechtsform passend gewÃ¤hlt] | [BegrÃ¼ndung aus M03] | M03    |
| [Versicherungen vollstÃ¤ndig] | [Liste aus M03]       | M03    |
| [Standort optimal]            | [Analyse aus M03]     | M03    |

### Marketing-StÃ¤rken

| StÃ¤rke                | Konkrete Evidenz                | Quelle |
| ---------------------- | ------------------------------- | ------ |
| Expertise in [Channel] | [Bisherige Erfolge]             | M05    |
| Funnel durchdacht      | Leadâ†’Kunde mit XX% Conversion | M05    |

### Finanzielle StÃ¤rken

| StÃ¤rke                    | Konkrete Evidenz       | Quelle |
| -------------------------- | ---------------------- | ------ |
| Early Break-Even (Monat X) | Finanzplan M06         | M06    |
| Kapitalbedarf gesichert    | [Finanzierungsquellen] | M06    |
| Konservative Planung       | [Specific assumptions] | M06    |

**GESAMT: [X] StÃ¤rken identifiziert**
```

**Checkpoint:**

```
ai: "Sehr gut! Du hast [X] konkrete StÃ¤rken mit Evidenz.

     Das ist ein starkes Fundament.
     BA sieht: Selbstbewusster, aber nicht arroganter GrÃ¼nder.

     Kurze Pause oder direkt weiter zu Chancen?"
```

---

### Section 2: Chancen (Opportunities) - 8 min

**Objective:** Identify 3-5 external positive factors (market, timing, trends).

**Approach:**

**2.1 AI DREAM Phase - Connect Strengths to Market**

```
ai: "Jetzt wird's spannend: CHANCEN!

     Du hast diese StÃ¤rken. Wo kÃ¶nnen sie WIRKEN?

     Aus Modul 4 (Markt & Wettbewerb) hatten wir:
     â€¢ Markttrends: [List from M04]
     â€¢ WettbewerbslÃ¼cken: [Gaps identified]
     â€¢ Wachstumsbereich: [Growing segment]

     Welche dieser Chancen passen zu deinen StÃ¤rken?

     Beispiel:
     Deine StÃ¤rke [X] Ã— Markt-Chance [Y] = Was kannst du tun?"

[User makes connections - AI DREAM phase]

ai: "Weitere Chancen:

     **Timing:**
     â€¢ GrÃ¼ndungszuschuss: 18 Monate Runway (9.000â‚¬ + Xâ‚¬ Eigenmittel)
     â€¢ [Any time-sensitive opportunities, e.g., new regulations,
        tech changes, seasonal opportunities]

     **Netzwerk:**
     â€¢ Du hast [X] Kontakte
     â€¢ KooperationsmÃ¶glichkeiten?
     â€¢ Early Adopters in Netzwerk?

     **Ressourcen:**
     â€¢ [Equipment, skills, partnerships]

     Was siehst du?"

[User identifies 3-5 opportunities]

[For each opportunity: validate with evidence]

ai: "Chance: '[Opportunity]'

     Warum ist das eine Chance? Gibt es Daten/Evidenz?"

[If user lacks evidence]
â†’ "Lass mich kurz recherchieren..."
â†’ [web_search if needed for trend validation]
```

**2.2 Document Opportunities**

```markdown
## CHANCEN (OPPORTUNITIES) - Externe positive Faktoren

| Kategorie             | Chance                                       | Evidenz/BegrÃ¼ndung    | Zeitfenster | Quelle    |
| --------------------- | -------------------------------------------- | ---------------------- | ----------- | --------- |
| **Markttrend**        | [Trend, z.B. "Digitalisierung in Branche X"] | [Statistic, report]    | 2025-2027   | M04 / Web |
| **WettbewerbslÃ¼cke** | [Gap, z.B. "Kein Anbieter fÃ¼r Segment Y"]   | Recherche M04          | Jetzt       | M04       |
| **Technologie**       | [Tech, z.B. "AI-Tools senken Kosten"]        | [Tool names, savings]  | Ab 2025     | Extern    |
| **Timing**            | GrÃ¼ndungszuschuss 18 Mon.                   | 9.000â‚¬ + Eigenmittel | 2025-2026   | M06       |
| **Netzwerk**          | [X] Kontakte fÃ¼r Warm Outreach              | Bestehende Connections | Sofort      | M01       |
| **Regulatorisch**     | [Falls relevant, z.B. FÃ¶rderprogramm]       | [Details]              | [Timeframe] | Extern    |

**GESAMT: [X] Chancen identifiziert**

**Wahrscheinlichkeit:**
â€¢ Hoch: [List]
â€¢ Mittel: [List]
â€¢ Niedrig: [List]
```

**Checkpoint:**

```
ai: "Perfekt! [X] konkrete Chancen.

     Du siehst: Deine StÃ¤rken treffen auf echte Marktchancen.

     Das ist motivierend, oder?"

[SDT: Positive momentum before addressing weaknesses]

"Jetzt der ehrliche Teil: SchwÃ¤chen und Bedrohungen.
 Das ist nicht negativ - es zeigt Selbstbewusstsein.

 BA will sehen: 'GrÃ¼nder kennt LÃ¼cken UND hat Plan sie zu fÃ¼llen'.

 Bereit?"
```

---

### Section 3: SchwÃ¤chen (Weaknesses) - 12 min

**Objective:** Identify 3-5 internal gaps/challenges with mitigation plans.

**Approach:**

**3.1 Balanced Framing (AI + CBC)**

```
ai: "Jetzt zu den SchwÃ¤chen.

     Wichtig: Das sind keine permanenten Defizite,
     sondern ENTWICKLUNGSFELDER.

     BA will sehen:
     âœ“ Du kennst deine LÃ¼cken (Selbstbewusstsein)
     âœ“ Du hast Plan sie zu schlieÃŸen (HandlungsfÃ¤higkeit)

     Wo siehst du aktuell LÃ¼cken?"

[User lists weaknesses]

[COACHING DECISION TREE]

IF user lists 0-2 weaknesses (too few):
  â†’ "Lass uns ehrlich sein. Niemand ist perfekt.
       Wo kÃ¶nntest du noch besser werden?"
  â†’ Probe areas: Fachlich? Marketing? Verkauf? Finanzen?

IF user lists 7+ weaknesses (imposter syndrome):
  â†’ Trigger CBC Pattern 2: Imposter Syndrome Reframe
  â†’ Reduce list, reframe to development opportunities

IF user lists generic weaknesses ("zu perfektionistisch"):
  â†’ Trigger CBC Pattern 5: Generic Weakness Challenge
  â†’ Make specific, business-relevant

OPTIMAL: 3-5 specific, addressable weaknesses
```

**3.2 For Each Weakness: Mitigation Plan**

```
ai: "SchwÃ¤che: '[Weakness]'

     Drei Fragen:

     1. Impact: Wie sehr beh indert das dein Business?
        [Hoch / Mittel / Niedrig]

     2. Adressierbar: Kannst du das Ã¤ndern?
        [Ja, mit X / Teilweise / Nein (Constraint)]

     3. Plan: WIE schlieÃŸt du diese LÃ¼cke?
        [Konkrete Schritte]"

[Example interaction]

user: "SchwÃ¤che: Wenig Google Ads Erfahrung"

ai: "Impact?"
user: "Mittel - ist wichtiger Marketing-Kanal"

ai: "Adressierbar?"
user: "Ja, kann ich lernen"

ai: "Wie genau?"
user: "Online-Kurs + 200â‚¬ Test-Budget"

ai: "Wann?"
user: "Monate 2-3"

ai: "Perfekt! Das ist eine SchwÃ¤che mit klarem LÃ¶sungsplan.
     Das kommt in deine Meilensteine (Modul 8).

     BA sieht: 'LÃ¼cke erkannt, wird aktiv geschlossen'. âœ“"
```

**3.3 Document Weaknesses**

```markdown
## SCHWÃ„CHEN (WEAKNESSES) - Interne negative Faktoren / Entwicklungsfelder

| Kategorie      | SchwÃ¤che                       | Impact  | Mitigation Plan       | Timeline  | Adressierbar |
| -------------- | ------------------------------- | ------- | --------------------- | --------- | ------------ |
| **GrÃ¼nder**   | [Specific skill gap]            | Mittel  | [Learning plan]       | Mon. 1-3  | âœ“ Ja       |
| **Marketing**  | [Channel gap]                   | Hoch    | [Training + budget]   | Mon. 2-4  | âœ“ Ja       |
| **Finanzen**   | [If any, e.g., knappes Kapital] | Hoch    | [Reserve aufbauen]    | Mon. 1-12 | âš Teilweise |
| **Operations** | [If any, e.g., kein Team]       | Niedrig | [Freelancer-Netzwerk] | Ab Mon. 6 | âœ“ Ja       |

**GESAMT: [X] SchwÃ¤chen identifiziert**

**Davon:**
â€¢ Hoch-Impact: [X] â†’ Sofortige MaÃŸnahmen in M08
â€¢ Mittel-Impact: [X] â†’ Mittelfristig adressieren
â€¢ Niedrig-Impact: [X] â†’ Monitoring

**Alle adressierbar: [Ja/Teilweise]**
```

**Checkpoint:**

```
ai: "Sehr gut! [X] SchwÃ¤chen mit konkreten LÃ¶sungsplÃ¤nen.

     Das ist kein Defizit-Liste, sondern Entwicklungs-Roadmap.

     BA sieht: Realistisch, selbstbewusst, handlungsfÃ¤hig.

     FÃ¼hlst du dich damit wohl?"

[IF user still critical of self]
â†’ "Denk dran: Du hast [X] StÃ¤rken und nur [Y] SchwÃ¤chen.
   Das VerhÃ¤ltnis ist gut!"
```

---

### Section 4: Bedrohungen (Threats) - 10 min

**Objective:** Identify 3-5 external risks with contingency plans.

**Approach:**

**4.1 Threat Identification (Structured)**

```
ai: "Letzte Quadrant: BEDROHUNGEN.

     Das sind externe Risiken, die dein Business gefÃ¤hrden kÃ¶nnten.

     Kategorien:

     **Wettbewerb:**
     â€¢ Starke Konkurrenten
     â€¢ Neue Marktteilnehmer
     â€¢ Preiskampf

     **Wirtschaft:**
     â€¢ Rezession
     â€¢ Brancheneinbruch
     â€¢ Kaufkraftverlust

     **Technologie:**
     â€¢ Neue Technologien machen dein Angebot obsolet
     â€¢ Cyber-Risiken

     **Operationen:**
     â€¢ Lieferantenausfall
     â€¢ Krankheit/Ausfall
     â€¢ KundenzahlungsausfÃ¤lle

     **Regulatorisch:**
     â€¢ GesetzesÃ¤nderungen
     â€¢ Compliance-Risiken

     Welche dieser Bedrohungen siehst du?
     Oder gibt es andere?"

[User identifies threats]

[COACHING PATTERN: If user overwhelmed]
â†’ Trigger Pattern 4: Threat Normalization (AI + MI)

[For each threat: Assess probability + impact]

ai: "Bedrohung: '[Threat]'

     1. Wahrscheinlichkeit: Hoch / Mittel / Niedrig?
     2. Impact: Hoch / Mittel / Niedrig?
     3. Dein Plan B: Was machst du, wenn es eintritt?"

[Example]

user: "Bedrohung: GrÃ¶ÃŸerer Wettbewerber bietet gleiches billiger"

ai: "Wahrscheinlichkeit?"
user: "Mittel - kÃ¶nnte passieren"

ai: "Impact?"
user: "Hoch - wÃ¼rde Kunden verlieren"

ai: "Dein Plan B?"
user: "Auf Service und persÃ¶nliche Betreuung setzen -
       das kÃ¶nnen GroÃŸe nicht"

ai: "Gut! Das nutzt deine StÃ¤rke (persÃ¶nlicher Kontakt)
     gegen deren Bedrohung.

     Das ist eine ST-Strategie (Strength-Threat):
     'Nutze StÃ¤rke um Bedrohung zu kontern'. âœ“"
```

**4.2 Risk Matrix & Prioritization**

```markdown
## BEDROHUNGEN (THREATS) - Externe negative Faktoren

| Kategorie   | Bedrohung                | Wahrsch. | Impact | Risk Score | Contingency Plan | Quelle  |
| ----------- | ------------------------ | -------- | ------ | ---------- | ---------------- | ------- |
| Wettbewerb  | [Specific threat]        | Mittel   | Hoch   | 6          | [Specific plan]  | M04     |
| Wirtschaft  | [Threat]                 | Niedrig  | Hoch   | 3          | [Plan]           | Extern  |
| Technologie | [Threat]                 | Mittel   | Mittel | 4          | [Plan]           | Branche |
| Operational | GrÃ¼nder-Krankheit >4 Wo | Niedrig  | Hoch   | 3          | Krankentagegeld  | M03     |

**Risk Score:** Wahrscheinlichkeit (1-3) Ã— Impact (1-3) = 1-9

### Risiko-Matrix

**Hoch-PrioritÃ¤t (Score 6-9):** Sofort adressieren
| Bedrohung | Contingency | Verantwortlich |
|-----------|-------------|----------------|
| [Threat 1] | [Plan] | GrÃ¼nder |

**Monitoring (Score 1-5):** Beobachten
| Bedrohung | Monitoring-Frequenz | FrÃ¼hwarnsignale |
|-----------|---------------------|-----------------|
| [Threat 2] | Monatlich | [Signals, z.B. Wettbewerber-Preise] |

**GESAMT: [X] Bedrohungen identifiziert**
```

**Checkpoint:**

```
ai: "Sehr gut! [X] Bedrohungen mit PlÃ¤nen.

     Wichtig: Du bist nicht hilflos.
     FÃ¼r jede Bedrohung hast du einen Plan B.

     BA will genau das sehen: 'GrÃ¼nder ist sich Risiken bewusst
     UND hat Strategien'.

     FÃ¼hlst du dich vorbereitet?"

[IF user still anxious about threats]
â†’ MI: "Welche dieser Bedrohungen macht dir am meisten Sorgen?"
â†’ Deep-dive: Make concrete plan for that one
â†’ "Siehst du? Selbst das Schlimmste ist managebar."
```

---

### Section 5: Strategische Ableitungen & Aktionsplan - 10 min

**Objective:** Convert SWOT into actionable strategies (SO/ST/WO/WT).

**Approach:**

**5.1 Strategy Matrix**

```
ai: "Jetzt machen wir aus dem SWOT einen AKTIONSPLAN.

     Es gibt vier Strategie-Typen:

     **SO (Strengths-Opportunities):**
     'Nutze deine StÃ¤rken fÃ¼r die Chancen'
     â†’ Wachstumsstrategien

     **ST (Strengths-Threats):**
     'Nutze deine StÃ¤rken gegen die Bedrohungen'
     â†’ Defensivstrategien

     **WO (Weaknesses-Opportunities):**
     'Ãœberwinde deine SchwÃ¤chen um Chancen zu nutzen'
     â†’ Entwicklungsstrategien

     **WT (Weaknesses-Threats):**
     'Minimiere SchwÃ¤chen UND Bedrohungen'
     â†’ Schadensbegrenzung

     Lass uns jede Kategorie durchgehen..."

[For each quadrant: Match items and derive strategies]

**SO Example:**
ai: "Deine StÃ¤rke: [X Jahre Branchenerfahrung]
     Chance: [Wachstumsmarkt Segment Y]

     SO-Strategie: Wie nutzt du deine Erfahrung fÃ¼r dieses Segment?

     Konkrete Aktion?"

user: "Ich kÃ¶nnte mein Netzwerk nutzen fÃ¼r schnellen Markteintritt"

ai: "Perfekt! Timeline?"

user: "Monate 1-3"

ai: "Das wird ein Meilenstein in Modul 8. âœ“"

[Repeat for ST, WO, WT]
```

**5.2 Document Strategies**

```markdown
## STRATEGISCHE ABLEITUNGEN

### SO-Strategien (StÃ¤rken Ã— Chancen = Wachstum)

| StÃ¤rke | Ã—  | Chance | = Strategie | Konkrete Aktion   | Timeline |
| ------- | --- | ------ | ----------- | ----------------- | -------- |
| [S1]    | Ã—  | [O1]   | [Strategy]  | [Specific action] | Mon. 1-3 |
| [S2]    | Ã—  | [O2]   | [Strategy]  | [Specific action] | Mon. 4-6 |

### ST-Strategien (StÃ¤rken Ã— Bedrohungen = Defensive)

| StÃ¤rke | Ã—  | Bedrohung | = Strategie        | Konkrete Aktion | Timeline   |
| ------- | --- | --------- | ------------------ | --------------- | ---------- |
| [S1]    | Ã—  | [T1]      | [Defense strategy] | [Action]        | Sofort     |
| [S2]    | Ã—  | [T2]      | [Defense strategy] | [Action]        | Monitoring |

### WO-Strategien (SchwÃ¤chen Ã— Chancen = Entwicklung)

| SchwÃ¤che | Ã—  | Chance | = Strategie   | Konkrete Aktion     | Timeline |
| --------- | --- | ------ | ------------- | ------------------- | -------- |
| [W1]      | Ã—  | [O1]   | [Development] | [Learning/Training] | Mon. 2-4 |

### WT-Strategien (SchwÃ¤chen Ã— Bedrohungen = Schadensbegrenzung)

| SchwÃ¤che | Ã—  | Bedrohung | = Strategie      | PrioritÃ¤t | Konkrete Aktion      |
| --------- | --- | --------- | ---------------- | ---------- | -------------------- |
| [W1]      | Ã—  | [T1]      | [Damage control] | Urgent     | [Immediate step]     |
| [W2]      | Ã—  | [T2]      | [Damage control] | Monitor    | [Preventive measure] |

**Gesamt: [X] Strategien mit [Y] konkreten Aktionen**
```

**5.3 Action Priority Summary**

```markdown
## AKTIONSPLAN (FÃ¼r Modul 08: Meilensteine)

### Dringende Aktionen (Monate 1-3)

1. [Action from WT - high priority]
2. [Action from SO - growth opportunity]
3. [Action from WO - critical skill gap]

### Wichtige Aktionen (Monate 4-12)

1. [Action from SO]
2. [Action from ST]
3. [Action from WO]

### Monitoring-Aktionen (Ongoing)

1. [Threat monitoring with frequency]
2. [Market opportunity tracking]
3. [Competitor watch]
```

---

## Completion & Handoff

### Module Exit Checklist

```yaml
swot_complete:
  strengths:
    - count: 5-7
    - evidence_backed: true
    - categorized: true
    - sources_documented: true

  weaknesses:
    - count: 3-5
    - mitigation_plans: true
    - addressable: true
    - not_generic: true

  opportunities:
    - count: 3-5
    - evidence_backed: true
    - time_windows_defined: true

  threats:
    - count: 3-5
    - probability_assessed: true
    - contingency_plans: true
    - prioritized: true

  strategies:
    - SO_strategies: '>=2'
    - ST_strategies: '>=1'
    - WO_strategies: '>=2'
    - WT_strategies: '>=1'
    - all_actionable: true

  balance:
    - status: 'balanced'
    - user_mindset: 'realistic'
    - ba_ready: true

  action_summary:
    - urgent_actions_defined: true
    - timelines_set: true
    - ready_for_milestones: true

ready_for_next_module: true
next_module: '08-meilensteine'
```

### Handoff Message

```typescript
function generateHandoffMessage(
  balance: 'balanced' | 'too_optimistic' | 'too_pessimistic',
  strengthCount: number,
  weaknessCount: number,
  strategyCount: number
): string {
  if (balance === 'balanced') {
    return `
âœ… SWOT-ANALYSE ABGESCHLOSSEN - EXZELLENT!

**DEINE SWOT:**
StÃ¤rken: ${strengthCount}
SchwÃ¤chen: ${weaknessCount}
Chancen: ${opportunityCount}
Bedrohungen: ${threatCount}

**STATUS: BALANCED âœ“**

Das ist genau die SelbsteinschÃ¤tzung, die BA sehen will:
â€¢ Selbstbewusst (StÃ¤rken erkannt)
â€¢ Selbstkritisch (SchwÃ¤chen benannt)
â€¢ Opportunistisch (Chancen identifiziert)
â€¢ Realistisch (Risiken acknowledged)

Du hast ${strategyCount} konkrete Strategien entwickelt:
â€¢ SO: Wachstum durch StÃ¤rken Ã— Chancen
â€¢ ST: Defense durch StÃ¤rken gegen Bedrohungen
â€¢ WO: Entwicklung durch Chancen nutzen
â€¢ WT: Schadensbegrenzung

Diese Strategien werden im nÃ¤chsten Schritt zu Meilensteinen.

Bereit fÃ¼r Modul 08: Meilensteine?`;
  } else if (balance === 'too_optimistic') {
    return `
âš ï¸ SWOT ABGESCHLOSSEN - ANPASSUNG EMPFOHLEN

**DEINE SWOT:**
StÃ¤rken: ${strengthCount}
SchwÃ¤chen: ${weaknessCount} â† Zu wenig!
Chancen: ${opportunityCount}
Bedrohungen: ${threatCount} â† Zu wenig!

**STATUS: ZU OPTIMISTISCH âš ï¸**

BA-Perspektive: "GrÃ¼nder sieht Risiken nicht"

Empfehlung: Lass uns nochmal ehrlich hinschauen:
â€¢ Wo kÃ¶nntest du noch besser werden? (SchwÃ¤chen)
â€¢ Was kÃ¶nnte schiefgehen? (Bedrohungen)

"Keine SchwÃ¤chen" = unrealistisch, nicht selbstbewusst
"Keine Bedrohungen" = naiv, nicht vorbereitet

MÃ¶chtest du nochmal die SchwÃ¤chen/Bedrohungen erweitern?`;
  } else {
    // too_pessimistic
    return `
âš ï¸ SWOT ABGESCHLOSSEN - PERSPEKTIVE ANPASSEN

**DEINE SWOT:**
StÃ¤rken: ${strengthCount} â† Zu wenig!
SchwÃ¤chen: ${weaknessCount}
Chancen: ${opportunityCount} â† Zu wenig!
Bedrohungen: ${threatCount}

**STATUS: ZU KRITISCH âš ï¸**

Du bist hart zu dir selbst!

BA-Perspektive: "GrÃ¼nder hat kein Selbstvertrauen"

Denk dran:
â€¢ Du HAST StÃ¤rken (sonst wÃ¤rst du nicht hier)
â€¢ Du SIEHST Chancen (sonst wÃ¼rdest du nicht grÃ¼nden)

Lass uns nochmal deine Erfolge anschauen:
[List past achievements from Intake]

Diese FÃ¤higkeiten sind real. Lass sie nicht unter den Tisch fallen!

MÃ¶chtest du die StÃ¤rken/Chancen nochmal Ã¼berarbeiten?`;
  }
}
```

### Data Package for Downstream Modules

```typescript
// Output for Modules 08-10
const swotOutput: SWOTOutput = {
  // Full structured data as per Output Schema

  // For Module 08 (Meilensteine)
  forMeilensteine: {
    skillDevelopmentNeeds: weaknesses
      .filter((w) => w.addressable)
      .map((w) => ({
        skill: w.weakness,
        mitigationPlan: w.mitigationPlan,
        timeline: w.timeline,
        priority: w.impact === 'high' ? 'urgent' : 'important',
      })),

    riskMitigationActions: threats
      .filter((t) => t.riskScore >= 6)
      .map((t) => ({
        threat: t.threat,
        contingency: t.contingencyPlan,
        timeline: 'Monate 1-3',
        priority: 'urgent',
      })),

    growthInitiatives: strategies.SO.map((s) => ({
      initiative: s.strategy,
      action: s.action,
      timeline: s.timeline,
      category: 'growth',
    })),
  },

  // For Module 09 (KPI)
  forKPI: {
    strengthsToLeverage: strengths
      .filter((s) => s.relevance === 'critical')
      .map((s) => ({
        strength: s.strength,
        suggestedKPI: `Track usage/impact of ${s.strength}`,
      })),

    weaknessesToMonitor: weaknesses
      .filter((w) => w.impact === 'high')
      .map((w) => ({
        weakness: w.weakness,
        suggestedKPI: `Track progress on ${w.mitigationPlan}`,
        target: 'Monthly improvement',
      })),

    threatsToWatch: riskMatrix.highPriorityRisks.map((r) => ({
      threat: r.threat,
      suggestedKPI: `Monitor ${r.threat} indicators`,
      frequency: 'Weekly/Monthly',
    })),
  },

  // For Module 10 (Zusammenfassung)
  forZusammenfassung: {
    keyStrengths: strengths.slice(0, 3).map((s) => s.strength),
    primaryOpportunity: opportunities[0]?.opportunity || '',
    criticalRisks: riskMatrix.highPriorityRisks.map((r) => r.threat),
    overallAssessment:
      balance.balanceStatus === 'balanced'
        ? 'Realistic, balanced self-assessment'
        : 'Needs perspective adjustment',
  },
};
```

---

## Success Metrics

**This module succeeds when:**

1. âœ… Balanced SWOT (not all strengths or all weaknesses)
2. âœ… All items specific, not generic
3. âœ… Evidence backing for strengths and opportunities
4. âœ… Mitigation plans for all weaknesses
5. âœ… Contingency plans for high-priority threats
6. âœ… Strategic derivations actionable (SO/ST/WO/WT)
7. âœ… User maintains confidence (AI + CBC success)
8. âœ… BA-ready: Self-aware, realistic, prepared

**This module fails when:**

1. âŒ Unbalanced (only positives or only negatives)
2. âŒ Generic items ("hard working", "flexible")
3. âŒ No evidence for claims
4. âŒ Weaknesses without mitigation
5. âŒ Threats without contingency
6. âŒ Lists without strategies
7. âŒ User demotivated after session
8. âŒ BA would see overconfidence or imposter syndrome

---

_Duration: 45 minutes of balanced, honest self-assessment_  
_Coaching Load: AI (primary) for positive framing, CBC for reframing, MI for support_  
_Integration: ALL modules (01-06) synthesized into strategic framework_  
_Outcome: Actionable SWOT with strategies for Meilensteine (M08) and risk awareness for KPIs (M09)_  
_BA Impact: Demonstrates self-awareness, realism, and strategic thinking_
