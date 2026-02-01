import { useState, useCallback } from "react";

type UseDeleteDeckResult = {
  deleteDeck: (deckId: string) => Promise<boolean>;
  isDeleting: boolean;
  error: string | null;
};

export function useDeleteDeck(): UseDeleteDeckResult {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteDeck = useCallback(async (deckId: string): Promise<boolean> => {
    try {
      setIsDeleting(true);
      setError(null);

      const response = await fetch(`/api/decks/${deckId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error(`Failed to delete deck: ${response.statusText}`);
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
    deleteDeck,
    isDeleting,
    error,
  };
}
