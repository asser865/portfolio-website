"use client";

import { useEffect } from "react";

/**
 * Route-level error boundary. The most common production trigger for a
 * static export is deploy-version skew: a cached HTML shell requesting
 * hashed chunks that no longer exist. That case is self-healing — reload
 * once automatically; anything else gets a branded recovery screen.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Version skew (stale HTML → purged hashed chunks) is by far the most
    // likely production error on a static export, and a reload always
    // heals it — so reload once per path on ANY first error before ever
    // showing this screen. The guard prevents loops on genuine crashes.
    try {
      const key = "reload-once:" + window.location.pathname;
      if (!sessionStorage.getItem(key)) {
        sessionStorage.setItem(key, "1");
        window.location.reload();
        return;
      }
    } catch {
      /* sessionStorage unavailable — fall through to the screen */
    }
  }, [error]);

  return (
    <main className="flex min-h-[100svh] flex-col items-center justify-center px-6 text-center">
      <p className="text-label mb-6">Error</p>
      <h1 className="text-display text-[clamp(2.2rem,6vw,4.5rem)] text-white">
        Something glitched.
      </h1>
      <p className="mt-6 max-w-md text-sm leading-relaxed text-white/64">
        An unexpected error interrupted this page — reloading usually clears it.
      </p>
      <div className="mt-10 flex gap-4">
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="glass text-label rounded-full px-7 py-4 !text-white transition-colors hover:bg-white hover:!text-black"
        >
          Reload
        </button>
        <button
          type="button"
          onClick={reset}
          className="text-label rounded-full border border-white/14 px-7 py-4 !text-white/64 transition-colors hover:!text-white"
        >
          Try again
        </button>
      </div>
    </main>
  );
}
