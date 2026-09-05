import { auth } from "@/auth";
import { getQuota } from "@/lib/quota";
import { redirect } from "next/navigation";
import { QuotaPill } from "@/components/quota-pill";

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const quota = await getQuota(session.user.id);
  const provider = process.env.VIDEO_PROVIDER ?? "mock";
  const resetLabel = new Date(quota.resetAt).toLocaleString("en-IN", {
    timeZone: "Asia/Calcutta",
    dateStyle: "medium",
    timeStyle: "short",
  });

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <p className="mb-1 text-xs font-medium uppercase tracking-[0.18em] text-muted">Account</p>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Settings</h1>
      </div>

      <div className="card space-y-3 p-6">
        <h2 className="font-medium">Profile</h2>
        <p className="text-sm text-muted">Signed in as {session.user.email}</p>
      </div>

      <div className="card space-y-4 p-6">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-medium">Daily free quota</h2>
          <QuotaPill remaining={quota.remaining} limit={quota.limit} href="/app/settings" />
        </div>
        <p className="text-4xl font-semibold tracking-tight">
          {quota.remaining}
          <span className="text-lg text-muted"> / {quota.limit}</span>
        </p>
        <p className="text-sm text-muted">
          Used today: {quota.used}. Resets around {resetLabel} IST (UTC day boundary). Cost: 5s = 1
          gen. Failed gens are refunded.
        </p>
        <div className="h-2 overflow-hidden rounded-full bg-zinc-900">
          <div
            className="h-full rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500"
            style={{ width: `${Math.min(100, (quota.used / quota.limit) * 100)}%` }}
          />
        </div>
      </div>

      <div className="card space-y-3 p-6">
        <h2 className="font-medium">Video provider</h2>
        <p className="text-sm">
          Active:{" "}
          <code className="rounded-md border border-border bg-black/40 px-2 py-0.5 text-violet-200">
            {provider}
          </code>
        </p>
        <p className="text-sm text-muted">
          Set <code>VIDEO_PROVIDER=mock|free|fal</code>. Free needs FREE_VIDEO_API_URL (+ KEY). Fal is
          a stub.
        </p>
      </div>
    </div>
  );
}
