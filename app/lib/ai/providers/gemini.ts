import { GoogleGenAI } from "@google/genai";

import type {
  SermonMetadata,
  SermonNote,
  SermonSectionAnalysis,
} from "@/app/types/sermon";

import type { SermonAIProvider } from "../provider";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  throw new Error("GEMINI_API_KEY is missing.");
}

const ai = new GoogleGenAI({
  apiKey,
});

// ==================================================
// RETRY HELPER
// ==================================================

async function generateWithRetry(
  request: () => Promise<any>,
  maxRetries = 3
) {
  let delay = 2000;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await request();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : String(error);

      const cause =
        error instanceof Error && error.cause
          ? String(error.cause)
          : "";

      const errorText =
        `${message} ${cause}`.toLowerCase();

      // ============================================
      // DO NOT RETRY QUOTA EXHAUSTION
      // ============================================

      if (
        errorText.includes("429") ||
        errorText.includes("resource_exhausted") ||
        errorText.includes("quota exceeded") ||
        errorText.includes("free_tier_requests")
      ) {
        throw error;
      }

      // ============================================
      // RETRY TEMPORARY SERVICE / NETWORK ERRORS
      // ============================================

      const isRetryable =
        errorText.includes("503") ||
        errorText.includes("unavailable") ||
        errorText.includes("high demand") ||
        errorText.includes("fetch failed") ||
        errorText.includes("connect timeout") ||
        errorText.includes("connect_timeout") ||
        errorText.includes("und_err_connect_timeout");

      if (!isRetryable || attempt === maxRetries) {
        throw error;
      }

      console.log(
        `Gemini request failed temporarily. ` +
        `Retrying in ${delay / 1000}s...`
      );

      await new Promise((resolve) =>
        setTimeout(resolve, delay)
      );

      delay *= 2;
    }
  }

  throw new Error(
    "Gemini request failed after multiple attempts."
  );
}

// ==================================================
// FINAL SERMON NOTE SCHEMA
// ==================================================

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

// ==================================================
// SECTION ANALYSIS SCHEMA
// ==================================================

