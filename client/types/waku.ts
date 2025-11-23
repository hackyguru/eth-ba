export interface WakuMessage {
  sessionId: string;
  messageId: string;
  content: string;
  timestamp: string;
  type: 'request' | 'response' | 'discovery';
  metadata?: {
    providerId?: string;
    model?: string;
    price?: string;
    walletAddress?: string;
    txHash?: string; // Added for X402 payment proof
  };
}

export interface WakuConfig {
  requestTopic: string;
  responseTopic: string;
  discoveryTopic: string;
}

export interface ProviderProfile {
  id: string;
  name: string;
  model: string;
  pricePerPrompt: string;
  walletAddress: string;
  lastSeen: number;
  rating?: number;
  latency?: number;
}
