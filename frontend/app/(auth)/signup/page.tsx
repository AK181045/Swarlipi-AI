"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Music, Mail, Lock, User, UserPlus, ArrowLeft, Info } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/api";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const setAuthToken = useAuthStore((state) => state.setToken);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const { register } = await import("@/lib/api");
      const data = await register(email, password, name);
      
      // Set cookie for middleware
      document.cookie = `swarlipi_token=${data.access_token}; path=/; max-age=86400; samesite=lax`;
      
      router.push("/projects");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
      <Link href="/" className="btn btn-ghost" style={{ position: "absolute", top: 20, left: 20 }}>
        <ArrowLeft size={20} /> Back
      </Link>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-card"
        style={{ width: "100%", maxWidth: "420px", padding: "48px", background: "white", color: "#111" }}
      >
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <div style={{ display: "inline-block", padding: 10, background: "var(--gradient-aurora)", borderRadius: 12, marginBottom: "16px" }}>
            <Music size={28} color="white" />
          </div>
          <h2 style={{ fontSize: "1.8rem", fontWeight: 800 }}>Create Access</h2>
          <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>Join the Music Computation Engine</p>
        </div>

        {error && (
          <div style={{ padding: "12px", background: "#fee2e2", color: "#b91c1c", borderRadius: "8px", marginBottom: "20px", display: "flex", alignItems: "center", gap: "8px", fontSize: "0.85rem" }}>
            <Info size={16} /> {error}
          </div>
        )}

        <form onSubmit={handleSignup} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <label style={{ fontSize: "0.85rem", fontWeight: 700 }}>FULL NAME</label>
            <div style={{ position: "relative" }}>
              <User size={18} color="#999" style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)" }} />
              <input
                className="input"
                placeholder="Anil Khichar"
                required
                style={{ paddingLeft: "42px", background: "#f8f9fa", border: "1px solid #ddd", color: "#111" }}
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <label style={{ fontSize: "0.85rem", fontWeight: 700 }}>EMAIL ADDRESS</label>
            <div style={{ position: "relative" }}>
              <Mail size={18} color="#999" style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)" }} />
              <input
                className="input"
                type="email"
                placeholder="anil.khichar@example.com"
                required
                style={{ paddingLeft: "42px", background: "#f8f9fa", border: "1px solid #ddd", color: "#111" }}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <label style={{ fontSize: "0.85rem", fontWeight: 700 }}>PASSWORD</label>
            <div style={{ position: "relative" }}>
              <Lock size={18} color="#999" style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)" }} />
              <input
                className="input"
                type="password"
                placeholder="••••••••"
                required
                style={{ paddingLeft: "42px", background: "#f8f9fa", border: "1px solid #ddd", color: "#111" }}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{ marginTop: "12px", height: "48px", borderRadius: "10px", fontSize: "1rem" }}
          >
            {loading ? "Registering..." : <><UserPlus size={18} /> Get Access</>}
          </button>
        </form>

        <p style={{ textAlign: "center", marginTop: "24px", color: "var(--text-muted)", fontSize: "0.9rem" }}>
          Already have access? <Link href="/login" style={{ color: "var(--color-aurora-bright)", fontWeight: 700 }}>Log In</Link>
        </p>
      </motion.div>
    </div>
  );
}
