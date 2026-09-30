const CHUNK_SIZE = 15000;
const CHUNK_OVERLAP = 1000;

export type TranscriptChunk = {
  sectionNumber: number;
  totalSections: number;
  text: string;
};

export function chunkTranscript(
  transcript: string
): TranscriptChunk[] {
  const cleanedTranscript = transcript
    .replace(/\s+/g, " ")
    .trim();

  if (!cleanedTranscript) {
    return [];
  }

  const chunks: string[] = [];

  let start = 0;

  while (start < cleanedTranscript.length) {
    let end = start + CHUNK_SIZE;

    if (end >= cleanedTranscript.length) {
      chunks.push(
        cleanedTranscript.slice(start)
      );
      break;
    }

    const nearbyBreak =
      cleanedTranscript.lastIndexOf(" ", end);

    if (nearbyBreak > start) {
      end = nearbyBreak;
    }

    chunks.push(
      cleanedTranscript.slice(start, end).trim()
    );

    start = Math.max(
      end - CHUNK_OVERLAP,
      start + 1
    );
  }

  return chunks.map((text, index) => ({
    sectionNumber: index + 1,
    totalSections: chunks.length,
    text,
  }));
}