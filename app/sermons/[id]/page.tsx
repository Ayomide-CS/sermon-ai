"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

interface SermonDetail {
  id: number;
  title: string;
  speaker: string;
  youtubeUrl: string;
  youtubeVideoId: string;
  transcript: string | null;
  transcriptionMethod: string | null;
  duration: string | null;
  thumbnailUrl: string | null;
  publishedAt: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface SavedNote {
  id: number;
  content: string;
  customTitle: string | null;
  tags: string[];
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

interface SermonResponse {
  sermon: SermonDetail;
  notes: SavedNote[];
}

type ViewMode = "overview" | "transcript" | "notes";

export default function SermonDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [sermon, setSermon] = useState<SermonDetail | null>(null);
  const [notes, setNotes] = useState<SavedNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("overview");
  const [showTranscript, setShowTranscript] = useState(false);

  useEffect(() => {
    fetchSermon();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchSermon() {
    try {
      const resolvedParams = await params;
      const accessToken = typeof window !== "undefined" ? localStorage.getItem("sermon_ai_access_token") : null;

      const headers: Record<string, string> = {};
      if (accessToken) {
        headers["Authorization"] = `Bearer ${accessToken}`;
      }

      const res = await fetch(`/api/sermons?action=get&id=${resolvedParams.id}`, { headers });

      if (!res.ok) {
        if (res.status === 401) {
          router.push("/");
          return;
        }
        throw new Error("Failed to load sermon");
      }

      const data: SermonResponse = await res.json();
      setSermon(data.sermon);
      setNotes(data.notes || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  const getYouTubeVideoId = (url: string): string | null => {
    // Extract video ID from various YouTube URL formats
    const patterns = [
      /(?:youtu\.be\/)([\w-]+)/,
      /(?:youtube\.com\/embed\/)([\w-]+)/,
      /(?:youtube\.com\/v\/)([\w-]+)/,
      /(?:youtube\.com\/watch\?v=)([\w-]+)/,
      /(?:youtube\.com\/watch\?.+&v=)([\w-]+)/,
    ];
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }
    return null;
  };

  const videoId = sermon ? getYouTubeVideoId(sermon.youtubeUrl) || sermon.youtubeVideoId : null;

  if (loading) {
    return (
      <div style={{ minHeight: "60vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <div style={{ fontSize: "3rem", marginBottom: "1rem", animation: "pulse 1.5s ease-in-out infinite" }}>📖</div>
        <p style={{ color: "var(--ink-muted)", fontSize: "1.1rem" }}>Loading sermon...</p>
      </div>
    );
  }

  if (error || !sermon) {
    return (
      <div style={{ minHeight: "60vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>😔</div>
        <h2 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "0.5rem" }}>Sermon not found</h2>
        <p style={{ color: "var(--ink-muted)", marginBottom: "1.5rem" }}>{error || "This sermon may have been removed."}</p>
        <Link href="/sermons">
          <button className="btn btn--accent">← Back to My Sermons</button>
        </Link>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "900px", margin: "0 auto" }}>
      {/* Breadcrumb */}
      <nav style={{ marginBottom: "1.5rem" }}>
        <Link href="/sermons" style={{ color: "var(--ink-muted)", fontSize: "0.9rem", textDecoration: "none" }}>
          ← Back to My Sermons
        </Link>
      </nav>

      {/* Header with thumbnail */}
      <div style={{ background: "var(--paper)", border: "1px solid var(--line)", borderRadius: "1.25rem", padding: "2rem", marginBottom: "1.5rem" }}>
        <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap" }}>
          {videoId && (
            <div style={{ position: "relative", width: "320px", height: "180px", borderRadius: "0.75rem", overflow: "hidden", flexShrink: 0, background: "#000" }}>
              <iframe
                src={`https://www.youtube.com/embed/${videoId}`}
                title={sermon.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                style={{ width: "100%", height: "100%", border: "none" }}
              />
            </div>
          )}
          <div style={{ flex: 1, minWidth: "280px" }}>
            <p className="eyebrow">Saved Sermon</p>
            <h1 style={{ fontSize: "clamp(1.4rem, 3vw, 1.75rem)", fontWeight: 800, letterSpacing: "-0.04em", margin: "0.5rem 0" }}>
              {sermon.title}
            </h1>
            <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", marginBottom: "1rem" }}>
              <span style={{ color: "var(--ink-muted)", fontSize: "0.9rem" }}>🎤 {sermon.speaker || "Unknown Speaker"}</span>
              {sermon.duration && (
                <span style={{ color: "var(--ink-muted)", fontSize: "0.9rem" }}>⏱️ {sermon.duration}</span>
              )}
            </div>
            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
              <span style={{ background: "var(--accent-soft)", color: "var(--accent-dark)", fontSize: "0.8rem", fontWeight: 600, padding: "0.3rem 0.75rem", borderRadius: "99px" }}>
                {sermon.transcriptionMethod === "LOCAL_WHISPER" ? "🎙️ Local Whisper" : "📺 YouTube Transcript"}
              </span>
              <span style={{ background: sermon.status === "ready" ? "#e8f5e9" : "#fff3e0", color: sermon.status === "ready" ? "#2e7d32" : "#ef6c00", fontSize: "0.8rem", fontWeight: 600, padding: "0.3rem 0.75rem", borderRadius: "99px" }}>
                {sermon.status}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* View Mode Tabs */}
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem", borderBottom: "1px solid var(--line)", paddingBottom: "0" }}>
        {([
          { key: "overview", label: "Overview", icon: "📋" },
          { key: "transcript", label: "Full Transcript", icon: "📄" },
          { key: "notes", label: `Notes (${notes.length})`, icon: "✏️" },
        ] as { key: ViewMode; label: string; icon: string }[]).map((tab) => (
          <button
            key={tab.key}
            onClick={() => setViewMode(tab.key)}
            style={{
              padding: "0.75rem 1.25rem",
              border: "none",
              borderBottom: viewMode === tab.key ? "3px solid var(--accent)" : "3px solid transparent",
              background: "transparent",
              color: viewMode === tab.key ? "var(--accent-dark)" : "var(--ink-muted)",
              fontSize: "0.95rem",
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 160ms ease",
            }}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {viewMode === "overview" && (
        <div style={{ background: "var(--paper)", border: "1px solid var(--line)", borderRadius: "1.25rem", padding: "2rem" }}>
          <h3 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "1rem" }}>Sermon Summary</h3>
          
          {sermon.transcript ? (
            <>
              <p style={{ color: "var(--ink)", lineHeight: 1.7, margin: "0 0 1.5rem" }}>
                This sermon by <strong>{sermon.speaker || "Unknown Speaker"}</strong> was transcribed using {sermon.transcriptionMethod === "LOCAL_WHISPER" ? "local Whisper AI" : "YouTube captions"} and saved on{" "}
                {new Date(sermon.createdAt).toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}.
              </p>
              
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem", marginBottom: "1.5rem" }}>
                <InfoCard label="Transcript Length" value={`${(sermon.transcript.length / 1000).toFixed(1)}k characters`} />
                <InfoCard label="Saved On" value={new Date(sermon.createdAt).toLocaleDateString()} />
                <InfoCard label="Last Updated" value={new Date(sermon.updatedAt).toLocaleDateString()} />
              </div>

              <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
                <button
                  onClick={() => setViewMode("transcript")}
                  className="btn btn--accent"
                  style={{ padding: "0.65rem 1.25rem" }}
                >
                  Read Full Transcript →
                </button>
                {notes.length > 0 && (
                  <button
                    onClick={() => setViewMode("notes")}
                    style={{ background: "transparent", color: "var(--ink)", border: "1px solid var(--line)", borderRadius: "0.8rem", padding: "0.65rem 1.25rem", fontWeight: 600, cursor: "pointer" }}
                  >
                    View Notes ({notes.length}) →
                  </button>
                )}
              </div>
            </>
          ) : (
            <p style={{ color: "var(--ink-muted)" }}>No transcript available for this sermon.</p>
          )}

          {notes.length > 0 && (
            <>
              <h3 style={{ fontSize: "1.1rem", fontWeight: 700, margin: "2rem 0 1rem" }}>Saved Notes</h3>
              <div style={{ display: "grid", gap: "1rem" }}>
                {notes.slice(0, 3).map((note) => (
                  <div key={note.id} style={{ background: "var(--background)", border: "1px solid var(--line)", borderRadius: "0.75rem", padding: "1.25rem" }}>
                    <h4 style={{ fontSize: "1rem", fontWeight: 600, margin: "0 0 0.5rem" }}>
                      {note.customTitle || `Note #${note.id}`}
                    </h4>
                    <p style={{ color: "var(--ink-muted)", fontSize: "0.9rem", lineHeight: 1.6, margin: 0, whiteSpace: "pre-wrap" }}>
                      {note.content.length > 150 ? note.content.slice(0, 150) + "..." : note.content}
                    </p>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* Transcript Tab */}
      {viewMode === "transcript" && (
        <div style={{ background: "var(--paper)", border: "1px solid var(--line)", borderRadius: "1.25rem", padding: "2rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
            <h3 style={{ fontSize: "1.1rem", fontWeight: 700, margin: 0 }}>Full Transcript</h3>
            {sermon.transcript && (
              <button
                onClick={() => setShowTranscript(!showTranscript)}
                style={{ background: "var(--accent-soft)", color: "var(--accent-dark)", border: "none", borderRadius: "0.5rem", padding: "0.4rem 0.75rem", fontSize: "0.85rem", fontWeight: 600, cursor: "pointer" }}
              >
                {showTranscript ? "Collapse" : "Expand All"}
              </button>
            )}
          </div>

          {sermon.transcript ? (
            <div style={{ 
              background: "var(--background)", 
              border: "1px solid var(--line)", 
              borderRadius: "0.75rem", 
              padding: showTranscript ? "1.5rem" : "1rem",
              maxHeight: showTranscript ? "none" : "300px",
              overflow: "hidden",
              position: "relative",
            }}>
              <pre style={{ 
                whiteSpace: "pre-wrap", 
                wordWrap: "break-word", 
                fontFamily: "inherit", 
                fontSize: "0.95rem", 
                lineHeight: 1.8, 
                margin: 0,
                color: "var(--ink)",
              }}>
                {showTranscript ? sermon.transcript : sermon.transcript.slice(0, 2000) + (sermon.transcript.length > 2000 ? "\n\n... [click Expand All to see more]" : "")}
              </pre>
              {!showTranscript && sermon.transcript.length > 2000 && (
                <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "80px", background: "linear-gradient(transparent, var(--background))", pointerEvents: "none" }} />
              )}
            </div>
          ) : (
            <p style={{ color: "var(--ink-muted)", textAlign: "center", padding: "2rem 0" }}>No transcript available for this sermon.</p>
          )}

          {sermon.transcript && (
            <button
              onClick={() => {
                navigator.clipboard.writeText(sermon.transcript || "");
              }}
              style={{ marginTop: "1rem", background: "transparent", color: "var(--ink-muted)", border: "1px solid var(--line)", borderRadius: "0.5rem", padding: "0.4rem 0.75rem", fontSize: "0.85rem", cursor: "pointer" }}
            >
              📋 Copy Transcript
            </button>
          )}
        </div>
      )}

      {/* Notes Tab */}
      {viewMode === "notes" && (
        <div>
          {notes.length > 0 ? (
            <div style={{ display: "grid", gap: "1.25rem" }}>
              {notes.map((note) => (
                <div key={note.id} style={{ background: "var(--paper)", border: "1px solid var(--line)", borderRadius: "1.25rem", padding: "1.75rem" }}>
                  <h3 style={{ fontSize: "1.1rem", fontWeight: 700, margin: "0 0 0.75rem" }}>
                    {note.customTitle || `Note #${note.id}`}
                  </h3>
                  <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "1rem" }}>
                    {note.tags.map((tag) => (
                      <span key={tag} style={{ background: "var(--accent-soft)", color: "var(--accent-dark)", fontSize: "0.75rem", fontWeight: 600, padding: "0.2rem 0.6rem", borderRadius: "99px" }}>
                        {tag}
                      </span>
                    ))}
                  </div>
                  <p style={{ color: "var(--ink)", fontSize: "0.95rem", lineHeight: 1.7, margin: "0 0 1rem", whiteSpace: "pre-wrap" }}>
                    {note.content}
                  </p>
                  <p style={{ color: "var(--ink-muted)", fontSize: "0.8rem", margin: 0 }}>
                    Created {new Date(note.createdAt).toLocaleDateString()} at{" "}
                    {new Date(note.createdAt).toLocaleTimeString()}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ background: "var(--paper)", border: "1px solid var(--line)", borderRadius: "1.25rem", padding: "3rem 2rem", textAlign: "center" }}>
              <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>📝</div>
              <h3 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "0.5rem" }}>No notes for this sermon</h3>
              <p style={{ color: "var(--ink-muted)", maxWidth: "28rem", margin: "0 auto" }}>
                Go back to the home page and analyze this sermon again to generate structured notes.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Footer Actions */}
      <div style={{ marginTop: "2rem", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
        <Link href="/sermons">
          <button style={{ background: "transparent", color: "var(--ink-muted)", border: "1px solid var(--line)", borderRadius: "0.8rem", padding: "0.65rem 1.25rem", fontWeight: 600, cursor: "pointer" }}>
            ← All Sermons
          </button>
        </Link>
        <a href={sermon.youtubeUrl} target="_blank" rel="noopener noreferrer">
          <button style={{ background: "#ff0000", color: "#fffdf8", border: "none", borderRadius: "0.8rem", padding: "0.65rem 1.25rem", fontWeight: 600, cursor: "pointer" }}>
            ▶ Watch on YouTube
          </button>
        </a>
      </div>
    </div>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ background: "var(--background)", border: "1px solid var(--line)", borderRadius: "0.75rem", padding: "1rem" }}>
      <p style={{ fontSize: "0.8rem", color: "var(--ink-muted)", margin: "0 0 0.25rem" }}>{label}</p>
      <p style={{ fontSize: "1rem", fontWeight: 700, margin: 0 }}>{value}</p>
    </div>
  );
}
