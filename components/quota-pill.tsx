import Link from "next/link";

export function QuotaPill({
  remaining,
  limit,
  href = "/app/settings",
}: {
  remaining: number;
  limit: number;
  href?: string;
}) {
  const low = remaining <= 3;
  return (
    <Link
      href={href}
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium transition ${
        low
          ? "border-warning/40 bg-warning/10 text-warning"
          : "border-border bg-white/[0.03] text-muted hover:border-accent/40 hover:text-foreground"
      }`}
      title="Daily free generation quota"
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${low ? "bg-warning" : "bg-accent"}`}
        aria-hidden
      />
      <span>
        <span className="text-foreground">{remaining}</span>
        <span className="text-muted">/{limit} gens</span>
      </span>
    </Link>
  );
}
