/**
 * DIN 5008 Document Styling Templates (GZ-901)
 *
 * Professional German business document formatting standards.
 * Ensures BA-compliant appearance and readability.
 *
 * DIN 5008 requirements:
 * - Fonts: Calibri, Arial, or Times New Roman
 * - Margins: 2.5cm left, 2cm right/top/bottom
 * - Line spacing: 1.15-1.5
 * - Consistent heading hierarchy
 */

import {
  Document,
  IStylesOptions,
  AlignmentType,
  UnderlineType,
  IDocumentStyles,
  HeadingLevel,
  BorderStyle
} from 'docx';
import type { DIN5008Styles } from '../types';

// ============================================================================
// DIN 5008 Configuration Constants
// ============================================================================

/**
 * DIN 5008 styling configuration
 */
export const DIN5008_CONFIG: DIN5008Styles = {
  fonts: {
    heading: 'Calibri',
    body: 'Calibri',
    size: {
      heading1: 18, // 18pt for main headings
      heading2: 14, // 14pt for sub-headings
      heading3: 12, // 12pt for sub-sub-headings
      body: 11     // 11pt for body text
    }
  },

  margins: {
    top: 567,    // 2cm in twips (567 twips = 2cm)
    right: 567,  // 2cm
    bottom: 567, // 2cm
    left: 708    // 2.5cm in twips (708 twips = 2.5cm)
  },

  lineSpacing: 1.15, // Standard German business line spacing

  colors: {
    heading: '1F4E79',  // Professional dark blue
    body: '000000',     // Black for body text
    accent: '4472C4'    // Accent blue for emphasis
  }
};

// ============================================================================
// Document Styles Definition
// ============================================================================

/**
 * Get complete DIN 5008 compliant document styles
 */
export function getDIN5008Styles(): IStylesOptions {
  return {
    default: {
      heading1: {
        name: 'Heading 1',
        basedOn: 'Normal',
        next: 'Normal',
        quickFormat: true,
        run: {
          size: DIN5008_CONFIG.fonts.size.heading1 * 2, // Convert to half-points
          bold: true,
          color: DIN5008_CONFIG.colors.heading,
          font: DIN5008_CONFIG.fonts.heading
        },
        paragraph: {
          alignment: AlignmentType.LEFT,
          spacing: {
            before: 400, // Space before heading
            after: 200,  // Space after heading
            line: Math.round(DIN5008_CONFIG.lineSpacing * 240) // Line spacing in twips
          }
        }
      },

      heading2: {
        name: 'Heading 2',
        basedOn: 'Normal',
        next: 'Normal',
        quickFormat: true,
        run: {
          size: DIN5008_CONFIG.fonts.size.heading2 * 2,
          bold: true,
          color: DIN5008_CONFIG.colors.heading,
          font: DIN5008_CONFIG.fonts.heading
        },
        paragraph: {
          alignment: AlignmentType.LEFT,
          spacing: {
            before: 300,
            after: 150,
            line: Math.round(DIN5008_CONFIG.lineSpacing * 240)
          }
        }
      },

      heading3: {
        name: 'Heading 3',
        basedOn: 'Normal',
        next: 'Normal',
        quickFormat: true,
        run: {
          size: DIN5008_CONFIG.fonts.size.heading3 * 2,
          bold: true,
          color: DIN5008_CONFIG.colors.heading,
          font: DIN5008_CONFIG.fonts.heading
        },
        paragraph: {
          alignment: AlignmentType.LEFT,
          spacing: {
            before: 200,
            after: 100,
            line: Math.round(DIN5008_CONFIG.lineSpacing * 240)
          }
        }
      },

      document: {
        run: {
          size: DIN5008_CONFIG.fonts.size.body * 2,
          font: DIN5008_CONFIG.fonts.body,
          color: DIN5008_CONFIG.colors.body
        },
        paragraph: {
          alignment: AlignmentType.LEFT,
          spacing: {
            line: Math.round(DIN5008_CONFIG.lineSpacing * 240),
            after: 120 // Small space after paragraphs
          }
        }
      }
    },

    paragraphStyles: [
      // Body text style
      {
        id: 'Body',
        name: 'Body Text',
        basedOn: 'Normal',
        quickFormat: true,
        run: {
          size: DIN5008_CONFIG.fonts.size.body * 2,
          font: DIN5008_CONFIG.fonts.body,
          color: DIN5008_CONFIG.colors.body
        },
        paragraph: {
          alignment: AlignmentType.JUSTIFIED,
          spacing: {
            line: Math.round(DIN5008_CONFIG.lineSpacing * 240),
            after: 120
          }
        }
      },

      // Bullet list style
      {
        id: 'BulletList',
        name: 'Bullet List',
        basedOn: 'Body',
        quickFormat: true,
        paragraph: {
          alignment: AlignmentType.LEFT,
          spacing: {
            line: Math.round(DIN5008_CONFIG.lineSpacing * 240),
            after: 80,
            before: 40
          },
          indent: {
            left: 360, // Indent for bullets
            hanging: 180
          }
        }
      },

      // Table header style
      {
        id: 'TableHeader',
        name: 'Table Header',
        basedOn: 'Normal',
        quickFormat: true,
        run: {
          size: DIN5008_CONFIG.fonts.size.body * 2,
          font: DIN5008_CONFIG.fonts.body,
          bold: true,
          color: DIN5008_CONFIG.colors.heading
        },
        paragraph: {
          alignment: AlignmentType.CENTER,
          spacing: {
            line: 240, // Single line spacing for tables
            after: 0,
            before: 0
          }
        }
      },

      // Table body style
      {
        id: 'TableBody',
        name: 'Table Body',
        basedOn: 'Normal',
        quickFormat: true,
        run: {
          size: DIN5008_CONFIG.fonts.size.body * 2,
          font: DIN5008_CONFIG.fonts.body,
          color: DIN5008_CONFIG.colors.body
        },
        paragraph: {
          alignment: AlignmentType.LEFT,
          spacing: {
            line: 240,
            after: 0,
            before: 0
          }
        }
      },

      // Table numbers (right-aligned)
      {
        id: 'TableNumber',
        name: 'Table Number',
        basedOn: 'TableBody',
        quickFormat: true,
        paragraph: {
          alignment: AlignmentType.RIGHT,
          spacing: {
            line: 240,
            after: 0,
            before: 0
          }
        }
      },

      // Table total row style
      {
        id: 'TableTotal',
        name: 'Table Total',
        basedOn: 'TableBody',
        quickFormat: true,
        run: {
          bold: true,
          color: DIN5008_CONFIG.colors.heading
        },
        paragraph: {
          alignment: AlignmentType.RIGHT,
          spacing: {
            line: 240,
            after: 0,
            before: 0
          }
        }
      },

      // Emphasis style
      {
        id: 'Emphasis',
        name: 'Emphasis',
        basedOn: 'Body',
        quickFormat: true,
        run: {
          italics: true,
          color: DIN5008_CONFIG.colors.accent
        }
      },

      // Strong emphasis
      {
        id: 'Strong',
        name: 'Strong',
        basedOn: 'Body',
        quickFormat: true,
        run: {
          bold: true,
          color: DIN5008_CONFIG.colors.heading
        }
      }
    ]
  };
}

