"use client";

import Link from "next/link";
import { statusTone } from "@/components/status-dot";

export type PreviewGeneration = {
  id: string;
  status: string;
  resultUrls?: string[];
  costGens: number;
  variantCount: number;
};

export function PreviewPane({
  previewUrl,
  message,
  generations,
  onPickUrl,
  emptyHint = "Generate your first short",
}: {
  previewUrl: string | null;
  message: string | null;
  generations: PreviewGeneration[];
  onPickUrl: (url: string) => void;
  emptyHint?: string;
}) {
  const filmstrip = generations.flatMap((g) => {
    const urls = (g.resultUrls as string[] | undefined) ?? [];
    if (urls.length === 0) {
      return [{ id: g.id, url: null as string | null, status: g.status, genId: g.id }];
    }
    return urls.map((url, idx) => ({
      id: `${g.id}-${idx}`,
      url,
      status: g.status,
      genId: g.id,
    }));
  });

  return (
    <section className="panel flex h-full flex-col items-center p-4 sm:p-5">
      <div className="mb-4 flex w-full max-w-[340px] items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold">Preview</h2>
          <p className="text-[11px] text-muted">9:16 vertical frame</p>
        </div>
        {message && (
          <span className="max-w-[55%] truncate rounded-full border border-border bg-white/[0.03] px-2.5 py-1 text-[11px] text-muted">
            {message}
          </span>
        )}
      </div>

      <div className="phone-frame aspect-[9/16] w-full max-w-[300px]">
        {previewUrl ? (
          <video
            key={previewUrl}
            className="h-full w-full object-cover"
            src={previewUrl}
            controls
            autoPlay
            loop
            muted
            playsInline
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-3 bg-gradient-to-b from-zinc-900 to-black px-6 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-border bg-white/[0.03] text-xl">
              ▶
            </div>
            <p className="text-sm font-medium text-zinc-200">{emptyHint}</p>
            <p className="text-xs text-muted">Pick a vibe on the right, then hit Generate.</p>
          </div>
        )}
      </div>

      <div className="mt-5 w-full max-w-[340px]">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-xs font-medium uppercase tracking-wider text-muted">Filmstrip</h3>
          <span className="text-[11px] text-muted">{filmstrip.length} take(s)</span>
        </div>
        {filmstrip.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border px-3 py-4 text-center text-xs text-muted">
            Variants will land here after you generate.
          </div>
        ) : (
          <div className="flex gap-2 overflow-x-auto pb-1">
            {filmstrip.slice(0, 8).map((item) => {
              const tone = statusTone(item.status);
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => item.url && onPickUrl(item.url)}
                  className="group relative h-20 w-14 flex-shrink-0 overflow-hidden rounded-lg border border-border bg-black"
                  title={tone.label}
                >
                  {item.url ? (
                    <video src={item.url} muted playsInline className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-zinc-900 text-[10px] text-muted">
                      {tone.label}
                    </div>
                  )}
                  <span className={`absolute left-1 top-1 status-dot ${tone.dot}`} />
                  <Link
                    href={`/app/generations/${item.genId}`}
                    className="absolute inset-x-0 bottom-0 bg-black/70 py-0.5 text-center text-[9px] text-zinc-300 opacity-0 transition group-hover:opacity-100"
                    onClick={(e) => e.stopPropagation()}
                  >
                    open
                  </Link>
                </button>
              );
            })}
          </div>
        )}

        <div className="mt-3 flex flex-wrap gap-1.5">
          {generations.slice(0, 4).map((g) => {
            const tone = statusTone(g.status);
            return (
              <Link
                key={g.id}
                href={`/app/generations/${g.id}`}
                className="chip hover:border-accent/40"
              >
                <span className={`status-dot ${tone.dot}`} />
                {tone.label}
                <span className="text-zinc-500">·</span>
                {g.variantCount}v
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
