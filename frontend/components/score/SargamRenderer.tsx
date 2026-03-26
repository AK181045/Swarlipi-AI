"use client";

import { motion } from "framer-motion";

interface SargamNote {
  beat: number;
  note: string;
  octave: string;
  modifier: string | null;
  ornament: string | null;
  duration: number;
}

interface RagaInfo {
  name: string;
  thaat: string | null;
  aroha: string;
  avaroha: string;
}

interface SargamRendererProps {
  notes: SargamNote[];
  raga?: RagaInfo | null;
  showDevanagari?: boolean;
}

// Sargam to Devanagari mapping
const devanagariMap: Record<string, string> = {
  Sa: "सा",
  Re: "रे",
  Ga: "ग",
  Ma: "म",
  Pa: "प",
  Dha: "ध",
  Ni: "नि",
};

/**
 * Indian Classical Sargam Notation Renderer
 * Phase 3 component for displaying Sa-Re-Ga-Ma notation.
 */
export function SargamRenderer({
  notes,
  raga,
  showDevanagari = false,
}: SargamRendererProps) {
  const getModifierClass = (modifier: string | null) => {
    if (modifier === "komal") return "komal";
    if (modifier === "tivra") return "tivra";
    return "";
  };

  const getOrnamentClass = (ornament: string | null) => {
    if (ornament === "meend") return "meend";
    return "";
  };

  const getOctaveIndicator = (octave: string) => {
    if (octave === "lower") return "·"; // dot below
    if (octave === "upper") return "'"; // apostrophe above
    return "";
  };

  const displayNote = (note: SargamNote) => {
    const text = showDevanagari
      ? devanagariMap[note.note] || note.note
      : note.note;
    const modifier =
      note.modifier === "komal" ? "(K)" : note.modifier === "tivra" ? "(T)" : "";
    const octave = getOctaveIndicator(note.octave);

    return `${octave === "·" ? octave : ""}${text}${modifier}${octave === "'" ? octave : ""}`;
  };

  return (
    <div>
      {/* Raga Info Panel */}
      {raga && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="glass-card"
          style={{
            padding: "20px",
            marginBottom: "20px",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "16px",
          }}
        >
          <div>
            <span
              style={{
                fontSize: "0.75rem",
                color: "var(--text-tertiary)",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
              }}
            >
              Raga
            </span>
            <p
              style={{
                fontSize: "1.25rem",
                fontWeight: 700,
                color: "var(--color-solar-bright)",
              }}
            >
              {raga.name}
            </p>
          </div>
          {raga.thaat && (
            <div>
              <span
                style={{
                  fontSize: "0.75rem",
                  color: "var(--text-tertiary)",
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                }}
              >
                Thaat
              </span>
              <p style={{ fontWeight: 600 }}>{raga.thaat}</p>
            </div>
          )}
          <div>
            <span
              style={{
                fontSize: "0.75rem",
                color: "var(--text-tertiary)",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
              }}
            >
              Aroha
            </span>
            <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.9rem" }}>
              {raga.aroha}
            </p>
          </div>
          <div>
            <span
              style={{
                fontSize: "0.75rem",
                color: "var(--text-tertiary)",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
              }}
            >
              Avaroha
            </span>
            <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.9rem" }}>
              {raga.avaroha}
            </p>
          </div>
        </motion.div>
      )}

      {/* Sargam Notes Display */}
      <div className="score-container">
        <div className="sargam-display">
          {notes.map((note, i) => (
            <motion.span
              key={`${note.beat}-${i}`}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.02 }}
              className={`sargam-note ${getModifierClass(note.modifier)} ${getOrnamentClass(note.ornament)}`}
              title={`Beat: ${note.beat}, Duration: ${note.duration}, Octave: ${note.octave}${note.ornament ? `, Ornament: ${note.ornament}` : ""}`}
            >
              {displayNote(note)}
            </motion.span>
          ))}

          {notes.length === 0 && (
            <p
              style={{
                color: "var(--text-tertiary)",
                textAlign: "center",
                padding: "40px",
              }}
            >
              No Sargam notation available. Upload an Indian Classical track to
              see the notation here.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
