'use client';

/**
 * Intake Preview Component (GZ-302)
 *
 * Displays intake data as bullet points updating in real-time from Jotai atoms.
 * Shows: Persönliche Daten, Beruflicher Hintergrund, Geschäftsidee (Entwurf), Stärken-Profil
 */

import * as React from 'react';
import { useAtomValue } from 'jotai';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { streamingDataFamily, currentWorkshopIdAtom } from '@/lib/state/workshop-atoms';
import { calculateIntakeProgress, type PartialIntakeOutput, IntakePhaseInfo, type IntakePhase } from '@/types/modules/intake';
import { cn } from '@/lib/utils';

// ============================================================================
// Types
// ============================================================================

interface IntakePreviewProps {
  className?: string;
}

interface SectionProps {
  title: string;
  children: React.ReactNode;
  'aria-label'?: string;
}

// ============================================================================
// Helper Components
// ============================================================================

function Section({ title, children, 'aria-label': ariaLabel }: SectionProps) {
  return (
    <section aria-label={ariaLabel || title} className="space-y-2">
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
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

// ============================================================================
// Main Component
// ============================================================================

export function IntakePreview({ className }: IntakePreviewProps) {
  const workshopId = useAtomValue(currentWorkshopIdAtom);
  const streamingData = useAtomValue(
    streamingDataFamily(workshopId || 'default')
  );

  // Extract intake data from streaming module data
  const moduleData = streamingData.moduleData as PartialIntakeOutput | null;
  const currentPhase = (streamingData.currentPhase || 'warmup') as IntakePhase;
  const phaseInfo = IntakePhaseInfo[currentPhase];

  // Calculate progress
  const progress = moduleData ? calculateIntakeProgress(moduleData) : 0;

  // Get status badge color
  const getStatusBadgeVariant = (status: string | undefined) => {
    switch (status) {
      case 'unemployed':
        return 'secondary';
      case 'employed':
        return 'default';
      default:
        return 'outline';
    }
  };

  // Format current status for display
  const formatStatus = (status: string | undefined) => {
    switch (status) {
      case 'unemployed':
        return 'Arbeitslos';
      case 'employed':
        return 'Beschäftigt';
      case 'other':
        return 'Sonstiges';
      default:
        return undefined;
    }
  };

  // Extract strengths for display
  const strengthsList = React.useMemo(() => {
    const strengths: string[] = [];

    if (moduleData?.personality?.narrative) {
      strengths.push(moduleData.personality.narrative);
    }

    // Add categorized strengths from validation
    if (moduleData?.validation?.strengths) {
      strengths.push(...moduleData.validation.strengths);
    }

    return strengths;
  }, [moduleData?.personality?.narrative, moduleData?.validation?.strengths]);

  return (
    <Card className={cn('w-full', className)} aria-label="Intake Übersicht">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">Intake</CardTitle>
            <CardDescription>
              {phaseInfo?.label || 'Warm-Up'}
            </CardDescription>
          </div>
          {moduleData?.founder?.currentStatus && (
            <Badge variant={getStatusBadgeVariant(moduleData.founder.currentStatus)}>
              {formatStatus(moduleData.founder.currentStatus)}
            </Badge>
          )}
        </div>

        {/* Progress indicator */}
        <div className="space-y-1 pt-2">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Fortschritt</span>
            <span aria-live="polite">{progress}%</span>
          </div>
          <Progress
            value={progress}
            aria-label={`Intake Fortschritt: ${progress}%`}
            className="h-2"
          />
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Persönliche Daten */}
        <Section title="Persönliche Daten" aria-label="Persönliche Daten">
          <div className="space-y-1">
            <DataItem
              label="Status"
              value={formatStatus(moduleData?.founder?.currentStatus)}
            />
            {moduleData?.founder?.currentStatus === 'unemployed' && (
              <>
                <DataItem
                  label="ALG I Resttage"
                  value={
                    moduleData?.founder?.algStatus?.daysRemaining
                      ? `${moduleData.founder.algStatus.daysRemaining} Tage`
                      : undefined
                  }
                />
                <DataItem
                  label="ALG I monatlich"
                  value={
                    moduleData?.founder?.algStatus?.monthlyAmount
                      ? `${moduleData.founder.algStatus.monthlyAmount.toLocaleString('de-DE')} €`
                      : undefined
                  }
                />
              </>
            )}
          </div>
          {!moduleData?.founder?.currentStatus && (
            <p className="text-muted-foreground italic">Noch keine Daten</p>
          )}
        </Section>

        {/* Beruflicher Hintergrund */}
        <Section title="Beruflicher Hintergrund" aria-label="Beruflicher Hintergrund">
          <div className="space-y-1">
            <DataItem
              label="Branchenerfahrung"
              value={
                moduleData?.founder?.experience?.yearsInIndustry !== undefined
                  ? `${moduleData.founder.experience.yearsInIndustry} Jahre`
                  : undefined
              }
            />
            <DataItem
              label="Ausbildung"
              value={moduleData?.founder?.qualifications?.education}
            />
            {moduleData?.founder?.qualifications?.certifications &&
              moduleData.founder.qualifications.certifications.length > 0 && (
                <div>
                  <span className="font-medium">Zertifikate:</span>
                  <ul className="list-disc list-inside ml-2">
                    {moduleData.founder.qualifications.certifications.map((cert, i) => (
                      <li key={i}>{cert}</li>
                    ))}
                  </ul>
                </div>
              )}
          </div>
          {!moduleData?.founder?.experience && !moduleData?.founder?.qualifications && (
            <p className="text-muted-foreground italic">Noch keine Daten</p>
          )}
        </Section>

        {/* Geschäftsidee (Entwurf) */}
        <Section title="Geschäftsidee (Entwurf)" aria-label="Geschäftsidee Entwurf">
          <div className="space-y-2">
            {moduleData?.businessIdea?.elevator_pitch && (
              <p className="font-medium">{moduleData.businessIdea.elevator_pitch}</p>
            )}
            <div className="space-y-1">
              <DataItem label="Problem" value={moduleData?.businessIdea?.problem} />
              <DataItem label="Lösung" value={moduleData?.businessIdea?.solution} />
              <DataItem label="Zielgruppe" value={moduleData?.businessIdea?.targetAudience} />
              <DataItem label="Alleinstellungsmerkmal" value={moduleData?.businessIdea?.uniqueValue} />
            </div>
          </div>
          {!moduleData?.businessIdea?.elevator_pitch &&
            !moduleData?.businessIdea?.problem && (
              <p className="text-muted-foreground italic">Noch keine Daten</p>
            )}
        </Section>

        {/* Stärken-Profil */}
        <Section title="Stärken-Profil" aria-label="Stärken Profil">
          <BulletList items={strengthsList} />
        </Section>

        {/* GZ Eligibility Warning */}
        {moduleData?.founder?.currentStatus === 'unemployed' &&
          moduleData?.founder?.algStatus?.daysRemaining !== undefined &&
          moduleData.founder.algStatus.daysRemaining < 150 && (
            <div
              className="rounded-md bg-destructive/10 p-3 text-destructive text-sm"
              role="alert"
              aria-live="assertive"
            >
              <strong>Hinweis:</strong> Mit{' '}
              {moduleData.founder.algStatus.daysRemaining} Resttagen liegt der
              ALG I-Anspruch unter dem GZ-Minimum von 150 Tagen.
            </div>
          )}

        {/* Validation warnings */}
        {moduleData?.validation?.majorConcerns &&
          moduleData.validation.majorConcerns.length > 0 && (
            <div
              className="rounded-md bg-yellow-500/10 p-3 text-yellow-700 dark:text-yellow-400 text-sm"
              role="alert"
            >
              <strong>Zu klären:</strong>
              <ul className="list-disc list-inside mt-1">
                {moduleData.validation.majorConcerns.map((concern, i) => (
                  <li key={i}>{concern}</li>
                ))}
              </ul>
            </div>
          )}
      </CardContent>
    </Card>
  );
}

// Export for barrel file
export default IntakePreview;
