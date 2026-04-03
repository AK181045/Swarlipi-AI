"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, 
  Music, 
  ChevronRight, 
  Activity, 
  Clock, 
  Wind,
  Library,
  ArrowLeft,
  Loader2,
  X
} from "lucide-react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { lookupRaga, type RagaDetail } from "@/lib/api";
import { useEffect } from "react";
import { SystemStatus } from "@/components/ui/SystemStatus";

export default function RagaExplorer() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [debouncedSearch, setDebouncedSearch] = useState(initialQuery);
  const [selectedRaga, setSelectedRaga] = useState<RagaDetail | null>(null);

  useEffect(() => {
    if (initialQuery) {
      setSearchQuery(initialQuery);
      setDebouncedSearch(initialQuery);
    }
  }, [initialQuery]);

  const { data, isLoading } = useQuery({
    queryKey: ["ragas", debouncedSearch],
    queryFn: () => lookupRaga(debouncedSearch),
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setDebouncedSearch(searchQuery);
  };

  return (
    <div style={{ minHeight: "100vh", padding: "80px 24px 40px" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        
        {/* Navigation */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "48px" }}>
          <div>
            <Link href="/" style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none", color: "var(--text-secondary)", marginBottom: "12px" }}>
              <ArrowLeft size={16} />
              <span>Back to Home</span>
            </Link>
            <h1 style={{ fontSize: "2.5rem", fontWeight: 900 }}>Raga Logic Explorer</h1>
            <p style={{ color: "var(--text-secondary)" }}>Query the computational dictionary of Indian Classical Music</p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
            <SystemStatus />
            <div style={{ padding: 12, background: "var(--gradient-aurora)", borderRadius: 16 }}>
              <Library size={32} color="white" />
            </div>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "350px 1fr", gap: "32px" }}>
          
          {/* Sidebar / Search */}
          <div>
            <form onSubmit={handleSearch} style={{ position: "relative", marginBottom: "24px" }}>
              <input
                className="input"
                placeholder="Search Raga (e.g. Yaman, Bhairav)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ paddingLeft: "42px", borderRadius: "12px" }}
              />
              <Search size={18} color="rgba(255,255,255,0.4)" style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)" }} />
              {searchQuery && (
                <button 
                  type="button"
                  onClick={() => {setSearchQuery(""); setDebouncedSearch("");}}
                  style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer" }}
                >
                  <X size={16} />
                </button>
              )}
            </form>

            <div className="glass-card" style={{ padding: "8px", maxHeight: "60vh", overflowY: "auto" }}>
              {isLoading ? (
                <div style={{ padding: "40px", textAlign: "center" }}>
                  <Loader2 className="animate-spin" size={24} color="var(--color-aurora-bright)" />
                </div>
              ) : data?.ragas.length === 0 ? (
                <div style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)" }}>
                  No ragas found matching your query.
                </div>
              ) : (
                data?.ragas.map((raga) => (
                  <motion.div
                    key={raga.id}
                    whileHover={{ x: 4, background: "rgba(255,255,255,0.05)" }}
                    onClick={() => setSelectedRaga(raga)}
                    style={{
                      padding: "16px",
                      borderRadius: "12px",
                      cursor: "pointer",
                      background: selectedRaga?.id === raga.id ? "rgba(124, 58, 237, 0.1)" : "transparent",
                      border: selectedRaga?.id === raga.id ? "1px solid rgba(124, 58, 237, 0.3)" : "1px solid transparent",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "4px"
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 700, fontSize: "1.1rem" }}>{raga.name}</div>
                      <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Thaat: {raga.thaat || "N/A"}</div>
                    </div>
                    <ChevronRight size={16} color="var(--text-muted)" />
                  </motion.div>
                ))
              )}
            </div>
          </div>

          {/* Details Panel */}
          <div>
            <AnimatePresence mode="wait">
              {selectedRaga ? (
                <motion.div
                  key={selectedRaga.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="glass-card"
                  style={{ padding: "48px", minHeight: "60vh" }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "40px" }}>
                    <div>
                      <div style={{ color: "var(--color-solar-bright)", fontSize: "0.9rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "8px" }}>
                        Musical Identity
                      </div>
                      <h2 style={{ fontSize: "3rem", fontWeight: 900, margin: 0 }}>{selectedRaga.name}</h2>
                      {selectedRaga.aliases.length > 0 && (
                        <p style={{ color: "var(--text-secondary)", marginTop: "8px" }}>
                          Also known as: {selectedRaga.aliases.join(", ")}
                        </p>
                      )}
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: "2rem", fontWeight: 800, color: "var(--color-aurora-bright)" }}>
                         M{selectedRaga.melakarta || "--"}
                      </div>
                      <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>MELAKARTA REF</div>
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "40px", marginBottom: "48px" }}>
                    <div style={{ padding: "24px", background: "rgba(255,255,255,0.03)", borderRadius: "16px", border: "1px solid rgba(255,255,255,0.05)" }}>
                       <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px", color: "var(--color-pulsar-bright)" }}>
                          <Activity size={20} />
                          <span style={{ fontWeight: 800, fontSize: "0.9rem" }}>Aroha (Ascending)</span>
                       </div>
                       <div style={{ fontSize: "1.4rem", fontWeight: 600, fontFamily: "var(--font-jetbrains)", color: "white" }}>
                          {selectedRaga.aroha}
                       </div>
                    </div>
                    <div style={{ padding: "24px", background: "rgba(255,255,255,0.03)", borderRadius: "16px", border: "1px solid rgba(255,255,255,0.05)" }}>
                       <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px", color: "var(--color-aurora-bright)" }}>
                          <Activity size={20} style={{ transform: "scaleY(-1)" }} />
                          <span style={{ fontWeight: 800, fontSize: "0.9rem" }}>Avaroha (Descending)</span>
                       </div>
                       <div style={{ fontSize: "1.4rem", fontWeight: 600, fontFamily: "var(--font-jetbrains)", color: "white" }}>
                          {selectedRaga.avaroha}
                       </div>
                    </div>
                  </div>

                  {selectedRaga.pakad && (
                    <div style={{ marginBottom: "48px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px", color: "var(--color-emerald-star)" }}>
                        <Music size={18} />
                        <span style={{ fontWeight: 800, fontSize: "0.9rem", textTransform: "uppercase" }}>Pakad (Characteristic Phrase)</span>
                      </div>
                      <div style={{ fontSize: "1.2rem", color: "var(--text-secondary)", padding: "16px 24px", background: "rgba(255,255,255,0.02)", borderRadius: "12px", borderLeft: "4px solid var(--color-emerald-star)" }}>
                        {selectedRaga.pakad}
                      </div>
                    </div>
                  )}

                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "24px" }}>
                    <div className="glass-card" style={{ padding: "20px", textAlign: "center" }}>
                      <Clock size={24} color="var(--color-solar-bright)" style={{ margin: "0 auto 12px" }} />
                      <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", textTransform: "uppercase" }}>Time of Day</div>
                      <div style={{ fontWeight: 700 }}>{selectedRaga.time_of_day || "Anytime"}</div>
                    </div>
                    <div className="glass-card" style={{ padding: "20px", textAlign: "center" }}>
                      <Wind size={24} color="var(--color-aurora-bright)" style={{ margin: "0 auto 12px" }} />
                      <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", textTransform: "uppercase" }}>Mood / Rasa</div>
                      <div style={{ fontWeight: 700 }}>{selectedRaga.mood || "Neutral"}</div>
                    </div>
                    <div className="glass-card" style={{ padding: "20px", textAlign: "center" }}>
                      <div style={{ fontSize: "1.4rem", fontWeight: 900, color: "var(--color-emerald-star)", marginBottom: "8px" }}>
                        {selectedRaga.vadi} / {selectedRaga.samvadi}
                      </div>
                      <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", textTransform: "uppercase" }}>Vadi / Samvadi</div>
                    </div>
                  </div>

                </motion.div>
              ) : (
                <div className="glass-card" style={{ height: "60vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "var(--text-muted)", padding: "40px", textAlign: "center" }}>
                  <Library size={64} style={{ marginBottom: "24px", opacity: 0.2 }} />
                  <h3>Select a Raga from the dictionary</h3>
                  <p>Explore scales, time-frames, and moods used by the SwarLipi AI computation engine.</p>
                </div>
              )}
            </AnimatePresence>
          </div>

        </div>
      </div>
    </div>
  );
}
