import PixelTile from "./PixelTile";
import type { Benefit } from "./content";

export default function BenefitItem({ benefit }: { benefit: Benefit }) {
  return (
    <li className="flex items-center gap-2.5">
      <span className="relative">
        <PixelTile
          icon={benefit.icon}
          tone={benefit.tone}
          className="size-11"
          surface
          iconSize={19}
        />
        {benefit.pulse && (
          <span
            aria-hidden="true"
            className="absolute -top-1 -right-1 size-2 bg-terracotta animate-pixel-pulse"
          />
        )}
      </span>
      <span className="text-[0.8125rem] leading-[1.35] text-espresso/85 sm:text-sm">
        {benefit.lines[0]}
        <br />
        {benefit.lines[1]}
      </span>
    </li>
  );
}
