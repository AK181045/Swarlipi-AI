"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  Music,
  Download,
  FileText,
  FileAudio,
  FileCode,
  ArrowLeft,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import Link from "next/link";
import { getProject, getScore, getExportUrl, type ScoreData } from "@/lib/api";
import { StaffNotation } from "@/components/score/StaffNotation";
import { SargamRenderer } from "@/components/score/SargamRenderer";
import { TrackMixer } from "@/components/studio/TrackMixer";

type NotationView = "western" | "sargam";

export default function ProjectViewPage() {
  const { id } = useParams<{ id: string }>();
  const [notationView, setNotationView] = useState<NotationView>("western");
  const [showExport, setShowExport] = useState(false);

  const { data: project, isLoading: projectLoading } = useQuery({
    queryKey: ["project", id],
    queryFn: () => getProject(id),
    enabled: !!id,
  });

  const { data: score, isLoading: scoreLoading } = useQuery({
    queryKey: ["score", id],
    queryFn: () => getScore(id),
    enabled: !!id && project?.status === "completed",
  });

  if (projectLoading || scoreLoading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div className="animate-shimmer" style={{ width: 200, height: 200 }} />
      </div>
    );
  }

  const exportFormats = [
    { format: "pdf", label: "PDF Sheet Music", icon: FileText, color: "var(--color-supernova)" },
    { format: "midi", label: "MIDI File", icon: FileAudio, color: "var(--color-pulsar-bright)" },
    { format: "musicxml", label: "MusicXML", icon: FileCode, color: "var(--color-emerald-star)" },
    { format: "gp", label: "Guitar Pro", icon: Music, color: "var(--color-solar-bright)" },
  ];

  const tracks =
    project?.stems.map((s) => ({
      id: s.id,
      instrument: s.instrument_type,
      displayName: s.display_name || s.instrument_type,
      color: "#8b5cf6",
      audioUrl: s.audio_url,
    })) || [];

  return (
    <div
      style={{
        minHeight: "100vh",
        padding: "24px 32px",
        position: "relative",
        zIndex: 1,
      }}
    >
      <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "32px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <Link
              href="/projects"
              className="btn btn-ghost"
              style={{ padding: "8px" }}
            >
              <ArrowLeft size={20} />
            </Link>
            <div>
              <h1 style={{ fontSize: "1.5rem" }}>
                {project?.title || "Score View"}
              </h1>
              <div
                style={{
                  display: "flex",
                  gap: "16px",
                  fontSize: "0.8rem",
                  color: "var(--text-secondary)",
                  marginTop: "4px",
                }}
              >
                {project?.detected_key && <span>🎵 {project.detected_key}</span>}
                {project?.detected_tempo && <span>♩ {project.detected_tempo} BPM</span>}
                {project?.detected_time_signature && <span>⏱ {project.detected_time_signature}</span>}
                {project?.detected_raga && (
                  <span style={{ color: "var(--color-solar-bright)" }}>
                    🪕 {project.detected_raga}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div style={{ display: "flex", gap: "12px" }}>
            {/* Notation Toggle */}
            <button
              className="btn btn-secondary"
              onClick={() =>
                setNotationView(
                  notationView === "western" ? "sargam" : "western"
                )
              }
            >
              {notationView === "western" ? (
                <ToggleLeft size={18} />
              ) : (
                <ToggleRight size={18} />
              )}
              {notationView === "western" ? "Switch to Sargam" : "Switch to Staff"}
            </button>

            {/* Export Button */}
            <button
              className="btn btn-primary"
              onClick={() => setShowExport(!showExport)}
            >
              <Download size={18} />
              Export
            </button>
          </div>
        </div>

        {/* Export Panel */}
        {showExport && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="glass-card"
            style={{
              padding: "24px",
              marginBottom: "24px",
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "12px",
            }}
          >
            {exportFormats.map((exp) => (
              <a
                key={exp.format}
                href={getExportUrl(id, exp.format)}
                download
                className="btn btn-secondary"
                style={{
                  padding: "16px",
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  textDecoration: "none",
                }}
              >
                <exp.icon size={20} color={exp.color} />
                <span>{exp.label}</span>
              </a>
            ))}
          </motion.div>
        )}

        {/* Main Content: Score + Mixer */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: tracks.length > 0 ? "1fr 300px" : "1fr",
            gap: "24px",
          }}
        >
          {/* Score View */}
          <div>
            {notationView === "western" ? (
              <StaffNotation
                musicXml={score?.western?.music_xml || ""}
              />
            ) : (
              <SargamRenderer
                notes={score?.sargam?.notes || []}
                raga={score?.sargam?.raga}
              />
            )}
          </div>

          {/* Track Mixer (shown when stems are available) */}
          {tracks.length > 0 && (
            <div>
              <TrackMixer
                tracks={tracks}
                onSolo={(id) => console.log("Solo:", id)}
                onMute={(id) => console.log("Mute:", id)}
                onVolumeChange={(id, vol) =>
                  console.log("Volume:", id, vol)
                }
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
