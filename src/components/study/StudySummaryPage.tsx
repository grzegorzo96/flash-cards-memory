import { useStudySessionSummary } from "@/components/hooks/useStudySessionSummary";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ErrorBanner } from "../dashboard/ErrorBanner";

type StudySummaryPageProps = {
  sessionId: string;
};

export default function StudySummaryPage({ sessionId }: StudySummaryPageProps) {
  const { data: summary, isLoading, error, refetch } = useStudySessionSummary(sessionId);

  if (isLoading) {
    return (
      <main className="container mx-auto max-w-2xl px-4 py-8">
        <p>Ładowanie podsumowania...</p>
      </main>
    );
  }

  if (error || !summary) {
    return (
      <main className="container mx-auto max-w-2xl px-4 py-8">
        <ErrorBanner
          message={error || "Nie znaleziono podsumowania sesji"}
          onRetry={refetch}
        />
      </main>
    );
  }

  const totalCards = summary.cards_reviewed;
  const ratings = summary.ratings;

  return (
    <main className="container mx-auto max-w-2xl px-4 py-8">
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-bold tracking-tight">
          Gratulacje! 🎉
        </h1>
        <p className="mt-2 text-muted-foreground">
          Ukończyłeś sesję nauki
        </p>
      </header>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Podsumowanie</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <p className="text-5xl font-bold">{totalCards}</p>
              <p className="mt-2 text-muted-foreground">
                {totalCards === 1
                  ? "karta powtórzona"
                  : totalCards < 5
                    ? "karty powtórzone"
                    : "kart powtórzonych"}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Rozkład ocen</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="destructive">1</Badge>
                  <span className="text-sm">Ponownie</span>
                </div>
                <span className="font-semibold">{ratings[1] || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge className="bg-orange-500">2</Badge>
                  <span className="text-sm">Trudne</span>
                </div>
                <span className="font-semibold">{ratings[2] || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge className="bg-blue-500">3</Badge>
                  <span className="text-sm">Dobre</span>
                </div>
                <span className="font-semibold">{ratings[3] || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge className="bg-green-500">4</Badge>
                  <span className="text-sm">Łatwe</span>
                </div>
                <span className="font-semibold">{ratings[4] || 0}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button className="flex-1" asChild>
            <a href="/dashboard">Wróć do dashboard</a>
          </Button>
          <Button className="flex-1" variant="outline" asChild>
            <a href="/decks">Przeglądaj talie</a>
          </Button>
        </div>
      </div>
    </main>
  );
}
