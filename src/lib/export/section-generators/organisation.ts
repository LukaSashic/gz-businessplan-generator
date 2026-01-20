/**
 * Organization Generator (GZ-901)
 * Creates Section 7: Organisation und Personal.
 */

import { Paragraph, HeadingLevel } from 'docx';
import type { WorkshopDataExtract, DocumentExportOptions, DocumentSection } from '../types';
import { createHeading, createBodyParagraph } from '../document-builder';

export async function generateOrganization(
  dataExtract: WorkshopDataExtract,
  options: DocumentExportOptions
): Promise<DocumentSection> {
  return {
    id: 'organisation',
    title: 'Organisation und Personal',
    number: '7',
    content: [
      createHeading('7. Organisation und Personal', HeadingLevel.HEADING_1),
      createBodyParagraph('Organisation wird aus den Unternehmen-Daten extrahiert.')
    ],
    pageBreakBefore: true
  };
}