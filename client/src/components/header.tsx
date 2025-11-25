import { Calendar, Settings, Bell, Info, Home, LogOut, User } from 'lucide-react';
import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/useAuth';
import { useMutation } from '@tanstack/react-query';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface HeaderProps {
  onInfoClick?: () => void;
  showHomeButton?: boolean;
}

export default function Header({ onInfoClick, showHomeButton = false }: HeaderProps) {
  const [, setLocation] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();

  const logoutMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest('POST', '/api/auth/logout', {});
      if (!res.ok) throw new Error('Logout failed');
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      });
      window.location.href = '/';
    },
    onError: (error: Error) => {
      toast({
        title: "Logout failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <header className="py-4 px-3 text-center border-b border-border">
      <h1 className="font-serif text-3xl font-bold text-primary mb-2">SHUFFLE 7</h1>
      
      <div className="flex justify-center gap-2">
        {showHomeButton && (
          <button 
            onClick={() => setLocation('/')}
            className="flex flex-col items-center gap-1 px-3 py-2 rounded-xl bg-slate-800/30 border border-slate-700/30 hover:bg-slate-700/40 transition-all duration-200 hover:scale-105"
            data-testid="button-home"
          >
            <Home className="w-4 h-4 text-slate-300" />
            <span className="text-xs text-slate-400 font-medium">Home</span>
          </button>
        )}
        <button 
          className="flex flex-col items-center gap-1 px-3 py-2 rounded-xl bg-slate-800/30 border border-slate-700/30 hover:bg-slate-700/40 transition-all duration-200 hover:scale-105 relative"
          data-testid="button-notifications"
        >
          <Bell className="w-4 h-4 text-slate-300" />
          <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></div>
          <span className="text-xs text-slate-400 font-medium">Alerts</span>
        </button>
        <button 
          onClick={() => setLocation('/settings')}
          className="flex flex-col items-center gap-1 px-3 py-2 rounded-xl bg-slate-800/30 border border-slate-700/30 hover:bg-slate-700/40 transition-all duration-200 hover:scale-105"
          data-testid="button-settings"
        >
          <Settings className="w-4 h-4 text-slate-300" />
          <span className="text-xs text-slate-400 font-medium">Settings</span>
        </button>
        <button 
          onClick={onInfoClick}
          className="flex flex-col items-center gap-1 px-3 py-2 rounded-xl bg-slate-800/30 border border-slate-700/30 hover:bg-slate-700/40 transition-all duration-200 hover:scale-105"
          data-testid="button-info"
        >
          <Info className="w-4 h-4 text-slate-300" />
          <span className="text-xs text-slate-400 font-medium">Info</span>
        </button>

        {/* User Account Dropdown */}
        {isAuthenticated && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button 
                className="flex flex-col items-center gap-1 px-3 py-2 rounded-xl bg-primary/20 border border-primary/30 hover:bg-primary/30 transition-all duration-200 hover:scale-105"
                data-testid="button-user-menu"
              >
                <User className="w-4 h-4 text-primary" />
                <span className="text-xs text-primary font-medium">Account</span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <div className="px-2 py-1.5">
                <p className="text-sm font-medium text-foreground">
                  {user?.firstName || user?.email?.split('@')[0] || 'User'}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {user?.email}
                </p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => setLocation('/settings')}
                className="cursor-pointer"
                data-testid="menu-item-settings"
              >
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => logoutMutation.mutate()}
                disabled={logoutMutation.isPending}
                className="cursor-pointer text-destructive focus:text-destructive"
                data-testid="menu-item-logout"
              >
                <LogOut className="w-4 h-4 mr-2" />
                {logoutMutation.isPending ? 'Logging out...' : 'Log Out'}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </header>
  );
}
