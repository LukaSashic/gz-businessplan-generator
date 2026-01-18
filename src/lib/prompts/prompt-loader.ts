/**
 * System Prompt Loader
 *
 * Loads actual module skill files from disk and builds layered prompts
 * following the coaching methodology stack.
 *
 * Supports phase-locked intake prompt system for focused, mandatory question enforcement.
 */

import { promises as fs } from 'fs';
import path from 'path';
import type { IntakePhase, PartialIntakeOutput } from '@/types/modules/intake';
import type { GeschaeftsmodellPhase, PartialGeschaeftsmodellOutput } from '@/types/modules/geschaeftsmodell';

/**
 * Module names for GZ Businessplan Generator
 */
export const GZ_MODULES = [
  'gz-intake',
  'gz-geschaeftsmodell',
  'gz-unternehmen',
  'gz-markt-wettbewerb',
  'gz-marketing',
  'gz-finanzplanung',
  'gz-swot',
  'gz-meilensteine',
  'gz-kpi',
  'gz-zusammenfassung',
] as const;

export type GZModule = (typeof GZ_MODULES)[number];

/**
 * Map legacy module names to GZ module names
 * Handles cases where workshops were created with short names like 'intake' instead of 'gz-intake'
 */
const LEGACY_MODULE_MAP: Record<string, GZModule> = {
  'intake': 'gz-intake',
  'geschaeftsmodell': 'gz-geschaeftsmodell',
  'unternehmen': 'gz-unternehmen',
  'markt-wettbewerb': 'gz-markt-wettbewerb',
  'marketing': 'gz-marketing',
  'finanzplanung': 'gz-finanzplanung',
  'swot': 'gz-swot',
  'meilensteine': 'gz-meilensteine',
  'kpi': 'gz-kpi',
  'zusammenfassung': 'gz-zusammenfassung',
};

/**
 * Normalize a module name to GZModule format
 */
export function normalizeModuleName(moduleName: string): GZModule | null {
  // Already a valid GZ module name
  if (GZ_MODULES.includes(moduleName as GZModule)) {
    return moduleName as GZModule;
  }
  // Check legacy mapping
  if (LEGACY_MODULE_MAP[moduleName]) {
    return LEGACY_MODULE_MAP[moduleName];
  }
  return null;
}

/**
 * Coaching methodology fragments
 */
export const COACHING_FRAGMENTS = [
  'gz-system-coaching-core',
  'gz-coaching-mi',
  'gz-coaching-cbc',
  'gz-coaching-ai',
  'gz-coaching-sdt',
  'gz-coaching-stage',
] as const;

export type CoachingFragment = (typeof COACHING_FRAGMENTS)[number];

/**
 * Business types that determine module relevance
 */
export type BusinessType =
  | 'DIGITAL_SERVICE'
  | 'LOCAL_SERVICE'
  | 'HYBRID_SERVICE'
  | 'PRODUCT_DIGITAL'
  | 'PRODUCT_PHYSICAL'
  | 'FRANCHISE';

/**
 * Map UI module names to actual file names
 */
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

/**
 * Map coaching fragment names to file names
 */
const COACHING_FILE_MAP: Record<CoachingFragment, string> = {
  'gz-system-coaching-core': 'gz-system-coaching-core.md',
  'gz-coaching-mi': 'gz-coaching-mi.md',
  'gz-coaching-cbc': 'gz-coaching-cbc.md',
  'gz-coaching-ai': 'gz-coaching-ai.md',
  'gz-coaching-sdt': 'gz-coaching-sdt.md',
  'gz-coaching-stage': 'gz-coaching-stage.md',
};

/**
 * Define which coaching modules to load for each module
 * Based on MODULAR_COACHING_MODULE_MAPPING.md
 */
const MODULE_COACHING_STACK: Record<GZModule, CoachingFragment[]> = {
  'gz-intake': ['gz-system-coaching-core', 'gz-coaching-stage', 'gz-coaching-ai', 'gz-coaching-mi'],
  'gz-geschaeftsmodell': ['gz-system-coaching-core', 'gz-coaching-ai', 'gz-coaching-cbc'],
  'gz-unternehmen': ['gz-system-coaching-core', 'gz-coaching-mi'],
  'gz-markt-wettbewerb': ['gz-system-coaching-core', 'gz-coaching-cbc'],
  'gz-marketing': ['gz-system-coaching-core', 'gz-coaching-ai', 'gz-coaching-sdt'],
  'gz-finanzplanung': ['gz-system-coaching-core', 'gz-coaching-cbc', 'gz-coaching-mi'],
  'gz-swot': ['gz-system-coaching-core', 'gz-coaching-cbc', 'gz-coaching-ai'],
  'gz-meilensteine': ['gz-system-coaching-core', 'gz-coaching-sdt'],
  'gz-kpi': ['gz-system-coaching-core', 'gz-coaching-cbc'],
  'gz-zusammenfassung': ['gz-system-coaching-core', 'gz-coaching-ai'],
};

/**
 * Phase-specific prompt files for intake module
 * Each phase gets a focused ~200-350 line prompt instead of 1100+ lines
 */
const INTAKE_PHASE_FILES: Record<IntakePhase, string> = {
  warmup: '01-warmup.md',
  founder_profile: '02-founder-profile.md',
  personality: '03-personality.md',
  profile_gen: '04-profile-gen.md',
  resources: '05-resources.md',
  business_type: '06-business-type.md',
  validation: '07-validation.md',
  completed: '07-validation.md', // Use validation for completed state
};

/**
 * Reduced coaching stack for phase-specific prompts
 * Only load 1-2 most relevant coaching fragments per phase
 *
 * RATIONALE:
 * - warmup: AI for strengths discovery, stage for readiness detection (CRITICAL: stage must be early!)
 * - founder_profile: MI for handling sensitive ALG/employment questions
 * - personality: MI for probing deeper on scenarios (stage already detected in warmup)
 * - profile_gen: Core only (synthesis phase)
 * - resources: MI for handling financial sensitivity
 * - business_type: Core only (classification phase)
 * - validation: Core only (summary phase)
 */
