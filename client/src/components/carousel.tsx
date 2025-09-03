import { useState, useEffect } from 'react';

export default function Carousel() {
  const [isPaused, setIsPaused] = useState(false);

  const togglePause = () => {
    setIsPaused(!isPaused);
  };

  return (
    <div className="carousel-container">
      <div 
        className={`carousel-ring ${isPaused ? 'paused' : ''}`}
        onClick={togglePause}
        data-testid="carousel-ring"
      >
        {Array.from({ length: 10 }, (_, i) => (
          <div key={i} className="card-panel" data-testid={`card-panel-${i}`}>
            <div className="card-back-design">
              7
            </div>
          </div>
        ))}
      </div>
      <p className="text-center text-muted-foreground text-sm mt-4">
        Tap the carousel to pause the rotation
      </p>
    </div>
  );
}
