/**
 * Cross-Module Consistency Validator (GZ-802)
 *
 * Validates consistency across different workshop modules to detect logical
 * inconsistencies that could undermine business plan credibility.
 *
 * Key checks:
 * - Target audience alignment between Geschäftsidee and Marketing
 * - Price consistency between solution concepts and financial planning
 * - Personnel capacity vs revenue targets alignment
 * - Timeline alignment between Meilensteine and Finanzplanung
 * - Cost completeness between Organisation and Kapitalbedarf
 *
 * Integration: Called after significant module updates and before export
 */

import Decimal from 'decimal.js';
import type { WorkshopSession } from '@/types/workshop-session';
import type { PartialGeschaeftsideeOutput } from '@/types/modules/geschaeftsidee';
import type { PartialMarketingOutput } from '@/types/modules/marketing';
import type { PartialFinanzplanungOutput } from '@/types/modules/finanzplanung';
import type { PartialOrganisationOutput } from '@/types/modules/organisation';
import type { PartialMeilensteineOutput } from '@/types/modules/meilensteine';

// ============================================================================
// Types and Interfaces
// ============================================================================

export interface Inconsistency {
  id: string;
  type: 'target_audience' | 'pricing' | 'capacity' | 'timeline' | 'costs';
  severity: 'critical' | 'high' | 'medium' | 'low';
  modules: string[];                    // Which modules are involved
  description: string;                  // What the inconsistency is
  impact: string;                       // Why this matters for BA compliance
  detectedValues: Record<string, any>;  // The conflicting values
  suggestions: string[];                // How to resolve it
}

export interface ConsistencyCheckResult {
  inconsistencies: Inconsistency[];
  overallScore: number;                 // 0-100, higher = more consistent
  criticalIssues: number;
  readyForExport: boolean;
}

// ============================================================================
// Configuration
// ============================================================================

// Set decimal.js precision for financial calculations
Decimal.set({
  precision: 28,
  rounding: Decimal.ROUND_HALF_UP,
  toExpNeg: -28,
  toExpPos: 28,
});

// Tolerance thresholds for fuzzy matching
const TOLERANCE_THRESHOLDS = {
  priceVariation: 0.2,          // ±20% price variation acceptable
  capacityUtilization: 0.85,    // 85% max utilization realistic
  timelineSlack: 30,            // 30 days timeline tolerance
  costCompleteness: 0.8,        // 80% cost coverage expected
};

// Critical keywords for target audience matching
const TARGET_AUDIENCE_KEYWORDS = {
  // Demographic markers
  age: ['jung', 'alt', 'teen', 'senior', 'erwachsen', 'kindern'],
  income: ['gutverdiener', 'einkommensstark', 'budget', 'premium', 'luxus'],
  profession: ['unternehmer', 'manager', 'entwickler', 'berater', 'student'],
  business: ['startup', 'mittelstand', 'konzern', 'kleinbetrieb', 'freiberufler'],
  // Geographic markers
  location: ['lokal', 'regional', 'deutschland', 'europa', 'international', 'berlin', 'münchen'],
  // Behavioral markers
  behavior: ['digital', 'traditional', 'innovativ', 'konservativ', 'early adopter'],
};

// ============================================================================
// Main Functions
// ============================================================================

/**
 * Detect all inconsistencies across workshop modules
 */
export function detectInconsistencies(workshopState: WorkshopSession): Inconsistency[] {
  const inconsistencies: Inconsistency[] = [];

  // Extract module data
  const geschaeftsidee = workshopState.modules['gz-geschaeftsidee']?.data as PartialGeschaeftsideeOutput;
  const marketing = workshopState.modules['gz-marketing']?.data as PartialMarketingOutput;
  const finanzplanung = workshopState.modules['gz-finanzplanung']?.data as PartialFinanzplanungOutput;
  const organisation = workshopState.modules['gz-organisation']?.data as PartialOrganisationOutput;
  const meilensteine = workshopState.modules['gz-meilensteine']?.data as PartialMeilensteineOutput;

  // Only run checks where we have sufficient data
  if (geschaeftsidee && marketing) {
    const audienceInconsistencies = checkTargetAudienceAlignment(geschaeftsidee, marketing);
    inconsistencies.push(...audienceInconsistencies);
  }

  if (geschaeftsidee && finanzplanung) {
    const pricingInconsistencies = checkPricingConsistency(geschaeftsidee, finanzplanung);
    inconsistencies.push(...pricingInconsistencies);
  }

  if (organisation && finanzplanung) {
    const capacityInconsistencies = checkPersonnelCapacityAlignment(organisation, finanzplanung);
    inconsistencies.push(...capacityInconsistencies);
  }

  if (meilensteine && finanzplanung) {
    const timelineInconsistencies = checkTimelineAlignment(meilensteine, finanzplanung);
    inconsistencies.push(...timelineInconsistencies);
  }

  if (organisation && finanzplanung) {
    const costInconsistencies = checkOrganisationCostsCompleteness(organisation, finanzplanung);
    inconsistencies.push(...costInconsistencies);
  }

  return inconsistencies.sort((a, b) => {
    const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    return severityOrder[a.severity] - severityOrder[b.severity];
  });
}

