"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { CAMERA_PRESETS, type CameraPresetId } from "@/lib/templates";

type Generation = {
  id: string;
  status: string;
  resultUrls?: string[];
  error?: string | null;
  costGens: number;
  variantCount: number;
};

type Shot = {
  id: string;
  title: string;
  prompt: string;
  durationSec: number;
  cameraPreset: string;
  order: number;
  generations: Generation[];
};

type Project = {
  id: string;
  title: string;
  template: string;
  shots: Shot[];
};

export function StudioClient({ initial }: { initial: Project }) {
  const [project, setProject] = useState(initial);
  const [selectedId, setSelectedId] = useState(initial.shots[0]?.id ?? "");
  const [variants, setVariants] = useState(1);
  const [previewUrl, setPreviewUrl] = useState<string | null>(() => {
    const first = initial.shots[0]?.generations?.[0]?.resultUrls?.[0];
    return first ?? "/fixtures/sample-short.mp4";
  });
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [quota, setQuota] = useState<{ remaining: number; limit: number } | null>(null);

  const selected = useMemo(
    () => project.shots.find((s) => s.id === selectedId) ?? project.shots[0],
    [project.shots, selectedId],
  );

  const refreshQuota = useCallback(async () => {
    const res = await fetch("/api/quota");
    if (res.ok) setQuota(await res.json());
  }, []);

  const refreshProject = useCallback(async () => {
    const res = await fetch(`/api/projects/${project.id}`);
    if (!res.ok) return;
    const data = await res.json();
    // normalize generation resultUrls
    data.shots = data.shots.map((s: Shot & { generations: Array<Generation & { resultUrls: string | string[] }> }) => ({
      ...s,
      generations: s.generations.map((g) => ({
        ...g,
        resultUrls: typeof g.resultUrls === "string" ? JSON.parse(g.resultUrls || "[]") : g.resultUrls,
      })),
    }));
    setProject(data);
  }, [project.id]);

  useEffect(() => {
    void refreshQuota();
  }, [refreshQuota]);

  async function saveShot(patch: Partial<Shot>) {
    if (!selected) return;
    const res = await fetch(`/api/shots/${selected.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    if (res.ok) await refreshProject();
  }

  async function addShot() {
    const res = await fetch(`/api/projects/${project.id}/shots`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: `Shot ${project.shots.length + 1}`, prompt: selected?.prompt ?? "" }),
    });
    if (res.ok) {
      const shot = await res.json();
      await refreshProject();
      setSelectedId(shot.id);
    }
  }

  async function uploadAsset(file: File) {
    const fd = new FormData();
    fd.set("file", file);
    fd.set("projectId", project.id);
    const res = await fetch("/api/assets/upload", { method: "POST", body: fd });
    setMessage(res.ok ? "Asset uploaded to /public/uploads" : "Upload failed");
  }

  async function generate() {
    if (!selected) return;
    setBusy(true);
    setMessage(null);
    // persist latest fields first
    await saveShot({
      prompt: selected.prompt,
      durationSec: selected.durationSec,
      cameraPreset: selected.cameraPreset,
      title: selected.title,
    });
    const res = await fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ shotId: selected.id, variantCount: variants }),
    });
    const data = await res.json();
    if (!res.ok) {
      setBusy(false);
      setMessage(data.error ?? "Generate failed");
      return;
    }

    const genId = data.id as string;
    // poll
    for (let i = 0; i < 60; i++) {
      await new Promise((r) => setTimeout(r, 500));
      const poll = await fetch(`/api/generations/${genId}`);
      if (!poll.ok) continue;
      const gen = await poll.json();
      if (gen.status === "succeeded") {
        const url = gen.resultUrls?.[0] ?? "/fixtures/sample-short.mp4";
        setPreviewUrl(url);
        setMessage(`Succeeded · ${gen.variantCount} variant(s)`);
        break;
      }
      if (gen.status === "failed") {
        setMessage(gen.error ?? "Generation failed (quota refunded)");
        break;
      }
    }
    setBusy(false);
    await refreshProject();
    await refreshQuota();
  }

  if (!selected) {
    return (
      <div className="card p-8 text-center text-muted">
        No shots. <button className="btn btn-primary ml-2" onClick={addShot}>Add shot</button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-wider text-muted">{project.template}</p>
          <h1 className="text-2xl font-semibold">{project.title}</h1>
        </div>
        <div className="text-sm text-muted">
          Quota {quota ? `${quota.remaining}/${quota.limit}` : "…"} ·{" "}
          <Link href="/app/settings" className="text-accent">
            settings
          </Link>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[240px_1fr_300px]">
        {/* Left: shots */}
        <aside className="card p-3">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-sm font-medium">Shots</h2>
            <button className="btn btn-ghost px-2 py-1 text-xs" onClick={addShot} type="button">
              + Add
            </button>
          </div>
          <ul className="space-y-1">
            {project.shots.map((s) => (
              <li key={s.id}>
                <button
                  type="button"
                  onClick={() => setSelectedId(s.id)}
                  className={`w-full rounded-lg px-3 py-2 text-left text-sm ${
                    s.id === selected.id ? "bg-accent/20 text-foreground" : "text-muted hover:bg-white/5"
                  }`}
                >
                  <div className="font-medium">{s.title}</div>
                  <div className="text-xs opacity-70">{s.durationSec}s · {s.cameraPreset}</div>
                </button>
              </li>
            ))}
          </ul>
        </aside>

        {/* Center: preview */}
        <section className="card flex flex-col items-center p-4">
          <div className="aspect-[9/16] w-full max-w-[320px] overflow-hidden rounded-xl border border-border bg-black">
            {previewUrl ? (
              <video key={previewUrl} className="h-full w-full object-cover" src={previewUrl} controls autoPlay loop muted playsInline />
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-muted">No preview</div>
            )}
          </div>
          {message && <p className="mt-3 text-center text-sm text-muted">{message}</p>}
          <div className="mt-4 flex flex-wrap gap-2">
            {(selected.generations ?? []).slice(0, 3).map((g) => {
              const urls = (g.resultUrls as string[] | undefined) ?? [];
              return (
                <Link key={g.id} href={`/app/generations/${g.id}`} className="btn btn-ghost px-3 py-1 text-xs">
                  {g.status} {urls[0] ? "→" : ""}
                </Link>
              );
            })}
          </div>
        </section>

        {/* Right: generate */}
        <aside className="card space-y-4 p-4">
          <h2 className="font-medium">Generate</h2>
          <label className="block text-sm">
            Title
            <input
              className="input mt-1"
              value={selected.title}
              onChange={(e) =>
                setProject((p) => ({
                  ...p,
                  shots: p.shots.map((s) => (s.id === selected.id ? { ...s, title: e.target.value } : s)),
                }))
              }
              onBlur={() => saveShot({ title: selected.title })}
            />
          </label>
          <label className="block text-sm">
            Prompt
            <textarea
              className="textarea mt-1"
              value={selected.prompt}
              onChange={(e) =>
                setProject((p) => ({
                  ...p,
                  shots: p.shots.map((s) => (s.id === selected.id ? { ...s, prompt: e.target.value } : s)),
                }))
              }
              onBlur={() => saveShot({ prompt: selected.prompt })}
            />
          </label>
          <label className="block text-sm">
            Duration (sec)
            <input
              className="input mt-1"
              type="number"
              min={1}
              max={30}
              value={selected.durationSec}
              onChange={(e) =>
                setProject((p) => ({
                  ...p,
                  shots: p.shots.map((s) =>
                    s.id === selected.id ? { ...s, durationSec: Number(e.target.value) } : s,
                  ),
                }))
              }
              onBlur={() => saveShot({ durationSec: selected.durationSec })}
            />
          </label>
          <label className="block text-sm">
            Camera preset
            <select
              className="select mt-1"
              value={selected.cameraPreset}
              onChange={(e) => {
                const cameraPreset = e.target.value as CameraPresetId;
                setProject((p) => ({
                  ...p,
                  shots: p.shots.map((s) => (s.id === selected.id ? { ...s, cameraPreset } : s)),
                }));
                void saveShot({ cameraPreset });
              }}
            >
              {Object.values(CAMERA_PRESETS).map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm">
            Variants (1–3)
            <input
              className="input mt-1"
              type="number"
              min={1}
              max={3}
              value={variants}
              onChange={(e) => setVariants(Math.min(3, Math.max(1, Number(e.target.value))))}
            />
          </label>
          <label className="block text-sm">
            Upload asset
            <input
              className="mt-1 block w-full text-sm"
              type="file"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) void uploadAsset(f);
              }}
            />
          </label>
          <button className="btn btn-primary w-full" disabled={busy} onClick={generate} type="button">
            {busy ? "Generating…" : "Generate"}
          </button>
        </aside>
      </div>
    </div>
  );
}
