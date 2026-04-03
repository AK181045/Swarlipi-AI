"use client";

import { useQuery } from "@tanstack/react-query";
import { Activity, ShieldCheck, Zap } from "lucide-react";
import { motion } from "framer-motion";

async function checkHealth() {
  const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
  const res = await fetch(`${API_BASE}/health`);
  if (!res.ok) throw new Error("Offline");
  return res.json();
}

export function SystemStatus() {
  const { data, status } = useQuery({
    queryKey: ["health"],
    queryFn: checkHealth,
    refetchInterval: 10000, // Check every 10s
  });

  const isOnline = status === "success";

  return (
    <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.75rem", fontWeight: 700, color: isOnline ? "var(--color-emerald-star)" : "var(--color-supernova, #ef4444)" }}>
        <motion.div
          animate={isOnline ? { scale: [1, 1.2, 1] } : {}}
          transition={{ repeat: Infinity, duration: 2 }}
          style={{ width: 8, height: 8, borderRadius: "50%", background: "currentColor", boxShadow: `0 0 10px currentColor` }}
        />
        <span style={{ textTransform: "uppercase", letterSpacing: "0.1em" }}>
          {isOnline ? "Core Online" : "Link Interrupted"}
        </span>
      </div>
      
      {isOnline && (
        <div style={{ display: "flex", gap: "12px", borderLeft: "1px solid rgba(255,255,255,0.1)", paddingLeft: "12px" }} className="md-flex-only">
           <StatusBit icon={Zap} label="Low-Latency" />
           <StatusBit icon={ShieldCheck} label="Secure" />
        </div>
      )}
    </div>
  );
}

function StatusBit({ icon: Icon, label }: { icon: any, label: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "0.65rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
      <Icon size={12} />
      <span>{label}</span>
    </div>
  );
}
