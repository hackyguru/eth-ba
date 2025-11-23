import { usePrivy, useWallets } from '@privy-io/react-auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Copy, LogOut, Wallet as WalletIcon, ShieldCheck, ExternalLink } from 'lucide-react';
import { useState, useEffect } from 'react';
import { formatEther } from 'viem';

export const WalletView = () => {
  const { login, logout, authenticated, user, ready } = usePrivy();
  const { wallets } = useWallets();
  const [copied, setCopied] = useState(false);
  const [balance, setBalance] = useState<string>('0.00');

  // Get the embedded or connected wallet
  const wallet = wallets[0]; // Primary wallet

  useEffect(() => {
    const fetchBalance = async () => {
      if (wallet) {
        try {
          // Switch to Oasis Sapphire Testnet if not already
          if (wallet.chainId !== 'eip155:23295') {
            await wallet.switchChain(23295);
          }
          
          // Use public client to fetch balance (simplified for now)
          // In a real app, we might use a hook or the provider directly
          const provider = await wallet.getEthereumProvider();
          const bal = await provider.request({ 
            method: 'eth_getBalance', 
            params: [wallet.address, 'latest'] 
          });
          setBalance(formatEther(BigInt(bal as string)));
        } catch (e) {
          console.error('Error fetching balance:', e);
        }
      }
    };

    if (authenticated && wallet) {
      fetchBalance();
    }
  }, [authenticated, wallet]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!ready) {
    return (
      <div className="p-8 space-y-4 max-w-2xl mx-auto">
        <Skeleton className="h-12 w-3/4 bg-zinc-800" />
        <Skeleton className="h-64 w-full bg-zinc-800" />
      </div>
    );
  }

  if (!authenticated) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-zinc-800 flex items-center justify-center mb-4">
          <WalletIcon className="w-8 h-8 text-zinc-400" />
        </div>
        <h2 className="text-2xl font-bold text-white">Wallet Not Connected</h2>
        <p className="text-zinc-400 max-w-md">
          Please connect your wallet using the button in the top right corner to view your balance and settings.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Wallet Settings</h2>
        <Button variant="outline" size="sm" onClick={logout} className="gap-2 border-red-900/30 text-red-400 hover:bg-red-900/10">
          <LogOut className="w-4 h-4" />
          Logout
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Balance Card */}
        <Card className="bg-[#18181b] border-zinc-800">
          <CardHeader>
            <CardTitle className="text-zinc-400 text-sm font-medium">Oasis Testnet Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-white mb-1">
              {parseFloat(balance).toFixed(4)} <span className="text-lg text-zinc-500">TEST</span>
            </div>
            <p className="text-xs text-zinc-500">Sapphire Confidential Chain</p>
          </CardContent>
        </Card>

        {/* Network Status */}
        <Card className="bg-[#18181b] border-zinc-800">
          <CardHeader>
            <CardTitle className="text-zinc-400 text-sm font-medium">Privacy Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-[#00ffa3] font-medium mb-1">
              <ShieldCheck className="w-4 h-4" />
              Sapphire Enclave Active
            </div>
            <p className="text-xs text-zinc-500">Payments are encrypted (X402)</p>
          </CardContent>
        </Card>
      </div>

      {/* Account Info */}
      <Card className="bg-[#18181b] border-zinc-800">
        <CardHeader>
          <CardTitle className="text-white">Account Details</CardTitle>
          <CardDescription>Your connected identity for AI inference.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm text-zinc-400">Wallet Address</label>
            <div className="flex gap-2">
              <div className="flex-1 bg-zinc-900/50 border border-zinc-700 rounded-md px-3 py-2 text-zinc-300 font-mono text-sm truncate">
                {wallet?.address}
              </div>
              <Button 
                variant="secondary" 
                onClick={() => copyToClipboard(wallet?.address || '')}
                className="shrink-0"
              >
                {copied ? "Copied!" : <Copy className="w-4 h-4" />}
              </Button>
            </div>
          </div>

          <div className="pt-4 border-t border-zinc-800">
            <div className="flex items-center justify-between text-sm">
              <span className="text-zinc-400">Linked Identity</span>
              <span className="text-white font-medium">
                {user?.email ? user.email.address : 'Wallet Only'}
              </span>
            </div>
          </div>
          
          <div className="flex justify-end pt-2">
             <a 
               href={`https://testnet.explorer.sapphire.oasis.dev/address/${wallet?.address}`}
               target="_blank"
               rel="noreferrer"
               className="text-xs text-[#ea580c] hover:underline flex items-center gap-1"
             >
               View on Oasis Explorer <ExternalLink className="w-3 h-3" />
             </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
