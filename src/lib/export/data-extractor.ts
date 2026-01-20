/**
 * Workshop Data Extractor (GZ-901)
 *
 * Extracts and validates module data from WorkshopSession for document generation.
 * Ensures all required data is present and properly typed before export.
 */

import type { WorkshopSession } from '@/types/workshop-session';
import type { ValidationResult } from '@/lib/validation/types';
import type { WorkshopDataExtract } from './types';
import type {
  PartialIntakeOutput,
  PartialGeschaeftsmodellOutput,
  PartialMarktWettbewerbOutput,
  PartialMarketingOutput,
  PartialFinanzplanungOutput,
  PartialUnternehmenOutput,
  PartialSWOTOutput,
  PartialMeilensteineOutput,
  PartialKPIOutput,
  PartialZusammenfassungOutput
} from '@/types/modules';

// ============================================================================
// Required Module IDs (BA compliance requirement)
// ============================================================================

const REQUIRED_MODULES = [
  'gz-intake',
  'gz-geschaeftsmodell',
  'gz-unternehmen',
  'gz-markt-wettbewerb',
  'gz-marketing',
  'gz-finanzplanung',
  'gz-swot',
  'gz-meilensteine',
  'gz-kpi',
  'gz-zusammenfassung'
] as const;

// ============================================================================
// Main Data Extraction Function
// ============================================================================

/**
 * Extract workshop data for document generation
 *
 * Validates that all required modules are complete and properly typed.
 * Returns null if any critical data is missing.
 */
export function extractWorkshopData(
  workshopSession: WorkshopSession,
  validationResult: ValidationResult
): WorkshopDataExtract | null {
  try {
    // Validate session completeness
    if (!isSessionComplete(workshopSession)) {
      console.error('Workshop session incomplete:', {
        status: workshopSession.status,
        moduleCount: Object.keys(workshopSession.modules).length
      });
      return null;
    }

    // Extract session metadata
    const sessionData = {
      id: workshopSession.id,
      title: workshopSession.businessName || 'Geschäftsplan',
      createdAt: new Date(workshopSession.createdAt),
      updatedAt: new Date(workshopSession.updatedAt),
      userId: workshopSession.userId
    };

    // Extract and validate module data
    const modules = extractModuleData(workshopSession);
    if (!modules) {
      console.error('Failed to extract valid module data');
      return null;
    }

    return {
      session: sessionData,
      modules,
      validation: validationResult
    };

  } catch (error) {
    console.error('Data extraction failed:', error);
    return null;
  }
}

// ============================================================================
// Module Data Extraction
// ============================================================================

/**
 * Extract and type-cast module data from workshop session
 */
function extractModuleData(workshopSession: WorkshopSession): WorkshopDataExtract['modules'] | null {
  try {
    // Extract each module with proper typing
    const intake = extractModuleOutput<PartialIntakeOutput>(
      workshopSession, 'gz-intake'
    );
    if (!intake) return null;

    const geschaeftsmodell = extractModuleOutput<PartialGeschaeftsmodellOutput>(
      workshopSession, 'gz-geschaeftsmodell'
    );
    if (!geschaeftsmodell) return null;

    const marktWettbewerb = extractModuleOutput<PartialMarktWettbewerbOutput>(
      workshopSession, 'gz-markt-wettbewerb'
    );
    if (!marktWettbewerb) return null;

    const marketing = extractModuleOutput<PartialMarketingOutput>(
      workshopSession, 'gz-marketing'
    );
    if (!marketing) return null;

    const finanzplanung = extractModuleOutput<PartialFinanzplanungOutput>(
      workshopSession, 'gz-finanzplanung'
    );
    if (!finanzplanung) return null;

    const unternehmen = extractModuleOutput<PartialUnternehmenOutput>(
      workshopSession, 'gz-unternehmen'
    );
    if (!unternehmen) return null;

    const swot = extractModuleOutput<PartialSWOTOutput>(
      workshopSession, 'gz-swot'
    );
    if (!swot) return null;

    const meilensteine = extractModuleOutput<PartialMeilensteineOutput>(
      workshopSession, 'gz-meilensteine'
    );
    if (!meilensteine) return null;

    const kpi = extractModuleOutput<PartialKPIOutput>(
      workshopSession, 'gz-kpi'
    );
    if (!kpi) return null;

    const zusammenfassung = extractModuleOutput<PartialZusammenfassungOutput>(
      workshopSession, 'gz-zusammenfassung'
    );
    if (!zusammenfassung) return null;

    return {
      intake,
      geschaeftsmodell,
      marktWettbewerb,
      marketing,
      finanzplanung,
      unternehmen,
      swot,
      meilensteine,
      kpi,
      zusammenfassung
    };

  } catch (error) {
    console.error('Module data extraction failed:', error);
    return null;
  }
}

/**
 * Extract and validate output data for a specific module
 */
function extractModuleOutput<T>(
  workshopSession: WorkshopSession,
  moduleId: string
): T | null {
  const module = workshopSession.modules[moduleId];

  if (!module) {
    console.error(`Module ${moduleId} not found in session`);
    return null;
  }

  if (module.status !== 'completed') {
    console.error(`Module ${moduleId} not completed: ${module.status}`);
    return null;
  }

  if (!module.data) {
    console.error(`Module ${moduleId} has no output data`);
    return null;
  }

  // Basic validation that data is an object
  if (typeof module.data !== 'object') {
    console.error(`Module ${moduleId} data is not an object:`, typeof module.data);
    return null;
  }

  // Type-cast to expected module output type
  // TODO: Add runtime validation with Zod schemas for each module type
  return module.data as T;
}

