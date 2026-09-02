import type { Metadata, Viewport } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import AuthProvider from "@/components/auth/AuthProvider";
import { isGoogleConfigured } from "@/lib/env";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://applypilot.example"),
  title: {
    default: "ApplyPilot — Track every job application",
    template: "%s · ApplyPilot",
  },
  description:
    "Track every job application in one calm workspace: stages, interview and follow-up dates, contract types and your response rate, from saved through to offer.",
  applicationName: "ApplyPilot",
  keywords: [
    "application tracker",
    "job application tracking",
    "internships",
    "alternance",
    "interview tracker",
  ],
  openGraph: {
    title: "ApplyPilot — Track every job application",
    description:
      "Track every job application in one calm workspace, from saved through to offer.",
    siteName: "ApplyPilot",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#f3ebdd",
  colorScheme: "light",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-stone text-espresso">
        {/*
          `isGoogleConfigured` is read here, in a Server Component, and passed
          down as a plain boolean. The client learns *whether* Google is set up
          without the id or the secret ever entering the browser bundle.
        */}
        <AuthProvider googleEnabled={isGoogleConfigured}>{children}</AuthProvider>
      </body>
    </html>
  );
}
