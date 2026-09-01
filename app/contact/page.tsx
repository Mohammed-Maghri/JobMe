import type { Metadata } from "next";
import SimplePage from "@/components/landing/SimplePage";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with the ApplyPilot team.",
};

export default function ContactPage() {
  return (
    <SimplePage eyebrow="Contact" title="Talk to the team.">
      <p>
        Questions about the product, the roadmap or the roles we index? Write to{" "}
        <a
          href="mailto:hello@applypilot.example"
          className="font-semibold text-plum underline underline-offset-4"
        >
          hello@applypilot.example
        </a>
        {" "}and someone will reply.
      </p>
    </SimplePage>
  );
}
