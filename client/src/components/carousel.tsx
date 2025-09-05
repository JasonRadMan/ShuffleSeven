import cardBackImage from '@assets/Screenshot 2025-09-05 at 1.15.01 PM_1757092602755.png';

export default function Carousel() {
  return (
    <div className="carousel-container">
      <div className="static-card-background" data-testid="static-card-background">
        <img 
          src={cardBackImage} 
          alt="Shuffle 7 Card Back" 
          className="card-back-image"
        />
      </div>
    </div>
  );
}
