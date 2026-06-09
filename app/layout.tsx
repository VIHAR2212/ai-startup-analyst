import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Startup Intelligence Analyst",
  description: "Multi-agent VC-grade startup analysis powered by Claude AI",
  keywords: ["startup", "AI", "VC", "analysis", "business intelligence"],
  openGraph: {
    title: "AI Startup Intelligence Analyst",
    description: "Get a complete VC-style analysis of your startup idea in seconds",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap" rel="stylesheet" />
      </head>
      <body>{children}</body>
    </html>
  );
}
