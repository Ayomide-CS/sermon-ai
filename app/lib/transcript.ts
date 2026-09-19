import {fetchTranscript,YoutubeTranscriptDisabledError,YoutubeTranscriptNotAvailableError,YoutubeTranscriptVideoUnavailableError,} from "youtube-transcript-plus";

export async function getYouTubeTranscript(videoId: string) {
  try {
    const transcript = await fetchTranscript(videoId);

    if (!transcript || transcript.length === 0) {
      return {
        status: "NOT_AVAILABLE" as const,
        data: null,
      };
    }

    const text = transcript
      .map((item) => item.text)
      .join(" ");

    if (!text.trim()) {
      return {
        status: "NOT_AVAILABLE" as const,
        data: null,
      };
    }

    return {
      status: "AVAILABLE" as const,
      data: {
        text: text.trim(),
        segments: transcript,
      },
    };
  } catch (error) {
    if (error instanceof YoutubeTranscriptDisabledError) {
      return {
        status: "DISABLED" as const,
        data: null,
      };
    }

    if (error instanceof YoutubeTranscriptNotAvailableError) {
      return {
        status: "NOT_AVAILABLE" as const,
        data: null,
      };
    }

    if (error instanceof YoutubeTranscriptVideoUnavailableError) {
      return {
        status: "VIDEO_UNAVAILABLE" as const,
        data: null,
      };
    }

    console.error("Transcript retrieval error:", error);

    return {
      status: "ERROR" as const,
      data: null,
    };
  }
}