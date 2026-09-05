"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { CameraPresetId } from "@/lib/templates";
import { TEMPLATES } from "@/lib/templates";
import { ShotList } from "@/components/studio/shot-list";
import { PreviewPane } from "@/components/studio/preview-pane";
import { GeneratePanel } from "@/components/studio/generate-panel";
import { QuotaPill } from "@/components/quota-pill";

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

function costForDuration(durationSec: number): number {
  return Math.max(1, Math.ceil(durationSec / 5));
}

function latestPreview(shots: Shot[]): string | null {
  for (const shot of shots) {
    for (const gen of shot.generations ?? []) {
      const url = gen.resultUrls?.[0];
      if (url) return url;
    }
  }
  return null;
}

export function StudioClient({ initial }: { initial: Project }) {
  const [project, setProject] = useState(initial);
  const [selectedId, setSelectedId] = useState(initial.shots[0]?.id ?? "");
  const [variants, setVariants] = useState(1);
  const [previewUrl, setPreviewUrl] = useState<string | null>(() => latestPreview(initial.shots));
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [quota, setQuota] = useState<{ remaining: number; limit: number } | null>(null);

  const selected = useMemo(
    () => project.shots.find((s) => s.id === selectedId) ?? project.shots[0],
    [project.shots, selectedId],
  );

  const templateMeta = TEMPLATES[project.template as keyof typeof TEMPLATES];
  const estimatedCost = selected
    ? costForDuration(selected.durationSec) * variants
    : 1;

  const refreshQuota = useCallback(async () => {
    const res = await fetch("/api/quota");
    if (res.ok) setQuota(await res.json());
  }, []);

  const refreshProject = useCallback(async () => {
    const res = await fetch(`/api/projects/${project.id}`);
    if (!res.ok) return;
    const data = await res.json();
    data.shots = data.shots.map(
      (s: Shot & { generations: Array<Generation & { resultUrls: string | string[] }> }) => ({
        ...s,
        generations: s.generations.map((g) => ({
          ...g,
          resultUrls:
            typeof g.resultUrls === "string"
              ? JSON.parse(g.resultUrls || "[]")
              : g.resultUrls,
        })),
      }),
    );
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

  function patchSelected(patch: Partial<Shot>) {
    if (!selected) return;
    setProject((p) => ({
      ...p,
      shots: p.shots.map((s) => (s.id === selected.id ? { ...s, ...patch } : s)),
    }));
  }

  async function addShot() {
    const res = await fetch(`/api/projects/${project.id}/shots`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: `Shot ${project.shots.length + 1}`,
        prompt: selected?.prompt ?? templateMeta?.defaultPrompt ?? "",
      }),
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
    setMessage(res.ok ? "Asset uploaded" : "Upload failed");
  }

  async function generate() {
    if (!selected) return;
    setBusy(true);
    setMessage(null);
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
      <div className="panel flex min-h-[420px] flex-col items-center justify-center gap-4 p-10 text-center">
        <p className="text-muted">No shots in this project yet.</p>
        <button className="btn btn-primary" onClick={addShot} type="button">
          Add your first shot
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="mb-1 flex flex-wrap items-center gap-2">
            <Link href="/app" className="text-xs text-muted hover:text-foreground">
              Projects
            </Link>
            <span className="text-zinc-600">/</span>
            <span className="rounded-full border border-border bg-white/[0.03] px-2 py-0.5 text-[10px] uppercase tracking-wider text-muted">
              {templateMeta?.name ?? project.template}
            </span>
          </div>
          <h1 className="truncate text-xl font-semibold tracking-tight sm:text-2xl">
            {project.title}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          {quota && <QuotaPill remaining={quota.remaining} limit={quota.limit} />}
        </div>
      </div>

      <div className="grid gap-3 lg:grid-cols-[220px_minmax(0,1fr)_300px] lg:items-start xl:grid-cols-[240px_minmax(0,1fr)_320px]">
        <ShotList
          shots={project.shots}
          selectedId={selected.id}
          onSelect={setSelectedId}
          onAdd={addShot}
        />

        <PreviewPane
          previewUrl={previewUrl}
          message={message}
          generations={selected.generations ?? []}
          onPickUrl={setPreviewUrl}
          emptyHint="Generate your first short"
        />

        <GeneratePanel
          title={selected.title}
          prompt={selected.prompt}
          durationSec={selected.durationSec}
          cameraPreset={selected.cameraPreset}
          variants={variants}
          estimatedCost={estimatedCost}
          remaining={quota?.remaining ?? null}
          busy={busy}
          onTitle={(title) => patchSelected({ title })}
          onPrompt={(prompt) => patchSelected({ prompt })}
          onDuration={(durationSec) => {
            patchSelected({ durationSec });
            void saveShot({ durationSec });
          }}
          onCamera={(cameraPreset: CameraPresetId) => {
            patchSelected({ cameraPreset });
            void saveShot({ cameraPreset });
          }}
          onVariants={setVariants}
          onBlurSave={() =>
            void saveShot({
              title: selected.title,
              prompt: selected.prompt,
              durationSec: selected.durationSec,
            })
          }
          onUpload={uploadAsset}
          onGenerate={generate}
        />
      </div>
    </div>
  );
}
