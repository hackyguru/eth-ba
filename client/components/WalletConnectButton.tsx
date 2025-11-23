import { usePrivy, useWallets } from '@privy-io/react-auth';
import { Button } from '@/components/ui/button';
import { Wallet, Loader2, LogOut } from 'lucide-react';
import { formatEther } from 'viem';
import { useState, useEffect } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const WalletConnectButton = () => {
  const { login, logout, authenticated, ready, user } = usePrivy();
  const { wallets } = useWallets();
  const [balance, setBalance] = useState<string | null>(null);
  
  const wallet = wallets[0];

  useEffect(() => {
    const fetchBalance = async () => {
      if (wallet && authenticated) {
        try {
          // Check if on Oasis Sapphire Testnet (23295)
          if (wallet.chainId !== 'eip155:23295') {
            try {
              await wallet.switchChain(23295);
            } catch (e) {
              console.warn('Failed to switch chain automatically', e);
            }
          }
          
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

  if (!ready) {
    return (
      <Button variant="outline" disabled className="bg-zinc-900 border-zinc-800 text-zinc-500 h-9 gap-2">
        <Loader2 className="w-4 h-4 animate-spin" />
        Loading...
      </Button>
    );
  }

  if (!authenticated) {
    return (
      <Button 
        onClick={login}
        className="bg-[#ea580c] hover:bg-[#c2410c] text-white h-9 gap-2 font-medium border-0"
      >
        <Wallet className="w-4 h-4" />
        Connect Wallet
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          className="bg-zinc-900 hover:bg-zinc-800 border-zinc-700 text-white h-9 gap-3 font-medium min-w-[140px]"
        >
          <div className="w-2 h-2 rounded-full bg-[#00ffa3] animate-pulse shadow-[0_0_8px_rgba(0,255,163,0.5)]"></div>
          <span className="truncate max-w-[100px]">
            {balance ? `${parseFloat(balance).toFixed(3)} TEST` : 'Connected'}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64 bg-[#18181b] border-zinc-800 text-zinc-200">
        <DropdownMenuLabel>
          <span className="text-xs text-zinc-500 uppercase tracking-wider">Connected Wallet</span>
        </DropdownMenuLabel>
        <div className="px-2 py-2 bg-zinc-900/50 mx-1 rounded mb-2 border border-zinc-800">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-mono text-zinc-400 truncate max-w-[140px]">
              {wallet?.address}
            </span>
            <div className="text-[10px] text-[#00ffa3] bg-[#00ffa3]/10 px-1.5 py-0.5 rounded">Sapphire</div>
          </div>
          {user?.email && (
            <div className="text-xs text-zinc-500 truncate border-t border-zinc-800 mt-1 pt-1">
              {user.email.address}
            </div>
          )}
        </div>
        <DropdownMenuSeparator className="bg-zinc-800" />
        <DropdownMenuItem 
          className="text-red-400 focus:text-red-400 focus:bg-red-900/20 cursor-pointer gap-2"
          onClick={logout}
        >
          <LogOut className="w-4 h-4" />
          Disconnect
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

