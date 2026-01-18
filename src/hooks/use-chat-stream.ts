'use client';

import { useState, useCallback, useRef } from 'react';
import { ChatClient, type StreamCallbacks } from '@/lib/streaming/chat-client';
import { mergePartialJSON } from '@/lib/streaming/parser';
import type { ChatRequest, ChatMessage, RateLimitInfo } from '@/types/chat';
import type { IntakePhase, PartialIntakeOutput } from '@/types/modules/intake';
import type { GeschaeftsmodellPhase, PartialGeschaeftsmodellOutput } from '@/types/modules/geschaeftsmodell';
import {
  detectRedFlags,
  type RedFlag,
} from '@/lib/services/red-flag-detector';

/**
 * Phase order for intake module
 */
const INTAKE_PHASE_ORDER: IntakePhase[] = [
  'warmup',
  'founder_profile',
  'personality',
  'profile_gen',
  'resources',
  'business_type',
  'validation',
  'completed',
];

/**
 * Map incorrect phase names to valid IntakePhase values
 * Claude sometimes outputs semantic names instead of exact values
 */
const PHASE_NAME_NORMALIZATION: Record<string, IntakePhase> = {
  // Warmup variations
  'intro': 'warmup',
  'start': 'warmup',
  'beginning': 'warmup',
  'idea': 'warmup',
  'business_idea': 'warmup',

  // Founder profile variations
  'background': 'founder_profile',
  'profile': 'founder_profile',
  'founder': 'founder_profile',
  'status': 'founder_profile',
  'alg': 'founder_profile',
  'alg_status': 'founder_profile',

  // Personality variations
  'traits': 'personality',
  'assessment': 'personality',
  'character': 'personality',
  'personality_assessment': 'personality',

  // Profile gen variations
  'generation': 'profile_gen',
  'summary': 'profile_gen',
  'synthesis': 'profile_gen',
  'profile_summary': 'profile_gen',

  // Resources variations
  'assets': 'resources',
  'capital': 'resources',
  'finances': 'resources',
  'financial': 'resources',

  // Business type variations
  'type': 'business_type',
  'category': 'business_type',
  'classification': 'business_type',

  // Validation variations
  'check': 'validation',
  'verify': 'validation',
  'eligibility': 'validation',
  'final': 'validation',

  // Completed variations
  'done': 'completed',
  'finished': 'completed',
  'complete': 'completed',

  // INVALID phases (map to current expected phase for safety)
  'market_analysis': 'warmup', // This is NOT an intake phase
  'markt': 'warmup',
  'marketing': 'warmup',
};

/**
 * Phase order for geschaeftsmodell module (Module 02)
 */
const GESCHAEFTSMODELL_PHASE_ORDER: GeschaeftsmodellPhase[] = [
  'angebot',
  'zielgruppe',
  'wertversprechen',
  'usp',
  'completed',
];

/**
 * Map incorrect phase names to valid GeschaeftsmodellPhase values
 */
const GESCHAEFTSMODELL_PHASE_NORMALIZATION: Record<string, GeschaeftsmodellPhase> = {
  // Angebot variations
  'offering': 'angebot',
  'product': 'angebot',
  'service': 'angebot',
  'leistung': 'angebot',

  // Zielgruppe variations
  'target': 'zielgruppe',
  'audience': 'zielgruppe',
  'persona': 'zielgruppe',
  'customer': 'zielgruppe',
  'kunde': 'zielgruppe',
  'target_audience': 'zielgruppe',

  // Wertversprechen variations
  'value': 'wertversprechen',
  'value_proposition': 'wertversprechen',
  'nutzen': 'wertversprechen',
  'benefit': 'wertversprechen',

  // USP variations
  'alleinstellung': 'usp',
  'differentiation': 'usp',
  'unique': 'usp',
  'competition': 'usp',
  'wettbewerb': 'usp',

  // Completed variations
  'done': 'completed',
  'finished': 'completed',
  'complete': 'completed',
  'fertig': 'completed',
  'abgeschlossen': 'completed',
};

