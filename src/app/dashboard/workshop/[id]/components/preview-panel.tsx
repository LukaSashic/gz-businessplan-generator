'use client';

import { useEffect, useState } from 'react';
import { useAtomValue } from 'jotai';
import {
  currentModuleAtom,
  workshopDataFamily,
} from '@/lib/state/workshop-atoms';
import DocumentPreview from './document-preview';
import IntakePreview from './previews/intake-preview';
import GeschaeftsmodellPreview from './previews/geschaeftsmodell-preview';
import BusinessPlanPreview from './previews/businessplan-preview';
import { FileText, Loader2, LayoutGrid, FileBarChart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { PartialIntakeOutput, IntakePhase } from '@/types/modules/intake';
import type { PartialGeschaeftsmodellOutput, GeschaeftsmodellPhase } from '@/types/modules/geschaeftsmodell';
import type { RedFlag } from '@/lib/services/red-flag-detector';

interface PreviewPanelProps {
  workshopId: string;
  moduleData?: any; // Real-time module data from chat stream
  currentPhase?: string; // Current phase within the module
  redFlags?: RedFlag[]; // Red flags detected in conversation
}

type PreviewMode = 'data' | 'document';

export default function PreviewPanel({
  workshopId,
  moduleData,
  currentPhase,
  redFlags = [],
}: PreviewPanelProps) {
  const currentModule = useAtomValue(currentModuleAtom);
  const workshopDataAtom = workshopDataFamily(workshopId);
  const workshopData = useAtomValue(workshopDataAtom);
  const [markdownContent, setMarkdownContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [previewMode, setPreviewMode] = useState<PreviewMode>('data');

  // Merge stored workshop data with real-time module data
  const effectiveModuleData = moduleData || workshopData?.[currentModule || ''] || null;

  // Generate markdown from workshop data (for non-intake modules)
  useEffect(() => {
    if (currentModule === 'gz-intake') {
      // IntakePreview handles its own rendering
      return;
    }

    if (!workshopData || !currentModule) {
      setMarkdownContent(getEmptyStateMarkdown());
      return;
    }

    setIsLoading(true);

    // Get module data
    const storedModuleData = workshopData[currentModule];

    if (!storedModuleData || Object.keys(storedModuleData).length === 0) {
      setMarkdownContent(getEmptyStateMarkdown(currentModule));
    } else {
      setMarkdownContent(generateMarkdownForModule(currentModule, storedModuleData));
    }

    setIsLoading(false);
  }, [workshopData, currentModule]);

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            Dokument wird geladen...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col bg-background">
      {/* Preview Header */}
      <div className="flex items-center justify-between border-b border-border bg-card px-6 py-4">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-muted-foreground" />
          <h2 className="text-sm font-semibold">
            {currentModule === 'gz-intake'
              ? 'Gründerprofil'
              : currentModule === 'gz-geschaeftsmodell'
                ? 'Geschäftsmodell'
                : 'Dokumentvorschau'}
          </h2>
        </div>

        {/* View Mode Toggle - Only show for intake module */}
        {currentModule === 'gz-intake' && (
          <Tabs value={previewMode} onValueChange={(v) => setPreviewMode(v as PreviewMode)} className="mx-4">
            <TabsList className="h-8">
              <TabsTrigger value="data" className="h-7 px-3 text-xs">
                <LayoutGrid className="mr-1.5 h-3.5 w-3.5" />
                Daten
              </TabsTrigger>
              <TabsTrigger value="document" className="h-7 px-3 text-xs">
                <FileBarChart className="mr-1.5 h-3.5 w-3.5" />
                Dokument
              </TabsTrigger>
            </TabsList>
          </Tabs>
        )}

        <Button variant="outline" size="sm" disabled>
          Exportieren
        </Button>
      </div>

      {/* Document Content - Module-specific rendering */}
      <div className="flex-1 overflow-y-auto">
        {currentModule === 'gz-intake' ? (
          // Intake module: Toggle between data cards and document preview
          previewMode === 'data' ? (
            <IntakePreview
              data={effectiveModuleData as PartialIntakeOutput}
              currentPhase={(currentPhase as IntakePhase) || 'warmup'}
              redFlags={redFlags}
            />
          ) : (
            <BusinessPlanPreview
              workshopData={effectiveModuleData as PartialIntakeOutput}
              currentModule={1}
            />
          )
        ) : currentModule === 'gz-geschaeftsmodell' ? (
          // Geschaeftsmodell module: Toggle between data cards and document preview
          <GeschaeftsmodellPreview
            data={effectiveModuleData as PartialGeschaeftsmodellOutput}
            currentPhase={(currentPhase as GeschaeftsmodellPhase) || 'angebot'}
          />
        ) : (
          <DocumentPreview content={markdownContent} />
        )}
      </div>
    </div>
  );
}

function getEmptyStateMarkdown(module?: string): string {
  if (!module) {
    return `# Willkommen zum GZ Businessplan Generator

Ihr Businessplan wird hier angezeigt, während Sie mit Claude durch die verschiedenen Module arbeiten.

## Wie es funktioniert

1. **Wählen Sie ein Modul** aus dem Dropdown-Menü oben
2. **Chatten Sie mit Claude** im linken Bereich
3. **Sehen Sie Ihr Dokument wachsen** hier in Echtzeit

Beginnen Sie mit Modul 1: Aufnahme, um loszulegen!`;
  }

  const moduleNames: Record<string, string> = {
    'gz-intake': 'Aufnahme',
    'gz-geschaeftsmodell': 'Geschäftsmodell',
    'gz-unternehmen': 'Unternehmen',
    'gz-markt-wettbewerb': 'Markt & Wettbewerb',
    'gz-marketing': 'Marketing',
    'gz-finanzplanung': 'Finanzplanung',
    'gz-swot': 'SWOT-Analyse',
    'gz-meilensteine': 'Meilensteine',
    'gz-kpi': 'KPI',
    'gz-zusammenfassung': 'Zusammenfassung',
  };

  return `# ${moduleNames[module] || 'Modul'}

Dieses Modul ist noch leer. Beginnen Sie das Gespräch mit Claude, um Inhalte zu generieren.

## Nächste Schritte

- Beantworten Sie Claudes Fragen im Chat
- Ihre Antworten werden hier automatisch als strukturierter Businessplan angezeigt
- Sie können jederzeit zwischen den Modulen wechseln`;
}

function generateMarkdownForModule(module: string, data: any): string {
  const moduleNames: Record<string, string> = {
    'gz-intake': 'Aufnahme & Gründerprofil',
    'gz-geschaeftsmodell': 'Geschäftsmodell',
    'gz-unternehmen': 'Unternehmensstruktur',
    'gz-markt-wettbewerb': 'Markt & Wettbewerb',
    'gz-marketing': 'Marketingstrategie',
    'gz-finanzplanung': 'Finanzplanung',
    'gz-swot': 'SWOT-Analyse',
    'gz-meilensteine': 'Meilensteine & Zeitplan',
    'gz-kpi': 'Key Performance Indicators',
    'gz-zusammenfassung': 'Executive Summary',
  };

  let markdown = `# ${moduleNames[module] || module}\n\n`;

  Object.entries(data).forEach(([key, value]) => {
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      markdown += `## ${formatKey(key)}\n\n`;
      Object.entries(value).forEach(([subKey, subValue]) => {
        markdown += `**${formatKey(subKey)}:** ${formatValue(subValue)}\n\n`;
      });
    } else {
      markdown += `**${formatKey(key)}:** ${formatValue(value)}\n\n`;
    }
  });

  return markdown;
}

function formatKey(key: string): string {
  return key
    .replace(/_/g, ' ')
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (str) => str.toUpperCase())
    .trim();
}

function formatValue(value: any): string {
  if (Array.isArray(value)) {
    return value.map((item) => `- ${item}`).join('\n');
  }
  if (typeof value === 'object' && value !== null) {
    return JSON.stringify(value, null, 2);
  }
  return String(value);
}
