import { Calendar, Settings, Bell } from 'lucide-react';
import { useLocation } from 'wouter';

export default function Header() {
  const [, setLocation] = useLocation();

  return (
    <header className="py-4 px-3 text-center border-b border-border">
      <h1 className="font-serif text-3xl font-bold text-primary mb-2">SHUFFLE 7</h1>
      
      <div className="flex justify-center gap-2">
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
      </div>
    </header>
  );
}
