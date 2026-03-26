"use client";

import { motion } from "framer-motion";
import {
  Music,
  Upload,
  Globe,
  Mic,
  Guitar,
  Drum,
  Piano,
  ArrowRight,
  Sparkles,
  Zap,
  FileMusic,
  Languages,
} from "lucide-react";
import Link from "next/link";

const features = [
  {
    icon: Upload,
    title: "Multi-Source Input",
    description:
      "Upload MP3, WAV, FLAC files or paste YouTube/Vimeo URLs for instant processing.",
    color: "var(--color-aurora-bright)",
  },
  {
    icon: Mic,
    title: "AI Stem Separation",
    description:
      "Demucs v5 separates your track into Vocals, Drums, Bass, Piano, Guitar & more.",
    color: "var(--color-pulsar-bright)",
  },
  {
    icon: FileMusic,
    title: "Smart Transcription",
    description:
      "Google MT3 converts each stem into precise polyphonic notation automatically.",
    color: "var(--color-emerald-star)",
  },
  {
    icon: Languages,
    title: "Dual Notation",
    description:
      "Switch between Western Staff and Indian Sargam notation with one click.",
    color: "var(--color-solar-bright)",
  },
];

const instruments = [
  { icon: Mic, name: "Vocals", color: "#ec4899" },
  { icon: Drum, name: "Drums", color: "#f59e0b" },
  { icon: Guitar, name: "Guitar", color: "#10b981" },
  { icon: Piano, name: "Piano", color: "#06b6d4" },
];

