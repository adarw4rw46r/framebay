"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Logo } from "@/components/logo";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("dev@framebay.local");
  const [password, setPassword] = useState("framebay");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await signIn("credentials", { email, password, redirect: false });
    setLoading(false);
    if (res?.error) {
      setError("Invalid credentials");
      return;
    }
    router.push("/app");
    router.refresh();
  }

  return (
    <main className="relative mx-auto flex min-h-screen max-w-md flex-col justify-center px-6">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-1/4 h-64 w-64 -translate-x-1/2 rounded-full bg-violet-600/20 blur-[100px]" />
      </div>

      <div className="mb-8 flex items-center justify-between">
        <Logo />
        <Link href="/" className="text-sm text-muted hover:text-foreground">
          ← Marketing
        </Link>
      </div>

      <div className="card p-8 shadow-[0_0_60px_-20px_rgba(168,85,247,0.35)]">
        <p className="mb-2 text-xs font-medium uppercase tracking-[0.18em] text-muted">Studio access</p>
        <h1 className="mb-2 text-2xl font-semibold tracking-tight">Welcome back</h1>
        <p className="mb-6 text-sm text-muted">
          Dev credentials auth. Default: <code className="rounded bg-black/40 px-1.5 py-0.5 text-violet-200">dev@framebay.local</code>{" "}
          / <code className="rounded bg-black/40 px-1.5 py-0.5 text-violet-200">framebay</code>
        </p>
        <form onSubmit={onSubmit} className="space-y-4">
          <label className="block text-xs font-medium text-muted">
            Email
            <input
              className="input mt-1.5"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="username"
            />
          </label>
          <label className="block text-xs font-medium text-muted">
            Password
            <input
              className="input mt-1.5"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
          </label>
          {error && <p className="text-sm text-danger">{error}</p>}
          <button className="btn btn-primary w-full py-3" disabled={loading} type="submit">
            {loading ? "Signing in…" : "Enter studio"}
          </button>
        </form>
      </div>
    </main>
  );
}
