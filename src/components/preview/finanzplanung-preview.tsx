'use client';

/**
 * Finanzplanung Preview Component (GZ-604)
 *
 * Displays all 7 parts of financial planning with real-time calculation updates.
 * Shows: Kapitalbedarf, Finanzierung, Privatentnahme, Umsatzplanung, Kostenplanung, Rentabilität, Liquidität
 *
 * Key Features:
 * - German EUR formatting throughout
 * - Real-time updates from Jotai atoms
 * - Warning indicators for validation issues (red flags)
 * - Accessible with proper ARIA labels
 * - Key metrics: Gesamtkapitalbedarf, Break-Even Month, 3-Year Profit
 */

import * as React from 'react';
import { useAtomValue } from 'jotai';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle } from 'lucide-react';
import { streamingDataFamily, currentWorkshopIdAtom } from '@/lib/state/workshop-atoms';
import type {
  PartialFinanzplanungOutput,
  FinanzplanungPhase
} from '@/types/modules/finanzplanung';
import { cn } from '@/lib/utils';

// ============================================================================
// Types
// ============================================================================

interface FinanzplanungPreviewProps {
  className?: string;
}

interface SectionProps {
  title: string;
  status?: 'completed' | 'in_progress' | 'not_started';
  children: React.ReactNode;
  'aria-label'?: string;
  warning?: boolean;
  error?: boolean;
}

interface KeyMetricProps {
  label: string;
  value: string | number;
  description?: string;
  trend?: 'up' | 'down' | 'neutral';
  warning?: boolean;
  error?: boolean;
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Format currency in German format: 1.234,56 €
 */
function formatCurrency(amount: number | undefined | null): string {
  if (amount === undefined || amount === null || isNaN(amount)) {
    return '0,00 €';
  }

  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
  }).format(amount);
}

/**
 * Format percentage in German format: 15,5%
 */
function formatPercentage(value: number | undefined | null): string {
  if (value === undefined || value === null || isNaN(value)) {
    return '0,0%';
  }

  return new Intl.NumberFormat('de-DE', {
    style: 'percent',
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(value / 100);
}

/**
 * Get section completion status
 */
function getSectionStatus(data: any): 'completed' | 'in_progress' | 'not_started' {
  if (!data) return 'not_started';

  // Check if section has substantial data
  const hasData = Object.values(data).some(value =>
    value !== undefined && value !== null && value !== 0 && value !== ''
  );

  if (hasData) {
    // Check if it looks complete (has multiple fields filled)
    const filledFields = Object.values(data).filter(value =>
      value !== undefined && value !== null && value !== 0 && value !== ''
    ).length;

    return filledFields >= 3 ? 'completed' : 'in_progress';
  }

  return 'not_started';
}

/**
 * Calculate overall completion percentage
 */
function calculateFinanzplanungProgress(data: PartialFinanzplanungOutput): number {
  const sections = [
    data.kapitalbedarf,
    data.finanzierung,
    data.privatentnahme,
    data.umsatzplanung,
    data.kostenplanung,
    data.rentabilitaet,
    data.liquiditaet,
  ];

  const completedSections = sections.filter(section =>
    getSectionStatus(section) === 'completed'
  ).length;

  return Math.round((completedSections / sections.length) * 100);
}

// ============================================================================
// Helper Components
// ============================================================================

function Section({
  title,
  status = 'not_started',
  children,
  'aria-label': ariaLabel,
  warning = false,
  error = false
}: SectionProps) {
  const getStatusColor = () => {
    if (error) return 'text-destructive';
    if (warning) return 'text-yellow-600 dark:text-yellow-400';
    switch (status) {
      case 'completed': return 'text-green-600 dark:text-green-400';
      case 'in_progress': return 'text-blue-600 dark:text-blue-400';
      default: return 'text-muted-foreground';
    }
  };

  const getStatusIcon = () => {
    if (error) return <AlertTriangle className="h-3 w-3" />;
    if (warning) return <AlertTriangle className="h-3 w-3" />;
    if (status === 'completed') return <CheckCircle className="h-3 w-3" />;
    return null;
  };

  return (
    <section aria-label={ariaLabel || title} className="space-y-3">
      <div className="flex items-center gap-2">
        <h3 className={cn("text-sm font-semibold", getStatusColor())}>{title}</h3>
        {getStatusIcon()}
      </div>
      <div className="text-sm">{children}</div>
    </section>
  );
}

function KeyMetric({
  label,
  value,
  description,
  trend = 'neutral',
  warning = false,
  error = false
}: KeyMetricProps) {
  const getTrendIcon = () => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'down': return <TrendingDown className="h-4 w-4 text-red-500" />;
      default: return null;
    }
  };

  const getValueColor = () => {
    if (error) return 'text-destructive';
    if (warning) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-foreground';
  };

  return (
    <div className="flex flex-col space-y-1 p-3 rounded-lg border bg-card">
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground font-medium">{label}</span>
        {getTrendIcon()}
      </div>
      <div className={cn("text-lg font-semibold", getValueColor())}>
        {typeof value === 'number' ? formatCurrency(value) : value}
      </div>
      {description && (
        <span className="text-xs text-muted-foreground">{description}</span>
      )}
    </div>
  );
}

