"use client";

import Image from "next/image";
import { useState } from "react";
import SermonNoteView from "./SermonNote/SermonNoteView"

import type {SermonMetadata, SermonNote,} from "@/app/types/sermon";

export default function SermonForm() {
  const [url, setUrl] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [error, setError] = useState("");

  const [message, setMessage] = useState("");

  const [sermonNote, setSermonNote] = useState<SermonNote | null>(null);

  const [metadata, setMetadata] = useState<SermonMetadata | null>(null);

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
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={url}
          onChange={(event) =>
            setUrl(event.target.value)
          }
          placeholder="Paste YouTube URL"
          aria-label="YouTube URL"
        />

        <button
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting
            ? "Submitting..."
            : "Submit"}
        </button>
      </form>

      {error ? (
        <p role="alert">{error}</p>
      ) : null}

      {message ? <p>{message}</p> : null}

      {metadata ? (
        <section>
          <h2>{metadata.title}</h2>

          <p>
            Speaker: {metadata.speaker}
          </p>

          <p>
            Video ID: {metadata.videoId}
          </p>

          <p>
            Duration: {metadata.duration}
          </p>

          <p>
            Published: {metadata.publishedAt}
          </p>

          <p>
            {metadata.description}
          </p>

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

      {sermonNote && (
        <SermonNoteView sermonNote = {sermonNote} />
      )}
    </>
  );
}