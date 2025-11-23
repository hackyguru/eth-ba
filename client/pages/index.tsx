import { useEffect, useState } from 'react';
import { useChat } from '../hooks/useChat';
import { ChatSidebar, ViewType } from '../components/ChatSidebar';
import { ChatInterface } from '../components/ChatInterface';
import { WalletView } from '../components/WalletView';
import { ProvidersView } from '../components/ProvidersView';
import { SettingsView } from '../components/SettingsView';
import { WakuStatus } from '../components/WakuStatus';
import { WalletConnectButton } from '../components/WalletConnectButton';
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [currentView, setCurrentView] = useState<ViewType>('chat');
  
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
    selectedProvider,
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
          currentView={currentView}
          onSelectView={setCurrentView}
        />
        
        <SidebarInset className="flex-1 flex flex-col min-w-0 h-full relative bg-[#09090b]">
          {/* Top Header Area */}
          <header className="h-16 flex items-center justify-between px-6 py-4 bg-[#09090b] z-10 flex-shrink-0">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="text-zinc-400 hover:text-white md:hidden" />
              <div className="flex items-center gap-2 text-white font-medium cursor-pointer hover:bg-zinc-800/50 px-2 py-1 rounded-md transition-colors">
                <span>{selectedProvider ? selectedProvider.model : 'Select Model'}</span>
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
              
              <WalletConnectButton />
            </div>
          </header>

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col min-h-0 bg-[#09090b] px-2 pb-4">
            {currentView === 'chat' && (
              <ChatInterface
                session={currentSession}
                messages={currentMessages}
                onSendMessage={sendMessage}
                isLoading={isLoading}
              />
            )}
            
            {currentView === 'wallet' && (
              <div className="flex-1 overflow-y-auto">
                <WalletView />
              </div>
            )}

            {currentView === 'providers' && (
              <div className="flex-1 overflow-y-auto">
                <ProvidersView />
              </div>
            )}

            {currentView === 'settings' && (
              <div className="flex-1 overflow-y-auto">
                <SettingsView />
              </div>
            )}
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
