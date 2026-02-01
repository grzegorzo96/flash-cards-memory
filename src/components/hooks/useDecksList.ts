import { useState, useEffect, useCallback } from "react";
import type { DeckListResponseDTO, DeckListQueryDTO } from "@/types";

type UseDecksListResult = {
  data: DeckListResponseDTO | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
};

export function useDecksList(query: DeckListQueryDTO = {}): UseDecksListResult {
  const [data, setData] = useState<DeckListResponseDTO | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDecks = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (query.limit !== undefined) params.append("limit", String(query.limit));
      if (query.offset !== undefined) params.append("offset", String(query.offset));
      if (query.sort) params.append("sort", query.sort);
      if (query.order) params.append("order", query.order);
      if (query.include_counts !== undefined) params.append("include_counts", String(query.include_counts));

      const response = await fetch(`/api/decks?${params.toString()}`);

      if (!response.ok) {
        throw new Error(`Failed to fetch decks: ${response.statusText}`);
      }

      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error occurred");
    } finally {
      setIsLoading(false);
    }
  }, [query.limit, query.offset, query.sort, query.order, query.include_counts]);

  useEffect(() => {
    fetchDecks();
  }, [fetchDecks]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchDecks,
  };
}
