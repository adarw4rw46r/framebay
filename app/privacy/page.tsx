import Link from "next/link";
import { Logo } from "@/components/logo";

export default function PrivacyPage() {
  return (
    <main className="mx-auto min-h-screen max-w-3xl px-6 py-10 sm:py-16">
      <div className="mb-12 flex items-center justify-between"><Logo /><Link href="/" className="text-sm text-muted hover:text-foreground">← Home</Link></div>
      <article className="max-w-none">
        <p className="mb-2 text-xs font-medium uppercase tracking-[0.18em] text-muted">Framebay</p>
        <h1 className="mb-4 text-3xl font-semibold tracking-tight">Privacy Policy</h1>
        <p className="mb-8 text-sm text-muted">Last updated September 7, 2026</p>
        <div className="space-y-6 text-sm leading-7 text-muted">
          <section><h2 className="mb-2 text-base font-semibold text-foreground">What we collect</h2><p>We collect your email address and password hash to provide your account. We also store the projects, prompts, uploaded assets, and generation activity you choose to use in Framebay.</p></section>
          <section><h2 className="mb-2 text-base font-semibold text-foreground">How we use it</h2><p>We use this information to authenticate you, operate the AI creative studio, enforce the free daily generation limit, and improve reliability. We do not store your password in plain text.</p></section>
          <section><h2 className="mb-2 text-base font-semibold text-foreground">Your choices</h2><p>You can contact us with questions about your information or your account. Please do not upload content you do not have permission to use.</p></section>
          <section><h2 className="mb-2 text-base font-semibold text-foreground">Contact</h2><p>For privacy questions, contact <a className="text-violet-300 hover:text-violet-200" href="mailto:shiva.shankar.c42@gmail.com">shiva.shankar.c42@gmail.com</a>.</p></section>
        </div>
      </article>
    </main>
  );
}
