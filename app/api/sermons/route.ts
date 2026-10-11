import {getYouTubeVideoId, getYouTubeVideoMetadata,} from "@/app/lib/youtube";
import { getYouTubeTranscript } from "@/app/lib/transcript";
import { getWhisperTranscript } from "@/app/lib/whisper";

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

  // Step 2: Validate the request body
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

  const youtubeUrl = body.youtubeUrl.trim();

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
  try {
    const metadata = await getYouTubeVideoMetadata(videoId);

    // Step 5: Check whether the video exists
    if (!metadata) {
      return Response.json(
        { error: "YouTube video not found." },
        { status: 404 }
      );
    }

    // Step 5b: Fetch YouTube transcript (deterministic — no vendor)
    let transcriptResult = await getYouTubeTranscript(videoId);
    let whisperUsed = false;

    if (transcriptResult.status === "VIDEO_UNAVAILABLE") {
      return Response.json(
        {
          error: "This YouTube video is unavailable.",
          code: "VIDEO_UNAVAILABLE",
        },
        { status: 404 }
      );
    }

    // If YouTube transcript failed, fall back to local whisper.cpp
    if (
      transcriptResult.status === "NOT_AVAILABLE" ||
      transcriptResult.status === "DISABLED"
    ) {
      console.log(
        `[sermon] ${transcriptResult.status} — falling back to whisper.cpp`,
        { videoId }
      );

      const whisperResult = await getWhisperTranscript(videoId);

      if (whisperResult.status === "AVAILABLE") {
        transcriptResult = whisperResult;
        whisperUsed = true;
      } else if (whisperResult.status === "ERROR") {
        return Response.json(
          {
            error:
              "YouTube transcript unavailable and local transcription failed. The audio may be in a language or format that whisper.cpp cannot process.",
            code: "TRANSCRIPTION_FAILED",
          },
          { status: 502 }
        );
      } else {
        // whisper also returned NOT_AVAILABLE
        return Response.json(
          {
            error:
              "No transcript is available for this sermon and local transcription produced no results.",
            code: "TRANSCRIPT_NOT_AVAILABLE",
          },
          { status: 422 }
        );
      }
    }

    if (transcriptResult.status === "ERROR") {
      return Response.json(
        {
          error: "Something went wrong while retrieving the transcript.",
          code: "TRANSCRIPT_ERROR",
        },
        { status: 502 }
      );
    }

    if (transcriptResult.status === "AVAILABLE") {
      // Determine which method was used
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

    return Response.json({
      message: "Sermon analyzed successfully.",
      metadata,

    });
  } catch (error) {
    console.error("YouTube metadata error:", error);

    return Response.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to fetch YouTube video metadata.",
      },
      { status: 502 }
    );
  }
}