function DataRow({ label, value, format = 'currency' }: {
  label: string;
  value: number | string | undefined | null;
  format?: 'currency' | 'percentage' | 'number' | 'text';
}) {
  if (value === undefined || value === null || value === '') {
    return null;
  }

  const formatValue = (val: number | string) => {
    if (typeof val === 'string') return val;

    switch (format) {
      case 'currency': return formatCurrency(val);
      case 'percentage': return formatPercentage(val);
      case 'number': return val.toLocaleString('de-DE');
      default: return val.toString();
    }
  };

  return (
    <div className="flex justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{formatValue(value)}</span>
    </div>
  );
}

function EmptyState({ message = "Noch keine Daten" }: { message?: string }) {
  return (
    <div className="text-center py-6 text-muted-foreground">
      <p className="text-sm italic">{message}</p>
    </div>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export function FinanzplanungPreview({ className }: FinanzplanungPreviewProps) {
  const workshopId = useAtomValue(currentWorkshopIdAtom);
  const streamingData = useAtomValue(
    streamingDataFamily(workshopId || 'default')
  );

  // Extract finanzplanung data from streaming module data
  const moduleData = streamingData.moduleData as PartialFinanzplanungOutput | null;
  const currentPhase = (streamingData.currentPhase || 'kapitalbedarf') as FinanzplanungPhase;

  // Calculate progress
  const progress = moduleData ? calculateFinanzplanungProgress(moduleData) : 0;

  // Extract data for each section
  const kapitalbedarf = moduleData?.kapitalbedarf;
  const finanzierung = moduleData?.finanzierung;
  const privatentnahme = moduleData?.privatentnahme;
  const umsatzplanung = moduleData?.umsatzplanung;
  const kostenplanung = moduleData?.kostenplanung;
  const rentabilitaet = moduleData?.rentabilitaet;
  const liquiditaet = moduleData?.liquiditaet;
  const validation = moduleData?.validation;

  // Calculate key metrics
  const gesamtkapitalbedarf = kapitalbedarf?.gesamtkapitalbedarf || 0;
  const breakEvenMonth = rentabilitaet?.breakEvenMonat;
  const jahr3Profit = rentabilitaet?.jahr3?.jahresueberschuss || 0;
  const hasFinancingGap = finanzierung ?
    (finanzierung.gesamtfinanzierung || 0) < gesamtkapitalbedarf : false;
  const hasNegativeLiquidity = validation?.liquiditaetPositiv === false;

  return (
    <Card className={cn('w-full', className)} aria-label="Finanzplanung Übersicht">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">Finanzplanung</CardTitle>
            <CardDescription>
              {currentPhase === 'kapitalbedarf' && 'Kapitalbedarf'}
              {currentPhase === 'finanzierung' && 'Finanzierung'}
              {currentPhase === 'privatentnahme' && 'Privatentnahme'}
              {currentPhase === 'umsatzplanung' && 'Umsatzplanung'}
              {currentPhase === 'kostenplanung' && 'Kostenplanung'}
              {currentPhase === 'rentabilitaet' && 'Rentabilität'}
              {currentPhase === 'liquiditaet' && 'Liquidität'}
              {currentPhase === 'completed' && 'Vollständig'}
            </CardDescription>
          </div>
        </div>

        {/* Progress indicator */}
        <div className="space-y-1 pt-2">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Fortschritt</span>
            <span aria-live="polite">{progress}%</span>
          </div>
          <Progress
            value={progress}
            aria-label={`Finanzplanung Fortschritt: ${progress}%`}
            className="h-2"
          />
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-4">
          <KeyMetric
            label="Gesamtkapitalbedarf"
            value={gesamtkapitalbedarf}
            description="Benötigtes Startkapital"
            error={hasFinancingGap}
          />
          <KeyMetric
            label="Break-Even Monat"
            value={breakEvenMonth ? `Monat ${breakEvenMonth}` : 'Nicht berechnet'}
            description="Profitabilität ab"
            warning={breakEvenMonth ? breakEvenMonth > 24 : false}
            error={breakEvenMonth ? breakEvenMonth > 36 : false}
          />
          <KeyMetric
            label="3-Jahres-Gewinn"
            value={jahr3Profit}
            description="Erwarteter Gewinn Jahr 3"
            trend={jahr3Profit > 0 ? 'up' : jahr3Profit < 0 ? 'down' : 'neutral'}
            error={jahr3Profit < 0}
          />
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Critical Warnings */}
        {hasFinancingGap && (
          <div
            className="rounded-md bg-destructive/10 p-3 text-destructive text-sm flex items-start gap-2"
            role="alert"
            aria-live="assertive"
          >
            <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
            <div>
              <strong>Finanzierungslücke:</strong> Die Finanzierung deckt den Kapitalbedarf nicht vollständig ab.
            </div>
          </div>
        )}

        {hasNegativeLiquidity && (
          <div
            className="rounded-md bg-destructive/10 p-3 text-destructive text-sm flex items-start gap-2"
            role="alert"
            aria-live="assertive"
          >
            <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
            <div>
              <strong>Negative Liquidität:</strong> In mindestens einem Monat wird die Liquidität negativ.
            </div>
          </div>
        )}

        {breakEvenMonth && breakEvenMonth > 36 && (
          <div
            className="rounded-md bg-destructive/10 p-3 text-destructive text-sm flex items-start gap-2"
            role="alert"
            aria-live="assertive"
          >
            <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
            <div>
              <strong>Break-Even zu spät:</strong> Profitabilität wird erst nach 36 Monaten erreicht.
            </div>
          </div>
        )}

        {/* A: Kapitalbedarf */}
        <Section
          title="A: Kapitalbedarf"
          status={getSectionStatus(kapitalbedarf)}
          aria-label="Kapitalbedarf"
        >
          {kapitalbedarf ? (
            <div className="space-y-2">
              <DataRow label="Gründungskosten" value={kapitalbedarf.gruendungskosten?.summe} />
              <DataRow label="Investitionen" value={kapitalbedarf.investitionenSumme} />
              <DataRow label="Anlaufkosten" value={kapitalbedarf.anlaufkosten?.summe} />
              <div className="border-t pt-2">
                <DataRow label="Gesamtkapitalbedarf" value={kapitalbedarf.gesamtkapitalbedarf} />
              </div>
            </div>
          ) : (
            <EmptyState />
          )}
        </Section>

        {/* B: Finanzierung */}
        <Section
          title="B: Finanzierung"
          status={getSectionStatus(finanzierung)}
          error={hasFinancingGap}
          aria-label="Finanzierung"
        >
          {finanzierung ? (
            <div className="space-y-2">
              <DataRow label="Eigenkapitalquote" value={finanzierung.eigenkapitalQuote} format="percentage" />
              <DataRow label="Fremdkapitalquote" value={finanzierung.fremdkapitalQuote} format="percentage" />
              <DataRow label="Gesamtfinanzierung" value={finanzierung.gesamtfinanzierung} />
              {finanzierung.finanzierungsluecke !== undefined && finanzierung.finanzierungsluecke !== 0 && (
                <div className={cn("border-t pt-2", hasFinancingGap && "text-destructive")}>
                  <DataRow
                    label={finanzierung.finanzierungsluecke > 0 ? "Finanzierungslücke" : "Finanzierungsüberschuss"}
                    value={Math.abs(finanzierung.finanzierungsluecke)}
                  />
                </div>
              )}
            </div>
          ) : (
            <EmptyState />
          )}
        </Section>

        {/* C: Privatentnahme */}
        <Section
          title="C: Privatentnahme"
          status={getSectionStatus(privatentnahme)}
          aria-label="Privatentnahme"
        >
          {privatentnahme ? (
            <div className="space-y-2">
              <DataRow label="Monatliche Privatentnahme" value={privatentnahme.monatlichePrivatentnahme} />
              <DataRow label="Jährliche Privatentnahme" value={privatentnahme.jaehrlichePrivatentnahme} />
              {privatentnahme.sparrate && privatentnahme.sparrate > 0 && (
                <DataRow label="Geplante Sparrate" value={privatentnahme.sparrate} />
              )}
            </div>
          ) : (
            <EmptyState />
          )}
        </Section>

        {/* D: Umsatzplanung */}
        <Section
          title="D: Umsatzplanung"
          status={getSectionStatus(umsatzplanung)}
          aria-label="Umsatzplanung"
        >
          {umsatzplanung ? (
            <div className="space-y-2">
              <DataRow label="Umsatz Jahr 1" value={umsatzplanung.umsatzJahr1Summe} />
              <DataRow label="Umsatz Jahr 2" value={umsatzplanung.umsatzJahr2} />
              <DataRow label="Umsatz Jahr 3" value={umsatzplanung.umsatzJahr3} />
              {umsatzplanung.wachstumsrateJahr2 !== undefined && (
                <div className="border-t pt-2">
                  <DataRow label="Wachstum Jahr 2" value={umsatzplanung.wachstumsrateJahr2} format="percentage" />
                  <DataRow label="Wachstum Jahr 3" value={umsatzplanung.wachstumsrateJahr3} format="percentage" />
                </div>
              )}
            </div>
          ) : (
            <EmptyState />
          )}
        </Section>

        {/* E: Kostenplanung */}
        <Section
          title="E: Kostenplanung"
          status={getSectionStatus(kostenplanung)}
          aria-label="Kostenplanung"
        >
          {kostenplanung ? (
            <div className="space-y-2">
              <DataRow label="Fixkosten (monatlich)" value={kostenplanung.fixkostenSummeMonatlich} />
              <DataRow label="Fixkosten (jährlich)" value={kostenplanung.fixkostenSummeJaehrlich} />
              <DataRow label="Gesamtkosten Jahr 1" value={kostenplanung.gesamtkostenJahr1} />
              <DataRow label="Gesamtkosten Jahr 2" value={kostenplanung.gesamtkostenJahr2} />
              <DataRow label="Gesamtkosten Jahr 3" value={kostenplanung.gesamtkostenJahr3} />
            </div>
          ) : (
            <EmptyState />
          )}
        </Section>

        {/* F: Rentabilität */}
        <Section
          title="F: Rentabilität"
          status={getSectionStatus(rentabilitaet)}
          warning={breakEvenMonth ? breakEvenMonth > 24 : false}
          error={breakEvenMonth ? breakEvenMonth > 36 : false}
          aria-label="Rentabilität"
        >
          {rentabilitaet ? (
            <div className="space-y-3">
              {/* Break-Even */}
              {breakEvenMonth && (
                <div className="space-y-1">
                  <DataRow label="Break-Even Monat" value={`Monat ${breakEvenMonth}`} format="text" />
                  {rentabilitaet.breakEvenUmsatz && (
                    <DataRow label="Break-Even Umsatz" value={rentabilitaet.breakEvenUmsatz} />
                  )}
                </div>
              )}

              {/* 3-Year Profitability */}
              <div className="border-t pt-2 space-y-1">
                <DataRow label="Jahresüberschuss Jahr 1" value={rentabilitaet.jahr1?.jahresueberschuss} />
                <DataRow label="Jahresüberschuss Jahr 2" value={rentabilitaet.jahr2?.jahresueberschuss} />
                <DataRow label="Jahresüberschuss Jahr 3" value={rentabilitaet.jahr3?.jahresueberschuss} />
              </div>

              {/* Margins */}
              {rentabilitaet.jahr1?.umsatzrendite !== undefined && (
                <div className="border-t pt-2 space-y-1">
                  <DataRow label="Umsatzrendite Jahr 1" value={rentabilitaet.jahr1.umsatzrendite} format="percentage" />
                  <DataRow label="Umsatzrendite Jahr 2" value={rentabilitaet.jahr2?.umsatzrendite} format="percentage" />
                  <DataRow label="Umsatzrendite Jahr 3" value={rentabilitaet.jahr3?.umsatzrendite} format="percentage" />
                </div>
              )}
            </div>
          ) : (
            <EmptyState />
          )}
        </Section>

        {/* G: Liquidität */}
        <Section
          title="G: Liquidität"
          status={getSectionStatus(liquiditaet)}
          error={hasNegativeLiquidity}
          aria-label="Liquidität"
        >
          {liquiditaet ? (
            <div className="space-y-2">
              <DataRow label="Minimum Liquidität" value={liquiditaet.minimumLiquiditaet} />
              {liquiditaet.minimumMonat && (
                <DataRow label="Kritischer Monat" value={`Monat ${liquiditaet.minimumMonat}`} format="text" />
              )}
              <DataRow label="Durchschnitt Liquidität" value={liquiditaet.durchschnittLiquiditaet} />
              {liquiditaet.liquiditaetsReserve !== undefined && (
                <DataRow label="Liquiditätsreserve" value={liquiditaet.liquiditaetsReserve} />
              )}

              {liquiditaet.hatNegativeLiquiditaet && (
                <div
                  className="rounded-md bg-destructive/10 p-3 text-destructive text-sm flex items-start gap-2 mt-3"
                  role="alert"
                  aria-live="assertive"
                >
                  <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
                  <div>
                    Negative Liquidität in mindestens einem Monat erkannt.
                    Dies ist ein kritischer Blocker für die BA-Genehmigung.
                  </div>
                </div>
              )}
            </div>
          ) : (
            <EmptyState />
          )}
        </Section>

        {/* Validation Summary */}
        {validation && (validation.blockers?.length || validation.warnings?.length) && (
          <Section title="Validation" status="completed" aria-label="Validation Status">
            <div className="space-y-3">
              {validation.blockers && validation.blockers.length > 0 && (
                <div
                  className="rounded-md bg-destructive/10 p-3 text-destructive text-sm flex items-start gap-2"
                  role="alert"
                  aria-live="assertive"
                >
                  <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
                  <div>
                    <strong>Blocker:</strong>
                    <ul className="list-disc list-inside mt-1">
                      {validation.blockers.map((blocker, i) => (
                        <li key={i}>{blocker}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {validation.warnings && validation.warnings.length > 0 && (
                <div
                  className="rounded-md bg-yellow-500/10 p-3 text-yellow-700 dark:text-yellow-400 text-sm flex items-start gap-2"
                  role="alert"
                >
                  <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
                  <div>
                    <strong>Warnungen:</strong>
                    <ul className="list-disc list-inside mt-1">
                      {validation.warnings.map((warning, i) => (
                        <li key={i}>{warning}</li>
                      ))}
                    </ul>
                  </div>
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
export default FinanzplanungPreview;