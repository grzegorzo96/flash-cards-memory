import { useState, useEffect, useCallback } from "react";
import type { GetFlashcardResponseDTO } from "@/types";

type UseFlashcardResult = {
  data: GetFlashcardResponseDTO | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
};

export function useFlashcard(flashcardId: string | null): UseFlashcardResult {
  const [data, setData] = useState<GetFlashcardResponseDTO | null>(null);
  const [isLoading, setIsLoading] = useState(!!flashcardId);
  const [error, setError] = useState<string | null>(null);

  const fetchFlashcard = useCallback(async () => {
    if (!flashcardId) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/flashcards/${flashcardId}`);

      if (!response.ok) {
        throw new Error(`Failed to fetch flashcard: ${response.statusText}`);
      }

      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error occurred");
    } finally {
      setIsLoading(false);
    }
  }, [flashcardId]);

  useEffect(() => {
    fetchFlashcard();
  }, [fetchFlashcard]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchFlashcard,
  };
}
