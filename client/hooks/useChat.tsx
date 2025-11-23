import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { ChatSession, ChatMessage, ChatState } from '../types/chat';
import { useWaku } from './useWaku';
import { WakuMessage, ProviderProfile } from '../types/waku';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import { parseEther } from 'viem';

const initialState: ChatState = {
  sessions: [],
  currentSessionId: null,
  messages: {},
  selectedProvider: null,
};

interface ChatContextType {
  sessions: ChatSession[];
  currentSession: ChatSession | undefined;
  currentMessages: ChatMessage[];
  selectedProvider: ProviderProfile | null;
  isLoading: boolean;
  createNewSession: () => string;
  selectSession: (sessionId: string) => void;
  selectProvider: (provider: ProviderProfile) => void;
  deleteSession: (sessionId: string) => void;
  sendMessage: (content: string) => Promise<void>;
  wakuConnected: boolean;
  wakuConnecting: boolean;
  wakuError: string | null;
}

const ChatContext = createContext<ChatContextType | null>(null);

export const ChatProvider = ({ children }: { children: React.ReactNode }) => {
  const [chatState, setChatState] = useLocalStorage<ChatState>('chat-state', initialState);
  const [isLoading, setIsLoading] = useState(false);
  const { isConnected, isConnecting, error, sendWakuMessage, subscribeToResponses } = useWaku();
  
  const { authenticated } = usePrivy();
  const { wallets } = useWallets();
  const wallet = wallets[0];

  const createNewSession = useCallback(() => {
    const sessionId = Date.now().toString();
    const newSession: ChatSession = {
      id: sessionId,
      title: 'New Chat',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setChatState(prevState => ({
      ...prevState,
      sessions: [newSession, ...prevState.sessions],
      currentSessionId: sessionId,
      messages: {
        ...prevState.messages,
        [sessionId]: [],
      },
    }));

    return sessionId;
  }, [setChatState]);

  const selectSession = useCallback((sessionId: string) => {
    setChatState(prevState => ({
      ...prevState,
      currentSessionId: sessionId,
    }));
  }, [setChatState]);

  const selectProvider = useCallback((provider: ProviderProfile) => {
    console.log('Selecting provider:', provider);
    setChatState(prevState => ({
      ...prevState,
      selectedProvider: provider,
    }));
  }, [setChatState]);

  const deleteSession = useCallback((sessionId: string) => {
    setChatState(prevState => {
      const newSessions = prevState.sessions.filter(session => session.id !== sessionId);
      const newMessages = { ...prevState.messages };
      delete newMessages[sessionId];
      
      const newCurrentSessionId = prevState.currentSessionId === sessionId 
        ? (newSessions[0]?.id || null) 
        : prevState.currentSessionId;

      return {
        sessions: newSessions,
        currentSessionId: newCurrentSessionId,
        messages: newMessages,
        selectedProvider: prevState.selectedProvider,
      };
    });
  }, [setChatState]);

  useEffect(() => {
    if (isConnected) {
      subscribeToResponses((wakuMessage: WakuMessage) => {
        const assistantMessage: ChatMessage = {
          id: wakuMessage.messageId,
          sessionId: wakuMessage.sessionId,
          content: wakuMessage.content,
          role: 'assistant',
          timestamp: wakuMessage.timestamp,
        };

        setChatState(prevState => {
          const currentSessionMessages = prevState.messages[wakuMessage.sessionId] || [];
          return {
            ...prevState,
            messages: {
              ...prevState.messages,
              [wakuMessage.sessionId]: [...currentSessionMessages, assistantMessage],
            },
          };
        });

        setIsLoading(false);
      });
    }
  }, [isConnected, subscribeToResponses, setChatState]);

  const sendMessage = useCallback(async (content: string) => {
    if (!chatState.currentSessionId || !content.trim()) return;

    const sessionId = chatState.currentSessionId;
    const userMessageId = Date.now().toString();
    const userMessage: ChatMessage = {
      id: userMessageId,
      sessionId,
      content: content.trim(),
      role: 'user',
      timestamp: new Date().toISOString(),
    };

    setChatState(prevState => {
      const sessionMessages = prevState.messages[sessionId] || [];
      const isFirstMessage = sessionMessages.length === 0;
      
      let updatedSessions = prevState.sessions;
      if (isFirstMessage) {
        const sessionTitle = content.slice(0, 50) + (content.length > 50 ? '...' : '');
        updatedSessions = prevState.sessions.map(session =>
          session.id === sessionId
            ? { ...session, title: sessionTitle, updatedAt: new Date().toISOString() }
            : session
        );
      }

      return {
        ...prevState,
        sessions: updatedSessions,
        messages: {
          ...prevState.messages,
          [sessionId]: [...sessionMessages, userMessage],
        },
      };
    });

    setIsLoading(true);

    let txHash: string | undefined;
    const provider = chatState.selectedProvider;

    console.log('Sending message. Selected Provider:', provider);

    if (provider && authenticated && wallet) {
      try {
        console.log(`Processing payment to ${provider.walletAddress}`);
        const amount = provider.pricePerPrompt.split(' ')[0];
        
        if (wallet.chainId !== 'eip155:23295') {
          try {
            await wallet.switchChain(23295);
          } catch (e) {
            console.warn('Failed to switch chain automatically', e);
          }
        }

        const providerEth = await wallet.getEthereumProvider();
        
        const hash = await providerEth.request({
          method: 'eth_sendTransaction',
          params: [{
            from: wallet.address,
            to: provider.walletAddress,
            value: parseEther(amount).toString(16),
          }]
        });

        txHash = hash as string;
        console.log('Payment successful:', txHash);
        
        setChatState(prevState => {
          const msgs = prevState.messages[sessionId];
          const updatedMsgs = msgs.map(m => 
            m.id === userMessageId ? { ...m, txHash } : m
          );
          return {
            ...prevState,
            messages: {
              ...prevState.messages,
              [sessionId]: updatedMsgs
            }
          };
        });

      } catch (paymentError) {
        console.error('Payment failed:', paymentError);
        setChatState(prevState => {
          const msgs = prevState.messages[sessionId];
          const errorMsg: ChatMessage = {
            id: Date.now().toString(),
            sessionId,
            content: `Payment failed: ${paymentError instanceof Error ? paymentError.message : 'Unknown error'}. Please try again.`,
            role: 'assistant',
            timestamp: new Date().toISOString(),
          };
          return {
            ...prevState,
            messages: {
              ...prevState.messages,
              [sessionId]: [...msgs, errorMsg]
            }
          };
        });
        setIsLoading(false);
        return;
      }
    } else if (provider && !authenticated) {
      setChatState(prevState => {
        const msgs = prevState.messages[sessionId];
        const errorMsg: ChatMessage = {
          id: Date.now().toString(),
          sessionId,
          content: "Please connect your wallet to pay for this inference request.",
          role: 'assistant',
          timestamp: new Date().toISOString(),
        };
        return {
          ...prevState,
          messages: {
            ...prevState.messages,
            [sessionId]: [...msgs, errorMsg]
          }
        };
      });
      setIsLoading(false);
      return;
    }

    if (isConnected) {
      const wakuMessage: WakuMessage = {
        sessionId,
        messageId: userMessageId,
        content: content.trim(),
        timestamp: new Date().toISOString(),
        type: 'request',
        metadata: {
          txHash,
          providerId: provider?.id,
          walletAddress: wallet?.address
        }
      };

      const success = await sendWakuMessage(wakuMessage);
      if (!success) console.log('Waku send failed');
    } else {
      setIsLoading(false);
    }
  }, [chatState.currentSessionId, chatState.selectedProvider, setChatState, isConnected, sendWakuMessage, authenticated, wallet]);

  const currentSession = chatState.sessions.find(session => session.id === chatState.currentSessionId);
  const currentMessages = chatState.currentSessionId ? chatState.messages[chatState.currentSessionId] || [] : [];

  return (
    <ChatContext.Provider value={{
      sessions: chatState.sessions,
      currentSession,
      currentMessages,
      selectedProvider: chatState.selectedProvider,
      isLoading,
      createNewSession,
      selectSession,
      selectProvider,
      deleteSession,
      sendMessage,
      wakuConnected: isConnected,
      wakuConnecting: isConnecting,
      wakuError: error,
    }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};

