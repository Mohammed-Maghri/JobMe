import { ArrowRight } from "lucide-react";
import PixelTile from "./PixelTile";
import Reveal from "./Reveal";
import { PIPELINE_STAGES } from "./content";
import { CONTAINER } from "./layout";

/** Three hard 3px squares standing in for a dotted rule between stages. */
function StageConnector({ vertical = false }: { vertical?: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={
        vertical
          ? "ml-[18px] flex w-[3px] flex-col items-center gap-[3px] py-1"
          : "flex shrink-0 items-center gap-[3px]"
      }
    >
      <span className="size-[3px] bg-line" />
      <span className="size-[3px] bg-line" />
      <span className="size-[3px] bg-line" />
    </span>
  );
}

export default function ApplicationPipeline() {
  const total = PIPELINE_STAGES.reduce((sum, stage) => sum + stage.count, 0);

  return (
    <section
      id="applications"
      aria-labelledby="applications-heading"
      className="pb-14 sm:pb-16 lg:pb-20"
    >
      <div className={CONTAINER}>
        <Reveal>
          <div className="rounded-[10px] border-2 border-line bg-surface p-5 shadow-pixel-sm sm:p-6 lg:px-7 lg:py-6">
            <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-3">
              <div>
                <h2
                  id="applications-heading"
                  className="font-display text-[0.8125rem] font-bold tracking-[0.18em] text-espresso/75 uppercase sm:text-sm"
                >
                  Your applications
                </h2>
                <p className="mt-1 text-[0.8125rem] text-espresso/55">
                  {total} opportunities in progress · updated today
                </p>
              </div>
              <a
                href="#find-jobs"
                className="group inline-flex min-h-11 items-center gap-1.5 rounded-[4px] font-display text-[0.9375rem] font-bold text-plum"
              >
                View all applications
                <ArrowRight
                  size={16}
                  strokeWidth={2.4}
                  aria-hidden="true"
                  className="transition-transform duration-150 group-hover:translate-x-1"
                />
              </a>
            </div>

            <div className="mt-5 border-t-2 border-line/60 pt-5 lg:mt-6 lg:pt-6">
              {/* Vertical list on small screens, single row from lg up. */}
              <ol className="flex flex-col lg:flex-row lg:items-stretch lg:justify-between lg:gap-2">
                {PIPELINE_STAGES.map((stage, index) => (
                  <li
                    key={stage.id}
                    className="lg:flex lg:min-w-0 lg:flex-1 lg:items-center lg:gap-2"
                  >
                    <div className="flex items-center gap-3 lg:min-w-0 lg:flex-1">
                      <PixelTile
                        icon={stage.icon}
                        tone={stage.tone}
                        className="size-10"
                        iconSize={18}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-display text-[0.9375rem] font-bold text-espresso">
                            {stage.label}
                          </span>
                          <span className="pixel-notch-sm inline-flex min-w-7 items-center justify-center border border-line bg-stone px-1.5 py-0.5 font-display text-[0.8125rem] font-bold text-espresso tabular-nums">
                            {stage.count}
                          </span>
                        </div>
                        <p className="mt-0.5 truncate text-[0.75rem] text-espresso/55">
                          {stage.hint}
                        </p>
                      </div>
                    </div>

                    {index < PIPELINE_STAGES.length - 1 && (
                      <>
                        <span className="block lg:hidden">
                          <StageConnector vertical />
                        </span>
                        <span className="hidden lg:flex lg:items-center">
                          <StageConnector />
                        </span>
                      </>
                    )}
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
