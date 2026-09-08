import { getYouTubeVideoId } from "@/app/lib/youtube";
export async function POST(request: Request) {
  

  try {
    const body = await request.json();
    
    const youtubeUrl = typeof body?.youtubeUrl === "string" ? body.youtubeUrl.trim() : "";
    if (!youtubeUrl) {
      return Response.json(
        { error: "YouTube URL is required." },
        { status: 400 }
      );
    }

    const videoId = getYouTubeVideoId(youtubeUrl);

    if(!videoId){
      return Response.json(
        {error: "Invalid YouTube URL."},
        {status: 400}
      )
    }

    return Response.json({
      message: "Sermon URL received",
      youtubeUrl,
      videoId,
    });
  } catch {
    return Response.json(
      { error: "Invalid request body." },
      { status: 400 }
    );
  }
}


