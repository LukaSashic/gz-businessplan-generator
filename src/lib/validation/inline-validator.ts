/**
 * Inline Validation System (GZ-801)
 *
 * Real-time validation of user inputs during conversation to detect unrealistic
 * financial projections, capacity overloads, and market assumptions.
 *
 * Uses Socratic questioning approach rather than judgmental statements to guide
 * users toward realistic business plans that meet BA compliance standards.
 *
 * Integration point: Chat API route after user message, before Claude response
 */

import Decimal from 'decimal.js';

// ============================================================================
// Types and Interfaces
// ============================================================================

export interface InlineValidationPrompt {
  type: 'financial' | 'capacity' | 'market' | 'consistency';
  challenge: string;           // Socratic question, NOT statement
  priority: 'high' | 'medium' | 'low';
  reason: string;             // Why this was flagged (internal)
  context: ValidationContext;
}

export interface ValidationContext {
  currentModule: string;
  userInput: string;
  extractedNumbers: ExtractedNumber[];
  businessType?: string;
  previousModuleData?: Record<string, unknown>;
  conversationHistory?: Array<{ role: 'user' | 'assistant'; content: string }>;
}

export interface ExtractedNumber {
  type: 'currency' | 'percentage' | 'hours' | 'count' | 'growth_rate' | 'timeframe';
  value: number;
  unit?: string;
  context: string;           // Original text context
  confidence: number;        // 0-1 confidence in extraction
}

export interface ExtractedMetrics {
  revenue?: number[];        // Multi-year revenue projections
  costs?: number[];          // Cost breakdowns
  growth?: number[];         // Growth rates
  hours?: number;            // Time commitments
  team?: number;             // Team size
  capacity?: number;         // Service capacity
}

export interface OptimismPattern {
  pattern: string;           // Pattern name
  confidence: number;        // 0-1 confidence
  indicators: string[];      // Text indicators found
}

export interface BusinessTypeThresholds {
  maxUtilization?: number;
  maxHourlyRate?: number;
  minMarginWarning?: number;
  maxMarginWarning?: number;
  maxRentRatio?: number;
  minStaffRatio?: number;
  maxGrowthRate?: number;
  maxSinglePersonRevenue?: number;
}

// ============================================================================
// Configuration & Thresholds
// ============================================================================

// Set global decimal.js configuration for financial precision
Decimal.set({
  precision: 28,
  rounding: Decimal.ROUND_HALF_UP,
  toExpNeg: -28,
  toExpPos: 28,
});

const BUSINESS_TYPE_THRESHOLDS: Record<string, BusinessTypeThresholds> = {
  Beratung: {
    maxUtilization: 0.75,        // 75% max (buffer for admin/sales)
    maxHourlyRate: 250,          // €250/hour is realistic ceiling
    minMarginWarning: 0.4,       // 40% minimum margin
    maxGrowthRate: 0.5,          // 50% annual growth max
    maxSinglePersonRevenue: 300000, // €300k max for 1 person
  },
  'E-Commerce': {
    maxMarginWarning: 0.8,       // 80% margin unlikely
    minMarketingRatio: 0.1,      // 10% minimum for customer acquisition
    maxCOGS: 0.7,                // 70% max cost of goods sold
    maxGrowthRate: 1.0,          // 100% growth possible but high
  },
  Restaurant: {
    maxRentRatio: 0.1,           // 10% max rent vs revenue (CRITICAL)
    minStaffRatio: 0.3,          // 30% minimum staff costs
    maxFoodCostRatio: 0.35,      // 35% max food costs
    maxGrowthRate: 0.15,         // 15% max growth (local limits)
  },
  Handwerk: {
    maxUtilization: 0.8,         // 80% for trade work
    maxHourlyRate: 120,          // €120/hour realistic max
    maxGrowthRate: 0.25,         // 25% max growth
    maxSinglePersonRevenue: 200000, // €200k realistic for trades
  },
  SaaS: {
    maxGrowthRate: 1.5,          // 150% growth possible for software
    minMarginWarning: 0.6,       // 60% minimum for SaaS
    maxChurnRate: 0.05,          // 5% monthly churn max acceptable
    maxSinglePersonRevenue: 500000, // €500k possible for SaaS single founder
  },
  Freiberufler: {
    maxUtilization: 0.7,         // 70% max for work-life balance
    maxHourlyRate: 150,          // €150/hour realistic max
    maxSinglePersonRevenue: 120000, // €120k typical for freelancers
    maxGrowthRate: 0.3,          // 30% max growth
  },
  // Add defaults for other business types
  default: {
    maxUtilization: 0.8,
    maxHourlyRate: 200,
    maxGrowthRate: 0.5,
    maxSinglePersonRevenue: 250000,
    minMarginWarning: 0.3,
  },
};

