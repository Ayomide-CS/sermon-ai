"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface SermonEntry {
  id: number;
  title: string;
  speaker: string;
  youtubeUrl: string;
  transcriptionMethod: string | null;
  createdAt: string;
  updatedAt: string;
}

export default function MySermons() {
  const [sermons, setSermons] = useState<SermonEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchSermons();
  }, []);

  async function fetchSermons() {
    try {
      const accessToken = typeof window !== "undefined" ? localStorage.getItem("sermon_ai_access_token") : null;

      const headers: Record<string, string> = {};
      if (accessToken) {
        headers["Authorization"] = `Bearer ${accessToken}`;
      }

      const res = await fetch("/api/sermons?action=list", { headers });

      if (!res.ok) {
        throw new Error("Failed to load sermons");
      }

      const data = await res.json();
      setSermons(data.sermons || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div>
        <h1 style={{ fontSize: "clamp(1.6rem, 4vw, 2.25rem)", letterSpacing: "-0.045em", marginBottom: "0.5rem" }}>
          My Sermons
        </h1>
        <p style={{ color: "var(--ink-muted)", marginBottom: "2rem" }}>Loading your sermons...</p>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
        <h1 style={{ fontSize: "clamp(1.6rem, 4vw, 2.25rem)", letterSpacing: "-0.045em" }}>
          My Sermons
        </h1>
        <Link href="/">
          <button className="btn btn--accent">+ New Sermon</button>
        </Link>
      </div>
      <p style={{ color: "var(--ink-muted)", marginBottom: "2rem" }}>All your saved sermon transcripts.</p>

      {error && (
        <p className="error-message">{error}</p>
      )}

      {sermons.length === 0 ? (
        <div style={{ background: "var(--paper)", border: "1px solid var(--line)", borderRadius: "1.25rem", padding: "3rem 2rem", textAlign: "center" }}>
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>📚</div>
          <h3 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "0.5rem" }}>No sermons saved yet</h3>
          <p style={{ color: "var(--ink-muted)", maxWidth: "28rem", margin: "0 auto" }}>
            Analyze a sermon from the Home page to see it listed here.
          </p>
          <Link href="/">
            <button className="btn btn--accent" style={{ marginTop: "1rem" }}>Go to Home →</button>
          </Link>
        </div>
      ) : (
        <div style={{ display: "grid", gap: "1rem" }}>
          {sermons.map((sermon) => (
            <Link
              key={sermon.id}
              href={`/sermons/${sermon.id}`}
              style={{
                background: "var(--paper)",
                border: "1px solid var(--line)",
                borderRadius: "1.25rem",
                padding: "1.5rem",
                textDecoration: "none",
                color: "inherit",
                transition: "box-shadow 160ms ease, transform 120ms ease",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.boxShadow = "var(--shadow)";
                (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.boxShadow = "none";
                (e.currentTarget as HTMLElement).style.transform = "none";
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <h3 style={{ fontSize: "1.1rem", fontWeight: 700, margin: "0 0 0.5rem" }}>
                    {sermon.title}
                  </h3>
                  <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", marginBottom: "0.5rem" }}>
                    <span style={{ color: "var(--ink-muted)", fontSize: "0.85rem" }}>🎤 {sermon.speaker}</span>
                    <span style={{ color: "var(--ink-muted)", fontSize: "0.85rem" }}>
                      📝 {sermon.transcriptionMethod === "LOCAL_WHISPER" ? "Local Whisper" : "YouTube Transcript"}
                    </span>
                  </div>
                  <p style={{ color: "var(--ink-muted)", fontSize: "0.8rem", margin: 0 }}>
                    Saved {new Date(sermon.createdAt).toLocaleDateString()} at{" "}
                    {new Date(sermon.createdAt).toLocaleTimeString()}
                  </p>
                </div>
                <span style={{ color: "var(--ink-muted)", fontSize: "1.2rem" }}>→</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
