/**
 * German Date Formatting (GZ-901)
 *
 * Implements German date formatting standards (DIN 5008).
 * Used throughout business plan documents for consistency.
 *
 * Format examples:
 * - Full date: 15. Januar 2026
 * - Short date: 15.01.2026
 * - Month/Year: Januar 2026
 */

// ============================================================================
// German Date Formatting
// ============================================================================

/**
 * Format date in German long format (15. Januar 2026)
 */
export function formatGermanDateLong(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;

  if (!isValidDate(dateObj)) {
    return 'Ungültiges Datum';
  }

  return new Intl.DateTimeFormat('de-DE', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(dateObj);
}

/**
 * Format date in German short format (15.01.2026)
 */
export function formatGermanDateShort(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;

  if (!isValidDate(dateObj)) {
    return 'Ungültiges Datum';
  }

  return new Intl.DateTimeFormat('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(dateObj);
}

/**
 * Format month and year in German (Januar 2026)
 */
export function formatGermanMonthYear(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;

  if (!isValidDate(dateObj)) {
    return 'Ungültiger Monat';
  }

  return new Intl.DateTimeFormat('de-DE', {
    month: 'long',
    year: 'numeric'
  }).format(dateObj);
}

/**
 * Format month only in German (Januar)
 */
export function formatGermanMonth(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;

  if (!isValidDate(dateObj)) {
    return 'Ungültiger Monat';
  }

  return new Intl.DateTimeFormat('de-DE', {
    month: 'long'
  }).format(dateObj);
}

// ============================================================================
// Financial Planning Specific Date Functions
// ============================================================================

/**
 * Generate 36-month period labels starting from given date
 * Returns array like ["Jan 2026", "Feb 2026", ..., "Dez 2028"]
 */
export function generate36MonthLabels(startDate: Date | string = new Date()): string[] {
  const startDateObj = typeof startDate === 'string' ? new Date(startDate) : startDate;

  if (!isValidDate(startDateObj)) {
    throw new Error('Invalid start date for 36-month generation');
  }

  const labels: string[] = [];
  const currentDate = new Date(startDateObj);

  for (let month = 0; month < 36; month++) {
    labels.push(formatGermanMonthShort(currentDate));
    currentDate.setMonth(currentDate.getMonth() + 1);
  }

  return labels;
}

/**
 * Format month in abbreviated German format (Jan, Feb, Mär, Apr, etc.)
 */
export function formatGermanMonthShort(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;

  if (!isValidDate(dateObj)) {
    return 'Ungültig';
  }

  return new Intl.DateTimeFormat('de-DE', {
    month: 'short'
  }).format(dateObj);
}

/**
 * Generate quarterly labels for financial tables (Q1 2026, Q2 2026, etc.)
 */
export function generateQuarterlyLabels(startDate: Date | string = new Date()): string[] {
  const startDateObj = typeof startDate === 'string' ? new Date(startDate) : startDate;

  if (!isValidDate(startDateObj)) {
    throw new Error('Invalid start date for quarterly generation');
  }

  const labels: string[] = [];
  const currentDate = new Date(startDateObj);

  for (let quarter = 0; quarter < 12; quarter++) { // 12 quarters = 3 years
    const quarterNum = (Math.floor(quarter % 4)) + 1;
    const year = currentDate.getFullYear() + Math.floor(quarter / 4);
    labels.push(`Q${quarterNum} ${year}`);
  }

  return labels;
}

/**
 * Generate annual labels for financial summaries (2026, 2027, 2028)
 */
export function generateAnnualLabels(startDate: Date | string = new Date()): string[] {
  const startDateObj = typeof startDate === 'string' ? new Date(startDate) : startDate;

  if (!isValidDate(startDateObj)) {
    throw new Error('Invalid start date for annual generation');
  }

  const startYear = startDateObj.getFullYear();
  return [
    startYear.toString(),
    (startYear + 1).toString(),
    (startYear + 2).toString()
  ];
}

// ============================================================================
// Document Generation Specific Dates
// ============================================================================

/**
 * Format document generation timestamp
 */
export function formatDocumentTimestamp(date: Date = new Date()): string {
  return formatGermanDateLong(date) + ' um ' + new Intl.DateTimeFormat('de-DE', {
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
}

/**
 * Format business plan period (e.g., "Januar 2026 bis Dezember 2028")
 */
export function formatPlanningPeriod(
  startDate: Date | string,
  endDate?: Date | string
): string {
  const startDateObj = typeof startDate === 'string' ? new Date(startDate) : startDate;

  if (!isValidDate(startDateObj)) {
    return 'Ungültiger Planungszeitraum';
  }

  // Default end date is 36 months from start
  const endDateObj = endDate
    ? (typeof endDate === 'string' ? new Date(endDate) : endDate)
    : new Date(startDateObj.getFullYear() + 3, startDateObj.getMonth() - 1); // 36 months later

  if (!isValidDate(endDateObj)) {
    return 'Ungültiger Planungszeitraum';
  }

  return `${formatGermanMonthYear(startDateObj)} bis ${formatGermanMonthYear(endDateObj)}`;
}

/**
 * Calculate and format business age at specific date
 */
export function formatBusinessAge(
  foundingDate: Date | string,
  referenceDate: Date | string = new Date()
): string {
  const foundingDateObj = typeof foundingDate === 'string' ? new Date(foundingDate) : foundingDate;
  const referenceDateObj = typeof referenceDate === 'string' ? new Date(referenceDate) : referenceDate;

  if (!isValidDate(foundingDateObj) || !isValidDate(referenceDateObj)) {
    return 'Unbekanntes Unternehmensalter';
  }

  const diffMs = referenceDateObj.getTime() - foundingDateObj.getTime();
  const diffMonths = Math.floor(diffMs / (1000 * 60 * 60 * 24 * 30.44)); // Average days per month

  if (diffMonths < 0) {
    return 'Gründung in der Zukunft';
  }

  if (diffMonths < 12) {
    return `${diffMonths} Monat${diffMonths === 1 ? '' : 'e'}`;
  }

  const years = Math.floor(diffMonths / 12);
  const remainingMonths = diffMonths % 12;

  if (remainingMonths === 0) {
    return `${years} Jahr${years === 1 ? '' : 'e'}`;
  }

  return `${years} Jahr${years === 1 ? '' : 'e'} und ${remainingMonths} Monat${remainingMonths === 1 ? '' : 'e'}`;
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Check if date is valid
 */
function isValidDate(date: Date): boolean {
  return date instanceof Date && !isNaN(date.getTime());
}

/**
 * Get current financial year start (assumes calendar year for simplicity)
 */
export function getCurrentFinancialYearStart(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), 0, 1); // January 1st
}

/**
 * Add months to a date (used for financial planning projections)
 */
export function addMonths(date: Date | string, months: number): Date {
  const dateObj = typeof date === 'string' ? new Date(date) : new Date(date);

  if (!isValidDate(dateObj)) {
    throw new Error('Invalid date for month addition');
  }

  const result = new Date(dateObj);
  result.setMonth(result.getMonth() + months);
  return result;
}

/**
 * Get month number (1-12) for calculations
 */
export function getMonthNumber(date: Date | string): number {
  const dateObj = typeof date === 'string' ? new Date(date) : date;

  if (!isValidDate(dateObj)) {
    return 1; // Default to January
  }

  return dateObj.getMonth() + 1;
}

/**
 * Format relative date for milestones (e.g., "In 6 Monaten", "Vor 2 Jahren")
 */
export function formatRelativeDate(
  targetDate: Date | string,
  referenceDate: Date | string = new Date()
): string {
  const targetDateObj = typeof targetDate === 'string' ? new Date(targetDate) : targetDate;
  const referenceDateObj = typeof referenceDate === 'string' ? new Date(referenceDate) : referenceDate;

  if (!isValidDate(targetDateObj) || !isValidDate(referenceDateObj)) {
    return 'Unbekannte Zeit';
  }

  const diffMs = targetDateObj.getTime() - referenceDateObj.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (Math.abs(diffDays) < 1) {
    return 'Heute';
  }

  if (diffDays > 0) {
    // Future
    if (diffDays < 30) {
      return `In ${diffDays} Tag${diffDays === 1 ? '' : 'en'}`;
    }
    const months = Math.round(diffDays / 30.44);
    if (months < 12) {
      return `In ${months} Monat${months === 1 ? '' : 'en'}`;
    }
    const years = Math.round(months / 12);
    return `In ${years} Jahr${years === 1 ? '' : 'en'}`;
  } else {
    // Past
    const absDays = Math.abs(diffDays);
    if (absDays < 30) {
      return `Vor ${absDays} Tag${absDays === 1 ? '' : 'en'}`;
    }
    const months = Math.round(absDays / 30.44);
    if (months < 12) {
      return `Vor ${months} Monat${months === 1 ? '' : 'en'}`;
    }
    const years = Math.round(months / 12);
    return `Vor ${years} Jahr${years === 1 ? '' : 'en'}`;
  }
}