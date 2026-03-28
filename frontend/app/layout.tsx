import type { Metadata } from "next";
import { Inter, Outfit, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Providers from "@/app/providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
});

export const metadata: Metadata = {
  title: "SwarLipi AI — AI-Powered Music Transcription",
  description:
    "Upload audio or provide URLs to get multi-instrument sheet music in both Western and Indian Classical (Sargam) notation. Powered by AI.",
  keywords: [
    "music transcription",
    "sheet music",
    "AI",
    "sargam",
    "indian classical music",
    "audio to notation",
    "MIDI",
    "MusicXML",
  ],
  authors: [{ name: "SwarLipi AI" }],
  openGraph: {
    title: "SwarLipi AI — AI-Powered Music Transcription",
    description:
      "Transform any audio into multi-instrument sheet music with AI precision.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${outfit.variable} ${jetbrainsMono.variable}`}
    >
      <head>
        <style dangerouslySetInnerHTML={{ __html: `
          :root {
            --color-void: #020205;
            --color-aurora-bright: #7c3aed;
            --color-solar-bright: #f59e0b;
            --text-primary: #ffffff;
            --text-secondary: #a1a1aa;
          }
          body {
            background-color: var(--color-void);
            color: var(--text-primary);
            margin: 0;
            font-family: var(--font-inter), sans-serif;
            -webkit-font-smoothing: antialiased;
          }
          .glass-card {
            background: rgba(255, 255, 255, 0.03);
            backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 24px;
          }
          .btn {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            padding: 12px 24px;
            font-weight: 700;
            border-radius: 12px;
            cursor: pointer;
            border: none;
            transition: all 150ms ease;
          }
          .btn-primary {
            background: var(--color-aurora-bright);
            color: white;
            box-shadow: 0 4px 15px rgba(124, 58, 237, 0.3);
          }
          .btn-primary:hover {
            background: #8b5cf6;
            transform: translateY(-1px);
          }
          .anim-spin {
             animation: spin 1s linear infinite;
          }
          @keyframes spin {
             from { transform: rotate(0deg); }
             to { transform: rotate(360deg); }
          }
        `}} />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
