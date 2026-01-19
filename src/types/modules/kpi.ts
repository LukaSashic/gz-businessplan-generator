/**
 * Module 09: KPI (Key Performance Indicators) Types
 *
 * Business metrics and success indicators for tracking.
 */

import { z } from 'zod';

// ============================================================================
// Enums
// ============================================================================

export const KPIPhase = z.enum([
  'financial',        // Phase 1: Financial KPIs
  'customer',         // Phase 2: Customer KPIs
  'operational',      // Phase 3: Operational KPIs
  'dashboard',        // Phase 4: Dashboard setup
  'completed',
]);

export type KPIPhase = z.infer<typeof KPIPhase>;

export const KPICategory = z.enum([
  'umsatz',           // Revenue
  'profitabilitaet',  // Profitability
  'liquiditaet',      // Liquidity
  'kundenakquise',    // Customer acquisition
  'kundenbindung',    // Customer retention
  'effizienz',        // Efficiency
  'qualitaet',        // Quality
  'wachstum',         // Growth
]);

export type KPICategory = z.infer<typeof KPICategory>;

export const KPIFrequency = z.enum([
  'daily',            // Täglich
  'weekly',           // Wöchentlich
  'monthly',          // Monatlich
  'quarterly',        // Quartalsweise
  'yearly',           // Jährlich
]);

export type KPIFrequency = z.infer<typeof KPIFrequency>;

export const KPITrendDirection = z.enum([
  'up_good',          // Higher is better (e.g., revenue)
  'down_good',        // Lower is better (e.g., costs)
  'target',           // Must hit specific target
]);

export type KPITrendDirection = z.infer<typeof KPITrendDirection>;

// ============================================================================
// Sub-Schemas
// ============================================================================

export const KPIDefinitionSchema = z.object({
  name: z.string(),
  description: z.string(),
  category: KPICategory,
  formula: z.string().optional(),         // How it's calculated
  unit: z.string(),                       // EUR, %, Anzahl, etc.
  frequency: KPIFrequency,
  trendDirection: KPITrendDirection,
  dataSource: z.string(),                 // Where data comes from
  responsible: z.string().optional(),     // Who tracks it
});

export type KPIDefinition = z.infer<typeof KPIDefinitionSchema>;

export const KPITargetSchema = z.object({
  kpiName: z.string(),
  targetJahr1: z.number(),
  targetJahr2: z.number(),
  targetJahr3: z.number(),
  minimumAcceptable: z.number().optional(),
  stretch: z.number().optional(),         // Ambitious target
  reasoning: z.string(),                  // Why these targets
});

export type KPITarget = z.infer<typeof KPITargetSchema>;

export const FinancialKPIsSchema = z.object({
  umsatz: z.object({
    definition: KPIDefinitionSchema,
    targets: KPITargetSchema,
  }),
  bruttoMarge: z.object({
    definition: KPIDefinitionSchema,
    targets: KPITargetSchema,
  }),
  cashflow: z.object({
    definition: KPIDefinitionSchema,
    targets: KPITargetSchema,
  }),
  additionalKPIs: z.array(z.object({
    definition: KPIDefinitionSchema,
    targets: KPITargetSchema,
  })).optional(),
});

export type FinancialKPIs = z.infer<typeof FinancialKPIsSchema>;

export const CustomerKPIsSchema = z.object({
  neukunden: z.object({
    definition: KPIDefinitionSchema,
    targets: KPITargetSchema,
  }),
  kundenakquisitionskosten: z.object({    // CAC
    definition: KPIDefinitionSchema,
    targets: KPITargetSchema,
  }),
  kundenwert: z.object({                  // CLV/LTV
    definition: KPIDefinitionSchema,
    targets: KPITargetSchema,
  }).optional(),
  churnRate: z.object({
    definition: KPIDefinitionSchema,
    targets: KPITargetSchema,
  }).optional(),
  nps: z.object({                         // Net Promoter Score
    definition: KPIDefinitionSchema,
    targets: KPITargetSchema,
  }).optional(),
  additionalKPIs: z.array(z.object({
    definition: KPIDefinitionSchema,
    targets: KPITargetSchema,
  })).optional(),
});

export type CustomerKPIs = z.infer<typeof CustomerKPIsSchema>;

export const OperationalKPIsSchema = z.object({
  auslastung: z.object({                  // Capacity utilization
    definition: KPIDefinitionSchema,
    targets: KPITargetSchema,
  }).optional(),
  durchlaufzeit: z.object({               // Processing time
    definition: KPIDefinitionSchema,
    targets: KPITargetSchema,
  }).optional(),
  qualitaetsquote: z.object({
    definition: KPIDefinitionSchema,
    targets: KPITargetSchema,
  }).optional(),
  additionalKPIs: z.array(z.object({
    definition: KPIDefinitionSchema,
    targets: KPITargetSchema,
  })).optional(),
});

export type OperationalKPIs = z.infer<typeof OperationalKPIsSchema>;

