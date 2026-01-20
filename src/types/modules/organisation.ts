/**
 * Module 05: Organisation (Organization Structure) Types (GZ-503)
 *
 * Organization structure and team planning with:
 * - Team structure definition and role planning
 * - Capacity planning and workload estimation
 * - Partnership and outsourcing decisions
 * - GROW model decision support for realistic planning
 */

import { z } from 'zod';

// ============================================================================
// Enums
// ============================================================================

export const OrganisationPhase = z.enum([
  'intro',             // Introduction with GROW Goal
  'team_struktur',     // Phase 1: Team structure and roles
  'kapazitaeten',      // Phase 2: Capacity planning
  'partner',           // Phase 3: Partners and outsourcing
  'validierung',       // Phase 4: Validation and refinement
  'completed',
]);

export type OrganisationPhase = z.infer<typeof OrganisationPhase>;

export const TeamRoleType = z.enum([
  'founder',           // Gründer/Inhaber
  'co_founder',        // Mitgründer
  'employee_fulltime', // Vollzeit-Angestellte
  'employee_parttime', // Teilzeit-Angestellte
  'freelancer',        // Freiberufler
  'intern',            // Praktikant/Werkstudent
  'advisor',           // Berater
  'partner',           // Geschäftspartner
]);

export type TeamRoleType = z.infer<typeof TeamRoleType>;

export const SkillLevel = z.enum([
  'beginner',          // Anfänger
  'intermediate',      // Fortgeschritten
  'advanced',          // Erfahren
  'expert',            // Experte
]);

export type SkillLevel = z.infer<typeof SkillLevel>;

export const WorkingTimeModel = z.enum([
  'fulltime',          // Vollzeit (40h/Woche)
  'parttime_30',       // Teilzeit 30h/Woche
  'parttime_20',       // Teilzeit 20h/Woche
  'parttime_10',       // Teilzeit 10h/Woche
  'project_based',     // Projektbasiert
  'on_demand',         // Auf Abruf
]);

export type WorkingTimeModel = z.infer<typeof WorkingTimeModel>;

export const OutsourcingType = z.enum([
  'none',              // Keine Auslagerung
  'accounting',        // Buchhaltung
  'marketing',         // Marketing
  'it_support',        // IT-Support
  'legal',             // Rechtliche Beratung
  'cleaning',          // Reinigung
  'logistics',         // Logistik
  'customer_service',  // Kundendienst
  'production',        // Produktion
]);

export type OutsourcingType = z.infer<typeof OutsourcingType>;

export const PartnershipType = z.enum([
  'none',              // Keine Partnerschaften
  'supplier',          // Lieferantenpartnerschaft
  'distribution',      // Vertriebspartnerschaft
  'technology',        // Technologiepartnerschaft
  'strategic',         // Strategische Partnerschaft
  'joint_venture',     // Joint Venture
  'franchise',         // Franchise
]);

export type PartnershipType = z.infer<typeof PartnershipType>;

// ============================================================================
// Sub-Schemas
// ============================================================================

export const TeamMemberSchema = z.object({
  name: z.string(),                         // Name/Position
  role: TeamRoleType,
  description: z.string(),                  // Aufgabenbeschreibung
  skills: z.array(z.string()),              // Erforderliche Fähigkeiten
  skillLevel: SkillLevel,
  workingTime: WorkingTimeModel,
  startDate: z.string().optional(),         // Wann wird die Person benötigt
  salary: z.number().optional(),            // Gehalt/Honorar pro Monat
  isHired: z.boolean().default(false),      // Bereits eingestellt
  recruitmentPlan: z.string().optional(),   // Wie finden/anwerben
});

export type TeamMember = z.infer<typeof TeamMemberSchema>;

export const TeamStrukturSchema = z.object({
  teamMembers: z.array(TeamMemberSchema),
  organizationalStructure: z.string(),      // Beschreibung der Organisationsstruktur
  leadershipStyle: z.string(),              // Führungsstil
  communicationStructure: z.string(),       // Kommunikationsstrukturen
  decisionMaking: z.string(),               // Entscheidungsprozesse
  teamCulture: z.string(),                  // Teamkultur und Werte
});

export type TeamStruktur = z.infer<typeof TeamStrukturSchema>;

export const KapazitaetSchema = z.object({
  currentCapacity: z.object({
    hoursPerWeek: z.number(),               // Aktuelle Stunden pro Woche
    tasksPerWeek: z.number().optional(),    // Aufgaben pro Woche
    projectsSimultaneous: z.number().optional(), // Gleichzeitige Projekte
  }),
  projectedGrowth: z.object({
    month3: z.number(),                     // Kapazität in 3 Monaten (%)
    month6: z.number(),                     // Kapazität in 6 Monaten (%)
    month12: z.number(),                    // Kapazität in 12 Monaten (%)
  }),
  bottlenecks: z.array(z.string()),         // Identifizierte Engpässe
  scalingPlan: z.string(),                  // Plan für Kapazitätserweiterung
  qualityAssurance: z.string(),             // Qualitätssicherung bei Wachstum
  workLifeBalance: z.string(),              // Work-Life-Balance Überlegungen
});

