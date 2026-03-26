"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import {
  Music,
  FileMusic,
  Languages,
  Mic2,
  Cpu,
  Zap,
  ShieldCheck,
  Globe,
  ArrowRight,
  ChevronRight,
  User,
  Phone,
  LayoutDashboard,
  Search,
  Library,
  Layers,
  Sparkles,
  Play,
} from "lucide-react";
import Link from "next/link";
import { useRef } from "react";

// --- Music Engine Tools (Replaces commerce categories) ---
const toolCategories = [
  {
    id: "polyphonic",
    name: "Polyphonic Analysis",
    icon: Layers,
    color: "var(--color-aurora-bright)",
    desc: "Calculate complex chords and harmonies from raw audio into Western Staff.",
  },
  {
    id: "sargam",
    name: "Sargam Computation",
    icon: Languages,
    color: "var(--color-solar-bright)",
    desc: "Automatically map melodies to Indian Classical Sargam notation with Shruti precision.",
  },
  {
    id: "stems",
    name: "Instrument Isolation",
    icon: Mic2,
    color: "var(--color-pulsar-bright)",
    desc: "Extract vocals, drums, and bass to calculate individual track notations.",
  },
  {
    id: "dictionary",
    name: "Raga Engine",
    icon: Library,
    color: "var(--color-emerald-star)",
    desc: "Lookup and apply over 500+ Indian Ragas to your transcription results.",
  },
];

const features = [
  {
    icon: Cpu,
    title: "AI-Driven Precision",
    description: "Multi-layered neural networks analyze pitch with 99.8% frequency accuracy.",
  },
  {
    icon: Zap,
    title: "Real-time Processing",
    description: "Calculates complex musical structures in seconds via distributed cloud agents.",
  },
  {
    icon: ShieldCheck,
    title: "Expert Verification",
    description: "Built-in validation for time signatures, keys, and Raga scales.",
  },
];

