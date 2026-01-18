'use client';

import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  User,
  Lightbulb,
  Brain,
  Building,
  Wallet,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Circle,
  CircleDot,
  Flag,
  FileText,
  LayoutGrid,
} from 'lucide-react';
import type { PartialIntakeOutput, IntakePhase } from '@/types/modules/intake';
import {
  IntakePhaseInfo,
  checkGZEligibility,
  validateIntakePhase,
  calculateIntakeProgress,
  getFieldLabel,
} from '@/types/modules/intake';
import {
  type RedFlag,
  getRedFlagLabel,
  getRedFlagSeverityColor,
} from '@/lib/services/red-flag-detector';
import IntakeDocumentPreview from './intake-document-preview';

interface IntakePreviewProps {
  data: PartialIntakeOutput | null;
  currentPhase?: IntakePhase;
  redFlags?: RedFlag[];
}

/**
 * Phase order for display
 */
const PHASE_ORDER: IntakePhase[] = [
  'warmup',
  'founder_profile',
  'personality',
  'profile_gen',
  'resources',
  'business_type',
  'validation',
];

/**
 * Phase progress stepper component
 */
function PhaseProgressStepper({
  currentPhase,
  data,
}: {
  currentPhase: IntakePhase;
  data: PartialIntakeOutput | null;
}) {
  const currentIndex = PHASE_ORDER.indexOf(currentPhase);

  return (
    <div className="space-y-2">
      {PHASE_ORDER.map((phase, index) => {
        const phaseInfo = IntakePhaseInfo[phase];
        const validation = data ? validateIntakePhase(phase, data) : { isComplete: false, missingFields: [], completedFields: [] };
        const isCurrent = phase === currentPhase;
        const isPast = index < currentIndex;
        const isComplete = validation.isComplete;

        return (
          <div
            key={phase}
            className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm ${
              isCurrent
                ? 'bg-primary/10 border border-primary/20'
                : isPast && isComplete
                  ? 'bg-green-50 dark:bg-green-950/20'
                  : 'bg-muted/30'
            }`}
          >
            {/* Status Icon */}
            <div className="flex-shrink-0">
              {isComplete ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : isCurrent ? (
                <CircleDot className="h-4 w-4 text-primary" />
              ) : (
                <Circle className="h-4 w-4 text-muted-foreground/50" />
              )}
            </div>

            {/* Phase Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className={`font-medium ${isCurrent ? 'text-primary' : ''}`}>
                  {phaseInfo?.label || phase}
                </span>
                {isCurrent && (
                  <Badge variant="outline" className="text-xs">
                    Aktiv
                  </Badge>
                )}
              </div>

              {/* Show missing fields for current phase */}
              {isCurrent && validation.missingFields.length > 0 && (
                <div className="mt-1 text-xs text-muted-foreground">
                  Offen: {validation.missingFields.slice(0, 3).map(f => getFieldLabel(f)).join(', ')}
                  {validation.missingFields.length > 3 && ` +${validation.missingFields.length - 3}`}
                </div>
              )}
            </div>

            {/* Completion indicator */}
            <div className="flex-shrink-0 text-xs text-muted-foreground">
              {isComplete ? (
                <span className="text-green-600">Fertig</span>
              ) : (
                <span>
                  {validation.completedFields?.length || 0}/
                  {(validation.completedFields?.length || 0) + (validation.missingFields?.length || 0)}
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function IntakePreview({ data, currentPhase = 'warmup', redFlags = [] }: IntakePreviewProps) {
  const [viewMode, setViewMode] = useState<'data' | 'document'>('data');

  // Calculate completion percentage using the new helper
  const completionPercentage = useMemo(() => {
    if (!data) return 0;
    return calculateIntakeProgress(data);
  }, [data]);

  // GZ Eligibility check
  const gzEligibility = useMemo(() => {
    if (!data?.founder?.algStatus?.daysRemaining) return null;
    return checkGZEligibility(data.founder.algStatus.daysRemaining);
  }, [data?.founder?.algStatus?.daysRemaining]);

  if (!data) {
    return (
      <div className="flex h-full items-center justify-center text-muted-foreground">
        <div className="text-center">
          <User className="mx-auto h-12 w-12 opacity-50" />
          <p className="mt-4">Starte das Gespräch, um dein Profil zu erstellen</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      {/* View Mode Toggle */}
      <div className="border-b border-border bg-card px-4 py-2">
        <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as 'data' | 'document')}>
          <TabsList className="grid w-full max-w-[300px] grid-cols-2">
            <TabsTrigger value="data" className="flex items-center gap-2">
              <LayoutGrid className="h-4 w-4" />
              <span>Daten</span>
            </TabsTrigger>
            <TabsTrigger value="document" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span>Dokument</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto">
        {viewMode === 'document' ? (
          <IntakeDocumentPreview data={data} />
        ) : (
          <DataView
            data={data}
            currentPhase={currentPhase}
            completionPercentage={completionPercentage}
            gzEligibility={gzEligibility}
            redFlags={redFlags}
          />
        )}
      </div>
    </div>
  );
}

/**
 * Data card view (original layout)
 */
function DataView({
  data,
  currentPhase,
  completionPercentage,
  gzEligibility,
  redFlags,
}: {
  data: PartialIntakeOutput;
  currentPhase: IntakePhase;
  completionPercentage: number;
  gzEligibility: { isEligible: boolean; message: string } | null;
  redFlags: RedFlag[];
}) {
  return (
    <div className="space-y-4 p-4">
      {/* Progress Header */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Intake Fortschritt</CardTitle>
            <Badge variant={completionPercentage === 100 ? 'success' : 'secondary'}>
              {completionPercentage}%
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Progress value={completionPercentage} className="h-2" />

          {/* Phase Progress Stepper */}
          <PhaseProgressStepper currentPhase={currentPhase} data={data} />
        </CardContent>
      </Card>

      {/* GZ Eligibility Alert */}
      {gzEligibility && (
        <Card className={gzEligibility.isEligible ? 'border-green-500' : 'border-red-500'}>
          <CardContent className="flex items-center gap-3 py-3">
            {gzEligibility.isEligible ? (
              <CheckCircle className="h-5 w-5 text-green-500" />
            ) : (
              <XCircle className="h-5 w-5 text-red-500" />
            )}
            <div>
              <p className="font-medium">
                GZ-Berechtigung: {gzEligibility.isEligible ? 'Ja' : 'Nein'}
              </p>
              <p className="text-sm text-muted-foreground">{gzEligibility.message}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Red Flags Alert */}
      {redFlags.length > 0 && (
        <Card className="border-orange-300">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base text-orange-700">
              <Flag className="h-4 w-4" />
              Coaching-Hinweise ({redFlags.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {redFlags.map((flag, index) => (
              <div
                key={`${flag.type}-${index}`}
                className={`rounded-md border p-3 ${getRedFlagSeverityColor(flag.severity)}`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">{getRedFlagLabel(flag.type)}</span>
                  <Badge
                    variant="outline"
                    className={
                      flag.severity === 'critical'
                        ? 'border-red-400 text-red-700'
                        : flag.severity === 'major'
                          ? 'border-orange-400 text-orange-700'
                          : 'border-yellow-400 text-yellow-700'
                    }
                  >
                    {flag.severity === 'critical'
                      ? 'Kritisch'
                      : flag.severity === 'major'
                        ? 'Wichtig'
                        : 'Hinweis'}
                  </Badge>
                </div>
                <p className="mt-1 text-xs italic text-muted-foreground">
                  "{flag.trigger}"
                </p>
                <p className="mt-2 text-sm">{flag.coachingHint}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Founder Profile */}
      {data.founder && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <User className="h-4 w-4" />
              Gründerprofil
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {data.founder.currentStatus && (
              <div>
                <span className="text-muted-foreground">Status: </span>
                <Badge variant="outline">
                  {data.founder.currentStatus === 'employed'
                    ? 'Angestellt'
                    : data.founder.currentStatus === 'unemployed'
                      ? 'Arbeitslos'
                      : 'Sonstiges'}
                </Badge>
              </div>
            )}

            {data.founder.algStatus && (
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-muted-foreground">ALG monatlich: </span>
                  <span className="font-medium">
                    {data.founder.algStatus.monthlyAmount?.toLocaleString('de-DE')} €
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Resttage: </span>
                  <span className="font-medium">{data.founder.algStatus.daysRemaining}</span>
                </div>
              </div>
            )}

            {data.founder.experience && (
              <div>
                <span className="text-muted-foreground">Branchenerfahrung: </span>
                <span className="font-medium">
                  {data.founder.experience.yearsInIndustry} Jahre
                </span>
                {data.founder.experience.previousFounder && (
                  <Badge variant="secondary" className="ml-2">
                    Erfahrener Gründer
                  </Badge>
                )}
              </div>
            )}

            {data.founder.qualifications?.education && (
              <div>
                <span className="text-muted-foreground">Ausbildung: </span>
                <span>{data.founder.qualifications.education}</span>
              </div>
            )}

            {data.founder.qualifications?.certifications &&
              data.founder.qualifications.certifications.length > 0 && (
                <div>
                  <span className="text-muted-foreground">Zertifikate: </span>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {data.founder.qualifications.certifications.map((cert, i) => (
                      <Badge key={i} variant="outline" className="text-xs">
                        {cert}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
          </CardContent>
        </Card>
      )}

      {/* Business Idea */}
      {data.businessIdea && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Lightbulb className="h-4 w-4" />
              Geschäftsidee
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {data.businessIdea.elevator_pitch && (
              <div>
                <p className="font-medium">Elevator Pitch</p>
                <p className="text-muted-foreground">{data.businessIdea.elevator_pitch}</p>
              </div>
            )}

            {data.businessIdea.problem && (
              <div>
                <p className="font-medium">Problem</p>
                <p className="text-muted-foreground">{data.businessIdea.problem}</p>
              </div>
            )}

            {data.businessIdea.solution && (
              <div>
                <p className="font-medium">Lösung</p>
                <p className="text-muted-foreground">{data.businessIdea.solution}</p>
              </div>
            )}

            {data.businessIdea.targetAudience && (
              <div>
                <p className="font-medium">Zielgruppe</p>
                <p className="text-muted-foreground">{data.businessIdea.targetAudience}</p>
              </div>
            )}

            {data.businessIdea.uniqueValue && (
              <div>
                <p className="font-medium">Alleinstellungsmerkmal</p>
                <p className="text-muted-foreground">{data.businessIdea.uniqueValue}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Personality Profile */}
      {data.personality && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Brain className="h-4 w-4" />
              Unternehmerische Persönlichkeit
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {data.personality.narrative && (
              <p className="text-muted-foreground">{data.personality.narrative}</p>
            )}

            <div className="grid grid-cols-2 gap-2">
              {data.personality.innovativeness && (
                <PersonalityDimension label="Innovationsfreude" level={data.personality.innovativeness} />
              )}
              {data.personality.riskTaking && (
                <PersonalityDimension label="Risikobereitschaft" level={data.personality.riskTaking} />
              )}
              {data.personality.achievement && (
                <PersonalityDimension label="Leistungsmotivation" level={data.personality.achievement} />
              )}
              {data.personality.proactiveness && (
                <PersonalityDimension label="Proaktivität" level={data.personality.proactiveness} />
              )}
              {data.personality.locusOfControl && (
                <PersonalityDimension label="Kontrollüberzeugung" level={data.personality.locusOfControl} />
              )}
              {data.personality.selfEfficacy && (
                <PersonalityDimension label="Selbstwirksamkeit" level={data.personality.selfEfficacy} />
              )}
              {data.personality.autonomy && (
                <PersonalityDimension label="Autonomie" level={data.personality.autonomy} />
              )}
            </div>

            {data.personality.redFlags && data.personality.redFlags.length > 0 && (
              <div className="mt-2">
                <p className="flex items-center gap-1 font-medium text-orange-600">
                  <AlertTriangle className="h-4 w-4" />
                  Beachtenswertes
                </p>
                <ul className="mt-1 list-inside list-disc text-muted-foreground">
                  {data.personality.redFlags.map((flag, i) => (
                    <li key={i}>{flag}</li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Business Type */}
      {data.businessType && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Building className="h-4 w-4" />
              Geschäftstyp
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {data.businessType.category && (
              <div>
                <Badge variant="default" className="text-sm">
                  {formatBusinessCategory(data.businessType.category)}
                </Badge>
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              {data.businessType.isDigitalFirst && (
                <Badge variant="outline">Digital First</Badge>
              )}
              {data.businessType.isLocationDependent && (
                <Badge variant="outline">Standortabhängig</Badge>
              )}
              {data.businessType.requiresPhysicalInventory && (
                <Badge variant="outline">Physisches Inventar</Badge>
              )}
            </div>

            {data.businessType.reasoning && (
              <p className="text-muted-foreground">{data.businessType.reasoning}</p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Resources */}
      {data.resources && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Wallet className="h-4 w-4" />
              Ressourcen
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {data.resources.financial && (
              <div className="grid grid-cols-2 gap-2">
                {data.resources.financial.availableCapital !== undefined && (
                  <div>
                    <span className="text-muted-foreground">Eigenkapital: </span>
                    <span className="font-medium">
                      {data.resources.financial.availableCapital.toLocaleString('de-DE')} €
                    </span>
                  </div>
                )}
                {data.resources.financial.expectedGZ !== undefined && (
                  <div>
                    <span className="text-muted-foreground">Erwarteter GZ: </span>
                    <span className="font-medium">
                      {data.resources.financial.expectedGZ.toLocaleString('de-DE')} €
                    </span>
                  </div>
                )}
              </div>
            )}

            {data.resources.time && (
              <div>
                <span className="text-muted-foreground">Zeitaufwand: </span>
                <span className="font-medium">
                  {data.resources.time.hoursPerWeek}h/Woche
                  {data.resources.time.isFullTime && ' (Vollzeit)'}
                </span>
              </div>
            )}

            {data.resources.network && (
              <div>
                <span className="text-muted-foreground">Branchenkontakte: </span>
                <span className="font-medium">{data.resources.network.industryContacts}/10</span>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Validation Summary */}
      {data.validation && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <CheckCircle className="h-4 w-4" />
              Validierung
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {data.validation.strengths && data.validation.strengths.length > 0 && (
              <div>
                <p className="font-medium text-green-600">Stärken</p>
                <ul className="mt-1 list-inside list-disc text-muted-foreground">
                  {data.validation.strengths.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              </div>
            )}

            {data.validation.majorConcerns && data.validation.majorConcerns.length > 0 && (
              <div>
                <p className="font-medium text-red-600">Kritische Punkte</p>
                <ul className="mt-1 list-inside list-disc text-muted-foreground">
                  {data.validation.majorConcerns.map((c, i) => (
                    <li key={i}>{c}</li>
                  ))}
                </ul>
              </div>
            )}

            {data.validation.minorConcerns && data.validation.minorConcerns.length > 0 && (
              <div>
                <p className="font-medium text-orange-600">Hinweise</p>
                <ul className="mt-1 list-inside list-disc text-muted-foreground">
                  {data.validation.minorConcerns.map((c, i) => (
                    <li key={i}>{c}</li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Helper component for personality dimensions
function PersonalityDimension({
  label,
  level,
}: {
  label: string;
  level: 'high' | 'medium' | 'low';
}) {
  const colors = {
    high: 'bg-green-500',
    medium: 'bg-yellow-500',
    low: 'bg-red-500',
  };

  const labels = {
    high: 'Hoch',
    medium: 'Mittel',
    low: 'Niedrig',
  };

  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <div className="flex items-center gap-1">
        <div className={`h-2 w-2 rounded-full ${colors[level]}`} />
        <span className="text-xs">{labels[level]}</span>
      </div>
    </div>
  );
}

// Helper function to format business category
function formatBusinessCategory(category: string): string {
  const labels: Record<string, string> = {
    consulting: 'Beratung',
    ecommerce: 'E-Commerce',
    local_service: 'Lokale Dienstleistung',
    local_retail: 'Lokaler Einzelhandel',
    manufacturing: 'Produktion',
    hybrid: 'Hybrid',
  };

  return labels[category] || category;
}
