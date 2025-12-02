import { X } from 'lucide-react';
import { useState, useEffect } from 'react';

interface AdBoxProps {
  variant?: 'banner' | 'card' | 'inline';
  position?: 'top' | 'middle' | 'bottom';
  onClose?: () => void;
  className?: string;
}

export default function AdBox({ variant = 'banner', position = 'middle', onClose, className = '' }: AdBoxProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [canClose, setCanClose] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setCanClose(true);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    if (canClose && onClose) {
      setIsVisible(false);
      onClose();
    }
  };

  if (!isVisible) return null;

  const variants = {
    banner: 'w-full h-20 flex items-center justify-center',
    card: 'w-full aspect-[2/1] flex flex-col items-center justify-center p-6',
    inline: 'w-full h-24 flex items-center justify-center',
  };

  return (
    <div 
      className={`relative bg-gradient-to-br from-slate-800/40 to-slate-900/60 border border-primary/20 rounded-lg backdrop-blur-sm ${variants[variant]} ${className}`}
      data-testid={`ad-box-${variant}`}
    >
      {/* Ad Label - Required by both stores */}
      <div className="absolute top-2 left-2 text-xs text-muted-foreground/60 font-medium">
        AD
      </div>

      {/* Close button - visible after 5 seconds per Google requirement */}
      <button
        onClick={handleClose}
        className={`absolute top-2 right-2 p-1.5 rounded-full bg-slate-900/80 hover:bg-slate-800 transition-all ${
          canClose ? 'opacity-100' : 'opacity-40 cursor-not-allowed'
        }`}
        disabled={!canClose}
        aria-label="Close advertisement"
        data-testid="button-close-ad"
      >
        <X className="w-4 h-4 text-muted-foreground" />
      </button>

      {/* Ad Content */}
      <div className="text-center px-8">
        {variant === 'card' ? (
          <div className="space-y-3">
            <div className="text-2xl">✨</div>
            <h3 className="text-sm font-semibold text-primary">
              Upgrade Your Journey
            </h3>
            <p className="text-xs text-muted-foreground">
              Premium features for deeper insights
            </p>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <div className="text-xl">🌟</div>
            <p className="text-sm text-primary font-medium">
              Discover Premium Features
            </p>
          </div>
        )}
      </div>

      {/* Timer indicator for close button */}
      {!canClose && (
        <div className="absolute bottom-2 right-2 text-xs text-muted-foreground/40">
          {5}s
        </div>
      )}
    </div>
  );
}

export function BannerAd({ onClose, className }: { onClose?: () => void; className?: string }) {
  return <AdBox variant="banner" onClose={onClose} className={className} />;
}

export function CardAd({ onClose, className }: { onClose?: () => void; className?: string }) {
  return <AdBox variant="card" onClose={onClose} className={className} />;
}

export function InlineAd({ onClose, className }: { onClose?: () => void; className?: string }) {
  return <AdBox variant="inline" onClose={onClose} className={className} />;
}