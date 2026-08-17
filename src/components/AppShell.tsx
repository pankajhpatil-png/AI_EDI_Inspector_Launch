import type { ReactNode } from "react";
import NavSidebar from "./NavSidebar";
import ThemeToggle from "./ThemeToggle";

export default function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <header
        className="flex items-center justify-between gap-2 border-b px-4 py-4 md:px-6"
        style={{ borderColor: "var(--border)" }}
      >
        <div className="flex flex-col">
          <span className="font-mono text-[11px] uppercase tracking-widest" style={{ color: "var(--accent)" }}>
            AI EDI Inspector
          </span>
          <span className="text-sm font-semibold" style={{ color: "var(--ink)" }}>
            X12 Validation
          </span>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button
            type="button"
            aria-label="Notifications"
            className="flex h-11 w-11 items-center justify-center rounded-md transition-colors cursor-pointer"
            style={{ color: "var(--ink-muted)" }}
          >
            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
              <path
                d="M5 8a5 5 0 0 1 10 0v3.5l1.2 2.3a.8.8 0 0 1-.7 1.2H4.5a.8.8 0 0 1-.7-1.2L5 11.5V8Z"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path d="M8.5 15a1.5 1.5 0 0 0 3 0" strokeLinecap="round" />
            </svg>
          </button>
          <div className="flex items-center gap-2">
            <span
              className="flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold"
              style={{ background: "var(--accent-soft)", color: "var(--accent)" }}
            >
              PP
            </span>
            <span className="text-sm font-medium hidden sm:inline" style={{ color: "var(--ink)" }}>
              Pankaj
            </span>
          </div>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-[1200px] flex-1 flex-col md:flex-row">
        <aside
          className="w-full shrink-0 border-b md:w-[220px] md:border-b-0 md:border-r"
          style={{ borderColor: "var(--border)" }}
        >
          <NavSidebar />
        </aside>
        <main className="flex flex-1 flex-col px-4 py-6 md:px-8 md:py-8">
          <div className="flex-1">{children}</div>
          <footer
            className="mt-10 flex items-center justify-center gap-2 border-t pt-4 text-xs"
            style={{ borderColor: "var(--border)", color: "var(--ink-muted)" }}
          >
            <span>Pankaj Patil</span>
            <span aria-hidden="true">·</span>
            <a
              href="https://www.linkedin.com/in/pankaj-patil-47051523"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold underline-offset-2 hover:underline"
              style={{ color: "var(--accent)" }}
            >
              LinkedIn
            </a>
          </footer>
        </main>
      </div>
    </div>
  );
}
