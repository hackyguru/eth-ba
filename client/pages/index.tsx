import { useEffect, useState } from 'react';
import { useChat } from '../hooks/useChat';
import { ChatSidebar } from '../components/ChatSidebar';
import { ChatInterface } from '../components/ChatInterface';
import { WakuStatus } from '../components/WakuStatus';
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const {
    sessions,
    currentSession,
    currentMessages,
    isLoading,
    createNewSession,
    selectSession,
    deleteSession,
    sendMessage,
    wakuConnected,
    wakuConnecting,
    wakuError,
  } = useChat();

  // Handle client-side mounting and session creation
  useEffect(() => {
    setMounted(true);
    if (sessions.length === 0) {
      createNewSession();
    }
  }, [sessions.length, createNewSession]);

  if (!mounted) {
    return (
      <div className="h-screen flex bg-[#09090b] overflow-hidden p-4 gap-4">
        <div className="w-64 h-full hidden md:block space-y-4">
          <Skeleton className="h-12 w-full rounded-xl bg-zinc-800" />
          <Skeleton className="h-[calc(100%-4rem)] w-full rounded-xl bg-zinc-800" />
        </div>
        <div className="flex-1 h-full space-y-4">
          <Skeleton className="h-16 w-full rounded-xl bg-zinc-800" />
          <Skeleton className="h-[calc(100%-5rem)] w-full rounded-xl bg-zinc-800" />
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex h-screen w-full overflow-hidden bg-[#09090b]">
        <ChatSidebar
          sessions={sessions}
          currentSessionId={currentSession?.id || null}
          onSelectSession={selectSession}
          onCreateSession={createNewSession}
          onDeleteSession={deleteSession}
        />
        
        <SidebarInset className="flex-1 flex flex-col min-w-0 h-full relative bg-[#09090b]">
          {/* Top Header Area */}
          <header className="h-16 flex items-center justify-between px-6 py-4 bg-[#09090b] z-10 flex-shrink-0">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="text-zinc-400 hover:text-white md:hidden" />
              <div className="flex items-center gap-2 text-white font-medium cursor-pointer hover:bg-zinc-800/50 px-2 py-1 rounded-md transition-colors">
                <span>Version 2.1</span>
                <svg className="w-4 h-4 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <WakuStatus
                isConnected={wakuConnected}
                isConnecting={wakuConnecting}
                error={wakuError}
              />
              
              <Button 
                variant="outline" 
                className="bg-white hover:bg-zinc-200 text-black border-0 h-9 gap-2 font-medium hidden md:flex"
              >
                <Download className="w-4 h-4" />
                Export
              </Button>
            </div>
          </header>

          {/* Main Chat Content */}
          <div className="flex-1 flex flex-col min-h-0 bg-[#09090b] px-2 pb-4">
            <ChatInterface
              session={currentSession}
              messages={currentMessages}
              onSendMessage={sendMessage}
              isLoading={isLoading}
            />
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
