import type { SermonNote } from "@/app/types/sermon";

function normalizeTranscript(transcript: string) {
  return transcript
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

function splitIntoSentences(transcript: string) {
  return transcript
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);
}

function extractBibleReferences(transcript: string) {
  const biblePattern =
    /\b(?:Genesis|Exodus|Leviticus|Numbers|Deuteronomy|Joshua|Judges|Ruth|1 Samuel|2 Samuel|1 Kings|2 Kings|1 Chronicles|2 Chronicles|Ezra|Nehemiah|Esther|Job|Psalms?|Proverbs|Ecclesiastes|Song of Solomon|Isaiah|Jeremiah|Lamentations|Ezekiel|Daniel|Hosea|Joel|Amos|Obadiah|Jonah|Micah|Nahum|Habakkuk|Zephaniah|Haggai|Zechariah|Malachi|Matthew|Mark|Luke|John|Acts|Romans|1 Corinthians|2 Corinthians|Galatians|Ephesians|Philippians|Colossians|1 Thessalonians|2 Thessalonians|1 Timothy|2 Timothy|Titus|Philemon|Hebrews|James|1 Peter|2 Peter|1 John|2 John|3 John|Jude|Revelation)\s+\d+(?::\d+(?:-\d+)?)?/gi;

  return [...new Set(transcript.match(biblePattern) ?? [])];
}

function extractQuestions(sentences: string[]) {
  return sentences
    .filter((sentence) => sentence.endsWith("?"))
    .slice(0, 10);
}

function extractQuotes(sentences: string[]) {
  return sentences
    .filter((sentence) => {
      const words = sentence.split(/\s+/);

      return (
        words.length >= 8 &&
        words.length <= 40
      );
    })
    .slice(0, 8);
}

function extractPotentialApplications(sentences: string[]) {
  const applicationPatterns = [
    /\byou need to\b/i,
    /\byou must\b/i,
    /\byou should\b/i,
    /\byou have to\b/i,
    /\bwe need to\b/i,
    /\bwe must\b/i,
    /\bwe should\b/i,
    /\bwe have to\b/i,
    /\bmake sure\b/i,
    /\bbegin to\b/i,
    /\bstop\b/i,
    /\bstart\b/i,
    /\bpractice\b/i,
    /\bdevelop\b/i,
    /\bcommit yourself\b/i,
    /\bchoose to\b/i,
    /\blearn to\b/i,
    /\bwalk in\b/i,
    /\blive out\b/i,
  ];

  return sentences
    .filter((sentence) =>
      applicationPatterns.some((pattern) =>
        pattern.test(sentence)
      )
    )
    .slice(0, 10);
}

function extractMainPoints(sentences: string[]) {
  const structuralPatterns = [
    /\bfirst\b/i,
    /\bsecond\b/i,
    /\bthird\b/i,
    /\bfourth\b/i,
    /\bfifth\b/i,
    /\bnumber one\b/i,
    /\bnumber two\b/i,
    /\bnumber three\b/i,
    /\bnumber four\b/i,
    /\bnumber five\b/i,
    /\bfirst thing\b/i,
    /\bsecond thing\b/i,
    /\bthird thing\b/i,
    /\bfirst point\b/i,
    /\bsecond point\b/i,
    /\bthird point\b/i,
    /\banother thing\b/i,
    /\bfinally\b/i,
    /\bthe next\b/i,
  ];

  const structuredPoints = sentences
    .filter((sentence) =>
      structuralPatterns.some((pattern) =>
        pattern.test(sentence)
      )
    )
    .slice(0, 10);

  if (structuredPoints.length > 0) {
    return structuredPoints;
  }

  return [];
}

function extractKeyLessons(sentences: string[]) {
  const lessonPatterns = [
    /\bwe learn\b/i,
    /\bthis teaches us\b/i,
    /\bthe lesson\b/i,
    /\bwhat this means\b/i,
    /\bthis means\b/i,
    /\bwe see that\b/i,
    /\bwe understand\b/i,
    /\bthe point is\b/i,
    /\bthe truth is\b/i,
    /\bwe must\b/i,
    /\bwe need to\b/i,
    /\bwe should\b/i,
    /\byou must\b/i,
    /\byou need to\b/i,
  ];

  return sentences
    .filter((sentence) =>
      lessonPatterns.some((pattern) =>
        pattern.test(sentence)
      )
    )
    .slice(0, 10);
}

function extractPrayerPoints(sentences: string[]) {
  const prayerPatterns = [
    /\bpray\b/i,
    /\bprayer\b/i,
    /\blet us pray\b/i,
    /\blet's pray\b/i,
    /\bask God\b/i,
    /\bask the Lord\b/i,
    /\bFather\b/i,
    /\bLord,?\s/i,
  ];

  return sentences
    .filter((sentence) =>
      prayerPatterns.some((pattern) =>
        pattern.test(sentence)
      )
    )
    .slice(0, 8);
}

export function buildStructuredNote(
  transcript: string
): SermonNote {
  const cleanedTranscript =
    normalizeTranscript(transcript);

  const sentences =
    splitIntoSentences(cleanedTranscript);

  const bibleReferences =
    extractBibleReferences(cleanedTranscript);

  const questions =
    extractQuestions(sentences);

  const quotes =
    extractQuotes(sentences);

  const applications =
    extractPotentialApplications(sentences);

    const mainPoints =
    extractMainPoints(sentences);

  const keyLessons =
    extractKeyLessons(sentences);
     
  const prayerPoints = extractPrayerPoints(sentences);
    
  const overview =
    sentences
      .slice(0, 3)
      .join(" ")
      .slice(0, 600) ||
    "No structured overview could be extracted from the transcript.";

   

  return {
    overview,

    mainPoints: extractMainPoints(sentences),

    keyLessons: extractKeyLessons(sentences),

    keyQuotes: quotes,

    bibleReferences: bibleReferences,

    practicalApplications: applications,

    prayerPoints,

    reflectionQuestions: questions,
  };
}