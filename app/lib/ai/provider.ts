import type {
  SermonMetadata,
  SermonNote,
} from "@/app/types/sermon";

export interface SermonAIProvider {
  generateSermonNotes(
    transcript: string,
    metadata: SermonMetadata
  ): Promise<SermonNote>;
}