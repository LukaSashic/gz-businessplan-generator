/**
 * Core .docx Document Generator (GZ-901)
 *
 * Main entry point for BA-compliant business plan document generation.
 * Integrates validation, data extraction, and document assembly.
 *
 * CRITICAL: Must validate BA compliance before allowing export.
 * Uses decimal.js for financial precision and German localization.
 */

import { Document, Packer } from 'docx';
import { validateBACompliance } from '@/lib/validation/ba-compliance-checker';
import type { WorkshopSession } from '@/types/workshop-session';
import type { ValidationResult } from '@/lib/validation/types';
import type {
  DocumentExportRequest,
  DocumentExportOptions,
  DocumentGenerationResult,
  DocumentGenerationError,
  DocumentErrorCode,
  WorkshopDataExtract,
  BusinessPlanDocument
} from './types';

// Import builder and formatters (to be implemented)
import { buildBusinessPlanDocument } from './document-builder';
import { extractWorkshopData } from './data-extractor';

// ============================================================================
// Configuration
// ============================================================================

const DEFAULT_EXPORT_OPTIONS: Required<DocumentExportOptions> = {
  includeDetailedFinancials: true,
  includeSWOTSection: true,
  format: 'docx',
  companyLogo: '',
};

// Document generation timeout (prevent hanging)
const GENERATION_TIMEOUT_MS = 30000; // 30 seconds

// ============================================================================
// Main Export Function
// ============================================================================

/**
 * Generate BA-compliant business plan document from workshop session
 *
 * CRITICAL VALIDATION FLOW:
 * 1. Validate BA compliance (blocks export if critical issues)
 * 2. Extract and validate required data
 * 3. Build document structure
 * 4. Generate .docx blob
 *
 * @param request Export request with workshop ID and options
 * @returns Document blob or error details
 */
export async function generateBusinessPlanDocument(
  request: DocumentExportRequest
): Promise<DocumentGenerationResult> {
  const startTime = Date.now();

  try {
    // Step 1: Load workshop session
    const workshopSession = await loadWorkshopSession(request.workshopId);
    if (!workshopSession) {
      return {
        success: false,
        error: 'Workshop session not found',
        validationErrors: [`Workshop mit ID ${request.workshopId} wurde nicht gefunden.`]
      };
    }

    // Step 2: CRITICAL - Validate BA compliance before proceeding
    const validationResult = await validateBACompliance(workshopSession);
    if (!validationResult.passed || validationResult.blockers.length > 0) {
      return {
        success: false,
        error: 'BA compliance validation failed',
        validationErrors: validationResult.blockers.map(blocker => blocker.message)
      };
    }

    // Step 3: Extract and validate workshop data
    const dataExtract = extractWorkshopData(workshopSession, validationResult);
    if (!dataExtract) {
      throw new DocumentGenerationError(
        'Unvollständige Workshop-Daten: Nicht alle Module sind vollständig ausgefüllt.',
        DocumentErrorCode.MISSING_REQUIRED_DATA
      );
    }

    // Step 4: Merge export options with defaults
    const exportOptions = { ...DEFAULT_EXPORT_OPTIONS, ...request.options };

    // Step 5: Build document structure
    const documentStructure = await buildBusinessPlanDocument(
      dataExtract,
      exportOptions
    );

    // Step 6: Generate .docx blob
    const documentBlob = await generateDocxBlob(documentStructure);

    // Step 7: Return success result
    const generationTime = Date.now() - startTime;
    return {
      success: true,
      document: documentBlob,
      metadata: {
        title: documentStructure.metadata.title,
        author: documentStructure.metadata.author,
        companyName: documentStructure.metadata.companyName,
        generatedAt: new Date(),
        version: '1.0.0',
        baCompliant: true,
        exportOptions
      }
    };

  } catch (error) {
    console.error('Document generation failed:', error);

    if (error instanceof DocumentGenerationError) {
      return {
        success: false,
        error: error.message,
        validationErrors: [error.message]
      };
    }

    return {
      success: false,
      error: 'Unerwarteter Fehler bei der Dokument-Generierung',
      validationErrors: ['Ein technischer Fehler ist aufgetreten. Bitte versuchen Sie es erneut.']
    };
  }
}

/**
 * Quick validation check without full document generation
 * Used for UI to show export readiness status
 */
