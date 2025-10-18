import {
  Dialog,
  DialogContent,
  DialogClose,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { X, ImageOff } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import type { Card } from '@/lib/cards';
import cardBackImage from '@assets/card back_1757444079274.png';
import treasureFoundSfx from '@assets/Treasure_Found_SFX_2025-10-18T171602_1760808858694.mp3';

interface CardRevealModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  card: Card | null;
  onClose: () => void;
  isImagePreloaded: boolean;
}

export default function CardRevealModal({ open, onOpenChange, card, onClose, isImagePreloaded }: CardRevealModalProps) {
  const [animationStage, setAnimationStage] = useState(0); // 0: hidden, 1: fade in, 2: flip, 3: enlarge
  const [imageError, setImageError] = useState(false);
  const flipAudioRef = useRef<HTMLAudioElement | null>(null);

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

  // Coordinate the three-stage animation - now waits for image preload
  useEffect(() => {
    if (open) {
      setAnimationStage(0);
      setImageError(false); // Reset image error state when modal opens
      
      // Stage 1: Fade in card back (after 50ms)
      const fadeInTimer = setTimeout(() => {
        setAnimationStage(1);
      }, 50);
      
      return () => {
        clearTimeout(fadeInTimer);
      };
    }
  }, [open]);

  // Initialize audio on component mount
  useEffect(() => {
    flipAudioRef.current = new Audio(treasureFoundSfx);
    flipAudioRef.current.volume = 0.6;
    
    return () => {
      if (flipAudioRef.current) {
        flipAudioRef.current.pause();
        flipAudioRef.current = null;
      }
    };
  }, []);

  // Wait for image to preload before flipping to front
  useEffect(() => {
    if (open && animationStage === 1 && isImagePreloaded) {
      console.log('🎬 Image preloaded, starting flip animation');
      
      // Stage 2: Flip to front (after image is preloaded + small delay)
      const flipTimer = setTimeout(() => {
        setAnimationStage(2);
        
        // Play treasure found sound effect when card flips
        if (flipAudioRef.current) {
          flipAudioRef.current.currentTime = 0;
          flipAudioRef.current.play().catch((error) => {
            console.log('Audio playback failed:', error);
          });
        }
      }, 50); // Quick flip for responsive feel
      
      // Stage 3: Enlarge (600ms after flip)
      const enlargeTimer = setTimeout(() => {
        setAnimationStage(3);
      }, 900);
      
      return () => {
        clearTimeout(flipTimer);
        clearTimeout(enlargeTimer);
      };
    }
  }, [open, animationStage, isImagePreloaded]);

  if (!card) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl w-[90vw] h-[90vh] mx-auto p-0 bg-transparent border-none shadow-none">
        <DialogTitle className="sr-only">Card Revealed</DialogTitle>
        <DialogDescription className="sr-only">Your drawn card is now revealed with its message and guidance.</DialogDescription>
        
        <div className="relative w-full h-full" style={{ transformStyle: "preserve-3d" }}>
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