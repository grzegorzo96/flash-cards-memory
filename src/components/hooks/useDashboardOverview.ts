import { useState, useEffect, useCallback } from "react";
import type { DashboardResponseDTO } from "@/types";

type UseDashboardOverviewResult = {
  data: DashboardResponseDTO | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
};

export function useDashboardOverview(): UseDashboardOverviewResult {
  const [data, setData] = useState<DashboardResponseDTO | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch("/api/dashboard");

      if (!response.ok) {
        throw new Error(`Failed to fetch dashboard: ${response.statusText}`);
      }

      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error occurred");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchDashboard,
  };
}
