import { 
  MessageSquare, 
  Search as SearchIcon, 
  LayoutGrid, 
  Settings, 
  HelpCircle, 
  Plus,
  Trash2
} from 'lucide-react';
import { ChatSession } from '../types/chat';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuAction,
  SidebarFooter,
} from '@/components/ui/sidebar';
import { Card } from '@/components/ui/card';

interface ChatSidebarProps {
  sessions: ChatSession[];
  currentSessionId: string | null;
  onSelectSession: (sessionId: string) => void;
  onCreateSession: () => void;
  onDeleteSession: (sessionId: string) => void;
}

export const ChatSidebar = ({
  sessions,
  currentSessionId,
  onSelectSession,
  onCreateSession,
  onDeleteSession,
}: ChatSidebarProps) => {
  const handleDeleteSession = (e: React.MouseEvent, sessionId: string) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this chat?')) {
      onDeleteSession(sessionId);
    }
  };

  const navigationItems = [
    { name: 'Chats', icon: MessageSquare, active: true },
    { name: 'Search', icon: SearchIcon, active: false },
    { name: 'Categories', icon: LayoutGrid, active: false },
    { name: 'Settings', icon: Settings, active: false },
    { name: 'Updates & FAQ', icon: HelpCircle, active: false },
  ];

  return (
    <Sidebar collapsible="icon" className="bg-[#09090b] border-none" side="left" variant="sidebar">
      <SidebarHeader className="p-4 bg-[#09090b]">
        <div className="flex items-center gap-3 px-2 mb-6">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#f97316] to-[#ea580c] flex items-center justify-center flex-shrink-0">
            <svg viewBox="0 0 24 24" className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2a10 10 0 0 1 10 10c0 5.523-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2z" />
              <path d="M8 14s1.5 2 4 2 4-2 4-2" />
              <line x1="9" y1="9" x2="9.01" y2="9" />
              <line x1="15" y1="9" x2="15.01" y2="9" />
            </svg>
          </div>
          <span className="text-lg font-semibold text-white group-data-[collapsible=icon]:hidden tracking-tight">Chat GPT</span>
        </div>
        
        <SidebarMenu>
          {navigationItems.map((item) => (
            <SidebarMenuItem key={item.name}>
              <SidebarMenuButton
                className={`h-10 ${
                  item.active 
                    ? 'bg-zinc-800/50 text-white font-medium' 
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800/30'
                }`}
              >
                <item.icon className={item.active ? "text-[#f97316]" : "text-zinc-400"} />
                <span>{item.name}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent className="bg-[#09090b] px-2">
        <SidebarGroup className="group-data-[collapsible=icon]:hidden mt-6">
          <div className="px-2 mb-2 text-xs font-medium text-zinc-500 uppercase tracking-wider flex items-center justify-between">
            <span>Recent Chats</span>
            <Button
              variant="ghost"
              size="icon"
              onClick={onCreateSession}
              className="h-4 w-4 text-zinc-400 hover:text-white hover:bg-transparent p-0"
            >
              <Plus className="w-3.5 h-3.5" />
            </Button>
          </div>
          
          <SidebarGroupContent>
            <SidebarMenu>
              {sessions.slice(0, 5).map((session) => (
                <SidebarMenuItem key={session.id}>
                  <SidebarMenuButton
                    onClick={() => onSelectSession(session.id)}
                    isActive={currentSessionId === session.id}
                    className={`h-9 ${
                      currentSessionId === session.id 
                        ? 'bg-zinc-800/50 text-white' 
                        : 'text-zinc-400 hover:text-white hover:bg-zinc-800/30'
                    }`}
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span className="truncate text-sm">{session.title}</span>
                  </SidebarMenuButton>
                  <SidebarMenuAction
                    onClick={(e) => handleDeleteSession(e, session.id)}
                    showOnHover
                    className="hover:bg-red-900/30 hover:text-red-400"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </SidebarMenuAction>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 bg-[#09090b]">
        <div className="group-data-[collapsible=icon]:hidden space-y-4">
          <Card className="bg-[#18181b] border-zinc-800 p-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-16 h-16 bg-[#f97316]/10 blur-2xl rounded-full -mr-8 -mt-8"></div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 flex items-center justify-center">
                <svg viewBox="0 0 24 24" className="w-5 h-5 text-white" fill="currentColor">
                  <path d="M12 2l2.4 7.2h7.6l-6 4.8 2.4 7.2-6-4.8-6 4.8 2.4-7.2-6-4.8h7.6z"/>
                </svg>
              </div>
              <h3 className="font-semibold text-white text-sm">Upgrade to Pro</h3>
            </div>
            <p className="text-xs text-zinc-400 mb-3 leading-relaxed">
              Add experience the full benefit
            </p>
            <Button className="w-full bg-[#ea580c] hover:bg-[#c2410c] text-white text-xs font-medium h-8 rounded-md transition-colors">
              Upgrade Now
            </Button>
          </Card>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
};
