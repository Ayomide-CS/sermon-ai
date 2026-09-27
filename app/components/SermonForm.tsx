"use client";

import Image from "next/image";
import { useState } from "react";
import ModeSelector from "./ModeSelector";
import SermonNoteView from "./SermonNote/SermonNoteView";
import type { SermonMetadata, SermonNote } from "@/app/types/sermon";
import { buildStructuredNote } from "../lib/engines/structured";


export default function SermonForm() {
  const [url, setUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [sermonNote, setSermonNote] = useState<SermonNote | null>(null);
  const [metadata, setMetadata] = useState<SermonMetadata | null>(null);
  const [transcript, setTranscript] = useState<string | null>(null);
  const [selectedMode, setSelectedMode] = useState<"structured" | "ai" | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

    const handleModeSelect = (
  mode: "structured" | "ai"
) => {
  if (!transcript || !metadata) {
    setError("Transcript is not available.");
    return;
  }

  setSelectedMode(mode);
  setIsProcessing(true);
  setError("");

  if (mode === "structured") {
    setMessage(
      "Generating structured notes from the transcript..."
    );

    const note = buildStructuredNote(transcript);

    setSermonNote(note);

    setIsProcessing(false);

    setMessage("Structured notes are ready.");

    return;
  }

  setIsProcessing(false);

  setMessage(
    "AI-powered sermon notes are coming next."
  );
};

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
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
    setSermonNote(null);
    setSelectedMode(null);

    try {
      const response = await fetch("/api/sermons", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          youtubeUrl: trimmedUrl,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Something went wrong.");
      }

      setMetadata(result.metadata);
      setTranscript(result.transcript.text);
      setMessage(result.message || "Sermon is ready for analysis.");
      setUrl("");
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Something went wrong."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <form className="sermon-form" onSubmit={handleSubmit}>
        <div className="sermon-form-row">
          <input
            type="url"
            value={url}
            onChange={(event) => setUrl(event.target.value)}
            placeholder="Paste a YouTube sermon URL"
            aria-label="YouTube URL"
            required
          />

          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Loading sermon..." : "Continue"}
          </button>
        </div>
      </form>

      {error ? (
        <p className="error-message" role="alert">
          {error}
        </p>
      ) : null}

      {message ? <p className="status-message">{message}</p> : null}

      {metadata ? (
        <section className="metadata-card">
          <div>
            <p className="eyebrow">Sermon ready</p>

            <h2>{metadata.title}</h2>

            <div className="metadata-details">
              <span>Speaker: {metadata.speaker}</span>

              <span>
                {metadata.duration} · Published {metadata.publishedAt}
              </span>
            </div>
          </div>

          {metadata.thumbnail ? (
            <Image
              src={metadata.thumbnail}
              alt={metadata.title}
              width={480}
              height={360}
            />
          ) : null}
        </section>
      ) : null}

      {transcript && !selectedMode && !sermonNote ? (
        <ModeSelector onSelect={handleModeSelect} isProcessing={isProcessing} />
      ) : null}

      {sermonNote ? <SermonNoteView sermonNote={sermonNote} /> : null}
    </>
  );
}