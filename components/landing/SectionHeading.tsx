import PixelSparkle from "./PixelSparkle";

type SectionHeadingProps = {
  id: string;
  eyebrow: string;
  title: string;
  description?: string;
  className?: string;
};

export default function SectionHeading({
  id,
  eyebrow,
  title,
  description,
  className = "",
}: SectionHeadingProps) {
  return (
    <div className={`max-w-[42rem] ${className}`}>
      <p className="flex items-center gap-2.5 font-display text-[0.75rem] font-bold tracking-[0.16em] text-plum uppercase sm:text-[0.8125rem]">
        <PixelSparkle size={12} color="var(--color-terracotta)" />
        {eyebrow}
      </p>
      <h2 id={id} className="mt-3 text-section text-balance text-espresso">
        {title}
      </h2>
      {description && (
        <p className="mt-4 max-w-[34rem] text-[1.0625rem] leading-[1.6] text-espresso/70">
          {description}
        </p>
      )}
    </div>
  );
}
