//client component for the frontend
"use client";

import Image from "next/image";
import { useState } from "react";

export default function SermonForm() {
  const [url, setUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  
  const [metadata, setMetadata] = useState<{
  videoId: string;
  title: string;
  description: string;
  speaker: string;
  thumbnail?: string;
  publishedAt: string;
  duration: string;
} | null>(null);

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
        body: JSON.stringify({ youtubeUrl: trimmedUrl }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Something went wrong.");
      }

     setMetadata(result.metadata);
     setMessage("Sermon video found.");
     setUrl("");

      setUrl("");
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Something went wrong.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="text" value={url} onChange={(event) => setUrl(event.target.value)} placeholder="Paste YouTube URL" aria-label="YouTube URL"/>

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Submitting..." : "Submit"}
      </button>


      {metadata ? (
      <div>
      <h2>{metadata.title}</h2>

      <p>Speaker: {metadata.speaker}</p>

      <p>Video ID: {metadata.videoId}</p>

      <p>Duration: {metadata.duration}</p>

      <p>Published: {metadata.publishedAt}</p>

      <p>{metadata.description}</p>

      {metadata.thumbnail ? (
      <Image
        src={metadata.thumbnail}
        alt={metadata.title}
        width={480}
        height={360}
      />
    ) : null}
  </div>
) : null}

      {error ? <p role="alert">{error}</p> : null}
      {message ? <p>{message}</p> : null}
    </form>
  );
}