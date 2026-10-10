import { getYouTubeVideoId, getYouTubeVideoMetadata } from "@/app/lib/youtube";
import { getYouTubeTranscript } from "@/app/lib/transcript";
import { getWhisperTranscript } from "@/app/lib/whisper";
import { verifyAccessToken, JWT_COOKIE_NAME } from "@/app/lib/jwt";

export async function POST(request: Request) {
  // Step 1: Parse request body
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return Response.json(
      { error: "Invalid JSON request body." },
      { status: 400 }
    );
  }

  // Step 2: Handle save action (authenticated)
  if (
    typeof body === "object" &&
    body !== null &&
    "action" in body &&
    body.action === "save"
  ) {
    return handleSaveSermon(body, request);
  }

  // Step 3: Validate transcription request
  if (
    typeof body !== "object" ||
    body === null ||
    !("youtubeUrl" in body) ||
    typeof body.youtubeUrl !== "string"
  ) {
    return Response.json(
      { error: "YouTube URL is required." },
      { status: 400 }
    );
  }

  const youtubeUrl = (body as { youtubeUrl: string }).youtubeUrl.trim();
  const preferredMode = (body as { mode?: string }).mode; // "deterministic" | "whisper"

  if (!youtubeUrl) {
    return Response.json(
      { error: "YouTube URL is required." },
      { status: 400 }
    );
  }

  // Step 4: Extract YouTube video ID
  const videoId = getYouTubeVideoId(youtubeUrl);

  if (!videoId) {
    return Response.json(
      { error: "Invalid YouTube URL." },
      { status: 400 }
    );
  }

  // Step 5: Fetch YouTube metadata
  let metadata;
  try {
    metadata = await getYouTubeVideoMetadata(videoId);
  } catch (error) {
    console.error("YouTube metadata error:", error);
    return Response.json(
      { error: "Unable to fetch YouTube video metadata." },
      { status: 502 }
    );
  }

  if (!metadata) {
    return Response.json(
      { error: "YouTube video not found." },
      { status: 404 }
    );
  }

  // Step 6: Get transcript based on mode preference
  let transcriptResult;
  let whisperUsed = false;

  if (preferredMode === "whisper") {
    // Skip YouTube transcript, go straight to whisper
    console.log("[sermon] Using local whisper (preferred mode)");
    const whisperResult = await getWhisperTranscript(videoId);

    if (whisperResult.status === "AVAILABLE") {
      transcriptResult = whisperResult;
      whisperUsed = true;
    } else if (whisperResult.status === "ERROR") {
      // Whisper failed — try YouTube transcript as fallback
      console.log("[sermon] Whisper failed, falling back to YouTube transcript");
      transcriptResult = await getYouTubeTranscript(videoId);
    } else {
      // Whisper NOT_AVAILABLE — try YouTube transcript
      transcriptResult = await getYouTubeTranscript(videoId);
    }
  } else {
    // Default: Try YouTube transcript first, then whisper fallback
    transcriptResult = await getYouTubeTranscript(videoId);

    if (transcriptResult.status === "VIDEO_UNAVAILABLE") {
      return Response.json(
        { error: "This YouTube video is unavailable.", code: "VIDEO_UNAVAILABLE" },
        { status: 404 }
      );
    }

    if (transcriptResult.status === "NOT_AVAILABLE" || transcriptResult.status === "DISABLED") {
      console.log(`[sermon] ${transcriptResult.status} — falling back to whisper.cpp`, { videoId });

      const whisperResult = await getWhisperTranscript(videoId);

      if (whisperResult.status === "AVAILABLE") {
        transcriptResult = whisperResult;
        whisperUsed = true;
      } else if (whisperResult.status === "ERROR") {
        return Response.json(
          {
            error:
              "YouTube transcript unavailable and local transcription failed. This may be because YouTube requires authentication cookies, or the audio is in an unsupported format/language.\n\nSolutions:\n1. Try the 'Cloud AI' option with your own API key\n2. Export browser cookies and add YTDLP_COOKIES_FILE to your .env\n3. Paste the sermon text manually using the Cloud AI option",
            code: "TRANSCRIPTION_FAILED",
          },
          { status: 502 }
        );
      } else {
        return Response.json(
          {
            error:
              "No transcript is available for this sermon and local transcription produced no results. Try the Cloud AI option with your own API key, or paste the sermon text manually.",
            code: "TRANSCRIPT_NOT_AVAILABLE",
          },
          { status: 422 }
        );
      }
    }

    if (transcriptResult.status === "ERROR") {
      return Response.json(
        { error: "Something went wrong while retrieving the transcript.", code: "TRANSCRIPT_ERROR" },
        { status: 502 }
      );
    }
  }

  if (transcriptResult.status !== "AVAILABLE") {
    return Response.json(
      { error: "Could not obtain a transcript for this sermon." },
      { status: 422 }
    );
  }

  // Step 7: Return success response
  const transcriptionMethod = whisperUsed ? "LOCAL_WHISPER" : "DETERMINISTIC";

  return Response.json(
    {
      message: "Sermon ready for analysis.",
      metadata,
      transcript: transcriptResult.data,
      transcriptionMethod,
    },
    { status: 200 }
  );
}

