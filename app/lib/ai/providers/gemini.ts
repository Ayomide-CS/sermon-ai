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

/*
|--------------------------------------------------------------------------
| Sermon Note Schema
|--------------------------------------------------------------------------
|
| This is the final structure returned after all sermon sections
| have been analyzed and synthesized.
|
*/

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

/*
|--------------------------------------------------------------------------
| Section Analysis Schema
|--------------------------------------------------------------------------
|
| Each chunk of a long sermon is analyzed separately first.
|
*/

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

/*
|--------------------------------------------------------------------------
| Gemini Sermon Provider
|--------------------------------------------------------------------------
*/

export class GeminiSermonProvider
  implements SermonAIProvider
{
  /*
  |--------------------------------------------------------------------------
  | Analyze One Sermon Section
  |--------------------------------------------------------------------------
  */

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
the information that is actually supported by the transcript.

==================================================
SOURCE OF TRUTH
==================================================

The sermon transcript is the primary source of truth.

You may use the supplied sermon metadata for context.

Do NOT use outside knowledge to introduce teachings, claims,
Bible references, quotes, stories, or statements that are not
supported by the transcript.

Do NOT invent information.

If the transcript does not provide enough evidence for a category,
return an empty array for that category.

==================================================
CLASSIFICATION RULES
==================================================

Carefully distinguish between the following:

MAIN POINTS
- Major teachings or ideas communicated by the preacher.
- Do not simply select random sentences.
- Look for the actual progression of the sermon.

KEY LESSONS
- Important truths or lessons communicated in this section.
- They should reflect what the preacher actually teaches.

KEY QUOTES
- Only include notable statements that actually appear in the transcript.
- Do not create or rewrite quotations.
- Do not classify something as a quote simply because it is short.

BIBLE REFERENCES
- Only include Bible references that are explicitly mentioned
  or clearly identifiable from the transcript.
- Do not invent Bible references.

PRACTICAL APPLICATIONS
- Only include actions, instructions, practices, or applications
  that the preacher actually communicates.
- Do not turn every teaching into an application.

PRAYER POINTS
- Only include prayer points or prayer requests actually expressed
  by the preacher.
- Do not create generic prayers.
- Do not classify something as a prayer point merely because
  the word "pray" appears.

REFLECTION QUESTIONS
- These may be generated from the content of the section.
- They must remain faithful to the actual teaching.
- Do not introduce unrelated ideas.

THEMES
- Identify the major themes actually present in this section.

SUMMARY
- Give a concise but faithful summary of this section.

==================================================
SERMON METADATA
==================================================

Title:
${metadata.title}

Speaker:
${metadata.speaker}

Published:
${metadata.publishedAt}

YouTube Video ID:
${metadata.videoId}

==================================================
SECTION INFORMATION
==================================================

Section:
${sectionNumber} of ${totalSections}

==================================================
TRANSCRIPT SECTION
==================================================

${transcript}

==================================================
FINAL INSTRUCTION
==================================================

Analyze ONLY the supplied transcript section.

Preserve the theological context and meaning of the preacher.

Do not add external theology.

Do not hallucinate.

Return the requested structured JSON.
`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",

      contents: prompt,

      config: {
        responseMimeType: "application/json",

        responseSchema: sectionAnalysisSchema,
      },
    });

    if (!response.text) {
      throw new Error(
        `Gemini returned an empty response for section ${sectionNumber}.`
      );
    }

    try {
      const parsed =
        JSON.parse(response.text) as SermonSectionAnalysis;

      return parsed;
    } catch {
      throw new Error(
        `Gemini returned invalid JSON for section ${sectionNumber}.`
      );
    }
  }

  /*
  |--------------------------------------------------------------------------
  | Synthesize Entire Sermon
  |--------------------------------------------------------------------------
  |
  | After every section has been analyzed, Gemini receives the
  | section analyses and creates the final SermonNote.
  |
  */

  async synthesizeSermon(
    sections: SermonSectionAnalysis[],
    metadata: SermonMetadata
  ): Promise<SermonNote> {
    if (sections.length === 0) {
      throw new Error(
        "No sermon sections are available for synthesis."
      );
    }

    const sectionMaterial = sections
      .map((section) => {
        return `
==================================================
SECTION ${section.sectionNumber}
==================================================

SUMMARY:
${section.summary}

THEMES:
${section.themes.join("\n")}

MAIN POINTS:
${section.mainPoints.join("\n")}

KEY LESSONS:
${section.keyLessons.join("\n")}

KEY QUOTES:
${section.keyQuotes.join("\n")}

BIBLE REFERENCES:
${section.bibleReferences.join("\n")}

PRACTICAL APPLICATIONS:
${section.practicalApplications.join("\n")}

PRAYER POINTS:
${section.prayerPoints.join("\n")}

REFLECTION QUESTIONS:
${section.reflectionQuestions.join("\n")}
`;
      })
      .join("\n\n");

    const prompt = `
You are the final synthesis engine for SermonAI.

You have received structured analyses from multiple sections
of the SAME sermon.

Your task is to combine them into one coherent, detailed,
accurate Sermon Note.

==================================================
SOURCE OF TRUTH
==================================================

The section analyses were created directly from the sermon transcript.

Do not introduce information that is not supported by the
provided section analyses.

Do not use outside knowledge to add theology, claims,
Bible references, quotes, stories, or preacher statements.

Do not invent information.

==================================================
SYNTHESIS RULES
==================================================

OVERVIEW
- Provide a concise but meaningful summary of the entire sermon.
- Capture the central message and overall direction.

MAIN POINTS
- Identify the major teachings across the entire sermon.
- Combine related points where appropriate.
- Remove duplicates.
- Preserve the logical progression of the sermon where possible.

KEY LESSONS
- Combine the important truths communicated throughout the sermon.
- Remove repetition.
- Do not turn unrelated statements into lessons.

KEY QUOTES
- Only use quotations that actually appeared in the supplied
  section analyses.
- Do not rewrite them as quotations.
- Do not create new quotes.

BIBLE REFERENCES
- Combine references from the sections.
- Remove duplicates.
- Do not add references that were not present in the analyses.

PRACTICAL APPLICATIONS
- Include only applications actually communicated by the preacher.
- Remove duplicates.
- Do not invent applications.

PRAYER POINTS
- Include only prayer points actually expressed in the sermon.
- Do not generate generic prayers.
- Remove duplicates.

REFLECTION QUESTIONS
- Questions may be synthesized from the sermon teaching.
- Keep them faithful to the sermon.
- Do not introduce unrelated concepts.

==================================================
IMPORTANT CLASSIFICATION RULE
==================================================

Do not confuse:

Teaching
with
Prayer

Teaching
with
Application

Application
with
Prayer

Quote
with
Ordinary Sentence

Reflection Question
with
Something the preacher explicitly said

The categories must represent their actual meaning.

==================================================
SERMON METADATA
==================================================

Title:
${metadata.title}

Speaker:
${metadata.speaker}

Published:
${metadata.publishedAt}

YouTube Video ID:
${metadata.videoId}

==================================================
SECTION ANALYSES
==================================================

${sectionMaterial}

==================================================
FINAL INSTRUCTION
==================================================

Synthesize the entire sermon into one coherent Sermon Note.

Preserve the preacher's intended meaning.

Do not hallucinate.

Do not introduce outside theology.

Return only the requested structured JSON.
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
        "Gemini returned an empty response during final synthesis."
      );
    }

    try {
      const parsed =
        JSON.parse(response.text) as SermonNote;

      return parsed;
    } catch {
      throw new Error(
        "Gemini returned invalid JSON during final sermon synthesis."
      );
    }
  }
}