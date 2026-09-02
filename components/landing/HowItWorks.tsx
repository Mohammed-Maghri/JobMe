import PixelTile from "./PixelTile";
import Reveal from "./Reveal";
import SectionHeading from "./SectionHeading";
import { STEPS } from "./content";
import { CONTAINER } from "./layout";

export default function HowItWorks() {
  return (
    <section
      id="how-it-works"
      aria-labelledby="how-it-works-heading"
      className="border-t-2 border-line/70 bg-surface py-14 sm:py-16 lg:py-20"
    >
      <div className={CONTAINER}>
        <Reveal>
          <SectionHeading
            id="how-it-works-heading"
            eyebrow="How it works"
            title="Four steps, then it keeps itself tidy."
            description="Add a role once, then move it along as things happen. Every application, interview and follow-up stays in the same place."
          />
        </Reveal>

        <ol className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:mt-12 lg:grid-cols-4 lg:gap-6">
          {STEPS.map((step, index) => (
            <Reveal
              as="li"
              key={step.id}
              delay={index * 0.06}
              className="relative h-full"
            >
              {/* Dotted rule linking the steps on the widest layout only. */}
              {index < STEPS.length - 1 && (
                <span
                  aria-hidden="true"
                  className="pixel-dotted absolute top-[2.0625rem] -right-6 hidden h-[3px] w-6 lg:block"
                />
              )}
              <div className="flex h-full flex-col rounded-[10px] border-2 border-line bg-stone p-5 shadow-pixel-xs">
                <div className="flex items-center gap-3">
                  <span className="pixel-notch-sm inline-flex size-8 items-center justify-center border-2 border-plum/35 bg-plum font-display text-[0.875rem] font-bold text-surface">
                    {index + 1}
                  </span>
                  <PixelTile
                    icon={step.icon}
                    tone={step.tone}
                    className="size-10"
                    surface
                    iconSize={18}
                  />
                </div>
                <h3 className="mt-4 font-display text-[1.0625rem] leading-tight font-bold text-espresso">
                  {step.title}
                </h3>
                <p className="mt-2 text-[0.9375rem] leading-[1.55] text-espresso/70">
                  {step.description}
                </p>
              </div>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}