const VALIDATION_THRESHOLDS = {
  financial: {
    maxAnnualGrowthRate: 1.5,        // 150% max annual growth
    minBusinessRevenue: 10000,        // €10k minimum for viability
    maxFirstYearRevenue: 500000,      // €500k ambitious for year 1
    hockeyStickThreshold: 1.0,        // 100% growth twice = hockey stick
    maxMarginRealistic: 0.9,          // 90% margin unrealistic most businesses
  },
  coaching: {
    maxValidationsPerModule: 3,       // Don't overwhelm user
    minTimeBetweenChallenges: 2,      // 2 exchanges minimum gap
    progressiveIntensity: true,       // Escalate concern level
  },
};

// Phrases that indicate estimation/brainstorming (avoid triggering validation)
const ESTIMATION_SIGNALS = [
  'ungefähr', 'etwa', 'schätzungsweise', 'grob', 'vielleicht',
  'könnte', 'würde', 'vermutlich', 'möglicherweise', 'circa',
  'ca.', 'rund', 'etwa', 'geschätzt', 'voraussichtlich'
];

// Phrases that indicate hypothetical scenarios (avoid triggering validation)
const HYPOTHETICAL_SIGNALS = [
  'wenn', 'falls', 'angenommen', 'stell dir vor', 'hypothetisch',
  'beispiel', 'zum beispiel', 'angenommen dass', 'was wäre wenn'
];

// Phrases that indicate user already acknowledged the challenge
const ACKNOWLEDGMENT_SIGNALS = [
  'ja stimmt', 'hast recht', 'übertrieben', 'zu optimistisch',
  'unrealistisch', 'schwierig', 'schwer zu schaffen', 'sehr ambitioniert',
  'da hast du recht', 'stimmt schon'
];

// ============================================================================
// Number Extraction Engine
// ============================================================================

/**
 * Extract financial numbers from German text
 */
export function extractFinancialNumbers(text: string): ExtractedNumber[] {
  const numbers: ExtractedNumber[] = [];

  // German EUR format patterns
  const patterns = [
    {
      regex: /(\d+(?:\.\d{3})*(?:,\d{2})?)\s*€/g,
      type: 'currency' as const,
      unit: 'EUR'
    },
    {
      regex: /€\s*(\d+(?:\.\d{3})*(?:,\d{2})?)/g,
      type: 'currency' as const,
      unit: 'EUR'
    },
    {
      regex: /(?:wachstum\s+(?:von\s+)?|growth\s+(?:of\s+)?)(\d+(?:,\d+)?)\s*%/gi,
      type: 'growth_rate' as const,
      unit: '%'
    },
    {
      regex: /(\d+(?:,\d+)?)\s*%\s+(?:wachstum|growth)/gi,
      type: 'growth_rate' as const,
      unit: '%'
    },
    {
      regex: /(\d+(?:,\d+)?)\s*(?:prozent|%)(?!\s*(?:wachstum|growth))/gi,
      type: 'percentage' as const,
      unit: '%'
    },
    {
      regex: /(\d+(?:,\d+)?)\s*stunden?\s?(?:pro|je|\/)\s?(?:woche|monat|tag)/gi,
      type: 'hours' as const,
      unit: 'Stunden'
    },
    {
      regex: /(?:manchmal|bis zu|maximal)\s+(\d+(?:,\d+)?)\s*stunden?/gi,
      type: 'hours' as const,
      unit: 'Stunden'
    },
    {
      regex: /(\d+(?:,\d+)?)\s*(?:mitarbeiter|personen?|leute)/gi,
      type: 'count' as const,
      unit: 'Personen'
    },
  ];

  patterns.forEach(pattern => {
    let match;
    while ((match = pattern.regex.exec(text)) !== null) {
      const rawValue = match[1];

      if (!rawValue) continue; // Skip if no capture group match

      const normalizedValue = parseGermanNumber(rawValue);

      if (!isNaN(normalizedValue) && normalizedValue > 0) {
        numbers.push({
          type: pattern.type,
          value: normalizedValue,
          unit: pattern.unit,
          context: match[0],
          confidence: 0.9,
        });
      }
    }
  });

  return numbers;
}

