/**
 * Module Transition Framework
 *
 * Celebrates completion, recaps achievements, and previews next module
 */

import type { PartialIntakeOutput } from '@/types/modules/intake';
import type { PartialGeschaeftsmodellOutput } from '@/types/modules/geschaeftsmodell';

export interface Achievement {
  icon: string;
  label: string;
  value: string;
  status: 'complete' | 'warning' | 'info';
}

export interface DataQuality {
  score: number; // 0-100
  issues: Array<{
    severity: 'error' | 'warning' | 'info';
    message: string;
    action?: string;
  }>;
}

export interface TransitionSection {
  number: number;
  title: string;
  duration: string;
  description: string;
  deliverable: string;
}

export interface ModuleTransition {
  type: 'transition';
  completed: {
    moduleNumber: number;
    moduleTitle: string;
    duration: string;
    achievements: Achievement[];
    dataQuality: DataQuality;
  };
  next: {
    moduleNumber: number;
    moduleTitle: string;
    estimatedDuration: string;
    sections: TransitionSection[];
    whyImportant: string;
  };
  progress: {
    completedModules: number;
    totalModules: number;
    percentage: number;
    estimatedTimeRemaining: string;
  };
}

/**
 * Get personality archetype based on scores
 */
function getPersonalityArchetype(personality: PartialIntakeOutput['personality']): string {
  if (!personality) return 'Unternehmerin';

  const { achievement, autonomy, riskTaking, proactiveness, innovativeness } = personality;

  if (achievement === 'high' && autonomy === 'high') {
    return 'Selbstbestimmte Macherin';
  }
  if (riskTaking === 'low' && proactiveness === 'high') {
    return 'Vorsichtige Planerin';
  }
  if (achievement === 'high' && riskTaking === 'medium') {
    return 'Ambitionierte Realistin';
  }
  if (innovativeness === 'high' && autonomy === 'high') {
    return 'Kreative Pionierin';
  }
  if (riskTaking === 'low' && achievement === 'medium') {
    return 'Qualitätsorientierte Unternehmerin';
  }

  return 'Engagierte Gründerin';
}

/**
 * Assess data quality for a module
 */
function assessDataQuality(data: PartialIntakeOutput | null, module: number): DataQuality {
  const issues: DataQuality['issues'] = [];
  let score = 100;

  if (!data) {
    return { score: 0, issues: [{ severity: 'error', message: 'Keine Daten vorhanden' }] };
  }

  // Module 1 specific checks
  if (module === 1) {
    // Check business idea uniqueness
    if (!data.businessIdea?.uniqueValue) {
      issues.push({
        severity: 'warning',
        message: 'Alleinstellungsmerkmal könnte noch spezifischer sein',
        action: 'Im nächsten Modul konkretisieren wir das'
      });
      score -= 10;
    }

    // Check ALG eligibility
    if (data.founder?.currentStatus === 'unemployed') {
      if (data.founder?.algStatus?.daysRemaining !== undefined) {
        if (data.founder.algStatus.daysRemaining < 150) {
          issues.push({
            severity: 'error',
            message: 'ALG I-Restanspruch unter 150 Tage - GZ-Berechtigung gefährdet',
            action: 'Klären mit Arbeitsagentur vor Antragstellung'
          });
          score -= 50;
        }
      }
    }

    // Check capital
    if (data.resources?.financial?.availableCapital !== undefined) {
      if (data.resources.financial.availableCapital < 1000) {
        issues.push({
          severity: 'warning',
          message: 'Eigenkapital unter 1.000€ - möglicherweise knapp für Startkosten',
          action: 'Finanzplanung besonders sorgfältig durchführen'
        });
        score -= 15;
      }
    }

    // Check personality dimensions for development areas
    if (data.personality) {
      const dimensions = ['innovativeness', 'riskTaking', 'achievement', 'proactiveness', 'locusOfControl', 'selfEfficacy', 'autonomy'] as const;
      const lowScores = dimensions.filter(dim => data.personality?.[dim] === 'low');

      if (lowScores.length > 2) {
        issues.push({
          severity: 'info',
          message: `Entwicklungsfelder identifiziert: ${lowScores.length} Dimensionen`,
          action: 'Coaching-Schwerpunkte in späteren Modulen berücksichtigen'
        });
      }
    }

    // Check for complete personality assessment
    if (data.personality) {
      const dimensions = ['innovativeness', 'riskTaking', 'achievement', 'proactiveness', 'locusOfControl', 'selfEfficacy', 'autonomy'] as const;
      const completeDims = dimensions.filter(dim => data.personality?.[dim]);
      if (completeDims.length < 7) {
        issues.push({
          severity: 'warning',
          message: `Nur ${completeDims.length}/7 Persönlichkeitsdimensionen erfasst`,
          action: 'Fehlende Dimensionen werden im Modul vervollständigt'
        });
        score -= 5 * (7 - completeDims.length);
      }
    }
  }

  return { score: Math.max(0, score), issues };
}