/**
 * Normalize a geschaeftsmodell phase name
 */
function normalizeGeschaeftsmodellPhase(
  phase: string | undefined,
  currentPhase: GeschaeftsmodellPhase
): GeschaeftsmodellPhase {
  if (!phase) return currentPhase;

  // Already a valid phase
  if (GESCHAEFTSMODELL_PHASE_ORDER.includes(phase as GeschaeftsmodellPhase)) {
    return phase as GeschaeftsmodellPhase;
  }

  // Try normalization map
  const normalized = GESCHAEFTSMODELL_PHASE_NORMALIZATION[phase.toLowerCase()];
  if (normalized) {
    console.warn(`[useChatStream] Normalized geschaeftsmodell phase "${phase}" to "${normalized}"`);
    return normalized;
  }

  // Unknown phase - log and keep current
  console.warn(`[useChatStream] Unknown geschaeftsmodell phase "${phase}", keeping current: ${currentPhase}`);
  return currentPhase;
}

/**
 * Normalize a phase name from Claude's output to a valid IntakePhase
 */
function normalizePhase(phase: string | undefined, currentPhase: IntakePhase): IntakePhase {
  if (!phase) return currentPhase;

  // Already a valid phase
  if (INTAKE_PHASE_ORDER.includes(phase as IntakePhase)) {
    return phase as IntakePhase;
  }

  // Try normalization map
  const normalized = PHASE_NAME_NORMALIZATION[phase.toLowerCase()];
  if (normalized) {
    console.warn(`[useChatStream] Normalized phase "${phase}" to "${normalized}"`);
    return normalized;
  }

  // Unknown phase - log and keep current
  console.warn(`[useChatStream] Unknown phase "${phase}", keeping current: ${currentPhase}`);
  return currentPhase;
}

/**
 * Check if a phase transition is valid
 * Prevents skipping required phases (e.g., business_type before validation)
 */
function isValidPhaseTransition(
  fromPhase: IntakePhase,
  toPhase: IntakePhase,
  moduleData: PartialIntakeOutput | null
): { valid: boolean; reason?: string } {
  const fromIndex = INTAKE_PHASE_ORDER.indexOf(fromPhase);
  const toIndex = INTAKE_PHASE_ORDER.indexOf(toPhase);

  // Backwards is always allowed (re-visiting previous phases)
  if (toIndex <= fromIndex) {
    return { valid: true };
  }

  // Forward jumps of more than 1 phase require validation
  if (toIndex - fromIndex > 1) {
    // Check if trying to skip business_type before validation
    if (toPhase === 'validation' && !moduleData?.businessType?.category) {
      console.warn(`[useChatStream] Invalid phase transition: Cannot skip to validation without business_type`);
      return {
        valid: false,
        reason: 'Business type classification required before validation'
      };
    }

    // Check if trying to skip personality assessment
    if (toIndex > INTAKE_PHASE_ORDER.indexOf('personality')) {
      const personalityComplete = moduleData?.personality &&
        moduleData.personality.innovativeness &&
        moduleData.personality.riskTaking &&
        moduleData.personality.achievement &&
        moduleData.personality.proactiveness &&
        moduleData.personality.locusOfControl &&
        moduleData.personality.selfEfficacy &&
        moduleData.personality.autonomy;

      if (!personalityComplete && fromIndex < INTAKE_PHASE_ORDER.indexOf('profile_gen')) {
        console.warn(`[useChatStream] Invalid phase transition: Incomplete personality assessment`);
        return {
          valid: false,
          reason: 'All 7 personality dimensions must be assessed'
        };
      }
    }
  }

  return { valid: true };
}

/**
 * Union type for module data
 */
type ModuleData = PartialIntakeOutput | PartialGeschaeftsmodellOutput | null;

/**
 * Hook state
 */
