/**
 * Table of Contents Generator (GZ-901)
 *
 * Creates professional table of contents for BA business plan.
 * Lists all sections with proper numbering.
 */

import {
  Paragraph,
  AlignmentType,
  TextRun,
  HeadingLevel,
  TabStopType,
  TabStopPosition,
  LeaderType
} from 'docx';
import type { WorkshopDataExtract, DocumentExportOptions, DocumentSection } from '../types';

/**
 * Generate table of contents
 */
export async function generateTableOfContents(
  dataExtract: WorkshopDataExtract,
  options: DocumentExportOptions
): Promise<DocumentSection> {
  try {
    const content = [
      // Title
      new Paragraph({
        children: [
          new TextRun({
            text: 'Inhaltsverzeichnis',
            bold: true,
            size: 18
          })
        ],
        heading: HeadingLevel.HEADING_1,
        spacing: { after: 400 }
      }),

      // Table of contents entries
      createTOCEntry('1.', 'Zusammenfassung', '3'),
      createTOCEntry('2.', 'Gründerperson', '5'),
      createTOCEntry('3.', 'Geschäftsidee', '7'),
      createTOCEntry('4.', 'Zielgruppe und Marktanalyse', '10'),
      createTOCEntry('5.', 'Geschäftsmodell und Wertversprechen', '13'),
      createTOCEntry('6.', 'Marketing und Vertrieb', '16'),
      createTOCEntry('7.', 'Organisation und Personal', '19'),
      createTOCEntry('8.', 'Finanzplanung', '22'),
      createSubTOCEntry('8.1', 'Kapitalbedarf', '22'),
      createSubTOCEntry('8.2', 'Finanzierung', '23'),
      createSubTOCEntry('8.3', 'Umsatzplanung', '24'),
      createSubTOCEntry('8.4', 'Kostenplanung', '25'),
      createSubTOCEntry('8.5', 'Rentabilität', '26'),
      createSubTOCEntry('8.6', 'Liquiditätsplanung', '27'),
      createTOCEntry('9.', 'SWOT-Analyse und Meilensteine', '28'),

      // Optional appendices
      ...(options.includeDetailedFinancials ? [
        new Paragraph({ text: '', style: 'Normal' }),
        new Paragraph({
          children: [
            new TextRun({
              text: 'Anhänge',
              bold: true,
              size: 14
            })
          ],
          spacing: { before: 200, after: 200 }
        }),
        createTOCEntry('A.', 'Detaillierte Finanzplanung', '30'),
        createTOCEntry('B.', 'Marktanalyse-Details', '35')
      ] : [])
    ];

    return {
      id: 'table-of-contents',
      title: 'Inhaltsverzeichnis',
      number: '',
      content,
      pageBreakBefore: true
    };

  } catch (error) {
    console.error('Table of contents generation failed:', error);

    // Fallback TOC
    return {
      id: 'table-of-contents',
      title: 'Inhaltsverzeichnis',
      number: '',
      content: [
        new Paragraph({
          children: [
            new TextRun({
              text: 'Inhaltsverzeichnis',
              bold: true,
              size: 18
            })
          ],
          heading: HeadingLevel.HEADING_1
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: 'Inhaltsverzeichnis wird automatisch generiert...',
              italics: true
            })
          ]
        })
      ],
      pageBreakBefore: true
    };
  }
}

/**
 * Create a main table of contents entry with dot leaders
 */
function createTOCEntry(number: string, title: string, page: string): Paragraph {
  return new Paragraph({
    children: [
      new TextRun({
        text: `${number} ${title}`,
        color: '000000'
      }),
      new TextRun({
        text: `\t${page}`,
        color: '000000'
      })
    ],
    tabStops: [
      {
        type: TabStopType.RIGHT,
        position: TabStopPosition.MAX,
        leader: LeaderType.DOT
      }
    ],
    spacing: { after: 120 }
  });
}

/**
 * Create a sub-section table of contents entry
 */
function createSubTOCEntry(number: string, title: string, page: string): Paragraph {
  return new Paragraph({
    children: [
      new TextRun({
        text: `\t${number} ${title}`,
        color: '333333'
      }),
      new TextRun({
        text: `\t${page}`,
        color: '333333'
      })
    ],
    tabStops: [
      {
        type: TabStopType.RIGHT,
        position: TabStopPosition.MAX,
        leader: LeaderType.DOT
      }
    ],
    spacing: { after: 80 }
  });
}