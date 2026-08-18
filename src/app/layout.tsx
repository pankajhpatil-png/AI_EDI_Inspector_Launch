import type { Metadata } from "next";
import Script from "next/script";
import { Analytics } from "@vercel/analytics/next";
import AppShell from "@/components/AppShell";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI EDI Inspector",
  description: "AI-powered ANSI X12 and EDIFACT EDI validation, error explanation, and analytics.",
};

const THEME_INIT_SCRIPT = `
(function () {
  try {
    var stored = localStorage.getItem("aiEdiInspectorTheme");
    var theme = stored === "dark" || stored === "light"
      ? stored
      : (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    document.documentElement.setAttribute("data-theme", theme);
  } catch (e) {}
})();
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // suppressHydrationWarning: the beforeInteractive script below sets
  // data-theme on this element before React hydrates, based on
  // localStorage/prefers-color-scheme the server can't know about —
  // that's an intentional, expected mismatch, not a bug.
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Script id="theme-init" strategy="beforeInteractive" dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
        <AppShell>{children}</AppShell>
        <Analytics />
      </body>
    </html>
  );
}
