'use client';

/**
 * Geschäftsidee Preview Component (GZ-403)
 *
 * Displays Module 2 Geschäftsidee data as bullet points updating in real-time from Jotai atoms.
 * Shows: Problem, Lösung, Zielgruppe, USP
 */

import * as React from 'react';
import { useAtomValue } from 'jotai';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { streamingDataFamily, currentWorkshopIdAtom } from '@/lib/state/workshop-atoms';
import {
  type PartialGeschaeftsideeOutput,
  type GeschaeftsideePhase,
  GeschaeftsideePhaseInfo,
  isGeschaeftsideeComplete,
  type SocraticDepth,
  SocraticDepthInfo,
  type ProblemCategory,
  type SolutionApproach,
  type AudienceSize
} from '@/types/modules/geschaeftsidee';
import { cn } from '@/lib/utils';
import {
  AlertTriangle,
  Lightbulb,
  Users,
  Target,
  CheckCircle,
  TrendingUp,
  Star,
  MessageSquare
} from 'lucide-react';

// ============================================================================
// Types
// ============================================================================

interface GeschaeftsideePreviewProps {
  className?: string;
}

interface SectionProps {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  'aria-label'?: string;
}

// ============================================================================
// Helper Components
// ============================================================================

function Section({ title, icon, children, 'aria-label': ariaLabel }: SectionProps) {
  return (
    <section aria-label={ariaLabel || title} className="space-y-2">
      <div className="flex items-center gap-2">
        {icon}
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      </div>
      <div className="text-sm text-muted-foreground">{children}</div>
    </section>
  );
}

function BulletList({ items }: { items: (string | undefined | null)[] }) {
  const validItems = items.filter((item): item is string => Boolean(item));

  if (validItems.length === 0) {
    return <p className="text-muted-foreground italic">Noch keine Daten</p>;
  }

  return (
    <ul className="list-disc list-inside space-y-1" role="list">
      {validItems.map((item, index) => (
        <li key={index} className="text-muted-foreground">
          {item}
        </li>
      ))}
    </ul>
  );
}

function DataItem({ label, value }: { label: string; value: string | number | undefined | null }) {
  if (value === undefined || value === null || value === '') {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-1">
      <span className="font-medium">{label}:</span>
      <span>{value}</span>
    </div>
  );
}

function SocraticDepthBadge({ depth }: { depth?: SocraticDepth }) {
  if (!depth) return null;

  const depthInfo = SocraticDepthInfo[depth];
  const variants = {
    L1: { variant: 'outline' as const },
    L2: { variant: 'secondary' as const },
    L3: { variant: 'default' as const },
    L4: { variant: 'default' as const },
    L5: { variant: 'destructive' as const },
  };

  return (
    <Badge variant={variants[depth].variant} className="text-xs">
      {depth}: {depthInfo.label}
    </Badge>
  );
}

function ProblemCategoryBadge({ category }: { category?: ProblemCategory }) {
  if (!category) return null;

  const labels: Record<ProblemCategory, string> = {
    inefficiency: 'Ineffizienz',
    cost: 'Kosten',
    time: 'Zeit',
    frustration: 'Frustration',
    quality: 'Qualität',
    accessibility: 'Zugänglichkeit',
    complexity: 'Komplexität',
    communication: 'Kommunikation',
    other: 'Andere',
  };

  return <Badge variant="outline">{labels[category]}</Badge>;
}

function SolutionApproachBadge({ approach }: { approach?: SolutionApproach }) {
  if (!approach) return null;

  const labels: Record<SolutionApproach, string> = {
    digital_solution: 'Digital',
    service_solution: 'Service',
    product_solution: 'Produkt',
    process_solution: 'Prozess',
    consulting_solution: 'Beratung',
    hybrid_solution: 'Hybrid',
  };

  return <Badge variant="secondary">{labels[approach]}</Badge>;
}

