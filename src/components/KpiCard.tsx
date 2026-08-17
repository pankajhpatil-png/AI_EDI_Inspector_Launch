export default function KpiCard({
  label,
  value,
  sublabel,
}: {
  label: string;
  value: string;
  sublabel?: string;
}) {
  return (
    <div
      className="rounded-[10px] border p-4"
      style={{ background: "var(--surface)", borderColor: "var(--border)" }}
    >
      <div
        className="font-mono text-[11px] uppercase tracking-wider"
        style={{ color: "var(--ink-muted)" }}
      >
        {label}
      </div>
      <div className="mt-1 text-2xl font-semibold" style={{ color: "var(--ink)" }}>
        {value}
      </div>
      {sublabel && (
        <div className="mt-1 text-xs" style={{ color: "var(--ink-muted)" }}>
          {sublabel}
        </div>
      )}
    </div>
  );
}
