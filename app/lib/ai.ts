import type { SermonNote } from "@/app/types/sermon";

// ---------------------------------------------------------------------------
// AI-powered sermon note generation (optional — requires external API key)
//
// This module is a placeholder for future AI integration. It can be extended
// to support Gemini, OpenAI, or any other LLM provider when the user
// provides their own API key through the UI.
//
// Currently unused — the app uses deterministic analysis (structured.ts).
// ---------------------------------------------------------------------------

/**
 * Placeholder function for AI-powered sermon note generation.
 * To implement: integrate with your preferred LLM provider (Gemini, OpenAI, etc.)
 * and pass the user's API key from the UI settings.
 */
export async function generateSermonNoteWithAI(
  transcript: string,
  metadata: { title: string; speaker: string; description?: string },
  _apiKey: string,
  _provider: "gemini" | "openai" = "gemini"
): Promise<SermonNote> {
  // TODO: Implement actual AI integration here.
  // For now, fall back to the deterministic engine.
  throw new Error(
    "AI-powered sermon note generation is not yet implemented. " +
    "The app uses deterministic analysis by default."
  );
}
