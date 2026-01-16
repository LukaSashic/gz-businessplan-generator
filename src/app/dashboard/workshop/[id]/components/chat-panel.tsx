'use client';

import { useEffect, useRef } from 'react';
import { useAtomValue } from 'jotai';
import { currentModuleAtom } from '@/lib/state/workshop-atoms';
import { useChatStream } from '@/hooks/use-chat-stream';
import MessageList from './message-list';
import MessageInput from './message-input';

interface ChatPanelProps {
  workshopId: string;
  onDataUpdate?: (moduleKey: string, data: Record<string, any>) => void;
}

export default function ChatPanel({ workshopId, onDataUpdate }: ChatPanelProps) {
  const currentModule = useAtomValue(currentModuleAtom);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { messages, isStreaming, error, currentText, sendMessage, clearError } =
    useChatStream({
      workshopId,
      currentModule: currentModule || 'gz-intake',
      onComplete: (message) => {
        // Try to extract structured data from the response
        // This will be enhanced in Phase 6 with proper JSON extraction
        if (onDataUpdate && message.role === 'assistant') {
          try {
            // For now, save the raw message content
            // Phase 6 will implement proper structured data extraction
            onDataUpdate(currentModule || 'gz-intake', {
              lastMessage: message.content,
              timestamp: new Date().toISOString(),
            });
          } catch (err) {
            console.log('Could not extract structured data:', err);
          }
        }
      },
    });

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, currentText]);

  const handleSendMessage = async (content: string) => {
    try {
      await sendMessage(content);
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  return (
    <div className="flex h-full flex-col bg-background">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        {messages.length === 0 && !isStreaming && (
          <div className="flex h-full items-center justify-center text-center">
            <div className="max-w-md space-y-2">
              <h3 className="text-lg font-semibold text-muted-foreground">
                Willkommen zum Workshop
              </h3>
              <p className="text-sm text-muted-foreground">
                Beginnen Sie das Gespräch, um Ihren Businessplan zu erstellen.
                Claude wird Sie durch jeden Schritt begleiten.
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
