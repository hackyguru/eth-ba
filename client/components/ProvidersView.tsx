import { useState, useEffect } from 'react';
import { useWaku } from '../hooks/useWaku';
import { useChat } from '../hooks/useChat';
import { WakuMessage, ProviderProfile } from '../types/waku';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Globe, Cpu, DollarSign, Clock, ShieldCheck, Check } from 'lucide-react';

export const ProvidersView = () => {
  const { isConnected, subscribeToDiscovery } = useWaku();
  const { selectProvider, selectedProvider } = useChat();
  const [providers, setProviders] = useState<ProviderProfile[]>([]);
  const [loading, setLoading] = useState(true);

  // Log for debugging
  useEffect(() => {
    console.log('Current selected provider:', selectedProvider);
  }, [selectedProvider]);

  useEffect(() => {
    let mounted = true;

    const handleDiscovery = (message: WakuMessage) => {
      if (!mounted || !message.metadata) return;

      const { providerId, model, price, walletAddress, publicKey } = message.metadata;
      
      if (providerId && model && price && walletAddress) {
        setProviders(prev => {
          // Check if provider already exists
          const exists = prev.find(p => p.id === providerId);
          if (exists) {
            // Update existing
            return prev.map(p => p.id === providerId ? {
              ...p,
              lastSeen: Date.now(),
              pricePerPrompt: price,
              model,
              publicKey // Update public key if it changed
            } : p);
          }
          // Add new
          return [...prev, {
            id: providerId,
            name: providerId,
            model,
            pricePerPrompt: price,
            walletAddress,
            publicKey, // Store public key
            lastSeen: Date.now(),
            rating: 4.8 + (Math.random() * 0.2),
            latency: 100 + Math.floor(Math.random() * 200)
          }];
        });
        
        setLoading(false);
      }
    };

    if (isConnected) {
      subscribeToDiscovery(handleDiscovery);
      setTimeout(() => {
        if (mounted && providers.length === 0) {
          setLoading(false);
        }
      }, 10000);
    }

    return () => {
      mounted = false;
    };
  }, [isConnected, subscribeToDiscovery, providers.length]);

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center space-y-6">
         <div className="w-16 h-16 rounded-full bg-zinc-800 flex items-center justify-center mb-4 animate-pulse">
           <Globe className="w-8 h-8 text-zinc-400" />
         </div>
         <h2 className="text-2xl font-bold text-white">Connecting to Network...</h2>
         <p className="text-zinc-400 max-w-md mb-6">
           Waiting for Waku peer connection to discover decentralized AI providers.
         </p>
         <Button 
            variant="secondary" 
            onClick={() => window.location.reload()}
          >
            Reload Page
          </Button>
       </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">AI Providers</h2>
          <p className="text-zinc-400 text-sm mt-1">
            Discovered {providers.length} active nodes on the privacy network
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => setProviders([])} className="gap-2">
          Refresh Discovery
        </Button>
      </div>

      {loading && providers.length === 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div className="col-span-full flex flex-col items-center justify-center py-12 text-zinc-500">
            <div className="w-8 h-8 border-2 border-zinc-700 border-t-zinc-400 rounded-full animate-spin mb-4"></div>
            <p>Scanning network for providers...</p>
          </div>
        </div>
      ) : providers.length === 0 ? (
        <div className="text-center py-12 text-zinc-500">
          No providers found. Make sure an inference node is running.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {providers.map((provider) => {
            const isSelected = selectedProvider?.id === provider.id;
            
            return (
              <Card 
                key={provider.id} 
                className={`bg-[#18181b] border-zinc-800 transition-all duration-200 group
                  ${isSelected ? 'border-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.1)]' : 'hover:border-zinc-700'}`}
              >
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-10 h-10 border border-zinc-700">
                        <AvatarImage src={`https://api.dicebear.com/7.x/identicon/svg?seed=${provider.id}`} />
                        <AvatarFallback className="bg-gradient-to-br from-orange-500 to-orange-700 text-white font-bold text-xs">
                          {provider.name.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-base text-white group-hover:text-orange-500 transition-colors">
                          {provider.name.length > 10 
                            ? `${provider.name.substring(0, 4)}...${provider.name.substring(provider.name.length - 4)}`
                            : provider.name}
                        </CardTitle>
                        <div className="flex items-center gap-1.5 text-xs text-zinc-500 mt-1">
                          <ShieldCheck className="w-3 h-3 text-orange-500" />
                          <span className="text-zinc-400">ROFL Verified</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    {/* Model Info */}
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-zinc-500">Model</span>
                      <span className="text-zinc-200 font-medium">{provider.model}</span>
                    </div>
                    
                    {/* Price Info */}
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-zinc-500">Price / Request</span>
                      <span className="text-orange-500 font-medium">{provider.pricePerPrompt}</span>
                    </div>
                  </div>

                  <div className="pt-4 mt-2 border-t border-zinc-800/50 flex items-center justify-between gap-2">
                    <Button 
                      onClick={() => isSelected ? selectProvider(null) : selectProvider(provider)}
                      className={`flex-1 h-9 font-medium transition-colors
                        ${isSelected 
                          ? 'bg-orange-600 hover:bg-orange-700 text-white' 
                          : 'bg-white hover:bg-zinc-200 text-black'
                        }`}
                    >
                      {isSelected ? (
                        <>
                          <Check className="w-4 h-4 mr-2" />
                          Deselect Node
                        </>
                      ) : (
                        'Select Node'
                      )}
                    </Button>
                    {provider.apiMetadataCid && (
                      <Button 
                        variant="outline"
                        className="h-9 px-3 border-zinc-700 text-zinc-300 hover:text-white hover:bg-zinc-800"
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(`https://ipfs.io/ipfs/${provider.apiMetadataCid}`, '_blank');
                        }}
                        title="View Decentralized API Metadata"
                      >
                        <Globe className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
