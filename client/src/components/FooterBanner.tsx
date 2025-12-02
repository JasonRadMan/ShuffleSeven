interface FooterBannerProps {
  className?: string;
}

export default function FooterBanner({ className = "" }: FooterBannerProps) {
  return (
    <div 
      className={`bg-gradient-to-r from-slate-800/60 via-slate-700/60 to-slate-800/60 border border-slate-600/40 rounded-xl p-3 sm:p-6 mx-2 sm:mx-4 mt-6 sm:mt-8 mb-4 ${className}`}
      data-testid="footer-banner"
    >
      <div className="flex items-center justify-center h-16 sm:h-24">
        <div className="text-center">
          <div className="text-slate-400 text-xs sm:text-sm font-medium mb-1">Advertisement</div>
          <div className="text-slate-300 text-base sm:text-xl font-semibold">
            Your Footer Ad Here
          </div>
          <div className="text-slate-500 text-[10px] sm:text-xs">
            <span className="sm:hidden">320x50 Banner</span>
            <span className="hidden sm:inline">728x90 Banner Space</span>
          </div>
        </div>
      </div>
    </div>
  );
}