import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Wifi, WifiOff, Loader2, AlertCircle } from "lucide-react";

interface WakuStatusProps {
  isConnected: boolean;
  isConnecting: boolean;
  error?: string | null;
}

export const WakuStatus = ({ isConnected, isConnecting, error }: WakuStatusProps) => {
  if (error) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge variant="destructive" className="gap-1.5 py-1.5 cursor-help">
              <AlertCircle className="w-3.5 h-3.5" />
              Network Error
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p>{error}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  if (isConnecting) {
    return (
      <Badge variant="secondary" className="gap-1.5 py-1.5 bg-[#FF9D00]/10 text-[#FF9D00] border-[#FF9D00]/20 hover:bg-[#FF9D00]/20">
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
        Connecting...
      </Badge>
    );
  }

  if (isConnected) {
    return (
      <Badge variant="outline" className="gap-1.5 py-1.5 border-zinc-700 bg-[#27272a]">
        <div className="w-2 h-2 rounded-full shadow-[0_0_8px_rgba(37,99,235,0.5)] bg-[#2563EB]"></div>
        <span className="text-zinc-200">Connected</span>
      </Badge>
    );
  }

  return (
    <Badge variant="outline" className="gap-1.5 py-1.5 border-zinc-700 bg-[#27272a] text-zinc-400">
      <WifiOff className="w-3.5 h-3.5" />
      Disconnected
    </Badge>
  );
};
