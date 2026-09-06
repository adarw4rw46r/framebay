import Link from "next/link";
import { Logo } from "@/components/logo";

export default function TermsPage() {
  return (
    <main className="mx-auto min-h-screen max-w-3xl px-6 py-10 sm:py-16">
      <div className="mb-12 flex items-center justify-between"><Logo /><Link href="/" className="text-sm text-muted hover:text-foreground">← Home</Link></div>
      <article className="max-w-none">
        <p className="mb-2 text-xs font-medium uppercase tracking-[0.18em] text-muted">Framebay</p>
        <h1 className="mb-4 text-3xl font-semibold tracking-tight">Terms of Service</h1>
        <p className="mb-8 text-sm text-muted">Last updated September 7, 2026</p>
        <div className="space-y-6 text-sm leading-7 text-muted">
          <section><h2 className="mb-2 text-base font-semibold text-foreground">The service</h2><p>Framebay is an AI creative studio for developing stories, scenes, shots, and generated media. The service includes a free daily generation limit, which may change as the product evolves.</p></section>
          <section><h2 className="mb-2 text-base font-semibold text-foreground">Your content</h2><p>You keep ownership of the prompts, project materials, and other content you provide. You are responsible for having the rights to use that content and for reviewing generated results before sharing them.</p></section>
          <section><h2 className="mb-2 text-base font-semibold text-foreground">No warranty</h2><p>Framebay is provided on an “as is” and “as available” basis. We make no warranty that the service or generated results will be uninterrupted, accurate, or fit for a particular purpose.</p></section>
          <section><h2 className="mb-2 text-base font-semibold text-foreground">Contact</h2><p>Questions about these terms can be sent to <a className="text-violet-300 hover:text-violet-200" href="mailto:shiva.shankar.c42@gmail.com">shiva.shankar.c42@gmail.com</a>.</p></section>
        </div>
      </article>
    </main>
  );
}