// ============================================================================
// Validation Helpers
// ============================================================================

/**
 * Check if workshop session is complete and ready for export
 */
function isSessionComplete(workshopSession: WorkshopSession): boolean {
  // Must be completed status
  if (workshopSession.status !== 'completed') {
    return false;
  }

  // All required modules must be completed
  for (const moduleId of REQUIRED_MODULES) {
    const module = workshopSession.modules[moduleId];
    if (!module || module.status !== 'completed' || !module.data) {
      console.error(`Required module ${moduleId} incomplete:`, {
        exists: !!module,
        status: module?.status,
        hasData: !!module?.data
      });
      return false;
    }
  }

  return true;
}

/**
 * Get completion status for each required module
 */
export function getModuleCompletionStatus(workshopSession: WorkshopSession): {
  [moduleId: string]: {
    isCompleted: boolean;
    hasData: boolean;
    status: string;
    lastUpdated?: string;
  }
} {
  const status: Record<string, any> = {};

  for (const moduleId of REQUIRED_MODULES) {
    const module = workshopSession.modules[moduleId];
    status[moduleId] = {
      isCompleted: module?.status === 'completed',
      hasData: !!module?.data,
      status: module?.status || 'not_started',
      lastUpdated: module?.completedAt
    };
  }

  return status;
}

/**
 * Validate that extracted module data meets minimum requirements
 */
export function validateModuleDataCompleteness(
  moduleData: WorkshopDataExtract['modules']
): {
  isValid: boolean;
  missingFields: string[];
  warnings: string[];
} {
  const missingFields: string[] = [];
  const warnings: string[] = [];

  // Critical fields that must be present for BA compliance
  const criticalFields = [
    // Intake
    { module: 'intake', field: 'gruender.grunddaten.name', path: moduleData.intake?.gruender?.grunddaten?.name },
    { module: 'intake', field: 'geschaeftsidee.produktDienstleistung', path: moduleData.intake?.geschaeftsidee?.produktDienstleistung },

    // Geschäftsmodell
    { module: 'geschaeftsmodell', field: 'geschaeftsmodell.beschreibung', path: moduleData.geschaeftsmodell?.geschaeftsmodell?.beschreibung },
    { module: 'geschaeftsmodell', field: 'alleinstellungsmerkmal.merkmale', path: moduleData.geschaeftsmodell?.alleinstellungsmerkmal?.merkmale },

    // Finanzplanung (critical for BA)
    { module: 'finanzplanung', field: 'umsatzplanung', path: moduleData.finanzplanung?.umsatzplanung },
    { module: 'finanzplanung', field: 'kostenplanung', path: moduleData.finanzplanung?.kostenplanung },
    { module: 'finanzplanung', field: 'liquiditaetsplanung', path: moduleData.finanzplanung?.liquiditaetsplanung }
  ];

  for (const field of criticalFields) {
    if (!field.path) {
      missingFields.push(`${field.module}.${field.field}`);
    }
  }

  // Warning for optional but recommended fields
  const recommendedFields = [
    { module: 'marketing', field: 'marketingmassnahmen', path: moduleData.marketing?.marketingmassnahmen },
    { module: 'swot', field: 'staerken', path: moduleData.swot?.staerken },
    { module: 'meilensteine', field: 'meilensteine', path: moduleData.meilensteine?.meilensteine }
  ];

  for (const field of recommendedFields) {
    if (!field.path) {
      warnings.push(`Empfohlenes Feld fehlt: ${field.module}.${field.field}`);
    }
  }

  return {
    isValid: missingFields.length === 0,
    missingFields,
    warnings
  };
}

/**
 * Get summary statistics about extracted data
 */
export function getDataExtractionSummary(
  moduleData: WorkshopDataExtract['modules']
): {
  totalFields: number;
  populatedFields: number;
  completionPercentage: number;
  moduleStats: Record<string, { fields: number; populated: number }>;
} {
  let totalFields = 0;
  let populatedFields = 0;
  const moduleStats: Record<string, { fields: number; populated: number }> = {};

  // Count fields for each module
  for (const [moduleName, data] of Object.entries(moduleData)) {
    const stats = countObjectFields(data);
    moduleStats[moduleName] = stats;
    totalFields += stats.fields;
    populatedFields += stats.populated;
  }

  return {
    totalFields,
    populatedFields,
    completionPercentage: totalFields > 0 ? Math.round((populatedFields / totalFields) * 100) : 0,
    moduleStats
  };
}

/**
 * Recursively count fields in an object
 */
function countObjectFields(obj: any, depth = 0, maxDepth = 3): { fields: number; populated: number } {
  if (depth > maxDepth || !obj || typeof obj !== 'object') {
    return { fields: 0, populated: 0 };
  }

  let fields = 0;
  let populated = 0;

  for (const [key, value] of Object.entries(obj)) {
    fields++;

    if (value != null && value !== '' && value !== undefined) {
      if (typeof value === 'object') {
        const subStats = countObjectFields(value, depth + 1, maxDepth);
        fields += subStats.fields;
        populated += subStats.populated;
      } else {
        populated++;
      }
    }
  }

  return { fields, populated };
}