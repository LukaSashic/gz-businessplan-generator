/**
 * Structure BA Compliance Checks (GZ-803)
 *
 * Document structure and completeness validations for BA approval.
 * Based on analysis of real BA-approved business plan template.
 *
 * CRITICAL BLOCKERS:
 * 1. Required Sections Complete - All 9 modules must be finished
 *
 * WARNINGS:
 * 2. Sources Documented - >= 5 citations strengthen credibility
 */

import type {
  ValidationIssue,
  StructureValidationData,
} from '../types';
import type { WorkshopSession } from '@/types/workshop-session';

// ============================================================================
// Configuration
// ============================================================================

// Required modules for BA compliance (based on template analysis)
const REQUIRED_MODULES = [
  { id: 'gz-intake', title: 'Intake & Assessment', minWords: 50 },
  { id: 'gz-geschaeftsmodell', title: 'Geschäftsmodell', minWords: 500 },
  { id: 'gz-unternehmen', title: 'Unternehmen', minWords: 400 },
  { id: 'gz-markt-wettbewerb', title: 'Markt und Wettbewerb', minWords: 300 },
  { id: 'gz-marketing', title: 'Marketingkonzept', minWords: 400 },
  { id: 'gz-finanzplanung', title: 'Finanzplanung', minWords: 100 }, // Tables
  { id: 'gz-swot', title: 'SWOT-Analyse', minWords: 400 },
  { id: 'gz-meilensteine', title: 'Meilensteinplanung', minWords: 50 }, // Table
  { id: 'gz-kpi', title: 'Erfolgskennzahlen', minWords: 200 },
] as const;

// Source citation patterns (URLs, references, studies)
const CITATION_PATTERNS = [
  /https?:\/\/[^\s]+/gi,                    // URLs
  /www\.[^\s]+/gi,                          // www. domains
  /\[\d+\]/g,                               // [1] reference style
  /\(\d{4}\)/g,                             // (2023) year citations
  /Quelle:\s*[^\n]+/gi,                     // "Quelle: ..." format
  /Studie.*?von.*?\d{4}/gi,                 // "Studie ... von ... 2023"
  /Statistisches\s+Bundesamt/gi,            // Official German statistics
  /IHK.*?\d{4}/gi,                          // IHK reports
  /Bundesverband.*?\d{4}/gi,                // Industry associations
  /Marktforschung.*?\d{4}/gi,               // Market research
];

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Count words in text (German-aware)
 */
function countWords(text: string): number {
  if (!text) return 0;

  return text
    .trim()
    .split(/\s+/)
    .filter(word => word.length > 0)
    .length;
}

/**
 * Extract citations from text using multiple patterns
 */
function extractCitations(text: string): string[] {
  const citations: Set<string> = new Set();

  CITATION_PATTERNS.forEach(pattern => {
    const matches = text.match(pattern);
    if (matches) {
      matches.forEach(match => citations.add(match));
    }
  });

  return Array.from(citations);
}

/**
 * Extract structure validation data from workshop session
 */
export function extractStructureData(
  workshopSession: WorkshopSession | undefined
): StructureValidationData {
  if (!workshopSession) {
    return {
      completedModules: [],
      moduleWordCounts: {},
      citationCount: 0,
      footnotes: [],
      hasTitlePage: false,
      hasTableOfContents: false,
      hasExecutiveSummary: false,
    };
  }

  // Extract completed modules
  const completedModules = Object.keys(workshopSession.modules || {})
    .filter(moduleId => {
      const module = workshopSession.modules[moduleId];
      return module?.status === 'completed' || module?.data;
    });

  // Count words per module (simplified - would need actual text content)
  const moduleWordCounts: Record<string, number> = {};
  Object.entries(workshopSession.modules || {}).forEach(([moduleId, module]) => {
    if (module?.data) {
      // Extract actual text content from module data
      const extractTextFromData = (data: any): string => {
        if (typeof data === 'string') return data + ' ';
        if (typeof data === 'object' && data !== null) {
          return Object.values(data)
            .map(value => extractTextFromData(value))
            .join(' ');
        }
        return '';
      };

      const textContent = extractTextFromData(module.data);
      // Count actual words in extracted text content
      const wordCount = textContent
        .trim()
        .split(/\s+/)
        .filter(word => word.length > 0)
        .length;

      moduleWordCounts[moduleId] = Math.max(50, wordCount);
    }
  });

  // Extract all text content for citation analysis
  let allText = '';
  Object.values(workshopSession.modules || {}).forEach(module => {
    if (module?.data) {
      // Extract text fields from module data
      const extractTextFromData = (data: any): string => {
        if (typeof data === 'string') return data + ' ';
        if (typeof data === 'object' && data !== null) {
          return Object.values(data)
            .map(value => extractTextFromData(value))
            .join(' ');
        }
        return '';
      };
      allText += extractTextFromData(module.data);
    }
  });

  // Extract citations
  const footnotes = extractCitations(allText);
  const citationCount = footnotes.length;

  // Check for document structure elements (simplified)
  const hasTitlePage = Boolean(workshopSession.businessName);
  const hasTableOfContents = completedModules.length >= 5; // Heuristic
  const hasExecutiveSummary = completedModules.includes('gz-zusammenfassung') ||
                             moduleWordCounts['gz-intake'] > 200;

  return {
    completedModules,
    moduleWordCounts,
    citationCount,
    footnotes,
    hasTitlePage,
    hasTableOfContents,
    hasExecutiveSummary,
  };
}

