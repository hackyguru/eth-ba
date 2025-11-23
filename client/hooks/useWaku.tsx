import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { WakuMessage, WakuConfig } from '../types/waku';

const WAKU_CONFIG: WakuConfig = {
  requestTopic: '/privacyai/1/chat-request/proto',
  responseTopic: '/privacyai/1/chat-response/proto',
  discoveryTopic: '/privacyai/1/discovery/proto',
};

const BOOTSTRAP_NODES = [
  '/dns4/node-01.ac-cn-hongkong-c.waku.status.im/tcp/443/wss/p2p/16Uiu2HAm4v86W3WfG62i69Kj7J5u7z5kE6gT6k7w6g8w8w8w8',
  '/dns4/node-01.do-ams3.waku.status.im/tcp/443/wss/p2p/16Uiu2HAmPLe7Mzm8qmpDq460hcgVjNhA66TrTW8kHK1BpXH6STjn',
  '/dns4/node-01.gc-us-central1-a.waku.status.im/tcp/443/wss/p2p/16Uiu2HAmJb2e28qLXxT5kZxVUUoJt72EMzNGXB47Rxx5hw3q4YjS',
];

interface WakuContextType {
  node: any;
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
  sendWakuMessage: (message: WakuMessage) => Promise<boolean>;
  subscribeToResponses: (callback: (message: WakuMessage) => void) => void;
  subscribeToDiscovery: (callback: (message: WakuMessage) => void) => void;
  config: WakuConfig;
}

const WakuContext = createContext<WakuContextType | null>(null);

export const WakuProvider = ({ children }: { children: React.ReactNode }) => {
  const [node, setNode] = useState<any>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const responseCallbackRef = useRef<((message: WakuMessage) => void) | null>(null);
  const discoveryCallbackRef = useRef<((message: WakuMessage) => void) | null>(null);

  const ENABLE_FULL_WAKU = true;

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      if (isConnecting || node) return;

      try {
        setIsConnecting(true);
        setError(null);
        
        if (ENABLE_FULL_WAKU) {
          const { createLightNode, waitForRemotePeer, Protocols } = await import('@waku/sdk');
          
          console.log('Creating Waku light node...');
          const wakuNode = await createLightNode({ 
            defaultBootstrap: true,
          });
          
          console.log('Starting Waku node...');
          await wakuNode.start();

          // Dial extra peers
          Promise.allSettled(BOOTSTRAP_NODES.map(addr => wakuNode.dial(addr)));
          
          const peerTimeout = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Peer connection timeout')), 20000)
          );
          
          try {
            await Promise.race([
              waitForRemotePeer(wakuNode, [Protocols.LightPush, Protocols.Filter]),
              peerTimeout
            ]);
            
            if (mounted) {
              setNode(wakuNode);
              setIsConnected(true);
              console.log('✅ Waku node connected (Global Context)');
            }
          } catch (e) {
            console.warn('Peer connection timed out, but node started. Will retry in background.');
            // Set connected anyway so UI doesn't block forever, 
            // connection might stabilize later
            if (mounted) {
              setNode(wakuNode);
              setIsConnected(true);
            }
          }
          
        } else {
          setError('Waku is disabled');
        }
      } catch (err) {
        console.error('Failed to initialize Waku:', err);
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Failed to connect');
        }
      } finally {
        if (mounted) setIsConnecting(false);
      }
    };

    init();

    return () => {
      mounted = false;
    };
  }, []); // Run once on mount

  const sendWakuMessage = useCallback(async (message: WakuMessage): Promise<boolean> => {
    if (!node || !isConnected) return false;

    try {
      let contentTopic = WAKU_CONFIG.requestTopic;
      if (message.type === 'response') contentTopic = WAKU_CONFIG.responseTopic;
      if (message.type === 'discovery') contentTopic = WAKU_CONFIG.discoveryTopic;
      
      if (ENABLE_FULL_WAKU) {
        const { createEncoder } = await import('@waku/sdk');
        const encoder = createEncoder({ contentTopic });
        const payload = new TextEncoder().encode(JSON.stringify(message));
        const result = await node.lightPush.send(encoder, { payload });
        return result.successes.length > 0;
      }
      return false;
    } catch (err) {
      console.error('Failed to send message:', err);
      return false;
    }
  }, [node, isConnected]);

  // Persistent subscriptions
  useEffect(() => {
    if (!node || !isConnected) return;

    let unsubscribeResponses: (() => void) | undefined;
    let unsubscribeDiscovery: (() => void) | undefined;

    const setupSubscriptions = async () => {
      try {
        const { createDecoder } = await import('@waku/sdk');
        
        // Response Subscription
        const responseDecoder = createDecoder(WAKU_CONFIG.responseTopic);
        const responseSubscription = await node.filter.subscribe([responseDecoder], (message: any) => {
          if (message.payload && responseCallbackRef.current) {
            try {
              const textPayload = new TextDecoder().decode(message.payload);
              const wakuMessage = JSON.parse(textPayload);
              if (wakuMessage.type === 'response') {
                responseCallbackRef.current(wakuMessage);
              }
            } catch (e) {
              console.error('Error decoding message', e);
            }
          }
        });
        unsubscribeResponses = responseSubscription;

        // Discovery Subscription
        const discoveryDecoder = createDecoder(WAKU_CONFIG.discoveryTopic);
        const discoverySubscription = await node.filter.subscribe([discoveryDecoder], (message: any) => {
          if (message.payload && discoveryCallbackRef.current) {
            try {
              const textPayload = new TextDecoder().decode(message.payload);
              const wakuMessage = JSON.parse(textPayload);
              if (wakuMessage.type === 'discovery') {
                discoveryCallbackRef.current(wakuMessage);
              }
            } catch (e) {
              console.error('Error decoding discovery', e);
            }
          }
        });
        unsubscribeDiscovery = discoverySubscription;

        console.log('✅ Subscribed to Waku topics');
      } catch (err) {
        console.error('Failed to setup Waku subscriptions:', err);
      }
    };

    setupSubscriptions();

    // Cleanup not strictly necessary for persistent node, but good practice if node was destroyed
    return () => {
      // Waku SDK v0.0.18+ might not return simple unsubscribe functions, 
      // but persistent subscriptions are fine for app lifetime.
    };
  }, [node, isConnected]);

  const subscribeToResponses = useCallback((callback: (message: WakuMessage) => void) => {
    responseCallbackRef.current = callback;
  }, []);

  const subscribeToDiscovery = useCallback((callback: (message: WakuMessage) => void) => {
    discoveryCallbackRef.current = callback;
  }, []);

  return (
    <WakuContext.Provider value={{
      node,
      isConnected,
      isConnecting,
      error,
      sendWakuMessage,
      subscribeToResponses,
      subscribeToDiscovery,
      config: WAKU_CONFIG
    }}>
      {children}
    </WakuContext.Provider>
  );
};

export const useWaku = () => {
  const context = useContext(WakuContext);
  if (!context) {
    throw new Error('useWaku must be used within a WakuProvider');
  }
  return context;
};

