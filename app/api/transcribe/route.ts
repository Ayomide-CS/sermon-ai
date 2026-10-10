import { NextRequest } from "next/server";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type TranscribeProvider = "gemini" | "openai";

interface TranscribeRequestBody {
  audioBase64?: string; // base64-encoded audio (wav/mp3)
  transcriptText?: string; // if user already has a raw transcript, just structure it
  provider: TranscribeProvider;
  apiKey: string;
  model?: string;
}

// ---------------------------------------------------------------------------
// POST /api/transcribe — External LLM transcription
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest) {
  let body: TranscribeRequestBody;

  try {
    body = await request.json();
  } catch {
    return Response.json(
      { error: "Invalid JSON request body." },
      { status: 400 }
    );
  }

  const { audioBase64, transcriptText, provider, apiKey, model } = body;

  // Validate required fields
  if (!provider || !apiKey) {
    return Response.json(
      { error: "Provider and API key are required." },
      { status: 400 }
    );
  }

  if (provider !== "gemini" && provider !== "openai") {
    return Response.json(
      { error: "Invalid provider. Use 'gemini' or 'openai'." },
      { status: 400 }
    );
  }

  // If user already has raw transcript text, just structure it via LLM
  if (transcriptText && typeof transcriptText === "string" && transcriptText.trim().length > 50) {
    try {
      const structured = await structureTranscriptWithLLM(
        provider,
        apiKey,
        model,
        transcriptText
      );
      return Response.json({
        status: "AVAILABLE",
        data: structured,
        transcriptionMethod: `EXTERNAL_${provider.toUpperCase()}`,
      });
    } catch (err) {
      console.error(`[transcribe] LLM structuring failed for ${provider}:`, err);
      return Response.json(
        { error: `Failed to structure transcript with ${provider}.` },
        { status: 502 }
      );
    }
  }

  // If user provided audio base64, transcribe first then structure
  if (audioBase64 && typeof audioBase64 === "string") {
    try {
      const fullText = await transcribeAudioWithLLM(
        provider,
        apiKey,
        model,
        audioBase64
      );

      if (!fullText || fullText.length < 10) {
        return Response.json(
          { error: "Transcription returned no meaningful text." },
          { status: 422 }
        );
      }

      // Now structure the transcript
      const structured = await structureTranscriptWithLLM(
        provider,
        apiKey,
        model,
        fullText
      );

      return Response.json({
        status: "AVAILABLE",
        data: structured,
        transcriptionMethod: `EXTERNAL_${provider.toUpperCase()}`,
      });
    } catch (err) {
      console.error(`[transcribe] LLM transcription failed for ${provider}:`, err);
      return Response.json(
        { error: `Failed to transcribe audio with ${provider}. Check your API key.` },
        { status: 502 }
      );
    }
  }

  return Response.json(
    { error: "Provide either 'transcriptText' (raw transcript) or 'audioBase64' (encoded audio)." },
    { status: 400 }
  );
}

// ---------------------------------------------------------------------------
// Transcribe audio using provider's speech-to-text API
// ---------------------------------------------------------------------------

async function transcribeAudioWithLLM(
  provider: TranscribeProvider,
  apiKey: string,
  model: string | undefined,
  audioBase64: string
): Promise<string> {
  if (provider === "openai") {
    return transcribeWithOpenAI(apiKey, model || "whisper-1", audioBase64);
  }

  if (provider === "gemini") {
    // Gemini doesn't have a direct speech-to-text API in the free tier.
    // We'll use the Google Cloud Speech-to-Text API via a proxy or fall back.
    throw new Error(
      "Gemini does not support direct audio transcription. Please paste your raw transcript text instead, and we will structure it with Gemini."
    );
  }

  throw new Error("Unknown provider");
}

async function transcribeWithOpenAI(
  apiKey: string,
  model: string,
  audioBase64: string
): Promise<string> {
  // Decode base64 to blob-like format for fetch
  const response = await fetch("https://api.openai.com/v1/audio/transcriptions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      // OpenAI expects the audio file to be sent as multipart, but we can use base64 in a workaround
      response_format: "text",
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`OpenAI transcription failed (${response.status}): ${err}`);
  }

  const text = await response.text();
  return text.trim();
}

// ---------------------------------------------------------------------------
// Structure raw transcript using provider's chat API
// ---------------------------------------------------------------------------

async function structureTranscriptWithLLM(
  provider: TranscribeProvider,
  apiKey: string,
  model: string | undefined,
  transcriptText: string
): Promise<{ text: string }> {
  if (provider === "openai") {
    return structureWithOpenAI(apiKey, model || "gpt-4o-mini", transcriptText);
  }

  if (provider === "gemini") {
    return structureWithGemini(apiKey, model || "gemini-2.0-flash", transcriptText);
  }

  throw new Error("Unknown provider");
}

async function structureWithOpenAI(
  apiKey: string,
  model: string,
  transcriptText: string
): Promise<{ text: string }> {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages: [
        {
          role: "system",
          content: `You are a sermon note organizer. Given a raw transcript of a Christian sermon, return ONLY the full cleaned-up transcript text with proper paragraph breaks and punctuation. Do NOT add any commentary, summaries, or extra text. Just clean up the raw transcript for readability. Preserve all the original content but format it nicely with paragraphs.`,
        },
        {
          role: "user",
          content: transcriptText.slice(0, 125_000), // GPT-4o-mini context limit ~128k tokens
        },
      ],
      max_tokens: 16000,
      temperature: 0.3,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`OpenAI structuring failed (${response.status}): ${err}`);
  }

  const json = await response.json();
  const text = json.choices?.[0]?.message?.content || "";
  return { text };
}

async function structureWithGemini(
  apiKey: string,
  model: string,
  transcriptText: string
): Promise<{ text: string }> {
  // Gemini API endpoint for text generation
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            {
              text: `You are a sermon note organizer. Given a raw transcript of a Christian sermon, return ONLY the full cleaned-up transcript text with proper paragraph breaks and punctuation. Do NOT add any commentary, summaries, or extra text. Just clean up the raw transcript for readability. Preserve all the original content but format it nicely with paragraphs.\n\nHere is the raw transcript:\n\n${transcriptText.slice(0, 250_000)}`, // Gemini context ~32k tokens
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 32000,
      },
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Gemini structuring failed (${response.status}): ${err}`);
  }

  const json = await response.json();
  const text =
    json.candidates?.[0]?.content?.parts?.[0]?.text || "";
  return { text };
}
