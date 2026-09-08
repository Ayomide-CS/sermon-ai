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