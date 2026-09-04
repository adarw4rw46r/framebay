import { auth } from "@/auth";
import { getQuota } from "@/lib/quota";
import { redirect } from "next/navigation";

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const quota = await getQuota(session.user.id);
  const provider = process.env.VIDEO_PROVIDER ?? "mock";

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-semibold">Settings</h1>
      <div className="card space-y-3 p-6">
        <h2 className="font-medium">Account</h2>
        <p className="text-sm text-muted">Signed in as {session.user.email}</p>
      </div>
      <div className="card space-y-3 p-6">
        <h2 className="font-medium">Daily free quota</h2>
        <p className="text-3xl font-semibold">
          {quota.remaining}
          <span className="text-lg text-muted"> / {quota.limit}</span>
        </p>
        <p className="text-sm text-muted">
          Used today: {quota.used}. Resets at {new Date(quota.resetAt).toUTCString()} (UTC day).
          Cost: 5s = 1 gen. Failed gens are refunded.
        </p>
      </div>
      <div className="card space-y-3 p-6">
        <h2 className="font-medium">Video provider</h2>
        <p className="text-sm">
          Active: <code className="rounded bg-black/40 px-1.5 py-0.5">{provider}</code>
        </p>
        <p className="text-sm text-muted">
          Set <code>VIDEO_PROVIDER=mock|free|fal</code>. Free needs FREE_VIDEO_API_URL (+ KEY). Fal is
          a stub.
        </p>
      </div>
    </div>
  );
}
