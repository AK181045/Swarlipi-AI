"use client";

import { motion, useScroll, useTransform } from "framer-motion";
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
  ShieldCheck,
  Cpu,
  Star,
  ShoppingBag,
  CreditCard,
  Phone,
  User,
  ExternalLink,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import { useRef } from "react";

// --- Amazon-Style Categories (Services) ---
const categories = [
  { id: "transcription", name: "AI Transcription", icon: FileMusic, color: "var(--color-aurora-bright)", desc: "Notes to XML/PDF" },
  { id: "separation", name: "Stem Separation", icon: Mic, color: "var(--color-pulsar-bright)", desc: "Split Voice & Instruments" },
  { id: "sargam", name: "Sargam Mapper", icon: Languages, color: "var(--color-solar-bright)", desc: "Indian Classical Notation" },
  { id: "studio", name: "Online Studio", icon: Music, color: "var(--color-emerald-star)", desc: "Multi-track DAW" },
];

const features = [
  {
    icon: ShieldCheck,
    title: "Enterprise Grade",
    description: "Secure, fast, and scalable. Used by top music schools worldwide.",
  },
  {
    icon: Cpu,
    title: "Gemini AI Core",
    description: "Powered by Gemini 2.0 Flash for intelligent musical reasoning.",
  },
  {
    icon: Star,
    title: "Pro-Format Export",
    description: "Export to MIDI, MusicXML, PDF, and Guitar Pro with one click.",
  },
];

