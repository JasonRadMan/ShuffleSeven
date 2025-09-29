interface AdBoxProps {
  className?: string;
}

export default function AdBox({ className = "" }: AdBoxProps) {
  return (
    <div 
      className={`bg-gradient-to-r from-slate-800/60 via-slate-700/60 to-slate-800/60 border border-slate-600/40 rounded-xl p-4 mx-4 mb-4 ${className}`}
      data-testid="adbox-banner"
    >
      <div className="flex items-center justify-center h-20">
        <div className="text-center">
          <div className="text-slate-400 text-sm font-medium mb-1">Advertisement</div>
          <div className="text-slate-300 text-lg font-semibold">
            Your Ad Here
          </div>
          <div className="text-slate-500 text-xs">728x90 Banner Space</div>
        </div>
      </div>
    </div>
  );
}