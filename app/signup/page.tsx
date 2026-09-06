"use client";

import { signIn } from "next-auth/react";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/logo";
import { LegalFooter } from "@/components/legal-footer";

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const normalizedEmail = email.trim().toLowerCase();
    if (!/^[^ @]+@[^ @]+.[^ @]+$/.test(normalizedEmail)) {
      setError("Enter a valid email address.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (!acceptedTerms) {
      setError("You must accept the Terms and Privacy Policy.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: normalizedEmail, password, acceptedTerms }),
      });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) {
        setError(data.error ?? "Unable to create your account.");
        return;
      }

      const signInResult = await signIn("credentials", {
        email: normalizedEmail,
        password,
        redirect: false,
      });
      if (signInResult?.error) {
        setError("Your account was created, but sign-in failed. Please sign in.");
        return;
      }
      router.push("/app");
      router.refresh();
    } catch {
      setError("Unable to create your account. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-10">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-1/4 h-64 w-64 -translate-x-1/2 rounded-full bg-violet-600/20 blur-[100px]" />
      </div>
      <div className="mb-8 flex items-center justify-between">
        <Logo />
        <Link href="/" className="text-sm text-muted hover:text-foreground">← Marketing</Link>
      </div>
      <div className="card p-8 shadow-[0_0_60px_-20px_rgba(168,85,247,0.35)]">
        <p className="mb-2 text-xs font-medium uppercase tracking-[0.18em] text-muted">Studio access</p>
        <h1 className="mb-2 text-2xl font-semibold tracking-tight">Create your account</h1>
        <p className="mb-6 text-sm text-muted">Start creating with Framebay&apos;s AI creative studio.</p>
        <form onSubmit={onSubmit} className="space-y-4">
          <label className="block text-xs font-medium text-muted">
            Email
            <input className="input mt-1.5" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" required />
          </label>
          <label className="block text-xs font-medium text-muted">
            Password
            <input className="input mt-1.5" type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" minLength={8} required />
          </label>
          <label className="flex items-start gap-2 text-xs leading-relaxed text-muted">
            <input className="mt-0.5 accent-violet-400" type="checkbox" checked={acceptedTerms} onChange={(e) => setAcceptedTerms(e.target.checked)} required />
            <span>I agree to the <Link href="/terms" className="text-violet-300 hover:text-violet-200">Terms</Link>{" "}and <Link href="/privacy" className="text-violet-300 hover:text-violet-200">Privacy Policy</Link>.</span>
          </label>
          {error && <p className="text-sm text-danger" role="alert">{error}</p>}
          <button className="btn btn-primary w-full py-3" disabled={loading} type="submit">
            {loading ? "Creating account…" : "Create account"}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-muted">Already have an account?{" "}<Link href="/login" className="text-violet-300 hover:text-violet-200">Sign in</Link></p>
      </div>
      <LegalFooter />
    </main>
  );
}
