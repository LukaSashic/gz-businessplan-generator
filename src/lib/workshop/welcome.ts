/**
 * Welcome & Orientation System for GZ Workshop
 *
 * Provides clear context at conversation start with:
 * - Workshop overview
 * - Module 1 structure
 * - Time estimate
 * - How it works
 */

export interface ModulePreview {
  number: number;
  title: string;
  duration: string;
  objectives: string[];
  phases: Array<{
    name: string;
    description: string;
  }>;
}

export interface WelcomeMessage {
  type: 'welcome';
  content: {
    greeting: string;
    workshopOverview: string;
    modulePreview: ModulePreview;
    instructions: string[];
    callToAction: string;
  };
  metadata: {
    showProgressBar: boolean;
    totalModules: number;
    estimatedDuration: string;
  };
}

/**
 * Generate the welcome message for the workshop
 */
export function generateWelcomeMessage(): WelcomeMessage {
  return {
    type: 'welcome',
    content: {
      greeting: 'Willkommen zum Gründungszuschuss Workshop!',

      workshopOverview: `Ich helfe dir, einen überzeugenden Businessplan für die Bundesagentur für Arbeit zu erstellen. Der Workshop ist in 10 Module aufgeteilt und dauert insgesamt 8-10 Stunden.

Du kannst jederzeit pausieren - dein Fortschritt wird automatisch gespeichert.`,

      modulePreview: {
        number: 1,
        title: 'Intake & Gründerprofil',
        duration: '45-60 Minuten',
        objectives: [
          'Deine Geschäftsidee validieren',
          'Deine Qualifikationen erfassen',
          'Deine unternehmerischen Stärken identifizieren',
          'Deine Ressourcen dokumentieren',
          'GZ-Berechtigung prüfen'
        ],
        phases: [
          {
            name: 'Warm-Up',
            description: 'Wir starten positiv mit deinen bisherigen Erfolgen'
          },
          {
            name: 'Geschäftsidee',
            description: 'Was machst du, für wen, und warum gerade du?'
          },
          {
            name: 'Gründerprofil',
            description: 'Deine Erfahrung, Qualifikation und aktuelle Situation'
          },
          {
            name: 'Unternehmerische Persönlichkeit',
            description: 'Praxisnahe Szenarien zu deinem Geschäft'
          },
          {
            name: 'Ressourcen',
            description: 'Zeit, Geld, Netzwerk - was bringst du mit?'
          }
        ]
      },

      instructions: [
        'Ich stelle dir Fragen im Gespräch - ganz natürlich, wie mit einem Coach',
        'Du antwortest in deinen eigenen Worten, keine Fachsprache nötig',
        'Rechts siehst du live, wie dein Businessplan wächst',
        'Du kannst jederzeit Pausen machen - alles wird gespeichert',
        'Am Ende jedes Moduls bekommst du eine Zusammenfassung'
      ],

      callToAction: `Bereit? Dann starten wir positiv:

Erzähl mir von einem beruflichen Erfolg, auf den du stolz bist - ein Projekt, eine Herausforderung die du gemeistert hast, oder ein Ziel das du erreicht hast. Was hat diesen Erfolg möglich gemacht?`
    },

    metadata: {
      showProgressBar: true,
      totalModules: 10,
      estimatedDuration: '8-10 Stunden'
    }
  };
}

/**
 * Get module-specific welcome content for modules 2-10
 */
export function getModuleWelcome(moduleNumber: number): ModulePreview | null {
  const moduleWelcomes: Record<number, ModulePreview> = {
    2: {
      number: 2,
      title: 'Geschäftsmodell',
      duration: '60-90 Minuten',
      objectives: [
        'Dein Angebot konkret beschreiben',
        'Zielgruppe mit Personas definieren',
        'Kundennutzen aus Kundensicht formulieren',
        'Alleinstellungsmerkmal entwickeln'
      ],
      phases: [
        { name: 'Zielgruppen-Definition', description: 'Deine Kundengruppen konkret beschreiben mit Demografie, Problemen und Kaufkraft' },
        { name: 'Wertversprechen schärfen', description: 'Was macht dein Angebot einzigartig? Warum kaufen Kunden bei DIR?' },
        { name: 'Erlösmodell entwickeln', description: 'Preise kalkulieren, Break-Even berechnen, Umsatzprognose erstellen' },
        { name: 'Angebots-Struktur', description: 'Pakete/Leistungen definieren, Zusatzverkäufe planen' }
      ]
    },
    3: {
      number: 3,
      title: 'Unternehmen & Standort',
      duration: '45-60 Minuten',
      objectives: [
        'Rechtsform wählen und begründen',
        'Standortanalyse durchführen',
        'Versicherungen und Vorsorge planen',
        'Organisation aufsetzen'
      ],
      phases: [
        { name: 'Rechtsform', description: 'Einzelunternehmen, GbR oder GmbH - was passt?' },
        { name: 'Standort', description: 'Home-Office, Coworking oder eigenes Büro?' },
        { name: 'Absicherung', description: 'Welche Versicherungen brauchst du?' },
        { name: 'Organisation', description: 'Buchhaltung, IT und Arbeitsabläufe' }
      ]
    },
    // Add more modules as needed
  };

  return moduleWelcomes[moduleNumber] || null;
}
