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
    .split(/(?<=[.!?؟])\s+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);
}

function extractQuestions(sentences: string[]) {
  return sentences
    .filter((sentence) =>
      /[?؟]\s*$/.test(sentence)
    )
    .slice(0, 10);
}

function extractExplicitQuotes(sentences: string[]) {
  return sentences
    .filter((sentence) => {
      return (
        sentence.includes('"') ||
        sentence.includes("'") ||
        sentence.includes("“") ||
        sentence.includes("”") ||
        sentence.includes("‘") ||
        sentence.includes("’")
      );
    })
    .slice(0, 10);
}

function extractApplications(sentences: string[]) {
  const patterns = [
    /\byou need to\b/i,
    /\byou must\b/i,
    /\byou should\b/i,
    /\bwe need to\b/i,
    /\bwe must\b/i,
    /\bwe should\b/i,
    /\bmake sure\b/i,
    /\bbegin to\b/i,
    /\bstart\b/i,
    /\bstop\b/i,
    /\bpractice\b/i,
    /\bdevelop\b/i,
    /\bcommit\b/i,
    /\bchoose\b/i,
    /\bwalk in\b/i,
    /\blive out\b/i,
  ];

  return sentences
    .filter((sentence) =>
      patterns.some((pattern) => pattern.test(sentence))
    )
    .slice(0, 10);
}

function extractBibleReferences(transcript: string) {
  const biblePattern =
    /\b(?:Genesis|Exodus|Leviticus|Numbers|Deuteronomy|Joshua|Judges|Ruth|1 Samuel|2 Samuel|1 Kings|2 Kings|1 Chronicles|2 Chronicles|Ezra|Nehemiah|Esther|Job|Psalms?|Proverbs|Ecclesiastes|Song of Solomon|Isaiah|Jeremiah|Lamentations|Ezekiel|Daniel|Hosea|Joel|Amos|Obadiah|Jonah|Micah|Nahum|Habakkuk|Zephaniah|Haggai|Zechariah|Malachi|Matthew|Mark|Luke|John|Acts|Romans|1 Corinthians|2 Corinthians|Galatians|Ephesians|Philippians|Colossians|1 Thessalonians|2 Thessalonians|1 Timothy|2 Timothy|Titus|Philemon|Hebrews|James|1 Peter|2 Peter|1 John|2 John|3 John|Jude|Revelation)\s+\d+(?::\d+(?:-\d+)?)?/gi;

  return [
    ...new Set(
      transcript.match(biblePattern) ?? []
    ),
  ];
}

function extractStructuredPoints(sentences: string[]) {
  const patterns = [
    /\bfirst point\b/i,
    /\bsecond point\b/i,
    /\bthird point\b/i,
    /\bfirst thing\b/i,
    /\bsecond thing\b/i,
    /\bthird thing\b/i,
    /\bnumber one\b/i,
    /\bnumber two\b/i,
    /\bnumber three\b/i,
    /\bfirst\b/i,
    /\bsecond\b/i,
    /\bthird\b/i,
    /\bfourth\b/i,
    /\bfifth\b/i,
    /\bfinally\b/i,
  ];

  return sentences
    .filter((sentence) =>
      patterns.some((pattern) =>
        pattern.test(sentence)
      )
    )
    .slice(0, 10);
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

  const explicitQuotes =
    extractExplicitQuotes(sentences);

  const applications =
    extractApplications(sentences);

  const mainPoints =
    extractStructuredPoints(sentences);

  return {
    overview:
      sentences.slice(0, 3).join(" ") ||
      "No overview could be extracted from the transcript.",

    mainPoints,

    keyLessons: [],

    keyQuotes: explicitQuotes,

    bibleReferences,

    practicalApplications: applications,

    prayerPoints: [],

    reflectionQuestions: questions,
  };
}