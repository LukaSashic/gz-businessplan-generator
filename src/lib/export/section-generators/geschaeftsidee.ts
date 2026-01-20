/**
 * Business Idea Generator (GZ-901)
 * Creates Section 3: Geschäftsidee (Business Idea).
 */

import { Paragraph, HeadingLevel } from 'docx';
import type { WorkshopDataExtract, DocumentExportOptions, DocumentSection } from '../types';
import { createHeading, createBodyParagraph } from '../document-builder';

export async function generateBusinessIdea(
  dataExtract: WorkshopDataExtract,
  options: DocumentExportOptions
): Promise<DocumentSection> {
  try {
    const geschaeftsmodell = dataExtract.modules.geschaeftsmodell;
    const description = geschaeftsmodell?.geschaeftsmodell?.beschreibung || 'Innovative Geschäftsidee';

    return {
      id: 'geschaeftsidee',
      title: 'Geschäftsidee',
      number: '3',
      content: [
        createHeading('3. Geschäftsidee', HeadingLevel.HEADING_1),
        createBodyParagraph(`Die Geschäftsidee basiert auf: ${description}`)
      ],
      pageBreakBefore: true
    };
  } catch (error) {
    return {
      id: 'geschaeftsidee',
      title: 'Geschäftsidee',
      number: '3',
      content: [
        createHeading('3. Geschäftsidee', HeadingLevel.HEADING_1),
        createBodyParagraph('Geschäftsidee konnte nicht generiert werden.')
      ],
      pageBreakBefore: true
    };
  }
}