// Deterministic YouTube metadata extraction — no API key required
// Uses youtube-transcript-plus to fetch data directly from the video page

import { YoutubeTranscript } from "youtube-transcript-plus";

export const getYouTubeVideoId = (urlString: string) => {
  try {
    const url = new URL(urlString);

    if (
      url.hostname !== "www.youtube.com" &&
      url.hostname !== "youtube.com" &&
      url.hostname !== "youtu.be"
    ) {
      return null;
    }

    if (url.hostname === "youtu.be") {
      const videoId = url.pathname.slice(1);
      return videoId || null;
    }

    const videoId = url.searchParams.get("v");

    return videoId || null;
  } catch {
    return null;
  }
};

export async function getYouTubeVideoMetadata(videoId: string) {
  try {
    // Fetch video info directly from YouTube — no API key needed
    const response = await fetch(
      `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`
    );

    if (!response.ok) {
      return null;
    }

    const data = await response.json();

    // Extract duration from transcript library (ISO 8601 format)
    let duration = "Unknown";
    try {
      const videoInfo = await fetch(
        `https://www.youtube.com/watch?v=${videoId}`
      );
      const html = await videoInfo.text();
      // Extract duration from YouTube page
      const match = html.match(/"lengthSeconds":"(\d+)"/);
      if (match) {
        const seconds = parseInt(match[1], 10);
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        if (hours > 0) {
          duration = `${hours}:${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
        } else {
          duration = `${minutes}:${String(secs).padStart(2, "0")}`;
        }
      }
    } catch {
      // Duration extraction is best-effort
    }

    return {
      videoId,
      title: data.title || "Unknown Title",
      description: data.author_name || "",
      speaker: data.author_name || "Unknown Speaker",
      thumbnail: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
      publishedAt: "",
      duration,
    };
  } catch {
    return null;
  }
}