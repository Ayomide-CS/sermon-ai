import {fetchTranscript,YoutubeTranscriptDisabledError,YoutubeTranscriptNotAvailableError,YoutubeTranscriptVideoUnavailableError,} from "youtube-transcript-plus";
import type { TranscriptResult } from "./transcript-types";

export async function getYouTubeTranscript(videoId: string): Promise<TranscriptResult> {
  try {
    const transcript = await fetchTranscript(videoId);

    if (!transcript || transcript.length === 0) {
      return {
        status: "NOT_AVAILABLE",
        data: null,
      };
    }

    const text = transcript
      .map((item) => item.text)
      .join(" ");

    if (!text.trim()) {
      return {
        status: "NOT_AVAILABLE",
        data: null,
      };
    }

    return {
      status: "AVAILABLE",
      data: {
        text: text.trim(),
        segments: transcript.map((s) => ({
          text: s.text,
          start: s.offset,
          duration: s.duration,
        })),
      },
    };
  } catch (error) {
    if (error instanceof YoutubeTranscriptDisabledError) {
      return { status: "DISABLED", data: null };
    }

    if (error instanceof YoutubeTranscriptNotAvailableError) {
      return { status: "NOT_AVAILABLE", data: null };
    }

    if (error instanceof YoutubeTranscriptVideoUnavailableError) {
      return { status: "VIDEO_UNAVAILABLE", data: null };
    }

    console.error("Transcript retrieval error:", error);

    return { status: "ERROR", data: null };
  }
}