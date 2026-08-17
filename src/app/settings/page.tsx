"use client";

import { useEffect, useState } from "react";

function FeatureStatus({ label, configured, hint }: { label: string; configured: boolean | null; hint: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border p-3" style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
      <div>
        <div className="text-sm font-medium" style={{ color: "var(--ink)" }}>{label}</div>
        <div className="mt-0.5 text-xs" style={{ color: "var(--ink-muted)" }}>{hint}</div>
      </div>
      {configured === null ? (
        <span className="chip">Checking…</span>
      ) : (
        <span
          className="chip"
          style={configured ? { color: "var(--success)", borderColor: "var(--success)" } : undefined}
        >
          {configured ? "Configured" : "Not configured"}
        </span>
      )}
    </div>
  );
}

export default function SettingsPage() {
  const [status, setStatus] = useState<{ aiConfigured: boolean; dbConfigured: boolean } | null>(null);

  useEffect(() => {
    fetch("/api/status")
      .then((r) => (r.ok ? r.json() : null))
      .then(setStatus)
      .catch(() => setStatus(null));
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold" style={{ color: "var(--ink)" }}>
          Settings
        </h1>
        <p className="mt-1 text-sm" style={{ color: "var(--ink-muted)" }}>
          Theme is stored in this browser only. Feature status reflects server-side configuration.
        </p>
      </div>

      <div>
        <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--ink-muted)" }}>
          Appearance
        </h2>
        <p className="text-sm" style={{ color: "var(--ink-muted)" }}>
          Use the theme toggle in the top-right of the page to switch between light and dark. Your choice is
          remembered on this device.
        </p>
      </div>

      <div>
        <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--ink-muted)" }}>
          Feature status
        </h2>
        <div className="flex flex-col gap-2">
          <FeatureStatus
            label="AI explanations"
            configured={status ? status.aiConfigured : null}
            hint="Add ANTHROPIC_API_KEY or OPENROUTER_API_KEY as an environment variable to turn this on."
          />
          <FeatureStatus
            label="History & Analytics"
            configured={status ? status.dbConfigured : null}
            hint="Connect a Postgres database (DATABASE_URL) — see README.md for setup."
          />
        </div>
      </div>
    </div>
  );
}
