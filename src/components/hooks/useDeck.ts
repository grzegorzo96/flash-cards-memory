import { useState, useEffect, useCallback } from "react";
import type { DeckDetailsDTO } from "@/types";

type UseDeckResult = {
  data: DeckDetailsDTO | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
};

export function useDeck(deckId: string | null): UseDeckResult {
  const [data, setData] = useState<DeckDetailsDTO | null>(null);
  const [isLoading, setIsLoading] = useState(!!deckId);
  const [error, setError] = useState<string | null>(null);

  const fetchDeck = useCallback(async () => {
    if (!deckId) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/decks/${deckId}`);

      if (!response.ok) {
        throw new Error(`Failed to fetch deck: ${response.statusText}`);
      }

      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error occurred");
    } finally {
      setIsLoading(false);
    }
  }, [deckId]);

  useEffect(() => {
    fetchDeck();
  }, [fetchDeck]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchDeck,
  };
}
