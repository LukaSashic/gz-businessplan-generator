/**
 * German Currency and Number Formatting (GZ-901)
 *
 * CRITICAL: Uses decimal.js for exact financial arithmetic.
 * Implements German number formatting standards (DIN 5008).
 *
 * Format examples:
 * - Currency: 1.234,56 €
 * - Numbers: 1.234.567
 * - Percentages: 12,34 %
 */

import Decimal from 'decimal.js';
import type { GermanFormatOptions } from '../types';

// ============================================================================
// Decimal.js Configuration (matches break-even.ts)
// ============================================================================

// Set consistent decimal.js configuration for financial precision
Decimal.set({
  precision: 28,
  rounding: Decimal.ROUND_HALF_UP,
  toExpNeg: -28,
  toExpPos: 28,
});

// ============================================================================
// German Currency Formatting
// ============================================================================

/**
 * Format currency in German EUR format (1.234,56 €)
 * Uses existing formatEUR function logic with additional options
 */
export function formatEUR(
  amount: number | Decimal | null | undefined,
  options: GermanFormatOptions = {}
): string {
  // Handle null/undefined values
  if (amount == null) {
    return options.includeCurrency ? '0,00 €' : '0,00';
  }

  // Convert to Decimal for consistent handling
  const amountDecimal = amount instanceof Decimal ? amount : new Decimal(amount);

  // Use German locale formatting
  const formatted = new Intl.NumberFormat('de-DE', {
    style: options.includeCurrency !== false ? 'currency' : 'decimal',
    currency: 'EUR',
    minimumFractionDigits: options.decimalPlaces ?? 2,
    maximumFractionDigits: options.decimalPlaces ?? 2,
    useGrouping: options.useThousandSeparators !== false,
  }).format(amountDecimal.toNumber());

  return formatted;
}

/**
 * Format currency without symbol (1.234,56)
 */
export function formatNumber(
  amount: number | Decimal | null | undefined,
  options: GermanFormatOptions = {}
): string {
  return formatEUR(amount, {
    ...options,
    includeCurrency: false
  });
}

/**
 * Format percentage in German format (12,34 %)
 */
export function formatPercent(
  value: number | Decimal | null | undefined,
  decimalPlaces = 2
): string {
  if (value == null) {
    return '0,00 %';
  }

  const valueDecimal = value instanceof Decimal ? value : new Decimal(value);

  return new Intl.NumberFormat('de-DE', {
    style: 'percent',
    minimumFractionDigits: decimalPlaces,
    maximumFractionDigits: decimalPlaces,
  }).format(valueDecimal.div(100).toNumber());
}

/**
 * Format integer numbers with thousand separators (1.234.567)
 */
export function formatInteger(
  value: number | Decimal | null | undefined
): string {
  if (value == null) {
    return '0';
  }

  const valueDecimal = value instanceof Decimal ? value : new Decimal(value);

  return new Intl.NumberFormat('de-DE', {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
    useGrouping: true,
  }).format(valueDecimal.toNumber());
}

// ============================================================================
// Table-Specific Formatting
// ============================================================================

/**
 * Format currency for table cells (consistent width/alignment)
 */
export function formatTableEUR(
  amount: number | Decimal | null | undefined,
  options: { showZeroAsDash?: boolean } = {}
): string {
  if (amount == null || (options.showZeroAsDash && new Decimal(amount || 0).isZero())) {
    return '-';
  }

  return formatEUR(amount, {
    includeCurrency: true,
    decimalPlaces: 0, // Whole euros for better table readability
    useThousandSeparators: true
  });
}

/**
 * Format numbers for table cells (right-aligned, consistent format)
 */
export function formatTableNumber(
  amount: number | Decimal | null | undefined,
  options: { decimalPlaces?: number; showZeroAsDash?: boolean } = {}
): string {
  if (amount == null || (options.showZeroAsDash && new Decimal(amount || 0).isZero())) {
    return '-';
  }

  return formatNumber(amount, {
    decimalPlaces: options.decimalPlaces ?? 0,
    useThousandSeparators: true
  });
}

// ============================================================================
// Financial Calculation Helpers (with Decimal.js)
// ============================================================================

/**
 * Add multiple decimal values and format result
 */
