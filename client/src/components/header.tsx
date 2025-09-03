import { Calendar, Settings, Bell } from 'lucide-react';
import { useLocation } from 'wouter';

export default function Header() {
  const [, setLocation] = useLocation();

  return (
    <header className="py-4 px-3 text-center border-b border-border">
      <h1 className="font-serif text-3xl font-bold text-primary mb-2">SHUFFLE 7</h1>
      <p className="text-muted-foreground text-xs max-w-xs mx-auto px-2 mb-4">
        For mindset support only. Not prophecy. Never harmful or selfish guidance.
      </p>
      
      <div className="flex justify-center gap-4">
        <button 
          onClick={() => setLocation('/about')}
          className="p-2 rounded-full bg-secondary border border-border hover:bg-muted transition-all"
          data-testid="button-schedule"
        >
          <Calendar className="w-4 h-4" />
          <div className="text-xs mt-1 text-muted-foreground">Schedule</div>
        </button>
        <button 
          className="p-2 rounded-full bg-secondary border border-border hover:bg-muted transition-all relative"
          data-testid="button-notifications"
        >
          <Bell className="w-4 h-4" />
          <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-accent rounded-full"></div>
          <div className="text-xs mt-1 text-muted-foreground">Alerts</div>
        </button>
        <button 
          onClick={() => setLocation('/settings')}
          className="p-2 rounded-full bg-secondary border border-border hover:bg-muted transition-all"
          data-testid="button-settings"
        >
          <Settings className="w-4 h-4" />
          <div className="text-xs mt-1 text-muted-foreground">Settings</div>
        </button>
      </div>
    </header>
  );
}
