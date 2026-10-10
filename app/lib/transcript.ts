import { fetchTranscript, YoutubeTranscriptDisabledError, YoutubeTranscriptNotAvailableError, YoutubeTranscriptVideoUnavailableError } from "youtube-transcript-plus";
import type { TranscriptResult } from "./transcript-types";

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
// Retry helper — exponential backoff for rate-limited requests
// ---------------------------------------------------------------------------
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 5,
  baseDelayMs: number = 5000,
): Promise<T> {
  let lastError: unknown;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      // Check if this is a rate-limit / too-many-requests error
      const isRateLimit =
        error instanceof Error &&
        /too many requests|rate limit|429|ECONNRESET/i.test(error.message);

      if (!isRateLimit || attempt === maxRetries) {
        // Not a rate-limit error, or we've exhausted retries — rethrow
        throw error;
      }

      const delay = baseDelayMs * Math.pow(2, attempt);
      console.warn(
        `[transcript] Rate-limited. Retrying in ${delay / 1000}s (attempt ${attempt + 1}/${maxRetries})`
      );
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}

// ---------------------------------------------------------------------------
// Main transcript fetcher — with cache + retry
// ---------------------------------------------------------------------------
export async function getYouTubeTranscript(videoId: string): Promise<TranscriptResult> {
  // Check cache first
  const cached = getFromCache(videoId);
  if (cached) {
    console.log(`[transcript] Cache hit for video ${videoId}`);
    return cached;
  }

  try {
    const transcript = await retryWithBackoff(() => fetchTranscript(videoId));

    if (!transcript || transcript.length === 0) {
      const result: TranscriptResult = { status: "NOT_AVAILABLE", data: null };
      setInCache(videoId, result);
      return result;
    }

    const text = transcript.map((item) => item.text).join(" ");

    if (!text.trim()) {
      const result: TranscriptResult = { status: "NOT_AVAILABLE", data: null };
      setInCache(videoId, result);
      return result;
    }

    const result: TranscriptResult = {
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

    setInCache(videoId, result);
    return result;
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