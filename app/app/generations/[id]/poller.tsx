"use client";

import { useEffect, useState } from "react";

export function GenerationPoller({
  id,
  initialStatus,
  initialUrls,
  initialError,
}: {
  id: string;
  initialStatus: string;
  initialUrls: string[];
  initialError: string | null;
}) {
  const [status, setStatus] = useState(initialStatus);
  const [urls, setUrls] = useState(initialUrls);
  const [error, setError] = useState(initialError);

  useEffect(() => {
    if (status === "succeeded" || status === "failed") return;
    let cancelled = false;
    const tick = async () => {
      const res = await fetch(`/api/generations/${id}`);
      if (!res.ok || cancelled) return;
      const data = await res.json();
      setStatus(data.status);
      setUrls(data.resultUrls ?? []);
      setError(data.error ?? null);
    };
    const t = setInterval(tick, 800);
    void tick();
    return () => {
      cancelled = true;
      clearInterval(t);
    };
  }, [id, status]);

  return (
    <div className="space-y-4">
      <div className="card p-4">
        Status: <span className="font-medium">{status}</span>
        {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {urls.map((url) => (
          <div key={url} className="card overflow-hidden p-2">
            <video className="aspect-[9/16] w-full rounded-lg bg-black object-cover" src={url} controls playsInline />
          </div>
        ))}
        {status === "running" || status === "queued" ? (
          <div className="card flex aspect-[9/16] items-center justify-center text-muted">Generating…</div>
        ) : null}
      </div>
    </div>
  );
}
