'use client';

import { ChatMessage } from '@/types/chat';
import { cn } from '@/lib/utils';
import { User, Bot, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MessageListProps {
  messages: ChatMessage[];
  currentText: string;
  isStreaming: boolean;
}

export default function MessageList({
  messages,
  currentText,
  isStreaming,
}: MessageListProps) {
  return (
    <div className="space-y-4">
      {messages.map((message, index) => (
        <MessageBubble key={message.id || index} message={message} />
      ))}

      {/* Streaming message */}
      {isStreaming && currentText && (
        <MessageBubble
          message={{
            id: 'streaming',
            role: 'assistant',
            content: currentText,
            timestamp: new Date(),
          }}
          isStreaming
        />
      )}

      {/* Loading indicator */}
      {isStreaming && !currentText && (
        <div className="flex items-start gap-3">
          <div className="flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Bot className="h-4 w-4" />
          </div>
          <div className="flex items-center gap-2 rounded-lg bg-muted px-4 py-3">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm text-muted-foreground">
              Claude schreibt...
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

interface MessageBubbleProps {
  message: ChatMessage;
  isStreaming?: boolean;
}

function MessageBubble({ message, isStreaming = false }: MessageBubbleProps) {
  const isUser = message.role === 'user';

  return (
    <div className={cn('flex items-start gap-3', isUser && 'flex-row-reverse')}>
      {/* Avatar */}
      <div
        className={cn(
          'flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-md',
          isUser
            ? 'bg-secondary text-secondary-foreground'
            : 'bg-primary text-primary-foreground'
        )}
      >
        {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
      </div>

      {/* Message Content */}
      <div
        className={cn(
          'flex-1 overflow-hidden rounded-lg px-4 py-3',
          isUser ? 'bg-secondary text-secondary-foreground' : 'bg-muted',
          isStreaming && 'animate-pulse'
        )}
      >
        {isUser ? (
          <p className="whitespace-pre-wrap text-sm">{message.content}</p>
        ) : (
          <div className="prose prose-sm max-w-none dark:prose-invert">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                h1: ({ node, ...props }) => (
                  <h1
                    className="mb-2 mt-4 text-xl font-bold first:mt-0"
                    {...props}
                  />
                ),
                h2: ({ node, ...props }) => (
                  <h2
                    className="mb-2 mt-3 text-lg font-semibold first:mt-0"
                    {...props}
                  />
                ),
                h3: ({ node, ...props }) => (
                  <h3
                    className="mb-1 mt-2 text-base font-semibold first:mt-0"
                    {...props}
                  />
                ),
                p: ({ node, ...props }) => (
                  <p className="mb-2 last:mb-0" {...props} />
                ),
                ul: ({ node, ...props }) => (
                  <ul className="mb-2 list-disc space-y-1 pl-6" {...props} />
                ),
                ol: ({ node, ...props }) => (
                  <ol className="mb-2 list-decimal space-y-1 pl-6" {...props} />
                ),
                li: ({ node, ...props }) => (
                  <li className="text-sm" {...props} />
                ),
                code: ({ node, inline, ...props }: any) =>
                  inline ? (
                    <code
                      className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs"
                      {...props}
                    />
                  ) : (
                    <code
                      className="block overflow-x-auto rounded bg-muted p-3 font-mono text-xs"
                      {...props}
                    />
                  ),
                strong: ({ node, ...props }) => (
                  <strong className="font-semibold" {...props} />
                ),
              }}
            >
              {message.content}
            </ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
}
