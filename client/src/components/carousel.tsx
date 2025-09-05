import cardBackImage from '@/assets/shuffle7-card-back.png';
import drawAnimationGif from '@assets/SHuffle front page_1_1757096240479.gif';

interface CarouselProps {
  isAnimationPlaying?: boolean;
  onAnimationClick?: () => void;
}

export default function Carousel({ isAnimationPlaying = false, onAnimationClick }: CarouselProps) {
  return (
    <div className="carousel-container">
      <div className="static-card-background" data-testid="static-card-background">
        <img 
          src={cardBackImage} 
          alt="Shuffle 7 Card Back" 
          className="card-back-image"
        />
      </div>
      {isAnimationPlaying && (
        <div 
          className="animation-overlay cursor-pointer" 
          data-testid="animation-overlay"
          onClick={onAnimationClick}
        >
          <img 
            src={drawAnimationGif} 
            alt="Drawing animation - Click to reveal card" 
            className="draw-animation-gif"
          />
        </div>
      )}
    </div>
  );
}