// ============================================================================
// Document Properties and Settings
// ============================================================================

/**
 * Get DIN 5008 compliant document properties
 */
export function getDIN5008DocumentProperties(): {
  margins: typeof DIN5008_CONFIG.margins;
  defaultLanguage: string;
  evenAndOddHeaders: boolean;
} {
  return {
    margins: DIN5008_CONFIG.margins,
    defaultLanguage: 'de-DE',
    evenAndOddHeaders: false // Single-sided documents
  };
}

/**
 * Create page number formatting (DIN 5008: "Seite X von Y" at bottom center)
 */
export function createPageNumbering() {
  return {
    footer: {
      default: {
        children: [
          {
            children: [
              {
                text: 'Seite ',
                style: 'Body'
              },
              {
                children: [{
                  type: 'PAGE_NUMBER'
                }]
              },
              {
                text: ' von ',
                style: 'Body'
              },
              {
                children: [{
                  type: 'TOTAL_PAGES'
                }]
              }
            ],
            alignment: AlignmentType.CENTER,
            style: 'Body'
          }
        ]
      }
    }
  };
}

// ============================================================================
// Table Styling Helpers
// ============================================================================

/**
 * Get standard table borders (DIN 5008 compliant)
 */
export function getStandardTableBorders() {
  return {
    top: { style: BorderStyle.SINGLE, size: 1, color: '000000' },
    bottom: { style: BorderStyle.SINGLE, size: 1, color: '000000' },
    left: { style: BorderStyle.SINGLE, size: 1, color: '000000' },
    right: { style: BorderStyle.SINGLE, size: 1, color: '000000' },
    insideHorizontal: { style: BorderStyle.SINGLE, size: 1, color: '000000' },
    insideVertical: { style: BorderStyle.SINGLE, size: 1, color: '000000' }
  };
}

/**
 * Get table header shading
 */
export function getTableHeaderShading() {
  return {
    fill: 'E7E6E6', // Light gray
    type: 'clear'
  };
}

/**
 * Get table total row shading
 */
export function getTableTotalShading() {
  return {
    fill: 'F2F2F2', // Very light gray
    type: 'clear'
  };
}

// ============================================================================
// Validation and Quality Checks
// ============================================================================

/**
 * Validate that styles meet DIN 5008 requirements
 */
export function validateDIN5008Compliance(): {
  isCompliant: boolean;
  issues: string[];
} {
  const issues: string[] = [];

  // Check font requirements
  const allowedFonts = ['Calibri', 'Arial', 'Times New Roman'];
  if (!allowedFonts.includes(DIN5008_CONFIG.fonts.body)) {
    issues.push(`Body font ${DIN5008_CONFIG.fonts.body} not DIN 5008 compliant`);
  }

  // Check margin requirements
  if (DIN5008_CONFIG.margins.left < 700) {
    issues.push('Left margin must be at least 2.5cm (700 twips)');
  }

  if (DIN5008_CONFIG.margins.right < 567) {
    issues.push('Right margin must be at least 2cm (567 twips)');
  }

  // Check line spacing
  if (DIN5008_CONFIG.lineSpacing < 1.0 || DIN5008_CONFIG.lineSpacing > 1.5) {
    issues.push('Line spacing should be between 1.0 and 1.5 for DIN 5008');
  }

  return {
    isCompliant: issues.length === 0,
    issues
  };
}

/**
 * Get summary of current styling configuration
 */
export function getStyleSummary(): {
  fonts: typeof DIN5008_CONFIG.fonts;
  margins: string;
  lineSpacing: number;
  compliance: boolean;
} {
  const validation = validateDIN5008Compliance();

  return {
    fonts: DIN5008_CONFIG.fonts,
    margins: `${DIN5008_CONFIG.margins.top/283.5}cm top, ${DIN5008_CONFIG.margins.right/283.5}cm right, ${DIN5008_CONFIG.margins.bottom/283.5}cm bottom, ${DIN5008_CONFIG.margins.left/283.5}cm left`,
    lineSpacing: DIN5008_CONFIG.lineSpacing,
    compliance: validation.isCompliant
  };
}