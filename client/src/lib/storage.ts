import { Card } from './cards';

const STORAGE_KEYS = {
  DAILY_DRAW: 'shuffle7_daily_draw',
  LIFELINES: 'shuffle7_lifelines',
  SETTINGS: 'shuffle7_settings'
} as const;

interface DailyDraw {
  date: string;
  card: Card;
}

interface LifelineData {
  count: number;
  month: string;
}

// Daily Draw Functions
export function getTodaysDraw(): Card | null {
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  const stored = localStorage.getItem(STORAGE_KEYS.DAILY_DRAW);
  
  if (!stored) return null;
  
  try {
    const data: DailyDraw = JSON.parse(stored);
    return data.date === today ? data.card : null;
  } catch {
    return null;
  }
}

export function setTodaysDraw(card: Card): void {
  const today = new Date().toISOString().split('T')[0];
  const data: DailyDraw = { date: today, card };
  localStorage.setItem(STORAGE_KEYS.DAILY_DRAW, JSON.stringify(data));
}

// Lifeline Functions
export function getLifelinesRemaining(): number {
  const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
  const stored = localStorage.getItem(STORAGE_KEYS.LIFELINES);
  
  if (!stored) return 5;
  
  try {
    const data: LifelineData = JSON.parse(stored);
    // Reset if new month
    if (data.month !== currentMonth) {
      return 5;
    }
    return Math.max(0, data.count);
  } catch {
    return 5;
  }
}

export function useLifeline(): number {
  const currentMonth = new Date().toISOString().slice(0, 7);
  const remaining = getLifelinesRemaining();
  
  if (remaining <= 0) return 0;
  
  const newCount = remaining - 1;
  const data: LifelineData = { count: newCount, month: currentMonth };
  localStorage.setItem(STORAGE_KEYS.LIFELINES, JSON.stringify(data));
  
  return newCount;
}

// Settings Functions
export function getSettings(): Record<string, boolean> {
  const stored = localStorage.getItem(STORAGE_KEYS.SETTINGS);
  
  if (!stored) {
    return {
      dailyReminder: true,
      inspirationAlerts: false,
      weeklyRotation: true,
      streakNotifications: false,
      specialEvents: true
    };
  }
  
  try {
    return JSON.parse(stored);
  } catch {
    return {
      dailyReminder: true,
      inspirationAlerts: false,
      weeklyRotation: true,
      streakNotifications: false,
      specialEvents: true
    };
  }
}

export function updateSettings(key: string, value: boolean): Record<string, boolean> {
  const settings = getSettings();
  settings[key] = value;
  localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  return settings;
}
