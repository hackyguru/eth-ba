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
  
  // Regex to split by <think> tags AND File Attachment pattern
  // Combined regex is complex, so let's do a two-pass or keep it simple.
  // Let's just handle <think> first, then process "normal" parts for files.
  
  const thinkRegex = /<think>([\s\S]*?)<\/think>/g;
  let match;
  
  while ((match = thinkRegex.exec(content)) !== null) {
    if (match.index > currentIndex) {
      const beforeThink = content.slice(currentIndex, match.index);
      if (beforeThink.trim()) {
        parts.push(...parseAttachments(beforeThink));
      }
    }
    parts.push({ type: 'think', content: match[1] });
    currentIndex = match.index + match[0].length;
  }
  
  if (currentIndex < content.length) {
    const afterThink = content.slice(currentIndex);
    if (afterThink.trim()) {
      parts.push(...parseAttachments(afterThink));
    }
  }
  
  if (parts.length === 0) {
    parts.push(...parseAttachments(content));
  }
  
  return parts;
};

const parseAttachments = (text: string) => {
  const parts = [];
  const fileRegex = /\[Attached File: (.*?) \(CID: (.*?)\)\]/g;
  let lastIndex = 0;
  let match;

  while ((match = fileRegex.exec(text)) !== null) {
    // Text before match
    if (match.index > lastIndex) {
      parts.push({ type: 'normal', content: text.slice(lastIndex, match.index) });
    }
    // The Match
    parts.push({ 
      type: 'file-attachment', 
      fileName: match[1], 
      cid: match[2], 
      content: match[0] 
    });
    lastIndex = match.index + match[0].length;
  }

  // Remaining text
  if (lastIndex < text.length) {
    parts.push({ type: 'normal', content: text.slice(lastIndex) });
  }
  
  if (parts.length === 0) {
    parts.push({ type: 'normal', content: text });
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
                ) : part.type === 'file-attachment' ? (
                  <div className="mb-3 flex items-center gap-2 p-3 bg-orange-950/30 border border-orange-900/50 rounded-lg">
                    <FileText className="w-5 h-5 text-orange-500" />
                    <div className="flex-1 overflow-hidden">
                      <div className="text-sm font-medium text-zinc-200 truncate">{part.fileName}</div>
                      <div className="text-[10px] text-zinc-500 font-mono truncate">CID: {part.cid}</div>
                    </div>
                    <a 
                      href={`https://ipfs.io/ipfs/${part.cid}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-xs text-orange-400 hover:text-orange-300"
                    >
                      <Badge variant="outline" className="border-orange-500/50 bg-orange-500/10 hover:bg-orange-500/20 text-orange-400">
                        On Filecoin <ExternalLink className="w-3 h-3 ml-1" />
                      </Badge>
                    </a>
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
