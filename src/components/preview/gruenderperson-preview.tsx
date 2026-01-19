'use client';

/**
 * Gründerperson Preview Component (GZ-403)
 *
 * Displays Module 1 Gründerperson data as bullet points updating in real-time from Jotai atoms.
 * Shows: Berufserfahrung, Qualifikation, Kernkompetenz, Motivation, Stärken-Profil
 */

import * as React from 'react';
import { useAtomValue } from 'jotai';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { streamingDataFamily, currentWorkshopIdAtom } from '@/lib/state/workshop-atoms';
import {
  type PartialGruenderpersonOutput,
  type GruenderpersonPhase,
  GruenderpersonPhaseInfo,
  isGruenderpersonComplete
} from '@/types/modules/gruenderperson';
import { cn } from '@/lib/utils';
import {
  User,
  Briefcase,
  GraduationCap,
  Star,
  Heart,
  CheckCircle
} from 'lucide-react';

// ============================================================================
// Types
// ============================================================================

interface GruenderpersonPreviewProps {
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

function QualificationBadge({ level }: { level?: 'high' | 'medium' | 'low' | 'none' }) {
  if (!level) return null;

  const variants = {
    high: { variant: 'default' as const, text: 'Hoch' },
    medium: { variant: 'secondary' as const, text: 'Mittel' },
    low: { variant: 'outline' as const, text: 'Niedrig' },
    none: { variant: 'destructive' as const, text: 'Keine' },
  };

  const config = variants[level];
  return <Badge variant={config.variant}>{config.text}</Badge>;
}

function MotivationBadge({ type }: { type?: 'intrinsic' | 'extrinsic' | 'mixed' }) {
  if (!type) return null;

  const variants = {
    intrinsic: { variant: 'default' as const, text: 'Intrinsisch' },
    extrinsic: { variant: 'secondary' as const, text: 'Extrinsisch' },
    mixed: { variant: 'outline' as const, text: 'Gemischt' },
  };

  const config = variants[type];
  return <Badge variant={config.variant}>{config.text}</Badge>;
}

// ============================================================================
// Main Component
// ============================================================================

export function GruenderpersonPreview({ className }: GruenderpersonPreviewProps) {
  const workshopId = useAtomValue(currentWorkshopIdAtom);
  const streamingData = useAtomValue(
    streamingDataFamily(workshopId || 'default')
  );

  // Extract gründerperson data from streaming module data
  const moduleData = streamingData.moduleData as PartialGruenderpersonOutput | null;
  const currentPhase = (streamingData.currentPhase || 'intro') as GruenderpersonPhase;
  const phaseInfo = GruenderpersonPhaseInfo[currentPhase];

  // Calculate completion progress
  const calculateProgress = React.useMemo(() => {
    if (!moduleData) return 0;

    const sections = [
      !!moduleData.berufserfahrung?.totalYears,
      !!moduleData.qualifikation?.education,
      !!moduleData.staerkenProfil?.narrative,
      !!moduleData.motivation?.whyStatement,
      !!moduleData.confidenceStatement,
    ];

    const completed = sections.filter(Boolean).length;
    return Math.round((completed / sections.length) * 100);
  }, [moduleData]);

  const isComplete = moduleData ? isGruenderpersonComplete(moduleData) : false;

  // Extract key achievements and skills lists
  const achievementsList = React.useMemo(() => {
    const items: string[] = [];
    if (moduleData?.berufserfahrung?.achievements) {
      items.push(...moduleData.berufserfahrung.achievements);
    }
    if (moduleData?.berufserfahrung?.keyRoles) {
      items.push(...moduleData.berufserfahrung.keyRoles.map(role => `Role: ${role}`));
    }
    return items;
  }, [moduleData?.berufserfahrung?.achievements, moduleData?.berufserfahrung?.keyRoles]);

  const skillsList = React.useMemo(() => {
    const items: string[] = [];
    if (moduleData?.berufserfahrung?.acquiredSkills) {
      items.push(...moduleData.berufserfahrung.acquiredSkills);
    }
    if (moduleData?.qualifikation?.selfTaught) {
      items.push(...moduleData.qualifikation.selfTaught.map(skill => `Autodidakt: ${skill}`));
    }
    return items;
  }, [moduleData?.berufserfahrung?.acquiredSkills, moduleData?.qualifikation?.selfTaught]);

  const strengthsList = React.useMemo(() => {
    const items: string[] = [];
    if (moduleData?.staerkenProfil?.fromIntake) {
      items.push(...moduleData.staerkenProfil.fromIntake);
    }
    if (moduleData?.staerkenProfil?.newlyDiscovered) {
      items.push(...moduleData.staerkenProfil.newlyDiscovered);
    }
    if (moduleData?.staerkenProfil?.validated) {
      items.push(...moduleData.staerkenProfil.validated);
    }
    return items;
  }, [
    moduleData?.staerkenProfil?.fromIntake,
    moduleData?.staerkenProfil?.newlyDiscovered,
    moduleData?.staerkenProfil?.validated
  ]);

  return (
    <Card className={cn('w-full', className)} aria-label="Gründerperson Übersicht">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">Gründerperson</CardTitle>
            <CardDescription>
              {phaseInfo?.label || 'Einführung'}
            </CardDescription>
          </div>
          <div className="flex gap-2">
            {moduleData?.qualifikation?.relevanceLevel && (
              <QualificationBadge level={moduleData.qualifikation.relevanceLevel} />
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
            aria-label={`Gründerperson Fortschritt: ${calculateProgress}%`}
            className="h-2"
          />
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Berufserfahrung */}
        <Section
          title="Berufserfahrung"
          icon={<Briefcase className="h-4 w-4" />}
          aria-label="Berufserfahrung"
        >
          <div className="space-y-1">
            <DataItem
              label="Berufsjahre gesamt"
              value={
                moduleData?.berufserfahrung?.totalYears !== undefined
                  ? `${moduleData.berufserfahrung.totalYears} Jahre`
                  : undefined
              }
            />
            <DataItem
              label="Branchenerfahrung"
              value={
                moduleData?.berufserfahrung?.industryYears !== undefined
                  ? `${moduleData.berufserfahrung.industryYears} Jahre`
                  : undefined
              }
            />
          </div>
          {achievementsList.length > 0 && (
            <div className="mt-2">
              <span className="font-medium text-sm">Erfolge & Rollen:</span>
              <BulletList items={achievementsList} />
            </div>
          )}
          {!moduleData?.berufserfahrung?.totalYears && (
            <p className="text-muted-foreground italic">Noch keine Daten</p>
          )}
        </Section>

        {/* Qualifikation */}
        <Section
          title="Qualifikation"
          icon={<GraduationCap className="h-4 w-4" />}
          aria-label="Qualifikation"
        >
          <div className="space-y-1">
            <DataItem
              label="Ausbildung"
              value={moduleData?.qualifikation?.education}
            />
            {moduleData?.qualifikation?.relevanceLevel && (
              <div className="flex items-center gap-2">
                <span className="font-medium">Relevanz:</span>
                <QualificationBadge level={moduleData.qualifikation.relevanceLevel} />
              </div>
            )}
          </div>
          {moduleData?.qualifikation?.certifications && moduleData.qualifikation.certifications.length > 0 && (
            <div className="mt-2">
              <span className="font-medium text-sm">Zertifikate:</span>
              <BulletList items={moduleData.qualifikation.certifications} />
            </div>
          )}
          {moduleData?.qualifikation?.trainings && moduleData.qualifikation.trainings.length > 0 && (
            <div className="mt-2">
              <span className="font-medium text-sm">Weiterbildungen:</span>
              <BulletList items={moduleData.qualifikation.trainings} />
            </div>
          )}
          {moduleData?.qualifikation?.reasoning && (
            <div className="mt-2 p-2 bg-muted/50 rounded-md text-xs">
              <strong>Einschätzung:</strong> {moduleData.qualifikation.reasoning}
            </div>
          )}
          {!moduleData?.qualifikation?.education && (
            <p className="text-muted-foreground italic">Noch keine Daten</p>
          )}
        </Section>

        {/* Kernkompetenzen */}
        <Section
          title="Kernkompetenzen"
          icon={<Star className="h-4 w-4" />}
          aria-label="Kernkompetenzen"
        >
          <BulletList items={skillsList} />
        </Section>

        {/* Motivation */}
        <Section
          title="Motivation"
          icon={<Heart className="h-4 w-4" />}
          aria-label="Motivation"
        >
          <div className="space-y-2">
            {moduleData?.motivation?.type && (
              <div className="flex items-center gap-2">
                <span className="font-medium">Typ:</span>
                <MotivationBadge type={moduleData.motivation.type} />
              </div>
            )}
            {moduleData?.motivation?.whyStatement && (
              <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-md border-l-4 border-blue-500">
                <p className="font-medium text-blue-900 dark:text-blue-100">
                  "{moduleData.motivation.whyStatement}"
                </p>
              </div>
            )}
            <div className="space-y-1">
              <DataItem
                label="Vision"
                value={moduleData?.motivation?.vision}
              />
            </div>
            {moduleData?.motivation?.pushFactors && moduleData.motivation.pushFactors.length > 0 && (
              <div className="mt-2">
                <span className="font-medium text-sm">Herausforderungen (Push-Faktoren):</span>
                <BulletList items={moduleData.motivation.pushFactors} />
              </div>
            )}
            {moduleData?.motivation?.pullFactors && moduleData.motivation.pullFactors.length > 0 && (
              <div className="mt-2">
                <span className="font-medium text-sm">Chancen (Pull-Faktoren):</span>
                <BulletList items={moduleData.motivation.pullFactors} />
              </div>
            )}
          </div>
          {!moduleData?.motivation?.whyStatement && (
            <p className="text-muted-foreground italic">Noch keine Daten</p>
          )}
        </Section>

        {/* Stärken-Profil */}
        <Section
          title="Stärken-Profil"
          icon={<User className="h-4 w-4" />}
          aria-label="Stärken Profil"
        >
          <div className="space-y-2">
            {moduleData?.staerkenProfil?.narrative && (
              <div className="p-3 bg-green-50 dark:bg-green-950/20 rounded-md border-l-4 border-green-500">
                <p className="text-green-900 dark:text-green-100">
                  {moduleData.staerkenProfil.narrative}
                </p>
              </div>
            )}
            <BulletList items={strengthsList} />
          </div>
        </Section>

        {/* Confidence Statement */}
        {moduleData?.confidenceStatement && (
          <div
            className="rounded-md bg-primary/10 p-3 text-primary"
            role="region"
            aria-label="Selbstvertrauen Statement"
          >
            <strong>Selbstvertrauen:</strong> {moduleData.confidenceStatement}
          </div>
        )}

        {/* Processed Beliefs (CBC Results) */}
        {moduleData?.processedBeliefs && moduleData.processedBeliefs.length > 0 && (
          <Section title="Überarbeitete Überzeugungen" aria-label="Überarbeitete Überzeugungen">
            <div className="space-y-2">
              {moduleData.processedBeliefs.map((belief, i) => (
                <div key={i} className="p-2 bg-muted/50 rounded-md text-xs space-y-1">
                  {belief.belief && <p><strong>Ursprünglich:</strong> "{belief.belief}"</p>}
                  {belief.reframe && <p><strong>Neu gerahmt:</strong> "{belief.reframe}"</p>}
                  {belief.action && <p><strong>Aktion:</strong> {belief.action}</p>}
                </div>
              ))}
            </div>
          </Section>
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
export default GruenderpersonPreview;