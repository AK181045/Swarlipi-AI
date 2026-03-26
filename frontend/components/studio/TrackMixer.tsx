"use client";

import { motion } from "framer-motion";
import { Volume2, VolumeX, Headphones } from "lucide-react";
import { useState } from "react";

interface Track {
  id: string;
  instrument: string;
  displayName: string;
  color: string;
  audioUrl?: string;
}

interface TrackMixerProps {
  tracks: Track[];
  onSolo: (trackId: string) => void;
  onMute: (trackId: string) => void;
  onVolumeChange: (trackId: string, volume: number) => void;
}

const instrumentColors: Record<string, string> = {
  vocals: "#ec4899",
  drums: "#f59e0b",
  bass: "#10b981",
  piano: "#06b6d4",
  guitar: "#8b5cf6",
  other: "#64748b",
};

/**
 * Multi-instrument track mixer with Solo/Mute controls.
 * Phase 2 component for the Multi-Track Studio View.
 */
export function TrackMixer({
  tracks,
  onSolo,
  onMute,
  onVolumeChange,
}: TrackMixerProps) {
  const [mutedTracks, setMutedTracks] = useState<Set<string>>(new Set());
  const [soloTrack, setSoloTrack] = useState<string | null>(null);
  const [volumes, setVolumes] = useState<Record<string, number>>({});

  const handleMute = (trackId: string) => {
    const newMuted = new Set(mutedTracks);
    if (newMuted.has(trackId)) {
      newMuted.delete(trackId);
    } else {
      newMuted.add(trackId);
    }
    setMutedTracks(newMuted);
    onMute(trackId);
  };

  const handleSolo = (trackId: string) => {
    const newSolo = soloTrack === trackId ? null : trackId;
    setSoloTrack(newSolo);
    onSolo(trackId);
  };

  const handleVolume = (trackId: string, value: number) => {
    setVolumes({ ...volumes, [trackId]: value });
    onVolumeChange(trackId, value);
  };

  return (
    <div className="glass-card" style={{ overflow: "hidden" }}>
      <div
        style={{
          padding: "16px 20px",
          borderBottom: "1px solid var(--border-subtle)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <h4 style={{ fontSize: "0.9rem", fontWeight: 600 }}>
          🎚️ Instrument Mixer
        </h4>
        <span
          style={{
            fontSize: "0.75rem",
            color: "var(--text-tertiary)",
          }}
        >
          {tracks.length} tracks
        </span>
      </div>

      {tracks.map((track, i) => {
        const color = instrumentColors[track.instrument] || "#64748b";
        const isMuted = mutedTracks.has(track.id);
        const isSoloed = soloTrack === track.id;
        const volume = volumes[track.id] ?? 80;

        return (
          <motion.div
            key={track.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className="track-row"
            style={{
              opacity: soloTrack && !isSoloed ? 0.4 : 1,
            }}
          >
            {/* Color indicator */}
            <div
              style={{
                width: 4,
                height: 32,
                borderRadius: 2,
                background: color,
                flexShrink: 0,
              }}
            />

            {/* Track name */}
            <span
              style={{
                flex: 1,
                fontWeight: 600,
                fontSize: "0.85rem",
                color: isMuted ? "var(--text-muted)" : "var(--text-primary)",
                textDecoration: isMuted ? "line-through" : "none",
              }}
            >
              {track.displayName}
            </span>

            {/* Solo button */}
            <button
              onClick={() => handleSolo(track.id)}
              style={{
                width: 28,
                height: 28,
                borderRadius: "var(--radius-sm)",
                border: `1px solid ${isSoloed ? color : "var(--border-subtle)"}`,
                background: isSoloed ? `${color}30` : "transparent",
                color: isSoloed ? color : "var(--text-tertiary)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                fontSize: "0.7rem",
                fontWeight: 700,
                transition: "all var(--transition-fast)",
              }}
              title="Solo"
            >
              S
            </button>

            {/* Mute button */}
            <button
              onClick={() => handleMute(track.id)}
              style={{
                width: 28,
                height: 28,
                borderRadius: "var(--radius-sm)",
                border: `1px solid ${isMuted ? "var(--color-supernova)" : "var(--border-subtle)"}`,
                background: isMuted
                  ? "rgba(239, 68, 68, 0.2)"
                  : "transparent",
                color: isMuted
                  ? "var(--color-supernova)"
                  : "var(--text-tertiary)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                transition: "all var(--transition-fast)",
              }}
              title="Mute"
            >
              {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
            </button>

            {/* Volume slider */}
            <input
              type="range"
              min="0"
              max="100"
              value={volume}
              onChange={(e) => handleVolume(track.id, parseInt(e.target.value))}
              style={{
                width: "80px",
                accentColor: color,
              }}
            />
          </motion.div>
        );
      })}

      {tracks.length === 0 && (
        <div
          style={{
            padding: "32px",
            textAlign: "center",
            color: "var(--text-tertiary)",
          }}
        >
          No tracks available. Process audio to see stems here.
        </div>
      )}
    </div>
  );
}
