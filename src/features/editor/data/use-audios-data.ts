import { useEffect, useState } from "react";
import { IAudio } from "@designcombo/types";
import { AUDIOS } from "./audio";
import { fetchAudiosFromAPI } from "./fetch-audios";

interface UseAudiosDataReturn {
  audios: Partial<IAudio>[];
  loading: boolean;
  error: string | null;
}

export function useAudiosData(): UseAudiosDataReturn {
  const [audios, setAudios] = useState<Partial<IAudio>[]>(AUDIOS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isApiEnabled = import.meta.env.VITE_AUDIOS_API_ENABLED === "true";

  useEffect(() => {
    if (!isApiEnabled) {
      setAudios(AUDIOS);
      setLoading(false);
      setError(null);
      return;
    }

    const fetchAudios = async () => {
      setLoading(true);
      setError(null);

      try {
        const apiAudios = await fetchAudiosFromAPI();

        if (apiAudios.length > 0) {
          setAudios(apiAudios);
          console.log(`✅ Loaded ${apiAudios.length} audios from API`);
        } else {
          console.warn("API returned no audios, falling back to static data");
          setAudios(AUDIOS);
        }
      } catch (err) {
        console.warn("Failed to fetch audios from API, using static fallback:", err);
        setError(err instanceof Error ? err.message : "Failed to fetch audios");
        setAudios(AUDIOS);
      } finally {
        setLoading(false);
      }
    };

    fetchAudios();
  }, [isApiEnabled]);

  return { audios, loading, error };
}
