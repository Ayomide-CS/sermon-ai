import {getYouTubeVideoId, getYouTubeVideoMetadata,} from "@/app/lib/youtube";
import { getYouTubeTranscript } from "@/app/lib/transcript";
import { generateSermonNote } from "@/app/lib/ai";

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

    //Step 5b: Fetch YouTube transcript
    const transcriptResult = await getYouTubeTranscript(videoId);

    if (transcriptResult.status === "DISABLED") {
      return Response.json(
        {
          error: "Transcript is disabled for this sermon.",
          code: "TRANSCRIPT_DISABLED",
        },
        { status: 422 }
      );
    }

    if (transcriptResult.status === "NOT_AVAILABLE") {
      return Response.json(
        {
          error: "No transcript is available for this sermon.",
          code: "TRANSCRIPT_NOT_AVAILABLE",
        },
        { status: 422 }
      );
    }

    if (transcriptResult.status === "VIDEO_UNAVAILABLE") {
      return Response.json(
        {
          error: "This YouTube video is unavailable.",
          code: "VIDEO_UNAVAILABLE",
        },
        { status: 404 }
      );
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

    const sermonNote = await generateSermonNote(
      transcriptResult.data.text,
      {
        title: metadata.title,
        description: metadata.description,
        speaker: metadata.speaker,
        publishedAt: metadata.publishedAt,
      }
    );

    return Response.json({
      message: "Sermon analyzed successfully.",
      metadata,
      sermonNote,
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