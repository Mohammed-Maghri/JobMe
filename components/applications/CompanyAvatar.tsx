import Image from "next/image";
import { avatarPalette, initialsFor } from "./format";

/**
 * Company logo when one is known, otherwise generated initials on a colour
 * derived from the name so the tile is stable across renders.
 */
export default function CompanyAvatar({
  companyName,
  logoUrl,
  size = 36,
}: {
  companyName: string;
  logoUrl?: string | null;
  size?: number;
}) {
  if (logoUrl) {
    return (
      <span
        className="pixel-notch-sm relative shrink-0 overflow-hidden border-2 border-line bg-stone"
        style={{ width: size, height: size }}
      >
        <Image
          src={logoUrl}
          alt=""
          fill
          sizes={`${size}px`}
          className="object-contain"
          unoptimized
        />
      </span>
    );
  }

  return (
    <span
      aria-hidden="true"
      className={`pixel-notch-sm inline-flex shrink-0 items-center justify-center font-display font-bold ${avatarPalette(companyName)}`}
      style={{ width: size, height: size, fontSize: Math.round(size * 0.4) }}
    >
      {initialsFor(companyName)}
    </span>
  );
}
