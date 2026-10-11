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

export default function MySermonsPage() {
  const [sermons, setSermons] = useState<SermonEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

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

  const filteredSermons = sermons.filter((s) =>
    s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.speaker.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <main className="sermon-shell">
        <div className="sermon-container" style={{ minHeight: "60vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          <div style={{ fontSize: "3rem", marginBottom: "1rem", animation: "pulse 1.5s ease-in-out infinite" }}>📖</div>
          <p style={{ color: "var(--ink-muted)", fontSize: "1.1rem" }}>Loading your sermons...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="sermon-shell">
      <div className="sermon-container">
        {/* Header */}
        <header className="sermon-header" style={{ marginBottom: "2rem" }}>
          <p className="eyebrow">Library</p>
          <h1>My Sermons</h1>
          <p>Browse and read your saved sermon transcripts and notes.</p>
        </header>

        {/* Search & Actions */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem", flexWrap: "wrap", gap: "1rem" }}>
          <div style={{ position: "relative", flex: 1, maxWidth: "400px" }}>
            <input
              type="text"
              placeholder="Search sermons..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ width: "100%", padding: "0.75rem 1rem 0.75rem 2.5rem", border: "1px solid var(--line)", borderRadius: "0.75rem", background: "var(--paper)", fontSize: "0.95rem", outline: "none" }}
            />
            <span style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)", fontSize: "1rem" }}>🔍</span>
          </div>
          <Link href="/">
            <button className="btn btn--accent">+ New Sermon</button>
          </Link>
        </div>

        {error && (
          <div style={{ background: "#fff3f3", border: "1px solid #ffcdd2", borderRadius: "0.75rem", padding: "1rem 1.25rem", marginBottom: "1.5rem", color: "#c62828" }}>
            {error}
          </div>
        )}

        {/* Empty State */}
        {sermons.length === 0 && !searchQuery ? (
          <section style={{ textAlign: "center", padding: "4rem 0" }}>
            <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>📚</div>
            <h2 style={{ fontSize: "clamp(1.4rem, 3vw, 2rem)", letterSpacing: "-0.04em", marginBottom: "0.75rem" }}>
              No sermons yet
            </h2>
            <p style={{ color: "var(--ink-muted)", maxWidth: "28rem", margin: "0 auto 2rem" }}>
              Start by pasting a YouTube sermon URL on the Home page to generate your first set of study notes.
            </p>
            <Link href="/">
              <button className="btn btn--accent" style={{ padding: "0.75rem 1.5rem", fontSize: "1rem" }}>
                Go to Home →
              </button>
            </Link>
          </section>
        ) : filteredSermons.length === 0 ? (
          <section style={{ textAlign: "center", padding: "3rem 0" }}>
            <div style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>🔍</div>
            <h2 style={{ fontSize: "1.4rem", fontWeight: 700, marginBottom: "0.5rem" }}>No matching sermons</h2>
            <p style={{ color: "var(--ink-muted)" }}>Try a different search term.</p>
          </section>
        ) : (
          /* Sermon Cards */
          <div style={{ display: "grid", gap: "1rem" }}>
            {filteredSermons.map((sermon) => (
              <Link
                key={sermon.id}
                href={`/sermons/${sermon.id}`}
                style={{
                  background: "var(--paper)",
                  border: "1px solid var(--line)",
                  borderRadius: "1.25rem",
                  padding: "1.75rem",
                  textDecoration: "none",
                  color: "inherit",
                  transition: "box-shadow 160ms ease, transform 120ms ease, border-color 160ms ease",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.boxShadow = "var(--shadow)";
                  (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
                  (e.currentTarget as HTMLElement).style.borderColor = "var(--accent)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.boxShadow = "none";
                  (e.currentTarget as HTMLElement).style.transform = "none";
                  (e.currentTarget as HTMLElement).style.borderColor = "var(--line)";
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1rem" }}>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontSize: "1.15rem", fontWeight: 700, margin: "0 0 0.5rem", lineHeight: 1.4 }}>
                      {sermon.title}
                    </h3>
                    <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", marginBottom: "0.75rem" }}>
                      <span style={{ color: "var(--ink-muted)", fontSize: "0.85rem" }}>🎤 {sermon.speaker || "Unknown Speaker"}</span>
                      <span style={{ 
                        background: sermon.transcriptionMethod === "LOCAL_WHISPER" ? "#e3f2fd" : "#f3e5f5", 
                        color: sermon.transcriptionMethod === "LOCAL_WHISPER" ? "#1565c0" : "#7b1fa2",
                        fontSize: "0.75rem", 
                        fontWeight: 600, 
                        padding: "0.2rem 0.6rem", 
                        borderRadius: "99px" 
                      }}>
                        {sermon.transcriptionMethod === "LOCAL_WHISPER" ? "🎙️ Whisper" : "📺 YouTube"}
                      </span>
                    </div>
                    <p style={{ color: "var(--ink-muted)", fontSize: "0.8rem", margin: 0 }}>
                      Saved {new Date(sermon.createdAt).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" })} at{" "}
                      {new Date(sermon.createdAt).toLocaleTimeString()}
                    </p>
                  </div>
                  <span style={{ fontSize: "1.5rem", color: "var(--ink-muted)", flexShrink: 0 }}>→</span>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Footer */}
        {sermons.length > 0 && (
          <div style={{ textAlign: "center", padding: "2rem 0", borderTop: "1px solid var(--line)", marginTop: "2rem" }}>
            <p style={{ color: "var(--ink-muted)", fontSize: "0.9rem" }}>
              {sermons.length} sermon{sermons.length !== 1 ? "s" : ""} saved • Click any sermon to read it
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
