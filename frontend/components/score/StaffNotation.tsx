"use client";

import { useEffect, useRef, useState } from "react";

interface StaffNotationProps {
  musicXml: string;
  width?: number;
  scale?: number;
}

/**
 * Western Staff Notation Renderer using Verovio WASM.
 * Renders MusicXML as SVG sheet music with horizontal scrolling.
 */
export function StaffNotation({
  musicXml,
  width,
  scale = 40,
}: StaffNotationProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [verovioLoaded, setVerovioLoaded] = useState(false);
  const [svgContent, setSvgContent] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const verovioRef = useRef<any>(null);

  useEffect(() => {
    // Dynamically import Verovio
    async function loadVerovio() {
      try {
        const verovio = await import("verovio");
        const toolkit = new verovio.toolkit();

        // Configure Verovio rendering options
        toolkit.setOptions({
          scale: scale,
          pageWidth: width || (containerRef.current?.clientWidth || 1200),
          pageHeight: 800,
          adjustPageHeight: true,
          breaks: "auto",
          header: "none",
          footer: "none",
          svgViewBox: true,
          font: "Leipzig",
        });

        verovioRef.current = toolkit;
        setVerovioLoaded(true);
      } catch (err) {
        console.error("Failed to load Verovio:", err);
        setError("Failed to load notation renderer. Please refresh.");
      }
    }

    loadVerovio();
  }, [scale, width]);

  useEffect(() => {
    if (!verovioLoaded || !verovioRef.current || !musicXml) return;

    try {
      const toolkit = verovioRef.current;
      toolkit.loadData(musicXml);
      const pageCount = toolkit.getPageCount();
      setTotalPages(pageCount);
      setCurrentPage(1);

      // Render first page
      const svg = toolkit.renderToSVG(1);
      setSvgContent(svg);
      setError("");
    } catch (err) {
      console.error("Verovio render error:", err);
      setError("Failed to render notation. The MusicXML may be invalid.");
    }
  }, [verovioLoaded, musicXml]);

  const goToPage = (page: number) => {
    if (!verovioRef.current || page < 1 || page > totalPages) return;
    setCurrentPage(page);
    const svg = verovioRef.current.renderToSVG(page);
    setSvgContent(svg);
  };

  if (error) {
    return (
      <div
        className="glass-card"
        style={{
          padding: "32px",
          textAlign: "center",
          color: "var(--color-supernova)",
        }}
      >
        <p>{error}</p>
      </div>
    );
  }

  if (!verovioLoaded) {
    return (
      <div
        className="glass-card"
        style={{ padding: "48px", textAlign: "center" }}
      >
        <div className="animate-shimmer" style={{ height: "200px", borderRadius: "var(--radius-md)" }} />
        <p style={{ color: "var(--text-secondary)", marginTop: "16px" }}>
          Loading notation renderer...
        </p>
      </div>
    );
  }

  return (
    <div>
      <div
        ref={containerRef}
        className="score-container"
        dangerouslySetInnerHTML={{ __html: svgContent }}
      />

      {/* Pagination */}
      {totalPages > 1 && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "12px",
            marginTop: "16px",
          }}
        >
          <button
            className="btn btn-ghost"
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage <= 1}
          >
            ← Previous
          </button>
          <span style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}>
            Page {currentPage} of {totalPages}
          </span>
          <button
            className="btn btn-ghost"
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage >= totalPages}
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}
