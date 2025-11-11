import { useLocation } from 'wouter';
import { useShuffleState } from '@/hooks/use-shuffle-state';
import { useNotifications } from '@/hooks/useNotifications';
import { useEffect } from 'react';
import { ArrowLeft, LogOut } from 'lucide-react';
import { CardAd } from '@/components/AdBox';
import { useMutation } from '@tanstack/react-query';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface ToggleSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  testId?: string;
}

function ToggleSwitch({ checked, onChange, testId }: ToggleSwitchProps) {
  return (
    <label className="toggle-switch" data-testid={testId}>
      <input 
        type="checkbox" 
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span className={`slider ${checked ? 'checked' : ''}`}></span>
    </label>
  );
}

export default function Settings() {
  const [, setLocation] = useLocation();
  const { settings, updateSetting } = useShuffleState();
  const { toast } = useToast();
  const { 
    permission, 
    isSubscribed, 
    loading, 
    requestPermission, 
    subscribeToPush, 
    unsubscribeFromPush, 
    sendTestNotification, 
    isSupported 
  } = useNotifications();

  // Logout mutation
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
      // Redirect to landing page
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

  // Handle notification permission changes
  const handleNotificationToggle = async (settingKey: string, checked: boolean) => {
    updateSetting(settingKey, checked);
    
    if (checked && permission !== 'granted') {
      const result = await requestPermission();
      if (result !== 'granted') {
        // Revert the setting if permission was denied
        updateSetting(settingKey, false);
        return;
      }
    }
    
    if (checked && permission === 'granted' && !isSubscribed) {
      await subscribeToPush();
    } else if (!checked && isSubscribed) {
      await unsubscribeFromPush();
    }
  };

  return (
    <div className="min-h-screen px-4 py-8">
      <div className="max-w-md mx-auto">
        {/* Header with back button */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => setLocation('/')}
            className="p-2 rounded-lg hover:bg-slate-700/40 transition-all"
            data-testid="button-back-to-home-top"
          >
            <ArrowLeft className="w-6 h-6 text-primary" />
          </button>
          <h2 className="font-serif text-3xl font-bold text-primary">SETTINGS</h2>
        </div>

        {/* Ad Placement 1: Card Ad at top of settings */}
        <div className="mb-8">
          <CardAd />
        </div>
        
        <div className="space-y-6">
          <div className="flex items-center justify-between py-4 border-b border-border">
            <div>
              <h3 className="text-primary font-semibold">Daily Card Reminder</h3>
              <p className="text-muted-foreground text-sm">Get a reminder to draw your daily card</p>
            </div>
            <ToggleSwitch
              checked={settings.dailyReminder || false}
              onChange={(checked) => handleNotificationToggle('dailyReminder', checked)}
              testId="toggle-daily-reminder"
            />
          </div>

          <div className="flex items-center justify-between py-4 border-b border-border">
            <div>
              <h3 className="text-primary font-semibold">Inspiration Feed Alerts</h3>
              <p className="text-muted-foreground text-sm">Notify when new inspiration is available</p>
            </div>
            <ToggleSwitch
              checked={settings.inspirationAlerts || false}
              onChange={(checked) => handleNotificationToggle('inspirationAlerts', checked)}
              testId="toggle-inspiration-alerts"
            />
          </div>

          <div className="flex items-center justify-between py-4 border-b border-border">
            <div>
              <h3 className="text-primary font-semibold">Weekly Deck Rotation Reminder</h3>
              <p className="text-muted-foreground text-sm">Remind when decks rotate</p>
            </div>
            <div className="w-8 h-8 bg-primary rounded-full" data-testid="indicator-weekly-rotation"></div>
          </div>

          <div className="flex items-center justify-between py-4 border-b border-border">
            <div>
              <h3 className="text-primary font-semibold">Streak & Achievement Notifications</h3>
              <p className="text-muted-foreground text-sm">Receive streak and reward alerts</p>
            </div>
            <ToggleSwitch
              checked={settings.streakNotifications || false}
              onChange={(checked) => handleNotificationToggle('streakNotifications', checked)}
              testId="toggle-streak-notifications"
            />
          </div>

          <div className="flex items-center justify-between py-4 border-b border-border">
            <div>
              <h3 className="text-primary font-semibold">Special Event/Seasonal Cards</h3>
              <p className="text-muted-foreground text-sm">Hear about limited-time cards</p>
            </div>
            <ToggleSwitch
              checked={settings.specialEvents || false}
              onChange={(checked) => handleNotificationToggle('specialEvents', checked)}
              testId="toggle-special-events"
            />
          </div>
        </div>

        {/* Notification Status Section */}
        <div className="mt-8 pt-6 border-t border-border">
          <h3 className="text-primary font-semibold text-center mb-4">NOTIFICATION PERMISSIONS</h3>
          
          {!isSupported && (
            <div className="text-center p-4 bg-muted/20 rounded-lg">
              <p className="text-muted-foreground text-sm">Push notifications are not supported on this device/browser.</p>
            </div>
          )}
          
          {isSupported && (
            <div className="space-y-4">
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-muted-foreground">Permission Status:</span>
                <span className={`text-sm font-semibold ${
                  permission === 'granted' ? 'text-green-400' : 
                  permission === 'denied' ? 'text-red-400' : 
                  'text-yellow-400'
                }`}>
                  {permission === 'granted' ? 'Granted' : 
                   permission === 'denied' ? 'Denied' : 
                   permission === 'default' ? 'Not Requested' : 'Unsupported'}
                </span>
              </div>
              
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-muted-foreground">Subscription Status:</span>
                <span className={`text-sm font-semibold ${isSubscribed ? 'text-green-400' : 'text-muted-foreground'}`}>
                  {isSubscribed ? 'Active' : 'Inactive'}
                </span>
              </div>
              
              {permission !== 'granted' && (
                <button 
                  onClick={requestPermission}
                  disabled={loading}
                  className="w-full py-3 px-6 bg-primary text-primary-foreground rounded-lg hover:bg-primary/80 transition-all disabled:opacity-50"
                  data-testid="button-request-permissions"
                >
                  {loading ? 'Requesting...' : 'Enable Notifications'}
                </button>
              )}
              
              {permission === 'granted' && (
                <button 
                  onClick={sendTestNotification}
                  className="w-full py-3 px-6 bg-accent text-accent-foreground rounded-lg hover:bg-accent/80 transition-all"
                  data-testid="button-test-notification"
                >
                  Send Test Notification
                </button>
              )}
            </div>
          )}
        </div>

        <div className="mt-8 pt-6 border-t border-border">
          <h3 className="text-primary font-semibold text-center mb-4">SLEEP MODE INTEGRATION</h3>
          <button 
            className="w-full py-4 px-6 bg-gradient-to-r from-primary/20 to-accent/20 text-primary border-2 border-primary rounded-lg hover:bg-gradient-to-r hover:from-primary/30 hover:to-accent/30 transition-all"
            data-testid="button-sleep-mode"
          >
            Set Shuffle 7 as Sleep Screen
          </button>
        </div>

        {/* Logout Section */}
        <div className="mt-8 pt-6 border-t border-border">
          <h3 className="text-primary font-semibold text-center mb-4">ACCOUNT</h3>
          <button 
            onClick={() => logoutMutation.mutate()}
            disabled={logoutMutation.isPending}
            className="w-full py-3 px-6 bg-destructive/10 text-destructive border border-destructive/30 rounded-lg hover:bg-destructive/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            data-testid="button-logout"
          >
            <LogOut className="w-4 h-4" />
            {logoutMutation.isPending ? 'Logging out...' : 'Log Out'}
          </button>
        </div>

        <div className="mt-8 text-center">
          <button 
            onClick={() => setLocation('/')}
            className="text-muted-foreground hover:text-primary transition-colors"
            data-testid="button-back-to-home"
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}
