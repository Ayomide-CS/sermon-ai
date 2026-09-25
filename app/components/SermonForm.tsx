"use client";

import Image from "next/image";
import { useState } from "react";
import ModeSelector from "./ModeSelector";
import SermonNoteView from "./SermonNote/SermonNoteView";
import type { SermonMetadata, SermonNote } from "@/app/types/sermon";

const buildStructuredNote = (transcript: string): SermonNote => {
  const cleanedTranscript = transcript.replace(/\s+/g, " ").trim();
  const sentences = cleanedTranscript
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);

  const overview =
    sentences.slice(0, 2).join(" ").slice(0, 500) ||
    "The sermon centered on biblical truth, practical obedience, and spiritual growth.";

  return {
    overview,
    mainPoints: sentences.slice(0, 3).map((sentence, index) => `${index + 1}. ${sentence}`),
    keyLessons: sentences.slice(3, 6).map((sentence) => sentence.trim()),
    keyQuotes: sentences.slice(0, 3).map((sentence) => sentence.trim()),
    practicalApplications: [
      "Reflect on how the sermon applies to your daily life.",
      "Write down one concrete action you can take this week.",
      "Pray for wisdom to live out the teaching faithfully.",
    ],
    prayerPoints: [
      "Ask God to deepen your understanding of His Word.",
      "Pray for obedience to the sermon’s application.",
      "Ask for courage to live out the truth faithfully.",
    ],
    reflectionQuestions: [
      "What stood out most to me from this sermon?",
      "Which truth challenged or encouraged me most?",
      "How will I respond in prayer and obedience this week?",
    ],
  };
};

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

  const handleModeSelect = (mode: "structured" | "ai") => {
    if (!transcript || !metadata) {
      setError("Transcript is not available.");
      return;
    }

    setSelectedMode(mode);
    setIsProcessing(true);
    setError("");
    setMessage(
      mode === "structured"
        ? "Generating structured notes from the transcript..."
        : "Generating AI-inspired sermon notes..."
    );

    const note = buildStructuredNote(transcript);
    setSermonNote(note);
    setIsProcessing(false);
    setMessage(
      mode === "structured"
        ? "Structured notes are ready."
        : "AI-inspired notes are ready."
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
            {isSubmitting ? "Analyzing..." : "Create notes"}
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
            <p className="eyebrow">Sermon analyzed</p>

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