/**
 * Generate correction prompt for specific inconsistency
 */
export function getCorrectionPrompt(inconsistency: Inconsistency): string {
  const basePrompts = {
    target_audience: `Ich sehe eine Unstimmigkeit bei deiner Zielgruppe. In ${inconsistency.modules[0]} beschreibst du sie anders als in ${inconsistency.modules[1]}. Lass uns das klären: ${inconsistency.description}`,
    pricing: `Deine Preisgestaltung ist nicht konsistent zwischen den Modulen. ${inconsistency.description} Welche Preise sind richtig, und sollten wir die anderen anpassen?`,
    capacity: `Es gibt einen Widerspruch zwischen deinen Kapazitäten und Umsatzzielen. ${inconsistency.description} Wie können wir das realistisch auflösen?`,
    timeline: `Die Zeitpläne zwischen Meilensteinen und Finanzplanung passen nicht zusammen. ${inconsistency.description} Welcher Zeitplan ist realistischer?`,
    costs: `In der Kostenplanung fehlen Posten, die du in der Organisation erwähnt hast. ${inconsistency.description} Sollten wir diese Kosten ergänzen?`,
  };

  const basePrompt = basePrompts[inconsistency.type];
  const suggestions = inconsistency.suggestions.length > 0
    ? ` Mögliche Lösungen: ${inconsistency.suggestions.slice(0, 2).join(' oder ')}.`
    : '';

  return basePrompt + suggestions;
}

/**
 * Calculate overall consistency score and readiness for export
 */
export function assessOverallConsistency(inconsistencies: Inconsistency[]): ConsistencyCheckResult {
  const criticalCount = inconsistencies.filter(i => i.severity === 'critical').length;
  const highCount = inconsistencies.filter(i => i.severity === 'high').length;
  const mediumCount = inconsistencies.filter(i => i.severity === 'medium').length;
  const lowCount = inconsistencies.filter(i => i.severity === 'low').length;

  // Score deductions based on severity
  let score = 100;
  score -= criticalCount * 25;  // Critical issues: -25 points each
  score -= highCount * 15;      // High issues: -15 points each
  score -= mediumCount * 8;     // Medium issues: -8 points each
  score -= lowCount * 3;        // Low issues: -3 points each

  const overallScore = Math.max(0, score);

  // Export readiness: no critical issues, max 2 high issues
  const readyForExport = criticalCount === 0 && highCount <= 2;

  return {
    inconsistencies,
    overallScore,
    criticalIssues: criticalCount,
    readyForExport,
  };
}

// ============================================================================
// Specific Consistency Checks
// ============================================================================

/**
 * Check 1: Target audience alignment between Geschäftsidee and Marketing
 */
function checkTargetAudienceAlignment(
  geschaeftsidee: PartialGeschaeftsideeOutput,
  marketing: PartialMarketingOutput
): Inconsistency[] {
  const inconsistencies: Inconsistency[] = [];

  const ideaTargetAudience = geschaeftsidee.targetAudience?.primaryGroup;
  const marketingTargetAudience = marketing.strategie?.targetAudienceReach;

  if (!ideaTargetAudience || !marketingTargetAudience) {
    return inconsistencies; // Can't check if data missing
  }

  // Extract keywords from both descriptions
  const ideaKeywords = extractTargetAudienceKeywords(ideaTargetAudience);
  const marketingKeywords = extractTargetAudienceKeywords(marketingTargetAudience);

  // Calculate similarity score
  const similarity = calculateKeywordSimilarity(ideaKeywords, marketingKeywords);

  // Flag if similarity is too low (less than 50% overlap)
  if (similarity < 0.5) {
    inconsistencies.push({
      id: 'target_audience_mismatch',
      type: 'target_audience',
      severity: 'high',
      modules: ['gz-geschaeftsidee', 'gz-marketing'],
      description: `Zielgruppe in Geschäftsidee ("${ideaTargetAudience}") unterscheidet sich deutlich von Marketing-Zielgruppe ("${marketingTargetAudience}").`,
      impact: 'Inkonsistente Zielgruppenansprache schwächt die Glaubwürdigkeit des Businessplans und verwirrt potentielle Investoren.',
      detectedValues: {
        geschaeftsidee_target: ideaTargetAudience,
        marketing_target: marketingTargetAudience,
        similarity_score: similarity,
      },
      suggestions: [
        'Angleichung der Zielgruppenbeschreibung in beiden Modulen',
        'Verfeinerung der Marketing-Strategie basierend auf der ursprünglichen Geschäftsidee',
        'Überprüfung, ob sich die Zielgruppe während der Ausarbeitung entwickelt hat',
      ],
    });
  }

  return inconsistencies;
}

