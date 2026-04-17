'use client';

import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import type { UIMessage } from 'ai';
import { Car, MapPin, Plus, SendHorizonal, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

import { CarRecommendations } from '@/components/car-recommendations';
import { ReturningUserBanner } from '@/components/returning-user-banner';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import type { RecommendCarsInput } from '@/lib/cars';
import type { Message } from '@/lib/db';
import { cn } from '@/lib/utils';

interface ChatInterfaceProps {
  sessionId: string;
  previousIntent: string | null;
  initialMessages: Message[];
}

type TextPart = { type: 'text'; text: string };
type ToolRecommendPart = {
  type: 'tool-recommendCars';
  state: string;
  input: RecommendCarsInput;
};

const EXAMPLE_PROMPTS = [
  'I drive in Mumbai city traffic daily',
  'Looking for a family road trip car',
  'I want something fun to drive on weekends',
];

export function ChatInterface({
  sessionId,
  previousIntent,
  initialMessages,
}: ChatInterfaceProps) {
  const router = useRouter();
  const [showBanner, setShowBanner] = useState(previousIntent !== null);
  const [inputValue, setInputValue] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  function startNewChat() {
    router.push('/');
  }

  const { messages, sendMessage, status, setMessages } = useChat({
    transport: new DefaultChatTransport({
      api: '/api/chat',
      body: { sessionId },
    }),
    messages: initialMessages.map((m) => {
      if (m.role === 'assistant') {
        try {
          const parsed = JSON.parse(m.content) as {
            text?: string;
            toolCall?: RecommendCarsInput | null;
          };
          const parts: UIMessage['parts'] = [];
          if (parsed.text)
            parts.push({ type: 'text' as const, text: parsed.text });
          if (parsed.toolCall) {
            parts.push({
              type: 'tool-recommendCars' as const,
              toolCallId: `restored-${m.id}`,
              state: 'input-available' as const,
              input: parsed.toolCall,
            } as unknown as UIMessage['parts'][number]);
          }
          return { id: m.id.toString(), role: 'assistant' as const, parts };
        } catch {
          return {
            id: m.id.toString(),
            role: 'assistant' as const,
            parts: [{ type: 'text' as const, text: m.content }],
          };
        }
      }
      return {
        id: m.id.toString(),
        role: m.role as 'user' | 'assistant',
        parts: [{ type: 'text' as const, text: m.content }],
      };
    }),
  });

  const isActive = status === 'submitted' || status === 'streaming';

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  function autoResize(el: HTMLTextAreaElement) {
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 180)}px`;
  }

  function submitMessage() {
    if (!isActive && inputValue.trim()) {
      sendMessage({ text: inputValue });
      setInputValue('');
      if (textareaRef.current) textareaRef.current.style.height = 'auto';
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      submitMessage();
    }
  }

  function getTextContent(message: UIMessage): string {
    const part = message.parts.find((p) => p.type === 'text') as
      | TextPart
      | undefined;
    return part?.text ?? '';
  }

  function renderAssistantMessage(message: UIMessage) {
    const toolPart = message.parts.find(
      (p) => p.type === 'tool-recommendCars',
    ) as ToolRecommendPart | undefined;

    const textContent = getTextContent(message);
    const hasCards =
      toolPart &&
      (toolPart.state === 'input-available' ||
        toolPart.state === 'output-available');

    return (
      <div className='flex flex-col gap-3'>
        {textContent && (
          <p className='text-sm leading-relaxed text-foreground/90 whitespace-pre-wrap'>
            {textContent}
          </p>
        )}
        {hasCards && toolPart && <CarRecommendations input={toolPart.input} />}
      </div>
    );
  }

  const isEmpty = messages.length === 0;

  return (
    <div className='flex h-full flex-col'>
      {/* Fixed new-chat button */}
      <button
        onClick={startNewChat}
        title='New conversation'
        className='fixed top-3 left-3 z-50 flex size-9 items-center justify-center rounded-full bg-background border border-border shadow-md hover:bg-accent transition-colors'>
        <Plus className='size-4 text-foreground' />
      </button>

      {previousIntent && showBanner && (
        <div className='shrink-0 px-4 pt-4 max-w-3xl w-full mx-auto cursor-pointer'>
          <ReturningUserBanner
            intentSummary={previousIntent}
            onContinue={() => setShowBanner(false)}
            onStartFresh={startNewChat}
          />
        </div>
      )}

      <ScrollArea className='flex-1 overflow-y-auto'>
        <div className='max-w-3xl mx-auto w-full px-4 py-6'>
          {isEmpty ? (
            <div className='flex flex-col items-center justify-center gap-6 pt-16 pb-8 text-center'>
              <div className='flex flex-col items-center gap-3'>
                <div className='flex size-16 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-400 to-red-500 shadow-lg shadow-orange-200 dark:shadow-orange-900/30'>
                  <Car className='size-8 text-white' />
                </div>
                <div>
                  <h1 className='text-2xl font-bold tracking-tight'>
                    CarDekho AI
                  </h1>
                  <p className='mt-1 text-sm text-muted-foreground'>
                    Your personal car recommendation assistant
                  </p>
                </div>
              </div>

              <p className='max-w-sm text-base text-foreground/70 leading-relaxed'>
                Tell me about where you drive and what you need a car for —
                I&apos;ll find your perfect match.
              </p>

              <div className='flex flex-wrap justify-center gap-2'>
                {EXAMPLE_PROMPTS.map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => {
                      if (!isActive) sendMessage({ text: prompt });
                    }}
                    disabled={isActive}
                    className='inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-4 py-2 text-sm text-foreground/80 transition-colors hover:bg-accent hover:text-foreground disabled:pointer-events-none disabled:opacity-50'>
                    <MapPin className='size-3.5 text-orange-500 shrink-0' />
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className='flex flex-col gap-5'>
              {messages.map((message) => {
                const isUser = message.role === 'user';
                return (
                  <div
                    key={message.id}
                    className={cn(
                      'flex w-full',
                      isUser ? 'justify-end' : 'justify-start',
                    )}>
                    {!isUser && (
                      <div className='mr-2.5 mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-orange-400 to-red-500 shadow-sm shadow-orange-200 dark:shadow-orange-900/30'>
                        <Sparkles className='size-3.5 text-white' />
                      </div>
                    )}
                    <div
                      className={cn(
                        'max-w-[85%] rounded-2xl px-4 py-3',
                        isUser
                          ? 'rounded-tr-sm bg-primary text-primary-foreground'
                          : 'rounded-tl-sm bg-card border border-border shadow-sm',
                      )}>
                      {isUser ? (
                        <p className='text-sm leading-relaxed whitespace-pre-wrap'>
                          {getTextContent(message)}
                        </p>
                      ) : (
                        renderAssistantMessage(message)
                      )}
                    </div>
                  </div>
                );
              })}

              {isActive && (
                <div className='flex justify-start'>
                  <div className='mr-2.5 mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-orange-400 to-red-500 shadow-sm shadow-orange-200 dark:shadow-orange-900/30'>
                    <Sparkles className='size-3.5 text-white' />
                  </div>
                  <div className='rounded-2xl rounded-tl-sm border border-border bg-card px-4 py-3 shadow-sm'>
                    <ThinkingDots />
                  </div>
                </div>
              )}

              <div ref={bottomRef} />
            </div>
          )}
        </div>
      </ScrollArea>

      <div className='shrink-0 border-t border-border bg-background/80 backdrop-blur-sm'>
        <div className='max-w-3xl mx-auto w-full px-4 py-3 flex items-end gap-3'>
          <Textarea
            ref={textareaRef}
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
              autoResize(e.target);
            }}
            onKeyDown={handleKeyDown}
            placeholder='Describe your driving needs…'
            disabled={isActive}
            rows={1}
            className='min-h-[44px] max-h-[180px] resize-none flex-1 rounded-xl border-border bg-card shadow-sm focus-visible:ring-orange-400/50 disabled:opacity-60 text-sm leading-relaxed'
          />
          <Button
            type='button'
            size='icon'
            onClick={submitMessage}
            disabled={isActive || !inputValue.trim()}
            className='size-11 shrink-0 rounded-xl bg-gradient-to-br from-orange-400 to-red-500 hover:from-orange-500 hover:to-red-600 disabled:opacity-50 shadow-sm text-white'
            aria-label='Send message'>
            <SendHorizonal className='size-4' />
          </Button>
        </div>
        <p className='pb-2 text-center text-xs text-muted-foreground/60'>
          Press Enter to send · Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}

function ThinkingDots() {
  return (
    <div className='flex items-center gap-1 py-0.5' aria-label='Thinking'>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className='size-1.5 rounded-full bg-muted-foreground/50 animate-bounce'
          style={{ animationDelay: `${i * 150}ms` }}
        />
      ))}
    </div>
  );
}
