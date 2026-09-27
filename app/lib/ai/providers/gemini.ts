import { GoogleGenAI } from "@google/genai";

import type {
  SermonMetadata,
  SermonNote,
} from "@/app/types/sermon";

import type { SermonAIProvider } from "../provider";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const sermonNoteSchema = {
  type: "object",
  properties: {
    overview: {
      type: "string",
    },

    mainPoints: {
      type: "array",
      items: {
        type: "string",
      },
    },

    keyLessons: {
      type: "array",
      items: {
        type: "string",
      },
    },

    keyQuotes: {
      type: "array",
      items: {
        type: "string",
      },
    },

    bibleReferences: {
      type: "array",
      items: {
        type: "string",
      },
    },

    practicalApplications: {
      type: "array",
      items: {
        type: "string",
      },
    },

    prayerPoints: {
      type: "array",
      items: {
        type: "string",
      },
    },

    reflectionQuestions: {
      type: "array",
      items: {
        type: "string",
      },
    },
  },

  required: [
    "overview",
    "mainPoints",
    "keyLessons",
    "keyQuotes",
    "bibleReferences",
    "practicalApplications",
    "prayerPoints",
    "reflectionQuestions",
  ],
};

export class GeminiSermonProvider
  implements SermonAIProvider
{
  async generateSermonNotes(
    transcript: string,
    metadata: SermonMetadata
  ): Promise<SermonNote> {
    const prompt = `
You are the sermon analysis engine for SermonAI.

Your task is to transform the supplied sermon transcript into
a detailed and well-organized sermon study note.

IMPORTANT SOURCE RULE:

The transcript is the primary source of truth.

Do not use outside knowledge to add teachings, claims,
Bible references, quotes, stories, or statements that are
not supported by the transcript.

The sermon metadata may provide context, but the transcript
must remain the primary source.

IMPORTANT CLASSIFICATION RULE:

A sentence must be placed in the category where it actually
belongs based on the surrounding sermon context.

Do not classify something as a prayer point merely because
it contains the word "pray".

Do not classify something as a key quote merely because it
is short or sounds interesting.

Do not classify something as a practical application unless
the preacher actually presents it as an application,
instruction, response, or action.

Do not classify a teaching as a prayer point.

Do not classify a prayer point as a key quote.

Understand the surrounding context before categorizing
each item.

If a category does not have enough evidence in the transcript,
return an empty array rather than inventing content.

KEY QUOTES:

Only include genuine notable statements from the preacher
that are actually present in the transcript.

Do not create new quotations.

BIBLE REFERENCES:

Only include Bible references that are explicitly mentioned
or clearly identifiable in the transcript.

Do not invent Bible references.

PRAYER POINTS:

Only include prayer points or prayer requests that are
actually expressed in the sermon.

Do not create generic prayers.

PRACTICAL APPLICATIONS:

Only include applications that are actually communicated
or clearly instructed by the preacher.

REFLECTION QUESTIONS:

These may be generated from the sermon content, but they
must remain faithful to the actual teaching and must not
introduce outside doctrine.

OVERVIEW:

Provide a concise but faithful summary of the overall sermon.

MAIN POINTS:

Identify the actual major teaching points and progression
of the sermon. Do not simply select the first sentences.

KEY LESSONS:

Identify the important truths or lessons communicated
throughout the sermon.

SERMON METADATA:

Title: ${metadata.title}

Speaker: ${metadata.speaker}

Published: ${metadata.publishedAt}

DESCRIPTION:

${metadata.description}

TRANSCRIPT:

${transcript}
`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",

      contents: prompt,

      config: {
        responseMimeType: "application/json",
        responseSchema: sermonNoteSchema,
      },
    });

    if (!response.text) {
      throw new Error(
        "Gemini returned an empty response."
      );
    }

    try {
      return JSON.parse(response.text) as SermonNote;
    } catch {
      throw new Error(
        "Gemini returned an invalid sermon note."
      );
    }
  }
}