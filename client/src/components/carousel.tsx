import { useState } from 'react';
import cardBackImage from '@/assets/shuffle7-card-back.png';
import animationVideo from '@assets/front shuffle_1757095149315.mov';

export default function Carousel() {
  const [isPlaying, setIsPlaying] = useState(true);

  const handleClick = () => {
    setIsPlaying(false);
  };

  return (
    <div className="carousel-container">
      <div className="static-card-background" data-testid="static-card-background" onClick={handleClick}>
        {isPlaying ? (
          <video 
            src={animationVideo}
            className="card-back-image"
            autoPlay
            loop
            muted
            playsInline
          />
        ) : (
          <img 
            src={cardBackImage} 
            alt="Shuffle 7 Card Back" 
            className="card-back-image"
          />
        )}
      </div>
    </div>
  );
}
