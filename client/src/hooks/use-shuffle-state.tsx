import { useState, useEffect } from 'react';
import { loadCards, Card } from '@/lib/cards';
import { 
  getTodaysDraw, 
  setTodaysDraw, 
  getLifelinesRemaining, 
  useLifeline, 
  getSettings, 
  updateSettings 
} from '@/lib/storage';

export interface ShuffleState {
  currentCard: Card | null;
  lifelinesRemaining: number;
  hasDrawnToday: boolean;
  settings: Record<string, boolean>;
}

export function useShuffleState() {
  const [state, setState] = useState<ShuffleState>({
    currentCard: null,
    lifelinesRemaining: 5,
    hasDrawnToday: false,
    settings: {}
  });

  const [cards, setCards] = useState<Card[]>([]);

  useEffect(() => {
    // Load initial state
    const initializeState = async () => {
      const loadedCards = await loadCards();
      setCards(loadedCards);

      const todaysDraw = getTodaysDraw();
      const lifelines = getLifelinesRemaining();
      const settings = getSettings();

      setState({
        currentCard: todaysDraw,
        lifelinesRemaining: lifelines,
        hasDrawnToday: !!todaysDraw,
        settings
      });
    };

    initializeState();
  }, []);

  const drawDailyCard = () => {
    if (state.hasDrawnToday) return null;

    const randomCard = cards[Math.floor(Math.random() * cards.length)];
    setTodaysDraw(randomCard);
    
    setState(prev => ({
      ...prev,
      currentCard: randomCard,
      hasDrawnToday: true
    }));

    return randomCard;
  };

  const useLifelineCard = () => {
    if (state.lifelinesRemaining <= 0) return null;

    const randomCard = cards[Math.floor(Math.random() * cards.length)];
    const remaining = useLifeline();
    
    setState(prev => ({
      ...prev,
      currentCard: randomCard,
      lifelinesRemaining: remaining
    }));

    return randomCard;
  };

  const updateSetting = (key: string, value: boolean) => {
    const newSettings = updateSettings(key, value);
    setState(prev => ({
      ...prev,
      settings: newSettings
    }));
  };

  const clearCurrentCard = () => {
    setState(prev => ({
      ...prev,
      currentCard: null
    }));
  };

  return {
    ...state,
    drawDailyCard,
    useLifelineCard,
    updateSetting,
    clearCurrentCard
  };
}