/**
 * Parse German number format to JavaScript number
 */
export function parseGermanNumber(germanNumber: string | undefined): number {
  if (!germanNumber || typeof germanNumber !== 'string') {
    return NaN;
  }

  // Handle German decimal format: 1.234,56 → 1234.56
  const normalized = germanNumber
    .replace(/\./g, '')  // Remove thousand separators
    .replace(/,/g, '.'); // Replace decimal comma with dot

  return parseFloat(normalized);
}

/**
 * Extract business metrics from user input
 */
export function extractBusinessMetrics(text: string): ExtractedMetrics {
  const numbers = extractFinancialNumbers(text);
  const metrics: ExtractedMetrics = {};

  // Extract revenue projections (multiple currency values)
  const revenueNumbers = numbers.filter(n => n.type === 'currency');
  if (revenueNumbers.length > 0) {
    metrics.revenue = revenueNumbers.map(n => n.value);
  }

  // Extract growth rates
  const growthNumbers = numbers.filter(n => n.type === 'growth_rate');
  if (growthNumbers.length > 0) {
    metrics.growth = growthNumbers.map(n => n.value / 100); // Convert percentage to decimal
  }

  // Extract time commitments
  const hourNumbers = numbers.filter(n => n.type === 'hours');
  if (hourNumbers.length > 0) {
    metrics.hours = Math.max(...hourNumbers.map(n => n.value));
  }

  // Extract team size
  const teamNumbers = numbers.filter(n => n.type === 'count');
  if (teamNumbers.length > 0) {
    metrics.team = Math.max(...teamNumbers.map(n => n.value));
  }

  return metrics;
}

// ============================================================================
// Pattern Detection
// ============================================================================

/**
 * Detect optimism patterns in user input
 */
export function detectOptimismPatterns(text: string): OptimismPattern[] {
  const patterns: OptimismPattern[] = [];
  const lowerText = text.toLowerCase();

  // Hockey stick growth pattern
  const hockeyStickIndicators = [
    'exponentiell', 'explosiv', 'drastisch', 'massiv',
    'verdoppel', 'verdreifach', 'vervielfach'
  ];

  const hockeyStickFound = hockeyStickIndicators.filter(indicator =>
    lowerText.includes(indicator)
  );

  if (hockeyStickFound.length > 0) {
    patterns.push({
      pattern: 'hockey_stick_growth',
      confidence: 0.8,
      indicators: hockeyStickFound,
    });
  }

  // No competition claims
  const noCompetitionIndicators = [
    'keine konkurrenz', 'kein wettbewerb', 'niemand macht das',
    'einzigartig', 'noch nie da gewesen', 'marktlücke'
  ];

  const noCompetitionFound = noCompetitionIndicators.filter(indicator =>
    lowerText.includes(indicator)
  );

  if (noCompetitionFound.length > 0) {
    patterns.push({
      pattern: 'no_competition',
      confidence: 0.7,
      indicators: noCompetitionFound,
    });
  }

  // Perfect pricing power
  const perfectPricingIndicators = [
    'premium preis', 'teurer verkaufen', 'kunden zahlen alles',
    'preissensitiv', 'egal was es kostet'
  ];

  const perfectPricingFound = perfectPricingIndicators.filter(indicator =>
    lowerText.includes(indicator)
  );

  if (perfectPricingFound.length > 0) {
    patterns.push({
      pattern: 'perfect_pricing',
      confidence: 0.6,
      indicators: perfectPricingFound,
    });
  }

  return patterns;
}