export const KPIDashboardSchema = z.object({
  primaryKPIs: z.array(z.string()).min(3).max(7), // Key KPIs to track
  reviewFrequency: KPIFrequency,
  trackingTool: z.string(),               // Excel, software, etc.
  reportingProcess: z.string(),           // How/when reviewed
  alertThresholds: z.array(z.object({
    kpiName: z.string(),
    warningThreshold: z.number(),
    criticalThreshold: z.number(),
  })).optional(),
});

export type KPIDashboard = z.infer<typeof KPIDashboardSchema>;

export const KPIValidationSchema = z.object({
  // Completeness
  hasFinancialKPIs: z.boolean(),
  hasCustomerKPIs: z.boolean(),
  hasOperationalKPIs: z.boolean(),
  hasDashboard: z.boolean(),

  // Quality
  targetsRealistic: z.boolean(),
  targetsAlignedWithFinanzplanung: z.boolean(),
  measurementPossible: z.boolean(),
  frequencyAppropriate: z.boolean(),

  blockers: z.array(z.string()),
  warnings: z.array(z.string()),
  readyForNextModule: z.boolean(),
});

export type KPIValidation = z.infer<typeof KPIValidationSchema>;

export const KPIMetadataSchema = z.object({
  completedAt: z.string().optional(),
  duration: z.number().optional(),
  currentPhase: KPIPhase.optional(),
  totalKPIs: z.number().optional(),
});

export type KPIMetadata = z.infer<typeof KPIMetadataSchema>;

// ============================================================================
// Main Output Schema
// ============================================================================

export const KPIOutputSchema = z.object({
  financial: FinancialKPIsSchema,
  customer: CustomerKPIsSchema,
  operational: OperationalKPIsSchema,
  dashboard: KPIDashboardSchema,
  validation: KPIValidationSchema,
  metadata: KPIMetadataSchema,
});

export type KPIOutput = z.infer<typeof KPIOutputSchema>;

export const PartialKPIOutputSchema = z.object({
  financial: FinancialKPIsSchema.deepPartial().optional(),
  customer: CustomerKPIsSchema.deepPartial().optional(),
  operational: OperationalKPIsSchema.deepPartial().optional(),
  dashboard: KPIDashboardSchema.deepPartial().optional(),
  validation: KPIValidationSchema.partial().optional(),
  metadata: KPIMetadataSchema.partial().optional(),
});

export type PartialKPIOutput = z.infer<typeof PartialKPIOutputSchema>;

// ============================================================================
// Helper Functions
// ============================================================================

export function createEmptyKPIOutput(): PartialKPIOutput {
  return {};
}

export function isKPIComplete(data: PartialKPIOutput): boolean {
  const hasFinancial = Boolean(
    data.financial?.umsatz?.definition?.name &&
    data.financial?.bruttoMarge?.definition?.name
  );
  const hasCustomer = Boolean(data.customer?.neukunden?.definition?.name);
  const hasDashboard = Boolean(data.dashboard?.primaryKPIs?.length);

  return hasFinancial && hasCustomer && hasDashboard;
}

/**
 * Get all KPI definitions flattened
 */
export function getAllKPIDefinitions(data: PartialKPIOutput): KPIDefinition[] {
  const definitions: KPIDefinition[] = [];

  // Financial
  if (data.financial?.umsatz?.definition) definitions.push(data.financial.umsatz.definition as KPIDefinition);
  if (data.financial?.bruttoMarge?.definition) definitions.push(data.financial.bruttoMarge.definition as KPIDefinition);
  if (data.financial?.cashflow?.definition) definitions.push(data.financial.cashflow.definition as KPIDefinition);
  if (data.financial?.additionalKPIs) {
    for (const kpi of data.financial.additionalKPIs) {
      if (kpi.definition) definitions.push(kpi.definition as KPIDefinition);
    }
  }

  // Customer
  if (data.customer?.neukunden?.definition) definitions.push(data.customer.neukunden.definition as KPIDefinition);
  if (data.customer?.kundenakquisitionskosten?.definition) definitions.push(data.customer.kundenakquisitionskosten.definition as KPIDefinition);
  if (data.customer?.kundenwert?.definition) definitions.push(data.customer.kundenwert.definition as KPIDefinition);
  if (data.customer?.churnRate?.definition) definitions.push(data.customer.churnRate.definition as KPIDefinition);
  if (data.customer?.nps?.definition) definitions.push(data.customer.nps.definition as KPIDefinition);

  // Operational
  if (data.operational?.auslastung?.definition) definitions.push(data.operational.auslastung.definition as KPIDefinition);
  if (data.operational?.durchlaufzeit?.definition) definitions.push(data.operational.durchlaufzeit.definition as KPIDefinition);
  if (data.operational?.qualitaetsquote?.definition) definitions.push(data.operational.qualitaetsquote.definition as KPIDefinition);

  return definitions;
}
