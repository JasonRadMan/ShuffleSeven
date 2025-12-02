interface FooterBannerProps {
  className?: string;
}

export default function FooterBanner({ className = "" }: FooterBannerProps) {
  return (
    <div 
      className={`bg-gradient-to-r from-slate-800/60 via-slate-700/60 to-slate-800/60 border border-slate-600/40 rounded-xl p-6 mx-4 mt-8 mb-4 ${className}`}
      data-testid="footer-banner"
    >
      <div className="flex items-center justify-center h-24">
        <div className="text-center">
          <div className="text-slate-400 text-sm font-medium mb-1">Advertisement</div>
          <div className="text-slate-300 text-xl font-semibold">
            Your Footer Ad Here
          </div>
          <div className="text-slate-500 text-xs">728x90 Banner Space</div>
        </div>
      </div>
    </div>
  );
}