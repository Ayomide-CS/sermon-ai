export type SermonNote = {
  overview: string;
  mainPoints: string[];
  keyLessons: string[];
  keyQuotes: string[];
  practicalApplications: string[];
  prayerPoints: string[];
  reflectionQuestions: string[];
};

export type SermonMetadata = {
  videoId: string;
  title: string;
  description: string;
  speaker: string;
  thumbnail?: string;
  publishedAt: string;
  duration: string;
};