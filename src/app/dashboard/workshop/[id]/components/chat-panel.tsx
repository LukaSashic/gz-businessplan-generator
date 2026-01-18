'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useAtomValue, useSetAtom } from 'jotai';
import {
  currentModuleAtom,
  streamingDataFamily,
} from '@/lib/state/workshop-atoms';
import { useChatStream } from '@/hooks/use-chat-stream';
import { persistence } from '@/lib/state/persistence';
import MessageList from './message-list';
import MessageInput from './message-input';
import WelcomeScreen from './welcome-screen';
import ModuleTransition from './module-transition';
import { Badge } from '@/components/ui/badge';
import { IntakePhaseInfo } from '@/types/modules/intake';
import { generateWelcomeMessage } from '@/lib/workshop/welcome';
import { generateModuleTransition, shouldShowTransition } from '@/lib/workshop/transitions';
import type { GZModule } from '@/lib/prompts/prompt-loader';
import type { IntakePhase, PartialIntakeOutput } from '@/types/modules/intake';

interface ChatPanelProps {
  workshopId: string;
  onDataUpdate?: (moduleKey: string, data: Record<string, unknown>) => void;
}

type ViewState = 'welcome' | 'chat' | 'transition';

/**
 * Phase indicator component for intake module
 */
function PhaseIndicator({
  currentPhase,
  phaseComplete,
  canAdvance,
  onAdvance,
}: {
  currentPhase: IntakePhase;
  phaseComplete: boolean;
  canAdvance: boolean;
  onAdvance: () => void;
}) {
  const phaseInfo = IntakePhaseInfo[currentPhase];
  const isIntakeModule = currentPhase !== 'completed';

  if (!isIntakeModule) return null;

  return (
    <div className="flex items-center justify-between border-b border-border bg-muted/50 px-4 py-2">
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground">Phase:</span>
        <Badge variant={phaseComplete ? 'success' : 'secondary'} className="text-xs">
          {phaseInfo?.label || currentPhase}
        </Badge>
        {phaseComplete && (
          <span className="text-xs text-green-600">Abgeschlossen</span>
        )}
      </div>
      {canAdvance && (
        <button
          onClick={onAdvance}
          className="text-xs font-medium text-primary hover:underline"
        >
          Weiter zur nächsten Phase
        </button>
      )}
    </div>
  );
}

