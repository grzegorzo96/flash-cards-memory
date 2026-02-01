import { useState, useEffect, useCallback } from "react";
import type { DomainListResponseDTO } from "@/types";

export function useDomainsList(isAuthenticated: boolean = true) {
  const [data, setData] = useState<DomainListResponseDTO | null>(null);
  const [isLoading, setIsLoading] = useState(isAuthenticated);
  const [error, setError] = useState<string | null>(null);

  const fetchDomains = useCallback(async () => {
    // Skip fetching if not authenticated
    if (!isAuthenticated) {
      setIsLoading(false);
      setData(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/domains");

      if (!response.ok) {
        throw new Error("Failed to fetch domains");
      }

      const domains = await response.json();
      setData(domains);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchDomains();
  }, [fetchDomains]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchDomains,
  };
}
