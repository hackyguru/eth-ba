import { useChat } from '../hooks/useChat';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Trash2, Download, User, Shield } from 'lucide-react';
import { useState } from 'react';

export const SettingsView = () => {
  const { userProfile, updateUserProfile, clearHistory, sessions, currentMessages } = useChat();
  const [name, setName] = useState(userProfile?.name || 'User');
  const [avatarUrl, setAvatarUrl] = useState(userProfile?.avatar || 'https://github.com/shadcn.png');

  const handleSaveProfile = () => {
    updateUserProfile({ name, avatar: avatarUrl });
  };

  const handleExportData = () => {
    const data = JSON.stringify({ sessions, messages: currentMessages }, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'privacy-ai-history.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleClearHistory = () => {
    if (confirm('Are you sure you want to delete all chat history? This cannot be undone.')) {
      clearHistory();
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 p-4">
      <div>
        <h2 className="text-2xl font-semibold text-white mb-2">Settings</h2>
        <p className="text-zinc-400 text-sm">Manage your profile and preferences</p>
      </div>

      <div className="space-y-6">
        {/* Profile Section */}
        <Card className="bg-[#18181b] border-zinc-800">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center">
                <User className="w-4 h-4 text-zinc-400" />
              </div>
              <div>
                <CardTitle className="text-lg text-white">Profile</CardTitle>
                <CardDescription className="text-zinc-500">Update your identity visible in chats</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-start gap-6">
              <Avatar className="w-20 h-20 border-2 border-zinc-800">
                <AvatarImage src={avatarUrl} />
                <AvatarFallback>{name.substring(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-4">
                <div className="grid w-full max-w-sm items-center gap-1.5">
                  <Label htmlFor="name" className="text-zinc-300">Display Name</Label>
                  <Input 
                    id="name" 
                    value={name} 
                    onChange={(e) => setName(e.target.value)}
                    className="bg-zinc-900 border-zinc-800 text-white focus:ring-orange-500 focus:border-orange-500"
                    placeholder="Enter your name"
                  />
                </div>
                <div className="grid w-full max-w-sm items-center gap-1.5">
                  <Label htmlFor="avatar" className="text-zinc-300">Avatar URL</Label>
                  <Input 
                    id="avatar" 
                    value={avatarUrl} 
                    onChange={(e) => setAvatarUrl(e.target.value)}
                    className="bg-zinc-900 border-zinc-800 text-white focus:ring-orange-500 focus:border-orange-500"
                    placeholder="https://..."
                  />
                </div>
                <Button 
                  onClick={handleSaveProfile}
                  className="bg-orange-600 hover:bg-orange-700 text-white"
                >
                  Save Changes
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Data Management Section */}
        <Card className="bg-[#18181b] border-zinc-800">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center">
                <Download className="w-4 h-4 text-zinc-400" />
              </div>
              <div>
                <CardTitle className="text-lg text-white">Data Management</CardTitle>
                <CardDescription className="text-zinc-500">Control your local data</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between py-2">
              <div>
                <h4 className="text-sm font-medium text-white">Export Chat History</h4>
                <p className="text-xs text-zinc-500 mt-1">Download a JSON copy of all your conversations.</p>
              </div>
              <Button 
                variant="outline" 
                onClick={handleExportData}
                className="border-zinc-700 text-zinc-300 hover:text-white hover:bg-zinc-800"
              >
                Export JSON
              </Button>
            </div>
            <Separator className="bg-zinc-800" />
            <div className="flex items-center justify-between py-2">
              <div>
                <h4 className="text-sm font-medium text-red-500">Delete All History</h4>
                <p className="text-xs text-zinc-500 mt-1">Permanently remove all chats from this device.</p>
              </div>
              <Button 
                variant="destructive" 
                onClick={handleClearHistory}
                className="bg-red-900/30 text-red-500 hover:bg-red-900/50 border border-red-900"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Clear All
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Security Placeholder */}
        <Card className="bg-[#18181b] border-zinc-800 opacity-50">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center">
                <Shield className="w-4 h-4 text-zinc-400" />
              </div>
              <div>
                <CardTitle className="text-lg text-white">Security Keys (Coming Soon)</CardTitle>
                <CardDescription className="text-zinc-500">Manage your ROFL encryption keys</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-zinc-500">
              End-to-end encryption settings will be available in the next update.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

