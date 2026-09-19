import { fetchTranscript } from "youtube-transcript";

export async function getYouTubeTranscript(videoId: string) {
  try {
    const transcript = await fetchTranscript(videoId);

    if (!transcript || transcript.length === 0) {
      return null;
    }

    const text = transcript
      .map((item) => item.text)
      .join(" ");

    if (!text.trim()) {
      return null;
    }

    return {
      text: text.trim(),
      segments: transcript,
    };
  } catch (error) {
    console.error("Transcript retrieval error:", error);

    return null;
  }
}