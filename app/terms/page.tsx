import type { Metadata } from "next";
import SimplePage from "@/components/landing/SimplePage";

export const metadata: Metadata = {
  title: "Terms",
  description: "Terms of use for ApplyPilot.",
};

export default function TermsPage() {
  return (
    <SimplePage eyebrow="Terms" title="Terms of use.">
      <p>
        This site is a preview of ApplyPilot. There is no account, no
        subscription and no service commitment attached to it yet.
      </p>
      <p>
        Complete terms will be published here alongside the first release.
      </p>
    </SimplePage>
  );
}
