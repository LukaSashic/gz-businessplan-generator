'use client';

import type { ModuleTransition as ModuleTransitionType } from '@/lib/workshop/transitions';

interface ModuleTransitionProps {
  transition: ModuleTransitionType;
  onContinue: () => void;
  onPause: () => void;
}

export default function ModuleTransition({
  transition,
  onContinue,
  onPause
}: ModuleTransitionProps) {
  const { completed, next, progress } = transition;

  return (
    <div className="transition-container mx-auto max-w-4xl p-6 md:p-8">
      {/* Celebration Header */}
      <div className="mb-8 text-center">
        <div className="mb-4 text-5xl md:text-6xl">🎉</div>
        <h1 className="mb-2 text-2xl font-bold text-green-600 md:text-3xl">
          MODUL {completed.moduleNumber} ABGESCHLOSSEN!
        </h1>
        <p className="text-muted-foreground">
          Dauer: {completed.duration}
        </p>
      </div>

      {/* Achievements */}
      <div className="mb-8 rounded-lg border-2 border-green-200 bg-green-50 p-4 md:p-6 dark:border-green-800 dark:bg-green-950/30">
        <h2 className="mb-4 text-lg font-semibold md:text-xl">
          Das hast du geschafft:
        </h2>
        <div className="space-y-3">
          {completed.achievements.map((achievement, idx) => (
            <div
              key={idx}
              className={`flex items-start rounded p-3 ${
                achievement.status === 'complete'
                  ? 'bg-white dark:bg-green-900/30'
                  : achievement.status === 'warning'
                    ? 'bg-yellow-50 dark:bg-yellow-900/30'
                    : 'bg-blue-50 dark:bg-blue-900/30'
              }`}
            >
              <span className="mr-3 text-xl md:text-2xl">{achievement.icon}</span>
              <div className="flex-1">
                <h3 className="font-medium">{achievement.label}</h3>
                <p className="text-sm text-muted-foreground">{achievement.value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Data Quality */}
      {completed.dataQuality.issues.length > 0 && (
        <div className="mb-8 rounded-lg border-2 border-blue-200 bg-blue-50 p-4 md:p-6 dark:border-blue-800 dark:bg-blue-950/30">
          <h2 className="mb-4 text-lg font-semibold md:text-xl">
            Qualitäts-Check: {completed.dataQuality.score}/100
          </h2>
          <div className="space-y-2">
            {completed.dataQuality.issues.map((issue, idx) => (
              <div
                key={idx}
                className={`flex items-start rounded border-l-4 p-3 ${
                  issue.severity === 'error'
                    ? 'border-red-500 bg-red-100 dark:bg-red-900/30'
                    : issue.severity === 'warning'
                      ? 'border-yellow-500 bg-yellow-100 dark:bg-yellow-900/30'
                      : 'border-blue-500 bg-blue-100 dark:bg-blue-900/30'
                }`}
              >
                <span className="mr-2">
                  {issue.severity === 'error'
                    ? '⚠️'
                    : issue.severity === 'warning'
                      ? '⚡'
                      : 'ℹ️'}
                </span>
                <div className="flex-1">
                  <p className="font-medium">{issue.message}</p>
                  {issue.action && (
                    <p className="mt-1 text-sm text-muted-foreground">
                      → {issue.action}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Progress Bar */}
      <div className="mb-8">
        <div className="mb-2 flex justify-between text-sm text-muted-foreground">
          <span>Gesamtfortschritt</span>
          <span>
            Modul {progress.completedModules} von {progress.totalModules} abgeschlossen
          </span>
        </div>
        <div className="relative h-4 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="flex h-4 items-center justify-end rounded-full bg-gradient-to-r from-blue-500 to-green-500 pr-2 transition-all duration-1000"
            style={{ width: `${progress.percentage}%` }}
          >
            <span className="text-xs font-bold text-white">
              {progress.percentage}%
            </span>
          </div>
        </div>
        <p className="mt-1 text-right text-xs text-muted-foreground">
          Geschätzte Restzeit: {progress.estimatedTimeRemaining}
        </p>
      </div>

      {/* Next Module Preview */}
      <div className="rounded-lg border-2 border-blue-300 bg-gradient-to-br from-blue-50 to-purple-50 p-4 md:p-6 dark:border-blue-700 dark:from-blue-950/30 dark:to-purple-950/30">
        <h2 className="mb-2 text-xl font-bold md:text-2xl">
          Als Nächstes: MODUL {next.moduleNumber} - {next.moduleTitle}
        </h2>
        <p className="mb-6 text-muted-foreground">
          Dauer: {next.estimatedDuration}
        </p>

        {/* Sections */}
        {next.sections.length > 0 && (
          <div className="mb-6 space-y-4">
            {next.sections.map((section, idx) => (
              <div
                key={idx}
                className="flex rounded-lg bg-white p-4 shadow-sm dark:bg-background"
              >
                <div className="mr-4 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-blue-500 text-lg font-bold text-white md:h-12 md:w-12">
                  {section.number}
                </div>
                <div className="flex-1">
                  <div className="mb-2 flex items-start justify-between">
                    <h3 className="font-semibold md:text-lg">{section.title}</h3>
                    <span className="ml-2 text-sm text-muted-foreground">
                      {section.duration}
                    </span>
                  </div>
                  <p className="mb-2 text-sm text-muted-foreground">
                    {section.description}
                  </p>
                  <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
                    ✓ Ergebnis: {section.deliverable}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Why Important */}
        <div className="rounded border-l-4 border-yellow-400 bg-yellow-50 p-4 dark:bg-yellow-950/30">
          <h3 className="mb-2 font-semibold">Warum dieses Modul wichtig ist:</h3>
          <p className="whitespace-pre-line text-sm leading-relaxed">
            {next.whyImportant}
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-8 flex flex-col gap-4 md:flex-row">
        <button
          onClick={onContinue}
          className="flex-1 rounded-lg bg-blue-600 px-8 py-4 text-lg font-semibold text-white shadow-lg transition-all hover:bg-blue-700 hover:shadow-xl"
        >
          Weiter zu Modul {next.moduleNumber}
        </button>
        <button
          onClick={onPause}
          className="rounded-lg border-2 border-muted-foreground/30 px-8 py-4 font-semibold text-muted-foreground transition-colors hover:bg-muted"
        >
          Pause machen
        </button>
      </div>

      <p className="mt-4 text-center text-xs text-muted-foreground">
        Dein Fortschritt wird automatisch gespeichert
      </p>
    </div>
  );
}