const sectionAnalysisSchema = {
  type: "object",

  properties: {
    sectionNumber: {
      type: "integer",
    },

    summary: {
      type: "string",
    },

    themes: {
      type: "array",
      items: {
        type: "string",
      },
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
    "sectionNumber",
    "summary",
    "themes",
    "mainPoints",
    "keyLessons",
    "keyQuotes",
    "bibleReferences",
    "practicalApplications",
    "prayerPoints",
    "reflectionQuestions",
  ],
};

// ==================================================
// GEMINI PROVIDER
// ==================================================

export class GeminiSermonProvider
  implements SermonAIProvider
{
  // ==================================================
  // ANALYZE ONE SECTION
  // ==================================================

  async analyzeSection(
    transcript: string,
    metadata: SermonMetadata,
    sectionNumber: number,
    totalSections: number
  ): Promise<SermonSectionAnalysis> {
    const prompt = `
You are the sermon analysis engine for SermonAI.

You are analyzing ONE SECTION of a larger sermon.

Your job is to carefully understand this section and extract
information that is actually supported by the transcript.

SOURCE OF TRUTH:

The sermon transcript is the primary source of truth.

Do not use outside knowledge to introduce teachings, claims,
Bible references, quotes, stories, or statements that are not
supported by the transcript.

Do not invent information.

If the transcript does not provide enough evidence for a category,
return an empty array for that category.

CLASSIFICATION RULES:

MAIN POINTS:
Identify the major teachings or ideas communicated by the preacher.

KEY LESSONS:
Identify important truths or lessons communicated in this section.

KEY QUOTES:
Only include notable statements that actually appear in the transcript.
Do not create or rewrite quotations.

BIBLE REFERENCES:
Only include Bible references explicitly mentioned or clearly
identifiable from the transcript.

PRACTICAL APPLICATIONS:
Only include actions, instructions, practices, or applications
actually communicated by the preacher.

PRAYER POINTS:
Only include prayer points or prayer requests actually expressed
by the preacher.

REFLECTION QUESTIONS:
These may be generated from the content, but they must remain
faithful to the actual teaching.

THEMES:
Identify the major themes actually present in this section.

SUMMARY:
Give a concise but faithful summary of this section.

SERMON METADATA:

Title:
${metadata.title}

Speaker:
${metadata.speaker}

Published:
${metadata.publishedAt}

YouTube Video ID:
${metadata.videoId}

SECTION:

Section ${sectionNumber} of ${totalSections}

TRANSCRIPT:

${transcript}

Analyze only the supplied transcript section.

Preserve the preacher's intended meaning.

Do not hallucinate.

Return the requested structured JSON.
`;

    const response = await generateWithRetry(() =>
      ai.models.generateContent({
        model: "gemini-3.8-flash",

        contents: prompt,

        config: {
          responseMimeType: "application/json",
          responseSchema: sectionAnalysisSchema,
        },
      })
    );

    if (!response.text) {
      throw new Error(
        `Gemini returned an empty response for section ${sectionNumber}.`
      );
    }

    try {
      return JSON.parse(
        response.text
      ) as SermonSectionAnalysis;
    } catch {
      throw new Error(
        `Gemini returned invalid JSON for section ${sectionNumber}.`
      );
    }
  }

  // ==================================================
  // SYNTHESIZE ENTIRE SERMON
  // ==================================================

  async synthesizeSermon(
    sections: SermonSectionAnalysis[],
    metadata: SermonMetadata
  ): Promise<SermonNote> {
    if (sections.length === 0) {
      throw new Error(
        "No sermon sections are available for synthesis."
      );
    }

    const sectionMaterial = sections.map((section) => `
  SECTION ${section.sectionNumber}

  SUMMARY:
  ${section.summary}

  MAIN POINTS:
  ${section.mainPoints.join("\n")}

  KEY LESSONS:
  ${section.keyLessons.join("\n")}

  BIBLE REFERENCES:
  ${section.bibleReferences.join("\n")}

  PRACTICAL APPLICATIONS:
  ${section.practicalApplications.join("\n")}

  PRAYER POINTS:
  ${section.prayerPoints.join("\n")}
  `
    )
    .join("\n\n");

    const prompt = `
You are the final synthesis engine for SermonAI.

You have received structured analyses from multiple sections
of the SAME sermon.

Combine them into one coherent, detailed, accurate Sermon Note.

SOURCE OF TRUTH:

The section analyses were created directly from the sermon transcript.

Do not introduce information that is not supported by the
provided section analyses.

Do not use outside knowledge to add theology, claims,
Bible references, quotes, stories, or preacher statements.

Do not invent information.

SYNTHESIS RULES:

OVERVIEW:
Provide a concise but meaningful summary of the entire sermon.

MAIN POINTS:
Identify the major teachings across the entire sermon.
Combine related points and remove duplicates.

KEY LESSONS:
Combine important truths communicated throughout the sermon.

KEY QUOTES:
Only use quotations that actually appeared in the section analyses.
Do not create new quotes.

BIBLE REFERENCES:
Combine references from the sections and remove duplicates.
Do not add references that were not present.

PRACTICAL APPLICATIONS:
Include only applications actually communicated by the preacher.

PRAYER POINTS:
Include only prayer points actually expressed in the sermon.
Do not generate generic prayers.

REFLECTION QUESTIONS:
Questions may be synthesized from the sermon teaching,
but must remain faithful to the sermon.

Do not confuse teaching with prayer.

Do not confuse teaching with application.

Do not confuse application with prayer.

Do not confuse ordinary sentences with quotations.

SERMON METADATA:

Title:
${metadata.title}

Speaker:
${metadata.speaker}

Published:
${metadata.publishedAt}

YouTube Video ID:
${metadata.videoId}

SECTION ANALYSES:

${sectionMaterial}

Synthesize the entire sermon into one coherent Sermon Note.

Preserve the preacher's intended meaning.

Do not hallucinate.

Do not introduce outside theology.

Return only the requested structured JSON.
`;

    const response = await generateWithRetry(() =>
      ai.models.generateContent({
        model: "gemini-3.8-flash",

        contents: prompt,

        config: {
          responseMimeType: "application/json",
          responseSchema: sermonNoteSchema,
        },
      })
    );

    if (!response.text) {
      throw new Error(
        "Gemini returned an empty response during final synthesis."
      );
    }

    try {
      return JSON.parse(
        response.text
      ) as SermonNote;
    } catch {
      throw new Error(
        "Gemini returned invalid JSON during final sermon synthesis."
      );
    }
  }
}