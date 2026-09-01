/**
 * ApplyPilot mark: a paper plane built from hard-edged polygons on a 24px grid.
 * `crispEdges` keeps the diagonals stepped rather than antialiased.
 */
export default function PixelPlane({
  size = 30,
  className,
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      shapeRendering="crispEdges"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      {/* Upper wing */}
      <polygon points="22,2 2,10 9,12.5 22,2" fill="#9a5476" />
      {/* Lower wing, folded under */}
      <polygon points="9,12.5 22,2 13,22 9,12.5" fill="#5f3049" />
      {/* Fold highlight + trailing pixels */}
      <polygon points="9,12.5 22,2 11,15 9,12.5" fill="#7a4260" />
      <rect x="2" y="14" width="2" height="2" fill="#c96745" />
      <rect x="5" y="18" width="2" height="2" fill="#d5a340" />
    </svg>
  );
}