/**
 * Check if text contains estimation/hypothetical signals (avoid validation)
 */
export function isEstimationOrHypothetical(text: string): boolean {
  const lowerText = text.toLowerCase();

  const hasEstimation = ESTIMATION_SIGNALS.some(signal =>
    lowerText.includes(signal)
  );

  const hasHypothetical = HYPOTHETICAL_SIGNALS.some(signal =>
    lowerText.includes(signal)
  );

  return hasEstimation || hasHypothetical;
}

/**
 * Check if user has acknowledged previous challenges
 */
export function hasAcknowledgedChallenge(text: string): boolean {
  const lowerText = text.toLowerCase();

  return ACKNOWLEDGMENT_SIGNALS.some(signal =>
    lowerText.includes(signal)
  );
}

// ============================================================================
// Validation Functions
// ============================================================================

/**
 * Detect hockey stick revenue growth pattern
 */
export function detectHockeyStickGrowth(
  revenue: number[],
  businessType: string
): InlineValidationPrompt | null {
  if (revenue.length < 2) return null;

  const thresholds = BUSINESS_TYPE_THRESHOLDS[businessType] || BUSINESS_TYPE_THRESHOLDS.default;
  const maxGrowth = thresholds.maxGrowthRate || 0.5;

  // Calculate year-over-year growth rates
  const growthRates: number[] = [];
  for (let i = 1; i < revenue.length; i++) {
    if (revenue[i - 1] > 0) {
      const growthRate = (revenue[i] - revenue[i - 1]) / revenue[i - 1];
      growthRates.push(growthRate);
    }
  }

  // For 2 data points: check if single growth rate exceeds threshold
  // For 3+ data points: check for multiple consecutive high growth periods
  const highGrowthPeriods = growthRates.filter(rate => rate > maxGrowth).length;
  const shouldTrigger = revenue.length === 2 ? highGrowthPeriods >= 1 : highGrowthPeriods >= 2;

  if (shouldTrigger) {
    const avgGrowth = (growthRates.reduce((sum, rate) => sum + rate, 0) / growthRates.length) * 100;

    return {
      type: 'financial',
      challenge: `Du planst durchschnittlich ${avgGrowth.toFixed(1).replace('.', ',')}% Wachstum pro Jahr. Lass uns gemeinsam rechnen: Welche konkreten Maßnahmen würden ein solches Wachstum ermöglichen? Kennst du andere ${businessType}-Unternehmen mit ähnlichem Wachstum?`,
      priority: 'high',
      reason: `Hockey stick growth detected: ${growthRates.map(r => (r * 100).toFixed(1) + '%').join(', ')}`,
      context: {} as ValidationContext,
    };
  }

  return null;
}

/**
 * Detect single-person revenue overload
 */
