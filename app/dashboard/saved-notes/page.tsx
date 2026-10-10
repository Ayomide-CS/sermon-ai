"use client";

import { useState, useEffect } from "react";

interface NoteEntry {
  id: number;
  content: string;
  customTitle?: string;
  tags: string[];
  sermonId?: number | null;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function SavedNotes() {
  const [notes, setNotes] = useState<NoteEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchNotes();
  }, []);

  async function fetchNotes() {
    try {
      const accessToken = typeof window !== "undefined" ? localStorage.getItem("sermon_ai_access_token") : null;

      const headers: Record<string, string> = {};
      if (accessToken) {
        headers["Authorization"] = `Bearer ${accessToken}`;
      }

      const res = await fetch("/api/notes?action=list", { headers });

      if (!res.ok) {
        throw new Error("Failed to load notes");
      }

      const data = await res.json();
      setNotes(data.notes || []);
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
          Saved Notes
        </h1>
        <p style={{ color: "var(--ink-muted)", marginBottom: "2rem" }}>Loading your notes...</p>
      </div>
    );
  }

  return (
    <div>
      <h1 style={{ fontSize: "clamp(1.6rem, 4vw, 2.25rem)", letterSpacing: "-0.045em", marginBottom: "0.5rem" }}>
        Saved Notes
      </h1>
      <p style={{ color: "var(--ink-muted)", marginBottom: "2rem" }}>Your personal reflections and study notes.</p>

      {error && (
        <p className="error-message">{error}</p>
      )}

      {notes.length === 0 ? (
        <div style={{ background: "var(--paper)", border: "1px solid var(--line)", borderRadius: "1.25rem", padding: "3rem 2rem", textAlign: "center" }}>
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>📝</div>
          <h3 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "0.5rem" }}>No notes saved yet</h3>
          <p style={{ color: "var(--ink-muted)", maxWidth: "28rem", margin: "0 auto" }}>
            Create personal notes while studying sermons to capture your reflections and insights.
          </p>
        </div>
      ) : (
        <div style={{ display: "grid", gap: "1rem" }}>
          {notes.map((note) => (
            <div
              key={note.id}
              style={{
                background: "var(--paper)",
                border: "1px solid var(--line)",
                borderRadius: "1.25rem",
                padding: "1.5rem",
              }}
            >
              <h3 style={{ fontSize: "1.05rem", fontWeight: 700, margin: "0 0 0.5rem" }}>
                {note.customTitle || `Note #${note.id}`}
              </h3>
              <p style={{ color: "var(--ink-muted)", fontSize: "0.9rem", lineHeight: 1.6, margin: "0 0 0.75rem", whiteSpace: "pre-wrap" }}>
                {note.content.length > 200 ? note.content.slice(0, 200) + "..." : note.content}
              </p>
              <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", alignItems: "center" }}>
                {note.tags.map((tag) => (
                  <span key={tag} style={{ background: "var(--accent-soft)", color: "var(--accent-dark)", fontSize: "0.75rem", fontWeight: 600, padding: "0.2rem 0.6rem", borderRadius: "99px" }}>
                    {tag}
                  </span>
                ))}
              </div>
              <p style={{ color: "var(--ink-muted)", fontSize: "0.8rem", margin: "0.75rem 0 0" }}>
                Updated {new Date(note.updatedAt).toLocaleDateString()} at{" "}
                {new Date(note.updatedAt).toLocaleTimeString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
