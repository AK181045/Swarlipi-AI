"use client";

import { motion } from "framer-motion";
import {
  Music,
  Plus,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2,
  Trash2,
  FileMusic,
} from "lucide-react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { listProjects, deleteProject, type Project } from "@/lib/api";
import { FileUpload } from "@/components/upload/FileUpload";
import { useState } from "react";
import { useRouter } from "next/navigation";

const statusConfig: Record<
  string,
  { icon: typeof Clock; color: string; label: string }
> = {
  pending: { icon: Clock, color: "var(--color-solar-bright)", label: "Pending" },
  ingesting: { icon: Loader2, color: "var(--color-pulsar-bright)", label: "Ingesting" },
  ingested: { icon: CheckCircle, color: "var(--color-pulsar-bright)", label: "Ingested" },
  separating: { icon: Loader2, color: "var(--color-aurora-bright)", label: "Separating" },
  separated: { icon: CheckCircle, color: "var(--color-aurora-bright)", label: "Separated" },
  transcribing: { icon: Loader2, color: "var(--color-emerald-star)", label: "Transcribing" },
  transcribed: { icon: CheckCircle, color: "var(--color-emerald-star)", label: "Transcribed" },
  mapping: { icon: Loader2, color: "var(--color-cosmic-rose)", label: "Generating Notation" },
  completed: { icon: CheckCircle, color: "var(--color-emerald-star)", label: "Completed" },
  failed: { icon: AlertCircle, color: "var(--color-supernova)", label: "Failed" },
};

export default function ProjectsPage() {
  const [showUpload, setShowUpload] = useState(false);
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["projects"],
    queryFn: () => listProjects(1, 50),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteProject,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["projects"] }),
  });

  const handleUploadSuccess = (project: { id: string }) => {
    queryClient.invalidateQueries({ queryKey: ["projects"] });
    router.push(`/projects/${project.id}/processing`);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        padding: "80px 32px 40px",
        position: "relative",
        zIndex: 1,
      }}
    >
      {/* Header */}
      <div
        style={{
          maxWidth: "1000px",
          margin: "0 auto",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "32px",
          }}
        >
          <div>
            <Link
              href="/"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                textDecoration: "none",
                marginBottom: "16px",
              }}
            >
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: "var(--radius-sm)",
                  background: "var(--gradient-aurora)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Music size={16} color="white" />
              </div>
              <span style={{ fontWeight: 700, fontFamily: "var(--font-display)" }}>
                SwarLipi AI
              </span>
            </Link>
            <h1 style={{ fontSize: "2rem" }}>My Projects</h1>
            <p style={{ color: "var(--text-secondary)", marginTop: "4px" }}>
              {data?.total || 0} transcription projects
            </p>
          </div>

          <motion.button
            className="btn btn-primary"
            onClick={() => setShowUpload(!showUpload)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Plus size={18} />
            New Project
          </motion.button>
        </div>

        {/* Upload Panel */}
        {showUpload && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="glass-card"
            style={{ padding: "32px", marginBottom: "32px" }}
          >
            <h3 style={{ marginBottom: "20px", textAlign: "center" }}>
              Start a New Transcription
            </h3>
            <FileUpload
              onSuccess={handleUploadSuccess}
              onError={(err) => console.error(err)}
            />
          </motion.div>
        )}

        {/* Projects Grid */}
        {isLoading ? (
          <div style={{ textAlign: "center", padding: "80px" }}>
            <Loader2
              size={40}
              className="animate-spin"
              color="var(--color-aurora-bright)"
            />
            <p style={{ color: "var(--text-secondary)", marginTop: "16px" }}>
              Loading projects...
            </p>
          </div>
        ) : data?.projects.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="glass-card"
            style={{ padding: "80px 32px", textAlign: "center" }}
          >
            <FileMusic
              size={64}
              color="var(--text-muted)"
              style={{ margin: "0 auto 24px" }}
            />
            <h3 style={{ marginBottom: "8px" }}>No projects yet</h3>
            <p style={{ color: "var(--text-secondary)", marginBottom: "24px" }}>
              Upload an audio file or paste a YouTube URL to get started.
            </p>
            <button
              className="btn btn-primary"
              onClick={() => setShowUpload(true)}
            >
              <Plus size={18} />
              Create First Project
            </button>
          </motion.div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
              gap: "16px",
            }}
          >
            {data?.projects.map((project, i) => {
              const status = statusConfig[project.status] || statusConfig.pending;
              const StatusIcon = status.icon;
              const isProcessing = [
                "ingesting",
                "separating",
                "transcribing",
                "mapping",
              ].includes(project.status);

              return (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="glass-card"
                  style={{ padding: "24px", cursor: "pointer" }}
                  onClick={() => {
                    if (isProcessing) {
                      router.push(`/projects/${project.id}/processing`);
                    } else {
                      router.push(`/projects/${project.id}`);
                    }
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "start",
                      marginBottom: "12px",
                    }}
                  >
                    <h4
                      style={{
                        fontSize: "1rem",
                        fontWeight: 600,
                        flex: 1,
                      }}
                    >
                      {project.title}
                    </h4>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm("Delete this project?")) {
                          deleteMutation.mutate(project.id);
                        }
                      }}
                      className="btn btn-ghost"
                      style={{ padding: "4px" }}
                    >
                      <Trash2 size={14} color="var(--text-muted)" />
                    </button>
                  </div>

                  {/* Status badge */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      marginBottom: "12px",
                    }}
                  >
                    <StatusIcon
                      size={14}
                      color={status.color}
                      className={isProcessing ? "animate-spin" : ""}
                    />
                    <span
                      style={{
                        fontSize: "0.8rem",
                        color: status.color,
                        fontWeight: 600,
                      }}
                    >
                      {status.label}
                    </span>
                  </div>

                  {/* Metadata */}
                  <div
                    style={{
                      display: "flex",
                      gap: "16px",
                      fontSize: "0.75rem",
                      color: "var(--text-tertiary)",
                    }}
                  >
                    {project.detected_key && (
                      <span>🎵 {project.detected_key}</span>
                    )}
                    {project.detected_tempo && (
                      <span>♩ {project.detected_tempo} BPM</span>
                    )}
                    {project.duration_seconds && (
                      <span>
                        ⏱{" "}
                        {Math.floor(project.duration_seconds / 60)}:
                        {String(project.duration_seconds % 60).padStart(2, "0")}
                      </span>
                    )}
                  </div>

                  <p
                    style={{
                      fontSize: "0.75rem",
                      color: "var(--text-muted)",
                      marginTop: "12px",
                    }}
                  >
                    {new Date(project.created_at).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
