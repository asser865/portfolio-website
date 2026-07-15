"use client";

/**
 * Last-resort boundary (errors in the root layout itself).
 * Must render its own <html>/<body>.
 */
export default function GlobalError({
  error,
}: {
  error: Error & { digest?: string };
}) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100svh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "1.5rem",
          background: "#060606",
          color: "#f2f2f2",
          fontFamily: "system-ui, sans-serif",
          textAlign: "center",
          padding: "0 1.5rem",
        }}
      >
        <h1 style={{ fontSize: "2rem", fontWeight: 600, letterSpacing: "-0.02em" }}>
          Something glitched.
        </h1>
        <p style={{ maxWidth: 420, opacity: 0.64, lineHeight: 1.6, fontSize: 14 }}>
          An unexpected error interrupted this page — reloading usually clears it.
          {error?.digest ? ` (ref: ${error.digest})` : ""}
        </p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          style={{
            border: "1px solid rgba(255,255,255,0.2)",
            background: "rgba(255,255,255,0.06)",
            color: "#fff",
            borderRadius: 999,
            padding: "0.9rem 1.8rem",
            fontSize: 12,
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            cursor: "pointer",
          }}
        >
          Reload
        </button>
      </body>
    </html>
  );
}
