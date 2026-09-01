import type { LucideIcon } from "lucide-react";
import { toneStyles, type Tone } from "./tones";

type PixelTileProps = {
  icon: LucideIcon;
  tone: Tone;
  /** Size / layout classes only — the background is chosen by `surface`. */
  className?: string;
  iconSize?: number;
  strokeWidth?: number;
  /** Use the cream surface instead of the tone tint (for tiles on stone). */
  surface?: boolean;
};

/**
 * Square icon holder with stepped corners and a fine 2px accent border — the
 * repeating pixel motif across benefits, features, pipeline stages and steps.
 */
export default function PixelTile({
  icon: Icon,
  tone,
  className = "size-11",
  iconSize = 20,
  strokeWidth = 1.9,
  surface = false,
}: PixelTileProps) {
  const styles = toneStyles[tone];
  const background = surface ? "bg-surface" : styles.tint;

  return (
    <span
      className={`pixel-notch-sm inline-flex shrink-0 items-center justify-center border-2 ${styles.border} ${background} ${className}`}
    >
      <Icon
        size={iconSize}
        strokeWidth={strokeWidth}
        className={styles.text}
        aria-hidden="true"
      />
    </span>
  );
}