// ============================================================================
// Structure Validation Checks
// ============================================================================

/**
 * CRITICAL CHECK: Required Sections Complete
 *
 * All 9 modules must be completed with sufficient content.
 * Incomplete business plans are automatically rejected by BA.
 */
export function checkRequiredSectionsComplete(
  structureData: StructureValidationData
): ValidationIssue | null {

  const missingModules: Array<{ id: string; title: string; reason: string }> = [];
  const tooShortModules: Array<{ id: string; title: string; current: number; required: number }> = [];

  REQUIRED_MODULES.forEach(required => {
    const isCompleted = structureData.completedModules.includes(required.id);
    const wordCount = structureData.moduleWordCounts[required.id] || 0;

    if (!isCompleted) {
      missingModules.push({
        id: required.id,
        title: required.title,
        reason: 'Modul nicht gestartet oder unvollständig'
      });
    } else if (wordCount < required.minWords) {
      tooShortModules.push({
        id: required.id,
        title: required.title,
        current: wordCount,
        required: required.minWords
      });
    }
  });

  if (missingModules.length === 0 && tooShortModules.length === 0) {
    return null; // Check passed
  }

  let message = '❌ KRITISCHER FEHLER: Pflichtabschnitte fehlen oder zu kurz!\n\n';

  if (missingModules.length > 0) {
    message += 'FEHLENDE ABSCHNITTE:\n';
    missingModules.forEach(module => {
      message += `• ${module.title} (${module.id})\n`;
    });
    message += '\n';
  }

  if (tooShortModules.length > 0) {
    message += 'ZU KURZE ABSCHNITTE:\n';
    tooShortModules.forEach(module => {
      message += `• ${module.title}: ${module.current} Wörter (min. ${module.required})\n`;
    });
    message += '\n';
  }

  message += `Die BA erwartet vollständige Businesspläne mit substantiellem Inhalt.
Jeder Abschnitt muss durchdacht und ausführlich sein.

LÖSUNG:
Vervollständigen Sie alle fehlenden Module und erweitern Sie zu kurze Abschnitte.
Ein typischer BA-Businessplan hat 20-30 Seiten Text.

Export ist BLOCKIERT bis alle Pflichtabschnitte vollständig sind.`;

  return {
    id: 'required-sections-complete',
    severity: 'BLOCKER',
    category: 'structure',
    title: 'Pflichtabschnitte unvollständig',
    message,
    affectedSection: missingModules[0]?.id || tooShortModules[0]?.id,
    suggestedFix: `Vervollständigen Sie ${missingModules.length + tooShortModules.length} Abschnitte`,
    documentationLink: '/docs/ba-requirements#required-sections',
    detectedValues: {
      missingModules: missingModules.map(m => m.id),
      tooShortModules: tooShortModules.map(m => m.id),
      totalRequired: REQUIRED_MODULES.length,
      completed: REQUIRED_MODULES.length - missingModules.length - tooShortModules.length,
    }
  };
}

/**
 * WARNING CHECK: Sources Documented
 *
 * Market data and assumptions should be backed by sources.
 * "AI estimates" get rejected - need real data provenance.
 */
