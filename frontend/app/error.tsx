"use client";

import { useEffect } from "react";
import { AlertCircle, RefreshCcw, Home } from "lucide-react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Next.js App Error:", error);
  }, [error]);

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        background: "var(--color-void)",
        color: "white",
        textAlign: "center"
      }}
    >
      <div
        style={{
          padding: "40px",
          background: "rgba(255, 68, 68, 0.05)",
          border: "1px solid rgba(255, 68, 68, 0.2)",
          borderRadius: "24px",
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
        
        <h2 style={{ fontSize: "1.8rem", marginBottom: "16px" }}>Something went wrong</h2>
        <p style={{ color: "var(--text-secondary)", marginBottom: "32px", fontSize: "0.95rem" }}>
          We encountered an error while trying to render this page. Our engineers (Anil Khichar) have been notified.
        </p>

        {error.message && (
          <code style={{ display: "block", padding: "12px", background: "black", borderRadius: "8px", marginBottom: "32px", fontSize: "0.8rem", color: "#ff8888", textAlign: "left" }}>
            {error.message}
          </code>
        )}

        <div style={{ display: "flex", gap: "16px", justifyContent: "center" }}>
          <button
            onClick={() => reset()}
            className="btn btn-primary"
            style={{ borderRadius: "100px" }}
          >
            <RefreshCcw size={18} />
            Try again
          </button>
          <Link
            href="/"
            className="btn btn-secondary"
            style={{ borderRadius: "100px" }}
          >
            <Home size={18} />
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
