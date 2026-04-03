"use client";

import React, { useRef, useState, useEffect } from "react";
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
  Activity,
  Waves,
  Fingerprint,
  Radio,
} from "lucide-react";
import Link from "next/link";
import { SystemStatus } from "@/components/ui/SystemStatus";

// --- Advanced Computation Engines (Re-themed tool categories) ---
const toolEngines = [
  {
    id: "polyphonic",
    name: "Polyphonic Analysis",
    icon: Layers,
    color: "var(--color-aurora-bright)",
    desc: "Multi-layered pitch calculation from complex raw audio into high-fidelity Western Staff notation.",
  },
  {
    id: "sargam",
    name: "Sargam Computation",
    icon: Activity,
    color: "var(--color-solar-bright)",
    desc: "Microtonal mapping to Indian Classical Sargam with precise Shrutis, Meends, and Kan-swaras.",
  },
  {
    id: "stems",
    name: "Neural Stem Isolation",
    icon: Waves,
    color: "var(--color-pulsar-bright)",
    desc: "Calculate individual track notations by isolating vocals, rhythm, and melodic instruments.",
  },
  {
    id: "dictionary",
    name: "Raga Logic Engine",
    icon: Radio,
    color: "var(--color-emerald-star)",
    desc: "AI-driven scale verification across 500+ North and South Indian Ragas for perfect accuracy.",
  },
];

const features = [
  { icon: Cpu, title: "99.8% Frequency Precision", desc: "Using advanced FFT and Neural Overlays." },
  { icon: Zap, title: "Parallel Agent Computation", desc: "Fast processing across 12 distributed AI nodes." },
  { icon: ShieldCheck, title: "Structural Validation", desc: "Automatic time-signature and key detection." },
];

