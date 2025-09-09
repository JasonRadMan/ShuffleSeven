import {
  Dialog,
  DialogContent,
  DialogClose,
} from '@/components/ui/dialog';
import { X } from 'lucide-react';
import type { Card } from '@shared/schema';

interface CardRevealModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  card: Card | null;
  onClose: () => void;
}

export default function CardRevealModal({ open, onOpenChange, card, onClose }: CardRevealModalProps) {
  const handleClose = () => {
    onClose();
    onOpenChange(false);
  };

  if (!card) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md mx-auto p-0 bg-background border-border">
        <div className="revealed-card mystical-border p-6">
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