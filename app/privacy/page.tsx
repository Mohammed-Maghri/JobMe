import type { Metadata } from "next";
import SimplePage from "@/components/landing/SimplePage";

export const metadata: Metadata = {
  title: "Privacy",
  description: "How ApplyPilot handles your data.",
};

export default function PrivacyPage() {
  return (
    <SimplePage eyebrow="Privacy" title="How we handle your data.">
      <p>
        ApplyPilot is in development and does not yet collect accounts,
        applications or personal data. Nothing you do on this site is stored on
        a server, and the job feed shown on the landing page is a local example.
      </p>
      <p>
        The full privacy policy will be published here before the product opens
        to users.
      </p>
    </SimplePage>
  );
}
