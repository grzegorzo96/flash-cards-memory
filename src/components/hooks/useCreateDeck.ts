import { useState, useCallback } from "react";
import type { CreateDeckCommand, CreateDeckResponseDTO } from "@/types";

type UseCreateDeckResult = {
  createDeck: (data: CreateDeckCommand) => Promise<CreateDeckResponseDTO | null>;
  isCreating: boolean;
  error: string | null;
};

export function useCreateDeck(): UseCreateDeckResult {
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createDeck = useCallback(
    async (data: CreateDeckCommand): Promise<CreateDeckResponseDTO | null> => {
      try {
        setIsCreating(true);
        setError(null);

        const response = await fetch("/api/decks", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          throw new Error(`Failed to create deck: ${response.statusText}`);
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
    createDeck,
    isCreating,
    error,
  };
}
