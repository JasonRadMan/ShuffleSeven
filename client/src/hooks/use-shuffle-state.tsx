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
  setLastDrawnCategory,
  getLifelineUniqueRemaining,
  getUndrawnLifelineCardsThisMonth,
  addLifelineDrawn
} from '@/lib/storage';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useAuth } from '@/hooks/useAuth';

export interface ShuffleState {
  currentCard: Card | null;
  currentDrawnCardId: string | null;
  lifelinesRemaining: number;
  lifelineUniqueRemaining: number;
  hasDrawnToday: boolean;
  settings: Record<string, boolean>;
  cardsLoading: boolean;
  lifelineCardsLoading: boolean;
}

export function useShuffleState() {
  const [state, setState] = useState<ShuffleState>({
    currentCard: null,
    currentDrawnCardId: null,
    lifelinesRemaining: 5,
    lifelineUniqueRemaining: 0,
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
    onSuccess: (data) => {
      // Invalidate drawn cards cache so My Cards page updates
      queryClient.invalidateQueries({ queryKey: ['api', 'drawn-cards'] });
      
      // Store the drawn card ID for journal access
      if (data?.id) {
        setState(prev => ({
          ...prev,
          currentDrawnCardId: data.id
        }));
      }
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
      const lifelineUnique = getLifelineUniqueRemaining(loadedLifelineCards);
      const settings = getSettings();

      setState({
        currentCard: todaysDraw,
        currentDrawnCardId: null,
        lifelinesRemaining: lifelines,
        lifelineUniqueRemaining: lifelineUnique,
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
    // Check both lifeline counter and unique cards availability
    if (state.lifelinesRemaining <= 0 || state.lifelineUniqueRemaining <= 0 || state.lifelineCardsLoading || lifelineCards.length === 0) return null;

    // Get undrawn lifeline cards for this month
    const undrawnCards = getUndrawnLifelineCardsThisMonth(lifelineCards);
    
    if (undrawnCards.length === 0) {
      console.warn('No unique lifeline cards remaining this month');
      return null;
    }

    // Select from undrawn cards only
    const randomIndex = Math.floor(Math.random() * undrawnCards.length);
    const selectedCard = undrawnCards[randomIndex];
    
    // Only decrement counter after successful unique card selection
    const remaining = useLifeline();
    
    // Add selected card to drawn history
    addLifelineDrawn(selectedCard);
    
    // Update unique remaining count
    const lifelineUnique = getLifelineUniqueRemaining(lifelineCards);
    
    // Save to database for authenticated users
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
      lifelinesRemaining: remaining,
      lifelineUniqueRemaining: lifelineUnique
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
      currentCard: null,
      currentDrawnCardId: null
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
