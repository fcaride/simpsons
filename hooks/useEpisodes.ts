import { useEffect, useState, useCallback, useRef } from "react";
import { premiumizeService } from "../services/premiumize";
import { SeasonData } from "../types";

interface UseEpisodesResult {
  episodes: SeasonData[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useEpisodes(): UseEpisodesResult {
  const [episodes, setEpisodes] = useState<SeasonData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const hasFetched = useRef(false);

  const fetchEpisodes = useCallback(async (force = false) => {
    if (hasFetched.current && !force) return;
    hasFetched.current = true;

    try {
      setLoading(true);
      setError(null);
      const data = await premiumizeService.getAllEpisodes();
      setEpisodes(data);
    } catch (err) {
      console.error("Failed to fetch episodes:", err);
      setError(err instanceof Error ? err.message : "Failed to load episodes");
      hasFetched.current = false;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEpisodes();
  }, [fetchEpisodes]);

  const refetch = useCallback(() => fetchEpisodes(true), [fetchEpisodes]);

  return {
    episodes,
    loading,
    error,
    refetch,
  };
}
