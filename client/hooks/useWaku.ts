import { useState, useEffect, useCallback, useRef } from 'react';
import { WakuMessage, WakuConfig } from '../types/waku';

const WAKU_CONFIG: WakuConfig = {
  requestTopic: '/privacyai/1/chat-request/proto',
  responseTopic: '/privacyai/1/chat-response/proto',
};



export const useWaku = () => {
  const [node, setNode] = useState<any>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const callbackRef = useRef<((message: WakuMessage) => void) | null>(null);
  
  // For development: Set to true to enable full Waku, false for demo mode
  const ENABLE_FULL_WAKU = true;

  // Initialize Waku node
  const initializeWaku = useCallback(async () => {
    if (isConnecting || node) return;

    try {
      setIsConnecting(true);
      setError(null);
      
      if (ENABLE_FULL_WAKU) {
        console.log('Initializing full Waku node...');
        try {
          // Import Waku SDK dynamically to handle potential issues
          const { createLightNode, waitForRemotePeer, Protocols } = await import('@waku/sdk');
          
          console.log('Creating Waku light node...');
          const wakuNode = await createLightNode({ 
            defaultBootstrap: true 
          });
          
          console.log('Starting Waku node...');
          await wakuNode.start();
          
          console.log('Waiting for remote peers...');
          // Set a longer timeout for peer connection
          const peerTimeout = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Peer connection timeout')), 30000)
          );
          
          await Promise.race([
            waitForRemotePeer(wakuNode, [Protocols.LightPush, Protocols.Filter]),
            peerTimeout
          ]);
          
          // Log peer information
          const peers = wakuNode.libp2p.getPeers();
          console.log(`🔗 Connected to ${peers.length} Waku peers`);
          
          setNode(wakuNode);
          setIsConnected(true);
          console.log('✅ Waku node connected successfully!');
          
          // Additional peer discovery - wait a bit more for peer stability
          setTimeout(() => {
            const finalPeers = wakuNode.libp2p.getPeers();
            console.log(`🔗 Final peer count: ${finalPeers.length}`);
          }, 5000);
        } catch (error) {
          console.error('Waku connection failed:', error);
          setError(`Waku connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
          setIsConnected(false);
        }
      } else {
        console.log('ENABLE_FULL_WAKU is disabled - this should not happen');
        setError('Waku is disabled in configuration');
      }
      
    } catch (err) {
      console.error('Failed to initialize Waku:', err);
      setError(err instanceof Error ? err.message : 'Failed to connect to Waku network');
    } finally {
      setIsConnecting(false);
    }
  }, [isConnecting, node]);

  // Send message to Waku network
  const sendWakuMessage = useCallback(async (message: WakuMessage): Promise<boolean> => {
    if (!node || !isConnected) {
      console.error('Waku node not connected');
      return false;
    }

    try {
      const contentTopic = message.type === 'request' ? WAKU_CONFIG.requestTopic : WAKU_CONFIG.responseTopic;
      
      console.log(`📤 Sending Waku message to ${contentTopic}:`, {
        sessionId: message.sessionId,
        messageId: message.messageId,
        content: message.content.substring(0, 50) + '...',
        type: message.type
      });

      if (ENABLE_FULL_WAKU) {
        // Check peer count before sending
        const peers = node.libp2p.getPeers();
        console.log(`📊 Available peers: ${peers.length}`);
        
        if (peers.length === 0) {
          console.warn('⚠️ No peers available for sending message');
          return false;
        }
        
        // Implement full Waku sending
        const { createEncoder } = await import('@waku/sdk');
        const encoder = createEncoder({ contentTopic });
        const payload = new TextEncoder().encode(JSON.stringify(message));
        const result = await node.lightPush.send(encoder, { payload });
        
        const success = result.successes.length > 0;
        if (success) {
          console.log(`✅ Message sent successfully via Waku to ${result.successes.length} peers`);
        } else {
          console.error('❌ Failed to send message via Waku:', result.failures);
        }
        return success;
      }
      
      // Fallback if ENABLE_FULL_WAKU is false (should not happen in production)
      console.error('ENABLE_FULL_WAKU is disabled - cannot send messages');
      return false;
      
    } catch (err) {
      console.error('Failed to send Waku message:', err);
      return false;
    }
  }, [node, isConnected]);

  // Subscribe to response messages
  const subscribeToResponses = useCallback(async (callback: (message: WakuMessage) => void) => {
    if (!node || !isConnected) {
      console.error('Waku node not connected');
      return;
    }

    callbackRef.current = callback;

    try {
      console.log(`📡 Subscribed to Waku response topic: ${WAKU_CONFIG.responseTopic}`);
      
      if (ENABLE_FULL_WAKU && node) {
        // Implement full Waku subscription
        const { createDecoder } = await import('@waku/sdk');
        const decoder = createDecoder(WAKU_CONFIG.responseTopic);
        await node.filter.subscribe([decoder], (message: any) => {
          if (message.payload) {
            try {
              const textPayload = new TextDecoder().decode(message.payload);
              const wakuMessage = JSON.parse(textPayload);
              if (wakuMessage.type === 'response') {
                console.log('📨 Received Waku response:', wakuMessage);
                callback(wakuMessage);
              }
            } catch (error) {
              console.error('Failed to process Waku message:', error);
            }
          }
        });
        console.log('✅ Successfully subscribed to Waku responses');
      } else {
        console.log('Demo mode: Response subscription active');
      }
      
    } catch (err) {
      console.error('Failed to subscribe to responses:', err);
    }
  }, [node, isConnected]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (node) {
        console.log('Cleaning up Waku node');
        callbackRef.current = null;
      }
    };
  }, [node]);

  return {
    node,
    isConnected,
    isConnecting,
    error,
    initializeWaku,
    sendWakuMessage,
    subscribeToResponses,
    config: WAKU_CONFIG,
  };
};

 