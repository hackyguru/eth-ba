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
    <div className="relative">
      <div className="relative flex items-center gap-2 bg-[#27272a] rounded-[12px] p-2 pr-3 shadow-lg border border-zinc-700 focus-within:border-zinc-600 transition-colors">
        <Button
          size="icon"
          variant="ghost"
          className="h-8 w-8 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-700/50 flex-shrink-0"
          disabled={disabled}
        >
          <Plus className="w-4 h-4" />
        </Button>

        <Textarea
          ref={textareaRef}
          value={message}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          placeholder="Enter your prompt"
          className="flex-1 min-h-[24px] max-h-[200px] py-2 px-0 bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-zinc-500 text-zinc-300 resize-none text-sm leading-relaxed"
          rows={1}
          disabled={disabled}
          aria-label="Type your message"
        />
        
        <Button
          onClick={handleSubmit}
          disabled={!message.trim() || disabled}
          size="icon"
          variant="ghost"
          className={`h-8 w-8 rounded-lg transition-all duration-200 flex-shrink-0
            ${!message.trim() || disabled 
              ? 'text-zinc-600 cursor-not-allowed' 
              : 'text-zinc-400 hover:text-white hover:bg-zinc-700'
            }`}
          aria-label="Send message"
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};
