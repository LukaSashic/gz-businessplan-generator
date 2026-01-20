/**
 * Business Plan Document Builder (GZ-901)
 *
 * Assembles complete BA-compliant business plan document structure.
 * Orchestrates section generation and ensures proper document flow.
 *
 * Document follows BA-required structure:
 * 1. Cover page
 * 2. Table of contents
 * 3. 9 main sections (BA requirements)
 * 4. Appendices (financial details, etc.)
 */

import { Paragraph, HeadingLevel, Table, TableRow, TableCell } from 'docx';
import type {
  WorkshopDataExtract,
  DocumentExportOptions,
  BusinessPlanDocument,
  DocumentSection,
  DocumentMetadata
} from './types';

// Section generators (to be implemented)
import { generateCoverPage } from './section-generators/cover-page';
import { generateTableOfContents } from './section-generators/table-of-contents';
import { generateExecutiveSummary } from './section-generators/zusammenfassung';
import { generateFounderProfile } from './section-generators/gruenderperson';
import { generateBusinessIdea } from './section-generators/geschaeftsidee';
import { generateMarketAnalysis } from './section-generators/markt-analyse';
import { generateBusinessModel } from './section-generators/geschaeftsmodell';
import { generateMarketingStrategy } from './section-generators/marketing';
import { generateOrganization } from './section-generators/organisation';
import { generateFinancialPlanning } from './section-generators/finanzplanung';
import { generateSWOTAndMilestones } from './section-generators/swot-meilensteine';

// Styling and formatting
import { getDIN5008Styles } from './templates/din-5008-styles';

// ============================================================================
// BA-Required Document Structure
// ============================================================================

/**
 * BA-required sections in exact order
 * Based on official BA business plan template analysis
 */
const BA_DOCUMENT_STRUCTURE = [
  {
    id: 'zusammenfassung',
    title: 'Zusammenfassung',
    number: '1',
    generator: generateExecutiveSummary,
    required: true
  },
  {
    id: 'gruenderperson',
    title: 'Gründerperson',
    number: '2',
    generator: generateFounderProfile,
    required: true
  },
  {
    id: 'geschaeftsidee',
    title: 'Geschäftsidee',
    number: '3',
    generator: generateBusinessIdea,
    required: true
  },
  {
    id: 'markt-analyse',
    title: 'Zielgruppe und Marktanalyse',
    number: '4',
    generator: generateMarketAnalysis,
    required: true
  },
  {
    id: 'geschaeftsmodell',
    title: 'Geschäftsmodell und Wertversprechen',
    number: '5',
    generator: generateBusinessModel,
    required: true
  },
  {
    id: 'marketing',
    title: 'Marketing und Vertrieb',
    number: '6',
    generator: generateMarketingStrategy,
    required: true
  },
  {
    id: 'organisation',
    title: 'Organisation und Personal',
    number: '7',
    generator: generateOrganization,
    required: true
  },
  {
    id: 'finanzplanung',
    title: 'Finanzplanung',
    number: '8',
    generator: generateFinancialPlanning,
    required: true
  },
  {
    id: 'swot-meilensteine',
    title: 'SWOT-Analyse und Meilensteine',
    number: '9',
    generator: generateSWOTAndMilestones,
    required: true
  }
] as const;

// ============================================================================
// Main Document Builder Function
// ============================================================================

/**
 * Build complete business plan document structure
 *
 * Generates all sections in BA-required order with proper formatting.
 * Ensures financial precision and German localization throughout.
 */
export async function buildBusinessPlanDocument(
  dataExtract: WorkshopDataExtract,
  exportOptions: DocumentExportOptions
): Promise<BusinessPlanDocument> {
  const startTime = Date.now();

  try {
    // 1. Create document metadata
    const metadata = createDocumentMetadata(dataExtract, exportOptions);

    // 2. Generate cover page
    const coverPage = await generateCoverPage(dataExtract, exportOptions);

    // 3. Generate table of contents (placeholder for now)
    const tableOfContents = await generateTableOfContents(dataExtract, exportOptions);

    // 4. Generate all main sections
    const mainSections: DocumentSection[] = [];
    for (const sectionDef of BA_DOCUMENT_STRUCTURE) {
      console.log(`Generating section: ${sectionDef.id} - ${sectionDef.title}`);

      try {
        const section = await sectionDef.generator(dataExtract, exportOptions);

        // Add section numbering and ensure proper structure
        const formattedSection: DocumentSection = {
          ...section,
          id: sectionDef.id,
          number: sectionDef.number,
          title: sectionDef.title,
          pageBreakBefore: sectionDef.id !== 'zusammenfassung' // No break before first section
        };

        mainSections.push(formattedSection);
      } catch (error) {
        console.error(`Failed to generate section ${sectionDef.id}:`, error);

        // Create fallback section to prevent document corruption
        const fallbackSection: DocumentSection = {
          id: sectionDef.id,
          title: sectionDef.title,
          number: sectionDef.number,
          content: [
            new Paragraph({
              text: `Fehler beim Generieren des Abschnitts "${sectionDef.title}". Bitte kontaktieren Sie den Support.`,
              style: 'Body'
            })
          ],
          pageBreakBefore: sectionDef.id !== 'zusammenfassung'
        };

        mainSections.push(fallbackSection);
      }
    }

    // 5. Generate appendices (if requested)
    const appendices: DocumentSection[] = [];
    if (exportOptions.includeDetailedFinancials) {
      // TODO: Implement detailed financial appendix
      console.log('Detailed financial appendix requested - to be implemented');
    }

    // 6. Build final document structure
    const document: BusinessPlanDocument = {
      metadata,
      coverPage,
      tableOfContents,
      mainSections,
      appendices
    };

    const buildTime = Date.now() - startTime;
    console.log(`Document structure built in ${buildTime}ms`);

    return document;

  } catch (error) {
    console.error('Document building failed:', error);
    throw new Error(`Dokumenterstellung fehlgeschlagen: ${error instanceof Error ? error.message : 'Unbekannter Fehler'}`);
  }
}

