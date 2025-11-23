import { ProviderProfile } from './waku';

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
  txHash?: string; // Payment proof
}

export interface UserProfile {
  name: string;
  avatar: string;
}

export interface ChatState {
  sessions: ChatSession[];
  currentSessionId: string | null;
  messages: { [sessionId: string]: ChatMessage[] };
  selectedProvider: ProviderProfile | null;
  userProfile?: UserProfile;
}