const INTAKE_PHASE_COACHING: Record<IntakePhase, CoachingFragment[]> = {
  warmup: ['gz-system-coaching-core', 'gz-coaching-ai', 'gz-coaching-stage'], // Stage detection happens EARLY
  founder_profile: ['gz-system-coaching-core', 'gz-coaching-mi'],
  personality: ['gz-system-coaching-core', 'gz-coaching-mi'], // MI instead of stage (stage already detected)
  profile_gen: ['gz-system-coaching-core'],
  resources: ['gz-system-coaching-core', 'gz-coaching-mi'],
  business_type: ['gz-system-coaching-core'],
  validation: ['gz-system-coaching-core'],
  completed: ['gz-system-coaching-core'],
};

/**
 * Phase-specific prompt files for geschaeftsmodell module
 * Each phase gets a focused prompt to prevent scope creep
 */
const GESCHAEFTSMODELL_PHASE_FILES: Record<GeschaeftsmodellPhase, string> = {
  angebot: '01-angebot.md',
  zielgruppe: '02-zielgruppe.md',
  wertversprechen: '03-wertversprechen.md',
  usp: '04-usp.md',
  completed: '04-usp.md', // Use USP for completed state (module summary)
};

/**
 * Reduced coaching stack for geschaeftsmodell phase-specific prompts
 *
 * RATIONALE:
 * - angebot: CBC for challenging vague offering descriptions, AI for discovery
 * - zielgruppe: CBC for challenging "alle" as target, MI for limiting beliefs
 * - wertversprechen: CBC for enforcing customer perspective (not provider)
 * - usp: CBC for challenging non-unique USP claims
 */
const GESCHAEFTSMODELL_PHASE_COACHING: Record<GeschaeftsmodellPhase, CoachingFragment[]> = {
  angebot: ['gz-system-coaching-core', 'gz-coaching-cbc', 'gz-coaching-ai'],
  zielgruppe: ['gz-system-coaching-core', 'gz-coaching-cbc', 'gz-coaching-mi'],
  wertversprechen: ['gz-system-coaching-core', 'gz-coaching-cbc'],
  usp: ['gz-system-coaching-core', 'gz-coaching-cbc'],
  completed: ['gz-system-coaching-core'],
};

/**
 * Get the modules directory path
 */
function getModulesDir(): string {
  // In Next.js, process.cwd() is the project root
  return path.join(process.cwd(), 'src', 'lib', 'prompts', 'modules');
}

/**
 * Cache for loaded prompts (in-memory)
 */
