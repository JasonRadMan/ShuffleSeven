import { useState, useEffect } from 'react';
import { loadCards, Card } from '@/lib/cards';
import { 
  getTodaysDraw, 
  setTodaysDraw, 
  getLifelinesRemaining, 
  useLifeline, 
  getSettings, 
  updateSettings,
  selectSmartCard,
  addDrawnCard,
  setLastDrawnCategory
} from '@/lib/storage';

export interface ShuffleState {
  currentCard: Card | null;
  lifelinesRemaining: number;
  hasDrawnToday: boolean;
  settings: Record<string, boolean>;
  cardsLoading: boolean;
}

export function useShuffleState() {
  const [state, setState] = useState<ShuffleState>({
    currentCard: null,
    lifelinesRemaining: 5,
    hasDrawnToday: false,
    settings: {},
    cardsLoading: true
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
        settings,
        cardsLoading: false
      });
    };

    initializeState();
  }, []);

  const drawDailyCard = () => {
    if (state.hasDrawnToday || state.cardsLoading || cards.length === 0) return null;

    // Use smart card selection with proper fallback logic
    const { card: selectedCard, deckReset } = selectSmartCard(cards);
    
    if (deckReset) {
      console.info('Deck was reset - all cards are now available again');
    }
    
    // Update storage
    setTodaysDraw(selectedCard);
    addDrawnCard(selectedCard);
    setLastDrawnCategory(selectedCard.category);
    
    setState(prev => ({
      ...prev,
      currentCard: selectedCard,
      hasDrawnToday: true
    }));

    return selectedCard;
  };

  const useLifelineCard = () => {
    if (state.lifelinesRemaining <= 0 || state.cardsLoading || cards.length === 0) return null;

    // Use smart card selection for lifelines too
    const { card: selectedCard, deckReset } = selectSmartCard(cards);
    const remaining = useLifeline();
    
    if (deckReset) {
      console.info('Deck was reset during lifeline draw - all cards are now available again');
    }
    
    // Track the lifeline card draw (but don't update today's draw storage)
    addDrawnCard(selectedCard);
    setLastDrawnCategory(selectedCard.category);
    
    setState(prev => ({
      ...prev,
      currentCard: selectedCard,
      lifelinesRemaining: remaining
    }));

    return selectedCard;
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
