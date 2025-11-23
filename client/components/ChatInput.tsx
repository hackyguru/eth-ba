import { useState, KeyboardEvent, useRef } from 'react';
import { Send, Paperclip, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface ChatInputProps {
  onSendMessage: (message: string, file?: File) => void;
  disabled?: boolean;
}

export const ChatInput = ({ onSendMessage, disabled = false }: ChatInputProps) => {
  const [message, setMessage] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = () => {
    if ((message.trim() || selectedFile) && !disabled) {
      onSendMessage(message, selectedFile || undefined);
      setMessage('');
      setSelectedFile(null);
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

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  return (
    <div className="relative w-full p-2">
      <div className="max-w-[90%] mx-auto">
        {/* File Preview */}
        {selectedFile && (
          <div className="mb-2 ml-4 flex items-center gap-2 bg-[#27272a] rounded-lg p-2 w-fit border border-zinc-800">
            <span className="text-xs text-zinc-300 max-w-[200px] truncate">{selectedFile.name}</span>
            <button 
              onClick={() => setSelectedFile(null)}
              className="text-zinc-500 hover:text-red-400"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        )}

        <div className="relative flex items-end gap-2 bg-[#27272a] rounded-[28px] p-1.5 pl-4 shadow-lg border border-zinc-800/50 focus-within:border-zinc-700 transition-colors">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            className="hidden"
            accept=".txt,.md,.json,.csv"
          />
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8 md:h-9 md:w-9 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-700/50 mb-0.5 flex-shrink-0"
            disabled={disabled}
            onClick={() => fileInputRef.current?.click()}
            title="Upload Context (Text/MD)"
          >
            <Paperclip className="w-5 h-5" />
          </Button>

          <Textarea
            ref={textareaRef}
            value={message}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            placeholder={selectedFile ? "Ask about this file..." : "Message..."}
            className="flex-1 min-h-[44px] max-h-[200px] py-3 px-2 bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-zinc-500 text-zinc-100 resize-none text-base leading-relaxed"
            rows={1}
            disabled={disabled}
            aria-label="Type your message"
          />
          
          <Button
            onClick={handleSubmit}
            disabled={(!message.trim() && !selectedFile) || disabled}
            size="icon"
            variant="ghost"
            className={`h-9 w-9 md:h-10 md:w-10 rounded-full mb-0.5 transition-all duration-200 flex-shrink-0
              ${(!message.trim() && !selectedFile) || disabled 
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