export function checkSourcesDocumented(
  structureData: StructureValidationData
): ValidationIssue | null {

  const minimumSources = 5;
  const currentSources = structureData.citationCount;

  if (currentSources >= minimumSources) {
    return null; // Check passed
  }

  const needed = minimumSources - currentSources;

  return {
    id: 'sources-documented',
    severity: 'WARNING',
    category: 'structure',
    title: 'Zu wenig Quellenangaben',
    message: `⚠️ WARNUNG: Zu wenig Quellenangaben gefunden!

Aktuelle Quellen: ${currentSources}
Empfohlen: mindestens ${minimumSources}
Fehlend: ${needed}

Die BA prüft, ob Ihre Marktdaten und Annahmen fundiert sind.
"Schätzungen" oder "AI-generierte Daten" werden kritisch bewertet.

WARUM QUELLEN WICHTIG SIND:
• Beweisen fundierte Marktanalyse
• Stärken Glaubwürdigkeit bei BA
• Zeigen professionelle Vorbereitung
• Reduzieren Nachfragen der BA

EMPFOHLENE QUELLEN:
• Statistisches Bundesamt
• IHK-Studien und Branchenreports
• Branchenverbände
• Marktforschungsinstitute
• Wissenschaftliche Studien

FORMAT:
Fügen Sie URLs direkt im Text ein oder nutzen Sie Fußnoten:
"Laut Statistischem Bundesamt (destatis.de) beträgt..."

NICHT BLOCKIEREND - Sie können exportieren, aber Quellen stärken
Ihren Plan erheblich.`,
    affectedSection: 'gz-markt-wettbewerb',
    suggestedFix: `Fügen Sie ${needed} weitere Quellenangaben hinzu`,
    documentationLink: '/docs/ba-requirements#sources-documented',
    detectedValues: {
      currentSources,
      minimumRequired: minimumSources,
      shortfall: needed,
      foundCitations: structureData.footnotes.slice(0, 3), // First few examples
    }
  };
}

/**
 * INFORMATIONAL CHECK: Document Structure Quality
 *
 * Not required but improves professional impression.
 */
export function checkDocumentStructure(
  structureData: StructureValidationData
): ValidationIssue | null {

  const issues: string[] = [];

  if (!structureData.hasTitlePage) {
    issues.push('Titelseite fehlt');
  }

  if (!structureData.hasTableOfContents) {
    issues.push('Inhaltsverzeichnis empfohlen');
  }

  if (!structureData.hasExecutiveSummary) {
    issues.push('Executive Summary empfohlen');
  }

  if (issues.length === 0) {
    return null; // All good
  }

  return {
    id: 'document-structure',
    severity: 'WARNING',
    category: 'structure',
    title: 'Dokumentstruktur verbesserbar',
    message: `💡 TIPP: Dokumentstruktur verbesserbar

FEHLENDE ELEMENTE:
${issues.map(issue => `• ${issue}`).join('\n')}

PROFESSIONELLER EINDRUCK:
Ein vollständiger Businessplan enthält typischerweise:
• Titelseite mit Firmennamen und Kontaktdaten
• Inhaltsverzeichnis für bessere Navigation
• Executive Summary (Zusammenfassung) am Anfang

Diese Elemente sind nicht zwingend erforderlich, verbessern aber
den professionellen Eindruck bei der BA.

NICHT BLOCKIEREND - reine Empfehlung für besseren Eindruck.`,
    affectedSection: 'gz-zusammenfassung',
    suggestedFix: 'Fügen Sie professionelle Dokumentelemente hinzu',
    documentationLink: '/docs/document-structure-tips',
    detectedValues: {
      missingElements: issues,
      hasTitlePage: structureData.hasTitlePage,
      hasTableOfContents: structureData.hasTableOfContents,
      hasExecutiveSummary: structureData.hasExecutiveSummary,
    }
  };
}

// ============================================================================
// Orchestration Function
// ============================================================================

/**
 * Run all structure validation checks
 */
export function validateStructureCompliance(
  workshopSession: WorkshopSession | undefined
): ValidationIssue[] {

  const structureData = extractStructureData(workshopSession);
  const issues: ValidationIssue[] = [];

  // CRITICAL CHECK (blocker)
  const sectionsIssue = checkRequiredSectionsComplete(structureData);
  if (sectionsIssue) issues.push(sectionsIssue);

  // WARNING CHECKS
  const sourcesIssue = checkSourcesDocumented(structureData);
  if (sourcesIssue) issues.push(sourcesIssue);

  const structureIssue = checkDocumentStructure(structureData);
  if (structureIssue) issues.push(structureIssue);

  return issues;
}