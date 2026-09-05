"use client";

import { CAMERA_PRESETS, type CameraPresetId } from "@/lib/templates";

const DURATION_PRESETS = [5, 10, 15];
const VARIANT_PRESETS = [1, 2, 3];

export function GeneratePanel({
  title,
  prompt,
  durationSec,
  cameraPreset,
  variants,
  estimatedCost,
  remaining,
  busy,
  onTitle,
  onPrompt,
  onDuration,
  onCamera,
  onVariants,
  onBlurSave,
  onUpload,
  onGenerate,
}: {
  title: string;
  prompt: string;
  durationSec: number;
  cameraPreset: string;
  variants: number;
  estimatedCost: number;
  remaining: number | null;
  busy: boolean;
  onTitle: (v: string) => void;
  onPrompt: (v: string) => void;
  onDuration: (v: number) => void;
  onCamera: (v: CameraPresetId) => void;
  onVariants: (v: number) => void;
  onBlurSave: () => void;
  onUpload: (file: File) => void;
  onGenerate: () => void;
}) {
  const canAfford = remaining === null || remaining >= estimatedCost;

  return (
    <aside className="panel flex h-full flex-col gap-4 p-4">
      <div>
        <h2 className="text-sm font-semibold">Generate</h2>
        <p className="text-[11px] text-muted">Prompt · camera · variants</p>
      </div>

      {!prompt.trim() && (
        <div className="rounded-xl border border-dashed border-violet-500/30 bg-violet-500/5 px-3 py-2.5 text-xs text-muted">
          Pick a template vibe… or write a punchy vertical hook.
        </div>
      )}

      <label className="block text-xs font-medium text-muted">
        Shot title
        <input
          className="input mt-1.5 text-sm"
          value={title}
          onChange={(e) => onTitle(e.target.value)}
          onBlur={onBlurSave}
        />
      </label>

      <label className="block text-xs font-medium text-muted">
        Prompt
        <textarea
          className="textarea mt-1.5 text-sm"
          placeholder="A creator speaking to camera with bold hook energy, vertical 9:16…"
          value={prompt}
          onChange={(e) => onPrompt(e.target.value)}
          onBlur={onBlurSave}
        />
      </label>

      <div>
        <div className="mb-2 text-xs font-medium text-muted">Camera preset</div>
        <div className="flex flex-wrap gap-1.5">
          {Object.values(CAMERA_PRESETS).map((p) => (
            <button
              key={p.id}
              type="button"
              className={`chip ${cameraPreset === p.id ? "chip-active" : ""}`}
              onClick={() => onCamera(p.id)}
            >
              {p.name}
            </button>
          ))}
        </div>
      </div>

      <div>
        <div className="mb-2 text-xs font-medium text-muted">Duration</div>
        <div className="flex flex-wrap gap-1.5">
          {DURATION_PRESETS.map((d) => (
            <button
              key={d}
              type="button"
              className={`chip ${durationSec === d ? "chip-active" : ""}`}
              onClick={() => onDuration(d)}
            >
              {d}s
            </button>
          ))}
        </div>
        <input
          className="input mt-2 text-sm"
          type="number"
          min={1}
          max={30}
          value={durationSec}
          onChange={(e) => onDuration(Math.min(30, Math.max(1, Number(e.target.value) || 1)))}
          onBlur={onBlurSave}
        />
      </div>

      <div>
        <div className="mb-2 text-xs font-medium text-muted">Variants</div>
        <div className="flex gap-1.5">
          {VARIANT_PRESETS.map((v) => (
            <button
              key={v}
              type="button"
              className={`chip ${variants === v ? "chip-active" : ""}`}
              onClick={() => onVariants(v)}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      <label className="block text-xs font-medium text-muted">
        Reference asset
        <input
          className="mt-1.5 block w-full text-xs text-muted file:mr-3 file:rounded-full file:border-0 file:bg-white/5 file:px-3 file:py-1.5 file:text-xs file:text-foreground"
          type="file"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) onUpload(f);
          }}
        />
      </label>

      <div className="mt-auto space-y-3 border-t border-border pt-4">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted">Est. cost</span>
          <span className="font-medium">
            {estimatedCost} gen{estimatedCost === 1 ? "" : "s"}
            {remaining !== null && (
              <span className="text-muted"> · {remaining} left</span>
            )}
          </span>
        </div>
        {!canAfford && (
          <p className="text-xs text-warning">Not enough quota for this run.</p>
        )}
        <button
          className="btn btn-primary w-full py-3 text-sm"
          disabled={busy || !canAfford}
          onClick={onGenerate}
          type="button"
        >
          {busy ? "Generating…" : "Generate short"}
        </button>
      </div>
    </aside>
  );
}
