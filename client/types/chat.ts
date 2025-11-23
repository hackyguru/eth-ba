export interface ChatSession {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessage {
  id: string;
  sessionId: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: string;
}

export interface ChatState {
  sessions: ChatSession[];
  currentSessionId: string | null;
  messages: { [sessionId: string]: ChatMessage[] };
} 