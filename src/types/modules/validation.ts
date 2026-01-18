/**
 * Validation Types for Module 01: Intake
 *
 * Based on gz-validator SKILL.md
 */

import { z } from 'zod';
import type { PartialIntakeOutput } from './intake';

// ============================================================================
// Intake Validation Schema
// ============================================================================

export const IntakeValidationSchema = z.object({
  // Critical checks (MUST pass)
  algDaysRemaining: z.number(),
  isGZEligible: z.boolean(),

  // Completeness checks
  founderProfileComplete: z.boolean(),
  businessIdeaComplete: z.boolean(),
  personalityAssessed: z.boolean(),
  businessTypeClassified: z.boolean(),
  resourcesDocumented: z.boolean(),

  // Quality indicators
  majorConcerns: z.array(z.string()),   // Red flags to address
  minorConcerns: z.array(z.string()),   // Yellow flags to monitor
  strengths: z.array(z.string()),       // What's going well

  // Overall status
  overallStatus: z.enum(['passed', 'warning', 'failed']),
  blockingError: z.string().optional(), // If failed, why
});

export type IntakeValidation = z.infer<typeof IntakeValidationSchema>;

// ============================================================================
// Validation Functions
// ============================================================================

/**
 * Validate intake data against GZ requirements
 */
export function validateIntakeData(data: PartialIntakeOutput): IntakeValidation {
  const concerns: { major: string[]; minor: string[]; strengths: string[] } = {
    major: [],
    minor: [],
    strengths: [],
  };

  // Check ALG eligibility (CRITICAL)
  const algDaysRemaining = data.founder?.algStatus?.daysRemaining ?? 0;
  const isGZEligible = algDaysRemaining >= 150;

  if (!isGZEligible && data.founder?.currentStatus === 'unemployed') {
    concerns.major.push(
      `ALG-Restanspruch von ${algDaysRemaining} Tagen ist unter dem Minimum von 150 Tagen`
    );
  }

  // Check founder profile completeness
  const founderProfileComplete = Boolean(
    data.founder?.currentStatus &&
    data.founder?.experience?.yearsInIndustry !== undefined &&
    data.founder?.qualifications?.education &&
    data.founder?.motivation?.push?.length
  );

  if (!founderProfileComplete) {
    concerns.minor.push('Gründerprofil ist unvollständig');
  }

  // Check business idea completeness
  const businessIdeaComplete = Boolean(
    data.businessIdea?.elevator_pitch &&
    data.businessIdea?.problem &&
    data.businessIdea?.solution &&
    data.businessIdea?.targetAudience
  );

  if (!businessIdeaComplete) {
    concerns.minor.push('Geschäftsidee-Beschreibung ist unvollständig');
  }

  // Check personality assessment
  const personalityAssessed = Boolean(
    data.personality?.narrative &&
    data.personality?.innovativeness &&
    data.personality?.riskTaking
  );

  if (!personalityAssessed) {
    concerns.minor.push('Unternehmerische Persönlichkeit nicht vollständig erfasst');
  }

  // Check business type classification
  const businessTypeClassified = Boolean(data.businessType?.category);

  if (!businessTypeClassified) {
    concerns.minor.push('Geschäftstyp nicht klassifiziert');
  }

  // Check resources documentation
  const resourcesDocumented = Boolean(
    data.resources?.financial?.availableCapital !== undefined &&
    data.resources?.time?.plannedStartDate
  );

  if (!resourcesDocumented) {
    concerns.minor.push('Ressourcen nicht vollständig dokumentiert');
  }

  // Analyze strengths
  if (data.founder?.experience?.yearsInIndustry && data.founder.experience.yearsInIndustry >= 5) {
    concerns.strengths.push(
      `${data.founder.experience.yearsInIndustry} Jahre Branchenerfahrung`
    );
  }

  if (data.founder?.experience?.previousFounder) {
    concerns.strengths.push('Frühere Gründungserfahrung vorhanden');
  }

  if (data.founder?.qualifications?.certifications?.length) {
    concerns.strengths.push(
      `${data.founder.qualifications.certifications.length} relevante Zertifizierungen`
    );
  }

  if (data.resources?.network?.industryContacts && data.resources.network.industryContacts >= 7) {
    concerns.strengths.push('Starkes Branchennetzwerk');
  }

  if (data.resources?.financial?.availableCapital && data.resources.financial.availableCapital >= 10000) {
    concerns.strengths.push('Solide Eigenkapitalbasis');
  }

  // Check for potential red flags
  if (data.personality?.redFlags?.length) {
    for (const flag of data.personality.redFlags) {
      concerns.minor.push(`Persönlichkeits-Flag: ${flag}`);
    }
  }

  if (data.founder?.experience?.yearsInIndustry === 0) {
    concerns.major.push('Keine Branchenerfahrung - Qualifikationsnachweis kritisch');
  }

  if (!data.founder?.experience?.previousFounder &&
      data.personality?.riskTaking === 'low' &&
      data.personality?.selfEfficacy === 'low') {
    concerns.minor.push(
      'Erstagründer mit niedriger Risikobereitschaft und Selbstwirksamkeit - zusätzliche Unterstützung empfohlen'
    );
  }

  // Determine overall status
  let overallStatus: 'passed' | 'warning' | 'failed' = 'passed';
  let blockingError: string | undefined;

  if (!isGZEligible && data.founder?.currentStatus === 'unemployed') {
    overallStatus = 'failed';
    blockingError = `Für den Gründungszuschuss brauchst du mindestens 150 Tage ALG I-Restanspruch. Du hast aktuell ${algDaysRemaining} Tage.

Optionen:
- Warte bis du wieder ≥150 Tage hast
- Prüfe Einstiegsgeld als Alternative
- Kontaktiere deine Arbeitsagentur für Beratung`;
  } else if (concerns.major.length > 0) {
    overallStatus = 'warning';
  }

  return {
    algDaysRemaining,
    isGZEligible,
    founderProfileComplete,
    businessIdeaComplete,
    personalityAssessed,
    businessTypeClassified,
    resourcesDocumented,
    majorConcerns: concerns.major,
    minorConcerns: concerns.minor,
    strengths: concerns.strengths,
    overallStatus,
    blockingError,
  };
}