export function detectSinglePersonOverload(
  revenue: number,
  teamSize: number,
  businessType: string = 'default'
): InlineValidationPrompt | null {
  if (teamSize !== 1) return null;

  const thresholds = BUSINESS_TYPE_THRESHOLDS[businessType] || BUSINESS_TYPE_THRESHOLDS.default;
  const maxRevenue = thresholds.maxSinglePersonRevenue || 250000;

  if (revenue > maxRevenue) {
    const revenueDecimal = new Decimal(revenue);
    const monthlyRevenue = revenueDecimal.dividedBy(12);
    const weeklyRevenue = revenueDecimal.dividedBy(52);

    return {
      type: 'capacity',
      challenge: `Bei ${formatEUR(revenue)} Jahresumsatz als Einzelperson wären das ${formatEUR(monthlyRevenue.toNumber())} pro Monat oder ${formatEUR(weeklyRevenue.toNumber())} pro Woche. Wie stellst du dir das konkret vor? Welche Stunden müsstest du arbeiten, und wie viel könntest du pro Stunde verlangen?`,
      priority: 'high',
      reason: `Single person revenue ${formatEUR(revenue)} exceeds realistic limit of ${formatEUR(maxRevenue)} for ${businessType}`,
      context: {} as ValidationContext,
    };
  }

  return null;
}

/**
 * Detect impossible utilization rates
 */
export function detectOverutilization(
  revenue: number,
  capacity: number,
  hourlyRate: number,
  businessType: string = 'default'
): InlineValidationPrompt | null {
  if (!capacity || !hourlyRate) return null;

  const thresholds = BUSINESS_TYPE_THRESHOLDS[businessType] || BUSINESS_TYPE_THRESHOLDS.default;
  const maxUtilization = thresholds.maxUtilization || 0.8;

  const revenueDecimal = new Decimal(revenue);
  const rateDecimal = new Decimal(hourlyRate);
  const capacityDecimal = new Decimal(capacity);

  const requiredHours = revenueDecimal.dividedBy(rateDecimal);
  const utilizationRate = requiredHours.dividedBy(capacityDecimal);

  if (utilizationRate.toNumber() > maxUtilization) {
    const utilizationPercent = utilizationRate.times(100);
    const maxUtilizationPercent = maxUtilization * 100;

    return {
      type: 'capacity',
      challenge: `Bei ${formatEUR(revenue)} Umsatz und ${formatEUR(hourlyRate)}/Stunde bräuchtest du ${requiredHours.toFixed(0)} Stunden im Jahr. Das wären ${utilizationPercent.toFixed(1).replace('.', ',')}% Auslastung. Realistisch sind meist nur ${maxUtilizationPercent.toFixed(0)}% für ${businessType}. Wie siehst du das?`,
      priority: 'medium',
      reason: `Utilization rate ${utilizationPercent.toFixed(1)}% exceeds realistic maximum of ${maxUtilizationPercent}%`,
      context: {} as ValidationContext,
    };
  }

  return null;
}

/**
 * Detect missing essential costs
 */
export function detectMissingEssentials(costs: Record<string, number>): InlineValidationPrompt | null {
  const essentialCategories = [
    'krankenversicherung', 'rentenversicherung', 'steuer',
    'büro', 'laptop', 'software', 'versicherung', 'buchhaltung'
  ];

  const mentionedCategories = Object.keys(costs)
    .map(key => key.toLowerCase())
    .join(' ');

  const missingEssentials = essentialCategories.filter(essential =>
    !mentionedCategories.includes(essential)
  );

  if (missingEssentials.length >= 4) { // More than 3 missing = likely oversight
    const missingExamples = missingEssentials.slice(0, 3).join(', ');

    return {
      type: 'financial',
      challenge: `Mir fällt auf, dass du Kosten wie ${missingExamples} nicht erwähnt hast. Sind die bereits mit eingeplant, oder sollten wir die noch durchgehen? Was denkst du über diese "versteckten" Geschäftskosten?`,
      priority: 'medium',
      reason: `Missing essential cost categories: ${missingEssentials.join(', ')}`,
      context: {} as ValidationContext,
    };
  }

  return null;
}

/**
 * Detect unrealistically low total costs
 */
