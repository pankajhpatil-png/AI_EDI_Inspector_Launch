export default function AboutPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <span className="font-mono text-xs uppercase tracking-widest" style={{ color: "var(--accent)" }}>
          EDI · ANSI X12 · AI
        </span>
        <h1 className="mt-1 text-2xl font-semibold" style={{ color: "var(--ink)" }}>
          AI EDI Inspector
        </h1>
        <p className="mt-2 text-sm" style={{ color: "var(--ink-muted)" }}>
          Structural validation, AI-assisted error explanations, and analytics for ANSI X12 EDI — covering
          commercial supply-chain (850, 855, 856, 810, 820, 846, 997, 999) and HIPAA healthcare (270, 271, 276,
          277, 278, 835, 837) transaction sets.
        </p>
      </div>

      <div className="rounded-lg border p-4 text-sm" style={{ borderColor: "var(--border)", background: "var(--surface)", color: "var(--ink)" }}>
        <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--ink-muted)" }}>
          Scope
        </h2>
        <p>
          This checks structure against the generic X12 standard — envelope control-number integrity, segment
          counts, required top-level segments — plus a soft GS08 implementation-guide check for HIPAA sets. It
          does <strong>not</strong> validate against a specific trading partner&apos;s or payer&apos;s full
          implementation guide (situational rules, code lists, CARC/RARC values, loop repetition limits). A file
          can pass here and still be rejected downstream.
        </p>
      </div>

      <div
        className="rounded-lg border p-4 text-sm"
        style={{ borderColor: "var(--warning)", background: "var(--warning-soft)", color: "var(--ink)" }}
      >
        <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--warning)" }}>
          Before pointing this at real data
        </h2>
        <p>
          Validation runs entirely in your browser — raw file content never reaches a server. But the AI
          explanation feature and the History/Analytics database are server-side, and this app ships with{" "}
          <strong>no login screen by default</strong>. Several of the supported transaction sets carry
          HIPAA-regulated healthcare data (270, 271, 276, 277, 278, 835, 837). Do not point this at real
          trading-partner or PHI data on a public link until at least a company-SSO-level gate is in front of
          it — see the security ladder in the main repo&apos;s <code>deployment-handbook.md</code> and this
          app&apos;s <code>README.md</code>.
        </p>
      </div>

      <footer className="flex flex-col gap-1 border-t pt-4 text-xs" style={{ borderColor: "var(--border)", color: "var(--ink-muted)" }}>
        <span>
          Created &amp; maintained by Pankaj Patil ·{" "}
          <a
            href="https://www.linkedin.com/in/pankaj-patil-47051523"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "var(--accent)" }}
          >
            LinkedIn
          </a>
        </span>
        <span>© 2026 Pankaj Patil. All Rights Reserved.</span>
      </footer>
    </div>
  );
}
