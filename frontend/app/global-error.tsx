"use client";

import { RefreshCcw, AlertCircle } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0 }}>
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "24px",
            background: "#020205",
            color: "white",
            textAlign: "center",
            fontFamily: "system-ui, -apple-system, sans-serif"
          }}
        >
          <div
            style={{
              padding: "48px",
              background: "rgba(255, 68, 68, 0.05)",
              border: "1px solid rgba(255, 68, 68, 0.2)",
              borderRadius: "32px",
              maxWidth: "500px",
              width: "100%"
            }}
          >
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: 32,
                background: "rgba(255, 68, 68, 0.1)",
                margin: "0 auto 24px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              <AlertCircle size={32} color="#ff4444" />
            </div>
            
            <h1 style={{ fontSize: "2rem", marginBottom: "16px" }}>Fatal Link Interruption</h1>
            <p style={{ color: "#a1a1aa", marginBottom: "32px", lineHeight: 1.6 }}>
              A critical structural error occurred at the layout level.
              We're refreshing the connection to the SwarLipi core.
            </p>

            <button
              onClick={() => reset()}
              style={{
                background: "#7c3aed",
                color: "white",
                padding: "14px 40px",
                borderRadius: "100px",
                border: "none",
                fontWeight: 700,
                fontSize: "1rem",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: "10px",
                boxShadow: "0 0 20px rgba(124, 58, 237, 0.3)"
              }}
            >
              <RefreshCcw size={18} />
              Re-initialize Core
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