/**
 * Assess data quality for geschaeftsmodell module (Module 2)
 */
function assessGeschaeftsmodellDataQuality(data: PartialGeschaeftsmodellOutput | null): DataQuality {
  const issues: DataQuality['issues'] = [];
  let score = 100;

  if (!data) {
    return { score: 0, issues: [{ severity: 'error', message: 'Keine Daten vorhanden' }] };
  }

  // Check offering clarity
  if (!data.offering?.mainOffering) {
    issues.push({
      severity: 'error',
      message: 'Hauptangebot nicht definiert',
      action: 'Im Gespräch konkretisieren'
    });
    score -= 25;
  }

  if (!data.offering?.oneSentencePitch) {
    issues.push({
      severity: 'warning',
      message: 'Elevator Pitch fehlt',
      action: 'Kurzbeschreibung in 1-2 Sätzen erstellen'
    });
    score -= 10;
  }

  // Check target audience
  if (!data.targetAudience?.primaryPersona?.name) {
    issues.push({
      severity: 'error',
      message: 'Zielgruppe nicht spezifiziert',
      action: 'Konkrete Persona definieren'
    });
    score -= 25;
  }

  if (!data.targetAudience?.marketSize?.serviceableMarket) {
    issues.push({
      severity: 'warning',
      message: 'Marktgröße (SAM) nicht quantifiziert',
      action: 'Erreichbare Marktgröße recherchieren'
    });
    score -= 10;
  }

  // Check USP
  if (!data.usp?.statement) {
    issues.push({
      severity: 'warning',
      message: 'USP nicht formuliert',
      action: 'Alleinstellungsmerkmal entwickeln'
    });
    score -= 15;
  } else if (data.usp.uspTest) {
    const { isUnique, isRelevant, isProvable } = data.usp.uspTest;
    if (!isUnique || !isRelevant || !isProvable) {
      issues.push({
        severity: 'warning',
        message: 'USP besteht nicht alle Tests',
        action: 'USP überarbeiten für mehr Schärfe'
      });
      score -= 10;
    }
  }

  // Check competitors
  const competitorCount = data.competitiveAnalysis?.directCompetitors?.length || 0;
  if (competitorCount < 3) {
    issues.push({
      severity: 'error',
      message: `Nur ${competitorCount} Wettbewerber - BA erwartet mindestens 3`,
      action: 'Weitere Wettbewerber recherchieren'
    });
    score -= 20;
  }

  // Check value proposition
  if (!data.valueProposition?.valueStatement) {
    issues.push({
      severity: 'warning',
      message: 'Wertversprechen nicht ausformuliert',
      action: 'Kundennutzen klar beschreiben'
    });
    score -= 10;
  }

  return { score: Math.max(0, score), issues };
}

/**
 * Generate module transition data
 */
