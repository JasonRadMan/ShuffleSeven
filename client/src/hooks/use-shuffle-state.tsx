import { useState, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { loadCards, loadLifelineCards, Card } from '@/lib/cards';
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
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useAuth } from '@/hooks/useAuth';

export interface ShuffleState {
  currentCard: Card | null;
  lifelinesRemaining: number;
  hasDrawnToday: boolean;
  settings: Record<string, boolean>;
  cardsLoading: boolean;
  lifelineCardsLoading: boolean;
}

export function useShuffleState() {
  const [state, setState] = useState<ShuffleState>({
    currentCard: null,
    lifelinesRemaining: 5,
    hasDrawnToday: false,
    settings: {},
    cardsLoading: true,
    lifelineCardsLoading: true
  });

  const [cards, setCards] = useState<Card[]>([]);
  const [lifelineCards, setLifelineCards] = useState<Card[]>([]);
  const { isAuthenticated } = useAuth();

  // Mutation to save drawn cards to database
  const saveDrawnCardMutation = useMutation({
    mutationFn: async ({ cardType, cardId, cardData }: {
      cardType: 'daily' | 'lifeline';
      cardId: string;
      cardData: Card;
    }) => {
      const res = await apiRequest('POST', '/api/drawn-cards', {
        cardType,
        cardId,
        cardData
      });
      return await res.json();
    },
    onSuccess: () => {
      // Invalidate drawn cards cache so My Cards page updates
      queryClient.invalidateQueries({ queryKey: ['api', 'drawn-cards'] });
    },
    onError: (error: Error) => {
      // Log error but don't break user experience - localStorage is the fallback
      console.warn('Failed to save drawn card to database:', error.message);
    },
  });

  useEffect(() => {
    // Load initial state
    const initializeState = async () => {
      // Load daily cards and lifeline cards in parallel
      const [loadedCards, loadedLifelineCards] = await Promise.all([
        loadCards(),
        loadLifelineCards()
      ]);
      
      setCards(loadedCards);
      setLifelineCards(loadedLifelineCards);

      const todaysDraw = getTodaysDraw();
      const lifelines = getLifelinesRemaining();
      const settings = getSettings();

      setState({
        currentCard: todaysDraw,
        lifelinesRemaining: lifelines,
        hasDrawnToday: !!todaysDraw,
        settings,
        cardsLoading: false,
        lifelineCardsLoading: false
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
    
    // Update localStorage storage
    setTodaysDraw(selectedCard);
    addDrawnCard(selectedCard);
    setLastDrawnCategory(selectedCard.category);
    
    // Save to database for authenticated users
    if (isAuthenticated) {
      saveDrawnCardMutation.mutate({
        cardType: 'daily',
        cardId: `${selectedCard.category}-${Date.now()}`,
        cardData: selectedCard
      });
    }
    
    setState(prev => ({
      ...prev,
      currentCard: selectedCard,
      hasDrawnToday: true
    }));

    return selectedCard;
  };

  const useLifelineCard = () => {
    if (state.lifelinesRemaining <= 0 || state.lifelineCardsLoading || lifelineCards.length === 0) return null;

    // Use pure random selection from lifeline cards only (no smart selection, no deck tracking)
    const randomIndex = Math.floor(Math.random() * lifelineCards.length);
    const selectedCard = lifelineCards[randomIndex];
    const remaining = useLifeline();
    
    // Save to database for authenticated users (no localStorage side effects)
    if (isAuthenticated) {
      saveDrawnCardMutation.mutate({
        cardType: 'lifeline',
        cardId: `lifeline-${selectedCard.category}-${Date.now()}`,
        cardData: selectedCard
      });
    }
    
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
