import { ChatMessage as ChatMessageType } from '../types/chat';
import { Copy, RotateCcw, FileText, ExternalLink } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

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
      <div className={`flex max-w-[90%] md:max-w-[85%] gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        {/* Avatar */}
        <Avatar className="flex-shrink-0 w-8 h-8 border border-zinc-800 mt-1">
          {isUser ? (
            <>
              <AvatarImage src="https://github.com/shadcn.png" />
              <AvatarFallback>MA</AvatarFallback>
            </>
          ) : (
            <AvatarFallback 
              className="text-black font-bold text-xs bg-gradient-to-br from-[#f97316] to-[#ea580c]"
            >
              AI
            </AvatarFallback>
          )}
        </Avatar>

        {/* Message Content */}
        <div className={`flex-1 space-y-1 ${isUser ? 'items-end' : 'items-start'}`}>
          <div className={`flex items-center gap-2 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
            <span className="text-sm font-medium text-zinc-300">
              {isUser ? '@melfanza' : 'Chat GPT'}
            </span>
          </div>
          
          <div className={`text-zinc-300 text-sm leading-relaxed whitespace-pre-wrap ${isUser ? 'text-right' : 'text-left'}`}>
            {contentParts.map((part, index) => (
              <div key={index}>
                {part.type === 'think' ? (
                  <div className="mb-3 p-3 bg-black/20 rounded-lg text-zinc-400 text-xs italic border-l-2 border-[#f97316]/50 text-left">
                    <div className="mb-1 font-semibold uppercase tracking-wider text-[10px] text-[#f97316]">Thinking process</div>
                    {part.content}
                  </div>
                ) : (
                  <div>{part.content}</div>
                )}
              </div>
            ))}
          </div>
          
          {/* Actions */}
          {!isUser && (
            <div className="pt-1 flex gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-zinc-500 hover:text-white hover:bg-zinc-800"
                title="Copy message"
                onClick={() => navigator.clipboard.writeText(message.content)}
              >
                <Copy className="w-3.5 h-3.5" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-zinc-500 hover:text-white h-6 px-2 gap-1.5 rounded-full bg-transparent hover:bg-zinc-800 text-xs"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Regenerate</span>
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
