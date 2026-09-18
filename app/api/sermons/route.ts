import {
  getYouTubeVideoId,
  getYouTubeVideoMetadata,
} from "@/app/lib/youtube";

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

    // Step 6: Return successful result
    return Response.json({
      message: "Sermon video found.",
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