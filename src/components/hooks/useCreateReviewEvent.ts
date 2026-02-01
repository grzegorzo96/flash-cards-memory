import { useState, useCallback } from "react";
import type {
  CreateReviewEventCommand,
  CreateReviewEventResponseDTO,
} from "@/types";

type UseCreateReviewEventResult = {
  createReviewEvent: (
    sessionId: string,
    data: CreateReviewEventCommand
  ) => Promise<CreateReviewEventResponseDTO | null>;
  isCreating: boolean;
  error: string | null;
};

export function useCreateReviewEvent(): UseCreateReviewEventResult {
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createReviewEvent = useCallback(
    async (
      sessionId: string,
      data: CreateReviewEventCommand
    ): Promise<CreateReviewEventResponseDTO | null> => {
      try {
        setIsCreating(true);
        setError(null);

        const response = await fetch(
          `/api/study-sessions/${sessionId}/review-events`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
          }
        );

        if (!response.ok) {
          throw new Error(`Failed to create review event: ${response.statusText}`);
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
    createReviewEvent,
    isCreating,
    error,
  };
}