export default function HomePage() {
  const targetRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start start", "end start"],
  });

  const backgroundY = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  return (
    <div style={{ background: "var(--color-void)", color: "var(--text-primary)", minHeight: "200vh" }}>
      {/* ── Amazon-Style Sticky Top Bar ── */}
      <nav
        style={{
          position: "sticky",
          top: 0,
          zIndex: 100,
          background: "#0d0d16",
          padding: "12px 24px",
          display: "flex",
          alignItems: "center",
          gap: "24px",
          borderBottom: "1px solid rgba(255,255,255,0.05)",
        }}
      >
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: "8px", textDecoration: "none" }}>
          <div style={{ padding: 6, background: "var(--gradient-aurora)", borderRadius: 8 }}>
            <Music size={24} color="white" />
          </div>
          <span style={{ fontSize: "1.4rem", fontWeight: 800, fontFamily: "var(--font-display)", color: "white" }}>
            SwarLipi <span style={{ color: "var(--color-aurora-bright)" }}>MAX</span>
          </span>
        </Link>

        {/* Search Bar (Mocking Amazon behavior) */}
        <div style={{ flex: 1, position: "relative", maxWidth: "600px" }}>
          <input
            className="input"
            placeholder="Search for ragas, songs, or transcription services..."
            style={{ paddingLeft: "40px", background: "white", color: "#111", border: "none" }}
          />
          <Globe
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
              padding: "0 16px",
              borderRadius: 6,
              display: "flex",
              alignItems: "center",
              cursor: "pointer",
            }}
          >
            <ArrowRight size={18} color="#111" />
          </div>
        </div>

        <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
          <div style={{ textAlign: "right", display: "none", md: "block" }}>
            <p style={{ fontSize: "0.7rem", color: "var(--text-muted)", margin: 0 }}>Hello, Sign In</p>
            <p style={{ fontSize: "0.85rem", fontWeight: 700, margin: 0 }}>Account & Lists</p>
          </div>
          <Link href="/projects" className="btn btn-primary" style={{ height: "40px" }}>
            <ShoppingBag size={18} />
            My Studio
          </Link>
        </div>
      </nav>

      {/* ── Amazon Hero Feature Rail ── */}
      <section ref={targetRef} style={{ position: "relative", height: "80vh", overflow: "hidden" }}>
        <motion.div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: "url('https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            y: backgroundY,
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "linear-gradient(to bottom, rgba(10,10,15,0.4) 0%, var(--color-void) 95%)",
            }}
          />
        </motion.div>

        <div
          style={{
            position: "relative",
            zIndex: 10,
            padding: "100px 48px",
            maxWidth: "1400px",
            margin: "0 auto",
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
          >
            <h1
              style={{
                fontSize: "clamp(3rem, 7vw, 5.5rem)",
                fontWeight: 900,
                lineHeight: 0.9,
                letterSpacing: "-0.04em",
                textShadow: "0 10px 40px rgba(0,0,0,0.5)",
              }}
            >
              MUSIC <br />
              <span style={{ color: "var(--color-aurora-bright)" }}>REDRAWN.</span>
            </h1>
            <p
              style={{
                fontSize: "1.4rem",
                color: "var(--text-secondary)",
                maxWidth: "600px",
                marginTop: "24px",
                lineHeight: 1.4,
              }}
            >
              The world's most powerful AI music transcription engine. Professional, precise, and uniquely Indian.
            </p>
            <div style={{ display: "flex", gap: "20px", marginTop: "40px" }}>
              <button className="btn btn-primary" style={{ padding: "16px 48px", fontSize: "1.2rem", borderRadius: 100 }}>
                Get SwarLipi Pro
              </button>
              <button className="btn btn-secondary" style={{ padding: "16px 48px", fontSize: "1.2rem", borderRadius: 100 }}>
                Watch Keynote
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Amazon-Style "Shop by Category" Grid (Overlapping Hero) ── */}
      <section
        style={{
          maxWidth: "1400px",
          margin: "-100px auto 0",
          padding: "0 24px",
          position: "relative",
          zIndex: 20,
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "24px",
          }}
        >
          {categories.map((cat, i) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
              className="glass-card"
              style={{
                background: "white",
                color: "#111",
                padding: "32px",
                borderRadius: 12,
                boxShadow: "0 20px 50px rgba(0,0,0,0.3)",
              }}
            >
              <h3 style={{ fontSize: "1.5rem", fontWeight: 800, marginBottom: "16px" }}>{cat.name}</h3>
              <div
                style={{
                  width: "100%",
                  aspectRatio: "16/9",
                  background: `${cat.color}15`,
                  borderRadius: 8,
                  marginBottom: "20px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: `1px solid ${cat.color}20`,
                }}
              >
                <cat.icon size={64} color={cat.color} strokeWidth={1} />
              </div>
              <p style={{ color: "#666", fontSize: "0.95rem", marginBottom: "20px" }}>{cat.desc}</p>
              <Link
                href="/projects"
                style={{
                  color: "var(--color-aurora-bright)",
                  fontWeight: 700,
                  fontSize: "0.9rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                  textDecoration: "none",
                }}
              >
                Order Now <ChevronRight size={16} />
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Amazon Feature Showcase ── */}
      <section style={{ padding: "120px 24px", maxWidth: "1200px", margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "80px", alignItems: "center" }}>
          <div>
            <h2 style={{ fontSize: "3.5rem", fontWeight: 800, lineHeight: 1, marginBottom: "32px" }}>
              Born to Compete. <br />
              Built to Win.
            </h2>
            <p style={{ color: "var(--text-secondary)", fontSize: "1.2rem", lineHeight: 1.6, marginBottom: "40px" }}>
              SwarLipi AI isn't just a tool; it's a global platform for musicians. We provide a full infrastructure
              similar to how Amazon revolutionized retail. From audio ingestion to a worldwide sheet-music distribution.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              {features.map((f, i) => (
                <div key={i} style={{ display: "flex", gap: "20px" }}>
                  <div style={{ padding: 12, borderRadius: 12, background: "rgba(255,255,255,0.05)" }}>
                    <f.icon size={24} color="var(--color-aurora-bright)" />
                  </div>
                  <div>
                    <h4 style={{ fontWeight: 700, marginBottom: 4 }}>{f.title}</h4>
                    <p style={{ fontSize: "0.9rem", color: "var(--text-muted)" }}>{f.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="glass-card" style={{ padding: 4, borderRadius: 24, overflow: "hidden" }}>
            <img
              src="https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
              alt="Studio Display"
              style={{ width: "100%", borderRadius: 20 }}
            />
          </div>
        </div>
      </section>

      {/* ── UNIQUE: Developer Spotlight (The Visionary) ── */}
      <section
        style={{
          background: "linear-gradient(to bottom, transparent, #0d0d16)",
          padding: "100px 24px",
          textAlign: "center",
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          style={{ maxWidth: "800px", margin: "0 auto" }}
        >
          <div
            style={{
              width: 120,
              height: 120,
              borderRadius: 60,
              background: "var(--gradient-aurora)",
              margin: "0 auto 32px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "4px solid rgba(255,255,255,0.1)",
            }}
          >
            <User size={64} color="white" />
          </div>
          <h2 style={{ fontSize: "2.5rem", fontWeight: 800, marginBottom: "8px" }}>Anil Khichar</h2>
          <p style={{ fontSize: "1.1rem", color: "var(--color-aurora-bright)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.2em", marginBottom: "24px" }}>
            Founder & Lead Software Engineer
          </p>
          <div style={{ display: "flex", justifyContent: "center", gap: "24px", marginBottom: "40px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--text-secondary)" }}>
              <Phone size={18} />
              <span>+91 9049069577</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--text-secondary)" }}>
              <ExternalLink size={18} />
              <span>Software Engineering Hub</span>
            </div>
          </div>
          <p style={{ fontStyle: "italic", color: "var(--text-muted)", fontSize: "1.1rem", lineHeight: 1.6 }}>
            "Our vision was to create for music what Amazon created for e-commerce: a platform so robust, so intelligent, and so scalable that it becomes the heartbeat of the industry. SwarLipi AI is the bridge between the analog soul of music and the digital precision of AI."
          </p>
        </motion.div>
      </section>

      {/* ── Amazon-Style "Back to Top" ── */}
      <div
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        style={{
          background: "#232f3e",
          padding: "16px",
          textAlign: "center",
          cursor: "pointer",
          fontSize: "0.85rem",
          fontWeight: 600,
        }}
      >
        Back to top
      </div>

      {/* ── Amazon-Style Footer ── */}
      <footer style={{ background: "#131a22", padding: "64px 48px", color: "white" }}>
        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "48px",
          }}
        >
          <div>
            <h4 style={{ fontSize: "1rem", fontWeight: 800, marginBottom: "16px" }}>Get to Know Us</h4>
            <ul style={{ listStyle: "none", padding: 0, color: "#ccc", fontSize: "0.85rem", display: "flex", flexDirection: "column", gap: "8px" }}>
              <li>Careers</li>
              <li>Blog</li>
              <li>About SwarLipi</li>
              <li>Developer: Anil Khichar</li>
            </ul>
          </div>
          <div>
            <h4 style={{ fontSize: "1rem", fontWeight: 800, marginBottom: "16px" }}>Core Services</h4>
            <ul style={{ listStyle: "none", padding: 0, color: "#ccc", fontSize: "0.85rem", display: "flex", flexDirection: "column", gap: "8px" }}>
              <li>Western Transcription</li>
              <li>Sargam Generation</li>
              <li>Raga Dictionary</li>
              <li>Score Editor</li>
            </ul>
          </div>
          <div>
            <h4 style={{ fontSize: "1rem", fontWeight: 800, marginBottom: "16px" }}>Help & Support</h4>
            <ul style={{ listStyle: "none", padding: 0, color: "#ccc", fontSize: "0.85rem", display: "flex", flexDirection: "column", gap: "8px" }}>
              <li>Contact Support</li>
              <li>API Documentation</li>
              <li>User Manual</li>
              <li>Safety & Privacy</li>
            </ul>
          </div>
          <div>
            <div
              style={{
                border: "1px solid #444",
                padding: "24px",
                borderRadius: 12,
                textAlign: "center",
              }}
            >
              <h4 style={{ marginBottom: "12px" }}>Professional Hub</h4>
              <p style={{ fontSize: "0.8rem", color: "#888", marginBottom: "20px" }}>
                Contact for enterprise white-labeling or platform integration.
              </p>
              <p style={{ fontWeight: 700, color: "var(--color-solar-bright)" }}>9049069577</p>
            </div>
          </div>
        </div>

        <div
          style={{
            marginTop: "64px",
            paddingTop: "32px",
            borderTop: "1px solid #2a2a2a",
            textAlign: "center",
          }}
        >
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
            <div style={{ padding: 4, background: "white", borderRadius: 4 }}>
              <Music size={16} color="#111" />
            </div>
            <span style={{ fontWeight: 800 }}>SwarLipi AI</span>
          </div>
          <p style={{ fontSize: "0.75rem", color: "#666" }}>
            © 2026 SwarLipi Global Infrastructure. All rights reserved. <br />
            Architected and Developed by <strong>Anil Khichar</strong> (Software Engineer).
          </p>
        </div>
      </footer>
    </div>
  );
}