export function sumAndFormat(
  values: Array<number | Decimal | null | undefined>,
  formatter: (val: Decimal) => string = (val) => formatEUR(val)
): string {
  const sum = values.reduce((acc, val) => {
    if (val == null) return acc;
    const decimal = val instanceof Decimal ? val : new Decimal(val);
    return acc.plus(decimal);
  }, new Decimal(0));

  return formatter(sum);
}

/**
 * Calculate percentage and format (with decimal.js precision)
 */
export function percentageOf(
  part: number | Decimal | null | undefined,
  total: number | Decimal | null | undefined,
  decimalPlaces = 1
): string {
  if (part == null || total == null) {
    return '0,0 %';
  }

  const partDecimal = part instanceof Decimal ? part : new Decimal(part);
  const totalDecimal = total instanceof Decimal ? total : new Decimal(total);

  if (totalDecimal.isZero()) {
    return '0,0 %';
  }

  const percentage = partDecimal.div(totalDecimal).times(100);
  return formatPercent(percentage, decimalPlaces);
}

// ============================================================================
// BA-Specific Formatting Requirements
// ============================================================================

/**
 * Format monthly values for 36-month financial planning tables
 */
export function formatMonthlyValues(
  values: Array<number | Decimal | null | undefined>,
  formatter: (val: number | Decimal) => string = formatTableEUR
): string[] {
  // Ensure we have exactly 36 months for BA compliance
  const paddedValues = [...values];
  while (paddedValues.length < 36) {
    paddedValues.push(0);
  }

  return paddedValues.slice(0, 36).map(val => formatter(val ?? 0));
}

/**
 * Format quarter totals (Q1-Q12 for 3 years)
 */
export function formatQuarterlyTotals(
  monthlyValues: Array<number | Decimal | null | undefined>
): string[] {
  const quarters: string[] = [];

  for (let q = 0; q < 12; q++) { // 12 quarters (3 years)
    const startMonth = q * 3;
    const quarterValues = monthlyValues.slice(startMonth, startMonth + 3);

    const quarterSum = quarterValues.reduce((sum, val) => {
      if (val == null) return sum;
      const decimal = val instanceof Decimal ? val : new Decimal(val);
      return sum.plus(decimal);
    }, new Decimal(0));

    quarters.push(formatTableEUR(quarterSum));
  }

  return quarters;
}

/**
 * Format annual totals (Year 1, 2, 3)
 */
export function formatAnnualTotals(
  monthlyValues: Array<number | Decimal | null | undefined>
): string[] {
  const years: string[] = [];

  for (let year = 0; year < 3; year++) {
    const startMonth = year * 12;
    const yearValues = monthlyValues.slice(startMonth, startMonth + 12);

    const yearSum = yearValues.reduce((sum, val) => {
      if (val == null) return sum;
      const decimal = val instanceof Decimal ? val : new Decimal(val);
      return sum.plus(decimal);
    }, new Decimal(0));

    years.push(formatTableEUR(yearSum));
  }

  return years;
}

// ============================================================================
// Validation and Error Handling
// ============================================================================

/**
 * Validate that a financial value can be safely formatted
 */
export function validateFinancialValue(
  value: any,
  fieldName: string
): { isValid: boolean; error?: string; normalized?: Decimal } {
  try {
    if (value == null) {
      return { isValid: true, normalized: new Decimal(0) };
    }

    if (typeof value === 'string') {
      // Try to parse German formatted string
      const cleaned = value.replace(/\./g, '').replace(/,/g, '.').replace(/[€%\s]/g, '');
      const decimal = new Decimal(cleaned);
      return { isValid: true, normalized: decimal };
    }

    if (typeof value === 'number') {
      if (!isFinite(value)) {
        return { isValid: false, error: `${fieldName}: Ungültiger Zahlenwert (${value})` };
      }
      return { isValid: true, normalized: new Decimal(value) };
    }

    if (value instanceof Decimal) {
      return { isValid: true, normalized: value };
    }

    return { isValid: false, error: `${fieldName}: Unbekannter Datentyp (${typeof value})` };

  } catch (error) {
    return {
      isValid: false,
      error: `${fieldName}: Formatierungsfehler (${error instanceof Error ? error.message : 'Unbekannt'})`
    };
  }
}

/**
 * Safely format financial value with error handling
 */
export function safeFormatEUR(
  value: any,
  fallback = '0,00 €'
): string {
  const validation = validateFinancialValue(value, 'financial value');
  if (!validation.isValid) {
    console.warn('Financial formatting error:', validation.error);
    return fallback;
  }

  return formatEUR(validation.normalized);
}