import { Copy, Heart, Star, Users } from 'lucide-react';
import { useLocation } from 'wouter';
import Header from '@/components/header';
import Carousel from '@/components/carousel';
import { useShuffleState } from '@/hooks/use-shuffle-state';

export default function Home() {
  const [, setLocation] = useLocation();
  const { drawDailyCard, useLifelineCard, lifelinesRemaining, hasDrawnToday } = useShuffleState();

  const handleDailyDraw = () => {
    const card = drawDailyCard();
    if (card) {
      setLocation('/card-reveal');
    }
  };

  const handleLifeline = () => {
    const card = useLifelineCard();
    if (card) {
      setLocation('/card-reveal');
    }
  };

  return (
    <div className="min-h-screen">
      <Header />
      
      <main className="flex-1 px-4 py-8">
        <Carousel />

        <div className="max-w-md mx-auto space-y-4">
          <button 
            onClick={handleDailyDraw}
            disabled={hasDrawnToday}
            className={`w-full py-4 px-6 font-semibold rounded-lg shadow-lg transform transition-all duration-300 border-2 ${
              hasDrawnToday 
                ? 'bg-muted text-muted-foreground border-border cursor-not-allowed'
                : 'bg-gradient-to-r from-primary to-accent text-primary-foreground border-primary hover:shadow-xl hover:scale-105'
            }`}
            data-testid="button-draw-daily"
          >
            {hasDrawnToday ? 'TODAY\'S CARD DRAWN' : 'DRAW TODAY\'S CARD'}
          </button>

          <div className="grid grid-cols-2 gap-4">
            <button 
              className="py-3 px-4 bg-secondary text-secondary-foreground rounded-lg border border-border hover:bg-muted transition-all flex items-center justify-center gap-2"
              data-testid="button-browse-decks"
            >
              <Copy className="w-5 h-5" />
              Browse Decks
            </button>
            <button 
              className="py-3 px-4 bg-secondary text-secondary-foreground rounded-lg border border-border hover:bg-muted transition-all flex items-center justify-center gap-2"
              data-testid="button-invite-friend"
            >
              <Users className="w-5 h-5" />
              Invite + a Friend
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button 
              className="py-3 px-4 bg-secondary text-secondary-foreground rounded-lg border border-border hover:bg-muted transition-all flex items-center justify-center gap-2"
              data-testid="button-like"
            >
              <Heart className="w-5 h-5" />
              Invite a Friend
            </button>
            <button 
              onClick={handleLifeline}
              disabled={lifelinesRemaining <= 0}
              className={`py-3 px-4 rounded-lg border transition-all flex items-center justify-center gap-2 font-semibold ${
                lifelinesRemaining <= 0
                  ? 'bg-muted text-muted-foreground border-border cursor-not-allowed'
                  : 'bg-gradient-to-r from-accent/80 to-primary/80 text-primary-foreground border-primary hover:from-accent hover:to-primary'
              }`}
              data-testid="button-lifeline"
            >
              <Star className="w-5 h-5" />
              <span data-testid="text-lifelines-remaining">
                Lifeline ({lifelinesRemaining} left)
              </span>
            </button>
          </div>
        </div>

        <div className="text-center mt-8 px-4">
          <p className="text-muted-foreground text-sm italic">
            Believe in yourself and all that you are.
          </p>
        </div>
      </main>
    </div>
  );
}
