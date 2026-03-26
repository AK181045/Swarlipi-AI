"use client";

import { useCallback, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, FileAudio, X, Link as LinkIcon, Loader2 } from "lucide-react";
import { createTranscription } from "@/lib/api";

interface FileUploadProps {
  onSuccess: (project: { id: string }) => void;
  onError: (error: string) => void;
}

export function FileUpload({ onSuccess, onError }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [urlInput, setUrlInput] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadMode, setUploadMode] = useState<"file" | "url">("file");
  const [title, setTitle] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      setSelectedFile(file);
      setUploadMode("file");
    }
  }, []);

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        setSelectedFile(file);
        setUploadMode("file");
      }
    },
    []
  );

  const handleSubmit = async () => {
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("title", title || "Untitled Project");
      formData.append("notation_type", "western");

      if (uploadMode === "file" && selectedFile) {
        formData.append("file", selectedFile);
        formData.append("source_type", "file_upload");
      } else if (uploadMode === "url" && urlInput) {
        formData.append("url", urlInput);
        formData.append(
          "source_type",
          urlInput.includes("youtube") || urlInput.includes("youtu.be")
            ? "youtube_url"
            : "web_url"
        );
      } else {
        throw new Error("Please provide a file or URL");
      }

      const project = await createTranscription(formData);
      onSuccess(project);
    } catch (err) {
      onError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  const canSubmit =
    !isUploading &&
    ((uploadMode === "file" && selectedFile) ||
      (uploadMode === "url" && urlInput.trim()));

  return (
    <div style={{ maxWidth: "600px", margin: "0 auto" }}>
      {/* Mode Toggle */}
      <div
        style={{
          display: "flex",
          gap: "4px",
          padding: "4px",
          background: "var(--color-nebula-deep)",
          borderRadius: "var(--radius-md)",
          marginBottom: "24px",
        }}
      >
        <button
          onClick={() => setUploadMode("file")}
          className={`btn ${uploadMode === "file" ? "btn-primary" : "btn-ghost"}`}
          style={{ flex: 1, padding: "10px" }}
        >
          <Upload size={16} />
          Upload File
        </button>
        <button
          onClick={() => setUploadMode("url")}
          className={`btn ${uploadMode === "url" ? "btn-primary" : "btn-ghost"}`}
          style={{ flex: 1, padding: "10px" }}
        >
          <LinkIcon size={16} />
          Paste URL
        </button>
      </div>

      {/* Project Title */}
      <input
        type="text"
        className="input"
        placeholder="Project title (optional)"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        style={{ marginBottom: "16px" }}
      />

      <AnimatePresence mode="wait">
        {uploadMode === "file" ? (
          <motion.div
            key="file"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
          >
            {/* Drop Zone */}
            <div
              className={`drop-zone ${isDragging ? "active" : ""}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".mp3,.wav,.flac,.mp4,.ogg,.m4a"
                onChange={handleFileSelect}
                style={{ display: "none" }}
              />

              {selectedFile ? (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
                  <FileAudio size={48} color="var(--color-aurora-bright)" />
                  <div>
                    <p style={{ fontWeight: 600, fontSize: "1rem" }}>
                      {selectedFile.name}
                    </p>
                    <p style={{ color: "var(--text-tertiary)", fontSize: "0.85rem" }}>
                      {(selectedFile.size / 1024 / 1024).toFixed(1)} MB
                    </p>
                  </div>
                  <button
                    className="btn btn-ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedFile(null);
                    }}
                    style={{ padding: "6px 12px", fontSize: "0.8rem" }}
                  >
                    <X size={14} />
                    Remove
                  </button>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
                  <Upload
                    size={48}
                    color="var(--text-tertiary)"
                    className="animate-float"
                  />
                  <p style={{ fontWeight: 600 }}>
                    Drag & drop your audio file here
                  </p>
                  <p style={{ color: "var(--text-tertiary)", fontSize: "0.85rem" }}>
                    or click to browse • MP3, WAV, FLAC, MP4 supported
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="url"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <div
              className="glass-card"
              style={{ padding: "32px", textAlign: "center" }}
            >
              <LinkIcon
                size={48}
                color="var(--color-pulsar-bright)"
                style={{ marginBottom: "16px" }}
              />
              <p
                style={{
                  fontWeight: 600,
                  marginBottom: "16px",
                }}
              >
                Paste a YouTube or video URL
              </p>
              <input
                type="url"
                className="input"
                placeholder="https://youtube.com/watch?v=..."
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
              />
              <p
                style={{
                  color: "var(--text-tertiary)",
                  fontSize: "0.8rem",
                  marginTop: "8px",
                }}
              >
                Supports YouTube, Vimeo, and direct audio URLs
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Submit Button */}
      <motion.button
        className="btn btn-primary"
        onClick={handleSubmit}
        disabled={!canSubmit}
        whileHover={canSubmit ? { scale: 1.02 } : {}}
        whileTap={canSubmit ? { scale: 0.98 } : {}}
        style={{
          width: "100%",
          marginTop: "24px",
          padding: "14px",
          fontSize: "1rem",
        }}
      >
        {isUploading ? (
          <>
            <Loader2 size={18} className="animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <Upload size={18} />
            Start Transcription
          </>
        )}
      </motion.button>
    </div>
  );
}
