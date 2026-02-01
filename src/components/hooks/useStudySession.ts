import { useState, useEffect, useCallback } from "react";
import type { StartStudySessionResponseDTO } from "@/types";

type UseStudySessionResult = {
  data: StartStudySessionResponseDTO | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
};

export function useStudySession(sessionId: string | null): UseStudySessionResult {
  const [data, setData] = useState<StartStudySessionResponseDTO | null>(null);
  const [isLoading, setIsLoading] = useState(!!sessionId);
  const [error, setError] = useState<string | null>(null);

  const fetchSession = useCallback(async () => {
    if (!sessionId) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/study-sessions/${sessionId}`);

      if (!response.ok) {
        throw new Error(`Failed to fetch study session: ${response.statusText}`);
      }

      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error occurred");
    } finally {
      setIsLoading(false);
    }
  }, [sessionId]);

  useEffect(() => {
    fetchSession();
  }, [fetchSession]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchSession,
  };
}
