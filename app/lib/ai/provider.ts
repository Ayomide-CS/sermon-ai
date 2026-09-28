import type {
  SermonMetadata,
  SermonNote,
  SermonSectionAnalysis,
} from "@/app/types/sermon";

export interface SermonAIProvider {
  analyzeSection(
    transcript: string,
    metadata: SermonMetadata,
    sectionNumber: number,
    totalSections: number
  ): Promise<SermonSectionAnalysis>;

  synthesizeSermon(
    sections: SermonSectionAnalysis[],
    metadata: SermonMetadata
  ): Promise<SermonNote>;
}