/**
 * Check 2: Price consistency between Geschäftsidee and Finanzplanung
 */
function checkPricingConsistency(
  geschaeftsidee: PartialGeschaeftsideeOutput,
  finanzplanung: PartialFinanzplanungOutput
): Inconsistency[] {
  const inconsistencies: Inconsistency[] = [];

  // Extract pricing hints from Geschäftsidee USP
  const uspText = geschaeftsidee.usp?.proposition;
  const revenueStreams = finanzplanung.umsatzplanung?.umsatzstroeme;

  if (!uspText || !revenueStreams || revenueStreams.length === 0) {
    return inconsistencies; // Can't check without data
  }

  // Check for pricing keywords in USP
  const pricingMentions = extractPricingMentions(uspText);

  if (pricingMentions.length > 0) {
    // Compare with actual pricing in Finanzplanung
    const actualPrices = revenueStreams.map(stream => ({
      service: stream.name,
      price: stream.preis,
      unit: stream.einheit,
    }));

    // Check for major discrepancies
    for (const mention of pricingMentions) {
      const matchingStream = findMatchingRevenueStream(mention, actualPrices);

      if (matchingStream) {
        const priceDecimal = new Decimal(matchingStream.price);
        const mentionDecimal = new Decimal(mention.value);
        const difference = priceDecimal.minus(mentionDecimal).abs();
        const percentageDiff = difference.dividedBy(mentionDecimal);

        if (percentageDiff.toNumber() > TOLERANCE_THRESHOLDS.priceVariation) {
          inconsistencies.push({
            id: `pricing_mismatch_${matchingStream.service}`,
            type: 'pricing',
            severity: 'medium',
            modules: ['gz-geschaeftsidee', 'gz-finanzplanung'],
            description: `Preis für "${matchingStream.service}" in USP (${formatEUR(mention.value)}) weicht stark von Finanzplanung (${formatEUR(matchingStream.price)}) ab.`,
            impact: 'Preisinkonsistenzen können Zweifel an der Sorgfalt der Planung aufkommen lassen.',
            detectedValues: {
              usp_price: mention.value,
              financial_price: matchingStream.price,
              difference_percent: Math.round(percentageDiff.toNumber() * 100),
            },
            suggestions: [
              'Aktualisierung der USP-Beschreibung basierend auf finaler Preisgestaltung',
              'Überprüfung der Kalkulation in der Finanzplanung',
              'Präzisierung der Preispositionierung im Wertversprechen',
            ],
          });
        }
      }
    }
  }

  return inconsistencies;
}

/**
 * Check 3: Personnel capacity vs revenue targets alignment
 */
