'use client';

import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Package,
  Users,
  Heart,
  Trophy,
  Target,
  BarChart3,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Circle,
  CircleDot,
  FileText,
  LayoutGrid,
} from 'lucide-react';
import type {
  PartialGeschaeftsmodellOutput,
  GeschaeftsmodellPhase,
} from '@/types/modules/geschaeftsmodell';
import {
  GeschaeftsmodellPhaseInfo,
  validateGeschaeftsmodellPhase,
  calculateGeschaeftsmodellProgress,
  getGeschaeftsmodellFieldLabel,
  getBAComplianceBlockers,
  getBAComplianceWarnings,
  formatDeliveryFormat,
  formatPricingModel,
  formatUSPCategory,
} from '@/types/modules/geschaeftsmodell';

interface GeschaeftsmodellPreviewProps {
  data: PartialGeschaeftsmodellOutput | null;
  currentPhase?: GeschaeftsmodellPhase;
}

/**
 * Phase order for display
 */
const PHASE_ORDER: GeschaeftsmodellPhase[] = [
  'angebot',
  'zielgruppe',
  'wertversprechen',
  'usp',
];

/**
 * Phase progress stepper component
 */
function PhaseProgressStepper({
  currentPhase,
  data,
}: {
  currentPhase: GeschaeftsmodellPhase;
  data: PartialGeschaeftsmodellOutput | null;
}) {
  const currentIndex = PHASE_ORDER.indexOf(currentPhase);

  return (
    <div className="space-y-2">
      {PHASE_ORDER.map((phase, index) => {
        const phaseInfo = GeschaeftsmodellPhaseInfo[phase];
        const validation = data
          ? validateGeschaeftsmodellPhase(phase, data)
          : { isComplete: false, missingFields: [], completedFields: [] };
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
                  Offen:{' '}
                  {validation.missingFields
                    .slice(0, 3)
                    .map((f) => getGeschaeftsmodellFieldLabel(f))
                    .join(', ')}
                  {validation.missingFields.length > 3 &&
                    ` +${validation.missingFields.length - 3}`}
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
                  {(validation.completedFields?.length || 0) +
                    (validation.missingFields?.length || 0)}
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function GeschaeftsmodellPreview({
  data,
  currentPhase = 'angebot',
}: GeschaeftsmodellPreviewProps) {
  const [viewMode, setViewMode] = useState<'data' | 'document'>('data');

  // Calculate completion percentage
  const completionPercentage = useMemo(() => {
    if (!data) return 0;
    return calculateGeschaeftsmodellProgress(data);
  }, [data]);

  // BA Compliance checks
  const blockers = useMemo(() => {
    if (!data) return [];
    return getBAComplianceBlockers(data);
  }, [data]);

  const warnings = useMemo(() => {
    if (!data) return [];
    return getBAComplianceWarnings(data);
  }, [data]);

  if (!data) {
    return (
      <div className="flex h-full items-center justify-center text-muted-foreground">
        <div className="text-center">
          <Package className="mx-auto h-12 w-12 opacity-50" />
          <p className="mt-4">Starte das Gespräch, um dein Geschäftsmodell zu entwickeln</p>
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
          <DocumentView data={data} />
        ) : (
          <DataView
            data={data}
            currentPhase={currentPhase}
            completionPercentage={completionPercentage}
            blockers={blockers}
            warnings={warnings}
          />
        )}
      </div>
    </div>
  );
}

/**
 * Data card view
 */
function DataView({
  data,
  currentPhase,
  completionPercentage,
  blockers,
  warnings,
}: {
  data: PartialGeschaeftsmodellOutput;
  currentPhase: GeschaeftsmodellPhase;
  completionPercentage: number;
  blockers: string[];
  warnings: string[];
}) {
  return (
    <div className="space-y-4 p-4">
      {/* Progress Header */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Geschäftsmodell Fortschritt</CardTitle>
            <Badge variant={completionPercentage === 100 ? 'default' : 'secondary'}>
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

      {/* BA Compliance Blockers */}
      {blockers.length > 0 && (
        <Card className="border-red-300">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base text-red-700">
              <XCircle className="h-4 w-4" />
              BA-Compliance Blocker ({blockers.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {blockers.map((blocker, index) => (
              <div
                key={index}
                className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800"
              >
                {blocker}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* BA Compliance Warnings */}
      {warnings.length > 0 && (
        <Card className="border-orange-300">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base text-orange-700">
              <AlertTriangle className="h-4 w-4" />
              Verbesserungsvorschläge ({warnings.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {warnings.map((warning, index) => (
              <div
                key={index}
                className="rounded-md border border-orange-200 bg-orange-50 p-3 text-sm text-orange-800"
              >
                {warning}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Offering Card */}
      {data.offering && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Package className="h-4 w-4" />
              Angebot
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {data.offering.mainOffering && (
              <div>
                <p className="font-medium">Hauptangebot</p>
                <p className="text-muted-foreground">{data.offering.mainOffering}</p>
              </div>
            )}

            {data.offering.oneSentencePitch && (
              <div>
                <p className="font-medium">Elevator Pitch</p>
                <p className="text-muted-foreground italic">
                  &quot;{data.offering.oneSentencePitch}&quot;
                </p>
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              {data.offering.deliveryFormat && (
                <Badge variant="outline">
                  {formatDeliveryFormat(data.offering.deliveryFormat)}
                </Badge>
              )}
              {data.offering.pricingModel && (
                <Badge variant="outline">
                  {formatPricingModel(data.offering.pricingModel)}
                </Badge>
              )}
            </div>

            {data.offering.scope?.included && data.offering.scope.included.length > 0 && (
              <div>
                <p className="font-medium text-green-600">Inkludiert</p>
                <ul className="mt-1 list-inside list-disc text-muted-foreground">
                  {data.offering.scope.included.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>
            )}

            {data.offering.scope?.excluded && data.offering.scope.excluded.length > 0 && (
              <div>
                <p className="font-medium text-red-600">Nicht inkludiert</p>
                <ul className="mt-1 list-inside list-disc text-muted-foreground">
                  {data.offering.scope.excluded.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Target Audience Card */}
      {data.targetAudience && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Users className="h-4 w-4" />
              Zielgruppe
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {data.targetAudience.primaryPersona && (
              <div>
                {data.targetAudience.primaryPersona.name && (
                  <div className="mb-2">
                    <Badge variant="default">{data.targetAudience.primaryPersona.name}</Badge>
                  </div>
                )}

                {data.targetAudience.primaryPersona.demographics && (
                  <div className="grid grid-cols-2 gap-2">
                    {data.targetAudience.primaryPersona.demographics.occupation && (
                      <div>
                        <span className="text-muted-foreground">Beruf: </span>
                        <span>{data.targetAudience.primaryPersona.demographics.occupation}</span>
                      </div>
                    )}
                    {data.targetAudience.primaryPersona.demographics.location && (
                      <div>
                        <span className="text-muted-foreground">Standort: </span>
                        <span>{data.targetAudience.primaryPersona.demographics.location}</span>
                      </div>
                    )}
                  </div>
                )}

                {data.targetAudience.primaryPersona.psychographics?.challenges &&
                  data.targetAudience.primaryPersona.psychographics.challenges.length > 0 && (
                    <div className="mt-2">
                      <p className="font-medium">Herausforderungen</p>
                      <ul className="mt-1 list-inside list-disc text-muted-foreground">
                        {data.targetAudience.primaryPersona.psychographics.challenges.map(
                          (challenge, i) => (
                            <li key={i}>{challenge}</li>
                          )
                        )}
                      </ul>
                    </div>
                  )}

                {data.targetAudience.primaryPersona.buyingTrigger && (
                  <div className="mt-2">
                    <p className="font-medium">Kaufauslöser</p>
                    <p className="text-muted-foreground">
                      {data.targetAudience.primaryPersona.buyingTrigger}
                    </p>
                  </div>
                )}
              </div>
            )}

            {data.targetAudience.marketSize && (
              <div className="mt-3 rounded-md bg-muted/50 p-3">
                <p className="flex items-center gap-2 font-medium">
                  <BarChart3 className="h-4 w-4" />
                  Marktgröße
                </p>
                <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                  {data.targetAudience.marketSize.totalAddressableMarket !== undefined && (
                    <div>
                      <span className="text-muted-foreground">TAM: </span>
                      <span className="font-medium">
                        {data.targetAudience.marketSize.totalAddressableMarket.toLocaleString('de-DE')}
                      </span>
                    </div>
                  )}
                  {data.targetAudience.marketSize.serviceableMarket !== undefined && (
                    <div>
                      <span className="text-muted-foreground">SAM: </span>
                      <span className="font-medium">
                        {data.targetAudience.marketSize.serviceableMarket.toLocaleString('de-DE')}
                      </span>
                    </div>
                  )}
                  {data.targetAudience.marketSize.targetFirstYear !== undefined && (
                    <div>
                      <span className="text-muted-foreground">Ziel Jahr 1: </span>
                      <span className="font-medium">
                        {data.targetAudience.marketSize.targetFirstYear} Kunden
                      </span>
                    </div>
                  )}
                </div>
                {data.targetAudience.marketSize.tamSource && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    Quelle: {data.targetAudience.marketSize.tamSource}
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Value Proposition Card */}
      {data.valueProposition && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Heart className="h-4 w-4" />
              Wertversprechen
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {data.valueProposition.valueStatement && (
              <div className="rounded-md bg-primary/10 p-3">
                <p className="font-medium text-primary">Wertversprechen</p>
                <p className="mt-1">{data.valueProposition.valueStatement}</p>
              </div>
            )}

            {data.valueProposition.customerPains &&
              data.valueProposition.customerPains.length > 0 && (
                <div>
                  <p className="font-medium text-red-600">Kundenprobleme</p>
                  <ul className="mt-1 list-inside list-disc text-muted-foreground">
                    {data.valueProposition.customerPains.map((pain, i) => (
                      <li key={i}>{pain}</li>
                    ))}
                  </ul>
                </div>
              )}

            {data.valueProposition.painRelievers &&
              data.valueProposition.painRelievers.length > 0 && (
                <div>
                  <p className="font-medium text-green-600">Problemlöser</p>
                  <ul className="mt-1 list-inside list-disc text-muted-foreground">
                    {data.valueProposition.painRelievers.map((reliever, i) => (
                      <li key={i}>{reliever}</li>
                    ))}
                  </ul>
                </div>
              )}

            {data.valueProposition.gainCreators &&
              data.valueProposition.gainCreators.length > 0 && (
                <div>
                  <p className="font-medium text-blue-600">Wertstifter</p>
                  <ul className="mt-1 list-inside list-disc text-muted-foreground">
                    {data.valueProposition.gainCreators.map((creator, i) => (
                      <li key={i}>{creator}</li>
                    ))}
                  </ul>
                </div>
              )}
          </CardContent>
        </Card>
      )}

      {/* USP Card */}
      {data.usp && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Trophy className="h-4 w-4" />
              Alleinstellungsmerkmal (USP)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {data.usp.statement && (
              <div className="rounded-md bg-yellow-50 p-3 dark:bg-yellow-950/20">
                <p className="font-medium text-yellow-800 dark:text-yellow-200">USP Statement</p>
                <p className="mt-1 text-yellow-900 dark:text-yellow-100">
                  {data.usp.statement}
                </p>
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              {data.usp.category && (
                <Badge variant="secondary">{formatUSPCategory(data.usp.category)}</Badge>
              )}
            </div>

            {data.usp.proof && (
              <div>
                <p className="font-medium">Beweis/Nachweis</p>
                <p className="text-muted-foreground">{data.usp.proof}</p>
              </div>
            )}

            {data.usp.uspTest && (
              <div className="mt-2">
                <p className="font-medium">USP-Test</p>
                <div className="mt-1 grid grid-cols-2 gap-2">
                  <USPTestBadge label="Einzigartig" passed={data.usp.uspTest.isUnique} />
                  <USPTestBadge label="Relevant" passed={data.usp.uspTest.isRelevant} />
                  <USPTestBadge label="Belegbar" passed={data.usp.uspTest.isProvable} />
                  <USPTestBadge
                    label="Verständlich"
                    passed={data.usp.uspTest.isUnderstandable}
                  />
                  <USPTestBadge label="Ein Satz" passed={data.usp.uspTest.isOneSentence} />
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Competitive Analysis Card */}
      {data.competitiveAnalysis && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Target className="h-4 w-4" />
              Wettbewerbsanalyse
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {data.competitiveAnalysis.directCompetitors &&
              data.competitiveAnalysis.directCompetitors.length > 0 && (
                <div>
                  <p className="font-medium">
                    Wettbewerber ({data.competitiveAnalysis.directCompetitors.length})
                  </p>
                  <div className="mt-2 space-y-2">
                    {data.competitiveAnalysis.directCompetitors.map((competitor, i) => (
                      <div
                        key={i}
                        className="rounded-md border bg-card p-3"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{competitor.name}</span>
                          {competitor.pricePoint && (
                            <Badge variant="outline" className="text-xs">
                              {competitor.pricePoint}
                            </Badge>
                          )}
                        </div>
                        {competitor.offering && (
                          <p className="mt-1 text-xs text-muted-foreground">
                            {competitor.offering}
                          </p>
                        )}
                        {competitor.yourAdvantage && (
                          <p className="mt-1 text-xs text-green-600">
                            ✓ Dein Vorteil: {competitor.yourAdvantage}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

            {data.competitiveAnalysis.competitiveAdvantages &&
              data.competitiveAnalysis.competitiveAdvantages.length > 0 && (
                <div>
                  <p className="font-medium text-green-600">Deine Wettbewerbsvorteile</p>
                  <ul className="mt-1 list-inside list-disc text-muted-foreground">
                    {data.competitiveAnalysis.competitiveAdvantages.map((advantage, i) => (
                      <li key={i}>{advantage}</li>
                    ))}
                  </ul>
                </div>
              )}

            {data.competitiveAnalysis.marketGaps &&
              data.competitiveAnalysis.marketGaps.length > 0 && (
                <div>
                  <p className="font-medium text-blue-600">Marktlücken</p>
                  <ul className="mt-1 list-inside list-disc text-muted-foreground">
                    {data.competitiveAnalysis.marketGaps.map((gap, i) => (
                      <li key={i}>{gap}</li>
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

/**
 * USP Test Badge component
 */
function USPTestBadge({ label, passed }: { label: string; passed?: boolean }) {
  if (passed === undefined) return null;

  return (
    <div className="flex items-center gap-1 text-xs">
      {passed ? (
        <CheckCircle className="h-3 w-3 text-green-500" />
      ) : (
        <XCircle className="h-3 w-3 text-red-500" />
      )}
      <span className={passed ? 'text-green-700' : 'text-red-700'}>{label}</span>
    </div>
  );
}

/**
 * Document view (business plan sections preview)
 */
function DocumentView({ data }: { data: PartialGeschaeftsmodellOutput }) {
  return (
    <div className="space-y-6 p-6">
      {/* Section 3: Geschäftsidee */}
      <div className="prose prose-sm dark:prose-invert max-w-none">
        <h2 className="text-lg font-semibold">3. Geschäftsidee</h2>

        {/* 3.1 Angebotsbeschreibung */}
        <h3 className="text-base font-medium">3.1 Angebotsbeschreibung</h3>
        {data.offering?.mainOffering ? (
          <p>{data.offering.mainOffering}</p>
        ) : (
          <p className="text-muted-foreground italic">Wird im Gespräch erfasst...</p>
        )}

        {data.offering?.oneSentencePitch && (
          <blockquote className="border-l-4 border-primary pl-4 italic">
            {data.offering.oneSentencePitch}
          </blockquote>
        )}

        {/* 3.2 Kundenproblem und Lösung */}
        <h3 className="text-base font-medium">3.2 Kundenproblem und Lösung</h3>
        {data.valueProposition?.customerPains && data.valueProposition.customerPains.length > 0 ? (
          <>
            <p className="font-medium">Das Problem:</p>
            <ul>
              {data.valueProposition.customerPains.map((pain, i) => (
                <li key={i}>{pain}</li>
              ))}
            </ul>
            {data.valueProposition.painRelievers &&
              data.valueProposition.painRelievers.length > 0 && (
                <>
                  <p className="font-medium">Meine Lösung:</p>
                  <ul>
                    {data.valueProposition.painRelievers.map((reliever, i) => (
                      <li key={i}>{reliever}</li>
                    ))}
                  </ul>
                </>
              )}
          </>
        ) : (
          <p className="text-muted-foreground italic">Wird im Gespräch erfasst...</p>
        )}

        {/* 3.3 Alleinstellungsmerkmale */}
        <h3 className="text-base font-medium">3.3 Alleinstellungsmerkmale</h3>
        {data.usp?.statement ? (
          <>
            <p className="font-medium">{data.usp.statement}</p>
            {data.usp.proof && (
              <p>
                <strong>Beweis:</strong> {data.usp.proof}
              </p>
            )}
            {data.usp.measurement && (
              <p>
                <strong>Messung:</strong> {data.usp.measurement}
              </p>
            )}
          </>
        ) : (
          <p className="text-muted-foreground italic">Wird im Gespräch erfasst...</p>
        )}

        {/* Section 4.1: Zielgruppendefinition */}
        <h2 className="mt-8 text-lg font-semibold">4. Zielgruppe und Markt</h2>
        <h3 className="text-base font-medium">4.1 Zielgruppendefinition</h3>
        {data.targetAudience?.primaryPersona?.name ? (
          <>
            <p className="font-medium">
              Primäre Zielgruppe: {data.targetAudience.primaryPersona.name}
            </p>
            {data.targetAudience.primaryPersona.demographics && (
              <ul>
                {data.targetAudience.primaryPersona.demographics.occupation && (
                  <li>
                    <strong>Beruf:</strong>{' '}
                    {data.targetAudience.primaryPersona.demographics.occupation}
                  </li>
                )}
                {data.targetAudience.primaryPersona.demographics.location && (
                  <li>
                    <strong>Standort:</strong>{' '}
                    {data.targetAudience.primaryPersona.demographics.location}
                  </li>
                )}
              </ul>
            )}
            {data.targetAudience.primaryPersona.psychographics?.challenges &&
              data.targetAudience.primaryPersona.psychographics.challenges.length > 0 && (
                <>
                  <p className="font-medium">Herausforderungen:</p>
                  <ul>
                    {data.targetAudience.primaryPersona.psychographics.challenges.map(
                      (challenge, i) => (
                        <li key={i}>{challenge}</li>
                      )
                    )}
                  </ul>
                </>
              )}
          </>
        ) : (
          <p className="text-muted-foreground italic">Wird im Gespräch erfasst...</p>
        )}

        {/* Section 5.1: Erlösmodell */}
        <h2 className="mt-8 text-lg font-semibold">5. Geschäftsmodell</h2>
        <h3 className="text-base font-medium">5.1 Erlösmodell und Preisgestaltung</h3>
        {data.offering?.pricingModel ? (
          <p>
            <strong>Preismodell:</strong> {formatPricingModel(data.offering.pricingModel)}
          </p>
        ) : (
          <p className="text-muted-foreground italic">Wird im Gespräch erfasst...</p>
        )}
      </div>
    </div>
  );
}
