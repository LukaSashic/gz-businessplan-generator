/**
 * Executive Summary Generator (GZ-901)
 *
 * Creates Section 1: Zusammenfassung (Executive Summary).
 * Most important section that summarizes the entire business plan.
 */

import { Paragraph, HeadingLevel } from 'docx';
import type { WorkshopDataExtract, DocumentExportOptions, DocumentSection } from '../types';
import { createHeading, createBodyParagraph, createBulletParagraph } from '../document-builder';
import { formatEUR } from '../formatters/currency';

/**
 * Generate executive summary section
 */
export async function generateExecutiveSummary(
  dataExtract: WorkshopDataExtract,
  options: DocumentExportOptions
): Promise<DocumentSection> {
  try {
    const zusammenfassung = dataExtract.modules.zusammenfassung;
    const intake = dataExtract.modules.intake;
    const finanzplanung = dataExtract.modules.finanzplanung;

    // Extract key information
    const businessName = zusammenfassung?.zusammenfassung?.geschaeftsname
      || intake?.geschaeftsidee?.produktDienstleistung
      || 'Das Unternehmen';

    const businessDescription = zusammenfassung?.zusammenfassung?.kurzbeschreibung
      || intake?.geschaeftsidee?.problembeschreibung
      || 'Eine innovative Geschäftsidee.';

    const targetMarket = zusammenfassung?.zusammenfassung?.zielmarkt
      || intake?.geschaeftsidee?.zielgruppe
      || 'Verschiedene Zielgruppen';

    const financialProjection = finanzplanung?.rentabilitaet?.gewinnJahr1
      ? `Im ersten Jahr wird ein Gewinn von ${formatEUR(finanzplanung.rentabilitaet.gewinnJahr1)} erwartet.`
      : 'Finanzielle Projektion siehe Finanzplanung.';

    const content = [
      // Section heading
      createHeading('1. Zusammenfassung', HeadingLevel.HEADING_1),

      // Overview paragraph
      createBodyParagraph(
        `${businessName} ist ein innovatives Unternehmen mit Fokus auf ${businessDescription.toLowerCase()}. ` +
        `Das Unternehmen richtet sich an ${targetMarket} und bietet einen klaren Mehrwert durch ` +
        `differenzierte Produkte und Dienstleistungen.`
      ),

      // Key points heading
      createHeading('Kernpunkte des Geschäftskonzepts:', HeadingLevel.HEADING_3),

      // Key points as bullets
      createBulletParagraph(
        `Geschäftsidee: ${businessDescription}`
      ),
      createBulletParagraph(
        `Zielmarkt: ${targetMarket}`
      ),
      createBulletParagraph(
        `Alleinstellungsmerkmal: Innovative Lösung für bestehende Marktprobleme`
      ),
      createBulletParagraph(
        `Finanzielle Aussichten: ${financialProjection}`
      ),

      // BA compliance statement
      createHeading('Erfüllung der BA-Anforderungen:', HeadingLevel.HEADING_3),
      createBodyParagraph(
        'Dieser Businessplan erfüllt alle Anforderungen der Bundesagentur für Arbeit für die ' +
        'Beantragung des Gründungszuschusses. Die detaillierte Finanzplanung zeigt die ' +
        'wirtschaftliche Tragfähigkeit des Unternehmens über drei Jahre auf.'
      )
    ];

    return {
      id: 'zusammenfassung',
      title: 'Zusammenfassung',
      number: '1',
      content,
      pageBreakBefore: false
    };

  } catch (error) {
    console.error('Executive summary generation failed:', error);

    // Fallback summary
    return {
      id: 'zusammenfassung',
      title: 'Zusammenfassung',
      number: '1',
      content: [
        createHeading('1. Zusammenfassung', HeadingLevel.HEADING_1),
        createBodyParagraph(
          'Diese Zusammenfassung konnte aufgrund unvollständiger Daten nicht automatisch ' +
          'generiert werden. Bitte überprüfen Sie das Zusammenfassung-Modul und versuchen ' +
          'Sie den Export erneut.'
        )
      ],
      pageBreakBefore: false
    };
  }
}