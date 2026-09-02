/** Shared, timezone-stable formatting for the dashboard. */

const DAY = 24 * 60 * 60 * 1000;

export function daysBetween(from: Date, to: Date): number {
  const a = Date.UTC(from.getFullYear(), from.getMonth(), from.getDate());
  const b = Date.UTC(to.getFullYear(), to.getMonth(), to.getDate());
  return Math.round((b - a) / DAY);
}

/** "2d ago", "3w ago", "today". */
export function relativePast(iso: string | null, now = new Date()): string | null {
  if (!iso) return null;
  const days = daysBetween(new Date(iso), now);
  if (days <= 0) return "today";
  if (days === 1) return "yesterday";
  if (days < 7) return `${days}d ago`;
  if (days < 31) return `${Math.floor(days / 7)}w ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

/** "in 5d", "tomorrow", "overdue". */
export function relativeFuture(
  iso: string | null,
  now = new Date(),
): { label: string; overdue: boolean } | null {
  if (!iso) return null;
  const days = daysBetween(now, new Date(iso));
  if (days < 0) return { label: "overdue", overdue: true };
  if (days === 0) return { label: "today", overdue: true };
  if (days === 1) return { label: "tomorrow", overdue: false };
  if (days < 7) return { label: `in ${days}d`, overdue: false };
  return { label: `in ${Math.floor(days / 7)}w`, overdue: false };
}

const DATE_FORMAT = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

export function formatDate(iso: string | null): string {
  return iso ? DATE_FORMAT.format(new Date(iso)) : "—";
}

/** Value for an `<input type="date">`. */
export function toDateInput(iso: string | null): string {
  if (!iso) return "";
  const date = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/** "Back Market" -> "B", "back-market.com" -> "B". Always 1–2 characters. */
export function initialsFor(company: string): string {
  const words = company
    .replace(/[^\p{L}\p{N}\s]+/gu, " ")
    .split(/\s+/)
    .filter(Boolean);
  if (words.length === 0) return "?";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}

const AVATAR_PALETTE = [
  "bg-plum text-surface",
  "bg-terracotta text-surface",
  "bg-sage text-surface",
  "bg-mustard text-espresso",
  "bg-espresso text-surface",
] as const;

/** Deterministic colour so a company keeps the same tile between renders. */
export function avatarPalette(company: string): string {
  let hash = 0;
  for (let i = 0; i < company.length; i += 1) {
    hash = (hash * 31 + company.charCodeAt(i)) >>> 0;
  }
  return AVATAR_PALETTE[hash % AVATAR_PALETTE.length];
}
