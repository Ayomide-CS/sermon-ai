import { execFile } from "node:child_process";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { randomUUID } from "node:crypto";
import { existsSync, mkdirSync, rmSync } from "node:fs";
import type { TranscriptResult } from "./transcript-types";

// ---------------------------------------------------------------------------
// Configuration — read from environment (set in .env)
// ---------------------------------------------------------------------------

const WHISPER_CLI = process.env.WHISPER_CLI_PATH;
const WHISPER_MODEL = process.env.WHISPER_MODEL_PATH;
const AUDIO_TMP_DIR = process.env.AUDIO_TMP_DIR || "tmp/audio";

// ---------------------------------------------------------------------------
// Types — re-export shared type for convenience
// ---------------------------------------------------------------------------

export type WhisperTranscriptResult = TranscriptResult;

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

// ---------------------------------------------------------------------------
// Step 1 — Download audio from YouTube via yt-dlp
// ---------------------------------------------------------------------------

export function downloadAudio(videoId: string, dir: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const outputFile = join(dir, "audio.wav");

    // yt-dlp flags:
    //   -f bestaudio          → pick the best audio-only stream
    //   --extract-audio       → extract audio (in case a video container is chosen)
    //   --audio-format wav    → output as WAV (whisper-cli prefers uncompressed)
    //   -o                    → output path template
    const args = [
      "-f",
      "bestaudio",
      "--extract-audio",
      "--audio-format",
      "wav",
      "-o",
      outputFile,
      `https://www.youtube.com/watch?v=${videoId}`,
    ];

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
 */
export async function getWhisperTranscript(
  videoId: string
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
    // Download audio
    const audioPath = await downloadAudio(videoId, dir);

    // Transcribe
    const result = await transcribeWithWhisper(audioPath, dir);

    return result;
  } catch (err) {
    console.error("[whisper] Unexpected error:", err);
    cleanupJobDir(dir);
    return { status: "ERROR", data: null } as TranscriptResult;
  }
}
