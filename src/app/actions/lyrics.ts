"use server";

export type LyricLine = {
  time: number;
  text: string;
};

export type LyricsData = {
  syncedLyrics: LyricLine[] | null;
  plainLyrics: string | null;
};

// Parse LRC format: [MM:SS.ms]text
const parseLRC = (lrc: string): LyricLine[] => {
  const lines = lrc.split("\n");
  const result: LyricLine[] = [];

  for (const line of lines) {
    const match = line.match(/\[(\d{2}):(\d{2})\.(\d{2,3})\](.*)/);
    if (match) {
      const minutes = parseInt(match[1], 10);
      const seconds = parseInt(match[2], 10);
      const ms = parseInt(match[3].padEnd(3, "0"), 10);
      const time = minutes * 60 + seconds + ms / 1000;
      const text = match[4].trim();
      // Include empty lines (they're pause/break markers in LRC format)
      result.push({ time, text });
    }
  }

  return result.sort((a, b) => a.time - b.time);
};

export async function fetchLyrics(
  trackName: string,
  artistName: string
): Promise<LyricsData> {
  try {
    const params = new URLSearchParams({
      track_name: trackName,
      artist_name: artistName,
    });

    const response = await fetch(
      `https://lrclib.net/api/get?${params.toString()}`,
      {
        headers: {
          "User-Agent": "TogetherList/1.0 (https://github.com/together-list)",
        },
      }
    );

    if (!response.ok) {
      return { syncedLyrics: null, plainLyrics: null };
    }

    const data = await response.json();

    const syncedLyrics = data.syncedLyrics
      ? parseLRC(data.syncedLyrics)
      : null;
    const plainLyrics = data.plainLyrics || null;

    return { syncedLyrics, plainLyrics };
  } catch {
    // Silent fallback on error
    return { syncedLyrics: null, plainLyrics: null };
  }
}
