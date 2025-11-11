import { useState } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { format, isToday, isYesterday, isThisWeek, isThisMonth } from 'date-fns';
import { ArrowLeft, Calendar, Star, Zap, X, ImageOff, Book } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card as UICard, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogClose,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import JournalModal from '@/components/JournalModal';
import { BannerAd } from '@/components/AdBox';
import type { DrawnCard } from '@shared/schema';
import type { Card } from '@/lib/cards';

interface DrawnCardsResponse {
  drawnCards: DrawnCard[];
}

const ITEMS_PER_PAGE = 20;

interface CardGroupProps {
  cards: DrawnCard[];
  groupTitle: string;
  onCardClick: (drawnCard: DrawnCard) => void;
  onJournalClick: (drawnCard: DrawnCard) => void;
}

function CardGroup({ cards, groupTitle, onCardClick, onJournalClick }: CardGroupProps) {
  if (cards.length === 0) return null;

  return (
    <div className="mb-8">
      <h3 className="text-lg font-semibold text-primary mb-4 flex items-center gap-2">
        <Calendar className="w-5 h-5" />
        {groupTitle}
      </h3>
      <div className="grid gap-4">
        {cards.map((drawnCard) => {
          const card = drawnCard.cardData as Card;
          const drawDate = new Date(drawnCard.drawnAt!);
          const drawTime = format(drawDate, 'h:mm a');
          
          return (
            <UICard 
              key={drawnCard.id} 
              className="overflow-hidden cursor-pointer hover:bg-muted/50 transition-colors" 
              data-testid={`card-drawn-${drawnCard.id}`}
              onClick={() => onCardClick(drawnCard)}
            >
              <CardContent className="p-0">
                <div className="flex">
                  <div className="w-20 h-24 bg-muted flex-shrink-0">
                    <img
                      src={card?.image || '/assets/shuffle7-card-back.svg'}
                      alt={card?.title || card?.message || 'Card'}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                  <div className="flex-1 p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-primary line-clamp-2" data-testid={`text-card-title-${drawnCard.id}`}>
                          {card?.title || card?.message || 'Untitled Card'}
                        </h4>
                        <p className="text-sm text-muted-foreground mt-1" data-testid={`text-card-category-${drawnCard.id}`}>
                          {card?.category || 'Uncategorized'}
                        </p>
                        <p className="text-xs text-muted-foreground mt-2" data-testid={`text-draw-time-${drawnCard.id}`}>
                          Drawn at {drawTime}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            onJournalClick(drawnCard);
                          }}
                          className="h-6 px-2 text-xs bg-amber-50 border-amber-300 hover:bg-amber-100 text-amber-700 hover:text-amber-800 dark:bg-amber-100/20 dark:border-amber-200 dark:hover:bg-amber-200/30 dark:text-amber-200 dark:hover:text-amber-100"
                          data-testid={`button-journal-${drawnCard.id}`}
                        >
                          <Book className="w-3 h-3 mr-1" />
                          Journal
                        </Button>
                        {drawnCard.cardType === 'lifeline' ? (
                          <div className="flex items-center gap-1 bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 px-2 py-1 rounded-full text-xs font-medium">
                            <Star className="w-3 h-3" />
                            Lifeline
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 bg-blue-500/20 text-blue-600 dark:text-blue-400 px-2 py-1 rounded-full text-xs font-medium">
                            <Zap className="w-3 h-3" />
                            Daily
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </UICard>
          );
        })}
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-8">
      {[1, 2, 3].map((i) => (
        <div key={i} className="space-y-4">
          <Skeleton className="h-6 w-32" />
          <div className="space-y-3">
            {[1, 2].map((j) => (
              <div key={j} className="flex gap-4">
                <Skeleton className="w-20 h-24 flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-3 w-1/4" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function groupCardsByDate(cards: DrawnCard[]): { [key: string]: DrawnCard[] } {
  const groups: { [key: string]: DrawnCard[] } = {};
  
  cards.forEach((card) => {
    const drawDate = new Date(card.drawnAt!);
    
    let groupKey: string;
    if (isToday(drawDate)) {
      groupKey = 'Today';
    } else if (isYesterday(drawDate)) {
      groupKey = 'Yesterday';
    } else if (isThisWeek(drawDate)) {
      groupKey = format(drawDate, 'EEEE'); // Day name
    } else if (isThisMonth(drawDate)) {
      groupKey = format(drawDate, 'EEEE, MMM d'); // Day name, Month Day
    } else {
      groupKey = format(drawDate, 'EEEE, MMM d, yyyy'); // Full date
    }
    
    if (!groups[groupKey]) {
      groups[groupKey] = [];
    }
    groups[groupKey].push(card);
  });
  
  return groups;
}

export default function MyCards() {
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState<'daily' | 'lifeline'>('daily');
  const [selectedCard, setSelectedCard] = useState<DrawnCard | null>(null);
  const [isCardModalOpen, setIsCardModalOpen] = useState(false);
  const [journalCard, setJournalCard] = useState<DrawnCard | null>(null);
  const [isJournalModalOpen, setIsJournalModalOpen] = useState(false);
  const [imageError, setImageError] = useState(false);

  const {
    data,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch
  } = useInfiniteQuery<DrawnCardsResponse>({
    queryKey: ['api', 'drawn-cards', activeTab],
    queryFn: ({ pageParam = 0 }) => {
      const page = pageParam as number;
      const params = new URLSearchParams({
        limit: ITEMS_PER_PAGE.toString(),
        offset: (page * ITEMS_PER_PAGE).toString(),
        cardType: activeTab
      });
      
      return fetch(`/api/drawn-cards?${params}`, {
        credentials: 'include'
      }).then(res => {
        if (!res.ok) {
          throw new Error(`${res.status}: ${res.statusText}`);
        }
        return res.json();
      });
    },
    getNextPageParam: (lastPage, allPages) => {
      return (lastPage as DrawnCardsResponse).drawnCards.length === ITEMS_PER_PAGE 
        ? allPages.length 
        : undefined;
    },
    initialPageParam: 0,
    retry: 1,
  });

  const handleTabChange = (tab: 'daily' | 'lifeline') => {
    setActiveTab(tab);
  };

  const handleLoadMore = () => {
    fetchNextPage();
  };

  const handleCardClick = (drawnCard: DrawnCard) => {
    setSelectedCard(drawnCard);
    setImageError(false);
    setIsCardModalOpen(true);
  };

  const handleJournalClick = (drawnCard: DrawnCard) => {
    setJournalCard(drawnCard);
    setIsJournalModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsCardModalOpen(false);
    setSelectedCard(null);
    setImageError(false);
  };

  const handleCloseJournalModal = () => {
    setIsJournalModalOpen(false);
    setJournalCard(null);
  };

  // Flatten all pages of drawn cards
  const allDrawnCards = data?.pages.flatMap(page => page.drawnCards) || [];
  const groupedCards = groupCardsByDate(allDrawnCards);
  const groupKeys = Object.keys(groupedCards).sort((a, b) => {
    // Sort groups by most recent first
    if (a === 'Today') return -1;
    if (b === 'Today') return 1;
    if (a === 'Yesterday') return -1;
    if (b === 'Yesterday') return 1;
    return 0;
  });

  return (
    <div className="min-h-screen px-4 py-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLocation('/')}
            className="p-2"
            data-testid="button-back-to-home"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="font-serif text-3xl font-bold text-primary">My Cards</h1>
        </div>

        {/* Filter Tabs */}
        <Tabs value={activeTab} onValueChange={(value) => handleTabChange(value as any)} className="mb-8">
          <TabsList className="grid w-full grid-cols-2" data-testid="tabs-card-filter">
            <TabsTrigger value="daily" data-testid="tab-daily-cards">Daily Draws</TabsTrigger>
            <TabsTrigger value="lifeline" data-testid="tab-lifeline-cards">Lifelines</TabsTrigger>
          </TabsList>


          <TabsContent value="daily" className="mt-6">
            <div data-testid="content-daily-cards">
              {isLoading && <LoadingSkeleton />}
              
              {error && (
                <Alert className="mb-6">
                  <AlertDescription>
                    Failed to load your daily cards. 
                    <Button 
                      variant="link" 
                      className="p-0 ml-1 h-auto" 
                      onClick={() => refetch()}
                      data-testid="button-retry-daily"
                    >
                      Try again
                    </Button>
                  </AlertDescription>
                </Alert>
              )}
              
              {!isLoading && !error && allDrawnCards.length === 0 && (
                <div className="text-center py-12" data-testid="empty-state-daily">
                  <Zap className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-primary mb-2">No daily cards yet</h3>
                  <p className="text-muted-foreground">Your daily card draws will appear here.</p>
                </div>
              )}
              
              {!isLoading && !error && allDrawnCards.length > 0 && (
                <>
                  {groupKeys.map((groupKey) => (
                    <CardGroup
                      key={groupKey}
                      groupTitle={groupKey}
                      cards={groupedCards[groupKey]}
                      onCardClick={handleCardClick}
                      onJournalClick={handleJournalClick}
                    />
                  ))}
                  
                  {/* Ad Placement 2: Banner Ad between card groups */}
                  <div className="my-8">
                    <BannerAd />
                  </div>
                  
                  {hasNextPage && (
                    <div className="text-center mt-8">
                      <Button 
                        onClick={handleLoadMore}
                        variant="outline"
                        disabled={isFetchingNextPage}
                        data-testid="button-load-more-daily"
                      >
                        {isFetchingNextPage ? 'Loading...' : 'Load More Daily Cards'}
                      </Button>
                    </div>
                  )}
                </>
              )}
            </div>
          </TabsContent>

          <TabsContent value="lifeline" className="mt-6">
            <div data-testid="content-lifeline-cards">
              {isLoading && <LoadingSkeleton />}
              
              {error && (
                <Alert className="mb-6">
                  <AlertDescription>
                    Failed to load your lifeline cards. 
                    <Button 
                      variant="link" 
                      className="p-0 ml-1 h-auto" 
                      onClick={() => refetch()}
                      data-testid="button-retry-lifeline"
                    >
                      Try again
                    </Button>
                  </AlertDescription>
                </Alert>
              )}
              
              {!isLoading && !error && allDrawnCards.length === 0 && (
                <div className="text-center py-12" data-testid="empty-state-lifeline">
                  <Star className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-primary mb-2">No lifeline cards yet</h3>
                  <p className="text-muted-foreground">Your lifeline card draws will appear here.</p>
                </div>
              )}
              
              {!isLoading && !error && allDrawnCards.length > 0 && (
                <>
                  {groupKeys.map((groupKey) => (
                    <CardGroup
                      key={groupKey}
                      groupTitle={groupKey}
                      cards={groupedCards[groupKey]}
                      onCardClick={handleCardClick}
                      onJournalClick={handleJournalClick}
                    />
                  ))}
                  
                  {hasNextPage && (
                    <div className="text-center mt-8">
                      <Button 
                        onClick={handleLoadMore}
                        variant="outline"
                        disabled={isFetchingNextPage}
                        data-testid="button-load-more-lifeline"
                      >
                        {isFetchingNextPage ? 'Loading...' : 'Load More Lifeline Cards'}
                      </Button>
                    </div>
                  )}
                </>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Card Expansion Modal */}
      <Dialog open={isCardModalOpen} onOpenChange={setIsCardModalOpen}>
        <DialogContent className="max-w-4xl w-[95vw] max-h-[95vh] overflow-y-auto" data-testid="modal-card-expansion">
          <DialogTitle className="sr-only">Expanded Card View</DialogTitle>
          <DialogDescription className="sr-only">Full details of your drawn card</DialogDescription>
          
          {selectedCard && (() => {
            const card = selectedCard.cardData as Card;
            const drawDate = new Date(selectedCard.drawnAt!);
            const formattedDate = format(drawDate, 'EEEE, MMM d, yyyy');
            const drawTime = format(drawDate, 'h:mm a');
            
            return (
              <div className="pt-6">
                {/* Card Image */}
                <div className="max-w-lg mx-auto mb-6 bg-muted rounded-lg p-4">
                  {!imageError ? (
                    <img
                      src={card?.image || '/assets/shuffle7-card-back.svg'}
                      alt={card?.title || card?.message || 'Card'}
                      className="w-full h-auto object-contain rounded"
                      onError={() => setImageError(true)}
                      data-testid="img-expanded-card"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground">
                      <ImageOff className="w-16 h-16 mb-4" />
                      <p className="text-center px-4" data-testid="text-image-fallback">
                        Image not available
                      </p>
                    </div>
                  )}
                </div>
                
                {/* Card Details */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between pt-4 border-t border-border">
                    <div>
                      <p className="text-sm text-muted-foreground" data-testid={`text-expanded-date-${selectedCard.id}`}>
                        {formattedDate} at {drawTime}
                      </p>
                    </div>
                    <div>
                      {selectedCard.cardType === 'lifeline' ? (
                        <div className="flex items-center gap-1 bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 px-3 py-1 rounded-full text-sm font-medium">
                          <Star className="w-4 h-4" />
                          Lifeline Draw
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 bg-blue-500/20 text-blue-600 dark:text-blue-400 px-3 py-1 rounded-full text-sm font-medium">
                          <Zap className="w-4 h-4" />
                          Daily Draw
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>
      
      {/* Journal Modal */}
      {journalCard && (
        <JournalModal
          open={isJournalModalOpen}
          onOpenChange={(open) => {
            setIsJournalModalOpen(open);
            if (!open) {
              setJournalCard(null);
            }
          }}
          drawnCard={journalCard}
        />
      )}
    </div>
  );
}