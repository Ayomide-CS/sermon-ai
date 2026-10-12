"use client";

import Image from "next/image";
import { useState } from "react";

import SermonNoteView from "./SermonNote/SermonNoteView";
import TranscriptModeSelector, { type TranscriptionMode } from "./TranscriptModeSelector";

import { buildStructuredNote } from "@/app/lib/engines/structured";

import type {
  SermonMetadata,
  SermonNote,
} from "@/app/types/sermon";

export default function SermonForm() {
  const [url, setUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [sermonNote, setSermonNote] = useState<SermonNote | null>(null);
  const [metadata, setMetadata] = useState<SermonMetadata | null>(null);
  const [transcript, setTranscript] = useState<string | null>(null);

  // Mode selection state
  const [selectedMode, setSelectedMode] = useState<TranscriptionMode>("deterministic");
  const [externalApiKey, setExternalApiKey] = useState("");

  // Save state
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");

  /*
   * Handle mode change from the selector
   */
  const handleModeChange = (mode: TranscriptionMode, apiKey?: string) => {
    setSelectedMode(mode);
    if (apiKey !== undefined) {
      setExternalApiKey(apiKey);
    }
  };

  /*
   * Main submission handler — routes to the correct transcription method
   */
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedUrl = url.trim();

    if (!trimmedUrl) {
      setError("Please paste a YouTube URL.");
      setMessage("");
      return;
    }

    setIsSubmitting(true);
    setError("");
    setMessage("");
    setSaveMessage("");

    // Reset previous sermon result
    setMetadata(null);
    setTranscript(null);
    setSermonNote(null);

    try {
      if (selectedMode === "external") {
        await handleExternalTranscription(trimmedUrl);
      } else {
        await handleBuiltInTranscription(trimmedUrl);
      }

      setUrl("");
    } catch (caughtError) {
      setError(
        caughtError instanceof Error ? caughtError.message : "Something went wrong."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  /*
   * Built-in transcription: deterministic → whisper fallback
   */
  const handleBuiltInTranscription = async (youtubeUrl: string) => {
    setMessage("Fetching sermon transcript...");

    const response = await fetch("/api/sermons", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ youtubeUrl, mode: selectedMode }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || "Something went wrong.");
    }

    setMetadata(result.metadata);
    setTranscript(result.transcript.text);

    // Generate structured notes deterministically (no AI call)
    setMessage("Generating sermon notes...");

    const note = buildStructuredNote(result.transcript.text);
    setSermonNote(note);
    setMessage("Sermon notes are ready.");
  };

  /*
   * External LLM transcription: user provides API key
   */
  const handleExternalTranscription = async (youtubeUrl: string) => {
    if (!externalApiKey.trim()) {
      throw new Error("Please enter your API key to use cloud transcription.");
    }

    setMessage("Fetching YouTube video info...");

    let rawTranscript = "";
    let metaResult = null;

    try {
      const transcriptResponse = await fetch("/api/sermons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ youtubeUrl }),
      });

      if (transcriptResponse.ok) {
        const transcriptData = await transcriptResponse.json();
        rawTranscript = transcriptData.transcript?.text || "";
        metaResult = transcriptData.metadata;
      }
    } catch {
      // Will fall through to manual paste prompt
    }

    if (!rawTranscript || rawTranscript.length < 50) {
      setMessage(
        "Could not automatically fetch the transcript. Please paste the sermon text below, and we will structure it with your AI provider."
      );
      throw new Error("TRANSCRIPT_REQUIRED");
    }

    // Now send to external LLM for structuring
    setMessage(`Structuring with cloud AI...`);

    const provider = "openai";
    const structureResponse = await fetch("/api/transcribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        transcriptText: rawTranscript,
        provider,
        apiKey: externalApiKey,
      }),
    });

    if (!structureResponse.ok) {
      const errData = await structureResponse.json().catch(() => ({}));
      throw new Error(errData.error || "Failed to process with cloud AI.");
    }

    const structuredResult = await structureResponse.json();

    if (structuredResult.data?.text) {
      setTranscript(structuredResult.data.text);
      const note = buildStructuredNote(structuredResult.data.text);
      setSermonNote(note);
    } else {
      setTranscript(rawTranscript);
      const note = buildStructuredNote(rawTranscript);
      setSermonNote(note);
    }

    if (metaResult) setMetadata(metaResult);
    setMessage("Sermon notes are ready.");
  };

  /*
   * Save sermon to database (requires authentication)
   */
  const handleSaveSermon = async () => {
    if (!sermonNote || !metadata || !transcript) return;

    setIsSaving(true);
    setSaveMessage("");

    try {
      // Get auth token from localStorage (set by auth context on login)
      const accessToken = typeof window !== "undefined" ? localStorage.getItem("sermon_ai_access_token") : null;

      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (accessToken) {
        headers["Authorization"] = `Bearer ${accessToken}`;
      }

      const response = await fetch("/api/sermons?save=1", {
        method: "POST",
        headers,
        body: JSON.stringify({
          action: "save",
          metadata,
          transcript,
          note: sermonNote,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to save sermon.");
      }

      setSaveMessage("Sermon saved successfully!");
    } catch (err) {
      setSaveMessage(err instanceof Error ? err.message : "Failed to save.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      {/* =========================================
          STEP 1 — YOUTUBE URL FORM
      ========================================== */}

      <form className="sermon-form" onSubmit={handleSubmit}>
        <div className="sermon-form-row">
          <input
            type="url"
            value={url}
            onChange={(event) => setUrl(event.target.value)}
            placeholder="Paste a YouTube sermon URL here..."
            aria-label="YouTube URL"
            required
          />

          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Processing..." : "Get Sermon Notes"}
          </button>
        </div>
      </form>

      {/* =========================================
          ERROR
      ========================================== */}

      {error && (
        <p className="error-message" role="alert">
          {error === "TRANSCRIPT_REQUIRED" ? (
            <>
              <strong>Transcript needed.</strong>{" "}
              Please paste the sermon text in a textarea that will appear, or try a different URL.
            </>
          ) : (
            error
          )}
        </p>
      )}

      {/* =========================================
          STATUS MESSAGE
      ========================================== */}

      {message && <p className="status-message">{message}</p>}

      {/* =========================================
          STEP 2 — SERMON METADATA
      ========================================== */}

      {metadata && (
        <section className="metadata-card">
          <div>
            <p className="eyebrow">Sermon ready</p>
            <h2>{metadata.title}</h2>
            <div className="metadata-details">
              <span>Speaker: {metadata.speaker}</span>
              <span>{metadata.duration || "Unknown duration"}</span>
            </div>
          </div>

          {metadata.thumbnail && (
            <Image
              src={metadata.thumbnail}
              alt={metadata.title}
              width={480}
              height={360}
              unoptimized
            />
          )}
        </section>
      )}

      {/* =========================================
          SAVE BUTTON
      ========================================== */}

      {sermonNote && (
        <div style={{ maxWidth: "62rem", margin: "1.5rem auto 0", display: "flex", gap: "1rem", alignItems: "center" }}>
          <button
            onClick={handleSaveSermon}
            disabled={isSaving}
            className="btn btn--accent"
            style={{ padding: "0.75rem 1.5rem" }}
          >
            {isSaving ? "Saving..." : "💾 Save Sermon"}
          </button>

          {saveMessage && (
            <p style={{ color: saveMessage.includes("success") ? "#365641" : "#943e2c", fontSize: "0.9rem" }}>
              {saveMessage}
            </p>
          )}
        </div>
      )}

      {/* =========================================
          STEP 3 — SERMON NOTES (Structured View)
      ========================================== */}

      {sermonNote && <SermonNoteView sermonNote={sermonNote} />}

      {/* =========================================
          STEP 4 — MODE SELECTOR (at bottom, for switching)
      ========================================== */}

      <div style={{ marginTop: "3rem", paddingTop: "2rem", borderTop: "1px solid var(--line)", maxWidth: "62rem", margin: "3rem auto 0" }}>
        <p className="eyebrow">Want a different approach?</p>
        <h3 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "1rem" }}>Change transcription method</h3>
        <TranscriptModeSelector onModeChange={handleModeChange} />
      </div>
    </>
  );
}
