import { useLocation } from 'wouter';
import { useShuffleState } from '@/hooks/use-shuffle-state';

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

  return (
    <div className="min-h-screen px-4 py-8">
      <div className="max-w-md mx-auto">
        <h2 className="font-serif text-3xl font-bold text-primary text-center mb-8">SETTINGS</h2>
        
        <div className="space-y-6">
          <div className="flex items-center justify-between py-4 border-b border-border">
            <div>
              <h3 className="text-primary font-semibold">Daily Card Reminder</h3>
              <p className="text-muted-foreground text-sm">Get a reminder to draw your daily card</p>
            </div>
            <ToggleSwitch
              checked={settings.dailyReminder || false}
              onChange={(checked) => updateSetting('dailyReminder', checked)}
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
              onChange={(checked) => updateSetting('inspirationAlerts', checked)}
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
              onChange={(checked) => updateSetting('streakNotifications', checked)}
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
              onChange={(checked) => updateSetting('specialEvents', checked)}
              testId="toggle-special-events"
            />
          </div>
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
