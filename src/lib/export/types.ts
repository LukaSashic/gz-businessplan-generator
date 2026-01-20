/**
 * Types for .docx Document Export System
 *
 * BA-compliant business plan generation with financial precision.
 * Integrates with existing validation and module systems.
 */

import type { WorkshopSession } from '@/types/workshop';
import type { ValidationResult } from '@/lib/validation/ba-compliance-checker';
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

/**
 * Core export request parameters
 */
export interface DocumentExportRequest {
  /** Workshop session ID */
  workshopId: string;
  /** Optional user preferences for document generation */
  options?: DocumentExportOptions;
}

/**
 * Document generation options
 */
export interface DocumentExportOptions {
  /** Include detailed financial appendix */
  includeDetailedFinancials?: boolean;
  /** Include SWOT analysis as separate section */
  includeSWOTSection?: boolean;
  /** Export format (currently only .docx supported) */
  format?: 'docx';
  /** Company logo to include (base64 encoded) */
  companyLogo?: string;
}

/**
 * Extract from complete workshop session for document generation
 */
export interface WorkshopDataExtract {
  /** Basic session metadata */
  session: {
    id: string;
    title: string;
    createdAt: Date;
    updatedAt: Date;
    userId: string;
  };

  /** Module outputs (validated and complete) */
  modules: {
    intake: PartialIntakeOutput;
    geschaeftsmodell: PartialGeschaeftsmodellOutput;
    marktWettbewerb: PartialMarktWettbewerbOutput;
    marketing: PartialMarketingOutput;
    finanzplanung: PartialFinanzplanungOutput;
    unternehmen: PartialUnternehmenOutput;
    swot: PartialSWOTOutput;
    meilensteine: PartialMeilensteineOutput;
    kpi: PartialKPIOutput;
    zusammenfassung: PartialZusammenfassungOutput;
  };

  /** BA compliance validation result */
  validation: ValidationResult;
}

/**
 * Individual document section for assembly
 */
export interface DocumentSection {
  /** Section identifier */
  id: string;
  /** German section title */
  title: string;
  /** Section number (1, 2, 3.1, etc.) */
  number: string;
  /** Section content (docx Paragraph[]) */
  content: any[]; // docx.Paragraph[] type from docx library
  /** Section requires page break before */
  pageBreakBefore?: boolean;
  /** Section is appendix (different numbering) */
  isAppendix?: boolean;
}

/**
 * Complete document structure
 */
export interface BusinessPlanDocument {
  /** Document metadata */
  metadata: DocumentMetadata;
  /** Cover page content */
  coverPage: DocumentSection;
  /** Table of contents */
  tableOfContents: DocumentSection;
  /** Main business plan sections (9 BA-required) */
  mainSections: DocumentSection[];
  /** Optional appendices */
  appendices: DocumentSection[];
}

/**
 * Document metadata for export
 */
export interface DocumentMetadata {
  /** Document title */
  title: string;
  /** Author name (from intake) */
  author: string;
  /** Company name (from geschaeftsmodell) */
  companyName: string;
  /** Generation date */
  generatedAt: Date;
  /** Document version */
  version: string;
  /** BA compliance status */
  baCompliant: boolean;
  /** Export options used */
  exportOptions: DocumentExportOptions;
}

/**
 * Financial table data structure (uses decimal.js precision)
 */
export interface FinancialTableData {
  /** Table identifier */
  id: string;
  /** German table title */
  title: string;
  /** Column headers */
  headers: string[];
  /** Row data with decimal.js values converted to formatted strings */
  rows: FinancialTableRow[];
  /** Table footnotes */
  footnotes?: string[];
}

/**
 * Financial table row
 */
export interface FinancialTableRow {
  /** Row label (German) */
  label: string;
  /** Cell values (formatted German numbers) */
  values: string[];
  /** Row is subtotal/total */
  isSubtotal?: boolean;
  /** Row is grand total */
  isTotal?: boolean;
}

/**
 * German number formatting options
 */
export interface GermanFormatOptions {
  /** Include currency symbol (€) */
  includeCurrency?: boolean;
  /** Number of decimal places */
  decimalPlaces?: number;
  /** Use thousand separators */
  useThousandSeparators?: boolean;
}

/**
 * Document generation result
 */
export interface DocumentGenerationResult {
  /** Success status */
  success: boolean;
  /** Generated document as Blob */
  document?: Blob;
  /** Error message if failed */
  error?: string;
  /** Validation errors that blocked export */
  validationErrors?: string[];
  /** Metadata about generated document */
  metadata?: DocumentMetadata;
}

/**
 * BA compliance document requirements
 */
export interface BADocumentRequirements {
  /** Required sections must be present */
  requiredSections: string[];
  /** Financial tables must be complete */
  financialTablesRequired: string[];
  /** Minimum content length per section */
  minimumContentLength: Record<string, number>;
  /** Required formatting standards */
  formattingStandards: {
    font: string;
    fontSize: number;
    margins: {
      top: number;
      right: number;
      bottom: number;
      left: number;
    };
  };
}

/**
 * DIN 5008 styling configuration
 */
export interface DIN5008Styles {
  /** Document fonts */
  fonts: {
    heading: string;
    body: string;
    size: {
      heading1: number;
      heading2: number;
      heading3: number;
      body: number;
    };
  };

  /** Document margins (in points) */
  margins: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };

  /** Line spacing */
  lineSpacing: number;

  /** Color scheme */
  colors: {
    heading: string;
    body: string;
    accent: string;
  };
}

/**
 * Error types for document generation
 */
export class DocumentGenerationError extends Error {
  constructor(
    message: string,
    public code: DocumentErrorCode,
    public details?: any
  ) {
    super(message);
    this.name = 'DocumentGenerationError';
  }
}

/**
 * Document error codes
 */
export enum DocumentErrorCode {
  BA_VALIDATION_FAILED = 'BA_VALIDATION_FAILED',
  MISSING_REQUIRED_DATA = 'MISSING_REQUIRED_DATA',
  FINANCIAL_CALCULATION_ERROR = 'FINANCIAL_CALCULATION_ERROR',
  DOCUMENT_ASSEMBLY_ERROR = 'DOCUMENT_ASSEMBLY_ERROR',
  FILE_GENERATION_ERROR = 'FILE_GENERATION_ERROR',
  INVALID_SESSION_DATA = 'INVALID_SESSION_DATA',
}

/**
 * Progress tracking for long document generation
 */
export interface DocumentGenerationProgress {
  /** Current step */
  step: string;
  /** Progress percentage (0-100) */
  progress: number;
  /** Estimated time remaining (seconds) */
  estimatedTime?: number;
  /** Current section being processed */
  currentSection?: string;
}