interface UseChatStreamState {
  messages: ChatMessage[];
  isStreaming: boolean;
  error: string | null;
  currentText: string;
  currentJSON: unknown | null;
  moduleData: ModuleData; // Accumulated module data (merged from JSON blocks)
  rateLimit: RateLimitInfo | null;
  // Phase-locked intake support
  currentIntakePhase: IntakePhase;
  phaseComplete: boolean;
  // Geschaeftsmodell phase support
  currentGeschaeftsmodellPhase: GeschaeftsmodellPhase;
  // Red flag detection
  detectedRedFlags: RedFlag[];
}

/**
 * Initial state for restoring from persistence
 */
interface InitialChatState {
  messages?: ChatMessage[];
  moduleData?: ModuleData;
  currentIntakePhase?: IntakePhase;
  currentGeschaeftsmodellPhase?: GeschaeftsmodellPhase;
}

/**
 * Hook return type
 */
interface UseChatStreamReturn extends UseChatStreamState {
  sendMessage: (message: string, options?: Partial<Omit<ChatRequest, 'messages'>>) => Promise<void>;
  continueConversation: (options?: Partial<Omit<ChatRequest, 'messages'>>) => Promise<void>;
  reset: () => void;
  clearError: () => void;
  updateModuleData: (data: ModuleData) => void;
  clearModuleData: () => void;
  // Phase management (intake)
  setIntakePhase: (phase: IntakePhase) => void;
  advanceToNextPhase: () => void;
  canAdvancePhase: boolean;
  getNextPhase: () => IntakePhase | null;
  // Phase management (geschaeftsmodell)
  setGeschaeftsmodellPhase: (phase: GeschaeftsmodellPhase) => void;
  getNextGeschaeftsmodellPhase: () => GeschaeftsmodellPhase | null;
  // State restoration
  restoreState: (state: InitialChatState) => void;
}

/**
 * React hook for chat streaming
 * 
 * @example
 * ```tsx
 * const { messages, isStreaming, sendMessage, currentJSON } = useChatStream({
 *   workshopId: '123',
 *   currentModule: 'gz-intake'
 * });
 * 
 * // Send a message
 * await sendMessage('Tell me about the intake process');
 * 
 * // Access streaming JSON
 * console.log(currentJSON);
 * ```
 */
