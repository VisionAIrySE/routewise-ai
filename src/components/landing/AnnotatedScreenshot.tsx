import appScreenshot from '@/assets/app-screenshot.png';

export function AnnotatedScreenshot() {
  return (
    <div className="relative inline-block">
      {/* Main screenshot container */}
      <div className="rounded-2xl border border-border bg-card p-4 shadow-xl">
        <div className="relative">
          <img 
            src={appScreenshot} 
            alt="Inspector Route AI app showing an optimized route" 
            className="rounded-lg max-w-3xl w-full"
          />
          
          {/* SVG Overlay for annotations */}
          <svg 
            className="absolute inset-0 w-full h-full pointer-events-none"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            {/* Optimized circle highlight - left side (map area) */}
            <ellipse
              cx="28"
              cy="55"
              rx="18"
              ry="25"
              fill="none"
              stroke="hsl(var(--primary))"
              strokeWidth="0.6"
              strokeDasharray="2 1"
              className="opacity-80"
            />
            
            {/* Prioritized bracket highlight - right side (list area) */}
            <path
              d="M 72 30 Q 65 50 72 75"
              fill="none"
              stroke="hsl(142 71% 45%)"
              strokeWidth="0.6"
              strokeLinecap="round"
              className="opacity-80"
            />
          </svg>
        </div>
      </div>
      
      {/* Annotation Labels - positioned outside the card */}
      {/* Optimized label - top left */}
      <div className="absolute -top-2 left-4 sm:left-8 transform -translate-y-full">
        <div className="flex items-center gap-2">
          <div className="flex flex-col items-start">
            <span className="text-xs sm:text-sm font-bold text-primary tracking-wide uppercase">
              Optimized
            </span>
            <span className="text-[10px] sm:text-xs text-muted-foreground">
              Clustered by proximity
            </span>
          </div>
          <svg className="w-6 h-8 sm:w-8 sm:h-10 text-primary" viewBox="0 0 32 40">
            <path
              d="M 16 0 Q 16 20 24 35"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <path
              d="M 20 30 L 24 35 L 18 34"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>
      
      {/* Prioritized label - top right */}
      <div className="absolute -top-2 right-4 sm:right-8 transform -translate-y-full">
        <div className="flex items-center gap-2">
          <svg className="w-6 h-8 sm:w-8 sm:h-10 text-green-500" viewBox="0 0 32 40">
            <path
              d="M 16 0 Q 16 20 8 35"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <path
              d="M 12 30 L 8 35 L 14 34"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <div className="flex flex-col items-end">
            <span className="text-xs sm:text-sm font-bold text-green-500 tracking-wide uppercase">
              Prioritized
            </span>
            <span className="text-[10px] sm:text-xs text-muted-foreground">
              Urgent deadlines first
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
