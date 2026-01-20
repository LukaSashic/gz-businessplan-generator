/**
 * Founder Profile Generator (GZ-901)
 *
 * Creates Section 2: Gründerperson (Founder Profile).
 * Details about the founder's background, qualifications, and motivation.
 */

import { Paragraph, HeadingLevel } from 'docx';
import type { WorkshopDataExtract, DocumentExportOptions, DocumentSection } from '../types';
import { createHeading, createBodyParagraph } from '../document-builder';

/**
 * Generate founder profile section
 */
export async function generateFounderProfile(
  dataExtract: WorkshopDataExtract,
  options: DocumentExportOptions
): Promise<DocumentSection> {
  try {
    const intake = dataExtract.modules.intake;

    const founderName = intake?.gruender?.grunddaten?.name || 'Gründer/in';
    const motivation = intake?.gruender?.motivation?.gruendungsmotivation || 'Unternehmerische Selbstständigkeit';

    const content = [
      createHeading('2. Gründerperson', HeadingLevel.HEADING_1),
      createBodyParagraph(
        `${founderName} bringt umfangreiche Erfahrung und Motivation für die Unternehmensgründung mit. ` +
        `Motivation: ${motivation}`
      ),
      createHeading('2.1 Qualifikationen', HeadingLevel.HEADING_2),
      createBodyParagraph('Detaillierte Qualifikationen werden aus den Intake-Daten extrahiert.'),
      createHeading('2.2 Berufliche Erfahrung', HeadingLevel.HEADING_2),
      createBodyParagraph('Berufliche Erfahrung wird aus den Intake-Daten extrahiert.')
    ];

    return {
      id: 'gruenderperson',
      title: 'Gründerperson',
      number: '2',
      content,
      pageBreakBefore: true
    };

  } catch (error) {
    console.error('Founder profile generation failed:', error);
    return {
      id: 'gruenderperson',
      title: 'Gründerperson',
      number: '2',
      content: [
        createHeading('2. Gründerperson', HeadingLevel.HEADING_1),
        createBodyParagraph('Gründerprofil konnte nicht generiert werden.')
      ],
      pageBreakBefore: true
    };
  }
}