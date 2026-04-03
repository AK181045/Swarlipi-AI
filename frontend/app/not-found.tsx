"use client";

import { Home, Search, Music } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function NotFound() {
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
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        style={{
          padding: "60px 40px",
          background: "rgba(124, 58, 237, 0.05)",
          border: "1px solid rgba(124, 58, 237, 0.2)",
          borderRadius: "32px",
          maxWidth: "600px",
          width: "100%",
          position: "relative",
          zIndex: 1
        }}
      >
        <div style={{ position: "absolute", inset: 0, background: "var(--gradient-aurora)", opacity: 0.05, filter: "blur(40px)", zIndex: -1 }} />
        
        <div
          style={{
            width: 80,
            height: 80,
            borderRadius: 40,
            background: "rgba(124, 58, 237, 0.1)",
            margin: "0 auto 32px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}
        >
          <Search size={40} color="var(--color-aurora-bright)" />
        </div>
        
        <h1 style={{ fontSize: "4rem", fontWeight: 900, marginBottom: "8px", fontFamily: "var(--font-display)" }}>404</h1>
        <h2 style={{ fontSize: "1.8rem", marginBottom: "16px" }}>Frequency Not Found</h2>
        <p style={{ color: "var(--text-secondary)", marginBottom: "40px", fontSize: "1.1rem" }}>
          The musical coordinate you're looking for doesn't exist in our computational dictionary.
        </p>

        <div style={{ display: "flex", gap: "16px", justifyContent: "center" }}>
          <Link
            href="/"
            className="btn btn-primary"
            style={{ borderRadius: "100px", padding: "14px 32px" }}
          >
            <Home size={18} />
            Return to Core
          </Link>
          <Link
            href="/ragas"
            className="btn btn-secondary"
            style={{ borderRadius: "100px", padding: "14px 32px" }}
          >
            <Music size={18} />
            Explore Ragas
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
