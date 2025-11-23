import { ChatMessage as ChatMessageType } from '../types/chat';
import { Copy, RotateCcw } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface ChatMessageProps {
  message: ChatMessageType;
}

const parseMessageContent = (content: string) => {
  const parts = [];
  let currentIndex = 0;
  
  // Find all <think> and </think> tags
  const thinkRegex = /<think>([\s\S]*?)<\/think>/g;
  let match;
  
  while ((match = thinkRegex.exec(content)) !== null) {
    // Add content before the <think> tag
    if (match.index > currentIndex) {
      const beforeThink = content.slice(currentIndex, match.index);
      if (beforeThink.trim()) {
        parts.push({ type: 'normal', content: beforeThink });
      }
    }
    
    // Add the thinking content
    parts.push({ type: 'think', content: match[1] });
    currentIndex = match.index + match[0].length;
  }
  
  // Add any remaining content after the last </think> tag
  if (currentIndex < content.length) {
    const afterThink = content.slice(currentIndex);
    if (afterThink.trim()) {
      parts.push({ type: 'normal', content: afterThink });
    }
  }
  
  // If no <think> tags found, return the entire content as normal
  if (parts.length === 0) {
    parts.push({ type: 'normal', content });
  }
  
  return parts;
};

export const ChatMessage = ({ message }: ChatMessageProps) => {
  const isUser = message.role === 'user';
  const contentParts = parseMessageContent(message.content);

  return (
    <div className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'} mb-6`}>
      <div className={`flex max-w-[85%] md:max-w-[75%] gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        {/* Avatar - Only show for AI */}
        {!isUser && (
          <Avatar className="flex-shrink-0 w-8 h-8 border border-zinc-800 mt-1">
            <AvatarFallback 
              className="text-black font-bold text-xs bg-gradient-to-br from-[#FF9D00] to-[#FF5500]"
            >
              AI
            </AvatarFallback>
          </Avatar>
        )}

        {/* Message Content Bubble */}
        <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
          <div 
            className={`relative px-5 py-3.5 text-sm md:text-base leading-relaxed shadow-sm
              ${isUser 
                ? 'bg-[#2563EB] text-white rounded-2xl rounded-tr-sm' 
                : 'bg-[#27272a] text-zinc-100 rounded-2xl rounded-tl-sm border border-zinc-800'
              }
            `}
          >
            {contentParts.map((part, index) => (
              <div key={index}>
                {part.type === 'think' ? (
                  <div className="mb-3 p-3 bg-black/20 rounded-lg text-zinc-300 text-xs italic border-l-2 border-[#FF9D00]/50">
                    <div className="mb-1 font-semibold uppercase tracking-wider text-[10px] text-[#FF9D00]">Thinking process</div>
                    {part.content}
                  </div>
                ) : (
                  <div className="whitespace-pre-wrap break-words">
                    {part.content}
                  </div>
                )}
              </div>
            ))}
          </div>
          
          {/* Timestamp & Actions */}
          <div className={`flex items-center mt-1.5 gap-2 px-1 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
            <span className="text-[11px] text-zinc-500 font-medium">
              {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
            
            {!isUser && (
              <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-5 w-5 text-zinc-500 hover:text-white hover:bg-zinc-800"
                  title="Copy message"
                  onClick={() => navigator.clipboard.writeText(message.content)}
                >
                  <Copy className="w-3 h-3" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