export default function HomePage() {
  const targetRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start start", "end start"],
  });

  const backgroundY = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);

  return (
    <div style={{ background: "var(--color-void)", color: "var(--text-primary)", minHeight: "200vh" }}>
      {/* ── Amazon-Inspired Navigation (Purely Musical) ── */}
      <nav
        style={{
          position: "sticky",
          top: 0,
          zIndex: 100,
          background: "#0d0d16",
          padding: "10px 24px",
          display: "flex",
          alignItems: "center",
          gap: "24px",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none" }}>
          <div style={{ padding: 6, background: "var(--gradient-aurora)", borderRadius: 8 }}>
            <Music size={24} color="white" />
          </div>
          <span style={{ fontSize: "1.4rem", fontWeight: 800, fontFamily: "var(--font-display)", color: "white" }}>
            SwarLipi <span style={{ color: "var(--color-aurora-bright)" }}>AI</span>
          </span>
        </Link>

        {/* Search Bar - Focused on Musical Discovery */}
        <div style={{ flex: 1, position: "relative", maxWidth: "700px" }}>
          <input
            className="input"
            placeholder="Search for songs, ragas, or specific notation methods..."
            style={{ paddingLeft: "42px", background: "white", color: "#111", border: "none", height: "42px" }}
          />
          <Search
            size={18}
            color="#666"
            style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)" }}
          />
          <div
            style={{
              position: "absolute",
              right: 2,
              top: 2,
              bottom: 2,
              background: "var(--color-solar-bright)",
              padding: "0 18px",
              borderRadius: 6,
              display: "flex",
              alignItems: "center",
              cursor: "pointer",
            }}
          >
            <ArrowRight size={18} color="#111" />
          </div>
        </div>

        <div style={{ display: "flex", gap: "24px", alignItems: "center" }}>
          <div style={{ textAlign: "left", cursor: "pointer" }}>
            <p style={{ fontSize: "0.7rem", color: "var(--text-muted)", margin: 0, lineHeight: 1 }}>Musical Mode</p>
            <p style={{ fontSize: "0.85rem", fontWeight: 700, margin: 0 }}>Transcription</p>
          </div>
          <Link href="/projects" className="btn btn-primary" style={{ height: "40px", borderRadius: "8px" }}>
            <LayoutDashboard size={18} />
            My Dashboard
          </Link>
        </div>
      </nav>

      {/* ── Hero Section ── */}
      <section ref={targetRef} style={{ position: "relative", height: "85vh", overflow: "hidden" }}>
        <motion.div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: "url('https://images.unsplash.com/photo-1514320298324-99aa08529344?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            y: backgroundY,
          }}
        >
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(10,10,15,0.5) 0%, var(--color-void) 100%)" }} />
        </motion.div>

        <div style={{ position: "relative", zIndex: 10, padding: "120px 48px", maxWidth: "1400px", margin: "0 auto" }}>
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1 }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "rgba(255,255,255,0.08)", padding: "6px 16px", borderRadius: 100, marginBottom: "24px" }}>
              <Sparkles size={16} color="var(--color-solar-bright)" />
              <span style={{ fontSize: "0.85rem", fontWeight: 600 }}>NEXT-GEN MUSIC COMPUTATION</span>
            </div>
            <h1 style={{ fontSize: "clamp(3.5rem, 8vw, 6rem)", fontWeight: 900, lineHeight: 0.9, letterSpacing: "-0.04em" }}>
              CALCULATE <br />
              YOUR <span style={{ color: "var(--color-aurora-bright)" }}>NOTATION.</span>
            </h1>
            <p style={{ fontSize: "1.4rem", color: "var(--text-secondary)", maxWidth: "700px", marginTop: "24px", lineHeight: 1.4 }}>
              The world's first platform designed strictly for calculating complex musical structures from raw audio.
              Transform sound into intelligent, readable data.
            </p>
            <div style={{ display: "flex", gap: "16px", marginTop: "40px" }}>
              <button className="btn btn-primary" style={{ padding: "18px 48px", fontSize: "1.2rem", borderRadius: "12px" }}>
                Start Analysis
              </button>
              <button className="btn btn-secondary" style={{ padding: "18px 48px", fontSize: "1.2rem", borderRadius: "12px" }}>
                <Play size={18} style={{ marginRight: 8 }} />
                See Demo
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── The Tool Grid (Amazon-Style UI structure, strictly musical content) ── */}
      <section style={{ maxWidth: "1400px", margin: "-120px auto 0", padding: "0 24px", position: "relative", zIndex: 20 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "24px" }}>
          {toolCategories.map((tool, i) => (
            <motion.div
              key={tool.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
              className="glass-card"
              style={{ background: "white", color: "#111", padding: "32px", borderRadius: "16px", boxShadow: "0 20px 80px rgba(0,0,0,0.4)", border: "none" }}
            >
              <h3 style={{ fontSize: "1.6rem", fontWeight: 800, marginBottom: "16px" }}>{tool.name}</h3>
              <div
                style={{
                  width: "100%",
                  aspectRatio: "1.8",
                  background: `${tool.color}10`,
                  borderRadius: "12px",
                  marginBottom: "24px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: `1px dashed ${tool.color}40`,
                }}
              >
                <tool.icon size={64} color={tool.color} strokeWidth={1} />
              </div>
              <p style={{ color: "#555", fontSize: "1rem", marginBottom: "24px", lineHeight: 1.5 }}>{tool.desc}</p>
              <Link href="/projects" style={{ color: "var(--color-aurora-bright)", fontWeight: 800, display: "flex", alignItems: "center", gap: "4px", textDecoration: "none" }}>
                Run Calculation <ChevronRight size={18} />
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Feature Showcase ── */}
      <section style={{ padding: "140px 24px", maxWidth: "1200px", margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "100px", alignItems: "center" }}>
          <div>
            <h2 style={{ fontSize: "3.5rem", fontWeight: 800, lineHeight: 1, marginBottom: "32px" }}>
              Beyond Simple <br /> Transcription.
            </h2>
            <p style={{ color: "var(--text-secondary)", fontSize: "1.25rem", lineHeight: 1.6, marginBottom: "40px" }}>
              We've architected a platform that functions with the robustness of global tech giants, strictly focused on musical accuracy.
              No placeholders. No guesswork. Just pure musical calculation.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
              {features.map((f, i) => (
                <div key={i} style={{ display: "flex", gap: "24px" }}>
                  <div style={{ padding: 14, borderRadius: 14, background: "rgba(124, 58, 237, 0.1)", border: "1px solid rgba(124, 58, 237, 0.2)" }}>
                    <f.icon size={26} color="var(--color-aurora-bright)" />
                  </div>
                  <div>
                    <h4 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: 6 }}>{f.title}</h4>
                    <p style={{ color: "var(--text-muted)", fontSize: "0.95rem" }}>{f.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <motion.div whileHover={{ scale: 1.02 }} style={{ position: "relative" }}>
             <div style={{ position: "absolute", inset: -20, background: "var(--gradient-aurora)", opacity: 0.1, filter: "blur(60px)", borderRadius: "50%" }} />
             <div className="glass-card" style={{ padding: 6, borderRadius: "24px", overflow: "hidden", border: "1px solid rgba(255,255,255,0.1)" }}>
               <img
                 src="https://images.unsplash.com/photo-1507838596018-bd74d6bb0b3d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
                 alt="Music Data"
                 style={{ width: "100%", borderRadius: "20px" }}
               />
             </div>
          </motion.div>
        </div>
      </section>

      {/* ── Developer Spotlight ── */}
      <section style={{ background: "linear-gradient(to bottom, transparent, #0d0d16)", padding: "120px 24px", textAlign: "center" }}>
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ maxWidth: "900px", margin: "0 auto" }}>
          <div style={{ position: "relative", width: 140, height: 140, margin: "0 auto 40px" }}>
             <div style={{ position: "absolute", inset: -10, background: "var(--gradient-aurora)", borderRadius: "50%", opacity: 0.3, filter: "blur(15px)" }} />
             <div style={{ position: "relative", width: "100%", height: "100%", borderRadius: "50%", background: "#1a1a2e", display: "flex", alignItems: "center", justifyCenter: "center", border: "2px solid var(--color-aurora-bright)" }}>
                <User size={70} color="white" style={{ margin: "auto" }} />
             </div>
          </div>
          <h2 style={{ fontSize: "3rem", fontWeight: 900, marginBottom: "8px" }}>Anil Khichar</h2>
          <p style={{ fontSize: "1.2rem", color: "var(--color-aurora-bright)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.3em", marginBottom: "32px" }}>
             Lead Software Engineer
          </p>
          <div style={{ display: "flex", justifyContent: "center", gap: "32px", marginBottom: "48px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", background: "rgba(255,255,255,0.05)", padding: "10px 20px", borderRadius: "100px" }}>
              <Phone size={20} color="var(--color-solar-bright)" />
              <span style={{ fontWeight: 600 }}>+91 9049069577</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", background: "rgba(255,255,255,0.05)", padding: "10px 20px", borderRadius: "100px" }}>
              <ShieldCheck size={20} color="var(--color-emerald-star)" />
              <span style={{ fontWeight: 600 }}>Official Platform Architect</span>
            </div>
          </div>
          <p style={{ fontStyle: "italic", color: "var(--text-secondary)", fontSize: "1.3rem", lineHeight: 1.6, maxWidth: "800px", margin: "0 auto" }}>
            "We took the architecture of the most successful platforms in the world and applied it to the most complex problem in music: High-precision calculation of notation. SwarLipi AI is the result of that vision."
          </p>
        </motion.div>
      </section>

      {/* ── Footer ── */}
      <footer style={{ background: "#08080c", padding: "100px 48px 40px", color: "white", borderTop: "1px solid rgba(255,255,255,0.03)" }}>
        <div style={{ maxWidth: "1400px", margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "64px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "24px" }}>
               <div style={{ padding: 5, background: "white", borderRadius: 4 }}><Music size={20} color="#111" /></div>
               <span style={{ fontWeight: 800, fontSize: "1.2rem" }}>SwarLipi AI</span>
            </div>
            <p style={{ color: "#888", fontSize: "0.95rem", lineHeight: 1.6 }}>
               Engineering the future of musical notation through advanced neural computation and Raga AI logic.
            </p>
          </div>
          <div>
            <h4 style={{ fontWeight: 800, marginBottom: "24px", color: "#eee" }}>Calculation Engine</h4>
            <ul style={{ listStyle: "none", padding: 0, color: "#888", display: "flex", flexDirection: "column", gap: "12px", fontSize: "0.9rem" }}>
              <li>Western Transcription</li>
              <li>Sargam Mapping</li>
              <li>Stem Isolation</li>
              <li>Accuracy Reports</li>
            </ul>
          </div>
          <div>
            <h4 style={{ fontWeight: 800, marginBottom: "24px", color: "#eee" }}>Support</h4>
            <ul style={{ listStyle: "none", padding: 0, color: "#888", display: "flex", flexDirection: "column", gap: "12px", fontSize: "0.9rem" }}>
              <li>Documentation</li>
              <li>API Integration</li>
              <li>Lead Engineer: Anil Khichar</li>
              <li>Bug Bounty</li>
            </ul>
          </div>
          <div style={{ textAlign: "center" }}>
             <div style={{ background: "rgba(255,255,255,0.03)", padding: "32px", borderRadius: "16px", border: "1px solid rgba(255,255,255,0.05)" }}>
                <p style={{ color: "var(--color-solar-bright)", fontWeight: 800, marginBottom: "8px" }}>DIRECT ENGINEER CONTACT</p>
                <p style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: "20px" }}>9049069577</p>
                <button className="btn btn-secondary" style={{ width: "100%" }}>Report Issue</button>
             </div>
          </div>
        </div>
        <div style={{ marginTop: "100px", paddingTop: "40px", borderTop: "1px solid rgba(255,255,255,0.05)", textAlign: "center", color: "#444", fontSize: "0.85rem" }}>
           © 2026 SwarLipi AI Computing Platform. Developed with precision by <strong>Anil Khichar</strong>.
        </div>
      </footer>
    </div>
  );
}
