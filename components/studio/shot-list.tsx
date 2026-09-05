"use client";

import { StatusDot } from "@/components/status-dot";

export type ShotListItem = {
  id: string;
  title: string;
  durationSec: number;
  cameraPreset: string;
  generations: { status: string }[];
};

export function ShotList({
  shots,
  selectedId,
  onSelect,
  onAdd,
}: {
  shots: ShotListItem[];
  selectedId: string;
  onSelect: (id: string) => void;
  onAdd: () => void;
}) {
  return (
    <aside className="panel flex h-full flex-col p-3">
      <div className="mb-3 flex items-center justify-between px-1">
        <div>
          <h2 className="text-sm font-semibold">Shot list</h2>
          <p className="text-[11px] text-muted">Build your sequence</p>
        </div>
        <button className="btn btn-ghost px-2.5 py-1 text-xs" onClick={onAdd} type="button">
          + Add
        </button>
      </div>

      {shots.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center rounded-xl border border-dashed border-border px-4 py-8 text-center">
          <p className="mb-3 text-sm text-muted">No shots yet. Add your first beat.</p>
          <button className="btn btn-primary px-4 py-2 text-xs" onClick={onAdd} type="button">
            Add shot
          </button>
        </div>
      ) : (
        <ul className="space-y-1 overflow-y-auto">
          {shots.map((s, i) => {
            const latest = s.generations[0]?.status;
            const active = s.id === selectedId;
            return (
              <li key={s.id}>
                <button
                  type="button"
                  onClick={() => onSelect(s.id)}
                  className={`flex w-full items-start gap-2.5 rounded-xl px-3 py-2.5 text-left transition ${
                    active
                      ? "bg-violet-500/15 ring-1 ring-violet-400/40"
                      : "hover:bg-white/[0.04]"
                  }`}
                >
                  <StatusDot status={latest} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-medium uppercase tracking-wider text-muted">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className={`truncate text-sm font-medium ${active ? "text-foreground" : "text-zinc-300"}`}>
                        {s.title}
                      </span>
                    </div>
                    <div className="mt-0.5 truncate text-[11px] text-muted">
                      {s.durationSec}s · {s.cameraPreset.replace("_", " ")}
                    </div>
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </aside>
  );
}
