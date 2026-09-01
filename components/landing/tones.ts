export type Tone = "terracotta" | "sage" | "plum" | "mustard";

type ToneStyle = {
  /** Icon / link foreground */
  text: string;
  /** 2px accent border used on notched tiles */
  border: string;
  /** Soft tint behind a notched tile */
  tint: string;
  /** Solid fill for meters and badges */
  fill: string;
};

/**
 * Tailwind needs literal class strings, so every tone is spelled out here and
 * looked up by key instead of being interpolated at the call site.
 */
export const toneStyles: Record<Tone, ToneStyle> = {
  terracotta: {
    text: "text-terracotta",
    border: "border-terracotta/45",
    tint: "bg-terracotta/10",
    fill: "bg-terracotta",
  },
  sage: {
    text: "text-sage",
    border: "border-sage/50",
    tint: "bg-sage/16",
    fill: "bg-sage",
  },
  plum: {
    text: "text-plum",
    border: "border-plum/40",
    tint: "bg-plum/10",
    fill: "bg-plum",
  },
  mustard: {
    text: "text-mustard",
    border: "border-mustard/55",
    tint: "bg-mustard/14",
    fill: "bg-mustard",
  },
};
