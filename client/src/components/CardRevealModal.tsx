import {
  Dialog,
  DialogContent,
  DialogClose,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { X } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import type { Card } from '@/lib/cards';
import cardBackImage from '@assets/card back_1757444079274.png';

interface CardRevealModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  card: Card | null;
  onClose: () => void;
}

export default function CardRevealModal({ open, onOpenChange, card, onClose }: CardRevealModalProps) {
  const [animationStage, setAnimationStage] = useState(0); // 0: hidden, 1: fade in, 2: flip, 3: enlarge

  const handleClose = () => {
    onClose();
    onOpenChange(false);
    // Reset animation
    setAnimationStage(0);
  };

  // Coordinate the three-stage animation
  useEffect(() => {
    if (open) {
      setAnimationStage(0);
      
      // Stage 1: Fade in card back (after 200ms)
      const fadeInTimer = setTimeout(() => {
        setAnimationStage(1);
      }, 200);
      
      // Stage 2: Flip to front (after 1000ms total)
      const flipTimer = setTimeout(() => {
        setAnimationStage(2);
      }, 1000);
      
      // Stage 3: Enlarge (after 1600ms total)
      const enlargeTimer = setTimeout(() => {
        setAnimationStage(3);
      }, 1600);
      
      return () => {
        clearTimeout(fadeInTimer);
        clearTimeout(flipTimer);
        clearTimeout(enlargeTimer);
      };
    }
  }, [open]);

  if (!card) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md mx-auto p-0 bg-background border-border">
        <DialogTitle className="sr-only">Card Revealed</DialogTitle>
        <DialogDescription className="sr-only">Your drawn card is now revealed with its message and guidance.</DialogDescription>
        
        <div className="relative revealed-card mystical-border min-h-[400px]" style={{ transformStyle: "preserve-3d" }}>
          {/* Card Back */}
          <motion.div 
            className="absolute inset-0 p-6 flex flex-col justify-center backface-hidden"
            initial={{ opacity: 0, rotateY: 0, scale: 0.8 }}
            animate={{ 
              opacity: animationStage >= 1 ? 1 : 0,
              rotateY: animationStage >= 2 ? 180 : 0,
              scale: animationStage >= 1 ? 1 : 0.8
            }}
            transition={{ 
              opacity: { duration: 0.5, ease: "easeOut" },
              rotateY: { duration: 0.6, ease: "easeInOut" },
              scale: { duration: 0.3 }
            }}
            style={{ transformStyle: "preserve-3d", backfaceVisibility: "hidden" }}
          >
            <div className="flex items-center justify-center">
              <img 
                src={cardBackImage} 
                alt="Card back design" 
                className="w-full max-w-[280px] h-auto object-contain"
                data-testid="img-card-back"
              />
            </div>
          </motion.div>

          {/* Card Front */}
          <motion.div 
            className="absolute inset-0 p-6 flex flex-col justify-center backface-hidden"
            initial={{ opacity: 0, rotateY: -180, scale: 0.8 }}
            animate={{ 
              opacity: animationStage >= 2 ? 1 : 0,
              rotateY: animationStage >= 2 ? 0 : -180,
              scale: animationStage >= 3 ? 1.05 : 0.9
            }}
            transition={{ 
              opacity: { duration: 0.3, ease: "easeOut" },
              rotateY: { duration: 0.6, ease: "easeInOut" },
              scale: { duration: 0.4, ease: "easeOut" }
            }}
            style={{ transformStyle: "preserve-3d", backfaceVisibility: "hidden" }}
          >
            <div className="relative mb-4">
              <img 
                src={card.image} 
                alt="Card inspiration image" 
                className="w-full h-48 object-cover rounded-lg mb-4"
                data-testid="img-card-image"
              />
              <div className="absolute top-4 right-4">
                <span 
                  className="category-badge"
                  data-testid="text-card-category"
                >
                  {card.category}
                </span>
              </div>
            </div>
            
            <div className="text-center space-y-4">
              {card.title && (
                <h3 
                  className="font-serif text-xl font-semibold text-primary"
                  data-testid="text-card-title"
                >
                  {card.title}
                </h3>
              )}
              <p 
                className="text-foreground leading-relaxed"
                data-testid="text-card-message"
              >
                {card.message}
              </p>
            </div>
          </motion.div>
        </div>

        <div className="p-6 pt-0">
          <button 
            onClick={handleClose}
            className="w-full py-3 px-6 bg-secondary text-secondary-foreground rounded-lg border border-border hover:bg-muted transition-all"
            data-testid="button-close-modal"
          >
            Close
          </button>
        </div>

        <DialogClose asChild>
          <button 
            className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none z-10"
            data-testid="button-close-x"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </button>
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
}