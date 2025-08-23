import { useEffect, useState } from "react";
import { IVideo } from "@designcombo/types";
import { VIDEOS } from "./video";
import { fetchVideosFromAPI } from "./fetch-videos";

interface UseVideosDataReturn {
  videos: Partial<IVideo>[];
  loading: boolean;
  error: string | null;
}

export function useVideosData(): UseVideosDataReturn {
  const [videos, setVideos] = useState<Partial<IVideo>[]>(VIDEOS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isApiEnabled = import.meta.env.VITE_VIDEOS_API_ENABLED === "true";

  useEffect(() => {
    if (!isApiEnabled) {
      setVideos(VIDEOS);
      setLoading(false);
      setError(null);
      return;
    }

    const fetchVideos = async () => {
      setLoading(true);
      setError(null);

      try {
        const apiVideos = await fetchVideosFromAPI();

        if (apiVideos.length > 0) {
          setVideos(apiVideos);
          console.log(`✅ Loaded ${apiVideos.length} videos from API`);
        } else {
          console.warn("API returned no videos, falling back to static data");
          setVideos(VIDEOS);
        }
      } catch (err) {
        console.warn("Failed to fetch videos from API, using static fallback:", err);
        setError(err instanceof Error ? err.message : "Failed to fetch videos");
        setVideos(VIDEOS);
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, [isApiEnabled]);

  return { videos, loading, error };
}