export function generateModuleTransition(
  fromModule: number,
  toModule: number,
  workshopData: PartialIntakeOutput | null
): ModuleTransition {
  // Module 1 -> 2 transition (most detailed)
  if (fromModule === 1 && toModule === 2) {
    const archetype = workshopData?.personality ? getPersonalityArchetype(workshopData.personality) : 'Gründerin';

    const achievements: Achievement[] = [];

    // Business idea achievement
    if (workshopData?.businessIdea?.elevator_pitch) {
      achievements.push({
        icon: '✓',
        label: 'Geschäftsidee validiert',
        value: workshopData.businessIdea.elevator_pitch.substring(0, 100) + (workshopData.businessIdea.elevator_pitch.length > 100 ? '...' : ''),
        status: 'complete'
      });
    }

    // Founder profile achievement
    if (workshopData?.founder?.experience?.yearsInIndustry !== undefined) {
      const algInfo = workshopData.founder.algStatus
        ? `, ${workshopData.founder.algStatus.daysRemaining} Tage ALG I`
        : '';
      achievements.push({
        icon: '✓',
        label: 'Gründerprofil erstellt',
        value: `${workshopData.founder.experience.yearsInIndustry} Jahre Erfahrung${algInfo}`,
        status: 'complete'
      });
    }

    // Personality achievement
    if (workshopData?.personality?.narrative || archetype) {
      achievements.push({
        icon: '✓',
        label: 'Persönlichkeit erfasst',
        value: archetype,
        status: 'complete'
      });
    }

    // Resources achievement
    if (workshopData?.resources?.financial?.availableCapital !== undefined) {
      const gzAmount = workshopData.resources.financial.expectedGZ || 0;
      achievements.push({
        icon: '✓',
        label: 'Ressourcen dokumentiert',
        value: `${workshopData.resources.financial.availableCapital.toLocaleString('de-DE')}€ Eigenkapital${gzAmount > 0 ? ` + ${gzAmount.toLocaleString('de-DE')}€ GZ` : ''}`,
        status: 'complete'
      });
    }

    // GZ eligibility achievement
    const isEligible = workshopData?.validation?.isGZEligible ?? (workshopData?.founder?.algStatus?.daysRemaining ?? 0) >= 150;
    achievements.push({
      icon: isEligible ? '✓' : '⚠',
      label: 'GZ-Berechtigung',
      value: isEligible ? 'Bestätigt' : 'Prüfung erforderlich',
      status: isEligible ? 'complete' : 'warning'
    });

    return {
      type: 'transition',
      completed: {
        moduleNumber: 1,
        moduleTitle: 'Intake & Gründerprofil',
        duration: 'ca. 45 Minuten',
        achievements,
        dataQuality: assessDataQuality(workshopData, 1)
      },
      next: {
        moduleNumber: 2,
        moduleTitle: 'Geschäftsmodell',
        estimatedDuration: '60-90 Minuten',
        sections: [
          {
            number: 1,
            title: 'Zielgruppen-Definition',
            duration: '15 Min',
            description: 'Deine Kundengruppen konkret beschreiben mit Demografie, Problemen und Kaufkraft',
            deliverable: '2-3 detaillierte Personas mit Marktgrößen-Schätzung'
          },
          {
            number: 2,
            title: 'Wertversprechen schärfen',
            duration: '20 Min',
            description: 'Was macht dein Angebot einzigartig? Warum kaufen Kunden bei DIR?',
            deliverable: 'Value Proposition Canvas + Alleinstellungsmerkmale'
          },
          {
            number: 3,
            title: 'Erlösmodell entwickeln',
            duration: '30 Min',
            description: 'Preise kalkulieren, Break-Even berechnen, Umsatzprognose erstellen',
            deliverable: 'Preisliste + 12-Monats-Umsatzplanung'
          },
          {
            number: 4,
            title: 'Angebots-Struktur',
            duration: '15 Min',
            description: 'Pakete/Leistungen definieren, Zusatzverkäufe planen',
            deliverable: 'Strukturierte Angebotsübersicht'
          }
        ],
        whyImportant: `Die Bundesagentur lehnt 30% der Anträge ab, weil das Geschäftsmodell unklar ist. Wir machen deins wasserdicht mit:

• Konkreten Zielgruppen (nicht "alle jungen Mütter")
• Realistischer Preiskalkulation (kein Dumping, kein Wunschdenken)
• Nachvollziehbarem Umsatzplan (Kunde × Preis × Frequenz)

Nach diesem Modul kannst du jedem erklären: "So verdiene ich Geld."`
      },
      progress: {
        completedModules: 1,
        totalModules: 10,
        percentage: 10,
        estimatedTimeRemaining: '7-9 Stunden'
      }
    };
  }

  // Module 2 -> 3 transition
  if (fromModule === 2 && toModule === 3) {
    const geschaeftsmodellData = workshopData as unknown as PartialGeschaeftsmodellOutput;
    const achievements: Achievement[] = [];

    // Offering achievement
    if (geschaeftsmodellData?.offering?.mainOffering) {
      achievements.push({
        icon: '✓',
        label: 'Angebot definiert',
        value: geschaeftsmodellData.offering.oneSentencePitch ||
          geschaeftsmodellData.offering.mainOffering.substring(0, 80) + '...',
        status: 'complete'
      });
    }

    // Target audience achievement
    if (geschaeftsmodellData?.targetAudience?.primaryPersona?.name) {
      const marketInfo = geschaeftsmodellData.targetAudience.marketSize?.serviceableMarket
        ? ` (SAM: ${geschaeftsmodellData.targetAudience.marketSize.serviceableMarket.toLocaleString('de-DE')})`
        : '';
      achievements.push({
        icon: '✓',
        label: 'Zielgruppe definiert',
        value: `${geschaeftsmodellData.targetAudience.primaryPersona.name}${marketInfo}`,
        status: 'complete'
      });
    }

    // Value proposition achievement
    if (geschaeftsmodellData?.valueProposition?.valueStatement) {
      achievements.push({
        icon: '✓',
        label: 'Wertversprechen formuliert',
        value: geschaeftsmodellData.valueProposition.valueStatement.substring(0, 80) + '...',
        status: 'complete'
      });
    }

    // USP achievement
    if (geschaeftsmodellData?.usp?.statement) {
      const uspStatus = geschaeftsmodellData.usp.uspTest?.isUnique &&
        geschaeftsmodellData.usp.uspTest?.isRelevant &&
        geschaeftsmodellData.usp.uspTest?.isProvable
        ? 'complete' : 'warning';
      achievements.push({
        icon: uspStatus === 'complete' ? '✓' : '⚠',
        label: 'USP entwickelt',
        value: geschaeftsmodellData.usp.statement.substring(0, 80) + '...',
        status: uspStatus
      });
    }

    // Competitive analysis achievement
    const competitorCount = geschaeftsmodellData?.competitiveAnalysis?.directCompetitors?.length || 0;
    if (competitorCount > 0) {
      achievements.push({
        icon: competitorCount >= 3 ? '✓' : '⚠',
        label: 'Wettbewerbsanalyse',
        value: `${competitorCount} Wettbewerber analysiert`,
        status: competitorCount >= 3 ? 'complete' : 'warning'
      });
    }

    return {
      type: 'transition',
      completed: {
        moduleNumber: 2,
        moduleTitle: 'Geschäftsmodell',
        duration: 'ca. 60-90 Minuten',
        achievements,
        dataQuality: assessGeschaeftsmodellDataQuality(geschaeftsmodellData)
      },
      next: {
        moduleNumber: 3,
        moduleTitle: 'Unternehmen & Standort',
        estimatedDuration: '45-60 Minuten',
        sections: [
          {
            number: 1,
            title: 'Rechtsform wählen',
            duration: '15 Min',
            description: 'Die passende Rechtsform für dein Unternehmen auswählen (Einzelunternehmen, GbR, UG, GmbH)',
            deliverable: 'Begründete Rechtsformwahl mit Vor-/Nachteilen'
          },
          {
            number: 2,
            title: 'Standort definieren',
            duration: '10 Min',
            description: 'Home Office, Co-Working, eigene Räume? Standortfaktoren bewerten',
            deliverable: 'Standortentscheidung mit Kostenabschätzung'
          },
          {
            number: 3,
            title: 'Prozesse & Tools',
            duration: '20 Min',
            description: 'Wie erbringst du deine Leistung? Welche Tools/Software benötigst du?',
            deliverable: 'Prozessübersicht und Tool-Liste'
          }
        ],
        whyImportant: `Die Bundesagentur prüft, ob dein Unternehmen solide aufgestellt ist:

• Rechtsform passend zum Geschäftsmodell und Risikoprofil
• Standortwahl wirtschaftlich sinnvoll
• Operative Prozesse durchdacht

Diese Entscheidungen haben direkte Auswirkungen auf die Finanzplanung (Modul 6).`
      },
      progress: {
        completedModules: 2,
        totalModules: 10,
        percentage: 20,
        estimatedTimeRemaining: '6-8 Stunden'
      }
    };
  }

  // Default transition for other modules
  return generateDefaultTransition(fromModule, toModule, workshopData);
}

