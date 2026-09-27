import type {
  SermonMetadata,
  SermonNote,
} from "@/app/types/sermon";

import { GeminiSermonProvider } from "./providers/gemini";

const geminiProvider =
  new GeminiSermonProvider();

export async function generateSermonNotes(
  transcript: string,
  metadata: SermonMetadata
): Promise<SermonNote> {
  return geminiProvider.generateSermonNotes(
    transcript,
    metadata
  );
}