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
              <img 
                src="@assets/Screenshot 2025-09-05 at 1.15.01 PM_1757092520932.png" 
                alt="Shuffle 7 Card Back" 
                className="card-back-image"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
