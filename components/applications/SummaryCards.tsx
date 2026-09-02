import {
  CalendarCheck,
  ClipboardList,
  PieChart,
  Star,
  TrendingUp,
} from "lucide-react";
import PixelTile from "@/components/landing/PixelTile";
import type { Tone } from "@/components/landing/tones";
import type { ApplicationSummary } from "@/lib/applications/queries";

type Tile = {
  id: string;
  label: string;
  value: string;
  hint?: string;
  icon: typeof ClipboardList;
  tone: Tone;
};

/**
 * The five headline numbers, all computed in PostgreSQL.
 *
 * Response rate is `null` until something has actually been sent — showing
 * "0%" then would read as "nobody replied" rather than "nothing sent yet".
 */
export default function SummaryCards({ summary }: { summary: ApplicationSummary }) {
  const tiles: Tile[] = [
    {
      id: "total",
      label: "Total applications",
      value: String(summary.total),
      icon: ClipboardList,
      tone: "plum",
    },
    {
      id: "week",
      label: "Applied this week",
      value: String(summary.appliedThisWeek),
      icon: TrendingUp,
      tone: "sage",
    },
    {
      id: "interviews",
      label: "Interviews",
      value: String(summary.interviews),
      icon: CalendarCheck,
      tone: "terracotta",
    },
    {
      id: "offers",
      label: "Offers",
      value: String(summary.offers),
      icon: Star,
      tone: "mustard",
    },
    {
      id: "response",
      label: "Response rate",
      value: summary.responseRate === null ? "—" : `${summary.responseRate}%`,
      hint:
        summary.responseRate === null
          ? "No applications sent yet"
          : `${summary.respondedCount} of ${summary.sentCount} sent`,
      icon: PieChart,
      tone: "terracotta",
    },
  ];

  return (
    <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5 lg:gap-4">
      {tiles.map((tile) => (
        <li
          key={tile.id}
          className="rounded-[10px] border-2 border-line bg-surface p-3.5 shadow-pixel-xs sm:p-4"
        >
          <div className="flex items-start gap-3">
            <PixelTile
              icon={tile.icon}
              tone={tile.tone}
              className="size-9"
              iconSize={17}
            />
            <div className="min-w-0">
              <p className="text-[0.8125rem] leading-tight text-espresso/65">
                {tile.label}
              </p>
              <p className="mt-1 font-display text-[1.5rem] leading-none font-bold text-espresso tabular-nums">
                {tile.value}
              </p>
              {tile.hint && (
                <p className="mt-1 text-[0.6875rem] leading-tight text-espresso/50">
                  {tile.hint}
                </p>
              )}
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