function checkPersonnelCapacityAlignment(
  organisation: PartialOrganisationOutput,
  finanzplanung: PartialFinanzplanungOutput
): Inconsistency[] {
  const inconsistencies: Inconsistency[] = [];

  const teamMembers = organisation.teamStruktur?.teamMembers;
  const capacity = organisation.kapazitaeten?.currentCapacity;
  const revenueTargets = finanzplanung.umsatzplanung;

  if (!teamMembers || !capacity || !revenueTargets) {
    return inconsistencies;
  }

  // Calculate total team capacity
  const totalWeeklyHours = calculateTeamCapacity(teamMembers, capacity);
  const totalAnnualHours = totalWeeklyHours * 52;

  // Calculate required hours for revenue targets
  const requiredHours = calculateRequiredHours(revenueTargets);

  if (requiredHours > 0 && totalAnnualHours > 0) {
    const utilizationRate = requiredHours / totalAnnualHours;

    // Flag if utilization exceeds realistic thresholds
    if (utilizationRate > TOLERANCE_THRESHOLDS.capacityUtilization) {
      const severity = utilizationRate > 1.0 ? 'critical' : 'high';

      inconsistencies.push({
        id: 'capacity_overload',
        type: 'capacity',
        severity,
        modules: ['gz-organisation', 'gz-finanzplanung'],
        description: `Umsatzziele erfordern ${Math.round(utilizationRate * 100)}% Kapazitätsauslastung des Teams (${Math.round(requiredHours)} von ${Math.round(totalAnnualHours)} Stunden/Jahr).`,
        impact: utilizationRate > 1.0
          ? 'Mathematisch unmöglich - mehr Stunden erforderlich als verfügbar.'
          : 'Unrealistisch hohe Auslastung gefährdet Qualität und Work-Life-Balance.',
        detectedValues: {
          total_team_hours: Math.round(totalAnnualHours),
          required_hours: Math.round(requiredHours),
          utilization_percent: Math.round(utilizationRate * 100),
          max_sustainable_percent: Math.round(TOLERANCE_THRESHOLDS.capacityUtilization * 100),
        },
        suggestions: [
          'Reduzierung der Umsatzziele auf realistisches Niveau',
          'Erweiterung des Teams um zusätzliche Kapazitäten',
          'Erhöhung der Preise zur Kompensation geringerer Stunden',
          'Automatisierung/Effizienzsteigerung zur Produktivitätssteigerung',
        ],
      });
    }
  }

  return inconsistencies;
}

/**
 * Check 4: Timeline alignment between Meilensteine and Finanzplanung
 */
function checkTimelineAlignment(
  meilensteine: PartialMeilensteineOutput,
  finanzplanung: PartialFinanzplanungOutput
): Inconsistency[] {
  const inconsistencies: Inconsistency[] = [];

  const breakEvenMonth = finanzplanung.rentabilitaet?.breakEvenMonat;
  const firstCustomerDate = meilensteine.gruendung?.firstCustomerTarget;
  const launchDate = meilensteine.vorbereitung?.launchDate;

  // Check break-even vs first customer timeline
  if (breakEvenMonth && firstCustomerDate && launchDate) {
    const launchDateTime = new Date(launchDate).getTime();
    const firstCustomerTime = new Date(firstCustomerDate).getTime();
    const breakEvenTime = launchDateTime + (breakEvenMonth * 30 * 24 * 60 * 60 * 1000); // Approximate months to ms

    const timeGapDays = (firstCustomerTime - launchDateTime) / (24 * 60 * 60 * 1000);
    const breakEvenGapDays = (breakEvenTime - launchDateTime) / (24 * 60 * 60 * 1000);

    // Flag if first customer comes much later than break-even would require
    if (timeGapDays > breakEvenGapDays + TOLERANCE_THRESHOLDS.timelineSlack) {
      inconsistencies.push({
        id: 'timeline_revenue_gap',
        type: 'timeline',
        severity: 'medium',
        modules: ['gz-meilensteine', 'gz-finanzplanung'],
        description: `Erster Kunde geplant für ${new Date(firstCustomerDate).toLocaleDateString('de-DE')}, aber Break-Even nach ${breakEvenMonth} Monaten ab Launch (${new Date(launchDate).toLocaleDateString('de-DE')}) erfordert frühere Umsätze.`,
        impact: 'Zeitliche Lücke zwischen ersten Umsätzen und Break-Even-Anforderungen gefährdet die Liquiditätsplanung.',
        detectedValues: {
          launch_date: launchDate,
          first_customer_date: firstCustomerDate,
          break_even_month: breakEvenMonth,
          gap_days: Math.round(timeGapDays - breakEvenGapDays),
        },
        suggestions: [
          'Beschleunigung der Kundenakquise vor dem Launch',
          'Anpassung der Break-Even-Kalkulation an realistische Kundengewinnungszeit',
          'Zusätzliche Marketing-Aktivitäten in der Vorbereitungsphase',
        ],
      });
    }
  }

  return inconsistencies;
}

/**
 * Check 5: Organisation costs coverage in Kapitalbedarf
 */
