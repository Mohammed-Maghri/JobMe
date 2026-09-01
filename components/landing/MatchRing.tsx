type MatchRingProps = {
  value: number;
  size?: number;
  strokeWidth?: number;
};

/**
 * Circular match indicator used on the hero status card. The value is always
 * printed inside the ring, so the reading never depends on the arc alone.
 */
export default function MatchRing({
  value,
  size = 62,
  strokeWidth = 6,
}: MatchRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const dash = (Math.min(Math.max(value, 0), 100) / 100) * circumference;

  return (
    <span
      className="relative inline-flex shrink-0 items-center justify-center"
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} aria-hidden="true" focusable="false">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--color-line)"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--color-sage)"
          strokeWidth={strokeWidth}
          strokeLinecap="butt"
          strokeDasharray={`${dash} ${circumference - dash}`}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      <span className="absolute inset-0 flex flex-col items-center justify-center leading-none">
        <span className="font-display text-[0.9375rem] font-bold text-espresso">
          {value}%
        </span>
        <span className="mt-[2px] text-[0.5rem] font-semibold tracking-[0.08em] text-espresso/60">
          match
        </span>
      </span>
    </span>
  );
}
