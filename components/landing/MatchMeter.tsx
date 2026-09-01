type MatchMeterProps = {
  value: number;
  className?: string;
};

/**
 * Compact match readout for the job feed: a stepped bar plus the literal
 * percentage and a word for the band, so colour is never the only signal.
 */
export default function MatchMeter({ value, className = "" }: MatchMeterProps) {
  const band =
    value >= 90 ? "Strong" : value >= 80 ? "Good" : value >= 70 ? "Fair" : "Low";
  const fill =
    value >= 90 ? "bg-sage" : value >= 80 ? "bg-mustard" : "bg-terracotta";

  return (
    <div className={className}>
      <div className="flex items-baseline gap-1.5">
        <span className="font-display text-[0.9375rem] font-bold text-espresso">
          {value}%
        </span>
        <span className="text-[0.6875rem] font-semibold tracking-[0.06em] text-espresso/60 uppercase">
          {band} match
        </span>
      </div>
      <div
        className="pixel-notch-sm mt-1.5 h-2 w-full max-w-[132px] border border-line bg-stone"
        role="img"
        aria-label={`${value} percent match — ${band.toLowerCase()}`}
      >
        <div
          className={`h-full ${fill}`}
          style={{ width: `${Math.min(Math.max(value, 0), 100)}%` }}
        />
      </div>
    </div>
  );
}
