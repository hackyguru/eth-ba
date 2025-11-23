import { useState, KeyboardEvent, useRef } from 'react';
import { Send, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
}

export const ChatInput = ({ onSendMessage, disabled = false }: ChatInputProps) => {
  const [message, setMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = () => {
    if (message.trim() && !disabled) {
      onSendMessage(message);
      setMessage('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = `${Math.min(e.target.scrollHeight, 200)}px`;
  };

  return (
    <div className="relative w-full p-2">
      <div className="max-w-[90%] mx-auto">
        <div className="relative flex items-end gap-2 bg-[#27272a] rounded-[28px] p-1.5 pl-4 shadow-lg border border-zinc-800/50 focus-within:border-zinc-700 transition-colors">
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8 md:h-9 md:w-9 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-700/50 mb-0.5 flex-shrink-0"
            disabled={disabled}
          >
            <Plus className="w-5 h-5" />
          </Button>

          <Textarea
            ref={textareaRef}
            value={message}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            placeholder="Message..."
            className="flex-1 min-h-[44px] max-h-[200px] py-3 px-2 bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-zinc-500 text-zinc-100 resize-none text-base leading-relaxed"
            rows={1}
            disabled={disabled}
            aria-label="Type your message"
          />
          
          <Button
            onClick={handleSubmit}
            disabled={!message.trim() || disabled}
            size="icon"
            variant="ghost"
            className={`h-9 w-9 md:h-10 md:w-10 rounded-full mb-0.5 transition-all duration-200 flex-shrink-0
              ${!message.trim() || disabled 
                ? 'text-zinc-500 hover:bg-transparent cursor-not-allowed' 
                : 'text-white hover:bg-zinc-700'
              }`}
            aria-label="Send message"
          >
            <Send className="w-5 h-5" />
          </Button>
        </div>
        
        <div className="text-center mt-2">
          <p className="text-[10px] text-zinc-500">
            Power by <span className="font-medium text-zinc-400">PrivacyAI</span>
          </p>
        </div>
      </div>
    </div>
  );
};
