import { useEffect } from "react";
import { useGenerationStatus } from "@/components/hooks/useGenerationStatus";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorBanner } from "../dashboard/ErrorBanner";

type GenerateProgressPageProps = {
  requestId: string | null;
};

export default function GenerateProgressPage({
  requestId,
}: GenerateProgressPageProps) {
  const { data, isLoading, error, refetch } = useGenerationStatus(
    requestId,
    true
  );

  useEffect(() => {
    if (!requestId) {
      window.location.href = "/generate/input";
      return;
    }
  }, [requestId]);

  useEffect(() => {
    if (data) {
      if (data.status === "completed") {
        window.location.href = `/generate/preview?requestId=${requestId}`;
      } else if (data.status === "failed") {
        window.location.href = "/generate/error";
      }
    }
  }, [data, requestId]);

  if (!requestId) {
    return null;
  }

  if (error) {
    return (
      <main className="container mx-auto max-w-2xl px-4 py-8">
        <ErrorBanner message={error} onRetry={refetch} />
      </main>
    );
  }

  return (
    <main className="container mx-auto max-w-2xl px-4 py-8">
      <header className="mb-8 fade-in-up">
        <h1 className="text-4xl font-bold tracking-tight">
          Generowanie fiszek
        </h1>
        <p className="mt-2 text-muted-foreground text-reveal" style={{ animationDelay: '0.2s' }}>
          Proszę czekać, trwa generowanie fiszek...
        </p>
      </header>

      <Card className="scale-in" style={{ animationDelay: '0.3s' }}>
        <CardHeader>
          <CardTitle>Status generowania</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col items-center justify-center py-8">
            <div className="mb-4 h-16 w-16 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            <p className="text-lg font-medium">
              {data?.status === "processing"
                ? "Przetwarzanie tekstu..."
                : "Oczekiwanie na rozpoczęcie..."}
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              To może potrwać kilka sekund
            </p>
          </div>

          {isLoading && !data && (
            <div className="space-y-2">
              <Skeleton className="h-4 w-full shimmer" />
              <Skeleton className="h-4 w-3/4 shimmer" />
            </div>
          )}

          <div className="flex justify-center">
            <Button
              variant="outline"
              onClick={() => (window.location.href = "/generate/input")}
              className="hover-lift"
            >
              Anuluj
            </Button>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
