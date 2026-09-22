"use client";

import Image from "next/image";
import { useState } from "react";
import SermonNoteView from "./SermonNote/SermonNoteView";
import type {SermonMetadata, SermonNote,} from "@/app/types/sermon";

export default function SermonForm() {
  const [url, setUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [sermonNote, setSermonNote] =
    useState<SermonNote | null>(null);

  const [metadata, setMetadata] =
    useState<SermonMetadata | null>(null);

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

      console.log("Sermon AI result:", result);

      if (!response.ok) {
        throw new Error(
          result.error || "Something went wrong."
        );
      }

      setSermonNote(result.sermonNote);
      setMetadata(result.metadata);

      setMessage(
        result.message ||
          "Sermon analyzed successfully."
      );

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
      {/* Sermon URL form */}
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
              ? "Analyzing..."
              : "Create notes"}
          </button>
        </div>
      </form>

      {/* Error message */}
      {error ? (
        <p
          className="error-message"
          role="alert"
        >
          {error}
        </p>
      ) : null}

      {/* Success message */}
      {message ? (
        <p className="status-message">
          {message}
        </p>
      ) : null}

      {/* Sermon metadata */}
      {metadata ? (
        <section className="metadata-card">
          <div>
            <p className="eyebrow">
              Sermon analyzed
            </p>

            <h2>{metadata.title}</h2>

            <div className="metadata-details">
              <span>
                Speaker: {metadata.speaker}
              </span>

              <span>
                {metadata.duration} · Published{" "}
                {metadata.publishedAt}
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

      {/* Generated sermon notes */}
      {sermonNote ? (
        <SermonNoteView sermonNote={sermonNote}/>
      ) : null}
    </>
  );
}