// ============================================================================
// Document Metadata Creation
// ============================================================================

/**
 * Create document metadata from workshop data
 */
function createDocumentMetadata(
  dataExtract: WorkshopDataExtract,
  exportOptions: DocumentExportOptions
): DocumentMetadata {
  // Extract key information from intake and geschaeftsmodell modules
  const intake = dataExtract.modules.intake;
  const geschaeftsmodell = dataExtract.modules.geschaeftsmodell;

  // Fallback values for missing data
  const companyName = geschaeftsmodell?.unternehmen?.firmenname
    || intake?.geschaeftsidee?.produktDienstleistung
    || dataExtract.session.title
    || 'Mein Unternehmen';

  const authorName = intake?.gruender?.grunddaten?.name
    || intake?.gruender?.grunddaten?.vorname
    || 'Unbekannter Gründer';

  const documentTitle = `Businessplan - ${companyName}`;

  return {
    title: documentTitle,
    author: authorName,
    companyName,
    generatedAt: new Date(),
    version: '1.0.0',
    baCompliant: dataExtract.validation.passed,
    exportOptions
  };
}

// ============================================================================
// Document Validation and Quality Checks
// ============================================================================

/**
 * Validate that generated document meets BA requirements
 */
export function validateDocumentStructure(document: BusinessPlanDocument): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check that all required sections are present
  const requiredSectionIds = BA_DOCUMENT_STRUCTURE
    .filter(def => def.required)
    .map(def => def.id);

  const actualSectionIds = document.mainSections.map(section => section.id);

  for (const requiredId of requiredSectionIds) {
    if (!actualSectionIds.includes(requiredId)) {
      errors.push(`Pflichtabschnitt fehlt: ${requiredId}`);
    }
  }

  // Check section order matches BA requirements
  for (let i = 0; i < document.mainSections.length; i++) {
    const expectedSection = BA_DOCUMENT_STRUCTURE[i];
    const actualSection = document.mainSections[i];

    if (expectedSection && actualSection.id !== expectedSection.id) {
      warnings.push(`Abschnittreihenfolge incorrect: Erwartet ${expectedSection.id}, gefunden ${actualSection.id}`);
    }
  }

  // Check that critical sections have content
  for (const section of document.mainSections) {
    if (section.content.length === 0) {
      errors.push(`Abschnitt ${section.title} ist leer`);
    }
  }

  // Check financial section specifically (critical for BA)
  const finanzplanungSection = document.mainSections.find(s => s.id === 'finanzplanung');
  if (finanzplanungSection && finanzplanungSection.content.length < 3) {
    warnings.push('Finanzplanung-Abschnitt scheint unvollständig zu sein');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Get document statistics for quality assurance
 */
export function getDocumentStatistics(document: BusinessPlanDocument): {
  totalSections: number;
  totalParagraphs: number;
  totalWords: number;
  sectionStats: Array<{
    id: string;
    title: string;
    paragraphs: number;
    estimatedWords: number;
  }>;
} {
  let totalParagraphs = 0;
  let totalWords = 0;

  const sectionStats = document.mainSections.map(section => {
    const paragraphs = section.content.length;

    // Estimate word count (rough approximation)
    const estimatedWords = section.content.reduce((acc, paragraph) => {
      if (paragraph && typeof paragraph.text === 'string') {
        return acc + paragraph.text.split(/\s+/).length;
      }
      return acc + 20; // Default estimate for complex content
    }, 0);

    totalParagraphs += paragraphs;
    totalWords += estimatedWords;

    return {
      id: section.id,
      title: section.title,
      paragraphs,
      estimatedWords
    };
  });

  return {
    totalSections: document.mainSections.length,
    totalParagraphs,
    totalWords,
    sectionStats
  };
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Create a standard heading paragraph with proper formatting
 */
export function createHeading(
  text: string,
  level: HeadingLevel = HeadingLevel.HEADING_1
): Paragraph {
  return new Paragraph({
    text,
    heading: level,
    style: `Heading${level}` // Will be defined in DIN 5008 styles
  });
}

/**
 * Create a standard body paragraph with proper formatting
 */
export function createBodyParagraph(text: string): Paragraph {
  return new Paragraph({
    text,
    style: 'Body'
  });
}

/**
 * Create a bullet point paragraph
 */
export function createBulletParagraph(text: string): Paragraph {
  return new Paragraph({
    text,
    bullet: {
      level: 0
    },
    style: 'BulletList'
  });
}

/**
 * Create section break for proper page formatting
 */
export function createSectionBreak(): Paragraph {
  return new Paragraph({
    text: '',
    pageBreakBefore: true
  });
}