export function detectUnrealisticLowCosts(
  totalMonthlyCosts: number,
  businessType: string = 'default'
): InlineValidationPrompt | null {
  // Minimum monthly costs for running a business
  const minimumCosts: Record<string, number> = {
    'Beratung': 800,      // Home office, minimal setup
    'Freiberufler': 600,   // Even lower for freelancers
    'Restaurant': 8000,    // High fixed costs
    'E-Commerce': 1200,    // Inventory, marketing
    'SaaS': 2000,         // Development, infrastructure
    'default': 1000,
  };

  const minCosts = minimumCosts[businessType] || minimumCosts.default;

  if (totalMonthlyCosts < minCosts) {
    return {
      type: 'financial',
      challenge: `Du planst mit ${formatEUR(totalMonthlyCosts)} monatlichen Kosten. Das erscheint mir sehr niedrig für ein ${businessType}-Unternehmen. Hast du Kosten wie Krankenversicherung, Steuern, Buchhaltung, Software schon mitgedacht? Lass uns das durchgehen.`,
      priority: 'medium',
      reason: `Monthly costs ${formatEUR(totalMonthlyCosts)} below realistic minimum of ${formatEUR(minCosts)} for ${businessType}`,
      context: {} as ValidationContext,
    };
  }

  return null;
}

/**
 * Detect costs that don't scale with revenue (scaling ignorance)
 */
export function detectScalingIgnorance(
  revenue: number[],
  costs: number[]
): InlineValidationPrompt | null {
  if (revenue.length !== costs.length || revenue.length < 2) return null;

  // Calculate revenue growth vs cost growth
  const revenueGrowth = (revenue[revenue.length - 1] - revenue[0]) / revenue[0];
  const costGrowth = (costs[costs.length - 1] - costs[0]) / costs[0];

  // If revenue grows significantly but costs stay flat, that's unrealistic
  if (revenueGrowth > 0.3 && costGrowth < 0.1) {
    return {
      type: 'consistency',
      challenge: `Deine Umsätze wachsen um ${(revenueGrowth * 100).toFixed(1).replace('.', ',')}%, aber die Kosten bleiben fast gleich. Welche Kosten werden mit dem Wachstum steigen? Denkst du an mehr Personal, größere Büros, höhere Materialkosten?`,
      priority: 'medium',
      reason: `Revenue growth ${(revenueGrowth * 100).toFixed(1)}% vs cost growth ${(costGrowth * 100).toFixed(1)}%`,
      context: {} as ValidationContext,
    };
  }

  return null;
}

/**
 * Detect impossible time allocation
 */
export function detectTimeOverload(hoursRequired: number): InlineValidationPrompt | null {
  const maxSustainableHours = 60; // 60 hours/week is absolute maximum

  if (hoursRequired > maxSustainableHours) {
    return {
      type: 'capacity',
      challenge: `Du planst mit ${hoursRequired} Stunden pro Woche. Das ist langfristig sehr schwer durchzuhalten. Wie stellst du dir Work-Life-Balance vor? Gibt es Möglichkeiten, Prozesse zu automatisieren oder Aufgaben zu delegieren?`,
      priority: 'high',
      reason: `Time overload: ${hoursRequired} hours/week exceeds sustainable ${maxSustainableHours} hours`,
      context: {} as ValidationContext,
    };
  }

  return null;
}

/**
 * Detect "no competition" claims
 */
export function detectCompetitionBlindness(userInput: string): InlineValidationPrompt | null {
  const patterns = detectOptimismPatterns(userInput);
  const noCompetitionPattern = patterns.find(p => p.pattern === 'no_competition');

  if (noCompetitionPattern && noCompetitionPattern.confidence > 0.6) {
    return {
      type: 'market',
      challenge: `Du sagst, es gibt keine Konkurrenz. Das ist interessant - woran könnte das liegen? Wenn der Markt so lukrativ ist, warum ist noch niemand da? Welche indirekten Konkurrenten könnten deine Zielkunden bedienen?`,
      priority: 'medium',
      reason: `No competition claim detected with confidence ${noCompetitionPattern.confidence}`,
      context: {} as ValidationContext,
    };
  }

  return null;
}

