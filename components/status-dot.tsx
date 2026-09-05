export function statusTone(status?: string | null) {
  switch (status) {
    case "succeeded":
      return { dot: "bg-success shadow-[0_0_8px_rgba(52,211,153,0.7)]", label: "Ready" };
    case "running":
    case "queued":
      return { dot: "bg-warning animate-pulse shadow-[0_0_8px_rgba(251,191,36,0.5)]", label: status === "queued" ? "Queued" : "Generating" };
    case "failed":
      return { dot: "bg-danger", label: "Failed" };
    default:
      return { dot: "bg-zinc-600", label: "Idle" };
  }
}

export function StatusDot({ status }: { status?: string | null }) {
  const tone = statusTone(status);
  return <span className={`status-dot ${tone.dot}`} title={tone.label} aria-label={tone.label} />;
}
