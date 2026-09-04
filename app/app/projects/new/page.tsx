"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { TEMPLATES } from "@/lib/templates";

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
    <div className="mx-auto max-w-xl">
      <h1 className="mb-6 text-2xl font-semibold">New 9:16 project</h1>
      <form onSubmit={onSubmit} className="card space-y-5 p-6">
        <label className="block text-sm">
          Title
          <input className="input mt-1" value={title} onChange={(e) => setTitle(e.target.value)} />
        </label>
        <fieldset className="space-y-3">
          <legend className="mb-1 text-sm">Template</legend>
          {Object.values(TEMPLATES).map((t) => (
            <label
              key={t.id}
              className={`flex cursor-pointer gap-3 rounded-xl border p-3 ${
                template === t.id ? "border-accent bg-accent/10" : "border-border"
              }`}
            >
              <input
                type="radio"
                name="template"
                className="mt-1"
                checked={template === t.id}
                onChange={() => setTemplate(t.id)}
              />
              <span>
                <span className="block font-medium">{t.name}</span>
                <span className="text-sm text-muted">{t.description}</span>
              </span>
            </label>
          ))}
        </fieldset>
        {error && <p className="text-sm text-red-400">{error}</p>}
        <button className="btn btn-primary" disabled={loading} type="submit">
          {loading ? "Creating…" : "Create project"}
        </button>
      </form>
    </div>
  );
}