/**
 * Format validation result for display
 */
export function formatValidationResult(validation: IntakeValidation): string {
  const lines: string[] = [
    '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
    '📋 INTAKE VALIDIERUNG',
    '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
    '',
  ];

  // Status icon
  const statusIcon = {
    passed: '✅',
    warning: '⚠️',
    failed: '❌',
  }[validation.overallStatus];

  lines.push(`Status: ${statusIcon} ${validation.overallStatus.toUpperCase()}`);
  lines.push('');

  // GZ Eligibility
  const gzIcon = validation.isGZEligible ? '✅' : '❌';
  lines.push(`${gzIcon} GZ-Berechtigung: ${validation.isGZEligible ? 'Ja' : 'Nein'}`);
  lines.push(`   ALG-Restanspruch: ${validation.algDaysRemaining} Tage`);
  lines.push('');

  // Completeness
  lines.push('VOLLSTÄNDIGKEIT:');
  lines.push(`  ${validation.founderProfileComplete ? '✅' : '⬚'} Gründerprofil`);
  lines.push(`  ${validation.businessIdeaComplete ? '✅' : '⬚'} Geschäftsidee`);
  lines.push(`  ${validation.personalityAssessed ? '✅' : '⬚'} Persönlichkeit`);
  lines.push(`  ${validation.businessTypeClassified ? '✅' : '⬚'} Geschäftstyp`);
  lines.push(`  ${validation.resourcesDocumented ? '✅' : '⬚'} Ressourcen`);
  lines.push('');

  // Concerns
  if (validation.majorConcerns.length > 0) {
    lines.push('🚩 KRITISCHE PUNKTE:');
    for (const concern of validation.majorConcerns) {
      lines.push(`  • ${concern}`);
    }
    lines.push('');
  }

  if (validation.minorConcerns.length > 0) {
    lines.push('⚠️ HINWEISE:');
    for (const concern of validation.minorConcerns) {
      lines.push(`  • ${concern}`);
    }
    lines.push('');
  }

  // Strengths
  if (validation.strengths.length > 0) {
    lines.push('💪 STÄRKEN:');
    for (const strength of validation.strengths) {
      lines.push(`  • ${strength}`);
    }
    lines.push('');
  }

  // Blocking error
  if (validation.blockingError) {
    lines.push('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    lines.push('❌ BLOCKIERENDER FEHLER:');
    lines.push(validation.blockingError);
  }

  lines.push('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  return lines.join('\n');
}
