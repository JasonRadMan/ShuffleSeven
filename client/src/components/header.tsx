import { Calendar, Settings } from 'lucide-react';
import { useLocation } from 'wouter';

export default function Header() {
  const [, setLocation] = useLocation();

  return (
    <header className="relative py-6 px-4 text-center border-b border-border">
      <div className="absolute left-4 top-6">
        <button 
          onClick={() => setLocation('/about')}
          className="p-3 rounded-full bg-secondary border border-border hover:bg-muted transition-all"
          data-testid="button-schedule"
        >
          <Calendar className="w-6 h-6" />
          <div className="text-xs mt-1 text-muted-foreground">Schedule</div>
        </button>
      </div>
      
      <h1 className="font-serif text-4xl font-bold text-primary mb-2">SHUFFLE 7</h1>
      <p className="text-muted-foreground text-sm max-w-md mx-auto">
        For mindset support only. Not prophecy. Never harmful or selfish guidance.
      </p>
      
      <div className="absolute right-4 top-6">
        <button 
          onClick={() => setLocation('/settings')}
          className="p-3 rounded-full bg-secondary border border-border hover:bg-muted transition-all"
          data-testid="button-settings"
        >
          <Settings className="w-6 h-6" />
          <div className="text-xs mt-1 text-muted-foreground">Settings</div>
        </button>
      </div>
    </header>
  );
}
