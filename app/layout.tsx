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
    default: "ApplyPilot — Find work that fits you",
    template: "%s · ApplyPilot",
  },
  description:
    "Fresh jobs, relevant matches, and every application organized in one calm workspace. Discover jobs, internships and alternance opportunities, then track each application through to the offer.",
  applicationName: "ApplyPilot",
  keywords: [
    "job search",
    "internships",
    "alternance",
    "application tracker",
    "job matching",
  ],
  openGraph: {
    title: "ApplyPilot — Find work that fits you",
    description:
      "Fresh jobs, relevant matches, and every application organized in one calm workspace.",
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