export default function ChatPanel({ workshopId, onDataUpdate }: ChatPanelProps) {
  const currentModule = useAtomValue(currentModuleAtom);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const setStreamingData = useSetAtom(streamingDataFamily(workshopId));

  // View state: welcome, chat, or transition
  const [viewState, setViewState] = useState<ViewState>('welcome');
  const [hasSeenWelcome, setHasSeenWelcome] = useState(false);

  const {
    messages,
    isStreaming,
    error,
    currentText,
    moduleData,
    sendMessage,
    clearError,
    // Phase management from hook
    currentIntakePhase,
    phaseComplete,
    advanceToNextPhase,
    canAdvancePhase,
    // Red flag detection
    detectedRedFlags,
    // State restoration
    restoreState,
  } = useChatStream({
    workshopId,
    currentModule: (currentModule || 'gz-intake') as GZModule,
  });

  // Track if we've loaded saved state
  const hasLoadedRef = useRef(false);

  // Load saved messages and state on mount
  useEffect(() => {
    if (hasLoadedRef.current || !workshopId) return;

    const loadSavedState = async () => {
      try {
        // Load messages
        const savedMessages = await persistence.loadChatMessages(workshopId);
        // Load module data
        const savedData = await persistence.loadWorkshopData(workshopId);

        if (savedMessages?.messages?.length || savedData?.data) {
          restoreState({
            messages: savedMessages?.messages || [],
            moduleData: savedData?.data?.[currentModule || 'gz-intake'] || null,
          });

          // If we have messages, mark welcome as seen
          if (savedMessages?.messages?.length) {
            setHasSeenWelcome(true);
            setViewState('chat');
          }
        }

        hasLoadedRef.current = true;
      } catch (err) {
        console.error('Failed to load saved chat state:', err);
        hasLoadedRef.current = true;
      }
    };

    loadSavedState();
  }, [workshopId, restoreState, currentModule]);

  // Save messages whenever they change (debounced)
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  useEffect(() => {
    if (!workshopId || !hasLoadedRef.current || messages.length === 0) return;

    // Debounce saves to avoid too many writes
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      persistence.saveChatMessages(workshopId, messages);
    }, 1000);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [workshopId, messages]);

  // Track if this is the initial mount - skip updates on mount
  const isInitialMountRef = useRef(true);
  const prevModuleDataRef = useRef<Record<string, unknown> | null>(null);
  const prevPhaseRef = useRef<IntakePhase>(currentIntakePhase);

  // Determine view state based on data
  useEffect(() => {
    // If there are messages, show chat view
    if (messages.length > 0) {
      setHasSeenWelcome(true);

      // Check if we should show transition screen
      if (shouldShowTransition(currentIntakePhase, moduleData as PartialIntakeOutput | null)) {
        setViewState('transition');
      } else {
        setViewState('chat');
      }
    } else if (!hasSeenWelcome) {
      // No messages and haven't seen welcome - show welcome
      setViewState('welcome');
    }
  }, [messages.length, currentIntakePhase, moduleData, hasSeenWelcome]);

  // Update streaming data atom when moduleData or phase changes (skip initial mount)
  useEffect(() => {
    // Skip the initial mount to avoid infinite loops
    if (isInitialMountRef.current) {
      isInitialMountRef.current = false;
      return;
    }

    // Only update if moduleData actually changed or phase changed
    const moduleDataChanged = moduleData !== prevModuleDataRef.current && moduleData !== null;
    const phaseChanged = currentIntakePhase !== prevPhaseRef.current;

    if (moduleDataChanged || phaseChanged) {
      prevModuleDataRef.current = moduleData;
      prevPhaseRef.current = currentIntakePhase;

      setStreamingData({
        moduleData: moduleData || {},
        currentPhase: currentIntakePhase,
        phaseComplete,
        lastUpdated: Date.now(),
        redFlags: detectedRedFlags,
      });

      // Also update via callback for persistence
      if (onDataUpdate && moduleData && moduleDataChanged) {
        onDataUpdate(currentModule || 'gz-intake', moduleData);
      }
    }
  }, [moduleData, currentIntakePhase, phaseComplete, setStreamingData, onDataUpdate, currentModule, detectedRedFlags]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, currentText]);

  // Handle welcome screen start
  const handleWelcomeStart = useCallback(() => {
    setHasSeenWelcome(true);
    setViewState('chat');
  }, []);

  // Handle transition continue
  const handleTransitionContinue = useCallback(() => {
    // TODO: Advance to next module
    setViewState('chat');
  }, []);

  // Handle transition pause
  const handleTransitionPause = useCallback(() => {
    // Stay on transition screen, user can close the workshop
    console.log('User paused workshop');
  }, []);

  const handleSendMessage = async (content: string) => {
    try {
      await sendMessage(content);
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  // Check if we're in intake module
  const isIntakeModule = currentModule === 'gz-intake' || currentModule === 'intake' || !currentModule;

  // Render welcome screen
  if (viewState === 'welcome' && !hasSeenWelcome) {
    const welcomeMessage = generateWelcomeMessage();
    return (
      <div className="flex h-full flex-col overflow-y-auto bg-background">
        <WelcomeScreen message={welcomeMessage} onStart={handleWelcomeStart} />
      </div>
    );
  }

  // Render transition screen
  if (viewState === 'transition') {
    const transition = generateModuleTransition(
      1, // fromModule
      2, // toModule
      moduleData as PartialIntakeOutput | null
    );
    return (
      <div className="flex h-full flex-col overflow-y-auto bg-background">
        <ModuleTransition
          transition={transition}
          onContinue={handleTransitionContinue}
          onPause={handleTransitionPause}
        />
      </div>
    );
  }

  // Render chat view
  return (
    <div className="flex h-full flex-col bg-background">
      {/* Phase Indicator (only for intake module) */}
      {isIntakeModule && (
        <PhaseIndicator
          currentPhase={currentIntakePhase}
          phaseComplete={phaseComplete}
          canAdvance={canAdvancePhase}
          onAdvance={advanceToNextPhase}
        />
      )}

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        {messages.length === 0 && !isStreaming && (
          <div className="flex h-full items-center justify-center text-center">
            <div className="max-w-md space-y-4">
              <h3 className="text-lg font-semibold text-foreground">
                Bereit zum Starten?
              </h3>
              <p className="text-sm text-muted-foreground">
                Erzähl mir von einem beruflichen Erfolg, auf den du stolz bist -
                ein Projekt, eine Herausforderung die du gemeistert hast, oder ein
                Ziel das du erreicht hast.
              </p>
              <p className="text-xs text-muted-foreground">
                Du kannst auch direkt deine Geschäftsidee beschreiben.
              </p>
            </div>
          </div>
        )}

        <MessageList
          messages={messages}
          currentText={currentText}
          isStreaming={isStreaming}
        />

        <div ref={messagesEndRef} />
      </div>

      {/* Error Display */}
      {error && (
        <div className="border-t border-destructive/20 bg-destructive/10 px-4 py-2">
          <div className="flex items-center justify-between">
            <p className="text-sm text-destructive">{error}</p>
            <button
              onClick={clearError}
              className="text-xs text-destructive hover:underline"
            >
              Schließen
            </button>
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="border-t border-border bg-card">
        <MessageInput
          onSend={handleSendMessage}
          disabled={isStreaming}
          placeholder={
            isStreaming ? 'Claude antwortet...' : 'Nachricht eingeben...'
          }
        />
      </div>
    </div>
  );
}