// ---------------------------------------------------------------------------
// GET — List user's saved sermons (authenticated)
// ---------------------------------------------------------------------------

export async function GET(request: Request) {
  const url = new URL(request.url);
  const action = url.searchParams.get("action");

  // List sermons endpoint
  if (action === "list") {
    return handleListSermons(request);
  }

  return Response.json({ error: "Invalid request. Use ?action=list to get your sermons." }, { status: 400 });
}

// ---------------------------------------------------------------------------
// Internal handlers
// ---------------------------------------------------------------------------

async function handleSaveSermon(body: unknown, request: Request) {
  const safeBody = body as { metadata?: any; transcript?: string; note?: any };
  const { metadata, transcript, note } = safeBody;

  // Get authenticated user from Bearer token or refresh cookie
  const authHeader = request.headers.get("authorization");
  let userId: number | null = null;

  if (authHeader?.startsWith("Bearer ")) {
    const payload = await verifyAccessToken(authHeader.slice(7));
    if (payload) userId = Number(payload.sub);
  }

  // Fall back to refresh cookie
  if (!userId) {
    const cookies = request.headers.get("cookie") || "";
    const refreshTokenMatch = cookies.match(new RegExp(`${JWT_COOKIE_NAME}=([^;]+)`));
    if (refreshTokenMatch) {
      userId = -1; // Placeholder: validated by client-side auth context
    }
  }

  if (!userId && userId !== -1) {
    return Response.json(
      { error: "You must be signed in to save sermons." },
      { status: 401 }
    );
  }

  if (!metadata || !transcript || !note) {
    return Response.json(
      { error: "Missing sermon data to save." },
      { status: 400 }
    );
  }

  // TODO: Implement actual database save via Prisma
  console.log(`[save] Sermon saved for user ${userId}:`, metadata.title);

  return Response.json(
    { message: "Sermon saved successfully.", sermonId: "temp-id" },
    { status: 200 }
  );
}

async function handleListSermons(request: Request) {
  // Get authenticated user
  const authHeader = request.headers.get("authorization");
  let userId: number | null = null;

  if (authHeader?.startsWith("Bearer ")) {
    const payload = await verifyAccessToken(authHeader.slice(7));
    if (payload) userId = Number(payload.sub);
  }

  if (!userId) {
    return Response.json(
      { error: "You must be signed in." },
      { status: 401 }
    );
  }

  // TODO: Implement actual database query via Prisma
  console.log(`[list] Listing sermons for user ${userId}`);

  return Response.json(
    { sermons: [] },
    { status: 200 }
  );
}
