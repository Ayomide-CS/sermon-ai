import {
  YoutubeTranscript,
  YoutubeTranscriptDisabledError,
  YoutubeTranscriptNotAvailableError,
  YoutubeTranscriptVideoUnavailableError,
} from "youtube-transcript-plus";
import type { TranscriptResult } from "./transcript-types";

// Realistic browser User-Agent — prevents YouTube from blocking us as "automated queries"
const BROWSER_USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36";

// Shared instance with proper User-Agent and retries built-in
const ytTranscript = new YoutubeTranscript({
  lang: "en",
  userAgent: BROWSER_USER_AGENT,
});

// ---------------------------------------------------------------------------
// In-memory cache for YouTube transcripts (resets on server restart)
// TTL: 1 hour per videoId — prevents repeated requests to rate-limited IPs
// ---------------------------------------------------------------------------
interface CacheEntry {
  result: TranscriptResult;
  expiresAt: number;
}

const transcriptCache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

function getFromCache(videoId: string): TranscriptResult | null {
  const entry = transcriptCache.get(videoId);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    transcriptCache.delete(videoId);
    return null;
  }
  return entry.result;
}

function setInCache(videoId: string, result: TranscriptResult): void {
  transcriptCache.set(videoId, {
    result,
    expiresAt: Date.now() + CACHE_TTL_MS,
  });
}

// ---------------------------------------------------------------------------
// Main transcript fetcher — with cache + proper User-Agent
// ---------------------------------------------------------------------------
export async function getYouTubeTranscript(videoId: string): Promise<TranscriptResult> {
  // Check cache first
  const cached = getFromCache(videoId);
  if (cached) {
    console.log(`[transcript] Cache hit for video ${videoId}`);
    return cached;
  }

  try {
    const rawResult = await ytTranscript.fetchTranscript(videoId);

    // The library returns TranscriptSegment[] when videoDetails is false (our config)
    const transcript: any[] = Array.isArray(rawResult) ? rawResult : [];

    if (!transcript || transcript.length === 0) {
      const cacheEntry: TranscriptResult = { status: "NOT_AVAILABLE", data: null };
      setInCache(videoId, cacheEntry);
      return cacheEntry;
    }

    const text = transcript.map((item) => item.text).join(" ");

    if (!text.trim()) {
      const cacheEntry: TranscriptResult = { status: "NOT_AVAILABLE", data: null };
      setInCache(videoId, cacheEntry);
      return cacheEntry;
    }

    const cacheEntry: TranscriptResult = {
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

    setInCache(videoId, cacheEntry);
    return cacheEntry;
  } catch (error) {
    if (error instanceof YoutubeTranscriptDisabledError) {
      const result: TranscriptResult = { status: "DISABLED", data: null };
      setInCache(videoId, result);
      return result;
    }

    if (error instanceof YoutubeTranscriptNotAvailableError) {
      const result: TranscriptResult = { status: "NOT_AVAILABLE", data: null };
      setInCache(videoId, result);
      return result;
    }

    if (error instanceof YoutubeTranscriptVideoUnavailableError) {
      const result: TranscriptResult = { status: "VIDEO_UNAVAILABLE", data: null };
      setInCache(videoId, result);
      return result;
    }

    // Check if it's a rate-limit error — cache the error to prevent hammering
    const isRateLimit =
      error instanceof Error && /too many requests|rate limit/i.test(error.message);

    if (isRateLimit) {
      console.warn(`[transcript] YouTube rate-limited for video ${videoId}`);
      // Cache the error result briefly so we don't retry immediately on same video
      const result: TranscriptResult = { status: "ERROR", data: null };
      setInCache(videoId, result);
      return result;
    }

    console.error("Transcript retrieval error:", error);
    return { status: "ERROR", data: null };
  }
}