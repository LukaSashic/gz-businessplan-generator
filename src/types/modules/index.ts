/**
 * Module Types Barrel Export
 *
 * All 10 module output types for the GZ Businessplan Generator.
 */

// Module 00: Intake
export * from './intake';

// Module 01: Gründerperson
export * from './gruenderperson';

// Module 02: Geschäftsmodell
export * from './geschaeftsmodell';

// Module 03: Unternehmen
export * from './unternehmen';

// Module 04: Markt & Wettbewerb
export * from './markt-wettbewerb';

// Module 05: Marketing
export * from './marketing';

// Module 06: Finanzplanung
export * from './finanzplanung';

// Module 07: SWOT
export * from './swot';

// Module 08: Meilensteine
export * from './meilensteine';

// Module 09: KPI
export * from './kpi';

// Module 10: Zusammenfassung
export * from './zusammenfassung';

// Validation types
export * from './validation';

// ============================================================================
// Unified Module Data Types
// ============================================================================

import type { PartialIntakeOutput } from './intake';
import type { PartialGeschaeftsmodellOutput } from './geschaeftsmodell';
import type { PartialUnternehmenOutput } from './unternehmen';
import type { PartialMarktWettbewerbOutput } from './markt-wettbewerb';
import type { PartialMarketingOutput } from './marketing';
import type { PartialFinanzplanungOutput } from './finanzplanung';
import type { PartialSWOTOutput } from './swot';
import type { PartialMeilensteineOutput } from './meilensteine';
import type { PartialKPIOutput } from './kpi';
import type { PartialZusammenfassungOutput } from './zusammenfassung';

/**
 * Module ID type
 */
export type ModuleId =
  | 'gz-intake'
  | 'gz-geschaeftsmodell'
  | 'gz-unternehmen'
  | 'gz-markt-wettbewerb'
  | 'gz-marketing'
  | 'gz-finanzplanung'
  | 'gz-swot'
  | 'gz-meilensteine'
  | 'gz-kpi'
  | 'gz-zusammenfassung';

/**
 * Map of module IDs to their partial output types
 */
export interface ModuleDataMap {
  'gz-intake': PartialIntakeOutput;
  'gz-geschaeftsmodell': PartialGeschaeftsmodellOutput;
  'gz-unternehmen': PartialUnternehmenOutput;
  'gz-markt-wettbewerb': PartialMarktWettbewerbOutput;
  'gz-marketing': PartialMarketingOutput;
  'gz-finanzplanung': PartialFinanzplanungOutput;
  'gz-swot': PartialSWOTOutput;
  'gz-meilensteine': PartialMeilensteineOutput;
  'gz-kpi': PartialKPIOutput;
  'gz-zusammenfassung': PartialZusammenfassungOutput;
}

/**
 * Union type of all partial module outputs
 */
export type AnyModuleData =
  | PartialIntakeOutput
  | PartialGeschaeftsmodellOutput
  | PartialUnternehmenOutput
  | PartialMarktWettbewerbOutput
  | PartialMarketingOutput
  | PartialFinanzplanungOutput
  | PartialSWOTOutput
  | PartialMeilensteineOutput
  | PartialKPIOutput
  | PartialZusammenfassungOutput;

/**
 * Module metadata for UI and orchestration
 */
export interface ModuleInfo {
  id: ModuleId;
  name: string;
  description: string;
  estimatedDuration: number; // minutes
  dependencies: ModuleId[];
  order: number;
}

/**
 * All modules with their metadata
 */
