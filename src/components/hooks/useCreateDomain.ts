import { useState, useCallback } from "react";
import type { CreateDomainCommand, CreateDomainResponseDTO } from "@/types";

export function useCreateDomain() {
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createDomain = useCallback(
    async (
      command: CreateDomainCommand
    ): Promise<CreateDomainResponseDTO | null> => {
      setIsCreating(true);
      setError(null);

      try {
        const response = await fetch("/api/domains", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(command),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to create domain");
        }

        const domain = await response.json();
        return domain;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Unknown error";
        setError(errorMessage);
        return null;
      } finally {
        setIsCreating(false);
      }
    },
    []
  );

  return {
    createDomain,
    isCreating,
    error,
  };
}
