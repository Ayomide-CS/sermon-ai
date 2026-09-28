export type SermonMetadata = {
  videoId: string;
  title: string;
  description: string;
  speaker: string;
  thumbnail?: string;
  publishedAt: string;
  duration: string;
};

export type SermonNote = {
  overview: string;
  mainPoints: string[];
  keyLessons: string[];
  keyQuotes: string[];
  bibleReferences: string[];
  practicalApplications: string[];
  prayerPoints: string[];
  reflectionQuestions: string[];
};

export type SermonSectionAnalysis = {
  sectionNumber: number;
  summary: string;
  themes: string[];
  mainPoints: string[];
  keyLessons: string[];
  keyQuotes: string[];
  bibleReferences: string[];
  practicalApplications: string[];
  prayerPoints: string[];
  reflectionQuestions: string[];
};