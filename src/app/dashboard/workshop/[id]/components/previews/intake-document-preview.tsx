'use client';

import type { PartialIntakeOutput } from '@/types/modules/intake';

interface IntakeDocumentPreviewProps {
  data: PartialIntakeOutput | null;
}

/**
 * Generate business plan prose from structured intake data
 * This shows what the BA will see in the final document
 */
export function generateIntakeDocumentText(data: PartialIntakeOutput | null): string {
  if (!data) {
    return '# Gründerprofil\n\n*Beginne das Gespräch, um dein Gründerprofil zu erstellen...*';
  }

  const sections: string[] = [];

  // Executive Summary / Elevator Pitch
  if (data.businessIdea) {
    sections.push(generateBusinessIdeaSection(data.businessIdea));
  } else {
    sections.push(generatePlaceholderSection(
      'Geschäftsidee',
      'Beschreibe deine Geschäftsidee im Chat, um diesen Abschnitt zu füllen...'
    ));
  }

  // Founder Profile
  if (data.founder) {
    sections.push(generateFounderSection(data.founder, data.personality));
  } else {
    sections.push(generatePlaceholderSection(
      'Gründerprofil',
      'Dein beruflicher Hintergrund, Qualifikationen und Motivation werden hier erscheinen...'
    ));
  }

  // Resources Overview
  if (data.resources) {
    sections.push(generateResourcesSection(data.resources));
  }

  // Business Classification
  if (data.businessType) {
    sections.push(generateBusinessTypeSection(data.businessType));
  }

  return sections.join('\n\n---\n\n');
}

function generateBusinessIdeaSection(
  idea: Partial<NonNullable<PartialIntakeOutput['businessIdea']>>
): string {
  const parts: string[] = ['## 1. Geschäftsidee'];

  if (idea.elevator_pitch) {
    parts.push(`### Kurzdarstellung\n\n${idea.elevator_pitch}`);
  }

  if (idea.problem) {
    parts.push(`### Problem\n\n${idea.problem}`);
  }

  if (idea.solution) {
    parts.push(`### Lösung\n\n${idea.solution}`);
  }

  if (idea.targetAudience) {
    parts.push(`### Zielgruppe\n\n${idea.targetAudience}`);
  }

  if (idea.uniqueValue) {
    parts.push(`### Alleinstellungsmerkmal\n\n${idea.uniqueValue}`);
  }

  // Add placeholders for incomplete sections
  if (!idea.elevator_pitch || !idea.problem || !idea.solution || !idea.targetAudience) {
    const missing: string[] = [];
    if (!idea.elevator_pitch) missing.push('Kurzdarstellung');
    if (!idea.problem) missing.push('Problem');
    if (!idea.solution) missing.push('Lösung');
    if (!idea.targetAudience) missing.push('Zielgruppe');

    parts.push(`\n*Wird noch vervollständigt: ${missing.join(', ')}...*`);
  }

  return parts.join('\n\n');
}

function generateFounderSection(
  founder: Partial<NonNullable<PartialIntakeOutput['founder']>>,
  personality?: Partial<NonNullable<PartialIntakeOutput['personality']>>
): string {
  const parts: string[] = ['## 2. Gründerprofil'];

  // Status
  if (founder.currentStatus) {
    const statusLabels = {
      employed: 'angestellt',
      unemployed: 'arbeitssuchend',
      other: 'sonstige Situation',
    };
    parts.push(
      `Der Gründer ist aktuell **${statusLabels[founder.currentStatus]}**.`
    );
  }

  // ALG Status
  if (founder.algStatus?.daysRemaining !== undefined) {
    const eligibility =
      founder.algStatus.daysRemaining >= 150
        ? 'erfüllt die Voraussetzungen für den Gründungszuschuss'
        : 'hat weniger als die erforderlichen 150 Tage';

    parts.push(
      `Mit einem verbleibenden ALG I-Anspruch von **${founder.algStatus.daysRemaining} Tagen** ` +
        `${eligibility}.`
    );
  }

  // Experience
  if (founder.experience?.yearsInIndustry !== undefined) {
    parts.push(
      `### Berufserfahrung\n\n` +
        `**${founder.experience.yearsInIndustry} Jahre** Erfahrung in der relevanten Branche.`
    );

    if (founder.experience.previousFounder) {
      parts.push(
        `Der Gründer bringt bereits **Erfahrung aus einer früheren Selbstständigkeit** mit.`
      );
    }
  }

  // Education
  if (founder.qualifications?.education) {
    parts.push(`### Ausbildung\n\n${founder.qualifications.education}`);

    if (
      founder.qualifications.certifications &&
      founder.qualifications.certifications.length > 0
    ) {
      parts.push(
        `**Relevante Zertifikate:** ${founder.qualifications.certifications.join(', ')}`
      );
    }
  }

  // Motivation
  if (founder.motivation) {
    const motivationParts: string[] = ['### Motivation'];

    if (founder.motivation.push && founder.motivation.push.length > 0) {
      motivationParts.push(
        `**Push-Faktoren (weg von):** ${founder.motivation.push.join(', ')}`
      );
    }
    if (founder.motivation.pull && founder.motivation.pull.length > 0) {
      motivationParts.push(
        `**Pull-Faktoren (hin zu):** ${founder.motivation.pull.join(', ')}`
      );
    }

    if (motivationParts.length > 1) {
      parts.push(motivationParts.join('\n'));
    }
  }

  // Personality Narrative
  if (personality?.narrative) {
    parts.push(`### Unternehmerische Persönlichkeit\n\n${personality.narrative}`);
  }

  return parts.join('\n\n');
}

