import { Copy, Heart, Star, Users, User, History } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useLocation } from 'wouter';
import Header from '@/components/header';
import Carousel from '@/components/carousel';
import InviteFriendModal from '@/components/InviteFriendModal';
import { useShuffleState } from '@/hooks/use-shuffle-state';
import drawAnimationGif from '@assets/SHuffle front page_1_1757096240479.gif';
import shuffleAudio from '@assets/SHuffle front page_1757097826767.mp3';

export default function Home() {
  const [, setLocation] = useLocation();
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isDrawAnimationPlaying, setIsDrawAnimationPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const { drawDailyCard, useLifelineCard, lifelinesRemaining, hasDrawnToday } = useShuffleState();

  const handleDailyDraw = () => {
    const card = drawDailyCard();
    if (card) {
      setIsDrawAnimationPlaying(true);
      // Play shuffle audio when animation starts
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.volume = 0.7;
        audioRef.current.play()
          .then(() => {
            console.log('Audio playing successfully');
          })
          .catch((error) => {
            console.error('Audio playback failed:', error);
            // Try to enable audio with user interaction
            alert('Click OK to enable audio, then try drawing again');
          });
      }
    }
  };

  const handleAnimationClick = () => {
    // Stop audio when user clicks to proceed
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsDrawAnimationPlaying(false);
    setLocation('/card-reveal');
  };

  // Effect to handle audio looping
  useEffect(() => {
    const audio = audioRef.current;
    if (audio && isDrawAnimationPlaying) {
      audio.loop = true;
    }
    return () => {
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
      }
    };
  }, [isDrawAnimationPlaying]);

  const handleLifeline = () => {
    const card = useLifelineCard();
    if (card) {
      setLocation('/card-reveal');
    }
  };

  const handleReset = () => {
    localStorage.removeItem('shuffle7_daily_draw');
    window.location.reload();
  };

  return (
    <div className="min-h-screen">
      <Header />
      
      <main className="flex-1 px-4 py-8">
        <Carousel isAnimationPlaying={isDrawAnimationPlaying} onAnimationClick={handleAnimationClick} />

        <div className="max-w-md mx-auto space-y-4 mt-[60px]">
          <button 
            onClick={handleDailyDraw}
            disabled={hasDrawnToday}
            className={`w-full py-4 px-6 font-semibold rounded-full shadow-lg transform transition-all duration-300 border-[3px] ${
              hasDrawnToday 
                ? 'bg-amber-300 text-amber-800 border-amber-400 cursor-not-allowed'
                : 'bg-gradient-to-b from-amber-300 via-amber-400 to-amber-500 text-white border-amber-600 hover:shadow-xl hover:scale-105'
            }`}
            data-testid="button-draw-daily"
          >
            {hasDrawnToday ? 'TODAY\'S CARD DRAWN' : 'DRAW TODAY\'S CARD'}
          </button>

          <div className="grid grid-cols-2 gap-4">
            <button 
              className="py-1 px-6 bg-slate-800/50 text-white rounded-2xl border border-slate-700/50 hover:bg-slate-700/50 transition-all flex items-center justify-center gap-3 font-medium"
              data-testid="button-past-cards"
            >
              <History className="w-5 h-5" />
              My Cards
            </button>
            <button 
              onClick={() => setIsInviteModalOpen(true)}
              className="py-1 px-6 bg-slate-800/50 text-white rounded-2xl border border-slate-700/50 hover:bg-slate-700/50 transition-all flex items-center justify-center gap-3 font-medium"
              data-testid="button-invite-friend"
            >
              <Users className="w-5 h-5 text-cyan-400" />
              Invite + a Friend
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button 
              onClick={() => setLocation('/about')}
              className="py-1 px-6 bg-slate-800/50 text-white rounded-2xl border border-slate-700/50 hover:bg-slate-700/50 transition-all flex items-center justify-center gap-3 font-medium"
              data-testid="button-my-account"
            >
              <User className="w-5 h-5" />
              My Account
            </button>
            <button 
              onClick={handleLifeline}
              disabled={lifelinesRemaining <= 0}
              className={`py-1 px-6 rounded-2xl border transition-all flex items-center justify-center gap-3 font-medium ${
                lifelinesRemaining <= 0
                  ? 'bg-slate-800/30 text-slate-500 border-slate-700/30 cursor-not-allowed'
                  : 'bg-slate-800/50 text-white border-slate-700/50 hover:bg-slate-700/50'
              }`}
              data-testid="button-lifeline"
            >
              <Star className={`w-5 h-5 ${lifelinesRemaining <= 0 ? 'text-slate-500' : 'text-yellow-500'}`} />
              <span data-testid="text-lifelines-remaining">
                Lifeline
              </span>
            </button>
          </div>
          
          {/* Temporary reset button for testing */}
          <button 
            onClick={handleReset}
            className="w-full py-2 px-4 bg-red-600 text-white rounded-lg border-2 border-red-700 hover:bg-red-700 transition-all font-medium mt-4"
            data-testid="button-reset-test"
          >
            🔄 RESET FOR TESTING
          </button>
        </div>

      </main>

      {/* Audio element for shuffle sound */}
      <audio 
        ref={audioRef} 
        preload="auto"
        onLoadedData={() => console.log('Audio loaded successfully')}
        onError={(e) => console.error('Audio load error:', e)}
      >
        <source src={shuffleAudio} type="audio/mpeg" />
        Your browser does not support the audio element.
      </audio>

      <InviteFriendModal
        open={isInviteModalOpen}
        onOpenChange={setIsInviteModalOpen}
      />
    </div>
  );
}
