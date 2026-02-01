import { useState, useEffect, useCallback } from "react";
import type { StudySessionSummaryResponseDTO } from "@/types";

type UseStudySessionSummaryResult = {
  data: StudySessionSummaryResponseDTO | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
};

export function useStudySessionSummary(
  sessionId: string | null
): UseStudySessionSummaryResult {
  const [data, setData] = useState<StudySessionSummaryResponseDTO | null>(null);
  const [isLoading, setIsLoading] = useState(!!sessionId);
  const [error, setError] = useState<string | null>(null);

  const fetchSummary = useCallback(async () => {
    if (!sessionId) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/study-sessions/${sessionId}/summary`);

      if (!response.ok) {
        throw new Error(`Failed to fetch study session summary: ${response.statusText}`);
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
    fetchSummary();
  }, [fetchSummary]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchSummary,
  };
}