function generateResourcesSection(
  resources: Partial<NonNullable<PartialIntakeOutput['resources']>>
): string {
  const parts: string[] = ['## 3. Ressourcen'];

  // Financial
  if (resources.financial) {
    const financialParts: string[] = ['### Finanzielle Ressourcen'];

    if (resources.financial.availableCapital !== undefined) {
      financialParts.push(
        `**Eigenkapital:** ${resources.financial.availableCapital.toLocaleString('de-DE')} €`
      );
    }

    if (resources.financial.expectedGZ !== undefined) {
      financialParts.push(
        `**Erwarteter Gründungszuschuss:** ${resources.financial.expectedGZ.toLocaleString('de-DE')} €`
      );
    }

    if (financialParts.length > 1) {
      parts.push(financialParts.join('\n'));
    }
  }

  // Time
  if (resources.time) {
    const timeParts: string[] = ['### Zeitliche Ressourcen'];

    if (resources.time.hoursPerWeek !== undefined) {
      timeParts.push(
        `**Verfügbare Zeit:** ${resources.time.hoursPerWeek} Stunden pro Woche` +
          (resources.time.isFullTime ? ' (Vollzeit)' : '')
      );
    }

    if (resources.time.plannedStartDate) {
      timeParts.push(`**Geplanter Starttermin:** ${resources.time.plannedStartDate}`);
    }

    if (timeParts.length > 1) {
      parts.push(timeParts.join('\n'));
    }
  }

  // Network
  if (resources.network?.industryContacts !== undefined) {
    parts.push(
      `### Netzwerk\n\n` +
        `**Branchenkontakte:** ${resources.network.industryContacts}/10`
    );
  }

  return parts.join('\n\n');
}

function generateBusinessTypeSection(
  businessType: Partial<NonNullable<PartialIntakeOutput['businessType']>>
): string {
  const parts: string[] = ['## 4. Geschäftsmodell-Klassifizierung'];

  if (businessType.category) {
    const categoryLabels: Record<string, string> = {
      consulting: 'Beratung / Professional Services',
      ecommerce: 'E-Commerce / Digitale Produkte',
      local_service: 'Lokale Dienstleistung',
      local_retail: 'Lokaler Einzelhandel',
      manufacturing: 'Produktion / Manufaktur',
      hybrid: 'Hybrid-Modell',
    };

    parts.push(`**Kategorie:** ${categoryLabels[businessType.category] || businessType.category}`);

    const attributes: string[] = [];
    if (businessType.isDigitalFirst) attributes.push('Digital First');
    if (businessType.isLocationDependent) attributes.push('Standortabhängig');
    if (businessType.requiresPhysicalInventory) attributes.push('Physisches Inventar');

    if (attributes.length > 0) {
      parts.push(`**Merkmale:** ${attributes.join(', ')}`);
    }

    if (businessType.reasoning) {
      parts.push(`**Begründung:** ${businessType.reasoning}`);
    }
  }

  return parts.join('\n\n');
}

function generatePlaceholderSection(title: string, placeholder: string): string {
  return `## ${title}\n\n*${placeholder}*`;
}

/**
 * Component that renders the document-style preview
 */
export default function IntakeDocumentPreview({ data }: IntakeDocumentPreviewProps) {
  const documentText = generateIntakeDocumentText(data);

  return (
    <div className="prose prose-sm max-w-none p-4 dark:prose-invert">
      <div
        className="whitespace-pre-wrap font-serif leading-relaxed"
        style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
      >
        {documentText.split('\n').map((line, index) => {
          // Render headers
          if (line.startsWith('## ')) {
            return (
              <h2
                key={index}
                className="mb-3 mt-6 border-b pb-2 text-xl font-semibold first:mt-0"
              >
                {line.replace('## ', '')}
              </h2>
            );
          }
          if (line.startsWith('### ')) {
            return (
              <h3 key={index} className="mb-2 mt-4 text-lg font-medium">
                {line.replace('### ', '')}
              </h3>
            );
          }
          if (line.startsWith('# ')) {
            return (
              <h1 key={index} className="mb-4 text-2xl font-bold">
                {line.replace('# ', '')}
              </h1>
            );
          }

          // Render horizontal rules
          if (line === '---') {
            return <hr key={index} className="my-6 border-muted" />;
          }

          // Render placeholder text (italic)
          if (line.startsWith('*') && line.endsWith('*')) {
            return (
              <p key={index} className="italic text-muted-foreground opacity-70">
                {line.replace(/^\*|\*$/g, '')}
              </p>
            );
          }

          // Render bold text within lines
          if (line.includes('**')) {
            const parts = line.split(/\*\*([^*]+)\*\*/g);
            return (
              <p key={index} className="mb-2">
                {parts.map((part, i) =>
                  i % 2 === 1 ? (
                    <strong key={i} className="font-semibold">
                      {part}
                    </strong>
                  ) : (
                    <span key={i}>{part}</span>
                  )
                )}
              </p>
            );
          }

          // Empty lines
          if (line.trim() === '') {
            return <br key={index} />;
          }

          // Regular paragraphs
          return (
            <p key={index} className="mb-2">
              {line}
            </p>
          );
        })}
      </div>
    </div>
  );
}
