export default function Carousel() {
  return (
    <div className="carousel-container">
      <div className="static-card-background" data-testid="static-card-background">
        <img 
          src="/assets/shuffle7-card-back.svg" 
          alt="Shuffle 7 Card Back" 
          className="card-back-image"
        />
      </div>
    </div>
  );
}
