import {
  Dialog,
  DialogContent,
  DialogClose,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { X, ImageOff } from 'lucide-react';
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
  const [imageError, setImageError] = useState(false);

  const handleClose = () => {
    onClose();
    onOpenChange(false);
    // Reset animation and image error state
    setAnimationStage(0);
    setImageError(false);
  };

  const handleImageError = () => {
    setImageError(true);
  };

  // Reset image error when card changes
  useEffect(() => {
    setImageError(false);
  }, [card?.image]);

  // Coordinate the three-stage animation
  useEffect(() => {
    if (open) {
      setAnimationStage(0);
      setImageError(false); // Reset image error state when modal opens
      
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
      <DialogContent className="max-w-4xl w-[90vw] h-[90vh] mx-auto p-0 bg-background border-border">
        <DialogTitle className="sr-only">Card Revealed</DialogTitle>
        <DialogDescription className="sr-only">Your drawn card is now revealed with its message and guidance.</DialogDescription>
        
        <div className="relative revealed-card mystical-border w-full h-full" style={{ transformStyle: "preserve-3d" }}>
          {/* Card Back */}
          <motion.div 
            className="absolute inset-0 flex items-center justify-center"
            initial={{ opacity: 0, scale: 1 }}
            animate={{ 
              opacity: animationStage === 1 ? 1 : (animationStage >= 2 ? 0 : 0),
              rotateY: animationStage >= 2 ? 180 : 0,
              scale: 1
            }}
            transition={{ 
              opacity: { duration: 0.5, ease: "easeOut" },
              rotateY: { duration: 0.6, ease: "easeInOut" }
            }}
            style={{ transformStyle: "preserve-3d", backfaceVisibility: "hidden" }}
          >
            <div className="flex items-center justify-center w-full h-full">
              <img 
                src={cardBackImage} 
                alt="Card back design" 
                className="max-w-full max-h-full object-contain"
                data-testid="img-card-back"
              />
            </div>
          </motion.div>

          {/* Card Front - Only Image */}
          <motion.div 
            className="absolute inset-0 flex items-center justify-center"
            initial={{ opacity: 0, rotateY: 0, scale: 1 }}
            animate={{ 
              opacity: animationStage >= 2 ? 1 : 0,
              rotateY: 0,
              scale: animationStage >= 3 ? 1.02 : 1
            }}
            transition={{ 
              opacity: { duration: 0.4, ease: "easeOut", delay: animationStage >= 2 ? 0.3 : 0 },
              scale: { duration: 0.4, ease: "easeOut" }
            }}
            style={{ transformStyle: "preserve-3d" }}
            onClick={handleClose}
          >
            {!imageError ? (
              <img 
                src={card.image} 
                alt="Card inspiration image" 
                className="max-w-full max-h-full object-contain cursor-pointer"
                onError={handleImageError}
                data-testid="img-card-image"
              />
            ) : (
              <div 
                className="w-full h-full bg-muted flex flex-col items-center justify-center text-muted-foreground cursor-pointer"
                data-testid="status-image-unavailable"
              >
                <ImageOff className="w-16 h-16 mb-4" />
                <p className="text-lg text-center px-8" data-testid="text-image-fallback">
                  Image not available<br />
                  <span className="text-sm opacity-75">Content loads from your App Storage</span>
                </p>
              </div>
            )}
          </motion.div>
        </div>
      </DialogContent>
    </Dialog>
  );
}