export type Kapazitaet = z.infer<typeof KapazitaetSchema>;

export const PartnershipSchema = z.object({
  type: PartnershipType,
  partnerName: z.string().optional(),       // Name des Partners (wenn bekannt)
  partnerDescription: z.string(),           // Was macht der Partner
  benefitsForUs: z.string(),                // Vorteile für uns
  benefitsForPartner: z.string(),           // Vorteile für Partner
  keyTerms: z.array(z.string()),            // Wichtige Vertragspunkte
  riskFactors: z.array(z.string()).optional(), // Risikofaktoren
  timeline: z.string().optional(),          // Zeitplan für Partnerschaft
});

export type Partnership = z.infer<typeof PartnershipSchema>;

export const OutsourcingDecisionSchema = z.object({
  activity: OutsourcingType,
  decision: z.enum(['keep_internal', 'outsource', 'hybrid']),
  reasoning: z.string(),                    // Begründung der Entscheidung
  estimatedCost: z.number().optional(),     // Geschätzte Kosten
  qualityRequirements: z.string().optional(), // Qualitätsanforderungen
  providerCriteria: z.array(z.string()).optional(), // Kriterien für Anbieterauswahl
  timeline: z.string().optional(),          // Umsetzungszeitplan
});

export type OutsourcingDecision = z.infer<typeof OutsourcingDecisionSchema>;

export const OrganisationValidationSchema = z.object({
  teamStructureClear: z.boolean(),          // Teamstruktur ist klar
  capacityPlanned: z.boolean(),             // Kapazitäten sind geplant
  bottlenecksIdentified: z.boolean(),       // Engpässe identifiziert
  partnershipsEvaluated: z.boolean(),       // Partnerschaften bewertet
  outsourcingDecided: z.boolean(),          // Outsourcing-Entscheidungen getroffen
  scalingPlanExists: z.boolean(),           // Skalierungsplan vorhanden
  blockers: z.array(z.string()),
  warnings: z.array(z.string()),
  readyForNextModule: z.boolean(),
});

export type OrganisationValidation = z.infer<typeof OrganisationValidationSchema>;

export const OrganisationMetadataSchema = z.object({
  completedAt: z.string().optional(),
  duration: z.number().optional(),
  currentPhase: OrganisationPhase.optional(),
  growDecisions: z.array(z.string()).optional(), // GROW-basierte Entscheidungen
  coachingDepth: z.enum(['shallow', 'medium', 'deep']).optional(),
  conversationTurns: z.number().optional(),
});

export type OrganisationMetadata = z.infer<typeof OrganisationMetadataSchema>;

// ============================================================================
// Main Output Schema
// ============================================================================

export const OrganisationOutputSchema = z.object({
  teamStruktur: TeamStrukturSchema,
  kapazitaeten: KapazitaetSchema,
  partnerschaften: z.array(PartnershipSchema),
  outsourcing: z.array(OutsourcingDecisionSchema),
  validation: OrganisationValidationSchema,
  metadata: OrganisationMetadataSchema,
});

export type OrganisationOutput = z.infer<typeof OrganisationOutputSchema>;

export const PartialOrganisationOutputSchema = z.object({
  teamStruktur: TeamStrukturSchema.deepPartial().optional(),
  kapazitaeten: KapazitaetSchema.deepPartial().optional(),
  partnerschaften: z.array(PartnershipSchema).optional(),
  outsourcing: z.array(OutsourcingDecisionSchema).optional(),
  validation: OrganisationValidationSchema.partial().optional(),
  metadata: OrganisationMetadataSchema.partial().optional(),
});

export type PartialOrganisationOutput = z.infer<typeof PartialOrganisationOutputSchema>;

// ============================================================================
// Helper Functions
// ============================================================================

export function createEmptyOrganisationOutput(): PartialOrganisationOutput {
  return {};
}

export function isOrganisationComplete(data: PartialOrganisationOutput): boolean {
  const hasTeamStructure = Boolean(
    data.teamStruktur?.teamMembers &&
    data.teamStruktur.teamMembers.length > 0 &&
    data.teamStruktur.organizationalStructure
  );

  const hasCapacityPlan = Boolean(
    data.kapazitaeten?.currentCapacity &&
    data.kapazitaeten.projectedGrowth
  );

  const hasDecisions = Boolean(
    data.outsourcing &&
    data.outsourcing.length > 0
  );

  return hasTeamStructure && hasCapacityPlan && hasDecisions;
}

