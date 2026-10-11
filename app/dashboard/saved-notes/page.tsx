"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface NoteEntry {
  id: number;
  content: string;
  customTitle?: string | null;
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
  const [expandedId, setExpandedId] = useState<number | null>(null);

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
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
        <h1 style={{ fontSize: "clamp(1.6rem, 4vw, 2.25rem)", letterSpacing: "-0.045em" }}>
          Saved Notes
        </h1>
      </div>
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
                transition: "box-shadow 160ms ease",
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.boxShadow = "var(--shadow)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.boxShadow = "none"; }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1rem" }}>
                <h3 style={{ fontSize: "1.05rem", fontWeight: 700, margin: "0 0 0.5rem" }}>
                  {note.customTitle || `Note #${note.id}`}
                </h3>
                {note.sermonId && (
                  <Link href={`/sermons/${note.sermonId}`} style={{ fontSize: "0.8rem", color: "var(--accent-dark)", textDecoration: "none", whiteSpace: "nowrap" }}>
                    📖 View Sermon →
                  </Link>
                )}
              </div>
              
              <p 
                style={{ 
                  color: "var(--ink-muted)", 
                  fontSize: "0.9rem", 
                  lineHeight: 1.6, 
                  margin: "0 0 0.75rem", 
                  whiteSpace: "pre-wrap",
                  maxHeight: expandedId === note.id ? "none" : "4.8em",
                  overflow: "hidden",
                  cursor: "pointer",
                }}
                onClick={() => setExpandedId(expandedId === note.id ? null : note.id)}
              >
                {note.content}
                {note.content.length > 300 && expandedId !== note.id && "..."}
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
                {note.content.length > 300 && (
                  <span style={{ marginLeft: "0.5rem", color: "var(--accent-dark)", cursor: "pointer" }}>
                    {expandedId === note.id ? "[show less]" : "[read more]"}
                  </span>
                )}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
