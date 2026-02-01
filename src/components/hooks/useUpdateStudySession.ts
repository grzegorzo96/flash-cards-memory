import { useState, useCallback } from "react";
import type {
  UpdateStudySessionCommand,
  UpdateStudySessionResponseDTO,
} from "@/types";

type UseUpdateStudySessionResult = {
  updateStudySession: (
    sessionId: string,
    data: UpdateStudySessionCommand
  ) => Promise<UpdateStudySessionResponseDTO | null>;
  isUpdating: boolean;
  error: string | null;
};

export function useUpdateStudySession(): UseUpdateStudySessionResult {
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateStudySession = useCallback(
    async (
      sessionId: string,
      data: UpdateStudySessionCommand
    ): Promise<UpdateStudySessionResponseDTO | null> => {
      try {
        setIsUpdating(true);
        setError(null);

        const response = await fetch(`/api/study-sessions/${sessionId}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          throw new Error(`Failed to update study session: ${response.statusText}`);
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
    updateStudySession,
    isUpdating,
    error,
  };
}