function AudienceSizeBadge({ size }: { size?: AudienceSize }) {
  if (!size) return null;

  const labels: Record<AudienceSize, string> = {
    small: 'Klein',
    medium: 'Mittel',
    large: 'Groß',
    very_large: 'Sehr groß',
    unknown: 'Unbekannt',
  };

  const variants = {
    small: { variant: 'outline' as const },
    medium: { variant: 'secondary' as const },
    large: { variant: 'default' as const },
    very_large: { variant: 'default' as const },
    unknown: { variant: 'outline' as const },
  };

  return <Badge variant={variants[size].variant}>{labels[size]}</Badge>;
}

function PainLevelIndicator({ level }: { level?: number }) {
  if (level === undefined || level === null) return null;

  const getColor = (level: number) => {
    if (level >= 8) return 'text-red-600 bg-red-50';
    if (level >= 6) return 'text-orange-600 bg-orange-50';
    if (level >= 4) return 'text-yellow-600 bg-yellow-50';
    return 'text-green-600 bg-green-50';
  };

  return (
    <div className={cn('inline-flex items-center px-2 py-1 rounded text-xs font-medium', getColor(level))}>
      Schmerz: {level}/10
    </div>
  );
}

function FeasibilityIndicator({ level }: { level?: number }) {
  if (level === undefined || level === null) return null;

  const getColor = (level: number) => {
    if (level >= 8) return 'text-green-600 bg-green-50';
    if (level >= 6) return 'text-blue-600 bg-blue-50';
    if (level >= 4) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  return (
    <div className={cn('inline-flex items-center px-2 py-1 rounded text-xs font-medium', getColor(level))}>
      Umsetzbarkeit: {level}/10
    </div>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export function GeschaeftsideePreview({ className }: GeschaeftsideePreviewProps) {
  const workshopId = useAtomValue(currentWorkshopIdAtom);
  const streamingData = useAtomValue(
    streamingDataFamily(workshopId || 'default')
  );

  // Extract geschäftsidee data from streaming module data
  const moduleData = streamingData.moduleData as PartialGeschaeftsideeOutput | null;
  const currentPhase = (streamingData.currentPhase || 'intro') as GeschaeftsideePhase;
  const phaseInfo = GeschaeftsideePhaseInfo[currentPhase];

  // Calculate completion progress
  const calculateProgress = React.useMemo(() => {
    if (!moduleData) return 0;

    const sections = [
      !!moduleData.problem?.description,
      !!moduleData.solution?.description,
      !!moduleData.targetAudience?.primaryGroup,
      !!moduleData.usp?.proposition,
      !!moduleData.elevatorPitch,
    ];

    const completed = sections.filter(Boolean).length;
    return Math.round((completed / sections.length) * 100);
  }, [moduleData]);

  const isComplete = moduleData ? isGeschaeftsideeComplete(moduleData) : false;

  // Get max depth reached for badges
  const maxDepthReached = moduleData?.metadata?.maxDepthReached;
  const problemSolutionFit = moduleData?.problemSolutionFit;

  return (
    <Card className={cn('w-full', className)} aria-label="Geschäftsidee Übersicht">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">Geschäftsidee</CardTitle>
            <CardDescription>
              {phaseInfo?.label || 'Einführung'}
            </CardDescription>
          </div>
          <div className="flex gap-2 items-center">
            {maxDepthReached && (
              <SocraticDepthBadge depth={maxDepthReached} />
            )}
            {isComplete && (
              <Badge variant="default" className="flex items-center gap-1">
                <CheckCircle className="h-3 w-3" />
                Komplett
              </Badge>
            )}
          </div>
        </div>

        {/* Progress indicator */}
        <div className="space-y-1 pt-2">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Fortschritt</span>
            <span aria-live="polite">{calculateProgress}%</span>
          </div>
          <Progress
            value={calculateProgress}
            aria-label={`Geschäftsidee Fortschritt: ${calculateProgress}%`}
            className="h-2"
          />
        </div>

        {/* Elevator Pitch */}
        {moduleData?.elevatorPitch && (
          <div className="pt-2">
            <div className="p-3 bg-primary/5 border border-primary/20 rounded-md">
              <div className="flex items-start gap-2">
                <MessageSquare className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <p className="text-sm font-medium text-primary">
                  {moduleData.elevatorPitch}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Problem-Solution Fit Score */}
        {problemSolutionFit && (
          <div className="flex items-center gap-2 pt-2">
            <Star className="h-4 w-4 text-yellow-500" />
            <span className="text-sm font-medium">Problem-Solution Fit:</span>
            <Badge variant={problemSolutionFit >= 7 ? 'default' : problemSolutionFit >= 4 ? 'secondary' : 'destructive'}>
              {problemSolutionFit}/10
            </Badge>
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Problem */}
        <Section
          title="Problem"
          icon={<AlertTriangle className="h-4 w-4 text-red-500" />}
          aria-label="Problem"
        >
          <div className="space-y-2">
            {moduleData?.problem?.description && (
              <p className="font-medium">{moduleData.problem.description}</p>
            )}
            {moduleData?.problem?.reasoning && (
              <p className="text-xs">{moduleData.problem.reasoning}</p>
            )}
            <div className="flex flex-wrap gap-2">
              {moduleData?.problem?.category && (
                <ProblemCategoryBadge category={moduleData.problem.category} />
              )}
              {moduleData?.problem?.painLevel && (
                <PainLevelIndicator level={moduleData.problem.painLevel} />
              )}
            </div>
            {moduleData?.problem?.primarySufferers && moduleData.problem.primarySufferers.length > 0 && (
              <div className="mt-2">
                <span className="font-medium text-sm">Hauptbetroffene:</span>
                <BulletList items={moduleData.problem.primarySufferers} />
              </div>
            )}
            {moduleData?.problem?.evidence && moduleData.problem.evidence.length > 0 && (
              <div className="mt-2">
                <span className="font-medium text-sm">Belege:</span>
                <BulletList items={moduleData.problem.evidence} />
              </div>
            )}
            {moduleData?.problem?.assumptions && moduleData.problem.assumptions.length > 0 && (
              <div className="mt-2">
                <span className="font-medium text-sm">Annahmen:</span>
                <BulletList items={moduleData.problem.assumptions} />
              </div>
            )}
          </div>
          {!moduleData?.problem?.description && (
            <p className="text-muted-foreground italic">Noch keine Daten</p>
          )}
        </Section>

        {/* Lösung */}
        <Section
          title="Lösung"
          icon={<Lightbulb className="h-4 w-4 text-yellow-500" />}
          aria-label="Lösung"
        >
          <div className="space-y-2">
            {moduleData?.solution?.description && (
              <p className="font-medium">{moduleData.solution.description}</p>
            )}
            {moduleData?.solution?.reasoning && (
              <p className="text-xs">{moduleData.solution.reasoning}</p>
            )}
            <div className="flex flex-wrap gap-2">
              {moduleData?.solution?.approach && (
                <SolutionApproachBadge approach={moduleData.solution.approach} />
              )}
              {moduleData?.solution?.feasibility && (
                <FeasibilityIndicator level={moduleData.solution.feasibility} />
              )}
            </div>
            {moduleData?.solution?.features && moduleData.solution.features.length > 0 && (
              <div className="mt-2">
                <span className="font-medium text-sm">Funktionen:</span>
                <BulletList items={moduleData.solution.features} />
              </div>
            )}
            {moduleData?.solution?.resourceRequirements && moduleData.solution.resourceRequirements.length > 0 && (
              <div className="mt-2">
                <span className="font-medium text-sm">Benötigte Ressourcen:</span>
                <BulletList items={moduleData.solution.resourceRequirements} />
              </div>
            )}
          </div>
          {!moduleData?.solution?.description && (
            <p className="text-muted-foreground italic">Noch keine Daten</p>
          )}
        </Section>

        {/* Zielgruppe */}
        <Section
          title="Zielgruppe"
          icon={<Users className="h-4 w-4 text-blue-500" />}
          aria-label="Zielgruppe"
        >
          <div className="space-y-2">
            {moduleData?.targetAudience?.primaryGroup && (
              <p className="font-medium">{moduleData.targetAudience.primaryGroup}</p>
            )}
            <div className="flex flex-wrap gap-2">
              {moduleData?.targetAudience?.sizeEstimate && (
                <AudienceSizeBadge size={moduleData.targetAudience.sizeEstimate} />
              )}
            </div>
            <div className="space-y-1">
              <DataItem
                label="Geografischer Bereich"
                value={moduleData?.targetAudience?.geographicScope}
              />
              {moduleData?.targetAudience?.demographics && (
                <div className="space-y-1">
                  <DataItem
                    label="Alter"
                    value={moduleData.targetAudience.demographics.ageRange}
                  />
                  <DataItem
                    label="Einkommen"
                    value={moduleData.targetAudience.demographics.income}
                  />
                  <DataItem
                    label="Beruf"
                    value={moduleData.targetAudience.demographics.profession}
                  />
                </div>
              )}
            </div>
            {moduleData?.targetAudience?.secondaryGroups && moduleData.targetAudience.secondaryGroups.length > 0 && (
              <div className="mt-2">
                <span className="font-medium text-sm">Sekundäre Zielgruppen:</span>
                <BulletList items={moduleData.targetAudience.secondaryGroups} />
              </div>
            )}
            {moduleData?.targetAudience?.needsEvidence && moduleData.targetAudience.needsEvidence.length > 0 && (
              <div className="mt-2">
                <span className="font-medium text-sm">Belege für Bedürfnisse:</span>
                <BulletList items={moduleData.targetAudience.needsEvidence} />
              </div>
            )}
            {moduleData?.targetAudience?.psychographics?.painPoints &&
             moduleData.targetAudience.psychographics.painPoints.length > 0 && (
              <div className="mt-2">
                <span className="font-medium text-sm">Schmerzpunkte:</span>
                <BulletList items={moduleData.targetAudience.psychographics.painPoints} />
              </div>
            )}
          </div>
          {!moduleData?.targetAudience?.primaryGroup && (
            <p className="text-muted-foreground italic">Noch keine Daten</p>
          )}
        </Section>

        {/* USP */}
        <Section
          title="USP (Alleinstellungsmerkmal)"
          icon={<Target className="h-4 w-4 text-green-500" />}
          aria-label="Alleinstellungsmerkmal"
        >
          <div className="space-y-2">
            {moduleData?.usp?.proposition && (
              <div className="p-3 bg-green-50 dark:bg-green-950/20 rounded-md border-l-4 border-green-500">
                <p className="font-medium text-green-900 dark:text-green-100">
                  {moduleData.usp.proposition}
                </p>
              </div>
            )}
            {moduleData?.usp?.whyFounderWhyNow && (
              <div className="mt-2 p-2 bg-muted/50 rounded-md text-xs">
                <strong>Warum Sie, warum jetzt:</strong> {moduleData.usp.whyFounderWhyNow}
              </div>
            )}
            {moduleData?.usp?.assumptions && moduleData.usp.assumptions.length > 0 && (
              <div className="mt-2">
                <span className="font-medium text-sm">Annahmen:</span>
                <BulletList items={moduleData.usp.assumptions} />
              </div>
            )}
            {moduleData?.usp?.differentiationEvidence && moduleData.usp.differentiationEvidence.length > 0 && (
              <div className="mt-2">
                <span className="font-medium text-sm">Differenzierungs-Belege:</span>
                <BulletList items={moduleData.usp.differentiationEvidence} />
              </div>
            )}
            {moduleData?.usp?.competitors && moduleData.usp.competitors.length > 0 && (
              <div className="mt-2">
                <span className="font-medium text-sm">Wettbewerber:</span>
                <div className="space-y-1">
                  {moduleData.usp.competitors.map((competitor, i) => (
                    <div key={i} className="p-2 bg-muted/30 rounded text-xs">
                      <p><strong>{competitor.name}</strong></p>
                      <p>Schwäche: {competitor.weakness}</p>
                      <p>Stärke: {competitor.strength}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {moduleData?.usp?.alternativePositions && moduleData.usp.alternativePositions.length > 0 && (
              <div className="mt-2">
                <span className="font-medium text-sm">Alternative Positionierungen:</span>
                <BulletList items={moduleData.usp.alternativePositions} />
              </div>
            )}
          </div>
          {!moduleData?.usp?.proposition && (
            <p className="text-muted-foreground italic">Noch keine Daten</p>
          )}
        </Section>

        {/* YC Reality Check */}
        {moduleData?.realityCheck?.ycQuestions && Object.values(moduleData.realityCheck.ycQuestions).some(v => v) && (
          <Section title="Realitäts-Check" icon={<TrendingUp className="h-4 w-4" />}>
            <div className="space-y-2 text-xs">
              {moduleData.realityCheck.ycQuestions.realProblemOwner && (
                <div>
                  <strong>Wer hat das Problem wirklich?</strong>
                  <p>{moduleData.realityCheck.ycQuestions.realProblemOwner}</p>
                </div>
              )}
              {moduleData.realityCheck.ycQuestions.problemFrequency && (
                <div>
                  <strong>Wie oft tritt das Problem auf?</strong>
                  <p>{moduleData.realityCheck.ycQuestions.problemFrequency}</p>
                </div>
              )}
              {moduleData.realityCheck.ycQuestions.willingnessTopay && (
                <div>
                  <strong>Zahlungsbereitschaft?</strong>
                  <p>{moduleData.realityCheck.ycQuestions.willingnessTopay}</p>
                </div>
              )}
              {moduleData.realityCheck.ycQuestions.currentAlternatives && (
                <div>
                  <strong>Aktuelle Alternativen?</strong>
                  <p>{moduleData.realityCheck.ycQuestions.currentAlternatives}</p>
                </div>
              )}
            </div>
          </Section>
        )}

        {/* Red Flags */}
        {moduleData?.realityCheck?.redFlags && moduleData.realityCheck.redFlags.length > 0 && (
          <div
            className="rounded-md bg-red-50 dark:bg-red-950/20 p-3 text-red-700 dark:text-red-400 text-sm"
            role="alert"
          >
            <strong>Warnsignale:</strong>
            <BulletList items={moduleData.realityCheck.redFlags} />
          </div>
        )}

        {/* Validation Needs */}
        {moduleData?.realityCheck?.validationNeeds && moduleData.realityCheck.validationNeeds.length > 0 && (
          <div
            className="rounded-md bg-yellow-50 dark:bg-yellow-950/20 p-3 text-yellow-700 dark:text-yellow-400 text-sm"
          >
            <strong>Validierung erforderlich:</strong>
            <BulletList items={moduleData.realityCheck.validationNeeds} />
          </div>
        )}

        {/* GROW Progress */}
        {moduleData?.growProgress && Object.values(moduleData.growProgress).some(v => v) && (
          <Section title="GROW Progress" aria-label="GROW Modell Fortschritt">
            <div className="grid grid-cols-2 gap-2 text-xs">
              {moduleData.growProgress.goal && (
                <div>
                  <strong>Goal:</strong> {moduleData.growProgress.goal}
                </div>
              )}
              {moduleData.growProgress.reality && (
                <div>
                  <strong>Reality:</strong> {moduleData.growProgress.reality}
                </div>
              )}
              {moduleData.growProgress.options && moduleData.growProgress.options.length > 0 && (
                <div className="col-span-2">
                  <strong>Options:</strong>
                  <ul className="list-disc list-inside ml-2">
                    {moduleData.growProgress.options.map((option, i) => (
                      <li key={i}>{option}</li>
                    ))}
                  </ul>
                </div>
              )}
              {moduleData.growProgress.will && (
                <div className="col-span-2">
                  <strong>Will:</strong> {moduleData.growProgress.will}
                </div>
              )}
            </div>
          </Section>
        )}
      </CardContent>
    </Card>
  );
}

// Export for barrel file
export default GeschaeftsideePreview;