function checkOrganisationCostsCompleteness(
  organisation: PartialOrganisationOutput,
  finanzplanung: PartialFinanzplanungOutput
): Inconsistency[] {
  const inconsistencies: Inconsistency[] = [];

  const teamMembers = organisation.teamStruktur?.teamMembers;
  const outsourcingDecisions = organisation.outsourcing;
  const kapitalbedarf = finanzplanung.kapitalbedarf;
  const kostenplanung = finanzplanung.kostenplanung;

  if (!teamMembers || !kapitalbedarf || !kostenplanung) {
    return inconsistencies;
  }

  const missingCosts: string[] = [];

  // Check if team member salaries are reflected in costs
  const teamWithSalaries = teamMembers.filter(member =>
    member.salary && member.salary > 0 && member.role !== 'founder'
  );

  if (teamWithSalaries.length > 0) {
    const totalMonthlySalaries = teamWithSalaries.reduce((sum, member) =>
      sum + (member.salary || 0), 0
    );

    // Check if personnel costs in Kostenplanung cover this
    const personnelCosts = kostenplanung.fixkosten?.filter(cost =>
      cost.kategorie === 'personal'
    ) || [];

    const totalPersonnelCosts = personnelCosts.reduce((sum, cost) =>
      sum + cost.betragMonatlich, 0
    );

    const costDecimal = new Decimal(totalPersonnelCosts);
    const salaryDecimal = new Decimal(totalMonthlySalaries);
    const coverage = totalPersonnelCosts > 0 ? costDecimal.dividedBy(salaryDecimal) : new Decimal(0);

    if (coverage.toNumber() < TOLERANCE_THRESHOLDS.costCompleteness) {
      missingCosts.push(`Personalkosten unterrepräsentiert: Geplant ${formatEUR(totalPersonnelCosts)}/Monat, aber ${formatEUR(totalMonthlySalaries)}/Monat in Organisation definiert`);
    }
  }

  // Check outsourcing decisions vs costs
  const outsourcedActivities = outsourcingDecisions?.filter(decision =>
    decision.decision === 'outsource' && decision.estimatedCost && decision.estimatedCost > 0
  ) || [];

  if (outsourcedActivities.length > 0) {
    const totalOutsourcingCosts = outsourcedActivities.reduce((sum, activity) =>
      sum + (activity.estimatedCost || 0), 0
    );

    // Check if this is reflected in variable or fixed costs
    const allCosts = [
      ...(kostenplanung.fixkosten || []),
      ...(kostenplanung.variableKosten || [])
    ];

    const outsourcingCostItems = allCosts.filter(cost =>
      cost.name.toLowerCase().includes('outsourcing') ||
      cost.name.toLowerCase().includes('extern') ||
      cost.name.toLowerCase().includes('dienstleister')
    );

    const totalOutsourcingInPlan = outsourcingCostItems.reduce((sum, cost) =>
      sum + cost.betragMonatlich, 0
    );

    if (totalOutsourcingInPlan < totalOutsourcingCosts * 0.8) {
      missingCosts.push(`Outsourcing-Kosten fehlen: ${formatEUR(totalOutsourcingCosts)}/Monat geplant, aber nur ${formatEUR(totalOutsourcingInPlan)}/Monat budgetiert`);
    }
  }

  if (missingCosts.length > 0) {
    inconsistencies.push({
      id: 'missing_organisation_costs',
      type: 'costs',
      severity: 'high',
      modules: ['gz-organisation', 'gz-finanzplanung'],
      description: `Kosten aus der Organisationsplanung sind nicht vollständig in der Finanzplanung erfasst.`,
      impact: 'Unvollständige Kostenerfassung führt zu unrealistischen Gewinnprognosen und Liquiditätsproblemen.',
      detectedValues: {
        missing_cost_details: missingCosts,
      },
      suggestions: [
        'Ergänzung der fehlenden Kostenpositionen in der Finanzplanung',
        'Überprüfung aller Organisationskosten auf Vollständigkeit',
        'Abstimmung zwischen Team-Planung und Budget-Planung',
      ],
    });
  }

  return inconsistencies;
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Extract target audience keywords for similarity matching
 */
function extractTargetAudienceKeywords(text: string): string[] {
  const lowerText = text.toLowerCase();
  const keywords: string[] = [];

  // Check each category for keyword matches
  Object.values(TARGET_AUDIENCE_KEYWORDS).forEach(categoryKeywords => {
    categoryKeywords.forEach(keyword => {
      if (lowerText.includes(keyword)) {
        keywords.push(keyword);
      }
    });
  });

  return [...new Set(keywords)]; // Remove duplicates
}

/**
 * Calculate similarity between two keyword arrays
 */
function calculateKeywordSimilarity(keywords1: string[], keywords2: string[]): number {
  if (keywords1.length === 0 && keywords2.length === 0) return 1.0;
  if (keywords1.length === 0 || keywords2.length === 0) return 0.0;

  const set1 = new Set(keywords1);
  const set2 = new Set(keywords2);
  const intersection = new Set([...set1].filter(x => set2.has(x)));
  const union = new Set([...set1, ...set2]);

  return intersection.size / union.size;
}

/**
 * Extract pricing mentions from USP text
 */
function extractPricingMentions(text: string): Array<{ type: string; value: number; context: string }> {
  const mentions: Array<{ type: string; value: number; context: string }> = [];

  // EUR patterns
  const eurPattern = /(\d+(?:\.\d{3})*(?:,\d{2})?)\s*€/g;
  let match;

  while ((match = eurPattern.exec(text)) !== null) {
    const value = parseGermanNumber(match[1]);
    if (!isNaN(value)) {
      mentions.push({
        type: 'currency',
        value,
        context: match[0],
      });
    }
  }

  return mentions;
}

/**
 * Find matching revenue stream for pricing mention
 */
function findMatchingRevenueStream(
  pricingMention: { type: string; value: number; context: string },
  revenueStreams: Array<{ service: string; price: number; unit: string }>
): { service: string; price: number; unit: string } | null {
  // Simple heuristic: find the stream with the closest price
  let closestMatch = null;
  let smallestDifference = Infinity;

  for (const stream of revenueStreams) {
    const difference = Math.abs(stream.price - pricingMention.value);
    if (difference < smallestDifference) {
      smallestDifference = difference;
      closestMatch = stream;
    }
  }

  // Only return if difference is within reasonable range (not arbitrary matching)
  if (closestMatch && smallestDifference < pricingMention.value * 0.5) {
    return closestMatch;
  }

  return null;
}

/**
 * Calculate total team capacity in hours per week
 */
function calculateTeamCapacity(
  teamMembers: Array<{ workingTime?: string; role?: string }>,
  capacity: { hoursPerWeek?: number }
): number {
  // Default hours per working time model
  const workingTimeHours: Record<string, number> = {
    'fulltime': 40,
    'parttime_30': 30,
    'parttime_20': 20,
    'parttime_10': 10,
    'project_based': 20, // Assume average
    'on_demand': 15,     // Assume average
  };

  let totalHours = capacity.hoursPerWeek || 0;

  // Add team member hours
  teamMembers.forEach(member => {
    if (member.workingTime && member.role !== 'founder') {
      totalHours += workingTimeHours[member.workingTime] || 20;
    }
  });

  return totalHours;
}

/**
 * Calculate required hours based on revenue targets and typical hourly rates
 */
function calculateRequiredHours(revenueTargets: any): number {
  if (!revenueTargets.umsatzstroeme) return 0;

  let totalHours = 0;

  revenueTargets.umsatzstroeme.forEach((stream: any) => {
    if (stream.einheit && stream.einheit.toLowerCase().includes('stund')) {
      // For hourly services, calculate directly
      const yearlyQuantity = stream.mengeJahr1?.reduce((sum: number, month: number) => sum + month, 0) || 0;
      totalHours += yearlyQuantity;
    } else {
      // For other services, estimate based on typical effort
      const revenue = stream.preis * (stream.mengeJahr2 || 0);
      const estimatedHourlyRate = 80; // Assume €80/hour average
      totalHours += revenue / estimatedHourlyRate;
    }
  });

  return totalHours;
}

/**
 * Parse German number format to JavaScript number
 */
function parseGermanNumber(germanNumber: string): number {
  // Handle German decimal format: 1.234,56 → 1234.56
  const normalized = germanNumber
    .replace(/\./g, '')  // Remove thousand separators
    .replace(/,/g, '.'); // Replace decimal comma with dot

  return parseFloat(normalized);
}

/**
 * Format currency in German EUR format
 */
function formatEUR(amount: number): string {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
  }).format(amount);
}

// ============================================================================
// Exports
// ============================================================================

export default {
  detectInconsistencies,
  getCorrectionPrompt,
  assessOverallConsistency,
  extractTargetAudienceKeywords,
  calculateKeywordSimilarity,
  parseGermanNumber,
  formatEUR,
  extractPricingMentions,
  findMatchingRevenueStream,
  calculateTeamCapacity,
  calculateRequiredHours,
};