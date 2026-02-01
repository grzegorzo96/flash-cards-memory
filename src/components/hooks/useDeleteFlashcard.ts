import { useState, useCallback } from "react";

type UseDeleteFlashcardResult = {
  deleteFlashcard: (flashcardId: string) => Promise<boolean>;
  isDeleting: boolean;
  error: string | null;
};

export function useDeleteFlashcard(): UseDeleteFlashcardResult {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteFlashcard = useCallback(async (flashcardId: string): Promise<boolean> => {
    try {
      setIsDeleting(true);
      setError(null);

      const response = await fetch(`/api/flashcards/${flashcardId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error(`Failed to delete flashcard: ${response.statusText}`);
      }

      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error occurred");
      return false;
    } finally {
      setIsDeleting(false);
    }
  }, []);

  return {
    deleteFlashcard,
    isDeleting,
    error,
  };
}
