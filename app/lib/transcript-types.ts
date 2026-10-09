// Shared types for transcript results used across whisper and youtube modules

export interface TranscriptSegment {
  text: string;
  start?: number;
  duration?: number;
}

export interface TranscriptData {
  text: string;
  segments?: TranscriptSegment[];
}

export type TranscriptStatus =
  | "AVAILABLE"
  | "NOT_AVAILABLE"
  | "DISABLED"
  | "VIDEO_UNAVAILABLE"
  | "ERROR";

export interface TranscriptResult {
  status: TranscriptStatus;
  data: TranscriptData | null;
}
