import { useLocation } from 'wouter';
import { useShuffleState } from '@/hooks/use-shuffle-state';

export default function CardReveal() {
  const [, setLocation] = useLocation();
  const { currentCard, clearCurrentCard } = useShuffleState();

  const handleBackToCarousel = () => {
    clearCurrentCard();
    setLocation('/');
  };

  if (!currentCard) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">No card to display</p>
          <button 
            onClick={() => setLocation('/')}
            className="py-3 px-6 bg-secondary text-secondary-foreground rounded-lg border border-border hover:bg-muted transition-all"
            data-testid="button-back-to-home"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-8">
      <div className="max-w-md mx-auto">
        <div className="revealed-card mystical-border p-6 mb-6">
          <div className="relative mb-4">
            <img 
              src={currentCard.image} 
              alt="Card inspiration image" 
              className="w-full h-48 object-cover rounded-lg mb-4"
              data-testid="img-card-image"
            />
            <div className="absolute top-4 right-4">
              <span 
                className="category-badge"
                data-testid="text-card-category"
              >
                {currentCard.category}
              </span>
            </div>
          </div>
          
          <div className="text-center space-y-4">
            {currentCard.title && (
              <h3 
                className="font-serif text-xl font-semibold text-primary"
                data-testid="text-card-title"
              >
                {currentCard.title}
              </h3>
            )}
            <p 
              className="text-foreground leading-relaxed"
              data-testid="text-card-message"
            >
              {currentCard.message}
            </p>
          </div>
        </div>

        <button 
          onClick={handleBackToCarousel}
          className="w-full py-3 px-6 bg-secondary text-secondary-foreground rounded-lg border border-border hover:bg-muted transition-all"
          data-testid="button-back-to-carousel"
        >
          Back to Carousel
        </button>
      </div>
    </div>
  );
}
