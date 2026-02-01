import { useState, useCallback } from "react";
import type {
  GenerationRequestCreateCommand,
  GenerationRequestCreateResponseDTO,
} from "@/types";

type UseCreateGenerationRequestResult = {
  createGenerationRequest: (
    data: GenerationRequestCreateCommand
  ) => Promise<GenerationRequestCreateResponseDTO | null>;
  isCreating: boolean;
  error: string | null;
};

export function useCreateGenerationRequest(): UseCreateGenerationRequestResult {
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createGenerationRequest = useCallback(
    async (
      data: GenerationRequestCreateCommand
    ): Promise<GenerationRequestCreateResponseDTO | null> => {
      try {
        setIsCreating(true);
        setError(null);

        const response = await fetch("/api/generation-requests", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          if (response.status === 429) {
            throw new Error("RATE_LIMIT");
          }
          throw new Error(`Failed to create generation request: ${response.statusText}`);
        }

        const result = await response.json();
        return result;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Unknown error occurred";
        setError(errorMessage);
        return null;
      } finally {
        setIsCreating(false);
      }
    },
    []
  );

  return {
    createGenerationRequest,
    isCreating,
    error,
  };
}
