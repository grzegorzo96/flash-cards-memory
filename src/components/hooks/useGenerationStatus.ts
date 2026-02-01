import { useState, useEffect, useCallback } from "react";
import type { GenerationRequestStatusResponseDTO } from "@/types";

type UseGenerationStatusResult = {
  data: GenerationRequestStatusResponseDTO | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
};

export function useGenerationStatus(
  requestId: string | null,
  enablePolling = false
): UseGenerationStatusResult {
  const [data, setData] = useState<GenerationRequestStatusResponseDTO | null>(null);
  const [isLoading, setIsLoading] = useState(!!requestId);
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = useCallback(async () => {
    if (!requestId) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/generation-requests/${requestId}`);

      if (!response.ok) {
        throw new Error(`Failed to fetch generation status: ${response.statusText}`);
      }

      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error occurred");
    } finally {
      setIsLoading(false);
    }
  }, [requestId]);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  useEffect(() => {
    if (!enablePolling || !requestId || !data) return;

    if (data.status === "pending" || data.status === "processing") {
      const timeoutId = setTimeout(() => {
        fetchStatus();
      }, 3000);

      return () => clearTimeout(timeoutId);
    }
  }, [enablePolling, requestId, data, fetchStatus]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchStatus,
  };
}