export default function HomePage() {
  const [mounted, setMounted] = useState(false);
  const targetRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: targetRef, offset: ["start start", "end start"] });
  
  const backgroundY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div style={{ background: "#020205", position: "relative", minHeight: "100vh" }}>
      {/* Background FX (Mesh + Grain) */}
      <div className="bg-mesh" />
      <div className="grain-fx" />

      {/* ── Glass Navigation ── */}
      <nav
        style={{
          position: "sticky",
          top: 0,
          zIndex: 100,
          background: "rgba(2, 2, 5, 0.7)",
          backdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          padding: "16px 40px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: "12px", textDecoration: "none" }}>
          <motion.div
            whileHover={{ rotate: 15 }}
            style={{ padding: 8, background: "var(--gradient-aurora)", borderRadius: 12, boxShadow: "0 0 30px rgba(124, 58, 237, 0.3)" }}
          >
            <Music size={28} color="white" />
          </motion.div>
          <span style={{ fontSize: "1.6rem", fontWeight: 800, fontFamily: "var(--font-display)", color: "white" }}>
            SwarLipi <span style={{ color: "var(--color-aurora-bright)" }}>MAX</span>
          </span>
        </Link>

        {/* Search Engine (Centered & Glassy) */}
        <div style={{ position: "relative", width: "450px" }} className="md-flex-only">
          <input
            className="input"
            placeholder="Search Raga Logic Engine..."
            style={{ paddingLeft: "42px", paddingRight: "50px", borderRadius: "100px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                const query = (e.target as HTMLInputElement).value;
                window.location.href = `/ragas?q=${encodeURIComponent(query)}`;
              }
            }}
          />
          <Search size={18} color="rgba(255,255,255,0.4)" style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)" }} />
          <Link href="/ragas" style={{ position: "absolute", right: 6, top: "50%", transform: "translateY(-50%)", padding: 8, background: "var(--color-aurora-bright)", borderRadius: "100px", display: "flex", cursor: "pointer" }}>
            <Library size={16} color="white" />
          </Link>
        </div>

        <div style={{ display: "flex", gap: "32px", alignItems: "center" }}>
          <SystemStatus />
          
          <div style={{ display: "flex", gap: "24px", alignItems: "center" }}>
            <Link href="/ragas" style={{ fontSize: "0.9rem", fontWeight: 700, color: "var(--text-secondary)", textDecoration: "none" }}>
               Raga Engine
            </Link>
            <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
              <Link href="/login" style={{ fontSize: "0.9rem", fontWeight: 600, color: "var(--text-secondary)", textDecoration: "none" }}>
                 Log In
              </Link>
              <Link href="/signup" className="btn btn-primary" style={{ borderRadius: "100px", padding: "10px 24px" }}>
                 Join Platform
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* ── Hero Canvas ── */}
      <section ref={targetRef} style={{ height: "100vh", position: "relative", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
        <motion.div
           style={{
             position: "absolute",
             inset: 0,
             backgroundImage: "url('https://images.unsplash.com/photo-1507838596018-bd74d6bb0b3d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80')",
             backgroundSize: "cover",
             backgroundPosition: "center",
             y: mounted ? backgroundY : "0%",
             opacity: 0.15,
             filter: "blur(2px) grayscale(100%)",
           }}
        />
        
        <div style={{ textAlign: "center", position: "relative", zIndex: 10, padding: "0 24px", maxWidth: "1000px" }}>
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1 }}>
            <div
              className="anim-float"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "10px",
                background: "rgba(124, 58, 237, 0.1)",
                border: "1px solid rgba(124, 58, 237, 0.2)",
                padding: "8px 24px",
                borderRadius: "100px",
                marginBottom: "32px",
                backdropFilter: "blur(10px)"
              }}
            >
              <Sparkles size={16} color="var(--color-solar-bright)" />
              <span style={{ fontSize: "0.85rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.2em", color: "white" }}>
                AI-Driven Musical Calculation Core
              </span>
            </div>
            
            <h1 style={{ fontSize: "clamp(3.5rem, 10vw, 7.5rem)", fontWeight: 900, lineHeight: 0.85, letterSpacing: "-0.04em", margin: 0 }}>
              MUSIC <br />
              <span className="gradient-text">COMPUTED.</span>
            </h1>
            
            <p style={{ fontSize: "1.4rem", color: "var(--text-secondary)", maxWidth: "700px", margin: "32px auto", lineHeight: 1.5, fontWeight: 300 }}>
              The definitive platform for high-precision notation calculation.
              Analyze polyphonic textures with the intelligence of neural agents.
            </p>
            
            <div style={{ display: "flex", gap: "20px", justifyContent: "center" }}>
              <Link href="/projects" className="btn btn-primary" style={{ padding: "18px 48px", fontSize: "1.1rem", borderRadius: "100px", textDecoration: "none" }}>
                 <Cpu size={20} /> Deploy Analysis
              </Link>
              <Link href="/login" className="btn btn-secondary" style={{ padding: "18px 48px", fontSize: "1.1rem", borderRadius: "100px", textDecoration: "none" }}>
                 <Play size={20} /> Platform Demo
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Advanced Tool Canvas (The Grid) ── */}
      <section style={{ padding: "120px 24px", maxWidth: "1400px", margin: "0 auto", position: "relative", zIndex: 20 }}>
         <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "32px" }}>
            {toolEngines.map((engine, i) => (
              <motion.div
                key={engine.id}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                whileHover={{ translateY: -8 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass-card"
                style={{ padding: "48px", position: "relative", overflow: "hidden" }}
              >
                 <div style={{ position: "absolute", top: -50, right: -50, width: 200, height: 200, background: `${engine.color}05`, borderRadius: "50%", filter: "blur(50px)" }} />
                 
                 <div style={{ width: 64, height: 64, borderRadius: 16, background: `${engine.color}15`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "32px", border: `1px solid ${engine.color}30` }}>
                    <engine.icon size={32} color={engine.color} />
                 </div>
                 
                 <h3 style={{ fontSize: "1.8rem", fontWeight: 800, marginBottom: "16px", color: "white" }}>{engine.name}</h3>
                 <p style={{ color: "var(--text-secondary)", fontSize: "1.05rem", lineHeight: 1.6, marginBottom: "32px" }}>{engine.desc}</p>
                 
                 <Link href="/projects" style={{ textDecoration: "none", color: engine.color, fontWeight: 800, display: "flex", alignItems: "center", gap: "8px", fontSize: "0.95rem" }}>
                    Configure Engine <ChevronRight size={18} />
                 </Link>
              </motion.div>
            ))}
         </div>
      </section>

      {/* ── Feature Showcase ── */}
      <section style={{ padding: "160px 24px", maxWidth: "1200px", margin: "0 auto" }}>
         <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "100px", alignItems: "center" }}>
            <div className="glass-card" style={{ padding: 12, borderRadius: 32, position: "relative" }}>
               <div style={{ position: "absolute", inset: 0, background: "var(--gradient-aurora)", opacity: 0.05, filter: "blur(40px)" }} />
               <img
                 src="https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"
                 alt="Notation Display"
                 style={{ width: "100%", borderRadius: 24, display: "block" }}
               />
            </div>
            <div>
               <h2 style={{ fontSize: "3.5rem", fontWeight: 800, lineHeight: 1, marginBottom: "32px", color: "white" }}>
                 Engineered for Experts.
               </h2>
               <p style={{ fontSize: "1.2rem", color: "var(--text-secondary)", lineHeight: 1.6, marginBottom: "40px" }}>
                 SwarLipi AI is not a consumer app; it is an industrial-grade musical computation platform.
                 We calculate musical truths with a precision that was previously impossible.
               </p>
               <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
                 {features.map((f, i) => (
                   <div key={i} style={{ display: "flex", gap: "24px", alignItems: "flex-start" }}>
                      <div style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                         <f.icon size={22} color="var(--color-solar-bright)" />
                      </div>
                      <div>
                         <h4 style={{ fontSize: "1.1rem", fontWeight: 700, color: "white" }}>{f.title}</h4>
                         <p style={{ color: "var(--text-muted)", fontSize: "0.95rem" }}>{f.desc}</p>
                      </div>
                   </div>
                 ))}
               </div>
            </div>
         </div>
      </section>

      {/* ── Unique: Developer Biography (The Architect) ── */}
      <section style={{ padding: "160px 24px", background: "rgba(124, 58, 237, 0.03)", position: "relative", overflow: "hidden" }}>
         <div style={{ position: "absolute", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", height: "1px", background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)" }} />
         
         <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ maxWidth: "1000px", margin: "0 auto", textAlign: "center" }}>
            <div style={{ position: "relative", width: 160, height: 160, margin: "0 auto 48px" }}>
                <div style={{ position: "absolute", inset: -15, background: "var(--gradient-aurora)", borderRadius: "50%", opacity: 0.2, filter: "blur(25px)" }} />
                <div style={{ width: "100%", height: "100%", borderRadius: "50%", background: "#0d0d16", border: "2px solid var(--color-aurora-bright)", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                   <Fingerprint size={80} color="var(--color-aurora-bright)" />
                </div>
            </div>
            
            <h2 style={{ fontSize: "3.5rem", fontWeight: 900, marginBottom: "12px", color: "white" }}>Anil Khichar</h2>
            <div style={{ display: "inline-flex", gap: "12px", alignItems: "center", color: "var(--color-solar-bright)", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.2em", marginBottom: "40px", fontSize: "0.9rem" }}>
                <span>Software Engineer</span>
                <div style={{ width: 4, height: 4, borderRadius: 2, background: "currentColor" }} />
                <span>Platform Architect</span>
            </div>
            
            <p style={{ fontSize: "1.5rem", fontStyle: "italic", lineHeight: 1.6, color: "var(--text-primary)", fontWeight: 300, maxWidth: "800px", margin: "0 auto" }}>
               "The goal was never to just build software. It was to build a brain for music—something that understands the frequency of sound as deeply as it understands the history of rhythm."
            </p>
            
            <div style={{ marginTop: "64px", display: "flex", justifyContent: "center", gap: "48px" }}>
               <div style={{ textAlign: "center" }}>
                  <div style={{ color: "var(--text-muted)", fontSize: "0.75rem", textTransform: "uppercase", marginBottom: "8px" }}>Official Inquiry</div>
                  <div style={{ fontSize: "1.4rem", fontWeight: 800, color: "white" }}>+91 9049069577</div>
               </div>
               <div style={{ textAlign: "center" }}>
                  <div style={{ color: "var(--text-muted)", fontSize: "0.75rem", textTransform: "uppercase", marginBottom: "8px" }}>Status</div>
                  <div style={{ fontSize: "1.4rem", fontWeight: 800, color: "var(--color-emerald-star)" }}>SYSTEM ONLINE</div>
               </div>
            </div>
         </motion.div>
      </section>

      {/* ── Global Footer ── */}
      <footer style={{ background: "transparent", padding: "120px 48px 64px", color: "white" }}>
         <div style={{ maxWidth: "1400px", margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "80px" }}>
            <div>
               <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "32px" }}>
                  <div style={{ padding: 6, background: "white", borderRadius: 8 }}><Music size={24} color="#020205" /></div>
                  <span style={{ fontWeight: 800, fontSize: "1.4rem" }}>SwarLipi AI</span>
               </div>
               <p style={{ color: "var(--text-secondary)", lineHeight: 1.7, fontSize: "1rem" }}>
                 Advancing the frontier of musical science through distributed AI computation and multi-track notation logic.
               </p>
            </div>
            <div>
               <h4 style={{ fontSize: "1.1rem", fontWeight: 800, color: "white", marginBottom: "32px" }}>COMPUTATION</h4>
               <ul style={{ listStyle: "none", padding: 0, display: "flex", flexDirection: "column", gap: "16px", color: "var(--text-secondary)", fontSize: "0.95rem" }}>
                  <li>Neural Audio Ingestion</li>
                  <li>Sargam Frequency Mapping</li>
                  <li>Polyphonic Decoding</li>
                  <li><Link href="/ragas" style={{ color: "inherit", textDecoration: "none" }}>Raga Dictionary Explorer</Link></li>
               </ul>
            </div>
            <div>
               <h4 style={{ fontSize: "1.1rem", fontWeight: 800, color: "white", marginBottom: "32px" }}>ENGINEERING</h4>
               <ul style={{ listStyle: "none", padding: 0, display: "flex", flexDirection: "column", gap: "16px", color: "var(--text-secondary)", fontSize: "0.95rem" }}>
                  <li>Anil Khichar (Lead)</li>
                  <li>System Architecture</li>
                  <li>Performance Metrics</li>
                  <li>Enterprise Deployment</li>
               </ul>
            </div>
            <div>
               <div className="glass-card" style={{ padding: "32px", borderRadius: "24px", border: "1px solid rgba(124, 58, 237, 0.2)" }}>
                  <h4 style={{ fontSize: "0.9rem", fontWeight: 800, color: "var(--color-solar-bright)", marginBottom: "12px" }}>EXPERT ACCESS</h4>
                  <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "24px" }}>
                    Request private deployment or custom musical engine modification.
                  </p>
                  <p style={{ fontSize: "1.3rem", fontWeight: 900 }}>9049069577</p>
               </div>
            </div>
         </div>
         <div style={{ marginTop: "120px", textAlign: "center", borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: "40px" }}>
            <p style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
               (c) 2026 SwarLipi AI Global Computation Hub. <br />
               Masterfully Architected by <strong>Anil Khichar</strong>.
            </p>
         </div>
      </footer>
    </div>
  );
}
