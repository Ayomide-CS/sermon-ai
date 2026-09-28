import type {
  SermonMetadata,
  SermonNote,
} from "@/app/types/sermon";

import { chunkTranscript } from "./chunker";

import { GeminiSermonProvider } from "./providers/gemini";

const geminiProvider =
  new GeminiSermonProvider();

export async function generateSermonNotes(
  transcript: string,
  metadata: SermonMetadata
): Promise<SermonNote> {
  const chunks =
    chunkTranscript(transcript);

  if (chunks.length === 0) {
    throw new Error(
      "Transcript is empty."
    );
  }

  console.log(
    `Processing ${chunks.length} sermon sections.`
  );

  const sectionAnalyses = [];

  for (const chunk of chunks) {
    console.log(
      `Analyzing section ${chunk.sectionNumber}/${chunk.totalSections}...`
    );

    const analysis =
      await geminiProvider.analyzeSection(
        chunk.text,
        metadata,
        chunk.sectionNumber,
        chunk.totalSections
      );

    sectionAnalyses.push(analysis);
  }

  console.log(
    "All sections analyzed. Starting final synthesis..."
  );

  return geminiProvider.synthesizeSermon(
    sectionAnalyses,
    metadata
  );
}