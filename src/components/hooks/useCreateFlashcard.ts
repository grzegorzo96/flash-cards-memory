import { useState, useCallback } from "react";
import type { CreateFlashcardCommand, CreateFlashcardResponseDTO } from "@/types";

type UseCreateFlashcardResult = {
  createFlashcard: (
    deckId: string,
    data: CreateFlashcardCommand
  ) => Promise<CreateFlashcardResponseDTO | null>;
  isCreating: boolean;
  error: string | null;
};

export function useCreateFlashcard(): UseCreateFlashcardResult {
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createFlashcard = useCallback(
    async (
      deckId: string,
      data: CreateFlashcardCommand
    ): Promise<CreateFlashcardResponseDTO | null> => {
      try {
        setIsCreating(true);
        setError(null);

        const response = await fetch(`/api/decks/${deckId}/flashcards`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          throw new Error(`Failed to create flashcard: ${response.statusText}`);
        }

        const result = await response.json();
        return result;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error occurred");
        return null;
      } finally {
        setIsCreating(false);
      }
    },
    []
  );

  return {
    createFlashcard,
    isCreating,
    error,
  };
}
