import Link from "next/link";

export function Logo({ href = "/", compact = false }: { href?: string; compact?: boolean }) {
  return (
    <Link href={href} className="group inline-flex items-center gap-2 font-bold tracking-tight">
      <span
        className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 text-xs font-black text-white shadow-[0_0_20px_-4px_rgba(168,85,247,0.7)]"
        aria-hidden
      >
        F
      </span>
      {!compact && (
        <span>
          Framebay <span className="bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">Shorts</span>
        </span>
      )}
    </Link>
  );
}