export async function checkExportReadiness(
  workshopId: string
): Promise<{
  canExport: boolean;
  validationResult: ValidationResult;
  missingModules: string[];
}> {
  try {
    const workshopSession = await loadWorkshopSession(workshopId);
    if (!workshopSession) {
      return {
        canExport: false,
        validationResult: {
          passed: false,
          blockers: [{
            id: 'session-not-found',
            severity: 'BLOCKER',
            category: 'structure',
            title: 'Workshop nicht gefunden',
            message: 'Die angegebene Workshop-Session existiert nicht.'
          }],
          warnings: [],
          summary: {
            totalChecks: 0,
            passedChecks: 0,
            failedBlockers: 1,
            totalWarnings: 0,
            canExport: false,
            overallScore: 0
          }
        },
        missingModules: []
      };
    }

    // Run BA compliance validation
    const validationResult = await validateBACompliance(workshopSession);

    // Check which modules are missing or incomplete
    const requiredModules = [
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
    ];

    const missingModules = requiredModules.filter(moduleId => {
      const module = workshopSession.modules[moduleId];
      return !module || module.status !== 'completed' || !module.data;
    });

    return {
      canExport: validationResult.passed && missingModules.length === 0,
      validationResult,
      missingModules
    };

  } catch (error) {
    console.error('Export readiness check failed:', error);
    return {
      canExport: false,
      validationResult: {
        passed: false,
        blockers: [{
          id: 'readiness-check-error',
          severity: 'BLOCKER',
          category: 'structure',
          title: 'Validierung fehlgeschlagen',
          message: 'Die Export-Bereitschaftsprüfung ist fehlgeschlagen.'
        }],
        warnings: [],
        summary: {
          totalChecks: 0,
          passedChecks: 0,
          failedBlockers: 1,
          totalWarnings: 0,
          canExport: false,
          overallScore: 0
        }
      },
      missingModules: []
    };
  }
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Load workshop session from database/storage
 * TODO: Implement actual data loading from Supabase
 */
async function loadWorkshopSession(workshopId: string): Promise<WorkshopSession | null> {
  // This will be implemented when we create the API route
  // For now, return null to indicate not implemented
  console.warn('loadWorkshopSession not yet implemented - needs Supabase integration');
  return null;
}

/**
 * Generate actual .docx blob from document structure using docx library
 */
async function generateDocxBlob(documentStructure: BusinessPlanDocument): Promise<Blob> {
  try {
    // Create docx Document instance
    const doc = new Document({
      sections: [
        // Cover page
        {
          children: documentStructure.coverPage.content
        },
        // Table of contents
        {
          children: documentStructure.tableOfContents.content
        },
        // Main sections
        ...documentStructure.mainSections.map(section => ({
          children: section.content,
          properties: {
            titlePage: section.pageBreakBefore
          }
        })),
        // Appendices
        ...documentStructure.appendices.map(section => ({
          children: section.content,
          properties: {
            titlePage: section.pageBreakBefore
          }
        }))
      ],

      // Document properties
      properties: {
        title: documentStructure.metadata.title,
        creator: documentStructure.metadata.author,
        company: documentStructure.metadata.companyName,
        created: documentStructure.metadata.generatedAt,
        modified: documentStructure.metadata.generatedAt,
      },

      // Document settings for German locale
      settings: {
        defaultLanguage: 'de-DE'
      }
    });

    // Generate blob with timeout protection
    const buffer = await Promise.race([
      Packer.toBuffer(doc),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Document generation timeout')), GENERATION_TIMEOUT_MS)
      )
    ]);

    return new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    });

  } catch (error) {
    console.error('DOCX generation failed:', error);
    throw new DocumentGenerationError(
      'Fehler bei der DOCX-Datei-Generierung',
      DocumentErrorCode.FILE_GENERATION_ERROR,
      error
    );
  }
}

/**
 * Validate required environment for document generation
 */
export function validateDocumentGenerationEnvironment(): {
  isValid: boolean;
  missingRequirements: string[];
} {
  const missingRequirements: string[] = [];

  // Check if required dependencies are available
  try {
    require('docx');
  } catch {
    missingRequirements.push('docx library not installed');
  }

  // Check if validation system is available
  try {
    require('@/lib/validation/ba-compliance-checker');
  } catch {
    missingRequirements.push('BA compliance validator not available');
  }

  return {
    isValid: missingRequirements.length === 0,
    missingRequirements
  };
}

/**
 * Get document generation statistics (for monitoring)
 */
export interface DocumentGenerationStats {
  totalGenerations: number;
  successRate: number;
  averageGenerationTime: number;
  commonFailureReasons: string[];
}

// Simple in-memory stats (would be replaced with proper analytics)
let generationStats: DocumentGenerationStats = {
  totalGenerations: 0,
  successRate: 0,
  averageGenerationTime: 0,
  commonFailureReasons: []
};

export function getDocumentGenerationStats(): DocumentGenerationStats {
  return { ...generationStats };
}

/**
 * Reset generation statistics (for testing)
 */
export function resetDocumentGenerationStats(): void {
  generationStats = {
    totalGenerations: 0,
    successRate: 0,
    averageGenerationTime: 0,
    commonFailureReasons: []
  };
}