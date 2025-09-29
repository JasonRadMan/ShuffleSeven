import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface InfoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function InfoModal({ open, onOpenChange }: InfoModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md mx-4" data-testid="info-modal">
        <DialogHeader className="text-center">
          <DialogTitle className="font-serif text-2xl text-primary mb-4">
            Welcome to Shuffle 7
          </DialogTitle>
        </DialogHeader>
        
        <div className="text-center space-y-4 text-foreground leading-relaxed">
          <p>
            We're here to give your day a little extra oomph.
          </p>
          <p>
            A spark of encouragement, a dash of humor, and a fresh way to see the world around you.
          </p>
          <p>
            This app is about moments—moments that inspire reflection, change, hope, and maybe even a smile when you need it most.
          </p>
          <p className="text-primary font-medium">
            Thanks for letting us be part of your journey.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}