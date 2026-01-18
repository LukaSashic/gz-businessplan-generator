'use client';

import { useMemo, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ChevronRight, ChevronDown, Check, Loader2, Circle } from 'lucide-react';
import {
  generateDocumentPreview,
  type BusinessPlanDocument,
  type BusinessPlanSection,
} from '@/lib/businessplan/document-structure';
import type { PartialIntakeOutput } from '@/types/modules/intake';

interface BusinessPlanPreviewProps {
  workshopData: PartialIntakeOutput | null;
  currentModule?: number;
  onExport?: () => void;
}

/**
 * Get status icon for a section
 */
function StatusIcon({ status }: { status: BusinessPlanSection['status'] }) {
  switch (status) {
    case 'complete':
      return <Check className="h-4 w-4 text-green-500" />;
    case 'in-progress':
      return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
    case 'pending':
      return <Circle className="h-4 w-4 text-muted-foreground/50" />;
  }
}

/**
 * Get status color class
 */
function getStatusColor(status: BusinessPlanSection['status']): string {
  switch (status) {
    case 'complete':
      return 'text-green-600 bg-green-50 dark:bg-green-950/20';
    case 'in-progress':
      return 'text-blue-600 bg-blue-50 dark:bg-blue-950/20';
    case 'pending':
      return 'text-muted-foreground bg-muted/30';
  }
}

/**
 * Section component with expandable content
 */
function SectionItem({
  section,
  isExpanded,
  onToggle,
}: {
  section: BusinessPlanSection;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const hasContent = section.content !== null;

  return (
    <div className="overflow-hidden rounded-lg border">
      {/* Section Header */}
      <button
        onClick={hasContent ? onToggle : undefined}
        disabled={!hasContent}
        className={`flex w-full items-center justify-between p-3 text-left transition-colors ${getStatusColor(
          section.status
        )} ${hasContent ? 'cursor-pointer hover:bg-opacity-75' : 'cursor-default'}`}
      >
        <div className="flex flex-1 items-center">
          <StatusIcon status={section.status} />
          <div className="ml-3 flex-1">
            <div className="flex items-baseline">
              <span className="mr-2 font-mono text-xs text-muted-foreground">
                {section.number}
              </span>
              <h3 className="font-semibold">{section.title}</h3>
            </div>
            {section.wordCount && section.wordCount > 0 && (
              <p className="mt-0.5 text-xs text-muted-foreground">
                {section.wordCount} Wörter
              </p>
            )}
          </div>
        </div>

        {hasContent && (
          <span className="ml-2 text-muted-foreground">
            {isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </span>
        )}

        {!hasContent && section.status === 'pending' && (
          <Badge variant="outline" className="text-xs">
            Modul {section.module}
          </Badge>
        )}
      </button>

      {/* Section Content */}
      {isExpanded && hasContent && (
        <div className="border-t bg-background p-4">
          <div className="prose prose-sm max-w-none dark:prose-invert">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {section.content || ''}
            </ReactMarkdown>
          </div>
        </div>
      )}

      {/* In Progress Placeholder */}
      {isExpanded && !hasContent && section.status === 'in-progress' && (
        <div className="border-t border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-800 dark:bg-yellow-950/30">
          <div className="flex items-center text-yellow-700 dark:text-yellow-300">
            <Loader2 className="mr-3 h-5 w-5 animate-spin" />
            <div>
              <p className="font-medium">Wird gerade erstellt...</p>
              <p className="text-sm opacity-75">
                Dieser Abschnitt wird während des aktuellen Moduls entwickelt
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function BusinessPlanPreview({
  workshopData,
  currentModule = 1,
  onExport,
}: BusinessPlanPreviewProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set()
  );

  // Generate document preview
  const document: BusinessPlanDocument = useMemo(() => {
    return generateDocumentPreview(workshopData, currentModule);
  }, [workshopData, currentModule]);

  // Toggle section expansion
  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  // Calculate stats
  const stats = useMemo(() => {
    const complete = document.sections.filter((s) => s.status === 'complete' && s.content).length;
    const inProgress = document.sections.filter((s) => s.status === 'in-progress').length;
    const total = document.sections.length;
    const totalWords = document.sections.reduce((sum, s) => sum + (s.wordCount || 0), 0);
    return { complete, inProgress, total, totalWords };
  }, [document.sections]);

  return (
    <div className="flex h-full flex-col bg-background">
      {/* Header */}
      <div className="border-b bg-gradient-to-r from-blue-50 to-purple-50 p-4 dark:from-blue-950/30 dark:to-purple-950/30">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">Dein Businessplan</h2>
          {document.metadata.readyForExport && onExport && (
            <button
              onClick={onExport}
              className="rounded-lg bg-green-600 px-4 py-2 font-semibold text-white transition-colors hover:bg-green-700"
            >
              Exportieren
            </button>
          )}
        </div>

        {/* Progress */}
        <div className="mt-4">
          <div className="mb-1 flex justify-between text-sm text-muted-foreground">
            <span>Vollständigkeit</span>
            <span>{document.metadata.completeness}%</span>
          </div>
          <Progress value={document.metadata.completeness} className="h-2" />
        </div>

        <p className="mt-2 text-xs text-muted-foreground">
          Zuletzt aktualisiert:{' '}
          {new Date(document.metadata.lastUpdated).toLocaleString('de-DE')}
        </p>
      </div>

      {/* Sections List */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-2">
          {document.sections.map((section) => (
            <SectionItem
              key={section.id}
              section={section}
              isExpanded={expandedSections.has(section.id)}
              onToggle={() => toggleSection(section.id)}
            />
          ))}
        </div>
      </div>

      {/* Footer Stats */}
      <div className="border-t bg-muted/50 p-4 text-sm text-muted-foreground">
        <div className="flex justify-between">
          <span>
            {stats.complete} von {stats.total} Abschnitte fertig
            {stats.inProgress > 0 && `, ${stats.inProgress} in Bearbeitung`}
          </span>
          <span>{stats.totalWords.toLocaleString('de-DE')} Wörter gesamt</span>
        </div>
      </div>
    </div>
  );
}
