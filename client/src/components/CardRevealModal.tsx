import {
  Dialog,
  DialogContent,
  DialogClose,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { X, ImageOff, Share2, Download, Book } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import type { Card } from '@/lib/cards';
import type { DrawnCard } from '@shared/schema';
import cardBackImage from '@assets/card back_1757444079274.png';
import treasureFoundSfx from '@assets/Treasure_Found_SFX_2025-10-18T171602_1760808858694.mp3';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import JournalModal from '@/components/JournalModal';

interface CardRevealModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  card: Card | null;
  onClose: () => void;
  isImagePreloaded: boolean;
  drawnCardId?: string | null;
}

export default function CardRevealModal({ open, onOpenChange, card, onClose, isImagePreloaded, drawnCardId }: CardRevealModalProps) {
  const [animationStage, setAnimationStage] = useState(0); // 0: hidden, 1: fade in, 2: flip, 3: enlarge
  const [imageError, setImageError] = useState(false);
  const [isJournalModalOpen, setIsJournalModalOpen] = useState(false);
  const flipAudioRef = useRef<HTMLAudioElement | null>(null);
  const { toast } = useToast();

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

  const handleShare = async () => {
    if (!card) return;

    const shareData = {
      title: `Shuffle 7 - ${card.category}`,
      text: `${card.title}\n\n${card.message}`,
      url: window.location.href
    };

    // Check if Web Share API is supported
    if (navigator.share) {
      try {
        await navigator.share(shareData);
        toast({
          title: "Shared successfully",
          description: "Your card has been shared!",
        });
      } catch (err) {
        // User cancelled share, or share failed
        if ((err as Error).name !== 'AbortError') {
          console.error('Share failed:', err);
          handleFallbackShare(shareData);
        }
      }
    } else {
      handleFallbackShare(shareData);
    }
  };

  const handleFallbackShare = (shareData: { title: string; text: string; url: string }) => {
    // Fallback: Copy to clipboard
    const textToCopy = `${shareData.title}\n\n${shareData.text}\n\n${shareData.url}`;
    navigator.clipboard.writeText(textToCopy).then(() => {
      toast({
        title: "Copied to clipboard",
        description: "Card content copied! You can now share it with your contacts.",
      });
    }).catch(() => {
      toast({
        title: "Share not available",
        description: "Sharing is not supported on this device.",
        variant: "destructive",
      });
    });
  };

  const handleDownload = async () => {
    if (!card) return;

    try {
      // Fetch the image as a blob
      const response = await fetch(card.image);
      const blob = await response.blob();
      
      // Create a download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `shuffle7-${card.category.toLowerCase().replace(/\s+/g, '-')}-card.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      // Determine device type for instructions
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      
      toast({
        title: "Card saved! 📥",
        description: isMobile 
          ? "Go to Photos/Gallery → Select the image → Set as wallpaper or lock screen"
          : "Check Downloads folder → Right-click image → Set as desktop background",
        duration: 8000,
      });
    } catch (err) {
      console.error('Download failed:', err);
      toast({
        title: "Download failed",
        description: "Unable to download the card image.",
        variant: "destructive",
      });
    }
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
    <>
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl w-[90vw] h-[90vh] mx-auto p-4 bg-background/95 backdrop-blur-sm border border-primary/20 shadow-2xl">
        <DialogTitle className="sr-only">Card Revealed</DialogTitle>
        <DialogDescription className="sr-only">Your drawn card is now revealed with its message and guidance.</DialogDescription>
        
        {/* Simple Instructions - Always Visible */}
        <div className="text-center mb-3 pb-3 border-b border-primary/20">
          <p className="text-sm text-muted-foreground">
            💾 <strong>To save as wallpaper:</strong> Right-click image → Save → Set as background in your device settings
          </p>
        </div>

        {/* Card container with perspective - height limited to leave room for buttons */}
        <div className="relative flex-1 overflow-hidden" style={{ perspective: "2000px" }}>
            {/* Single rotating card wrapper */}
            <motion.div 
              className="relative w-full h-full"
              initial={{ opacity: 0, rotateY: 0 }}
              animate={{ 
                opacity: animationStage >= 1 ? 1 : 0,
                rotateY: animationStage >= 2 ? 180 : 0,
                scale: animationStage >= 3 ? 1.02 : 1
              }}
              transition={{ 
                opacity: { duration: 0.3, ease: "easeOut" },
                rotateY: { duration: 1.2, ease: "easeInOut" },
                scale: { duration: 0.4, ease: "easeOut" }
              }}
              style={{ transformStyle: "preserve-3d" }}
            >
            {/* Card Back - facing forward initially */}
            <div 
              className="absolute inset-0 flex items-center justify-center"
              style={{ 
                backfaceVisibility: "hidden",
                WebkitBackfaceVisibility: "hidden"
              }}
            >
              <img 
                src={cardBackImage} 
                alt="Card back design" 
                className="w-full h-full object-contain"
                data-testid="img-card-back"
              />
            </div>

            {/* Card Front - pre-rotated 180 degrees so it faces forward when wrapper rotates 180 */}
            <div 
              className="absolute inset-0 flex items-center justify-center cursor-pointer"
              style={{ 
                transform: "rotateY(180deg)",
                backfaceVisibility: "hidden",
                WebkitBackfaceVisibility: "hidden"
              }}
              onClick={handleClose}
            >
              {!imageError ? (
                <img 
                  src={card.image} 
                  alt="Card inspiration image" 
                  className="w-full h-full object-contain"
                  onError={handleImageError}
                  data-testid="img-card-image"
                />
              ) : (
                <div 
                  className="w-full h-full bg-muted flex flex-col items-center justify-center text-muted-foreground"
                  data-testid="status-image-unavailable"
                >
                  <ImageOff className="w-16 h-16 mb-4" />
                  <p className="text-lg text-center px-8" data-testid="text-image-fallback">
                    Image not available<br />
                    <span className="text-sm opacity-75">Content loads from your App Storage</span>
                  </p>
                </div>
              )}
            </div>
            </motion.div>
        </div>

        {/* Action Buttons - Fixed at bottom with high z-index */}
        {animationStage >= 2 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.5 }}
            className="relative z-50 flex justify-center gap-3 pt-4 mt-4 border-t border-primary/20"
          >
            <Button
              onClick={handleShare}
              className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg"
              data-testid="button-share-card"
            >
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
            {!imageError && (
              <Button
                onClick={handleDownload}
                className="bg-secondary hover:bg-secondary/90 text-secondary-foreground shadow-lg"
                data-testid="button-download-card"
              >
                <Download className="w-4 h-4 mr-2" />
                Save Image
              </Button>
            )}
            {drawnCardId && card && (
              <Button
                onClick={() => setIsJournalModalOpen(true)}
                className="bg-amber-600 hover:bg-amber-700 text-white shadow-lg"
                data-testid="button-journal-card"
              >
                <Book className="w-4 h-4 mr-2" />
                Journal
              </Button>
            )}
          </motion.div>
        )}
      </DialogContent>
    </Dialog>

    {/* Journal Modal */}
    {drawnCardId && card && (
      <JournalModal
        open={isJournalModalOpen}
        onOpenChange={setIsJournalModalOpen}
        drawnCard={{
          id: drawnCardId,
          cardData: card
        } as DrawnCard}
      />
    )}
  </>
  );
}