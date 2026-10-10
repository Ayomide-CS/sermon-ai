import { execFile } from "node:child_process";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { randomUUID } from "node:crypto";
import { existsSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import type { TranscriptResult } from "./transcript-types";

// ---------------------------------------------------------------------------
// Configuration — read from environment (set in .env)
// ---------------------------------------------------------------------------

const WHISPER_CLI = process.env.WHISPER_CLI_PATH;
const WHISPER_MODEL = process.env.WHISPER_MODEL_PATH;
const AUDIO_TMP_DIR = process.env.AUDIO_TMP_DIR || "tmp/audio";

/** Optional path to a Netscape-format cookies file (exported from browser) */
const YTDLP_COOKIES_FILE = process.env.YTDLP_COOKIES_FILE;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface WhisperOptions {
  /** Raw Netscape-format cookies string from browser export */
  cookies?: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Ensure the audio staging directory exists */
function ensureAudioDir(): void {
  if (!existsSync(AUDIO_TMP_DIR)) {
    mkdirSync(AUDIO_TMP_DIR, { recursive: true });
  }
}

/** Create a unique temp directory for one transcription job */
function createJobDir(): string {
  const id = randomUUID();
  const dir = join(AUDIO_TMP_DIR, id);
  ensureAudioDir();
  mkdirSync(dir, { recursive: true });
  return dir;
}

/** Clean up a job directory after we're done */
function cleanupJobDir(dir: string): void {
  if (existsSync(dir)) {
    rmSync(dir, { recursive: true, force: true });
  }
}

/** Write cookies to a temp file and return the path. Returns null on failure. */
function writeCookiesFile(cookies: string, dir: string): string | null {
  try {
    const cookiePath = join(dir, "cookies.txt");
    writeFileSync(cookiePath, cookies);
    return cookiePath;
  } catch {
    console.error("[whisper] Failed to write cookies file");
    return null;
  }
}

// ---------------------------------------------------------------------------
// Step 1 — Download audio from YouTube via yt-dlp
// ---------------------------------------------------------------------------

/** Build the yt-dlp argument array with optional cookies */
function buildYtDlpArgs(
  videoId: string,
  outputFile: string,
  cookies?: string
): string[] {
  const args: string[] = [
    "-f",
    "bestaudio",
    "--extract-audio",
    "--audio-format",
    "wav",
    "-o",
    outputFile,
    `https://www.youtube.com/watch?v=${videoId}`,
  ];

  // Priority: user-provided cookies > env cookie file > none
  if (cookies) {
    const cookiePath = writeCookiesFile(cookies, join(outputFile, ".."));
    if (cookiePath) args.unshift("--cookies", cookiePath);
  } else if (YTDLP_COOKIES_FILE) {
    args.unshift("--cookies", YTDLP_COOKIES_FILE);
  }

  return args;
}

export function downloadAudio(
  videoId: string,
  dir: string,
  cookies?: string
): Promise<string> {
  return new Promise((resolve, reject) => {
    const outputFile = join(dir, "audio.wav");
    const args = buildYtDlpArgs(videoId, outputFile, cookies);

    execFile("yt-dlp", args, { timeout: 300_000 }, (error, stdout, stderr) => {
      if (error) {
        cleanupJobDir(dir);
        reject(
          new Error(`yt-dlp failed: ${stderr || error.message}`)
        );
        return;
      }

      // Verify the file was actually created
      if (!existsSync(outputFile)) {
        cleanupJobDir(dir);
        reject(new Error("yt-dlp reported success but no audio file was written"));
        return;
      }

      resolve(outputFile);
    });
  });
}

// ---------------------------------------------------------------------------
// Step 2 — Transcribe with whisper.cpp CLI
// ---------------------------------------------------------------------------

export function transcribeWithWhisper(
  audioPath: string,
  dir: string
): Promise<TranscriptResult> {
  return new Promise((resolve) => {
    if (!WHISPER_CLI || !existsSync(WHISPER_CLI)) {
      resolve({ status: "ERROR", data: null } as TranscriptResult);
      cleanupJobDir(dir);
      return;
    }

    if (!WHISPER_MODEL || !existsSync(WHISPER_MODEL)) {
      resolve({ status: "ERROR", data: null } as TranscriptResult);
      cleanupJobDir(dir);
      return;
    }

    // whisper-cli flags (whisper.cpp v1.x+):
    //   -m          → model file
    //   -f          → audio input file
    //   --output-txt→ write plain text output
    //   --print-progress → show progress in terminal
    const args = [
      "-m",
      WHISPER_MODEL,
      "-f",
      audioPath,
      "--output-txt",
      "--print-progress",
    ];

    let stdoutBuf = "";
    let stderrBuf = "";

    const child = execFile(WHISPER_CLI, args, { timeout: 600_000 }, (error) => {
      // whisper-cli exits with 0 on success even if transcription is empty
      const text = stdoutBuf.trim();

      if (!text || text.length < 2) {
        resolve({ status: "NOT_AVAILABLE", data: null } as TranscriptResult);
      } else {
        resolve(
          { status: "AVAILABLE", data: { text } } as TranscriptResult
        );
      }

      cleanupJobDir(dir);
    });

    child.stdout?.on("data", (chunk: Buffer) => {
      stdoutBuf += chunk.toString();
    });

    child.stderr?.on("data", (chunk: Buffer) => {
      stderrBuf += chunk.toString();
    });

    // If the process hangs or crashes unexpectedly
    child.on("error", () => {
      resolve({ status: "ERROR", data: null });
      cleanupJobDir(dir);
    });

    // Hard timeout safety net
    setTimeout(() => {
      if (!child.killed) {
        child.kill("SIGTERM");
        resolve({ status: "ERROR", data: null });
        cleanupJobDir(dir);
      }
    }, 600_000); // 10 minutes max
  });
}

// ---------------------------------------------------------------------------
// Public API — download + transcribe in one call
// ---------------------------------------------------------------------------

/**
 * Transcribe a YouTube video using local whisper.cpp.
 * Downloads audio via yt-dlp, then runs whisper-cli on it.
 *
 * @param videoId - YouTube video ID
 * @param options - Optional cookies string (Netscape format) to bypass bot detection
 */
export async function getWhisperTranscript(
  videoId: string,
  options?: WhisperOptions
): Promise<TranscriptResult> {
  // Validate prerequisites
  if (!WHISPER_CLI || !existsSync(WHISPER_CLI)) {
    console.error("[whisper] CLI not found at:", WHISPER_CLI);
    return { status: "ERROR", data: null } as TranscriptResult;
  }

  if (!WHISPER_MODEL || !existsSync(WHISPER_MODEL)) {
    console.error("[whisper] Model not found at:", WHISPER_MODEL);
    return { status: "ERROR", data: null } as TranscriptResult;
  }

  const dir = createJobDir();

  try {
    // Download audio (with optional cookies)
    const audioPath = await downloadAudio(videoId, dir, options?.cookies);

    // Transcribe
    const result = await transcribeWithWhisper(audioPath, dir);

    return result;
  } catch (err) {
    console.error("[whisper] Unexpected error:", err);
    cleanupJobDir(dir);
    return { status: "ERROR", data: null } as TranscriptResult;
  }
}