export function useChatStream(
  defaultOptions?: Partial<Omit<ChatRequest, 'messages'>>
): UseChatStreamReturn {
  const clientRef = useRef<ChatClient>(new ChatClient());

  const [state, setState] = useState<UseChatStreamState>({
    messages: [],
    isStreaming: false,
    error: null,
    currentText: '',
    currentJSON: null,
    moduleData: null,
    rateLimit: null,
    currentIntakePhase: 'warmup',
    phaseComplete: false,
    currentGeschaeftsmodellPhase: 'angebot',
    detectedRedFlags: [],
  });

  /**
   * Get the next phase in sequence
   */
  const getNextPhase = useCallback((): IntakePhase | null => {
    const currentIndex = INTAKE_PHASE_ORDER.indexOf(state.currentIntakePhase);
    if (currentIndex === -1 || currentIndex >= INTAKE_PHASE_ORDER.length - 1) {
      return null;
    }
    const nextPhase = INTAKE_PHASE_ORDER[currentIndex + 1];
    return nextPhase ?? null;
  }, [state.currentIntakePhase]);

  /**
   * Check if we can advance to the next phase
   */
  const canAdvancePhase = state.phaseComplete && getNextPhase() !== null;

  /**
   * Set intake phase manually
   */
  const setIntakePhase = useCallback((phase: IntakePhase) => {
    setState(prev => ({
      ...prev,
      currentIntakePhase: phase,
      phaseComplete: false,
    }));
  }, []);

  /**
   * Advance to the next phase
   */
  const advanceToNextPhase = useCallback(() => {
    const nextPhase = getNextPhase();
    if (nextPhase) {
      setState(prev => ({
        ...prev,
        currentIntakePhase: nextPhase,
        phaseComplete: false,
      }));
    }
  }, [getNextPhase]);

  /**
   * Get the next geschaeftsmodell phase in sequence
   */
  const getNextGeschaeftsmodellPhase = useCallback((): GeschaeftsmodellPhase | null => {
    const currentIndex = GESCHAEFTSMODELL_PHASE_ORDER.indexOf(state.currentGeschaeftsmodellPhase);
    if (currentIndex === -1 || currentIndex >= GESCHAEFTSMODELL_PHASE_ORDER.length - 1) {
      return null;
    }
    const nextPhase = GESCHAEFTSMODELL_PHASE_ORDER[currentIndex + 1];
    return nextPhase ?? null;
  }, [state.currentGeschaeftsmodellPhase]);

  /**
   * Set geschaeftsmodell phase manually
   */
  const setGeschaeftsmodellPhase = useCallback((phase: GeschaeftsmodellPhase) => {
    setState(prev => ({
      ...prev,
      currentGeschaeftsmodellPhase: phase,
      phaseComplete: false,
    }));
  }, []);

  /**
   * Send a new message
   */
  const sendMessage = useCallback(async (
    message: string,
    options?: Partial<Omit<ChatRequest, 'messages'>>
  ) => {
    // Add user message
    const userMessage: ChatMessage = {
      role: 'user',
      content: message,
      timestamp: Date.now(),
    };

    // Detect red flags in user message
    const newRedFlags = detectRedFlags(message);

    setState(prev => {
      // Merge new red flags with existing, deduplicated by type
      const allFlags = [...prev.detectedRedFlags, ...newRedFlags];
      const flagMap = new Map<string, RedFlag>();
      for (const flag of allFlags) {
        const existing = flagMap.get(flag.type);
        if (!existing || flag.detectedAt > existing.detectedAt) {
          flagMap.set(flag.type, flag);
        }
      }
      const deduplicatedFlags = Array.from(flagMap.values());

      return {
        ...prev,
        messages: [...prev.messages, userMessage],
        isStreaming: true,
        error: null,
        currentText: '',
        currentJSON: null,
        detectedRedFlags: deduplicatedFlags,
      };
    });

    // Prepare request with phase-locked intake support
    const request: ChatRequest = {
      messages: [...state.messages, userMessage],
      ...defaultOptions,
      ...options,
      // Include intake phase info for phase-locked prompts
      intakePhase: state.currentIntakePhase,
      previousPhaseData: state.moduleData || undefined,
    };

    // Setup callbacks
    const callbacks: StreamCallbacks = {
      onText: (data) => {
        setState(prev => ({
          ...prev,
          currentText: data.fullText,
        }));
      },

      onJSON: (data) => {
        setState(prev => {
          const mergedData = data.json ? mergePartialJSON(prev.moduleData, data.json) : prev.moduleData;

          // Check for phase completion from JSON metadata
          const metadata = (data.json as Record<string, unknown>)?.metadata as { phaseComplete?: boolean; currentPhase?: string } | undefined;
          const isPhaseComplete = metadata?.phaseComplete === true;

          // Detect which module type this JSON is for based on structure
          const jsonData = data.json as Record<string, unknown> | null;
          const isGeschaeftsmodellData = jsonData && (
            'offering' in jsonData ||
            'targetAudience' in jsonData ||
            'valueProposition' in jsonData ||
            'usp' in jsonData ||
            'competitiveAnalysis' in jsonData
          );

          // Handle geschaeftsmodell phases (no strict validation, just normalize)
          if (isGeschaeftsmodellData) {
            const detectedGeschaeftsmodellPhase = normalizeGeschaeftsmodellPhase(
              metadata?.currentPhase,
              prev.currentGeschaeftsmodellPhase
            );

            return {
              ...prev,
              currentJSON: data.json,
              moduleData: mergedData as PartialGeschaeftsmodellOutput | null,
              phaseComplete: isPhaseComplete,
              currentGeschaeftsmodellPhase: detectedGeschaeftsmodellPhase,
            };
          }

          // Handle intake phases (with strict validation)
          const detectedPhase = normalizePhase(metadata?.currentPhase, prev.currentIntakePhase);

          // Validate phase transition
          const transitionCheck = isValidPhaseTransition(
            prev.currentIntakePhase,
            detectedPhase,
            mergedData as PartialIntakeOutput | null
          );

          // If invalid transition, keep current phase but log warning
          const finalPhase = transitionCheck.valid
            ? detectedPhase
            : prev.currentIntakePhase;

          if (!transitionCheck.valid) {
            console.warn(
              `[useChatStream] Blocked invalid phase transition: ${prev.currentIntakePhase} → ${detectedPhase}. ` +
              `Reason: ${transitionCheck.reason}`
            );
          }

          return {
            ...prev,
            currentJSON: data.json,
            moduleData: mergedData as PartialIntakeOutput | null,
            phaseComplete: transitionCheck.valid ? isPhaseComplete : false,
            currentIntakePhase: finalPhase,
          };
        });
      },

      onDone: (data) => {
        const assistantMessage: ChatMessage = {
          role: 'assistant',
          content: data.fullText,
          timestamp: Date.now(),
        };

        setState(prev => ({
          ...prev,
          messages: [...prev.messages, assistantMessage],
          isStreaming: false,
          currentText: '',
          // Keep moduleData and phase state
        }));
      },

      onError: (error) => {
        setState(prev => ({
          ...prev,
          error,
          isStreaming: false,
        }));
      },

      onRateLimit: (info) => {
        setState(prev => ({
          ...prev,
          rateLimit: info,
        }));
      },
    };

    // Stream the response
    await clientRef.current.stream(request, callbacks);
  }, [state.messages, state.currentIntakePhase, state.currentGeschaeftsmodellPhase, state.moduleData, defaultOptions]);

  /**
   * Continue conversation with existing messages
   */
  const continueConversation = useCallback(async (
    options?: Partial<Omit<ChatRequest, 'messages'>>
  ) => {
    if (state.messages.length === 0) {
      setState(prev => ({ ...prev, error: 'No messages to continue' }));
      return;
    }

    setState(prev => ({
      ...prev,
      isStreaming: true,
      error: null,
      currentText: '',
      currentJSON: null,
    }));

    const request: ChatRequest = {
      messages: state.messages,
      ...defaultOptions,
      ...options,
      // Include intake phase info for phase-locked prompts
      intakePhase: state.currentIntakePhase,
      previousPhaseData: state.moduleData || undefined,
    };

    const continueCallbacks: StreamCallbacks = {
      onText: (data) => {
        setState(prev => ({
          ...prev,
          currentText: data.fullText,
        }));
      },

      onJSON: (data) => {
        setState(prev => {
          const mergedData = data.json ? mergePartialJSON(prev.moduleData, data.json) : prev.moduleData;

          // Check for phase completion from JSON metadata
          const metadata = (data.json as Record<string, unknown>)?.metadata as { phaseComplete?: boolean; currentPhase?: string } | undefined;
          const isPhaseComplete = metadata?.phaseComplete === true;

          // Detect which module type this JSON is for based on structure
          const jsonData = data.json as Record<string, unknown> | null;
          const isGeschaeftsmodellData = jsonData && (
            'offering' in jsonData ||
            'targetAudience' in jsonData ||
            'valueProposition' in jsonData ||
            'usp' in jsonData ||
            'competitiveAnalysis' in jsonData
          );

          // Handle geschaeftsmodell phases (no strict validation, just normalize)
          if (isGeschaeftsmodellData) {
            const detectedGeschaeftsmodellPhase = normalizeGeschaeftsmodellPhase(
              metadata?.currentPhase,
              prev.currentGeschaeftsmodellPhase
            );

            return {
              ...prev,
              currentJSON: data.json,
              moduleData: mergedData as PartialGeschaeftsmodellOutput | null,
              phaseComplete: isPhaseComplete,
              currentGeschaeftsmodellPhase: detectedGeschaeftsmodellPhase,
            };
          }

          // Handle intake phases (with strict validation)
          const detectedPhase = normalizePhase(metadata?.currentPhase, prev.currentIntakePhase);

          // Validate phase transition
          const transitionCheck = isValidPhaseTransition(
            prev.currentIntakePhase,
            detectedPhase,
            mergedData as PartialIntakeOutput | null
          );

          // If invalid transition, keep current phase but log warning
          const finalPhase = transitionCheck.valid
            ? detectedPhase
            : prev.currentIntakePhase;

          if (!transitionCheck.valid) {
            console.warn(
              `[useChatStream] Blocked invalid phase transition: ${prev.currentIntakePhase} → ${detectedPhase}. ` +
              `Reason: ${transitionCheck.reason}`
            );
          }

          return {
            ...prev,
            currentJSON: data.json,
            moduleData: mergedData as PartialIntakeOutput | null,
            phaseComplete: transitionCheck.valid ? isPhaseComplete : false,
            currentIntakePhase: finalPhase,
          };
        });
      },

      onDone: (data) => {
        const assistantMessage: ChatMessage = {
          role: 'assistant',
          content: data.fullText,
          timestamp: Date.now(),
        };

        setState(prev => ({
          ...prev,
          messages: [...prev.messages, assistantMessage],
          isStreaming: false,
          currentText: '',
          // Keep moduleData and phase state
        }));
      },

      onError: (error) => {
        setState(prev => ({
          ...prev,
          error,
          isStreaming: false,
        }));
      },

      onRateLimit: (info) => {
        setState(prev => ({
          ...prev,
          rateLimit: info,
        }));
      },
    };

    await clientRef.current.stream(request, continueCallbacks);
  }, [state.messages, state.currentIntakePhase, state.currentGeschaeftsmodellPhase, state.moduleData, defaultOptions]);

  /**
   * Reset conversation
   */
  const reset = useCallback(() => {
    setState({
      messages: [],
      isStreaming: false,
      error: null,
      currentText: '',
      currentJSON: null,
      moduleData: null,
      rateLimit: null,
      currentIntakePhase: 'warmup',
      phaseComplete: false,
      currentGeschaeftsmodellPhase: 'angebot',
      detectedRedFlags: [],
    });
  }, []);

  /**
   * Clear error
   */
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  /**
   * Update module data manually (for loading existing data)
   */
  const updateModuleData = useCallback((data: any) => {
    setState(prev => ({
      ...prev,
      moduleData: mergePartialJSON(prev.moduleData, data),
    }));
  }, []);

  /**
   * Clear module data
   */
  const clearModuleData = useCallback(() => {
    setState(prev => ({ ...prev, moduleData: null }));
  }, []);

  /**
   * Restore state from persistence (messages, moduleData, phases)
   */
  const restoreState = useCallback((initialState: InitialChatState) => {
    setState(prev => ({
      ...prev,
      messages: initialState.messages || prev.messages,
      moduleData: initialState.moduleData ?? prev.moduleData,
      currentIntakePhase: initialState.currentIntakePhase || prev.currentIntakePhase,
      currentGeschaeftsmodellPhase: initialState.currentGeschaeftsmodellPhase || prev.currentGeschaeftsmodellPhase,
    }));
  }, []);

  return {
    ...state,
    sendMessage,
    continueConversation,
    reset,
    clearError,
    updateModuleData,
    clearModuleData,
    // Phase management (intake)
    setIntakePhase,
    advanceToNextPhase,
    canAdvancePhase,
    getNextPhase,
    // Phase management (geschaeftsmodell)
    setGeschaeftsmodellPhase,
    getNextGeschaeftsmodellPhase,
    // State restoration
    restoreState,
  };
}
