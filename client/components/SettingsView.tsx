import { useChat } from '../hooks/useChat';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Trash2, Download, Shield } from 'lucide-react';

export const SettingsView = () => {
  const { clearHistory, sessions, currentMessages } = useChat();

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
        <p className="text-zinc-400 text-sm">Manage your preferences</p>
      </div>

      <div className="space-y-6">
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

