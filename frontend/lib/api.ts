/**
 * SwarLipi AI — API Client Library
 * Centralized API communication with TanStack Query hooks.
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const WS_BASE = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8000";

// ── Types ──

export interface User {
  id: string;
  email: string;
  display_name: string | null;
  avatar_url: string | null;
  subscription_tier: "free" | "pro" | "enterprise";
  created_at: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  user: User;
}

export interface StemData {
  id: string;
  instrument_type: string;
  status: string;
  display_name: string;
  audio_url?: string;
  midi_url?: string;
  musicxml_url?: string;
  waveform_url?: string;
  sargam_url?: string;
  tabla_bol_url?: string;
  created_at: string;
}

export interface Project {
  id: string;
  title: string;
  source_type: string;
  source_url: string | null;
  source_filename: string | null;
  status: string;
  error_message: string | null;
  notation_type: string;
  duration_seconds: number | null;
  detected_tempo: number | null;
  detected_key: string | null;
  detected_time_signature: string | null;
  detected_raga: string | null;
  stems: StemData[];
  created_at: string;
  updated_at: string;
  completed_at: string | null;
}

export interface ProjectList {
  projects: Project[];
  total: number;
  page: number;
  page_size: number;
}

export interface ProjectStatus {
  id: string;
  status: string;
  error_message: string | null;
  progress_percent: number;
  current_step: string;
}

export interface ScoreData {
  project_id: string;
  status: string;
  notation_type: string;
  western?: {
    music_xml: string;
    metadata: Record<string, unknown>;
  };
  sargam?: {
    notes: Array<{
      beat: number;
      note: string;
      octave: string;
      modifier: string | null;
      ornament: string | null;
      duration: number;
    }>;
    raga?: {
      name: string;
      thaat: string | null;
      aroha: string;
      avaroha: string;
    };
  };
  stems: Array<Record<string, unknown>>;
  metadata: Record<string, unknown>;
}

export interface RagaDetail {
  id: number;
  name: string;
  aliases: string[];
  thaat: string | null;
  melakarta: number | null;
  aroha: string;
  avaroha: string;
  vadi: string | null;
  samvadi: string | null;
  time_of_day: string | null;
  mood: string | null;
  scale_western: string[];
  scale_sargam: string[];
}

// ── Auth Token Management ──

let authToken: string | null = null;

export function setAuthToken(token: string) {
  authToken = token;
  if (typeof window !== "undefined") {
    localStorage.setItem("swarlipi_token", token);
  }
}

export function getAuthToken(): string | null {
  if (authToken) return authToken;
  if (typeof window !== "undefined") {
    authToken = localStorage.getItem("swarlipi_token");
  }
  return authToken;
}

export function clearAuthToken() {
  authToken = null;
  if (typeof window !== "undefined") {
    localStorage.removeItem("swarlipi_token");
  }
}

// ── HTTP Client ──

async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getAuthToken();
  const headers: HeadersInit = {
    ...options.headers,
  };

  if (token) {
    (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
  }

  // Don't set Content-Type for FormData
  if (!(options.body instanceof FormData)) {
    (headers as Record<string, string>)["Content-Type"] = "application/json";
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({
      detail: response.statusText,
    }));
    throw new Error(error.detail || `API error: ${response.status}`);
  }

  // Handle 204 No Content
  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
}

// ── Auth API ──

export async function register(
  email: string,
  password: string,
  displayName?: string
): Promise<TokenResponse> {
  const data = await apiFetch<TokenResponse>("/api/v1/auth/register", {
    method: "POST",
    body: JSON.stringify({ email, password, display_name: displayName }),
  });
  setAuthToken(data.access_token);
  return data;
}

export async function login(
  email: string,
  password: string
): Promise<TokenResponse> {
  const data = await apiFetch<TokenResponse>("/api/v1/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  setAuthToken(data.access_token);
  return data;
}

// ── Project API ──

export async function createTranscription(
  formData: FormData
): Promise<Project> {
  const token = getAuthToken();
  const response = await fetch(`${API_BASE}/api/v1/transcribe`, {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({
      detail: "Upload failed",
    }));
    throw new Error(error.detail);
  }

  return response.json();
}

export async function listProjects(
  page = 1,
  pageSize = 20
): Promise<ProjectList> {
  return apiFetch(`/api/v1/projects?page=${page}&page_size=${pageSize}`);
}

export async function getProject(projectId: string): Promise<Project> {
  return apiFetch(`/api/v1/projects/${projectId}`);
}

export async function getProjectStatus(
  projectId: string
): Promise<ProjectStatus> {
  return apiFetch(`/api/v1/projects/${projectId}/status`);
}

export async function deleteProject(projectId: string): Promise<void> {
  return apiFetch(`/api/v1/projects/${projectId}`, { method: "DELETE" });
}

// ── Score API ──

export async function getScore(projectId: string): Promise<ScoreData> {
  return apiFetch(`/api/v1/score/${projectId}`);
}

export function getExportUrl(projectId: string, format: string): string {
  return `${API_BASE}/api/v1/score/${projectId}/export?format=${format}`;
}

// ── Raga API ──

export async function lookupRaga(
  query?: string,
  thaat?: string
): Promise<{ ragas: RagaDetail[]; total: number }> {
  const params = new URLSearchParams();
  if (query) params.set("name", query);
  if (thaat) params.set("thaat", thaat);
  return apiFetch(`/api/v1/raga-lookup?${params}`);
}

// ── WebSocket ──

export function createStatusWebSocket(
  projectId: string,
  onMessage: (data: ProjectStatus) => void,
  onError?: (error: Event) => void
): WebSocket {
  const ws = new WebSocket(`${WS_BASE}/ws/status/${projectId}`);

  ws.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      onMessage(data);
    } catch (e) {
      console.error("WebSocket parse error:", e);
    }
  };

  ws.onerror = (event) => {
    console.error("WebSocket error:", event);
    onError?.(event);
  };

  // Heartbeat
  const heartbeat = setInterval(() => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send("ping");
    }
  }, 30000);

  const originalClose = ws.close.bind(ws);
  ws.close = (...args) => {
    clearInterval(heartbeat);
    originalClose(...args);
  };

  return ws;
}

export function createScoreWebSocket(
  projectId: string,
  onMessage: (data: Record<string, unknown>) => void
): WebSocket {
  const ws = new WebSocket(`${WS_BASE}/ws/score/${projectId}`);

  ws.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      onMessage(data);
    } catch (e) {
      console.error("WebSocket parse error:", e);
    }
  };

  return ws;
}
