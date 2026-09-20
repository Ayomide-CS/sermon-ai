import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export type SermonNote = {
  overview: string;
  mainPoints: string[];
  keyLessons: string[];
  keyQuotes: string[];
  practicalApplications: string[];
  prayerPoints: string[];
  reflectionQuestions: string[];
};

type SermonMetadata = {
  title: string;
  description: string;
  speaker: string;
  publishedAt: string;
};

export async function generateSermonNote(
  transcript: string,
  metadata: SermonMetadata
): Promise<SermonNote> {
  const response = await openai.responses.create({
    model: "gpt-5.6-luna",

    instructions: `
You are Sermon AI, an assistant that transforms sermon transcripts
into structured personal Bible study notes.

Your most important rule is:

ONLY use information supported by the supplied sermon transcript
and metadata.

Do not invent:
- teachings
- Bible references
- quotations
- stories
- claims made by the preacher
- applications presented as if they came from the preacher

If something is not clearly supported by the transcript, leave it out.

Preserve the meaning and theological context of the preacher's teaching.

For key quotes, only include statements that actually appear in the transcript.
Do not create quotations yourself.

Return a structured sermon note.
`,

    input: `
SERMON METADATA

Title:
${metadata.title}

Speaker:
${metadata.speaker}

Published:
${metadata.publishedAt}

Description:
${metadata.description}


SERMON TRANSCRIPT

${transcript}
`,

    text: {
      format: {
        type: "json_schema",
        name: "sermon_note",
        strict: true,
        schema: {
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
            "practicalApplications",
            "prayerPoints",
            "reflectionQuestions",
          ],
          additionalProperties: false,
        },
      },
    },
  });

  if (!response.output_text) {
    throw new Error("AI returned an empty response.");
  }

  return JSON.parse(response.output_text) as SermonNote;
}