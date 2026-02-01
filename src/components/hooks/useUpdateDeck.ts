import { useState, useCallback } from "react";
import type { UpdateDeckCommand, UpdateDeckResponseDTO } from "@/types";

type UseUpdateDeckResult = {
  updateDeck: (
    deckId: string,
    data: UpdateDeckCommand
  ) => Promise<UpdateDeckResponseDTO | null>;
  isUpdating: boolean;
  error: string | null;
};

export function useUpdateDeck(): UseUpdateDeckResult {
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateDeck = useCallback(
    async (
      deckId: string,
      data: UpdateDeckCommand
    ): Promise<UpdateDeckResponseDTO | null> => {
      try {
        setIsUpdating(true);
        setError(null);

        const response = await fetch(`/api/decks/${deckId}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          throw new Error(`Failed to update deck: ${response.statusText}`);
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
    updateDeck,
    isUpdating,
    error,
  };
}