export const MODULE_INFO: ModuleInfo[] = [
  {
    id: 'gz-intake',
    name: 'Intake & Assessment',
    description: 'Erfassung deiner Situation und Geschäftsidee',
    estimatedDuration: 45,
    dependencies: [],
    order: 1,
  },
  {
    id: 'gz-geschaeftsmodell',
    name: 'Geschäftsmodell',
    description: 'Angebot, Zielgruppe, Wertversprechen und USP',
    estimatedDuration: 70,
    dependencies: ['gz-intake'],
    order: 2,
  },
  {
    id: 'gz-unternehmen',
    name: 'Unternehmen',
    description: 'Rechtsform, Team, Standort und Organisation',
    estimatedDuration: 60,
    dependencies: ['gz-intake', 'gz-geschaeftsmodell'],
    order: 3,
  },
  {
    id: 'gz-markt-wettbewerb',
    name: 'Markt & Wettbewerb',
    description: 'Marktanalyse, Wettbewerber und Positionierung',
    estimatedDuration: 90,
    dependencies: ['gz-intake', 'gz-geschaeftsmodell', 'gz-unternehmen'],
    order: 4,
  },
  {
    id: 'gz-marketing',
    name: 'Marketing & Vertrieb',
    description: 'Marketingstrategie, Kanäle, Preise und Vertrieb',
    estimatedDuration: 90,
    dependencies: ['gz-intake', 'gz-geschaeftsmodell', 'gz-unternehmen', 'gz-markt-wettbewerb'],
    order: 5,
  },
  {
    id: 'gz-finanzplanung',
    name: 'Finanzplanung',
    description: 'Kapitalbedarf, Umsatz, Kosten, Rentabilität und Liquidität',
    estimatedDuration: 180,
    dependencies: ['gz-geschaeftsmodell', 'gz-unternehmen', 'gz-markt-wettbewerb', 'gz-marketing'],
    order: 6,
  },
  {
    id: 'gz-swot',
    name: 'SWOT-Analyse',
    description: 'Stärken, Schwächen, Chancen und Risiken',
    estimatedDuration: 45,
    dependencies: ['gz-intake', 'gz-geschaeftsmodell', 'gz-unternehmen', 'gz-markt-wettbewerb', 'gz-marketing', 'gz-finanzplanung'],
    order: 7,
  },
  {
    id: 'gz-meilensteine',
    name: 'Meilensteine',
    description: 'Zeitplan und wichtige Etappen für die ersten 3 Jahre',
    estimatedDuration: 45,
    dependencies: ['gz-intake', 'gz-geschaeftsmodell', 'gz-unternehmen', 'gz-markt-wettbewerb', 'gz-marketing', 'gz-finanzplanung', 'gz-swot'],
    order: 8,
  },
  {
    id: 'gz-kpi',
    name: 'KPIs',
    description: 'Kennzahlen zur Erfolgsmessung',
    estimatedDuration: 45,
    dependencies: ['gz-intake', 'gz-geschaeftsmodell', 'gz-unternehmen', 'gz-markt-wettbewerb', 'gz-marketing', 'gz-finanzplanung', 'gz-swot', 'gz-meilensteine'],
    order: 9,
  },
  {
    id: 'gz-zusammenfassung',
    name: 'Zusammenfassung',
    description: 'Executive Summary deines Businessplans',
    estimatedDuration: 30,
    dependencies: ['gz-intake', 'gz-geschaeftsmodell', 'gz-unternehmen', 'gz-markt-wettbewerb', 'gz-marketing', 'gz-finanzplanung', 'gz-swot', 'gz-meilensteine', 'gz-kpi'],
    order: 10,
  },
];

/**
 * Get module info by ID
 */
export function getModuleInfo(moduleId: ModuleId): ModuleInfo | undefined {
  return MODULE_INFO.find((m) => m.id === moduleId);
}

/**
 * Get modules that depend on a given module
 */
export function getDependentModules(moduleId: ModuleId): ModuleId[] {
  return MODULE_INFO
    .filter((m) => m.dependencies.includes(moduleId))
    .map((m) => m.id);
}

/**
 * Check if all dependencies for a module are complete
 */
export function areDependenciesComplete(
  moduleId: ModuleId,
  completedModules: ModuleId[]
): boolean {
  const info = getModuleInfo(moduleId);
  if (!info) return false;

  return info.dependencies.every((dep) => completedModules.includes(dep));
}