// ============================================================================
// Main Validation Function
// ============================================================================

/**
 * Main inline validation function - analyzes user input and returns Socratic challenge if needed
 */
export function getInlineValidationPrompt(
  userInput: string,
  context: ValidationContext
): InlineValidationPrompt | null {
  // 1. Early exit conditions
  if (!userInput || userInput.length < 10) return null;

  if (isEstimationOrHypothetical(userInput)) return null;

  if (hasAcknowledgedChallenge(userInput)) return null;

  // 2. Extract data from user input
  const extractedNumbers = extractFinancialNumbers(userInput);
  const metrics = extractBusinessMetrics(userInput);
  const businessType = context.businessType || 'default';

  // Update context with extracted data
  context.extractedNumbers = extractedNumbers;

  // 3. Run validation checks in priority order
  const validations: (InlineValidationPrompt | null)[] = [];

  // Financial validations (highest priority)
  if (metrics.revenue && metrics.revenue.length > 0) {
    // Check for hockey stick growth
    if (metrics.revenue.length >= 2) {
      validations.push(detectHockeyStickGrowth(metrics.revenue, businessType));
    }

    // Check for single-person overload
    if (metrics.team === 1 || (!metrics.team && !userInput.toLowerCase().includes('mitarbeiter'))) {
      validations.push(detectSinglePersonOverload(
        Math.max(...metrics.revenue),
        1,
        businessType
      ));
    }
  }

  // Capacity validations
  if (metrics.hours) {
    validations.push(detectTimeOverload(metrics.hours));
  }

  // Market validations
  validations.push(detectCompetitionBlindness(userInput));

  // 4. Return highest priority validation
  const activeValidations = validations.filter(v => v !== null) as InlineValidationPrompt[];

  if (activeValidations.length === 0) return null;

  // Sort by priority and return first
  const priorityOrder = { high: 0, medium: 1, low: 2 };
  activeValidations.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

  const validation = activeValidations[0];
  validation.context = context;

  return validation;
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Format currency in German EUR format
 */
export function formatEUR(amount: number | Decimal): string {
  const amountDecimal = amount instanceof Decimal ? amount : new Decimal(amount);

  const formatted = new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
  }).format(amountDecimal.toNumber());

  // Remove extra spaces that might be added by the locale formatting
  return formatted.replace(/\s+/g, ' ').trim();
}

/**
 * Generate progressive challenge based on flag count
 */
export function generateProgressiveChallenge(
  baseValidation: InlineValidationPrompt,
  flagCount: number
): InlineValidationPrompt {
  if (flagCount <= 1) {
    return baseValidation; // First flag: gentle questioning
  }

  if (flagCount === 2) {
    // Second flag: more specific math
    return {
      ...baseValidation,
      challenge: baseValidation.challenge + " Lass uns die Zahlen konkret durchrechnen.",
      priority: baseValidation.priority === 'low' ? 'medium' : baseValidation.priority,
    };
  }

  // Third+ flag: reality check with examples
  return {
    ...baseValidation,
    challenge: "Ich sehe du hältst an diesen Zahlen fest. Das ist völlig okay - lass uns gemeinsam schauen, wie das realistisch umsetzbar wäre. " + baseValidation.challenge,
    priority: 'high',
  };
}

// ============================================================================
// Exports
// ============================================================================

export default {
  getInlineValidationPrompt,
  extractFinancialNumbers,
  extractBusinessMetrics,
  detectOptimismPatterns,
  detectHockeyStickGrowth,
  detectSinglePersonOverload,
  detectOverutilization,
  detectMissingEssentials,
  detectUnrealisticLowCosts,
  detectScalingIgnorance,
  detectTimeOverload,
  detectCompetitionBlindness,
  isEstimationOrHypothetical,
  hasAcknowledgedChallenge,
  generateProgressiveChallenge,
  formatEUR,
  parseGermanNumber,
};