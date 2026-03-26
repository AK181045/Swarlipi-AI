import type { Metadata } from "next";
import { Inter, Outfit, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

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
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
