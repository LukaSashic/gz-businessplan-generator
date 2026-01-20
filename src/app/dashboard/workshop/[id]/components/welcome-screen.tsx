'use client';

import { Progress } from '@/components/ui/progress';
import type { WelcomeMessage } from '@/lib/workshop/welcome';

interface WelcomeScreenProps {
  message: WelcomeMessage;
  onStart: () => void;
}

export default function WelcomeScreen({ message, onStart }: WelcomeScreenProps) {
  const progressPercentage = (1 / message.metadata.totalModules) * 100;

  return (
    <div className="welcome-container mx-auto max-w-3xl p-6 md:p-8">
      {/* Header */}
      <h1 className="mb-4 text-2xl font-bold md:text-3xl">
        {message.content.greeting}
      </h1>

      {/* Overview */}
      <div className="mb-6 rounded-lg bg-blue-50 p-4 md:p-6 dark:bg-blue-950/30">
        <p className="whitespace-pre-line text-base leading-relaxed md:text-lg">
          {message.content.workshopOverview}
        </p>
      </div>

      {/* Module Preview */}
      <div className="mb-6 border-l-4 border-blue-500 pl-4 md:pl-6">
        <h2 className="mb-2 text-xl font-semibold md:text-2xl">
          MODUL {message.content.modulePreview.number}: {message.content.modulePreview.title}
        </h2>
        <p className="mb-4 text-sm text-muted-foreground md:text-base">
          Dauer: {message.content.modulePreview.duration}
        </p>

        {/* Objectives */}
        <h3 className="mb-2 font-semibold">Das erreichen wir:</h3>
        <ul className="mb-4 space-y-1">
          {message.content.modulePreview.objectives.map((obj, idx) => (
            <li key={idx} className="flex items-start text-sm md:text-base">
              <span className="mr-2 text-green-500">✓</span>
              <span>{obj}</span>
            </li>
          ))}
        </ul>

        {/* Phases */}
        <h3 className="mb-2 font-semibold">Die Schritte im Detail:</h3>
        <div className="space-y-3">
          {message.content.modulePreview.phases.map((phase, idx) => (
            <div key={idx} className="flex">
              <div className="mr-3 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 font-bold text-blue-600 dark:bg-blue-900 dark:text-blue-300">
                {idx + 1}
              </div>
              <div>
                <h4 className="font-medium">{phase.name}</h4>
                <p className="text-sm text-muted-foreground">{phase.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Instructions */}
      <div className="mb-6 rounded-lg bg-muted/50 p-4 md:p-6">
        <h3 className="mb-3 font-semibold">So funktioniert's:</h3>
        <ol className="space-y-2">
          {message.content.instructions.map((instruction, idx) => (
            <li key={idx} className="flex items-start text-sm md:text-base">
              <span className="mr-2 font-bold text-blue-600">{idx + 1}.</span>
              <span>{instruction}</span>
            </li>
          ))}
        </ol>
      </div>

      {/* Progress Bar */}
      {message.metadata.showProgressBar && (
        <div className="mb-6">
          <div className="mb-2 flex justify-between text-sm text-muted-foreground">
            <span>Gesamtfortschritt</span>
            <span>Modul 1 von {message.metadata.totalModules}</span>
          </div>
          <Progress value={progressPercentage} className="h-3" />
          <p className="mt-1 text-right text-xs text-muted-foreground">
            Geschätzte Gesamtdauer: {message.metadata.estimatedDuration}
          </p>
        </div>
      )}

      {/* CTA */}
      <div className="rounded-lg border-2 border-green-200 bg-green-50 p-4 md:p-6 dark:border-green-800 dark:bg-green-950/30">
        <p className="mb-4 whitespace-pre-line text-base md:text-lg">
          {message.content.callToAction}
        </p>
        <button
          onClick={onStart}
          className="w-full rounded-lg bg-green-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-green-700"
        >
          Los geht's!
        </button>
      </div>
    </div>
  );
}