/**
 * Merge partial updates into existing data
 */
export function mergeOrganisationData(
  existing: PartialOrganisationOutput,
  update: PartialOrganisationOutput
): PartialOrganisationOutput {
  return {
    teamStruktur: existing.teamStruktur || update.teamStruktur
      ? { ...existing.teamStruktur, ...update.teamStruktur }
      : undefined,
    kapazitaeten: existing.kapazitaeten || update.kapazitaeten
      ? { ...existing.kapazitaeten, ...update.kapazitaeten }
      : undefined,
    partnerschaften: [
      ...(existing.partnerschaften || []),
      ...(update.partnerschaften || []).filter(
        (newPartnership) =>
          !(existing.partnerschaften || []).some(
            (existingPartnership) => existingPartnership?.type === newPartnership?.type
          )
      ),
    ],
    outsourcing: [
      ...(existing.outsourcing || []),
      ...(update.outsourcing || []).filter(
        (newDecision) =>
          !(existing.outsourcing || []).some(
            (existingDecision) => existingDecision?.activity === newDecision?.activity
          )
      ),
    ],
    validation: existing.validation || update.validation
      ? { ...existing.validation, ...update.validation }
      : undefined,
    metadata: { ...existing.metadata, ...update.metadata },
  };
}

/**
 * Calculate module completion percentage
 */
export function calculateOrganisationCompletion(data: PartialOrganisationOutput): number {
  let score = 0;
  const maxScore = 100;

  // Team structure (30 points)
  const teamMemberCount = data.teamStruktur?.teamMembers?.length || 0;
  score += Math.min(teamMemberCount * 5, 20); // Up to 4 team members = 20 points
  if (data.teamStruktur?.organizationalStructure) score += 10;

  // Capacity planning (25 points)
  if (data.kapazitaeten?.currentCapacity?.hoursPerWeek) score += 10;
  if (data.kapazitaeten?.projectedGrowth) score += 10;
  if (data.kapazitaeten?.scalingPlan) score += 5;

  // Partnerships (20 points)
  const partnershipCount = data.partnerschaften?.length || 0;
  score += Math.min(partnershipCount * 10, 20); // Up to 2 partnerships = 20 points

  // Outsourcing decisions (25 points)
  const outsourcingDecisionCount = data.outsourcing?.length || 0;
  score += Math.min(outsourcingDecisionCount * 5, 25); // Up to 5 decisions = 25 points

  return Math.min(Math.round((score / maxScore) * 100), 100);
}

// ============================================================================
// GROW Model Decision Support
// ============================================================================

export const GROWDecisionSchema = z.object({
  /** GOAL: What organizational goal is being discussed */
  goal: z.string().optional(),
  /** REALITY: Current situation/capacity */
  reality: z.string().optional(),
  /** OPTIONS: Available options for organization */
  options: z.array(z.string()).optional(),
  /** WILL: What will be implemented */
  will: z.string().optional(),
  /** Decision area (team, capacity, partnerships) */
  decisionArea: z.enum(['team', 'capacity', 'partnerships', 'outsourcing']).optional(),
});

export type GROWDecision = z.infer<typeof GROWDecisionSchema>;

// ============================================================================
// Phase Info
// ============================================================================

export const OrganisationPhaseInfo: Record<OrganisationPhase, {
  label: string;
  duration: number;
  questionClusters: string[];
  coachingDepth: 'shallow' | 'medium' | 'deep';
}> = {
  intro: {
    label: 'Einführung',
    duration: 5,
    questionClusters: ['goal_setting'],
    coachingDepth: 'shallow',
  },
  team_struktur: {
    label: 'Team-Struktur',
    duration: 20,
    questionClusters: ['team_roles', 'leadership', 'communication'],
    coachingDepth: 'medium',
  },
  kapazitaeten: {
    label: 'Kapazitätsplanung',
    duration: 15,
    questionClusters: ['current_capacity', 'growth_planning', 'bottlenecks'],
    coachingDepth: 'medium',
  },
  partner: {
    label: 'Partner & Outsourcing',
    duration: 15,
    questionClusters: ['partnerships', 'outsourcing_decisions', 'vendor_selection'],
    coachingDepth: 'medium',
  },
  validierung: {
    label: 'Validierung',
    duration: 5,
    questionClusters: ['validation', 'refinement'],
    coachingDepth: 'shallow',
  },
  completed: {
    label: 'Abgeschlossen',
    duration: 0,
    questionClusters: [],
    coachingDepth: 'shallow',
  },
};