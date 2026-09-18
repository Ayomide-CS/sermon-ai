//validation


export const getYouTubeVideoId = (urlString: string) => {
  try {
    const url = new URL(urlString);

    if (
      url.hostname !== "www.youtube.com" &&
      url.hostname !== "youtube.com" &&
      url.hostname !== "youtu.be"
    ) {
      return null;
    }

    if (url.hostname === "youtu.be") {
      const videoId = url.pathname.slice(1);
      return videoId || null;
    }

    const videoId = url.searchParams.get("v");

    return videoId || null;
  } catch {
    return null;
  }
};

export async function getYouTubeVideoMetadata(videoId: string) {
  
  const apiKey = process.env.YOUTUBE_API_KEY?.trim();

  if(!apiKey){
    throw new Error("YouTube API key is missing.");
  }

  const url = new URL("https://www.googleapis.com/youtube/v3/videos");

  url.searchParams.set("part", "snippet,contentDetails");

  url.searchParams.set("id", videoId);

  url.searchParams.set("key", apiKey);

  const response = await fetch(url);

  if (!response.ok) {
    const errorData = (await response.json().catch(() => null)) as {
      error?: { message?: string };
    } | null;

    throw new Error(
      errorData?.error?.message || "Failed to fetch YouTube video metadata."
    );
  }

  const data = await response.json();

  if (data.items.length === 0) {
    return null;
  }

  const video = data.items[0];

  return {
    videoId: video.id,
    title: video.snippet.title,
    description: video.snippet.description,
    speaker: video.snippet.channelTitle,
    thumbnail: video.snippet.thumbnail?.high?.url,
    publishedAt: video.snippet.publishedAt,
    duration: video.contentDetails.duration,
  };
}