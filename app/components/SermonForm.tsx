"use client";

import Image from "next/image";
import { useState } from "react";

import SermonNoteView from "./SermonNote/SermonNoteView";

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

  const [sermonNote, setSermonNote] =
    useState<SermonNote | null>(null);

  const [metadata, setMetadata] =
    useState<SermonMetadata | null>(null);

  const [transcript, setTranscript] =
    useState<string | null>(null);

  /*
   * Single deterministic pipeline:
   *
   * YouTube URL
   *     ↓
   * /api/sermons (fetches metadata + transcript)
   *     ↓
   * buildStructuredNote (regex-based, no AI)
   *     ↓
   * Display sermon notes
   */
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

    // Reset previous sermon result
    setMetadata(null);
    setTranscript(null);
    setSermonNote(null);

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
        throw new Error(
          result.error || "Something went wrong."
        );
      }

      setMetadata(result.metadata);
      setTranscript(result.transcript.text);

      // Generate structured notes deterministically (no AI call)
      setMessage("Generating sermon notes...");

      const note = buildStructuredNote(
        result.transcript.text
      );

      setSermonNote(note);
      setMessage("Sermon notes are ready.");

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
      {/* =========================================
          STEP 1 — YOUTUBE URL
      ========================================== */}

      <form
        className="sermon-form"
        onSubmit={handleSubmit}
      >
        <div className="sermon-form-row">
          <input
            type="url"
            value={url}
            onChange={(event) =>
              setUrl(event.target.value)
            }
            placeholder="Paste a YouTube sermon URL"
            aria-label="YouTube URL"
            required
          />

          <button
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting
              ? "Loading sermon..."
              : "Continue"}
          </button>
        </div>
      </form>

      {/* =========================================
          ERROR
      ========================================== */}

      {error ? (
        <p
          className="error-message"
          role="alert"
        >
          {error}
        </p>
      ) : null}

      {/* =========================================
          STATUS
      ========================================== */}

      {message ? (
        <p className="status-message">
          {message}
        </p>
      ) : null}

      {/* =========================================
          STEP 2 — SERMON METADATA
      ========================================== */}

      {metadata ? (
        <section className="metadata-card">
          <div>
            <p className="eyebrow">
              Sermon ready
            </p>

            <h2>{metadata.title}</h2>

            <div className="metadata-details">
              <span>
                Speaker: {metadata.speaker}
              </span>

              <span>
                {metadata.duration || "Unknown duration"}
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

      {/* =========================================
          STEP 3 — SERMON NOTES (Deterministic)
      ========================================== */}

      {sermonNote ? (
        <SermonNoteView
          sermonNote={sermonNote}
        />
      ) : null}
    </>
  );
}
