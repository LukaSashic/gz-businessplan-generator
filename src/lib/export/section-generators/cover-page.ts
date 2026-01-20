/**
 * Cover Page Generator (GZ-901)
 *
 * Creates professional BA-compliant business plan cover page.
 * Follows DIN 5008 formatting standards.
 */

import {
  Paragraph,
  AlignmentType,
  TextRun,
  HeadingLevel,
  UnderlineType
} from 'docx';
import type { WorkshopDataExtract, DocumentExportOptions, DocumentSection } from '../types';
import { formatGermanDateLong } from '../formatters/dates';

/**
 * Generate business plan cover page
 */
export async function generateCoverPage(
  dataExtract: WorkshopDataExtract,
  options: DocumentExportOptions
): Promise<DocumentSection> {
  try {
    const intake = dataExtract.modules.intake;
    const geschaeftsmodell = dataExtract.modules.geschaeftsmodell;

    // Extract key information
    const companyName = geschaeftsmodell?.unternehmen?.firmenname
      || intake?.geschaeftsidee?.produktDienstleistung
      || dataExtract.session.title
      || 'Mein Unternehmen';

    const founderName = intake?.gruender?.grunddaten?.name
      || intake?.gruender?.grunddaten?.vorname
      || 'Gründer/in';

    const businessType = geschaeftsmodell?.geschaeftsmodell?.kategorie || 'Dienstleistung';
    const generationDate = formatGermanDateLong(new Date());

    const content = [
      // Large top margin
      new Paragraph({ text: '', style: 'Normal' }),
      new Paragraph({ text: '', style: 'Normal' }),
      new Paragraph({ text: '', style: 'Normal' }),

      // Title
      new Paragraph({
        children: [
          new TextRun({
            text: 'BUSINESSPLAN',
            bold: true,
            size: 36,
            color: '000000'
          })
        ],
        alignment: AlignmentType.CENTER,
        spacing: { after: 600 }
      }),

      // Company name
      new Paragraph({
        children: [
          new TextRun({
            text: companyName,
            bold: true,
            size: 28,
            color: '333333'
          })
        ],
        alignment: AlignmentType.CENTER,
        spacing: { after: 400 }
      }),

      // Business type
      new Paragraph({
        children: [
          new TextRun({
            text: businessType,
            size: 18,
            italics: true,
            color: '666666'
          })
        ],
        alignment: AlignmentType.CENTER,
        spacing: { after: 800 }
      }),

      // Spacer
      new Paragraph({ text: '', style: 'Normal' }),
      new Paragraph({ text: '', style: 'Normal' }),
      new Paragraph({ text: '', style: 'Normal' }),

      // Author information
      new Paragraph({
        children: [
          new TextRun({
            text: 'Erstellt von:',
            bold: true,
            size: 14
          })
        ],
        alignment: AlignmentType.CENTER,
        spacing: { after: 200 }
      }),

      new Paragraph({
        children: [
          new TextRun({
            text: founderName,
            size: 16,
            color: '333333'
          })
        ],
        alignment: AlignmentType.CENTER,
        spacing: { after: 600 }
      }),

      // Generation date
      new Paragraph({
        children: [
          new TextRun({
            text: `Erstellt am: ${generationDate}`,
            size: 12,
            color: '666666'
          })
        ],
        alignment: AlignmentType.CENTER,
        spacing: { after: 200 }
      }),

      // BA compliance note
      new Paragraph({
        children: [
          new TextRun({
            text: 'Zur Vorlage bei der Bundesagentur für Arbeit',
            size: 12,
            italics: true,
            color: '666666'
          })
        ],
        alignment: AlignmentType.CENTER,
        spacing: { after: 400 }
      }),

      // Bottom spacer
      new Paragraph({ text: '', style: 'Normal' }),
      new Paragraph({ text: '', style: 'Normal' }),
      new Paragraph({ text: '', style: 'Normal' }),
      new Paragraph({ text: '', style: 'Normal' }),

      // Footer with generation info
      new Paragraph({
        children: [
          new TextRun({
            text: 'Erstellt mit dem GZ Businessplan Generator',
            size: 10,
            color: '999999'
          })
        ],
        alignment: AlignmentType.CENTER
      })
    ];

    return {
      id: 'cover-page',
      title: 'Deckblatt',
      number: '',
      content,
      pageBreakBefore: false
    };

  } catch (error) {
    console.error('Cover page generation failed:', error);

    // Fallback cover page
    return {
      id: 'cover-page',
      title: 'Deckblatt',
      number: '',
      content: [
        new Paragraph({
          children: [
            new TextRun({
              text: 'BUSINESSPLAN',
              bold: true,
              size: 36
            })
          ],
          alignment: AlignmentType.CENTER
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: 'Zur Vorlage bei der Bundesagentur für Arbeit',
              italics: true
            })
          ],
          alignment: AlignmentType.CENTER
        })
      ],
      pageBreakBefore: false
    };
  }
}