export default function HomePage() {
  return (
    <div style={{ position: "relative", zIndex: 1 }}>
      {/* ── Navigation ── */}
      <nav
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 50,
          padding: "16px 32px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: "rgba(10, 10, 15, 0.8)",
          backdropFilter: "blur(20px)",
          borderBottom: "1px solid var(--border-subtle)",
        }}
      >
        <Link
          href="/"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            textDecoration: "none",
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: "var(--radius-md)",
              background: "var(--gradient-aurora)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Music size={20} color="white" />
          </div>
          <span
            style={{
              fontSize: "1.25rem",
              fontWeight: 700,
              fontFamily: "var(--font-display)",
              color: "var(--text-primary)",
            }}
          >
            SwarLipi AI
          </span>
        </Link>

        <div style={{ display: "flex", gap: "12px" }}>
          <Link href="/projects" className="btn btn-ghost">
            My Projects
          </Link>
          <Link href="/(auth)/login" className="btn btn-primary">
            Get Started
            <ArrowRight size={16} />
          </Link>
        </div>
      </nav>

      {/* ── Hero Section ── */}
      <section
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          padding: "120px 32px 80px",
          position: "relative",
        }}
      >
        {/* Floating music notes background */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            overflow: "hidden",
            pointerEvents: "none",
          }}
        >
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              animate={{
                y: [0, -20, 0],
                opacity: [0.1, 0.3, 0.1],
              }}
              transition={{
                duration: 4 + i,
                repeat: Infinity,
                delay: i * 0.8,
              }}
              style={{
                position: "absolute",
                left: `${15 + i * 14}%`,
                top: `${20 + (i % 3) * 25}%`,
                fontSize: "2rem",
                color: "var(--color-aurora-glow)",
              }}
            >
              ♪
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div
            className="badge badge-aurora"
            style={{ marginBottom: "24px", fontSize: "0.8rem" }}
          >
            <Sparkles size={14} style={{ marginRight: 6 }} />
            Powered by AI • Google MT3 + Demucs v5
          </div>

          <h1
            style={{
              fontSize: "clamp(2.5rem, 6vw, 4.5rem)",
              fontWeight: 800,
              lineHeight: 1.1,
              marginBottom: "24px",
              background:
                "linear-gradient(135deg, var(--text-primary) 0%, var(--color-aurora-glow) 50%, var(--color-pulsar-bright) 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            Transform Audio Into
            <br />
            Sheet Music Magic
          </h1>

          <p
            style={{
              fontSize: "1.25rem",
              color: "var(--text-secondary)",
              maxWidth: "640px",
              marginBottom: "40px",
              lineHeight: 1.6,
            }}
          >
            Upload any song or paste a YouTube URL.
            <br />
            Get multi-instrument notation in{" "}
            <strong style={{ color: "var(--color-aurora-glow)" }}>
              Western Staff
            </strong>{" "}
            and{" "}
            <strong style={{ color: "var(--color-solar-bright)" }}>
              Indian Sargam
            </strong>{" "}
            in minutes.
          </p>

          <div style={{ display: "flex", gap: "16px", justifyContent: "center" }}>
            <Link
              href="/projects"
              className="btn btn-primary"
              style={{ padding: "14px 32px", fontSize: "1rem" }}
            >
              <Zap size={18} />
              Start New Project
            </Link>
            <button
              className="btn btn-secondary"
              style={{ padding: "14px 32px", fontSize: "1rem" }}
            >
              <Globe size={18} />
              Watch Demo
            </button>
          </div>
        </motion.div>

        {/* Instrument Icons Row */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          style={{
            display: "flex",
            gap: "24px",
            marginTop: "64px",
          }}
        >
          {instruments.map((inst, i) => (
            <motion.div
              key={inst.name}
              animate={{ y: [0, -8, 0] }}
              transition={{
                duration: 3,
                repeat: Infinity,
                delay: i * 0.3,
              }}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: "var(--radius-lg)",
                  background: `${inst.color}15`,
                  border: `1px solid ${inst.color}30`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <inst.icon size={24} color={inst.color} />
              </div>
              <span
                style={{
                  fontSize: "0.75rem",
                  color: "var(--text-tertiary)",
                  fontWeight: 500,
                }}
              >
                {inst.name}
              </span>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ── Features Section ── */}
      <section
        style={{
          padding: "80px 32px",
          maxWidth: "1200px",
          margin: "0 auto",
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          style={{ textAlign: "center", marginBottom: "64px" }}
        >
          <h2
            style={{
              fontSize: "2.5rem",
              marginBottom: "16px",
            }}
          >
            How It Works
          </h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "1.1rem" }}>
            From raw audio to professional notation in four intelligent steps.
          </p>
        </motion.div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: "24px",
          }}
        >
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="glass-card"
              style={{ padding: "32px" }}
            >
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: "var(--radius-md)",
                  background: `${feature.color}15`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "20px",
                }}
              >
                <feature.icon size={24} color={feature.color} />
              </div>
              <h3
                style={{
                  fontSize: "1.2rem",
                  marginBottom: "8px",
                }}
              >
                {feature.title}
              </h3>
              <p
                style={{
                  color: "var(--text-secondary)",
                  fontSize: "0.9rem",
                  lineHeight: 1.6,
                }}
              >
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── CTA Section ── */}
      <section
        style={{
          padding: "80px 32px",
          textAlign: "center",
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="glass-card"
          style={{
            maxWidth: "800px",
            margin: "0 auto",
            padding: "64px 48px",
            background:
              "linear-gradient(135deg, rgba(124, 58, 237, 0.1), rgba(6, 182, 212, 0.05))",
          }}
        >
          <h2 style={{ fontSize: "2rem", marginBottom: "16px" }}>
            Ready to Transcribe?
          </h2>
          <p
            style={{
              color: "var(--text-secondary)",
              marginBottom: "32px",
              fontSize: "1.1rem",
            }}
          >
            Upload your first song and experience the power of AI-driven music
            transcription.
          </p>
          <Link
            href="/projects"
            className="btn btn-primary"
            style={{ padding: "16px 40px", fontSize: "1.1rem" }}
          >
            <Music size={20} />
            Start Free
            <ArrowRight size={18} />
          </Link>
        </motion.div>
      </section>

      {/* ── Footer ── */}
      <footer
        style={{
          padding: "32px",
          textAlign: "center",
          borderTop: "1px solid var(--border-subtle)",
          color: "var(--text-muted)",
          fontSize: "0.85rem",
        }}
      >
        <p>© 2026 SwarLipi AI. Powered by Google Antigravity.</p>
      </footer>
    </div>
  );
}
