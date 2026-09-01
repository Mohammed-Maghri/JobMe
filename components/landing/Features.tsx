import FeatureCard from "./FeatureCard";
import Reveal from "./Reveal";
import { FEATURES } from "./content";
import { CONTAINER } from "./layout";

export default function Features() {
  return (
    <section aria-labelledby="features-heading" className="pb-12 lg:pb-14">
      <div className={CONTAINER}>
        <h2 id="features-heading" className="sr-only">
          What ApplyPilot does
        </h2>
        <ul className="grid grid-cols-1 gap-5 lg:grid-cols-3 lg:gap-6">
          {FEATURES.map((feature, index) => (
            <Reveal
              as="li"
              key={feature.id}
              delay={index * 0.07}
              className="h-full"
            >
              <FeatureCard feature={feature} />
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
