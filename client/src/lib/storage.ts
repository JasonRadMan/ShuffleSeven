import { Card } from './cards';

const STORAGE_KEYS = {
  DAILY_DRAW: 'shuffle7_daily_draw',
  LIFELINES: 'shuffle7_lifelines',
  SETTINGS: 'shuffle7_settings',
  DRAWN_CARDS: 'shuffle7_drawn_cards',
  LAST_DRAWN_CATEGORY: 'shuffle7_last_drawn_category'
} as const;

interface DailyDraw {
  date: string;
  card: Card;
}

interface LifelineData {
  count: number;
  month: string;
}

interface DrawnCardsHistory {
  cards: string[]; // Array of unique identifiers for drawn cards
}

interface LastDrawnCategory {
  category: string;
  timestamp: number;
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

// Drawn Cards History Functions
function createCardId(card: Card): string {
  // Create a more robust unique ID to prevent collisions
  const titlePart = card.title?.toLowerCase().replace(/\s+/g, '-') || 'untitled';
  const messagePart = card.message.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 30);
  const categoryPart = card.category.toLowerCase().replace(/\s+/g, '-');
  
  // Create a simple hash of the full message for uniqueness
  let hash = 0;
  for (let i = 0; i < card.message.length; i++) {
    const char = card.message.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  return `${categoryPart}-${titlePart}-${messagePart}-${Math.abs(hash).toString(36)}`;
}

export function getDrawnCards(): string[] {
  const stored = localStorage.getItem(STORAGE_KEYS.DRAWN_CARDS);
  
  if (!stored) return [];
  
  try {
    const data: DrawnCardsHistory = JSON.parse(stored);
    return data.cards || [];
  } catch {
    return [];
  }
}

export function addDrawnCard(card: Card): void {
  const drawnCards = getDrawnCards();
  const cardId = createCardId(card);
  
  if (!drawnCards.includes(cardId)) {
    drawnCards.push(cardId);
    const data: DrawnCardsHistory = { cards: drawnCards };
    localStorage.setItem(STORAGE_KEYS.DRAWN_CARDS, JSON.stringify(data));
  }
}

export function isCardDrawn(card: Card): boolean {
  const drawnCards = getDrawnCards();
  const cardId = createCardId(card);
  return drawnCards.includes(cardId);
}

// Last Drawn Category Functions
export function getLastDrawnCategory(): string | null {
  const stored = localStorage.getItem(STORAGE_KEYS.LAST_DRAWN_CATEGORY);
  
  if (!stored) return null;
  
  try {
    const data: LastDrawnCategory = JSON.parse(stored);
    return data.category;
  } catch {
    return null;
  }
}

export function setLastDrawnCategory(category: string): void {
  const data: LastDrawnCategory = { 
    category, 
    timestamp: Date.now() 
  };
  localStorage.setItem(STORAGE_KEYS.LAST_DRAWN_CATEGORY, JSON.stringify(data));
}

// Deck Reset Functions
export function resetDrawnCards(): void {
  localStorage.removeItem(STORAGE_KEYS.DRAWN_CARDS);
}

export function getUndrawnCards(allCards: Card[]): Card[] {
  return allCards.filter(card => !isCardDrawn(card));
}

// Enhanced card filtering for smart selection
export function getAvailableCards(allCards: Card[]): Card[] {
  const lastCategory = getLastDrawnCategory();
  
  return allCards.filter(card => {
    // Skip cards that have been drawn before
    if (isCardDrawn(card)) return false;
    
    // Skip cards from same category as last drawn
    if (lastCategory && card.category.toLowerCase() === lastCategory.toLowerCase()) {
      return false;
    }
    
    return true;
  });
}

// Smart card selection with proper fallback logic
export function selectSmartCard(allCards: Card[]): { card: Card; deckReset: boolean } {
  // First try: get cards that are both undrawn and different category
  let availableCards = getAvailableCards(allCards);
  
  if (availableCards.length > 0) {
    const card = availableCards[Math.floor(Math.random() * availableCards.length)];
    return { card, deckReset: false };
  }
  
  // Second try: get undrawn cards (ignore category constraint)
  availableCards = getUndrawnCards(allCards);
  
  if (availableCards.length > 0) {
    const card = availableCards[Math.floor(Math.random() * availableCards.length)];
    return { card, deckReset: false };
  }
  
  // Last resort: reset the deck and select from all cards
  resetDrawnCards();
  
  // After reset, apply category constraint if possible
  const lastCategory = getLastDrawnCategory();
  if (lastCategory) {
    availableCards = allCards.filter(card => 
      card.category.toLowerCase() !== lastCategory.toLowerCase()
    );
  }
  
  // If no cards available with category constraint, use all cards
  if (availableCards.length === 0) {
    availableCards = allCards;
  }
  
  const card = availableCards[Math.floor(Math.random() * availableCards.length)];
  return { card, deckReset: true };
}
