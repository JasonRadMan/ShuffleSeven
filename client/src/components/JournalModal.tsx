import { useState, useEffect } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import type { DrawnCard, JournalEntry } from '@shared/schema';
import type { Card } from '@/lib/cards';
import journalImage from '@assets/Journal card_1759163161823.png';

interface JournalModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  drawnCard: DrawnCard | null;
}

export default function JournalModal({ open, onOpenChange, drawnCard }: JournalModalProps) {
  const [content, setContent] = useState('');
  const [showJournalSide, setShowJournalSide] = useState(false);
  const { toast } = useToast();

  // Fetch existing journal entry for this card
  const { data: existingEntry } = useQuery<JournalEntry | null>({
    queryKey: ['journal-entry', drawnCard?.id],
    queryFn: async () => {
      if (!drawnCard?.id) return null;
      const response = await fetch(`/api/journal-entries/card/${drawnCard.id}`, {
        credentials: 'include'
      });
      if (response.status === 404) {
        return null; // No existing entry
      }
      if (!response.ok) {
        throw new Error('Failed to fetch journal entry');
      }
      return response.json();
    },
    enabled: open && !!drawnCard?.id,
  });

  // Create journal entry mutation
  const createMutation = useMutation({
    mutationFn: async ({ drawnCardId, userId, content }: { drawnCardId: string; userId: string; content: string }) => {
      const response = await apiRequest('POST', '/api/journal-entries', {
        drawnCardId,
        userId,
        content
      });
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['journal-entry', drawnCard?.id] });
      toast({
        title: "Journal entry saved",
        description: "Your thoughts have been saved to this card.",
      });
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Save failed",
        description: error.message || "Unable to save your journal entry.",
        variant: "destructive",
      });
    },
  });

  // Update journal entry mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, content }: { id: string; content: string }) => {
      const response = await apiRequest('PUT', `/api/journal-entries/${id}`, { content });
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['journal-entry', drawnCard?.id] });
      toast({
        title: "Journal entry updated",
        description: "Your thoughts have been updated.",
      });
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Update failed",
        description: error.message || "Unable to update your journal entry.",
        variant: "destructive",
      });
    },
  });

  // Initialize content when existing entry is loaded or modal opens
  useEffect(() => {
    if (open) {
      if (existingEntry?.content) {
        setContent(existingEntry.content);
        setShowJournalSide(true); // Show journal side if entry exists
      } else {
        setContent('');
        setShowJournalSide(false); // Show card side first if no entry
      }
    }
  }, [open, existingEntry]);

  // Handle journal button click (flip to journal side)
  const handleJournalClick = () => {
    setShowJournalSide(true);
    
    // Play celebratory sound effect
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Resume audio context if suspended (required by some browsers)
      if (audioContext.state === 'suspended') {
        audioContext.resume();
      }
      
      // Create a simple celebratory melody
      const playNote = (frequency: number, startTime: number, duration: number) => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = frequency;
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.3, startTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
        
        oscillator.start(startTime);
        oscillator.stop(startTime + duration);
      };
      
      // Play a celebratory sequence of notes (C-E-G chord)
      const now = audioContext.currentTime;
      playNote(523.25, now, 0.15); // C5
      playNote(659.25, now + 0.08, 0.15); // E5
      playNote(783.99, now + 0.16, 0.2); // G5
    } catch (error) {
      console.log('Audio playback not available:', error);
    }
  };

  // Handle save
  const handleSave = () => {
    if (!drawnCard) return;
    if (content.trim().length === 0) {
      toast({
        title: "Entry required",
        description: "Please write something in your journal entry.",
        variant: "destructive",
      });
      return;
    }

    if (existingEntry) {
      updateMutation.mutate({ id: existingEntry.id, content: content.trim() });
    } else {
      // For new entries, we need to get the userId - this should be available from auth context
      // For now, we'll let the backend handle the userId from the session
      createMutation.mutate({ 
        drawnCardId: drawnCard.id, 
        userId: '', // Backend will get this from the session
        content: content.trim() 
      });
    }
  };

  // Handle modal close
  const handleClose = () => {
    setShowJournalSide(false);
    setContent(existingEntry?.content || '');
    onOpenChange(false);
  };

  if (!drawnCard) return null;

  const card = drawnCard.cardData as Card;
  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl w-[95vw] max-h-[90vh] overflow-y-auto" data-testid="journal-modal">
        <DialogHeader>
          <DialogTitle className="sr-only">Journal Entry for {card?.title}</DialogTitle>
        </DialogHeader>

        <div className="relative w-full" style={{ perspective: '1000px', height: 'min(550px, calc(85vh - 60px))' }}>
          {/* Card flip container */}
          <motion.div
            className="relative w-full h-full"
            style={{ transformStyle: 'preserve-3d' }}
            animate={{ rotateY: showJournalSide ? 180 : 0 }}
            transition={{ duration: 0.6, ease: 'easeInOut' }}
          >
            {/* Card front (original card) */}
            <div
              className="absolute inset-0 w-full h-full rounded-lg shadow-lg"
              style={{ 
                backfaceVisibility: 'hidden',
                transform: 'rotateY(0deg)'
              }}
            >
              <div className="h-full bg-gradient-to-br from-slate-900 to-slate-800 rounded-lg p-6 flex flex-col">
                {/* Card image */}
                <div className="flex-1 flex items-center justify-center mb-6">
                  <img
                    src={card?.image || '/assets/shuffle7-card-back.svg'}
                    alt={card?.title || 'Card'}
                    className="max-w-full max-h-full object-contain rounded-lg"
                  />
                </div>
                
                {/* Card details */}
                <div className="space-y-4">
                  <h3 className="font-serif text-xl text-primary text-center">
                    {card?.title || card?.message}
                  </h3>
                  <p className="text-slate-300 text-sm text-center">
                    {card?.category}
                  </p>
                </div>

                {/* Journal button */}
                <div className="mt-6 text-center">
                  <Button
                    onClick={handleJournalClick}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-2"
                    data-testid="button-open-journal"
                  >
                    Journal
                  </Button>
                </div>
              </div>
            </div>

            {/* Journal back (journal interface) */}
            <div
              className="absolute inset-0 w-full h-full rounded-lg shadow-lg"
              style={{ 
                backfaceVisibility: 'hidden',
                transform: 'rotateY(180deg)'
              }}
            >
              <div 
                className="h-full rounded-lg relative overflow-hidden"
                style={{
                  backgroundImage: `url(${journalImage})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              >
                {/* Dark overlay for better text readability */}
                <div className="absolute inset-0 bg-black/40 rounded-lg" />
                
                {/* Journal content */}
                <div className="relative z-10 h-full p-8 flex flex-col">
                  {/* Journal header */}
                  <div className="text-center mb-2">
                    <h2 className="font-serif text-2xl text-amber-100 mb-2">Journal Entry</h2>
                  </div>

                  {/* Text area */}
                  <div className="flex-1 mb-6" style={{ width: 'calc(100% + 20px)', marginLeft: '-10px', marginTop: '60px' }}>
                    <Textarea
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      placeholder="Share your thoughts about this card..."
                      className="w-full h-full resize-none bg-transparent border-none text-amber-100 underline placeholder:text-amber-200/60 p-4 text-base leading-relaxed focus:outline-none focus:ring-0 focus:border-none"
                      maxLength={500}
                      data-testid="textarea-journal-content"
                    />
                  </div>

                  {/* Character count and actions */}
                  <div className="flex items-center justify-between">
                    <span className="text-amber-200 text-sm">
                      {content.length}/500 characters
                    </span>
                    
                    <div className="flex gap-3">
                      <Button
                        variant="outline"
                        onClick={handleClose}
                        disabled={isLoading}
                        className="bg-amber-100/20 border-amber-200/50 text-amber-100 hover:bg-amber-100/30"
                        data-testid="button-cancel-journal"
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleSave}
                        disabled={isLoading || content.trim().length === 0}
                        className="bg-amber-600 hover:bg-amber-700 text-white"
                        data-testid="button-save-journal"
                      >
                        {isLoading ? 'Saving...' : existingEntry ? 'Update Entry' : 'Save Entry'}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </DialogContent>
    </Dialog>
  );
}