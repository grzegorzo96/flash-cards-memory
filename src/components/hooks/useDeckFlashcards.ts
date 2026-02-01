import { useState, useEffect, useCallback } from "react";
import type { FlashcardListResponseDTO, FlashcardListQueryDTO } from "@/types";

type UseDeckFlashcardsResult = {
  data: FlashcardListResponseDTO | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
};

export function useDeckFlashcards(
  deckId: string,
  query: FlashcardListQueryDTO = {}
): UseDeckFlashcardsResult {
  const [data, setData] = useState<FlashcardListResponseDTO | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFlashcards = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (query.limit !== undefined) params.append("limit", String(query.limit));
      if (query.offset !== undefined) params.append("offset", String(query.offset));
      if (query.sort) params.append("sort", query.sort);
      if (query.order) params.append("order", query.order);
      if (query.q) params.append("q", query.q);

      const response = await fetch(`/api/decks/${deckId}/flashcards?${params.toString()}`);

      if (!response.ok) {
        throw new Error(`Failed to fetch flashcards: ${response.statusText}`);
      }

      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error occurred");
    } finally {
      setIsLoading(false);
    }
  }, [deckId, query.limit, query.offset, query.sort, query.order, query.q]);

  useEffect(() => {
    fetchFlashcards();
  }, [fetchFlashcards]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchFlashcards,
  };
}
