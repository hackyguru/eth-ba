import { useEffect, useRef } from 'react';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { ChatMessage as ChatMessageType, ChatSession } from '../types/chat';
import { 
  Plane, 
  Lightbulb, 
  BookOpen, 
  RotateCcw
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';

interface ChatInterfaceProps {
  session: ChatSession | undefined;
  messages: ChatMessageType[];
  onSendMessage: (message: string) => void;
  isLoading: boolean;
}

export const ChatInterface = ({ session, messages, onSendMessage, isLoading }: ChatInterfaceProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const historyCards = [
    {
      icon: Plane,
      text: "Describe a memorable travel experience you've had. Whether it's an adventure in a far-off land...",
    },
    {
      icon: Lightbulb,
      text: "Share with me an interesting fact that you find fascinating. I love learning new things and discovering...",
    },
    {
      icon: BookOpen,
      text: "In The Book of Knowledge, embark on a journey through the corridors of history, philosophy, and science...",
    }
  ];

  // Common Layout Container
  const LayoutContainer = ({ children }: { children: React.ReactNode }) => (
    <div className="flex-1 flex flex-col h-full bg-[#18181b] rounded-3xl overflow-hidden relative border border-zinc-800/50 shadow-sm isolate">
      {children}
    </div>
  );

  return (
    <LayoutContainer>
      {/* Scrollable Content Area */}
      <div className="flex-1 min-h-0 relative">
        <ScrollArea className="h-full px-0">
          <div className="max-w-[90%] mx-auto space-y-8 py-6 pb-32">
            {/* Chat History Section (Visible when no active chat or at top) */}
            {messages.length === 0 && (
              <section>
                <h2 className="text-xl font-semibold text-white mb-4 px-2">Chat History</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 px-2">
                  {historyCards.map((card, index) => (
                    <Card key={index} className="bg-[#27272a] border-zinc-800 hover:bg-zinc-800 transition-colors cursor-pointer h-32">
                      <CardContent className="p-4 h-full flex flex-col justify-between">
                        <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400 mb-2">
                          <card.icon className="w-4 h-4" />
                        </div>
                        <p className="text-xs text-zinc-400 line-clamp-3 leading-relaxed">
                          {card.text}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </section>
            )}

            {/* Active Chat Section */}
            <section className="flex flex-col relative">
              {messages.length > 0 ? (
                <>
                  <div className="flex-1 space-y-6">
                    {messages.map((message) => (
                      <div key={message.id} className="flex gap-4 group px-2 md:px-0">
                        {message.role === 'user' ? (
                          <Avatar className="w-8 h-8 mt-1">
                            <AvatarImage src="https://github.com/shadcn.png" />
                            <AvatarFallback>MA</AvatarFallback>
                          </Avatar>
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#f97316] to-[#ea580c] flex items-center justify-center flex-shrink-0 mt-1">
                            <svg viewBox="0 0 24 24" className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M12 2a10 10 0 0 1 10 10c0 5.523-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2z" />
                              <path d="M8 14s1.5 2 4 2 4-2 4-2" />
                              <line x1="9" y1="9" x2="9.01" y2="9" />
                              <line x1="15" y1="9" x2="15.01" y2="9" />
                            </svg>
                          </div>
                        )}
                        
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-zinc-300">
                              {message.role === 'user' ? '@melfanza' : 'Chat GPT'}
                            </span>
                          </div>
                          <div className="text-zinc-300 text-sm leading-relaxed whitespace-pre-wrap">
                            {message.content}
                          </div>
                          
                          {message.role === 'assistant' && (
                            <div className="pt-2">
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="text-zinc-500 hover:text-white h-8 px-3 gap-2 rounded-full bg-zinc-800/50 hover:bg-zinc-800"
                              >
                                <RotateCcw className="w-3.5 h-3.5" />
                                <span className="text-xs">Regenerate Response</span>
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                    
                    {isLoading && (
                      <div className="flex gap-4 px-2 md:px-0">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#f97316] to-[#ea580c] flex items-center justify-center flex-shrink-0 mt-1">
                          <svg viewBox="0 0 24 24" className="w-5 h-5 text-white animate-spin" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                          </svg>
                        </div>
                        <div className="flex items-center gap-1.5 mt-3">
                          <div className="w-1.5 h-1.5 rounded-full bg-zinc-500 animate-bounce"></div>
                          <div className="w-1.5 h-1.5 rounded-full bg-zinc-500 animate-bounce delay-100"></div>
                          <div className="w-1.5 h-1.5 rounded-full bg-zinc-500 animate-bounce delay-200"></div>
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-8 opacity-50 mt-20">
                  <h3 className="text-lg font-medium text-white mb-2">Start a conversation</h3>
                  <p className="text-sm text-zinc-500 max-w-md">
                    Start a conversation below to see your active chat here.
                  </p>
                </div>
              )}
            </section>
          </div>
        </ScrollArea>
      </div>

      {/* Fixed Input Area */}
      <div className="flex-shrink-0 absolute bottom-0 left-0 right-0 z-20 pointer-events-none">
        <div className="bg-gradient-to-t from-[#18181b] via-[#18181b] to-transparent pt-10 pb-2">
          <div className="pointer-events-auto">
            <ChatInput onSendMessage={onSendMessage} disabled={isLoading} />
          </div>
        </div>
      </div>
    </LayoutContainer>
  );
};
