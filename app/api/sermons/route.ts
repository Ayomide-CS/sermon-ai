import { getYouTubeVideoId, getYouTubeVideoMetadata } from "@/app/lib/youtube";
import { getYouTubeTranscript } from "@/app/lib/transcript";
import { getWhisperTranscript } from "@/app/lib/whisper";
import { verifyAccessToken, JWT_COOKIE_NAME } from "@/app/lib/jwt";
import { db } from "@/src/prisma/db";

export async function POST(request: Request) {
  const url = new URL(request.url);
  const saveParam = url.searchParams.get("save");

  // Handle save action (authenticated)
  if (saveParam === "1") {
    return handleSaveSermon(await request.json(), request);
  }

  // Step 1: Parse request body for transcription
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return Response.json(
      { error: "Invalid JSON request body." },
      { status: 400 }
    );
  }

  // Step 2: Validate transcription request
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

  // Step 3: Extract YouTube video ID
  const videoId = getYouTubeVideoId(youtubeUrl);

  if (!videoId) {
    return Response.json(
      { error: "Invalid YouTube URL." },
      { status: 400 }
    );
  }

  // Step 4: Fetch YouTube metadata
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

  // Step 5: Get transcript based on mode preference
  let transcriptResult;
  let whisperUsed = false;

  if (preferredMode === "whisper") {
    console.log("[sermon] Using local whisper (preferred mode)");
    const whisperResult = await getWhisperTranscript(videoId);

    if (whisperResult.status === "AVAILABLE") {
      transcriptResult = whisperResult;
      whisperUsed = true;
    } else {
      // Whisper failed or NOT_AVAILABLE — try YouTube transcript as fallback
      console.log("[sermon] Whisper fell back to YouTube transcript");
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

  // Step 6: Return success response
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

  if (action === "list") {
    return handleListSermons(request);
  }

  // Default: return empty list for backward compatibility
  return Response.json({ sermons: [] }, { status: 200 });
}

// ---------------------------------------------------------------------------
// Internal handlers
// ---------------------------------------------------------------------------

async function getAuthUser(request: Request): Promise<{ id: number; email: string } | null> {
  const authHeader = request.headers.get("authorization");

  if (authHeader?.startsWith("Bearer ")) {
    const payload = await verifyAccessToken(authHeader.slice(7));
    if (payload) {
      return { id: Number(payload.sub), email: payload.email };
    }
  }

  // Fall back to refresh cookie
  const cookies = request.headers.get("cookie") || "";
  const refreshTokenMatch = cookies.match(new RegExp(`${JWT_COOKIE_NAME}=([^;]+)`));
  if (refreshTokenMatch) {
    return null; // Can't get user ID from cookie alone without verifying
  }

  return null;
}

async function handleSaveSermon(body: unknown, request: Request) {
  const safeBody = body as { metadata?: any; transcript?: string; note?: any };
  const { metadata, transcript } = safeBody;

  // Get authenticated user
  const authUser = await getAuthUser(request);

  if (!authUser) {
    return Response.json(
      { error: "You must be signed in to save sermons. Please sign in or create an account." },
      { status: 401 }
    );
  }

  if (!metadata || !transcript) {
    return Response.json(
      { error: "Missing sermon data to save." },
      { status: 400 }
    );
  }

  try {
    // Check if this sermon (by youtubeVideoId + userId) already exists
    const existing = await db.orm.public.Sermon.first({
      youtubeVideoId: metadata.videoId,
      userId: authUser.id,
    });

    let sermon;

    if (existing) {
      // Update existing sermon using builder pattern: .where().update()
      sermon = await db.orm.public.Sermon
        .where({ id: existing.id })
        .update({
          title: metadata.title,
          speaker: metadata.speaker || "Unknown",
          transcript,
          transcriptionMethod: (body as any).transcriptionMethod || "DETERMINISTIC",
          duration: metadata.duration || undefined,
          thumbnailUrl: metadata.thumbnail || undefined,
          publishedAt: metadata.publishedAt ? String(new Date(metadata.publishedAt)) : undefined,
        });
    } else {
      // Create new sermon — fields directly, no data wrapper
      sermon = await db.orm.public.Sermon.create({
        userId: authUser.id,
        youtubeUrl: `https://www.youtube.com/watch?v=${metadata.videoId}`,
        youtubeVideoId: metadata.videoId,
        title: metadata.title,
        speaker: metadata.speaker || "Unknown",
        transcript,
        transcriptionMethod: (body as any).transcriptionMethod || "DETERMINISTIC",
        status: "ready",
        duration: metadata.duration || undefined,
        thumbnailUrl: metadata.thumbnail || undefined,
        publishedAt: metadata.publishedAt ? String(new Date(metadata.publishedAt)) : undefined,
      });
    }

    console.log(`[save] Sermon ${existing ? "updated" : "saved"} for user ${authUser.id}:`, metadata.title);

    return Response.json(
      { message: "Sermon saved successfully.", sermonId: sermon!.id },
      { status: 200 }
    );
  } catch (error) {
    console.error("[save] Database error:", error);
    return Response.json(
      { error: "Failed to save sermon to database." },
      { status: 500 }
    );
  }
}

async function handleListSermons(request: Request) {
  const authUser = await getAuthUser(request);

  if (!authUser) {
    return Response.json(
      { error: "You must be signed in." },
      { status: 401 }
    );
  }

  try {
    // Get all sermons for this user, ordered by most recent
    const sermons = await db.orm.public.Sermon
      .where({ userId: authUser.id })
      .orderBy((s) => s.createdAt.desc())
      .all();

    return Response.json(
      { sermons: sermons.map((s) => ({
        id: s.id,
        title: s.title,
        speaker: s.speaker,
        youtubeUrl: s.youtubeUrl,
        transcriptionMethod: s.transcriptionMethod,
        createdAt: s.createdAt,
        updatedAt: s.updatedAt,
      }))},
      { status: 200 }
    );
  } catch (error) {
    console.error("[list] Database error:", error);
    return Response.json(
      { sermons: [] },
      { status: 200 }
    );
  }
}
