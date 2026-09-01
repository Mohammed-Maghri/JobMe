import { ArrowRight } from "lucide-react";
import PixelTile from "./PixelTile";
import PixelSparkle from "./PixelSparkle";
import { toneStyles } from "./tones";
import type { Feature } from "./content";

export default function FeatureCard({ feature }: { feature: Feature }) {
  const tone = toneStyles[feature.tone];

  return (
    <div
      className={[
        "group relative flex h-full flex-col rounded-[10px] border-2 border-line bg-surface p-5 sm:p-6",
        "shadow-pixel-sm transition-[transform,box-shadow,border-color] duration-150 ease-out",
        "hover:-translate-x-[2px] hover:-translate-y-[2px] hover:border-line hover:shadow-pixel-lg",
        "has-[a:focus-visible]:-translate-x-[2px] has-[a:focus-visible]:-translate-y-[2px] has-[a:focus-visible]:shadow-pixel-lg",
        "has-[a:focus-visible]:outline-3 has-[a:focus-visible]:outline-offset-3 has-[a:focus-visible]:outline-plum",
      ].join(" ")}
    >
      <div className="flex flex-1 items-start gap-4">
        <PixelTile
          icon={feature.icon}
          tone={feature.tone}
          className="size-12"
          iconSize={22}
        />
        <div className="min-w-0 flex-1">
          <h3 className="text-card text-espresso">{feature.title}</h3>
          <p className="mt-2 text-[0.9375rem] leading-[1.55] text-espresso/70">
            {feature.description}
          </p>
        </div>
      </div>

      <div className="mt-5 flex items-end justify-between gap-3 pt-1">
        <a
          href={feature.href}
          className={`inline-flex min-h-11 items-center gap-1.5 rounded-[4px] font-display text-[0.9375rem] font-bold outline-none after:absolute after:inset-0 after:content-[''] ${tone.text}`}
        >
          {feature.linkLabel}
          <ArrowRight
            size={16}
            strokeWidth={2.4}
            aria-hidden="true"
            className="transition-transform duration-150 group-hover:translate-x-1"
          />
        </a>
        <PixelSparkle
          size={10}
          color="var(--color-mustard)"
          className="mb-3 opacity-70"
        />
      </div>
    </div>
  );
}
