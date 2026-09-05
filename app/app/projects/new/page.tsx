"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { TEMPLATES } from "@/lib/templates";

const TEMPLATE_ACCENTS: Record<string, string> = {
  talking_hook: "from-violet-600/40 to-fuchsia-600/10",
  product_spin: "from-cyan-600/30 to-violet-600/10",
  cinematic_broll: "from-amber-600/25 to-fuchsia-700/10",
};

export default function NewProjectPage() {
  const router = useRouter();
  const [title, setTitle] = useState("My Short");
  const [template, setTemplate] = useState<keyof typeof TEMPLATES>("talking_hook");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, template }),
    });
    setLoading(false);
    if (!res.ok) {
      setError("Failed to create project");
      return;
    }
    const project = await res.json();
    router.push(`/app/projects/${project.id}`);
  }

  return (
    <div className="mx-auto max-w-2xl">
      <Link href="/app" className="mb-4 inline-block text-sm text-muted hover:text-foreground">
        ← Projects
      </Link>
      <p className="mb-1 text-xs font-medium uppercase tracking-[0.18em] text-muted">New project</p>
      <h1 className="mb-2 text-2xl font-semibold tracking-tight sm:text-3xl">Pick a template vibe</h1>
      <p className="mb-8 text-sm text-muted">
        Choose a directed look for your 9:16 short, then open the studio canvas.
      </p>

      <form onSubmit={onSubmit} className="space-y-6">
        <label className="block text-xs font-medium text-muted">
          Title
          <input className="input mt-1.5" value={title} onChange={(e) => setTitle(e.target.value)} />
        </label>

        <fieldset>
          <legend className="mb-3 text-xs font-medium text-muted">Template</legend>
          <div className="grid gap-3 sm:grid-cols-3">
            {Object.values(TEMPLATES).map((t) => {
              const active = template === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTemplate(t.id)}
                  className={`card overflow-hidden text-left transition ${
                    active ? "border-accent/50 ring-1 ring-violet-400/40" : "hover:border-zinc-600"
                  }`}
                >
                  <div
                    className={`aspect-[16/10] bg-gradient-to-br ${TEMPLATE_ACCENTS[t.id] ?? "from-violet-600/30 to-zinc-900"}`}
                  />
                  <div className="p-3">
                    <div className="mb-0.5 text-sm font-medium">{t.name}</div>
                    <p className="text-[11px] leading-relaxed text-muted">{t.description}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </fieldset>

        {error && <p className="text-sm text-danger">{error}</p>}

        <button className="btn btn-primary px-6 py-3" disabled={loading} type="submit">
          {loading ? "Creating…" : "Open in studio"}
        </button>
      </form>
    </div>
  );
}