const promptCache = new Map<string, { content: string; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Load a file from the modules directory
 */
async function loadModuleFile(fileName: string): Promise<string> {
  const filePath = path.join(getModulesDir(), fileName);

  try {
    const content = await fs.readFile(filePath, 'utf-8');
    return content;
  } catch (error) {
    console.warn(`Failed to load module file: ${fileName}`, error);
    throw new Error(`Module file not found: ${fileName}`);
  }
}

/**
 * Load orchestrator skill from extracted directory
 */
async function loadOrchestratorSkill(): Promise<string> {
  const filePath = path.join(
    getModulesDir(),
    'gz-orchestrator-extracted',
    'gz-orchestrator',
    'SKILL.md'
  );

  try {
    return await fs.readFile(filePath, 'utf-8');
  } catch (error) {
    console.warn('Orchestrator skill not found, using fallback');
    return getOrchestratorFallback();
  }
}

/**
 * Load a module skill file with caching
 */
async function loadModuleSkillCached(moduleName: GZModule): Promise<string> {
  const cacheKey = `module:${moduleName}`;
  const cached = promptCache.get(cacheKey);
  const now = Date.now();

  if (cached && now - cached.timestamp < CACHE_TTL) {
    return cached.content;
  }

  const fileName = MODULE_FILE_MAP[moduleName];
  const content = await loadModuleFile(fileName);
  promptCache.set(cacheKey, { content, timestamp: now });

  return content;
}

/**
 * Load a coaching fragment with caching
 */
async function loadCoachingFragmentCached(fragment: CoachingFragment): Promise<string> {
  const cacheKey = `coaching:${fragment}`;
  const cached = promptCache.get(cacheKey);
  const now = Date.now();

  if (cached && now - cached.timestamp < CACHE_TTL) {
    return cached.content;
  }

  const fileName = COACHING_FILE_MAP[fragment];
  const content = await loadModuleFile(fileName);
  promptCache.set(cacheKey, { content, timestamp: now });

  return content;
}

/**
 * Get the intake phases directory path
 */
function getIntakePhasesDir(): string {
  return path.join(getModulesDir(), 'intake-phases');
}

/**
 * Load an intake phase prompt file with caching
 */
async function loadIntakePhaseFileCached(phase: IntakePhase): Promise<string> {
  const cacheKey = `intake-phase:${phase}`;
  const cached = promptCache.get(cacheKey);
  const now = Date.now();

  if (cached && now - cached.timestamp < CACHE_TTL) {
    return cached.content;
  }

  const fileName = INTAKE_PHASE_FILES[phase];
  const filePath = path.join(getIntakePhasesDir(), fileName);

  try {
    const content = await fs.readFile(filePath, 'utf-8');
    promptCache.set(cacheKey, { content, timestamp: now });
    return content;
  } catch (error) {
    console.warn(`Failed to load intake phase file: ${fileName}`, error);
    throw new Error(`Intake phase file not found: ${fileName}`);
  }
}

/**
 * Load the common intake rules
 */
async function loadIntakeCommonRules(): Promise<string> {
  const cacheKey = 'intake-phase:_common';
  const cached = promptCache.get(cacheKey);
  const now = Date.now();

  if (cached && now - cached.timestamp < CACHE_TTL) {
    return cached.content;
  }

  const filePath = path.join(getIntakePhasesDir(), '_common.md');

  try {
    const content = await fs.readFile(filePath, 'utf-8');
    promptCache.set(cacheKey, { content, timestamp: now });
    return content;
  } catch (error) {
    console.warn('Failed to load intake common rules', error);
    return ''; // Non-critical, continue without common rules
  }
}

/**
 * Get the geschaeftsmodell phases directory path
 */
function getGeschaeftsmodellPhasesDir(): string {
  return path.join(getModulesDir(), 'geschaeftsmodell-phases');
}

/**
 * Load a geschaeftsmodell phase prompt file with caching
 */
async function loadGeschaeftsmodellPhaseFileCached(phase: GeschaeftsmodellPhase): Promise<string> {
  const cacheKey = `geschaeftsmodell-phase:${phase}`;
  const cached = promptCache.get(cacheKey);
  const now = Date.now();

  if (cached && now - cached.timestamp < CACHE_TTL) {
    return cached.content;
  }

  const fileName = GESCHAEFTSMODELL_PHASE_FILES[phase];
  const filePath = path.join(getGeschaeftsmodellPhasesDir(), fileName);

  try {
    const content = await fs.readFile(filePath, 'utf-8');
    promptCache.set(cacheKey, { content, timestamp: now });
    return content;
  } catch (error) {
    console.warn(`Failed to load geschaeftsmodell phase file: ${fileName}`, error);
    throw new Error(`Geschaeftsmodell phase file not found: ${fileName}`);
  }
}

/**
 * Load the common geschaeftsmodell rules
 */
async function loadGeschaeftsmodellCommonRules(): Promise<string> {
  const cacheKey = 'geschaeftsmodell-phase:_common';
  const cached = promptCache.get(cacheKey);
  const now = Date.now();

  if (cached && now - cached.timestamp < CACHE_TTL) {
    return cached.content;
  }

  const filePath = path.join(getGeschaeftsmodellPhasesDir(), '_common.md');

  try {
    const content = await fs.readFile(filePath, 'utf-8');
    promptCache.set(cacheKey, { content, timestamp: now });
    return content;
  } catch (error) {
    console.warn('Failed to load geschaeftsmodell common rules', error);
    return ''; // Non-critical, continue without common rules
  }
}

/**
 * Format previous phase data for context injection
 */
function formatPreviousPhaseData(data: Partial<PartialIntakeOutput> | undefined): string {
  if (!data) return '';

  const sections: string[] = [];

  if (data.businessIdea) {
    sections.push(`## Bereits erfasste Geschäftsidee
- Elevator Pitch: ${data.businessIdea.elevator_pitch || 'Noch nicht erfasst'}
- Problem: ${data.businessIdea.problem || 'Noch nicht erfasst'}
- Lösung: ${data.businessIdea.solution || 'Noch nicht erfasst'}
- Zielgruppe: ${data.businessIdea.targetAudience || 'Noch nicht erfasst'}`);
  }

  if (data.founder) {
    sections.push(`## Bereits erfasstes Gründerprofil
- Status: ${data.founder.currentStatus || 'Noch nicht erfasst'}
- ALG Tage: ${data.founder.algStatus?.daysRemaining ?? 'Noch nicht erfasst'}
- ALG Betrag: ${data.founder.algStatus?.monthlyAmount ? `${data.founder.algStatus.monthlyAmount}€` : 'Noch nicht erfasst'}
- Branchenerfahrung: ${data.founder.experience?.yearsInIndustry ?? 'Noch nicht erfasst'} Jahre
- Ausbildung: ${data.founder.qualifications?.education || 'Noch nicht erfasst'}`);
  }

  if (data.personality) {
    const dims = [];
    if (data.personality.innovativeness) dims.push(`Innovationsfreude: ${data.personality.innovativeness}`);
    if (data.personality.riskTaking) dims.push(`Risikobereitschaft: ${data.personality.riskTaking}`);
    if (data.personality.achievement) dims.push(`Leistungsmotivation: ${data.personality.achievement}`);
    if (data.personality.proactiveness) dims.push(`Proaktivität: ${data.personality.proactiveness}`);
    if (data.personality.locusOfControl) dims.push(`Kontrollüberzeugung: ${data.personality.locusOfControl}`);
    if (data.personality.selfEfficacy) dims.push(`Selbstwirksamkeit: ${data.personality.selfEfficacy}`);
    if (data.personality.autonomy) dims.push(`Autonomie: ${data.personality.autonomy}`);

    if (dims.length > 0) {
      sections.push(`## Bereits erfasstes Persönlichkeitsprofil
${dims.join('\n')}`);
    }
  }

  if (data.resources) {
    const resources = [];
    if (data.resources.financial?.availableCapital !== undefined) {
      resources.push(`- Eigenkapital: ${data.resources.financial.availableCapital}€`);
    }
    if (data.resources.time?.hoursPerWeek !== undefined) {
      resources.push(`- Zeit: ${data.resources.time.hoursPerWeek}h/Woche`);
    }
    if (data.resources.network?.industryContacts !== undefined) {
      resources.push(`- Branchenkontakte: ${data.resources.network.industryContacts}/10`);
    }

    if (resources.length > 0) {
      sections.push(`## Bereits erfasste Ressourcen
${resources.join('\n')}`);
    }
  }

  if (data.businessType?.category) {
    sections.push(`## Bereits erfasster Geschäftstyp
- Kategorie: ${data.businessType.category}
- Digital First: ${data.businessType.isDigitalFirst ? 'Ja' : 'Nein'}
- Standortabhängig: ${data.businessType.isLocationDependent ? 'Ja' : 'Nein'}`);
  }

  if (sections.length === 0) return '';

  return `
---

# KONTEXT: Bisher gesammelte Informationen

${sections.join('\n\n')}

---

`;
}

/**
 * Build a phase-specific system prompt for the intake module
 *
 * This is the core of the phase-locked system:
 * - Instead of 1100+ lines, loads ~200-350 lines per phase
 * - Forces Claude to focus on current phase objectives
 * - Prevents skipping mandatory questions
 *
 * Layers:
 * 1. Minimal orchestrator context (~100 lines)
 * 2. Phase-specific coaching (1-2 fragments)
 * 3. Common intake rules
 * 4. Previous phase data (context carryover)
 * 5. Phase-specific prompt
 */
export async function buildIntakePhasePrompt(
  phase: IntakePhase,
  options: {
    includeCoaching?: boolean;
    previousPhaseData?: Partial<PartialIntakeOutput>;
  } = {}
): Promise<string> {
  const { includeCoaching = true, previousPhaseData } = options;

  const parts: string[] = [];

  // Layer 1: Minimal orchestrator context
  parts.push(getMinimalOrchestratorContext());

  // Layer 2: Phase-specific coaching (reduced stack)
  if (includeCoaching) {
    const coachingStack = INTAKE_PHASE_COACHING[phase];
    for (const fragment of coachingStack) {
      try {
        const coachingContent = await loadCoachingFragmentCached(fragment);
        parts.push(coachingContent);
      } catch (error) {
        console.warn(`Failed to load coaching fragment for intake phase: ${fragment}`);
      }
    }
  }

  // Layer 3: Common intake rules
  try {
    const commonRules = await loadIntakeCommonRules();
    if (commonRules) {
      parts.push(commonRules);
    }
  } catch {
    // Non-critical, continue
  }

  // Layer 4: Previous phase data injection
  const contextData = formatPreviousPhaseData(previousPhaseData);
  if (contextData) {
    parts.push(contextData);
  }

  // Layer 5: Phase-specific prompt
  try {
    const phasePrompt = await loadIntakePhaseFileCached(phase);
    parts.push(phasePrompt);
  } catch (error) {
    console.error(`Failed to load intake phase prompt: ${phase}`, error);
    // Fall back to generic intake module
    const genericIntake = await loadModuleSkillCached('gz-intake');
    parts.push(genericIntake);
  }

  // Layer 6: JSON output instructions
  parts.push(getPhaseJSONInstructions(phase));

  return parts.join('\n\n---\n\n');
}

/**
 * Minimal orchestrator context for phase prompts
 * Much smaller than full orchestrator (~100 lines vs ~400)
 */
function getMinimalOrchestratorContext(): string {
  return `# Gründungszuschuss Business Plan - Intake Modul

Du führst ein strukturiertes Intake-Gespräch für den Gründungszuschuss-Workshop.

## Kernregeln

1. **Fokus auf aktuelle Phase**: Bearbeite NUR die Fragen der aktuellen Phase
2. **Keine Abkürzungen**: Alle Pflichtfragen müssen beantwortet werden
3. **Schrittweise vorgehen**: Max 2-3 Fragen pro Nachricht
4. **Auf Deutsch**: Alle Kommunikation auf Deutsch
5. **JSON-Ausgabe**: Jede Antwort endet mit einem JSON-Block

## Coaching-Stil

- Warm aber professionell
- Fragen anerkennen bevor nächste gestellt wird
- Konkret und hilfreich
- Ermutigend ohne zu übertreiben`;
}

/**
 * Phase-specific JSON output instructions
 */
function getPhaseJSONInstructions(phase: IntakePhase): string {
  return `
---

## KRITISCH: JSON-Ausgabe für Phase: ${phase}

Nach JEDER Antwort, gib einen JSON-Block aus.

**WICHTIG:** Der Wert für "currentPhase" MUSS EXAKT "${phase}" sein!

RICHTIG:
<json>
{
  "metadata": {
    "currentPhase": "${phase}",
    "phaseComplete": false
  }
}
</json>

FALSCH (diese Werte NIEMALS verwenden):
- "currentPhase": "background" ❌
- "currentPhase": "market_analysis" ❌
- "currentPhase": "summary" ❌
- "currentPhase": "intro" ❌

**Regeln:**
1. KOPIERE "currentPhase": "${phase}" GENAU SO - nicht ändern!
2. Setze "phaseComplete": true erst wenn ALLE Pflichtfelder der Phase erfasst sind
3. Übernimm alle bereits bekannten Daten in das JSON
4. Das JSON MUSS in <json>...</json> Tags stehen`;
}

/**
 * Format previous geschaeftsmodell phase data for context injection
 */
function formatPreviousGeschaeftsmodellPhaseData(
  data: Partial<PartialGeschaeftsmodellOutput> | undefined,
  intakeData?: { elevatorPitch?: string; problem?: string; solution?: string; targetAudience?: string }
): string {
  const sections: string[] = [];

  // Include relevant intake data for context
  if (intakeData) {
    sections.push(`## Kontext aus Intake (Modul 01)
- Geschäftsidee: ${intakeData.elevatorPitch || 'Noch nicht erfasst'}
- Problem: ${intakeData.problem || 'Noch nicht erfasst'}
- Lösung: ${intakeData.solution || 'Noch nicht erfasst'}
- Initiale Zielgruppe: ${intakeData.targetAudience || 'Noch nicht erfasst'}`);
  }

  if (!data) {
    if (sections.length === 0) return '';
    return `
---

# KONTEXT: Bisher gesammelte Informationen

${sections.join('\n\n')}

---

`;
  }

  if (data.offering) {
    const offering = [];
    if (data.offering.mainOffering) offering.push(`- Hauptangebot: ${data.offering.mainOffering}`);
    if (data.offering.deliveryFormat) offering.push(`- Lieferformat: ${data.offering.deliveryFormat}`);
    if (data.offering.pricingModel) offering.push(`- Preismodell: ${data.offering.pricingModel}`);
    if (data.offering.oneSentencePitch) offering.push(`- Elevator Pitch: ${data.offering.oneSentencePitch}`);
    if (data.offering.scope?.included?.length) {
      offering.push(`- Inklusive: ${data.offering.scope.included.join(', ')}`);
    }
    if (data.offering.scope?.excluded?.length) {
      offering.push(`- Exklusive: ${data.offering.scope.excluded.join(', ')}`);
    }

    if (offering.length > 0) {
      sections.push(`## Bereits erfasstes Angebot (Phase 1)
${offering.join('\n')}`);
    }
  }

  if (data.targetAudience?.primaryPersona) {
    const persona = data.targetAudience.primaryPersona;
    const target = [];
    if (persona.name) target.push(`- Name: ${persona.name}`);
    if (persona.demographics?.occupation) target.push(`- Beruf: ${persona.demographics.occupation}`);
    if (persona.demographics?.location) target.push(`- Standort: ${persona.demographics.location}`);
    if (persona.buyingTrigger) target.push(`- Kaufauslöser: ${persona.buyingTrigger}`);
    if (persona.psychographics?.challenges?.length) {
      target.push(`- Herausforderungen: ${persona.psychographics.challenges.join(', ')}`);
    }

    if (data.targetAudience.marketSize?.serviceableMarket) {
      target.push(`- Marktgröße (SAM): ${data.targetAudience.marketSize.serviceableMarket}`);
    }
    if (data.targetAudience.marketSize?.targetFirstYear) {
      target.push(`- Zielkunden Jahr 1: ${data.targetAudience.marketSize.targetFirstYear}`);
    }

    if (target.length > 0) {
      sections.push(`## Bereits erfasste Zielgruppe (Phase 2)
${target.join('\n')}`);
    }
  }

  if (data.valueProposition) {
    const value = [];
    if (data.valueProposition.customerJobs?.length) {
      value.push(`- Kundenaufgaben: ${data.valueProposition.customerJobs.join(', ')}`);
    }
    if (data.valueProposition.customerPains?.length) {
      value.push(`- Kundenprobleme: ${data.valueProposition.customerPains.join(', ')}`);
    }
    if (data.valueProposition.painRelievers?.length) {
      value.push(`- Problemlöser: ${data.valueProposition.painRelievers.join(', ')}`);
    }
    if (data.valueProposition.valueStatement) {
      value.push(`- Wertversprechen: ${data.valueProposition.valueStatement}`);
    }

    if (value.length > 0) {
      sections.push(`## Bereits erfasstes Wertversprechen (Phase 3)
${value.join('\n')}`);
    }
  }

  if (data.competitiveAnalysis?.directCompetitors?.length) {
    const competitors = data.competitiveAnalysis.directCompetitors
      .map((c, i) => `${i + 1}. ${c.name || 'Unbenannt'}: ${c.offering || 'Kein Angebot'} (Stärke: ${c.strength || '-'}, Schwäche: ${c.weakness || '-'})`)
      .join('\n');
    sections.push(`## Bereits erfasste Wettbewerber (Phase 4)
${competitors}`);
  }

  if (data.usp?.statement) {
    sections.push(`## Bereits erfasster USP (Phase 4)
- Statement: ${data.usp.statement}
- Kategorie: ${data.usp.category || 'Nicht festgelegt'}
- Beweis: ${data.usp.proof || 'Nicht festgelegt'}`);
  }

  if (sections.length === 0) return '';

  return `
---

# KONTEXT: Bisher gesammelte Informationen

${sections.join('\n\n')}

---

`;
}

/**
 * Minimal orchestrator context for geschaeftsmodell phase prompts
 */
function getMinimalGeschaeftsmodellOrchestratorContext(): string {
  return `# Gründungszuschuss Business Plan - Geschäftsmodell Modul

Du führst ein strukturiertes Geschäftsmodell-Gespräch für den Gründungszuschuss-Workshop.

## Kernregeln

1. **Fokus auf aktuelle Phase**: Bearbeite NUR die Fragen der aktuellen Phase
2. **Keine Abkürzungen**: Alle Pflichtfragen müssen beantwortet werden
3. **Schrittweise vorgehen**: Max 2-3 Fragen pro Nachricht
4. **Auf Deutsch**: Alle Kommunikation auf Deutsch
5. **JSON-Ausgabe**: Jede Antwort endet mit einem JSON-Block
6. **CBC anwenden**: Bei vagen Antworten IMMER nachfragen und konkretisieren

## Coaching-Stil

- Warm aber professionell und HERAUSFORDERND
- Vage Antworten nicht akzeptieren - immer konkretisieren lassen
- "Guter Service" → "Was genau meinst du mit 'gut'?"
- "Alle" → "Wenn nur 10 kaufen könnten, welche 10?"
- Konkret und hilfreich
- Ermutigend ohne zu übertreiben`;
}

/**
 * Phase-specific JSON output instructions for geschaeftsmodell
 */
function getGeschaeftsmodellPhaseJSONInstructions(phase: GeschaeftsmodellPhase): string {
  return `
---

## KRITISCH: JSON-Ausgabe für Phase: ${phase}

Nach JEDER Antwort, gib einen JSON-Block aus.

**WICHTIG:** Der Wert für "currentPhase" MUSS EXAKT "${phase}" sein!

Gültige Werte sind NUR: "angebot", "zielgruppe", "wertversprechen", "usp", "completed"

RICHTIG:
<json>
{
  "metadata": {
    "currentPhase": "${phase}",
    "phaseComplete": false
  }
}
</json>

FALSCH (diese Werte NIEMALS verwenden):
- "currentPhase": "offering" ❌
- "currentPhase": "target" ❌
- "currentPhase": "value" ❌
- "currentPhase": "unique" ❌

**Regeln:**
1. KOPIERE "currentPhase": "${phase}" GENAU SO - nicht ändern!
2. Setze "phaseComplete": true erst wenn ALLE Pflichtfelder der Phase erfasst sind
3. Übernimm alle bereits bekannten Daten in das JSON
4. Das JSON MUSS in <json>...</json> Tags stehen`;
}

/**
 * Build a phase-specific system prompt for the geschaeftsmodell module
 *
 * This is the phase-locked system for Module 02:
 * - Focused prompts per phase (angebot, zielgruppe, wertversprechen, usp)
 * - Forces Claude to focus on current phase objectives
 * - Prevents skipping mandatory questions
 * - Uses CBC coaching to challenge vague answers
 *
 * Layers:
 * 1. Minimal orchestrator context
 * 2. Phase-specific coaching (CBC focus)
 * 3. Common geschaeftsmodell rules
 * 4. Previous phase data (context carryover)
 * 5. Phase-specific prompt
 * 6. JSON output instructions
 */
export async function buildGeschaeftsmodellPhasePrompt(
  phase: GeschaeftsmodellPhase,
  options: {
    includeCoaching?: boolean;
    previousPhaseData?: Partial<PartialGeschaeftsmodellOutput>;
    intakeData?: { elevatorPitch?: string; problem?: string; solution?: string; targetAudience?: string };
  } = {}
): Promise<string> {
  const { includeCoaching = true, previousPhaseData, intakeData } = options;

  const parts: string[] = [];

  // Layer 1: Minimal orchestrator context
  parts.push(getMinimalGeschaeftsmodellOrchestratorContext());

  // Layer 2: Phase-specific coaching (CBC-heavy stack)
  if (includeCoaching) {
    const coachingStack = GESCHAEFTSMODELL_PHASE_COACHING[phase];
    for (const fragment of coachingStack) {
      try {
        const coachingContent = await loadCoachingFragmentCached(fragment);
        parts.push(coachingContent);
      } catch (error) {
        console.warn(`Failed to load coaching fragment for geschaeftsmodell phase: ${fragment}`);
      }
    }
  }

  // Layer 3: Common geschaeftsmodell rules
  try {
    const commonRules = await loadGeschaeftsmodellCommonRules();
    if (commonRules) {
      parts.push(commonRules);
    }
  } catch {
    // Non-critical, continue
  }

  // Layer 4: Previous phase data injection
  const contextData = formatPreviousGeschaeftsmodellPhaseData(previousPhaseData, intakeData);
  if (contextData) {
    parts.push(contextData);
  }

  // Layer 5: Phase-specific prompt
  try {
    const phasePrompt = await loadGeschaeftsmodellPhaseFileCached(phase);
    parts.push(phasePrompt);
  } catch (error) {
    console.error(`Failed to load geschaeftsmodell phase prompt: ${phase}`, error);
    // Fall back to generic geschaeftsmodell module
    const genericModule = await loadModuleSkillCached('gz-geschaeftsmodell');
    parts.push(genericModule);
  }

  // Layer 6: JSON output instructions
  parts.push(getGeschaeftsmodellPhaseJSONInstructions(phase));

  return parts.join('\n\n---\n\n');
}

/**
 * Build a complete system prompt for a module
 *
 * Layers:
 * 1. Orchestrator (workshop context)
 * 2. Coaching core (always loaded)
 * 3. Module-specific coaching fragments
 * 4. Module content
 */
export async function buildModulePrompt(
  moduleName: GZModule,
  options: {
    includeOrchestrator?: boolean;
    includeCoaching?: boolean;
  } = {}
): Promise<string> {
  const { includeOrchestrator = true, includeCoaching = true } = options;

  const parts: string[] = [];

  // Layer 1: Orchestrator context
  if (includeOrchestrator) {
    try {
      const orchestrator = await loadOrchestratorSkill();
      parts.push(orchestrator);
    } catch {
      parts.push(getOrchestratorFallback());
    }
  }

  // Layer 2 & 3: Coaching fragments
  if (includeCoaching) {
    const coachingStack = MODULE_COACHING_STACK[moduleName];

    if (coachingStack && Array.isArray(coachingStack)) {
      for (const fragment of coachingStack) {
        try {
          const coachingContent = await loadCoachingFragmentCached(fragment);
          parts.push(coachingContent);
        } catch (error) {
          console.warn(`Failed to load coaching fragment: ${fragment}`);
        }
      }
    } else {
      console.warn(`No coaching stack found for module: ${moduleName}`);
    }
  }

  // Layer 4: Module content
  try {
    const moduleContent = await loadModuleSkillCached(moduleName);
    parts.push(moduleContent);
  } catch (error) {
    console.error(`Failed to load module: ${moduleName}`, error);
    throw error;
  }

  // Layer 5: JSON output instructions
  if (moduleName === 'gz-intake') {
    parts.push(getJSONOutputInstructions());
  } else if (moduleName === 'gz-geschaeftsmodell') {
    parts.push(getGeschaeftsmodellJSONInstructions());
  }

  return parts.join('\n\n---\n\n');
}

/**
 * Get appropriate system prompt based on context
 */
export async function getContextualPrompt(context: {
  currentModule?: string; // Accept string to handle legacy module names
  phase?: 'intake' | 'module' | 'validation' | 'document';
  includeCoaching?: boolean;
}): Promise<string> {
  const { currentModule: rawModuleName, includeCoaching = true } = context;

  // Normalize the module name (handles legacy names like 'intake' -> 'gz-intake')
  const currentModule = rawModuleName ? normalizeModuleName(rawModuleName) : null;

  // If a specific module is requested, build the full prompt
  if (currentModule) {
    try {
      return await buildModulePrompt(currentModule, {
        includeOrchestrator: true,
        includeCoaching,
      });
    } catch (error) {
      console.error('Failed to build module prompt, using fallback', error);
      return buildFallbackPrompt(currentModule, includeCoaching);
    }
  }

  // Default: return orchestrator with core coaching
  try {
    const orchestrator = await loadOrchestratorSkill();
    if (includeCoaching) {
      const coachingCore = await loadCoachingFragmentCached('gz-system-coaching-core');
      return `${orchestrator}\n\n---\n\n${coachingCore}`;
    }
    return orchestrator;
  } catch {
    return getOrchestratorFallback();
  }
}

/**
 * Load a system prompt by skill name (for backwards compatibility)
 */
export async function loadSystemPrompt(skillName: string): Promise<string> {
  // Check if it's a module
  if (GZ_MODULES.includes(skillName as GZModule)) {
    return loadModuleSkillCached(skillName as GZModule);
  }

  // Check if it's a coaching fragment
  if (COACHING_FRAGMENTS.includes(skillName as CoachingFragment)) {
    return loadCoachingFragmentCached(skillName as CoachingFragment);
  }

  // Check for orchestrator
  if (skillName === 'gz-orchestrator') {
    return loadOrchestratorSkill();
  }

  throw new Error(`Unknown skill: ${skillName}`);
}

/**
 * Load system prompt with caching
 */
export async function loadSystemPromptCached(skillName: string): Promise<string> {
  return loadSystemPrompt(skillName);
}

/**
 * Clear the prompt cache (useful for development)
 */
export function clearPromptCache(): void {
  promptCache.clear();
}

/**
 * Get the coaching stack for a module
 */
export function getModuleCoachingStack(moduleName: GZModule): CoachingFragment[] {
  return MODULE_COACHING_STACK[moduleName];
}

// ============================================================================
// Fallback prompts (used when files can't be loaded)
// ============================================================================

function getOrchestratorFallback(): string {
  return `# Gründungszuschuss Business Plan Orchestrator

Leite Nutzer durch einen strukturierten Workshop zur Erstellung eines Businessplans für den Gründungszuschuss der Arbeitsagentur.

## Kernprinzipien

### Coaching-Methodik
1. **GROW-Modell**: Goal → Reality → Options → Will
2. **Design Thinking**: Empathie → Definieren → Ideation → Prototyp → Test
3. **YC-Validierung**: "Wer hat das Problem? Wie lösen sie es heute? Warum werden sie dafür bezahlen?"

### Coaching-Regeln
- Stelle maximal 2-3 Fragen pro Nachricht
- Gib konkretes, ehrliches Feedback
- Hinterfrage Annahmen konstruktiv
- Nutze Beispiele und Analogien
- Fasse Erkenntnisse regelmäßig zusammen
- Alle Kommunikation auf Deutsch

## Workshop-Module
1. Intake & Assessment (gz-intake)
2. Geschäftsmodell (gz-geschaeftsmodell)
3. Unternehmen (gz-unternehmen)
4. Markt & Wettbewerb (gz-markt-wettbewerb)
5. Marketingkonzept (gz-marketing)
6. Finanzplanung (gz-finanzplanung)
7. SWOT-Analyse (gz-swot)
8. Meilensteine (gz-meilensteine)
9. KPIs (gz-kpi)
10. Zusammenfassung (gz-zusammenfassung)`;
}

/**
 * Get JSON output instructions to append to all prompts
 */
function getJSONOutputInstructions(): string {
  return `

---

## KRITISCH: Strukturierte Datenausgabe

Nach JEDER Antwort MUSST du ein JSON-Update ausgeben, das die bisher gesammelten Informationen enthält.

**Format:**
Am Ende jeder Nachricht, gib die gesammelten Daten in einem JSON-Block aus:

<json>
{
  "founder": {
    "currentStatus": "employed" | "unemployed" | "other",
    "algStatus": {
      "daysRemaining": number,
      "monthlyAmount": number
    },
    "experience": {
      "yearsInIndustry": number,
      "previousFounder": boolean
    },
    "qualifications": {
      "education": "string",
      "certifications": ["string"]
    },
    "motivation": {
      "push": ["string"],
      "pull": ["string"]
    }
  },
  "businessIdea": {
    "elevator_pitch": "2-3 Sätze Beschreibung",
    "problem": "Das Problem das gelöst wird",
    "solution": "Die Lösung",
    "targetAudience": "Zielgruppe",
    "uniqueValue": "Alleinstellungsmerkmal"
  },
  "personality": {
    "narrative": "Zusammenfassung der unternehmerischen Persönlichkeit",
    "innovativeness": "high" | "medium" | "low",
    "riskTaking": "high" | "medium" | "low",
    "achievement": "high" | "medium" | "low",
    "proactiveness": "high" | "medium" | "low",
    "locusOfControl": "high" | "medium" | "low",
    "selfEfficacy": "high" | "medium" | "low",
    "autonomy": "high" | "medium" | "low"
  },
  "businessType": {
    "category": "consulting" | "ecommerce" | "local_service" | "local_retail" | "manufacturing" | "hybrid",
    "isDigitalFirst": boolean,
    "isLocationDependent": boolean,
    "reasoning": "Begründung für Klassifizierung"
  },
  "resources": {
    "financial": {
      "availableCapital": number,
      "expectedGZ": number
    },
    "time": {
      "hoursPerWeek": number,
      "isFullTime": boolean,
      "plannedStartDate": "ISO date string"
    },
    "network": {
      "industryContacts": number
    }
  },
  "validation": {
    "isGZEligible": boolean,
    "strengths": ["string"],
    "majorConcerns": ["string"],
    "minorConcerns": ["string"]
  },
  "metadata": {
    "currentPhase": "warmup" | "founder_profile" | "personality" | "profile_gen" | "resources" | "business_type" | "validation" | "completed"
  }
}
</json>

**Regeln:**
1. Gib NUR Felder aus, die du bereits kennst
2. Aktualisiere das JSON progressiv mit jeder neuen Information
3. Setze "metadata.currentPhase" auf die aktuelle Phase
4. Das JSON MUSS in <json>...</json> Tags eingeschlossen sein
5. Schreibe das JSON NACH deiner normalen Antwort`;
}

/**
 * Get JSON output instructions for Geschaeftsmodell module (Module 02)
 */
function getGeschaeftsmodellJSONInstructions(): string {
  return `

---

## KRITISCH: Strukturierte Datenausgabe für Geschäftsmodell

Nach JEDER Antwort MUSST du ein JSON-Update ausgeben, das die bisher gesammelten Informationen enthält.

**Format:**
Am Ende jeder Nachricht, gib die gesammelten Daten in einem JSON-Block aus:

<json>
{
  "offering": {
    "mainOffering": "Hauptprodukt/Dienstleistung",
    "deliveryFormat": "physical" | "digital" | "service" | "hybrid",
    "pricingModel": "hourly" | "project" | "subscription" | "product" | "value_based",
    "scope": {
      "included": ["Was inkludiert ist"],
      "excluded": ["Was NICHT angeboten wird"]
    },
    "oneSentencePitch": "Oma-Test: 1-2 Sätze verständlich für Laien"
  },
  "targetAudience": {
    "primaryPersona": {
      "name": "Persona-Name (z.B. 'Tech-Startup Gründerin Sarah')",
      "demographics": {
        "occupation": "Beruf/Position",
        "location": "Standort/Region",
        "ageRange": "optional: Altersgruppe"
      },
      "firmographics": {
        "industry": "Branche (B2B)",
        "companySize": "Unternehmensgröße (z.B. '10-50 MA')",
        "position": "Entscheider-Position",
        "budget": "Budget-Range"
      },
      "psychographics": {
        "goals": ["Ziele"],
        "challenges": ["Herausforderungen"],
        "values": ["Werte"],
        "interests": ["Interessen"]
      },
      "behavior": {
        "informationSources": ["Wo sie recherchieren"],
        "decisionProcess": "Wie sie entscheiden",
        "previousAttempts": ["Was sie schon versucht haben"]
      },
      "buyingTrigger": "Was macht sie JETZT kaufen?"
    },
    "marketSize": {
      "totalAddressableMarket": number,
      "tamSource": "Quelle/URL",
      "serviceableMarket": number,
      "samCalculation": "Berechnungsweg zeigen",
      "targetFirstYear": number,
      "reasoning": "Warum realistisch"
    }
  },
  "valueProposition": {
    "customerJobs": ["Was Kunde erreichen will"],
    "customerPains": ["Was frustriert"],
    "customerGains": ["Was begeistert"],
    "productsServices": ["Deine Angebote"],
    "painRelievers": ["Wie du Probleme löst"],
    "gainCreators": ["Wie du Mehrwert schaffst"],
    "valueStatement": "[Zielgruppe] kann mit [Angebot] [Ergebnis erreichen], ohne [Problem]"
  },
  "usp": {
    "statement": "Für [Zielgruppe] ist [Angebot] die einzige Lösung, die [Nutzen], weil [Beweis]",
    "category": "specialization" | "method" | "result" | "experience" | "service" | "speed" | "local" | "other",
    "proof": "Wie du es beweist/einhältst",
    "measurement": "Wie Kunde es überprüfen kann",
    "uspTest": {
      "isUnique": boolean,
      "isRelevant": boolean,
      "isProvable": boolean,
      "isUnderstandable": boolean,
      "isOneSentence": boolean
    }
  },
  "competitiveAnalysis": {
    "directCompetitors": [
      {
        "name": "Wettbewerber 1",
        "offering": "Was sie anbieten",
        "pricePoint": "Preislage",
        "strength": "Stärke",
        "weakness": "Schwäche",
        "yourAdvantage": "Dein Vorteil"
      }
    ],
    "competitiveAdvantages": ["Deine Differenzierungsmerkmale"],
    "marketGaps": ["Marktlücken die niemand bedient"]
  },
  "validation": {
    "offerClarity": "clear" | "vague" | "needs_work",
    "targetAudienceSpecific": boolean,
    "marketSizeQuantified": boolean,
    "valueFromCustomerPerspective": boolean,
    "uspUnique": boolean,
    "uspRelevant": boolean,
    "uspProvable": boolean,
    "competitorsAnalyzed": boolean,
    "minCompetitors": boolean,
    "readyForNextModule": boolean,
    "blockers": ["Was noch fehlt"]
  },
  "metadata": {
    "currentPhase": "angebot" | "zielgruppe" | "wertversprechen" | "usp" | "completed",
    "phaseComplete": boolean
  }
}
</json>

**Regeln:**
1. Gib NUR Felder aus, die du bereits kennst
2. Aktualisiere das JSON progressiv mit jeder neuen Information
3. Setze "metadata.currentPhase" auf die aktuelle Phase:
   - "angebot": Angebotsdefinition (Was bietest du an?)
   - "zielgruppe": Zielgruppendefinition (Wer ist dein Kunde?)
   - "wertversprechen": Wertversprechen (Welchen Nutzen bietest du?)
   - "usp": Alleinstellungsmerkmal (Was macht dich einzigartig?)
   - "completed": Modul abgeschlossen
4. Setze "phaseComplete": true wenn alle Pflichtfelder der Phase erfasst sind
5. Das JSON MUSS in <json>...</json> Tags eingeschlossen sein
6. Schreibe das JSON NACH deiner normalen Antwort

**BA-Compliance Pflichtfelder (BLOCKER - ohne diese kein nächstes Modul):**
- Angebot konkret (nicht "guter Service" oder "Beratung")
- Zielgruppe spezifisch (nicht "alle" oder "Unternehmen")
- Marktgröße quantifiziert mit Quelle
- Mindestens 3 Wettbewerber analysiert`;
}

function buildFallbackPrompt(moduleName: GZModule, includeCoaching: boolean): string {
  const moduleLabels: Record<GZModule, string> = {
    'gz-intake': 'Intake & Founder Assessment',
    'gz-geschaeftsmodell': 'Geschäftsmodell',
    'gz-unternehmen': 'Unternehmen',
    'gz-markt-wettbewerb': 'Markt & Wettbewerb',
    'gz-marketing': 'Marketing',
    'gz-finanzplanung': 'Finanzplanung',
    'gz-swot': 'SWOT-Analyse',
    'gz-meilensteine': 'Meilensteine',
    'gz-kpi': 'KPIs',
    'gz-zusammenfassung': 'Zusammenfassung',
  };

  let prompt = getOrchestratorFallback();
  prompt += `\n\n---\n\n## Aktuelles Modul: ${moduleLabels[moduleName]}`;

  if (includeCoaching) {
    prompt += `\n\n---\n\n## Coaching-Grundsätze

- Aktives Zuhören: Spiegele zurück, was du hörst
- Offene Fragen: Frage "was" und "wie" statt "ja/nein"
- Anerkennung: Erkenne Stärken und Fortschritte
- Reflexion: Hilf Gründern, Muster zu erkennen
- Zusammenfassung: Fasse wichtige Punkte zusammen

Leite, schreibe nicht vor. Hilf Gründern, ihre eigenen Lösungen zu entdecken.`;
  }

  // Add JSON output instructions
  if (moduleName === 'gz-intake') {
    prompt += getJSONOutputInstructions();
  } else if (moduleName === 'gz-geschaeftsmodell') {
    prompt += getGeschaeftsmodellJSONInstructions();
  }

  return prompt;
}