/**
 * Generate default transition for modules without specific templates
 */
function generateDefaultTransition(
  fromModule: number,
  toModule: number,
  workshopData: PartialIntakeOutput | null
): ModuleTransition {
  const moduleInfo: Record<number, { title: string; duration: string }> = {
    1: { title: 'Intake & Gründerprofil', duration: '45-60 Min' },
    2: { title: 'Geschäftsmodell', duration: '60-90 Min' },
    3: { title: 'Unternehmen & Standort', duration: '45-60 Min' },
    4: { title: 'Markt & Wettbewerb', duration: '60-90 Min' },
    5: { title: 'Marketing', duration: '60-90 Min' },
    6: { title: 'Finanzplanung', duration: '120-180 Min' },
    7: { title: 'SWOT-Analyse', duration: '30-45 Min' },
    8: { title: 'Meilensteine', duration: '30-45 Min' },
    9: { title: 'KPIs', duration: '30-45 Min' },
    10: { title: 'Zusammenfassung', duration: '30 Min' }
  };

  const completed = moduleInfo[fromModule] || { title: `Modul ${fromModule}`, duration: '45 Min' };
  const next = moduleInfo[toModule] || { title: `Modul ${toModule}`, duration: '45 Min' };

  return {
    type: 'transition',
    completed: {
      moduleNumber: fromModule,
      moduleTitle: completed.title,
      duration: completed.duration,
      achievements: [
        {
          icon: '✓',
          label: `Modul ${fromModule} abgeschlossen`,
          value: completed.title,
          status: 'complete'
        }
      ],
      dataQuality: { score: 85, issues: [] }
    },
    next: {
      moduleNumber: toModule,
      moduleTitle: next.title,
      estimatedDuration: next.duration,
      sections: [],
      whyImportant: `Dieses Modul baut auf den vorherigen Erkenntnissen auf und bringt dich näher an deinen fertigen Businessplan.`
    },
    progress: {
      completedModules: fromModule,
      totalModules: 10,
      percentage: fromModule * 10,
      estimatedTimeRemaining: `${Math.max(1, 10 - fromModule)} Module übrig`
    }
  };
}

/**
 * Check if a module transition should be shown
 */
export function shouldShowTransition(
  currentPhase: string,
  moduleData: PartialIntakeOutput | null
): boolean {
  // Show transition when validation phase is complete
  if (currentPhase === 'completed' || currentPhase === 'validation') {
    // Check if we have enough data
    const hasBasicData = moduleData?.businessIdea?.elevator_pitch &&
      moduleData?.founder?.experience &&
      moduleData?.validation;
    return Boolean(hasBasicData);
  }
  return false;
}
