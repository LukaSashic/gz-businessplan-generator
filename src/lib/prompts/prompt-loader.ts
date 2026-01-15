/**
 * System Prompt Loader
 * 
 * For MVP: Returns simple fallback prompts
 * For Production: Would load from actual skill files
 */

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

export type GZModule = typeof GZ_MODULES[number];

/**
 * Coaching methodology fragments
 */
export const COACHING_FRAGMENTS = [
  'gz-coaching-core',
  'gz-coaching-mi',
  'gz-coaching-cbc',
  'gz-coaching-ai',
  'gz-coaching-sdt',
  'gz-coaching-stage',
] as const;

export type CoachingFragment = typeof COACHING_FRAGMENTS[number];

/**
 * Simple fallback prompts for MVP
 * In production, these would be loaded from /mnt/skills/user/
 */
const FALLBACK_PROMPTS: Record<string, string> = {
  'gz-orchestrator': `You are an expert business planning coach for the German Gründungszuschuss program.

Your role is to guide entrepreneurs through creating a comprehensive business plan that meets BA (Bundesagentur für Arbeit) requirements for the Tragfähigkeitsbescheinigung.

Key principles:
- Ask clarifying questions before making assumptions
- Provide data-backed recommendations
- Structure responses in clear, actionable steps
- Use motivational interviewing techniques
- Validate against BA requirements

The business plan covers 10 modules:
1. Intake - Founder assessment and business idea validation
2. Business Model - Value proposition and target audience
3. Company - Legal structure and management
4. Market & Competition - Industry analysis
5. Marketing - Strategy and channels
6. Financial Planning - Projections and funding
7. SWOT - Analysis and strategic derivations
8. Milestones - Implementation roadmap
9. KPIs - Performance metrics
10. Executive Summary - Final synthesis

Always maintain a supportive, professional tone while ensuring regulatory compliance.`,

  'gz-intake': `You are conducting the initial intake assessment for a Gründungszuschuss business plan.

Focus areas:
1. Founder Profile - Background, skills, experience
2. Business Idea - Description, problem/solution fit
3. Entrepreneurial Readiness - Risk tolerance, achievement motivation
4. Business Type Classification - Service, product, online, etc.

Use open-ended questions to understand:
- The founder's motivations and goals
- Core competencies and unique advantages
- Market understanding and customer insights
- Resource availability and constraints

Document findings in structured format for downstream modules.`,

  'gz-coaching-core': `Core Coaching Methodology:

- Active Listening: Reflect back what you hear
- Open Questions: Ask "what" and "how" instead of "yes/no"
- Affirmation: Recognize strengths and progress
- Reflection: Help founders see patterns
- Summarization: Synthesize key points

Guide, don't prescribe. Help founders discover their own solutions.`,

  'gz-coaching-mi': `Motivational Interviewing Techniques:

- Express empathy
- Develop discrepancy between goals and current behavior
- Roll with resistance (don't confront)
- Support self-efficacy

Use OARS:
- Open questions
- Affirmations
- Reflections
- Summaries`,
};

/**
 * Get appropriate system prompt based on context
 * 
 * For MVP: Returns fallback prompts
 * For Production: Would load from actual skill files
 */
export async function getContextualPrompt(context: {
  currentModule?: GZModule;
  phase?: 'intake' | 'module' | 'validation' | 'document';
  includeCoaching?: boolean;
}): Promise<string> {
  const { currentModule, phase = 'module', includeCoaching = true } = context;

  // Build prompt from fallback prompts
  let prompt = '';

  // Base orchestrator prompt
  prompt += FALLBACK_PROMPTS['gz-orchestrator'];

  // Add module-specific guidance
  if (currentModule && FALLBACK_PROMPTS[currentModule]) {
    prompt += '\n\n---\n\n';
    prompt += `Current Module: ${currentModule}\n\n`;
    prompt += FALLBACK_PROMPTS[currentModule];
  }

  // Add coaching methodology
  if (includeCoaching) {
    prompt += '\n\n---\n\n';
    prompt += FALLBACK_PROMPTS['gz-coaching-core'];
    prompt += '\n\n';
    prompt += FALLBACK_PROMPTS['gz-coaching-mi'];
  }

  return prompt;
}

/**
 * Load a system prompt from a skill file
 * 
 * NOTE: This is a placeholder for the production implementation
 * In production, this would actually read from /mnt/skills/user/
 */
export async function loadSystemPrompt(skillName: string): Promise<string> {
  // For MVP, return fallback prompt
  const fallback = FALLBACK_PROMPTS[skillName];
  
  if (!fallback) {
    console.warn(`No fallback prompt for skill: ${skillName}`);
    return `You are a helpful business planning assistant for ${skillName}.`;
  }
  
  return fallback;
}

/**
 * Load multiple system prompts and combine them
 */
export async function loadCombinedPrompts(skillNames: string[]): Promise<string> {
  const prompts = await Promise.all(
    skillNames.map(async (name) => {
      try {
        return await loadSystemPrompt(name);
      } catch (error) {
        console.warn(`Skipping missing skill: ${name}`);
        return '';
      }
    })
  );

  return prompts
    .filter((p) => p.length > 0)
    .join('\n\n---\n\n');
}

/**
 * Build a system prompt for a specific module with coaching
 */
export async function buildModulePrompt(
  moduleName: GZModule,
  coachingFragments: CoachingFragment[] = ['gz-coaching-core', 'gz-coaching-mi']
): Promise<string> {
  const skills = [moduleName, ...coachingFragments];
  return loadCombinedPrompts(skills);
}

/**
 * Build orchestrator prompt with all necessary skills
 */
export async function buildOrchestratorPrompt(): Promise<string> {
  const orchestratorSkill = await loadSystemPrompt('gz-orchestrator');
  const coachingCore = await loadSystemPrompt('gz-coaching-core');
  
  return `${orchestratorSkill}\n\n---\n\n${coachingCore}`;
}

/**
 * Cache for loaded prompts (in-memory for MVP)
 */
const promptCache = new Map<string, { content: string; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Load system prompt with caching
 */
export async function loadSystemPromptCached(skillName: string): Promise<string> {
  const cached = promptCache.get(skillName);
  const now = Date.now();

  if (cached && now - cached.timestamp < CACHE_TTL) {
    return cached.content;
  }

  const content = await loadSystemPrompt(skillName);
  promptCache.set(skillName, { content, timestamp: now });
  
  return content;
}

/**
 * Clear the prompt cache (useful for development)
 */
export function clearPromptCache(): void {
  promptCache.clear();
}
