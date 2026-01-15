'use client';

import { useState, useCallback, useRef } from 'react';
import { ChatClient, type StreamCallbacks } from '@/lib/streaming/chat-client';
import type { ChatRequest, ChatMessage, RateLimitInfo } from '@/types/chat';

/**
 * Hook state
 */
interface UseChatStreamState {
  messages: ChatMessage[];
  isStreaming: boolean;
  error: string | null;
  currentText: string;
  currentJSON: any | null;
  rateLimit: RateLimitInfo | null;
}

/**
 * Hook return type
 */
interface UseChatStreamReturn extends UseChatStreamState {
  sendMessage: (message: string, options?: Partial<Omit<ChatRequest, 'messages'>>) => Promise<void>;
  continueConversation: (options?: Partial<Omit<ChatRequest, 'messages'>>) => Promise<void>;
  reset: () => void;
  clearError: () => void;
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
    rateLimit: null,
  });
  
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
    
    setState(prev => ({
      ...prev,
      messages: [...prev.messages, userMessage],
      isStreaming: true,
      error: null,
      currentText: '',
      currentJSON: null,
    }));
    
    // Prepare request
    const request: ChatRequest = {
      messages: [...state.messages, userMessage],
      ...defaultOptions,
      ...options,
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
        setState(prev => ({
          ...prev,
          currentJSON: data.json,
        }));
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
  }, [state.messages, defaultOptions]);
  
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
    };
    
    const callbacks: StreamCallbacks = {
      onText: (data) => {
        setState(prev => ({
          ...prev,
          currentText: data.fullText,
        }));
      },
      
      onJSON: (data) => {
        setState(prev => ({
          ...prev,
          currentJSON: data.json,
        }));
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
    
    await clientRef.current.stream(request, callbacks);
  }, [state.messages, defaultOptions]);
  
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
      rateLimit: null,
    });
  }, []);
  
  /**
   * Clear error
   */
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);
  
  return {
    ...state,
    sendMessage,
    continueConversation,
    reset,
    clearError,
  };
}
