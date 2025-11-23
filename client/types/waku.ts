export interface WakuMessage {
  sessionId: string;
  messageId: string;
  content: string;
  timestamp: string;
  type: 'request' | 'response';
}

export interface WakuConfig {
  requestTopic: string;
  responseTopic: string;
} 