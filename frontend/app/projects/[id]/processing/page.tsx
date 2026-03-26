"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useParams, useRouter } from "next/navigation";
import { Loader2, CheckCircle, Music, AlertTriangle } from "lucide-react";
import { getProjectStatus, createStatusWebSocket, type ProjectStatus } from "@/lib/api";

const steps = [
  { key: "ingesting", label: "Extracting Audio", emoji: "🎵" },
  { key: "separating", label: "Separating Stems", emoji: "🎚️" },
  { key: "transcribing", label: "AI Transcription", emoji: "🧠" },
  { key: "mapping", label: "Generating Notation", emoji: "📝" },
  { key: "completed", label: "Score Ready!", emoji: "✨" },
];

const statusOrder = [
  "pending",
  "ingesting",
  "ingested",
  "separating",
  "separated",
  "transcribing",
  "transcribed",
  "mapping",
  "completed",
];

export default function ProcessingPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [status, setStatus] = useState<ProjectStatus | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    // Initial fetch
    getProjectStatus(id).then(setStatus).catch(console.error);

    // Poll every 3 seconds
    const interval = setInterval(async () => {
      try {
        const s = await getProjectStatus(id);
        setStatus(s);

        if (s.status === "completed") {
          clearInterval(interval);
          setTimeout(() => router.push(`/projects/${id}`), 1500);
        }
        if (s.status === "failed") {
          clearInterval(interval);
          setError(s.error_message || "Processing failed");
        }
      } catch (err) {
        console.error("Status poll error:", err);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [id, router]);

  const currentStatusIndex = statusOrder.indexOf(status?.status || "pending");
  const progress = status?.progress_percent || 0;

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "32px",
        position: "relative",
        zIndex: 1,
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-card"
        style={{
          padding: "48px",
          maxWidth: "500px",
          width: "100%",
          textAlign: "center",
        }}
      >
        {/* Animated Music Icon */}
        <motion.div
          animate={{
            rotate: status?.status === "completed" ? 0 : 360,
            scale: status?.status === "completed" ? [1, 1.2, 1] : 1,
          }}
          transition={{
            rotate: { duration: 4, repeat: status?.status === "completed" ? 0 : Infinity, ease: "linear" },
            scale: { duration: 0.5 },
          }}
          style={{
            width: 80,
            height: 80,
            borderRadius: "var(--radius-xl)",
            background: error
              ? "rgba(239, 68, 68, 0.15)"
              : status?.status === "completed"
                ? "rgba(16, 185, 129, 0.15)"
                : "rgba(124, 58, 237, 0.15)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 24px",
          }}
        >
          {error ? (
            <AlertTriangle size={36} color="var(--color-supernova)" />
          ) : status?.status === "completed" ? (
            <CheckCircle size={36} color="var(--color-emerald-star)" />
          ) : (
            <Music size={36} color="var(--color-aurora-bright)" />
          )}
        </motion.div>

        <h2 style={{ marginBottom: "8px" }}>
          {error
            ? "Processing Failed"
            : status?.status === "completed"
              ? "Transcription Complete!"
              : "Processing Your Music"}
        </h2>

        <p
          style={{
            color: "var(--text-secondary)",
            marginBottom: "32px",
          }}
        >
          {error || status?.current_step || "Preparing..."}
        </p>

        {/* Progress Bar */}
        {!error && (
          <div style={{ marginBottom: "32px" }}>
            <div className="progress-bar" style={{ height: "8px", marginBottom: "8px" }}>
              <motion.div
                className="progress-bar-fill"
                initial={{ width: "0%" }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
            <span
              style={{
                fontSize: "0.85rem",
                color: "var(--text-tertiary)",
                fontWeight: 600,
              }}
            >
              {progress}%
            </span>
          </div>
        )}

        {/* Step Indicators */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "12px",
            textAlign: "left",
          }}
        >
          {steps.map((step, i) => {
            const stepIndex = statusOrder.indexOf(step.key);
            const isActive =
              status?.status === step.key ||
              (step.key === "separating" && status?.status === "separated") ||
              (step.key === "transcribing" && status?.status === "transcribed");
            const isComplete = currentStatusIndex > stepIndex;
            const isPending = currentStatusIndex < stepIndex;

            return (
              <motion.div
                key={step.key}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "8px 12px",
                  borderRadius: "var(--radius-md)",
                  background: isActive
                    ? "rgba(124, 58, 237, 0.1)"
                    : "transparent",
                  opacity: isPending ? 0.4 : 1,
                }}
              >
                <span style={{ fontSize: "1.2rem" }}>
                  {isComplete ? "✅" : isActive ? step.emoji : "⏳"}
                </span>
                <span
                  style={{
                    fontSize: "0.85rem",
                    fontWeight: isActive ? 600 : 400,
                    color: isActive
                      ? "var(--text-primary)"
                      : "var(--text-secondary)",
                  }}
                >
                  {step.label}
                </span>
                {isActive && !isComplete && status?.status !== "completed" && (
                  <Loader2
                    size={14}
                    className="animate-spin"
                    color="var(--color-aurora-bright)"
                    style={{ marginLeft: "auto" }}
                  />
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Error retry / Success navigate */}
        {error && (
          <button
            className="btn btn-secondary"
            onClick={() => router.push("/projects")}
            style={{ marginTop: "24px" }}
          >
            Back to Projects
          </button>
        )}

        {status?.status === "completed" && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
              color: "var(--color-emerald-star)",
              marginTop: "16px",
              fontSize: "0.85rem",
            }}
          >
            Redirecting to your score...
          </motion.p>
        )}
      </motion.div>
    </div>
  );
}
