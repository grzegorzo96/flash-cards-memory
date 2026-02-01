import { useState, useCallback } from "react";
import type { UpdateFlashcardCommand, UpdateFlashcardResponseDTO } from "@/types";

type UseUpdateFlashcardResult = {
  updateFlashcard: (
    flashcardId: string,
    data: UpdateFlashcardCommand
  ) => Promise<UpdateFlashcardResponseDTO | null>;
  isUpdating: boolean;
  error: string | null;
};

export function useUpdateFlashcard(): UseUpdateFlashcardResult {
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateFlashcard = useCallback(
    async (
      flashcardId: string,
      data: UpdateFlashcardCommand
    ): Promise<UpdateFlashcardResponseDTO | null> => {
      try {
        setIsUpdating(true);
        setError(null);

        const response = await fetch(`/api/flashcards/${flashcardId}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          throw new Error(`Failed to update flashcard: ${response.statusText}`);
        }

        const result = await response.json();
        return result;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error occurred");
        return null;
      } finally {
        setIsUpdating(false);
      }
    },
    []
  );

  return {
    updateFlashcard,
    isUpdating,
    error,
  };
}
