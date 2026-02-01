import { useState, useCallback } from "react";
import type {
  AcceptGeneratedCardsCommand,
  AcceptGeneratedCardsResponseDTO,
} from "@/types";

type UseAcceptGeneratedCardsResult = {
  acceptCards: (
    requestId: string,
    data: AcceptGeneratedCardsCommand
  ) => Promise<AcceptGeneratedCardsResponseDTO | null>;
  isAccepting: boolean;
  error: string | null;
};

export function useAcceptGeneratedCards(): UseAcceptGeneratedCardsResult {
  const [isAccepting, setIsAccepting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const acceptCards = useCallback(
    async (
      requestId: string,
      data: AcceptGeneratedCardsCommand
    ): Promise<AcceptGeneratedCardsResponseDTO | null> => {
      try {
        setIsAccepting(true);
        setError(null);

        const response = await fetch(`/api/generation-requests/${requestId}/accept`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          throw new Error(`Failed to accept generated cards: ${response.statusText}`);
        }

        const result = await response.json();
        return result;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error occurred");
        return null;
      } finally {
        setIsAccepting(false);
      }
    },
    []
  );

  return {
    acceptCards,
    isAccepting,
    error,
  };
}
