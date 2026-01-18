'use client';

import { useState } from 'react';
import type {
  PersonalityScenario as PersonalityScenarioType
} from '@/lib/workshop/personality-assessment';

interface PersonalityScenarioProps {
  scenario: PersonalityScenarioType;
  onAnswer: (optionId: string, followUpAnswer?: string) => void;
}

export default function PersonalityScenario({
  scenario,
  onAnswer
}: PersonalityScenarioProps) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [followUpAnswer, setFollowUpAnswer] = useState('');
  const [showFollowUp, setShowFollowUp] = useState(false);

  const handleSelect = (optionId: string) => {
    setSelectedOption(optionId);
    const option = scenario.options.find((o) => o.id === optionId);

    if (option?.followUp) {
      setShowFollowUp(true);
    } else {
      onAnswer(optionId);
    }
  };

  const handleSubmitFollowUp = () => {
    if (selectedOption) {
      onAnswer(selectedOption, followUpAnswer);
    }
  };

  const selectedOptionData = scenario.options.find((o) => o.id === selectedOption);

  return (
    <div className="personality-scenario mx-auto max-w-3xl p-4 md:p-6">
      {/* Context */}
      <div className="mb-6 rounded-lg border-l-4 border-blue-500 bg-blue-50 p-4 dark:bg-blue-950/30">
        <p className="mb-1 text-sm text-muted-foreground">
          Kontext: Deine Geschäftsidee
        </p>
        <p className="text-sm italic">{scenario.context}</p>
      </div>

      {/* Question */}
      <div className="mb-6">
        <h2 className="mb-2 text-lg font-semibold md:text-xl">Szenario:</h2>
        <p className="text-base leading-relaxed md:text-lg">{scenario.question}</p>
      </div>

      {/* Options */}
      {!showFollowUp && (
        <div className="mb-6 space-y-4">
          {scenario.options.map((option) => (
            <button
              key={option.id}
              onClick={() => handleSelect(option.id)}
              className={`w-full rounded-lg border-2 p-4 text-left transition-all md:p-6 ${
                selectedOption === option.id
                  ? 'border-blue-500 bg-blue-50 shadow-md dark:bg-blue-950/30'
                  : 'border-muted hover:border-blue-300 hover:shadow'
              }`}
            >
              <div className="flex items-start">
                <div
                  className={`mr-3 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-lg font-bold md:mr-4 ${
                    selectedOption === option.id
                      ? 'bg-blue-500 text-white'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {option.id}
                </div>
                <div className="flex-1">
                  <h3 className="mb-2 text-base font-semibold md:text-lg">
                    {option.label}
                  </h3>
                  <p className="text-sm text-muted-foreground md:text-base">
                    {option.description}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Follow-up Question */}
      {showFollowUp && selectedOption && selectedOptionData?.followUp && (
        <div className="mb-6 rounded-lg border-2 border-yellow-300 bg-yellow-50 p-4 md:p-6 dark:border-yellow-700 dark:bg-yellow-950/30">
          <h3 className="mb-3 font-semibold">{selectedOptionData.followUp}</h3>
          <textarea
            value={followUpAnswer}
            onChange={(e) => setFollowUpAnswer(e.target.value)}
            className="w-full resize-none rounded-lg border-2 border-muted bg-background p-3"
            rows={3}
            placeholder="Deine Gedanken dazu..."
          />
          <button
            onClick={handleSubmitFollowUp}
            disabled={!followUpAnswer.trim()}
            className="mt-3 rounded-lg bg-blue-600 px-6 py-2 text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Weiter →
          </button>
        </div>
      )}

      {/* Helper Text */}
      <p className="text-center text-sm text-muted-foreground">
        Es gibt keine &quot;richtige&quot; Antwort - wähle, was am besten zu dir passt
      </p>
    </div>
  );
}
