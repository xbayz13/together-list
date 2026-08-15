"use server";

import { convertISO8601Duration } from "../lib/youtube-utils";

type YouTubeSearchResult = {
  videoId: string;
  title: string;
  channelTitle: string;
  thumbnailUrl: string;
  duration: string | null;
};

type YouTubeVideoResponse = {
  id: string;
  snippet: {
    title: string;
    channelTitle: string;
    thumbnails: {
      medium: { url: string };
    };
  };
  contentDetails: {
    duration: string;
  };
};

export async function searchYouTube(
  query: string
): Promise<YouTubeSearchResult[]> {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) {
    throw new Error("YouTube API Key tidak dikonfigurasi");
  }

  if (!query || query.trim().length === 0) {
    throw new Error("Query pencarian wajib diisi");
  }

  try {
    const searchUrl = new URL("https://www.googleapis.com/youtube/v3/search");
    searchUrl.searchParams.set("part", "snippet");
    searchUrl.searchParams.set("q", query);
    searchUrl.searchParams.set("type", "video");
    searchUrl.searchParams.set("videoCategoryId", "10"); // Music
    searchUrl.searchParams.set("maxResults", "5");
    searchUrl.searchParams.set("key", apiKey);

    const searchRes = await fetch(searchUrl.toString());
    if (!searchRes.ok) {
      throw new Error("Gagal mencari video");
    }

    const searchData = await searchRes.json();
    const videoIds = searchData.items?.map(
      (item: { id: { videoId: string } }) => item.id.videoId
    );

    if (!videoIds || videoIds.length === 0) {
      return [];
    }

    // Fetch details for all videos
    const detailsUrl = new URL(
      "https://www.googleapis.com/youtube/v3/videos"
    );
    detailsUrl.searchParams.set("part", "snippet,contentDetails");
    detailsUrl.searchParams.set("id", videoIds.join(","));
    detailsUrl.searchParams.set("key", apiKey);

    const detailsRes = await fetch(detailsUrl.toString());
    if (!detailsRes.ok) {
      throw new Error("Gagal mengambil detail video");
    }

    const detailsData = await detailsRes.json();

    return detailsData.items.map((video: YouTubeVideoResponse) => ({
      videoId: video.id,
      title: video.snippet.title,
      channelTitle: video.snippet.channelTitle,
      thumbnailUrl: video.snippet.thumbnails.medium.url,
      duration: convertISO8601Duration(video.contentDetails.duration),
    }));
  } catch (error) {
    console.error("YouTube search error:", error);
    throw new Error("Gagal mencari video di YouTube");
  }
}

export async function fetchVideoMetadata(
  videoId: string
): Promise<YouTubeSearchResult | null> {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) {
    throw new Error("YouTube API Key tidak dikonfigurasi");
  }

  if (!videoId || videoId.trim().length === 0) {
    throw new Error("Video ID wajib diisi");
  }

  try {
    const url = new URL("https://www.googleapis.com/youtube/v3/videos");
    url.searchParams.set("part", "snippet,contentDetails");
    url.searchParams.set("id", videoId);
    url.searchParams.set("key", apiKey);

    const res = await fetch(url.toString());
    if (!res.ok) {
      throw new Error("Gagal mengambil metadata video");
    }

    const data = await res.json();

    if (!data.items || data.items.length === 0) {
      return null;
    }

    const video = data.items[0] as YouTubeVideoResponse;

    return {
      videoId: video.id,
      title: video.snippet.title,
      channelTitle: video.snippet.channelTitle,
      thumbnailUrl: video.snippet.thumbnails.medium.url,
      duration: convertISO8601Duration(video.contentDetails.duration),
    };
  } catch (error) {
    console.error("Fetch video metadata error:", error);
    throw new Error("Gagal mengambil metadata video");
  }
}
