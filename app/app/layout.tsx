import Link from "next/link";
import { auth, signOut } from "@/auth";
import { redirect } from "next/navigation";
import { getQuota } from "@/lib/quota";
import { Logo } from "@/components/logo";
import { QuotaPill } from "@/components/quota-pill";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const quota = session.user.id
    ? await getQuota(session.user.id)
    : { remaining: 0, limit: 20 };

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-20 border-b border-border/80 bg-[#0a0a0b]/85 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-4 px-4">
          <div className="flex items-center gap-5">
            <Logo href="/app" />
            <nav className="hidden items-center gap-1 text-sm sm:flex">
              <Link
                href="/app"
                className="rounded-lg px-2.5 py-1.5 text-muted transition hover:bg-white/[0.04] hover:text-foreground"
              >
                Projects
              </Link>
              <Link
                href="/app/projects/new"
                className="rounded-lg px-2.5 py-1.5 text-muted transition hover:bg-white/[0.04] hover:text-foreground"
              >
                New
              </Link>
              <Link
                href="/app/settings"
                className="rounded-lg px-2.5 py-1.5 text-muted transition hover:bg-white/[0.04] hover:text-foreground"
              >
                Settings
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <QuotaPill remaining={quota.remaining} limit={quota.limit} />
            <span className="hidden max-w-[160px] truncate text-xs text-muted md:inline">
              {session.user.email}
            </span>
            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/" });
              }}
            >
              <button className="btn btn-ghost px-2.5 py-1.5 text-xs" type="submit">
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>
      <div className="mx-auto max-w-7xl px-4 py-5 sm:py-6">{children}</div>
    </div>
  );
}
