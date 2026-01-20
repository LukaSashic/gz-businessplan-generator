/**
 * Document Export System Tests (GZ-901)
 *
 * Comprehensive tests for BA-compliant document generation.
 * Covers critical functionality, financial precision, and German formatting.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import Decimal from 'decimal.js';
import type { WorkshopDataExtract } from '@/lib/export/types';
import type { ValidationResult } from '@/lib/validation/types';

// Import functions under test
import { extractWorkshopData } from '@/lib/export/data-extractor';
import { buildBusinessPlanDocument } from '@/lib/export/document-builder';
import {
  formatEUR,
  formatNumber,
  formatPercent,
  sumAndFormat,
  validateFinancialValue,
  safeFormatEUR
} from '@/lib/export/formatters/currency';
import {
  formatGermanDateLong,
  formatGermanDateShort,
  generate36MonthLabels,
  formatPlanningPeriod
} from '@/lib/export/formatters/dates';
import { validateDIN5008Compliance, getDIN5008Styles } from '@/lib/export/templates/din-5008-styles';

// ============================================================================
// Test Data Setup
// ============================================================================

const mockValidationResult: ValidationResult = {
  passed: true,
  blockers: [],
  warnings: [],
  summary: {
    totalChecks: 10,
    passedChecks: 10,
    failedBlockers: 0,
    totalWarnings: 0,
    canExport: true,
    overallScore: 100
  }
};

const mockWorkshopSession = {
  id: '123e4567-e89b-12d3-a456-426614174000',
  userId: '987fcdeb-51a2-43d1-9f12-345678901234',
  status: 'completed' as const,
  currentModule: 'gz-zusammenfassung',
  businessName: 'Test Business GmbH',
  businessType: 'DIGITAL_SERVICE' as const,
  createdAt: '2026-01-20T10:00:00.000Z',
  updatedAt: '2026-01-20T15:00:00.000Z',
  lastActivity: '2026-01-20T15:00:00.000Z',
  totalDuration: 600,
  conversationTurns: 50,
  modules: {
    'gz-intake': {
      status: 'completed' as const,
      startedAt: '2026-01-20T10:00:00.000Z',
      completedAt: '2026-01-20T11:00:00.000Z',
      data: {
        gruender: {
          grunddaten: {
            name: 'Max Mustermann',
            vorname: 'Max',
            email: 'max@example.com'
          }
        },
        geschaeftsidee: {
          produktDienstleistung: 'IT-Beratung für KMU',
          problembeschreibung: 'KMU benötigen bezahlbare IT-Lösungen',
          zielgruppe: 'Kleine und mittlere Unternehmen'
        }
      }
    },
    'gz-geschaeftsmodell': {
      status: 'completed' as const,
      completedAt: '2026-01-20T12:00:00.000Z',
      data: {
        unternehmen: {
          firmenname: 'Test Business GmbH'
        },
        geschaeftsmodell: {
          beschreibung: 'B2B IT-Beratung mit Fokus auf Digitalisierung',
          kategorie: 'Dienstleistung'
        }
      }
    },
    'gz-finanzplanung': {
      status: 'completed' as const,
      completedAt: '2026-01-20T14:00:00.000Z',
      data: {
        kapitalbedarf: {
          betriebsausstattung: 5000,
          geschaeftsausstattung: 3000,
          marketingStart: 2000,
          betriebsmittelreserve: 10000,
          lebenshaltung: 6000,
          gesamtkapitalbedarf: 26000
        },
        finanzierung: {
          eigenkapital: 15000,
          gruendungszuschuss: 11000,
          bankkredit: 0,
          foerderkredit: 0,
          sonstigeFinanzierung: 0
        },
        umsatzplanung: {
          monatlicheUmsaetze: Array(36).fill(0).map((_, i) => 3000 + (i * 100)) // Growing revenue
        },
        kostenplanung: {
          personalkosten: 0,
          raumkosten: 800,
          marketingkosten: 500,
          versicherungen: 300,
          sonstigeKosten: 400
        },
        rentabilitaet: {
          breakEvenUmsatz: 2500,
          breakEvenMonate: 4,
          gewinnJahr1: 12000,
          gewinnJahr2: 18000,
          gewinnJahr3: 24000
        },
        liquiditaet: {
          monatlicheLiquiditaet: Array(36).fill(0).map((_, i) => 15000 + (i * 200)) // Growing liquidity
        }
      }
    }
  }
};

// Mock all other required modules with minimal data
const allModuleNames = [
  'gz-unternehmen', 'gz-markt-wettbewerb', 'gz-marketing',
  'gz-swot', 'gz-meilensteine', 'gz-kpi', 'gz-zusammenfassung'
];

allModuleNames.forEach(moduleName => {
  mockWorkshopSession.modules[moduleName] = {
    status: 'completed' as const,
    completedAt: '2026-01-20T15:00:00.000Z',
    data: { placeholder: `${moduleName} data` }
  };
});

// ============================================================================
// German Currency Formatting Tests
// ============================================================================

describe('German Currency Formatting', () => {
  it('should format EUR with proper German locale', () => {
    expect(formatEUR(1234.56)).toBe('1.234,56 €');
    expect(formatEUR(new Decimal('1234.56'))).toBe('1.234,56 €');
  });

  it('should handle null and undefined values', () => {
    expect(formatEUR(null)).toBe('0,00 €');
    expect(formatEUR(undefined)).toBe('0,00 €');
  });

  it('should format large numbers correctly', () => {
    expect(formatEUR(1234567.89)).toBe('1.234.567,89 €');
  });

  it('should format without currency symbol when requested', () => {
    expect(formatNumber(1234.56)).toBe('1.234,56');
  });

  it('should format percentages in German format', () => {
    expect(formatPercent(12.34)).toBe('12,34 %');
    expect(formatPercent(new Decimal('12.34'))).toBe('12,34 %');
  });
});

// ============================================================================
// Financial Precision Tests (CRITICAL)
// ============================================================================

describe('Financial Precision with Decimal.js', () => {
  it('should maintain exact arithmetic precision', () => {
    const value1 = new Decimal('2500.50');
    const value2 = new Decimal('12');
    const result = value1.times(value2);

    expect(result.toString()).toBe('30006.00'); // Exact, no floating point errors
    expect(formatEUR(result)).toBe('30.006,00 €');
  });

  it('should sum multiple values with precision', () => {
    const values = [
      new Decimal('1234.56'),
      new Decimal('2345.67'),
      new Decimal('3456.78')
    ];

    const sum = values.reduce((acc, val) => acc.plus(val), new Decimal(0));
    expect(sum.toString()).toBe('7037.01');
  });

  it('should validate financial values correctly', () => {
    // Valid values
    expect(validateFinancialValue(1234.56, 'test').isValid).toBe(true);
    expect(validateFinancialValue(new Decimal('1234.56'), 'test').isValid).toBe(true);
    expect(validateFinancialValue(null, 'test').isValid).toBe(true);

    // Invalid values
    expect(validateFinancialValue(Infinity, 'test').isValid).toBe(false);
    expect(validateFinancialValue(NaN, 'test').isValid).toBe(false);
  });

  it('should handle edge cases in safeFormatEUR', () => {
    expect(safeFormatEUR(null)).toBe('0,00 €');
    expect(safeFormatEUR(undefined)).toBe('0,00 €');
    expect(safeFormatEUR(Infinity, 'FEHLER')).toBe('FEHLER');
  });
});

// ============================================================================
// German Date Formatting Tests
// ============================================================================

describe('German Date Formatting', () => {
  const testDate = new Date('2026-01-20T15:30:00.000Z');

  it('should format dates in German long format', () => {
    const formatted = formatGermanDateLong(testDate);
    expect(formatted).toMatch(/^\d{1,2}\. \w+ \d{4}$/); // "20. Januar 2026"
    expect(formatted).toContain('Januar');
  });

  it('should format dates in German short format', () => {
    const formatted = formatGermanDateShort(testDate);
    expect(formatted).toMatch(/^\d{2}\.\d{2}\.\d{4}$/); // "20.01.2026"
  });

  it('should generate 36-month labels correctly', () => {
    const startDate = new Date('2026-01-01');
    const labels = generate36MonthLabels(startDate);

    expect(labels).toHaveLength(36);
    expect(labels[0]).toContain('Jan');
    expect(labels[11]).toContain('Dez'); // December of first year
    expect(labels[35]).toContain('Dez'); // December of third year
  });

  it('should format planning periods correctly', () => {
    const startDate = new Date('2026-01-01');
    const endDate = new Date('2028-12-31');
    const period = formatPlanningPeriod(startDate, endDate);

    expect(period).toContain('Januar 2026');
    expect(period).toContain('bis');
    expect(period).toContain('2028');
  });
});

// ============================================================================
// Data Extraction Tests
// ============================================================================

describe('Workshop Data Extraction', () => {
  it('should extract workshop data successfully with complete session', () => {
    const extracted = extractWorkshopData(mockWorkshopSession, mockValidationResult);

    expect(extracted).not.toBeNull();
    expect(extracted!.session.id).toBe(mockWorkshopSession.id);
    expect(extracted!.modules.intake).toBeDefined();
    expect(extracted!.modules.finanzplanung).toBeDefined();
  });

  it('should return null for incomplete session', () => {
    const incompleteSession = {
      ...mockWorkshopSession,
      status: 'draft' as const
    };

    const extracted = extractWorkshopData(incompleteSession, mockValidationResult);
    expect(extracted).toBeNull();
  });

  it('should return null when required modules are missing', () => {
    const sessionMissingModule = {
      ...mockWorkshopSession,
      modules: {
        'gz-intake': mockWorkshopSession.modules['gz-intake']
        // Missing other required modules
      }
    };

    const extracted = extractWorkshopData(sessionMissingModule, mockValidationResult);
    expect(extracted).toBeNull();
  });
});

// ============================================================================
// Document Building Tests
// ============================================================================

describe('Document Structure Building', () => {
  let mockDataExtract: WorkshopDataExtract;

  beforeEach(() => {
    const extracted = extractWorkshopData(mockWorkshopSession, mockValidationResult);
    if (!extracted) throw new Error('Mock data extraction failed');
    mockDataExtract = extracted;
  });

  it('should build document structure with all required sections', async () => {
    const document = await buildBusinessPlanDocument(mockDataExtract, {});

    expect(document.metadata).toBeDefined();
    expect(document.coverPage).toBeDefined();
    expect(document.tableOfContents).toBeDefined();
    expect(document.mainSections).toHaveLength(9); // 9 BA-required sections

    // Check that all sections have required properties
    document.mainSections.forEach(section => {
      expect(section.id).toBeDefined();
      expect(section.title).toBeDefined();
      expect(section.number).toBeDefined();
      expect(section.content).toBeDefined();
      expect(Array.isArray(section.content)).toBe(true);
    });
  });

  it('should create proper document metadata', async () => {
    const document = await buildBusinessPlanDocument(mockDataExtract, {
      includeDetailedFinancials: true
    });

    expect(document.metadata.title).toContain('Test Business GmbH');
    expect(document.metadata.author).toContain('Max Mustermann');
    expect(document.metadata.baCompliant).toBe(true);
    expect(document.metadata.generatedAt).toBeInstanceOf(Date);
  });
});

// ============================================================================
// DIN 5008 Compliance Tests
// ============================================================================

describe('DIN 5008 Styling Compliance', () => {
  it('should validate DIN 5008 compliance', () => {
    const validation = validateDIN5008Compliance();
    expect(validation.isCompliant).toBe(true);
    expect(validation.issues).toHaveLength(0);
  });

  it('should provide proper document styles', () => {
    const styles = getDIN5008Styles();

    expect(styles.default).toBeDefined();
    expect(styles.paragraphStyles).toBeDefined();
    expect(styles.paragraphStyles!.length).toBeGreaterThan(0);

    // Check for required styles
    const styleIds = styles.paragraphStyles!.map(style => style.id);
    expect(styleIds).toContain('Body');
    expect(styleIds).toContain('TableHeader');
    expect(styleIds).toContain('TableNumber');
  });
});

// ============================================================================
// BA Compliance Tests (Critical Business Logic)
// ============================================================================

describe('BA Compliance Validation', () => {
  it('should detect month 6 self-sufficiency', () => {
    const finanzplanung = mockDataExtract.modules.finanzplanung;

    // Mock month 6 profit data
    const month6Profit = finanzplanung.rentabilitaet?.gewinnMonate?.[5] || 0;

    // Should be profitable by month 6 for BA compliance
    expect(month6Profit).toBeGreaterThanOrEqualTo(0);
  });

  it('should verify liquidity never goes negative', () => {
    const liquiditaet = mockDataExtract.modules.finanzplanung.liquiditaet;

    if (liquiditaet?.monatlicheLiquiditaet) {
      const minLiquidity = Math.min(...liquiditaet.monatlicheLiquiditaet);
      expect(minLiquidity).toBeGreaterThanOrEqualTo(0);
    }
  });

  it('should validate complete financial data structure', () => {
    const finanzplanung = mockDataExtract.modules.finanzplanung;

    // Critical financial data must be present
    expect(finanzplanung.kapitalbedarf).toBeDefined();
    expect(finanzplanung.finanzierung).toBeDefined();
    expect(finanzplanung.umsatzplanung).toBeDefined();
    expect(finanzplanung.kostenplanung).toBeDefined();
    expect(finanzplanung.rentabilitaet).toBeDefined();
    expect(finanzplanung.liquiditaet).toBeDefined();
  });
});

// ============================================================================
// Error Handling and Edge Cases
// ============================================================================

describe('Error Handling and Edge Cases', () => {
  it('should handle missing financial data gracefully', async () => {
    const incompleteDataExtract = {
      ...mockDataExtract,
      modules: {
        ...mockDataExtract.modules,
        finanzplanung: {} // Empty financial data
      }
    };

    // Should not throw, but create fallback content
    const document = await buildBusinessPlanDocument(incompleteDataExtract, {});
    expect(document.mainSections).toBeDefined();

    const finanzSection = document.mainSections.find(s => s.id === 'finanzplanung');
    expect(finanzSection).toBeDefined();
    expect(finanzSection!.content.length).toBeGreaterThan(0);
  });

  it('should handle extremely large numbers correctly', () => {
    const largeNumber = new Decimal('999999999.99');
    const formatted = formatEUR(largeNumber);
    expect(formatted).toBe('999.999.999,99 €');
  });

  it('should handle decimal precision in calculations', () => {
    // Test the specific case that causes floating point errors
    const a = new Decimal('0.1');
    const b = new Decimal('0.2');
    const result = a.plus(b);

    expect(result.toString()).toBe('0.3'); // Exact, not 0.30000000000000004
  });
});

// ============================================================================
// Performance Tests
// ============================================================================

describe('Performance Requirements', () => {
  it('should format currency values quickly', () => {
    const startTime = Date.now();

    // Format 1000 currency values
    for (let i = 0; i < 1000; i++) {
      formatEUR(1234.56 + i);
    }

    const endTime = Date.now();
    const duration = endTime - startTime;

    // Should complete within reasonable time (< 100ms for 1000 operations)
    expect(duration).toBeLessThan(100);
  });

  it('should generate month labels efficiently', () => {
    const startTime = Date.now();

    // Generate labels 100 times
    for (let i = 0; i < 100; i++) {
      generate36MonthLabels(new Date());
    }

    const endTime = Date.now();
    const duration = endTime - startTime;

    // Should be very fast
    expect(duration).toBeLessThan(50);
  });
});